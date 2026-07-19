'use strict';

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

// ── KYC Documents ─────────────────────────────────────────────────

/**
 * Upload a KYC document for an affiliate.
 * @param {number} affiliateId
 * @param {string} docType - passport|drivers_license|national_id|bank_statement|utility_bill|tax_form|proof_of_address|other
 * @param {string} fileUrl
 * @returns {Promise<number>} insertId
 */
async function uploadDocument(affiliateId, docType, fileUrl) {
  const now = Math.floor(Date.now() / 1000);
  return queryInsert(
    `INSERT INTO 1ai_kyc_documents
     (affiliate_id, document_type, file_url, status, created_at, updated_at)
     VALUES (?, ?, ?, 'pending', ?, ?)`,
    [affiliateId, docType, fileUrl, now, now]
  );
}

/**
 * Get all documents for an affiliate.
 * @param {number} affiliateId
 * @returns {Promise<Array>}
 */
async function getDocuments(affiliateId) {
  return queryRows(
    'SELECT * FROM 1ai_kyc_documents WHERE affiliate_id = ? ORDER BY created_at DESC',
    [affiliateId]
  );
}

/**
 * Get all documents across affiliates, optionally filtered by status.
 * @param {string|null} status - pending|approved|rejected|expired
 * @returns {Promise<Array>}
 */
async function getAllDocuments(status) {
  const sql = status
    ? `SELECT d.*, a.name AS affiliate_name FROM 1ai_kyc_documents d
       LEFT JOIN 1ai_affiliates a ON a.id = d.affiliate_id
       WHERE d.status = ? ORDER BY d.created_at DESC`
    : `SELECT d.*, a.name AS affiliate_name FROM 1ai_kyc_documents d
       LEFT JOIN 1ai_affiliates a ON a.id = d.affiliate_id
       ORDER BY d.created_at DESC`;
  return queryRows(sql, status ? [status] : []);
}

/**
 * Approve a KYC document.
 * @param {number} id
 * @param {number} verifiedBy - admin user id
 * @returns {Promise<number>} affectedRows
 */
async function approveDocument(id, verifiedBy) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    'UPDATE 1ai_kyc_documents SET status = ?, verified_by = ?, verified_at = ?, updated_at = ? WHERE id = ?',
    ['approved', verifiedBy, now, now, id]
  );
}

/**
 * Reject a KYC document with a reason.
 * @param {number} id
 * @param {string} reason
 * @param {number} verifiedBy - admin user id
 * @returns {Promise<number>} affectedRows
 */
async function rejectDocument(id, reason, verifiedBy) {
  const now = Math.floor(Date.now() / 1000);
  return queryUpdate(
    'UPDATE 1ai_kyc_documents SET status = ?, rejection_reason = ?, verified_by = ?, verified_at = ?, updated_at = ? WHERE id = ?',
    ['rejected', reason, verifiedBy, now, now, id]
  );
}

// ── KYC Verifications ──────────────────────────────────────────────

/**
 * Create a verification record for an affiliate.
 * @param {number} affiliateId
 * @param {string} verType - document|phone|email|address|bank_account|identity
 * @returns {Promise<number>} insertId
 */
async function createVerification(affiliateId, verType) {
  return queryInsert(
    'INSERT INTO 1ai_kyc_verifications (affiliate_id, verification_type, status, created_at) VALUES (?, ?, ?, ?)',
    [affiliateId, verType, 'pending', Math.floor(Date.now() / 1000)]
  );
}

/**
 * Get all verifications for an affiliate.
 * @param {number} affiliateId
 * @returns {Promise<Array>}
 */
async function getVerifications(affiliateId) {
  return queryRows(
    'SELECT * FROM 1ai_kyc_verifications WHERE affiliate_id = ? ORDER BY created_at DESC',
    [affiliateId]
  );
}

/**
 * Update the status and/or notes of a verification.
 * @param {number} id
 * @param {string} status - pending|verified|failed|expired
 * @param {string|null} notes
 * @returns {Promise<number>} affectedRows
 */
async function updateVerification(id, status, notes) {
  return queryUpdate(
    'UPDATE 1ai_kyc_verifications SET status = ?, notes = ? WHERE id = ?',
    [status, notes || null, id]
  );
}

// ── Compliance Notes ───────────────────────────────────────────────

/**
 * Add a compliance note for an affiliate.
 * @param {number} affiliateId
 * @param {string} noteType - flag|restriction|waiver|note
 * @param {string} noteText
 * @param {number} createdBy - admin user id
 * @returns {Promise<number>} insertId
 */
async function addNote(affiliateId, noteType, noteText, createdBy) {
  return queryInsert(
    'INSERT INTO 1ai_compliance_notes (affiliate_id, note_type, note_text, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
    [affiliateId, noteType, noteText, createdBy, Math.floor(Date.now() / 1000)]
  );
}

/**
 * Get all compliance notes for an affiliate.
 * @param {number} affiliateId
 * @returns {Promise<Array>}
 */
async function getNotes(affiliateId) {
  return queryRows(
    'SELECT * FROM 1ai_compliance_notes WHERE affiliate_id = ? ORDER BY created_at DESC',
    [affiliateId]
  );
}

module.exports = {
  uploadDocument,
  getDocuments,
  getAllDocuments,
  approveDocument,
  rejectDocument,
  createVerification,
  getVerifications,
  updateVerification,
  addNote,
  getNotes,
};
