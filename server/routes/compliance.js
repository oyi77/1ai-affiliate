'use strict';

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const compliance = require('../services/complianceService');

router.use(authenticate);

// ── Documents ──────────────────────────────────────────────────────

/**
 * GET /api/compliance/documents
 * List documents for the authenticated affiliate.
 */
router.get('/documents', asyncHandler(async (req, res) => {
  const rows = await compliance.getDocuments(req.user.id);
  res.json({ data: rows });
}));

/**
 * GET /api/compliance/documents/all
 * Admin — list all documents across affiliates, optionally filtered by status.
 */
router.get('/documents/all', requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.query;
  const rows = await compliance.getAllDocuments(status || null);
  res.json({ data: rows });
}));

/**
 * POST /api/compliance/documents
 * Upload a KYC document.
 */
router.post('/documents', asyncHandler(async (req, res) => {
  const { document_type, file_url } = req.body;
  if (!document_type || !file_url) {
    return res.status(400).json({ error: 'document_type and file_url required' });
  }
  const id = await compliance.uploadDocument(req.user.id, document_type, file_url);
  res.status(201).json({ data: { id } });
}));

/**
 * PUT /api/compliance/documents/:id/approve
 * Admin — approve a document.
 */
router.put('/documents/:id/approve', requireAdmin, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid document id' });
  const affected = await compliance.approveDocument(id, req.user.id);
  if (!affected) return res.status(404).json({ error: 'Document not found' });
  res.json({ data: { affected } });
}));

/**
 * PUT /api/compliance/documents/:id/reject
 * Admin — reject a document with a reason.
 */
router.put('/documents/:id/reject', requireAdmin, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid document id' });
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'reason required' });
  const affected = await compliance.rejectDocument(id, reason, req.user.id);
  if (!affected) return res.status(404).json({ error: 'Document not found' });
  res.json({ data: { affected } });
}));

// ── Verifications ──────────────────────────────────────────────────

/**
 * GET /api/compliance/verifications
 * List verifications for the authenticated affiliate.
 */
router.get('/verifications', asyncHandler(async (req, res) => {
  const rows = await compliance.getVerifications(req.user.id);
  res.json({ data: rows });
}));

/**
 * POST /api/compliance/verifications
 * Create a verification record.
 */
router.post('/verifications', asyncHandler(async (req, res) => {
  const { verification_type } = req.body;
  if (!verification_type) {
    return res.status(400).json({ error: 'verification_type required' });
  }
  const id = await compliance.createVerification(req.user.id, verification_type);
  res.status(201).json({ data: { id } });
}));

/**
 * PUT /api/compliance/verifications/:id
 * Update verification status and notes.
 */
router.put('/verifications/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid verification id' });
  const { status, notes } = req.body;
  if (!status) return res.status(400).json({ error: 'status required' });
  const affected = await compliance.updateVerification(id, status, notes || null);
  if (!affected) return res.status(404).json({ error: 'Verification not found' });
  res.json({ data: { affected } });
}));

// ── Compliance Notes ───────────────────────────────────────────────

/**
 * GET /api/compliance/notes
 * List compliance notes for the authenticated affiliate.
 */
router.get('/notes', asyncHandler(async (req, res) => {
  const rows = await compliance.getNotes(req.user.id);
  res.json({ data: rows });
}));

/**
 * POST /api/compliance/notes
 * Add a compliance note.
 */
router.post('/notes', asyncHandler(async (req, res) => {
  const { note_type, note_text } = req.body;
  if (!note_type || !note_text) {
    return res.status(400).json({ error: 'note_type and note_text required' });
  }
  const id = await compliance.addNote(req.user.id, note_type, note_text, req.user.id);
  res.status(201).json({ data: { id } });
}));

module.exports = router;
