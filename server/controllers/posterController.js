const posterService = require('../services/posterService');

async function trigger(req, res) {
  try {
    const row = await posterService.fetchNextPending();
    if (!row) {
      return res.json({ posted: null, message: 'No pending products' });
    }

    const caption = posterService.formatCaption(row);
    await posterService.postToTelegram(caption, row.image_url);
    await posterService.markPosted(row.id);

    res.json({ posted: row });
  } catch (err) {
    console.error('[posterController] trigger error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function listQueue(req, res) {
  try {
    const { status, limit } = req.query;
    const rows = await posterService.listQueue(status, limit ? parseInt(limit) : 50);
    res.json(rows);
  } catch (err) {
    console.error('[posterController] listQueue error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function addToQueue(req, res) {
  try {
    const { product_url, product_name, image_url, normal_price, promo_price, affiliate_link, niche } = req.body;

    if (!product_url || !product_name || !normal_price || !promo_price) {
      return res.status(400).json({
        error: 'product_url, product_name, normal_price, and promo_price are required',
      });
    }

    const result = await posterService.addToQueue(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('[posterController] addToQueue error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function removeFromQueue(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await posterService.removeFromQueue(id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[posterController] removeFromQueue error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function testMessage(req, res) {
  try {
    await posterService.postToTelegram(
      '<b>Test message from 1ai-affiliate poster</b>\n\nSystem is online and configured correctly.',
      null
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[posterController] testMessage error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { trigger, listQueue, addToQueue, removeFromQueue, testMessage };
