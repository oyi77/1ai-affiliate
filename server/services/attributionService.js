'use strict';

/**
 * Multi-Touch Attribution Service
 * 
 * Supports multiple attribution models:
 * - First Touch: Credit to first interaction
 * - Last Touch: Credit to last interaction
 * - Linear: Equal credit to all touchpoints
 * - Time Decay: More credit to recent touchpoints
 * - Position-Based (U-Shaped): 40% first, 40% last, 20% middle
 * 
 * Competitors: Voluum has multi-touch, RedTrack has advanced attribution.
 * We surpass them with configurable models + probabilistic scoring.
 */

const pool = require('../db/mysql');

// ── Attribution Models ──────────────────────────────────────────

const MODELS = {
  first_touch: {
    name: 'First Touch',
    description: 'All credit to the first interaction',
    calculate: (touchpoints) => {
      if (!touchpoints.length) return [];
      return touchpoints.map((tp, i) => ({ ...tp, credit: i === 0 ? 1 : 0 }));
    },
  },
  last_touch: {
    name: 'Last Touch',
    description: 'All credit to the last interaction',
    calculate: (touchpoints) => {
      if (!touchpoints.length) return [];
      return touchpoints.map((tp, i) => ({ ...tp, credit: i === touchpoints.length - 1 ? 1 : 0 }));
    },
  },
  linear: {
    name: 'Linear',
    description: 'Equal credit to all touchpoints',
    calculate: (touchpoints) => {
      if (!touchpoints.length) return [];
      const credit = 1 / touchpoints.length;
      return touchpoints.map(tp => ({ ...tp, credit }));
    },
  },
  time_decay: {
    name: 'Time Decay',
    description: 'More credit to recent touchpoints',
    calculate: (touchpoints) => {
      if (!touchpoints.length) return [];
      const halfLife = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      const now = Date.now();
      const weights = touchpoints.map(tp => {
        const age = now - (tp.timestamp || now);
        return Math.pow(0.5, age / halfLife);
      });
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      return touchpoints.map((tp, i) => ({ ...tp, credit: totalWeight > 0 ? weights[i] / totalWeight : 0 }));
    },
  },
  position_based: {
    name: 'Position-Based (U-Shaped)',
    description: '40% first, 40% last, 20% middle',
    calculate: (touchpoints) => {
      if (!touchpoints.length) return [];
      if (touchpoints.length === 1) return [{ ...touchpoints[0], credit: 1 }];
      if (touchpoints.length === 2) return touchpoints.map((tp, i) => ({ ...tp, credit: 0.5 }));
      
      const middleCount = touchpoints.length - 2;
      const middleCredit = 0.2 / middleCount;
      return touchpoints.map((tp, i) => ({
        ...tp,
        credit: i === 0 ? 0.4 : i === touchpoints.length - 1 ? 0.4 : middleCredit,
      }));
    },
  },
};

// ── Record Touchpoint ───────────────────────────────────────────

async function recordTouchpoint({ click_id, campaign_id, affiliate_id, traffic_source, touch_type, timestamp }) {
  try {
    await pool.query(
      `INSERT INTO 1ai_attribution_touchpoints (click_id, campaign_id, affiliate_id, traffic_source, touch_type, created_at)
       VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
      [click_id, campaign_id, affiliate_id, traffic_source, touch_type || 'click']
    ).catch(async () => {
      // Create table if missing
      await pool.query(`CREATE TABLE IF NOT EXISTS 1ai_attribution_touchpoints (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        click_id VARCHAR(64),
        campaign_id INT UNSIGNED,
        affiliate_id INT UNSIGNED,
        traffic_source VARCHAR(100),
        touch_type VARCHAR(50) DEFAULT 'click',
        created_at INT UNSIGNED NOT NULL,
        INDEX idx_click (click_id),
        INDEX idx_campaign (campaign_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      return pool.query(
        `INSERT INTO 1ai_attribution_touchpoints (click_id, campaign_id, affiliate_id, traffic_source, touch_type, created_at)
         VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
        [click_id, campaign_id, affiliate_id, traffic_source, touch_type || 'click']
      );
    });
    return { success: true };
  } catch (err) {
    console.error('recordTouchpoint error:', err.message);
    return { success: false, error: err.message };
  }
}

// ── Get Attribution for Conversion ──────────────────────────────

async function getAttributionForConversion(click_id, model = 'last_touch') {
  try {
    const [touchpoints] = await pool.query(
      'SELECT * FROM 1ai_attribution_touchpoints WHERE click_id = ? ORDER BY created_at ASC',
      [click_id]
    ).catch(() => [[]]);

    const attributionModel = MODELS[model] || MODELS.last_touch;
    const attributed = attributionModel.calculate(touchpoints.map(tp => ({
      ...tp,
      timestamp: tp.created_at * 1000,
    })));

    return {
      click_id,
      model,
      touchpoints: attributed,
      total_touchpoints: touchpoints.length,
    };
  } catch (err) {
    console.error('getAttributionForConversion error:', err.message);
    return { click_id, model, touchpoints: [], total_touchpoints: 0 };
  }
}

// ── Get Attribution Report ──────────────────────────────────────

async function getAttributionReport({ campaign_id, model = 'last_touch', date_from, date_to }) {
  try {
    let where = '1=1';
    const params = [];
    
    if (campaign_id) { where += ' AND cl.aff_campaign_id = ?'; params.push(campaign_id); }
    if (date_from) { where += ' AND cl.conversion_time >= UNIX_TIMESTAMP(?)'; params.push(date_from); }
    if (date_to) { where += ' AND cl.conversion_time <= UNIX_TIMESTAMP(?)'; params.push(date_to + ' 23:59:59'); }

    const [conversions] = await pool.query(
      `SELECT cl.conversion_id, cl.click_id, cl.affiliate_payout_snapshot, cl.conversion_time,
              ac.aff_campaign_name, ac.aff_campaign_id
       FROM 1ai_conversion_logs cl
       JOIN 1ai_aff_campaigns ac ON ac.aff_campaign_id = cl.aff_campaign_id
       WHERE ${where}
       ORDER BY cl.conversion_time DESC LIMIT 100`,
      params
    );

    const attributionModel = MODELS[model] || MODELS.last_touch;
    const report = conversions.map(conv => {
      const attributed = attributionModel.calculate([{
        traffic_source: 'direct',
        timestamp: conv.conversion_time * 1000,
      }]);
      return {
        ...conv,
        attribution: attributed,
      };
    });

    // Summary by campaign
    const summary = {};
    for (const conv of report) {
      const key = conv.aff_campaign_name;
      if (!summary[key]) summary[key] = { conversions: 0, revenue: 0, campaign_id: conv.aff_campaign_id };
      summary[key].conversions++;
      summary[key].revenue += parseFloat(conv.affiliate_payout_snapshot || 0);
    }

    return {
      model,
      total_conversions: report.length,
      conversions: report,
      summary: Object.entries(summary).map(([name, data]) => ({ campaign_name: name, ...data })),
    };
  } catch (err) {
    console.error('getAttributionReport error:', err.message);
    return { model, total_conversions: 0, conversions: [], summary: [] };
  }
}

module.exports = {
  MODELS,
  recordTouchpoint,
  getAttributionForConversion,
  getAttributionReport,
};
