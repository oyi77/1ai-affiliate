/**
 * /api/admin/services — Cap enforcement, fraud detection, margin negotiation, multi-model tracking
 */
const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const cap = require('../services/capEnforcementService');
const fraud = require('../services/fraudDetectionService');
const margin = require('../services/marginNegotiationService');
const multiModel = require('../services/multiModelService');

router.use(authenticate, requireAdmin);

// ── Cap Enforcement ──────────────────────────────────────────
router.get('/caps/check/:offer_id', async (req, res) => {
  try {
    res.json(await cap.checkOfferCap(parseInt(req.params.offer_id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/caps/offer/:id', async (req, res) => {
  try {
    res.json(await cap.getOfferCapUsage(parseInt(req.params.id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/caps/offer/:id', async (req, res) => {
  try {
    await cap.setOfferCap(parseInt(req.params.id), req.body);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/caps/affiliate/:affiliate_id/offer/:offer_id', async (req, res) => {
  try {
    res.json(await cap.checkAffiliateCap(parseInt(req.params.affiliate_id), parseInt(req.params.offer_id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Fraud Detection ──────────────────────────────────────────
router.get('/fraud/blacklist', async (req, res) => {
  try {
    res.json({ data: await fraud.getBlacklist(req.query) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/fraud/blacklist', async (req, res) => {
  try {
    const { type, value, reason, severity } = req.body;
    res.json({ success: true, id: await fraud.addToBlacklist(type, value, reason, severity || 'medium', false) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/fraud/blacklist/:id', async (req, res) => {
  try {
    await fraud.removeFromBlacklist(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/fraud/check-click', async (req, res) => {
  try {
    const { ip, slug, user_agent, offer_id, affiliate_id } = req.body;
    res.json(await fraud.checkClickFraud(ip, slug, user_agent, offer_id, affiliate_id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/fraud/check-conversion', async (req, res) => {
  try {
    const { click_id, offer_id } = req.body;
    res.json(await fraud.checkConversionFraud(click_id, offer_id));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Margin Negotiation ───────────────────────────────────────
router.get('/margin/negotiations', async (req, res) => {
  try {
    res.json({ data: await margin.getNegotiations(req.query) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/margin/propose', async (req, res) => {
  try {
    const { offer_id, affiliate_id, proposed_payout, reason, proposed_by, volume_commitment } = req.body;
    res.json({ success: true, id: await margin.proposePayout(offer_id, affiliate_id, proposed_payout, reason, proposed_by || 'admin', volume_commitment) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/margin/approve/:id', async (req, res) => {
  try {
    await margin.approveNegotiation(parseInt(req.params.id), req.user.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/margin/reject/:id', async (req, res) => {
  try {
    await margin.rejectNegotiation(parseInt(req.params.id), req.body.reason || 'Rejected by admin');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/margin/expire', async (req, res) => {
  try {
    res.json({ expired: await margin.expireOldNegotiations() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Multi-Model Tracking (CPC/CPV/CPM) ──────────────────────
router.get('/multimodel/earnings/:affiliate_id', async (req, res) => {
  try {
    const { payout_model, start_date, end_date } = req.query;
    res.json({ data: await multiModel.getEarningsByModel(parseInt(req.params.affiliate_id), payout_model, start_date, end_date) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/multimodel/cpm-status/:offer_id/:affiliate_id', async (req, res) => {
  try {
    res.json(await multiModel.getCpmBatchStatus(parseInt(req.params.offer_id), parseInt(req.params.affiliate_id)));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/multimodel/record-cpc', async (req, res) => {
  try {
    const { click_id, offer_id, affiliate_id, payout } = req.body;
    res.json(await multiModel.recordCpcEarning(click_id, offer_id, affiliate_id, payout));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/multimodel/record-cpv', async (req, res) => {
  try {
    const { click_id, offer_id, affiliate_id, view_duration_ms, qualified_payout } = req.body;
    res.json(await multiModel.recordCpvView(click_id, offer_id, affiliate_id, view_duration_ms, qualified_payout));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/multimodel/record-cpm', async (req, res) => {
  try {
    const { click_id, offer_id, affiliate_id, cpm_rate } = req.body;
    res.json(await multiModel.recordCpmClick(click_id, offer_id, affiliate_id, cpm_rate));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
