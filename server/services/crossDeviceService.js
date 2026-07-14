'use strict';

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Find a visitor by device fingerprint.
 * fingerprint can be a string hash or a structured JSON object.
 */
async function lookupByFingerprint(fingerprint) {
  return queryOne(
    'SELECT * FROM 1ai_cross_device_visitors WHERE JSON_CONTAINS(fingerprints, ?)',
    [JSON.stringify(fingerprint)]
  );
}

/**
 * Upsert a visitor by device fingerprint.
 * Returns the visitor ID (existing or newly created).
 * Increments click_count on revisit.
 */
async function getOrCreateVisitor(fingerprint, deviceData) {
  const now = Math.floor(Date.now() / 1000);

  const existing = await lookupByFingerprint(fingerprint);
  if (existing) {
    // Append unique device info
    let devices = existing.devices || [];
    if (deviceData) {
      const key = JSON.stringify(deviceData);
      if (!devices.some(d => JSON.stringify(d) === key)) {
        devices = [...devices, deviceData];
      }
    }

    await queryUpdate(
      'UPDATE 1ai_cross_device_visitors SET last_seen_at = ?, devices = ?, click_count = click_count + 1 WHERE id = ?',
      [now, JSON.stringify(devices), existing.id]
    );

    return existing.id;
  }

  // New visitor
  const fingerprints = [fingerprint];
  const devices = deviceData ? [deviceData] : [];

  const id = await queryInsert(
    `INSERT INTO 1ai_cross_device_visitors
     (fingerprints, devices, first_seen_at, last_seen_at, click_count, conversion_count, confidence, created_at)
     VALUES (?, ?, ?, ?, 0, 0, 0.00, ?)`,
    [JSON.stringify(fingerprints), JSON.stringify(devices), now, now, now]
  );

  return id;
}

/**
 * Merge source visitor into target visitor.
 * Fingerprints/devices are deduplicated; stats are summed.
 * Source record is deleted; merge is logged in audit trail.
 * Returns the target visitor ID.
 */
async function mergeVisitors(sourceVisitorId, targetVisitorId, reason) {
  const now = Math.floor(Date.now() / 1000);

  const [source, target] = await Promise.all([
    queryOne('SELECT * FROM 1ai_cross_device_visitors WHERE id = ?', [sourceVisitorId]),
    queryOne('SELECT * FROM 1ai_cross_device_visitors WHERE id = ?', [targetVisitorId])
  ]);

  if (!source) throw Object.assign(new Error('Source visitor not found'), { status: 404 });
  if (!target) throw Object.assign(new Error('Target visitor not found'), { status: 404 });

  // Deduplicate fingerprints
  const seen = new Set();
  const mergedFingerprints = [];
  for (const fp of [...(target.fingerprints || []), ...(source.fingerprints || [])]) {
    const key = JSON.stringify(fp);
    if (!seen.has(key)) {
      seen.add(key);
      mergedFingerprints.push(fp);
    }
  }

  // Deduplicate devices by JSON identity
  const deviceMap = new Map();
  for (const d of [...(target.devices || []), ...(source.devices || [])]) {
    deviceMap.set(JSON.stringify(d), d);
  }
  const mergedDevices = [...deviceMap.values()];

  const newConfidence = Math.min(100, Math.max(target.confidence, source.confidence) + 5);

  await queryUpdate(
    `UPDATE 1ai_cross_device_visitors SET
     fingerprints = ?, devices = ?,
     first_seen_at = ?,
     last_seen_at = ?,
     click_count = ?,
     conversion_count = ?,
     confidence = ?
     WHERE id = ?`,
    [
      JSON.stringify(mergedFingerprints),
      JSON.stringify(mergedDevices),
      Math.min(source.first_seen_at, target.first_seen_at),
      Math.max(source.last_seen_at, target.last_seen_at),
      (source.click_count || 0) + (target.click_count || 0),
      (source.conversion_count || 0) + (target.conversion_count || 0),
      newConfidence,
      targetVisitorId
    ]
  );

  await queryUpdate('DELETE FROM 1ai_cross_device_visitors WHERE id = ?', [sourceVisitorId]);

  await queryInsert(
    'INSERT INTO 1ai_cross_device_merge_log (source_visitor_id, target_visitor_id, merge_reason, confidence, created_at) VALUES (?, ?, ?, ?, ?)',
    [sourceVisitorId, targetVisitorId, reason, newConfidence, now]
  );

  return targetVisitorId;
}

/**
 * Get full visitor profile including merge history.
 */
async function getVisitorStats(visitorId) {
  const visitor = await queryOne('SELECT * FROM 1ai_cross_device_visitors WHERE id = ?', [visitorId]);
  if (!visitor) return null;

  const [mergesAsTarget, mergesAsSource] = await Promise.all([
    queryRows('SELECT * FROM 1ai_cross_device_merge_log WHERE target_visitor_id = ? ORDER BY created_at DESC', [visitorId]),
    queryRows('SELECT * FROM 1ai_cross_device_merge_log WHERE source_visitor_id = ? ORDER BY created_at DESC', [visitorId])
  ]);

  return { ...visitor, merge_history: { as_target: mergesAsTarget, as_source: mergesAsSource } };
}

module.exports = { getOrCreateVisitor, mergeVisitors, lookupByFingerprint, getVisitorStats };
