'use strict';

/**
 * Fraud Detection Service — Comprehensive click & conversion fraud analysis.
 * Integrates fraudRuleEngine, GeoIP, device tracking for unified fraud scoring.
 */

const pool = require('../db/mysql');
const { evaluateClick, recordClick, autoBlacklist, checkASN } = require('./fraudRuleEngine');
const { lookupIp } = require('../routes/geoip');
const { getDeviceFingerprint, getClickQualityScore } = require('./deviceTracker');

// ── Blacklist Management ──────────────────────────────────────────────────

async function getBlacklist() {
  const [rows] = await pool.query(
    'SELECT * FROM 1ai_fraud_blacklist ORDER BY created_at DESC LIMIT 500'
  );
  return rows;
}

async function addToBlacklist({ type, value, reason, severity, created_by }) {
  const [result] = await pool.query(
    `INSERT INTO 1ai_fraud_blacklist (type, value, reason, severity, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
    [type || 'ip', value, reason || '', severity || 'medium', created_by || 0]
  );
  return { id: result.insertId };
}

async function removeFromBlacklist(id) {
  const [result] = await pool.query('DELETE FROM 1ai_fraud_blacklist WHERE id = ?', [id]);
  return { deleted: result.affectedRows > 0 };
}

// ── IP Reputation ─────────────────────────────────────────────────────────

async function getIPReputation(ip) {
  try {
    const [[row]] = await pool.query(
      'SELECT * FROM 1ai_ip_reputation WHERE ip = ?', [ip]
    );
    return row || null;
  } catch {
    return null;
  }
}

async function updateIPReputation(ip, { is_fraud, country_code, asn, isp }) {
  try {
    await pool.query(
      `INSERT INTO 1ai_ip_reputation (ip, reputation_score, total_clicks, total_fraud_flags, first_seen, last_seen, last_country_code, last_asn, last_isp)
       VALUES (?, ?, 1, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         total_clicks = total_clicks + 1,
         total_fraud_flags = total_fraud_flags + ?,
         reputation_score = LEAST(1.0, reputation_score + ?),
         last_seen = UNIX_TIMESTAMP(),
         last_country_code = COALESCE(?, last_country_code),
         last_asn = COALESCE(?, last_asn),
         last_isp = COALESCE(?, last_isp)`,
      [
        ip,
        is_fraud ? 0.7 : 0.1,
        is_fraud ? 1 : 0,
        country_code || null, asn || null, isp || null,
        is_fraud ? 1 : 0,
        is_fraud ? 0.1 : -0.02,
        country_code || null, asn || null, isp || null,
      ]
    );
  } catch (err) {
    console.error('updateIPReputation error:', err.message);
  }
}

// ── Main Click Analysis ───────────────────────────────────────────────────

async function analyzeClick({ ip, user_agent, referer, offer_id, affiliate_id, campaign_id, subid }) {
  const flags = [];
  let riskScore = 0;

  // 1. GeoIP lookup
  const geo = await lookupIp(ip);

  // 2. Device fingerprint
  const device = getDeviceFingerprint(user_agent);

  // 3. Bot UA check
  if (device.is_bot) {
    flags.push('bot_detected');
    riskScore += 0.4;
  }

  // 4. Proxy/VPN/Datacenter check
  if (geo.is_datacenter) {
    flags.push('datacenter_ip');
    riskScore += 0.2;
  }
  if (geo.is_vpn) {
    flags.push('vpn_detected');
    riskScore += 0.15;
  }
  if (geo.is_proxy) {
    flags.push('proxy_detected');
    riskScore += 0.1;
  }

  // 5. Empty referer
  if (!referer || referer === '-' || referer === 'null') {
    flags.push('empty_referer');
    riskScore += 0.05;
  }

  // 6. Click velocity check (via rule engine)
  try {
    const ruleResult = await evaluateClick(pool, {
      ip, userAgent: user_agent, referer, offerId: offer_id, affiliateId: affiliate_id,
    });
    if (ruleResult.blocked) {
      flags.push(...(ruleResult.flags || []));
      riskScore = Math.max(riskScore, ruleResult.score || 0);
    }
  } catch {}

  // 7. IP reputation check
  const reputation = await getIPReputation(ip);
  if (reputation) {
    if (reputation.is_blacklisted) {
      flags.push('ip_blacklisted');
      riskScore += 0.5;
    }
    if (reputation.reputation_score > 0.7) {
      flags.push('bad_ip_reputation');
      riskScore += 0.2;
    }
  }

  // 8. Click quality score
  const qualityScore = getClickQualityScore({
    device, geo,
    has_referer: !!(referer && referer !== '-' && referer !== 'null'),
    click_velocity_ok: !flags.includes('click_velocity_exceeded'),
  });

  // Cap risk score at 1.0
  riskScore = Math.min(1.0, riskScore);

  // Determine verdict
  let verdict = 'allow';
  if (riskScore >= 0.7) verdict = 'block';
  else if (riskScore >= 0.4) verdict = 'review';

  // Record in fraud log
  try {
    await pool.query(
      `INSERT INTO 1ai_fraud_log (click_id, ip, affiliate_id, offer_id, risk_score, verdict, flags, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())`,
      [
        null, // click_id not available yet at analysis time
        ip, affiliate_id || null, offer_id || null,
        riskScore, verdict,
        JSON.stringify(flags),
        JSON.stringify({ geo, device, qualityScore, reputation: reputation ? true : false }),
      ]
    );
  } catch {}

  // Update IP reputation
  await updateIPReputation(ip, {
    is_fraud: verdict === 'block',
    country_code: geo.country_code,
    asn: geo.asn_number,
    isp: geo.isp,
  });

  // Auto-blacklist if score is very high
  if (riskScore >= 0.8) {
    await autoBlacklist(pool, ip, riskScore, flags.join(', '));
  }

  return {
    risk_score: Math.round(riskScore * 100) / 100,
    verdict,
    flags,
    quality_score: qualityScore,
    geo: {
      country: geo.country,
      country_code: geo.country_code,
      city: geo.city,
      region: geo.region,
      isp: geo.isp,
      asn: geo.asn_number,
      connection_type: geo.connection_type,
    },
    device: {
      os: `${device.os.name} ${device.os.version || ''}`.trim(),
      browser: `${device.browser.name} ${device.browser.version || ''}`.trim(),
      device_type: device.device_type,
      is_mobile: device.is_mobile,
      is_bot: device.is_bot,
      engine: device.engine,
    },
    is_proxy: geo.is_proxy,
    is_datacenter: geo.is_datacenter,
    is_vpn: geo.is_vpn,
  };
}

// ── Conversion Analysis ───────────────────────────────────────────────────

async function analyzeConversion({ click_id, offer_id, affiliate_id, conversion_time }) {
  const flags = [];
  let riskScore = 0;

  // 1. Duplicate conversion check
  try {
    const [[existing]] = await pool.query(
      'SELECT COUNT(*) as cnt FROM 1ai_conversion_logs WHERE click_id = ?',
      [click_id]
    );
    if (existing.cnt > 1) {
      flags.push('duplicate_conversion');
      riskScore += 0.5;
    }
  } catch {}

  // 2. Velocity check (too many conversions from same affiliate)
  try {
    const [[recent]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM 1ai_conversion_logs
       WHERE affiliate_id = ? AND conversion_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))`,
      [affiliate_id]
    );
    if (recent.cnt > 50) {
      flags.push('conversion_velocity_exceeded');
      riskScore += 0.3;
    } else if (recent.cnt > 20) {
      flags.push('high_conversion_velocity');
      riskScore += 0.1;
    }
  } catch {}

  // 3. Time-to-convert check (too fast = suspicious)
  if (conversion_time) {
    try {
      const [[click]] = await pool.query(
        'SELECT click_time FROM 1ai_clicks WHERE click_id = ?',
        [click_id]
      );
      if (click) {
        const ttc = conversion_time - click.click_time;
        if (ttc < 5) {
          flags.push('instant_conversion');
          riskScore += 0.4;
        } else if (ttc < 30) {
          flags.push('very_fast_conversion');
          riskScore += 0.15;
        }
      }
    } catch {}
  }

  // 4. IP consistency check
  try {
    const [[clickLog]] = await pool.query(
      'SELECT ip FROM 1ai_click_log WHERE click_id = ?',
      [click_id]
    );
    if (clickLog && clickLog.ip) {
      const clickGeo = await lookupIp(clickLog.ip);
      if (clickGeo.is_proxy || clickGeo.is_datacenter) {
        flags.push('conversion_from_datacenter');
        riskScore += 0.15;
      }
    }
  } catch {}

  riskScore = Math.min(1.0, riskScore);

  let verdict = 'allow';
  if (riskScore >= 0.7) verdict = 'block';
  else if (riskScore >= 0.4) verdict = 'review';

  return {
    risk_score: Math.round(riskScore * 100) / 100,
    verdict,
    flags,
  };
}

// ── Legacy Compatibility ──────────────────────────────────────────────────

async function checkClick({ ip, user_agent, offer_id }) {
  const [rows] = await pool.query(
    `SELECT * FROM 1ai_fraud_blacklist
     WHERE (type = 'ip' AND value = ?)
        OR (type = 'ua' AND value = ?)
     LIMIT 5`,
    [ip || '', user_agent || '']
  );
  return { blocked: rows.length > 0, matches: rows };
}

async function checkConversion({ click_id, affiliate_id }) {
  const [recent] = await pool.query(
    `SELECT COUNT(*) AS cnt FROM 1ai_conversion_logs
     WHERE affiliate_id = ? AND conversion_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 HOUR))`,
    [affiliate_id]
  );
  return { suspicious: recent[0]?.cnt > 50, count: recent[0]?.cnt || 0 };
}

module.exports = {
  getBlacklist, addToBlacklist, removeFromBlacklist,
  analyzeClick, analyzeConversion,
  getIPReputation, updateIPReputation,
  checkClick, checkConversion,
  getDeviceFingerprint: (ua) => getDeviceFingerprint(ua),
  getClickQualityScore: (data) => getClickQualityScore(data),
};
