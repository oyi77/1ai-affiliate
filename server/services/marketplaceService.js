'use strict';

/**
 * Marketplace Service
 * Manages affiliate marketplace public profiles.
 */

const { queryOne, queryRows, queryInsert, queryUpdate } = require('../utils/queryHelpers');

/**
 * Get a profile by affiliate ID.
 * @param {number} affiliateId
 * @returns {Promise<object|null>}
 */
async function getProfile(affiliateId) {
  return queryOne(
    'SELECT * FROM 1ai_affiliate_marketplace_profiles WHERE affiliate_id = ?',
    [affiliateId]
  );
}

/**
 * Create or update a marketplace profile for an affiliate.
 * @param {number} affiliateId
 * @param {string}  [headline]
 * @param {string}  [bio]
 * @param {string}  [avatarUrl]
 * @param {string}  [websiteUrl]
 * @param {object}  [socialLinks]
 * @param {object}  [trafficSources]
 * @param {object}  [geoReach]
 * @param {object}  [verticalSpecialties]
 * @param {number}  [monthlyVisitors]
 * @returns {Promise<void>}
 */
async function upsertProfile(
  affiliateId,
  headline,
  bio,
  avatarUrl,
  websiteUrl,
  socialLinks,
  trafficSources,
  geoReach,
  verticalSpecialties,
  monthlyVisitors
) {
  const now = Math.floor(Date.now() / 1000);
  await queryInsert(
    `INSERT INTO 1ai_affiliate_marketplace_profiles
       (affiliate_id, headline, bio, avatar_url, website_url, social_links,
        traffic_sources, geo_reach, vertical_specialties, monthly_visitors,
        created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       headline         = VALUES(headline),
       bio              = VALUES(bio),
       avatar_url       = VALUES(avatar_url),
       website_url      = VALUES(website_url),
       social_links     = VALUES(social_links),
       traffic_sources  = VALUES(traffic_sources),
       geo_reach        = VALUES(geo_reach),
       vertical_specialties = VALUES(vertical_specialties),
       monthly_visitors = VALUES(monthly_visitors),
       updated_at       = VALUES(updated_at)`,
    [
      affiliateId,
      headline || null,
      bio || null,
      avatarUrl || null,
      websiteUrl || null,
      socialLinks ? JSON.stringify(socialLinks) : null,
      trafficSources ? JSON.stringify(trafficSources) : null,
      geoReach ? JSON.stringify(geoReach) : null,
      verticalSpecialties ? JSON.stringify(verticalSpecialties) : null,
      monthlyVisitors || null,
      now,
      now,
    ]
  );
}

/**
 * Partially update a marketplace profile by its primary key.
 * @param {number} id  — profile primary key
 * @param {object} data  — whitelisted fields to update
 * @returns {Promise<number>} affected rows
 */
async function updateProfile(id, data) {
  const now = Math.floor(Date.now() / 1000);
  const sets = [];
  const params = [];

  if (data.headline !== undefined) {
    sets.push('headline = ?');
    params.push(data.headline);
  }
  if (data.bio !== undefined) {
    sets.push('bio = ?');
    params.push(data.bio);
  }
  if (data.avatarUrl !== undefined) {
    sets.push('avatar_url = ?');
    params.push(data.avatarUrl);
  }
  if (data.websiteUrl !== undefined) {
    sets.push('website_url = ?');
    params.push(data.websiteUrl);
  }
  if (data.socialLinks !== undefined) {
    sets.push('social_links = ?');
    params.push(JSON.stringify(data.socialLinks));
  }
  if (data.trafficSources !== undefined) {
    sets.push('traffic_sources = ?');
    params.push(JSON.stringify(data.trafficSources));
  }
  if (data.geoReach !== undefined) {
    sets.push('geo_reach = ?');
    params.push(JSON.stringify(data.geoReach));
  }
  if (data.verticalSpecialties !== undefined) {
    sets.push('vertical_specialties = ?');
    params.push(JSON.stringify(data.verticalSpecialties));
  }
  if (data.monthlyVisitors !== undefined) {
    sets.push('monthly_visitors = ?');
    params.push(data.monthlyVisitors);
  }
  if (data.status !== undefined) {
    sets.push('status = ?');
    params.push(data.status);
  }
  if (data.featured !== undefined) {
    sets.push('featured = ?');
    params.push(data.featured ? 1 : 0);
  }

  if (sets.length === 0) return 0;

  sets.push('updated_at = ?');
  params.push(now);
  params.push(id);

  return queryUpdate(
    `UPDATE 1ai_affiliate_marketplace_profiles SET ${sets.join(', ')} WHERE id = ?`,
    params
  );
}

/**
 * Get featured / top-rated profiles (public).
 * @param {number} [limit=20]
 * @returns {Promise<object[]>}
 */
async function getFeaturedProfiles(limit) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  return queryRows(
    `SELECT * FROM 1ai_affiliate_marketplace_profiles
     WHERE featured = 1 AND status = 'active'
     ORDER BY rating DESC
     LIMIT ?`,
    [safeLimit]
  );
}

/**
 * Search / browse profiles with filters (public).
 * @param {string}  [keyword]    — matches headline or bio
 * @param {string}  [vertical]   — JSON_CONTAINS on vertical_specialties
 * @param {number}  [minRating]  — minimum rating threshold
 * @param {number}  [page=1]
 * @param {number}  [limit=20]
 * @returns {Promise<{rows: object[], total: number}>}
 */
async function searchProfiles(keyword, vertical, minRating, page, limit) {
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const offset = (safePage - 1) * safeLimit;
  const where = ['status = ?'];
  const params = ['active'];

  if (keyword) {
    where.push('(headline LIKE ? OR bio LIKE ?)');
    const like = `%${keyword}%`;
    params.push(like, like);
  }

  if (vertical) {
    where.push('JSON_CONTAINS(vertical_specialties, ?)');
    params.push(JSON.stringify(vertical));
  }

  if (minRating !== undefined && minRating !== null) {
    where.push('rating >= ?');
    params.push(parseFloat(minRating));
  }

  const whereClause = where.join(' AND ');

  const [countRow] = await queryRows(
    `SELECT COUNT(*) AS cnt FROM 1ai_affiliate_marketplace_profiles WHERE ${whereClause}`,
    params
  );
  const total = countRow ? countRow.cnt : 0;

  const rows = await queryRows(
    `SELECT * FROM 1ai_affiliate_marketplace_profiles
     WHERE ${whereClause}
     ORDER BY rating DESC, id ASC
     LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset]
  );

  return { rows, total };
}

/**
 * Update rating stats after a new rating is submitted.
 * Recalculates average from the (external) ratings table.
 * Falls back to existing rating + count if no ratings table available.
 * @param {number} affiliateId
 * @param {number} newRating   — single rating value 1.00-5.00
 * @returns {Promise<void>}
 */
async function updateRating(affiliateId, newRating) {
  const profile = await queryOne(
    'SELECT id, rating, rating_count FROM 1ai_affiliate_marketplace_profiles WHERE affiliate_id = ?',
    [affiliateId]
  );
  if (!profile) return;

  const currentRating = profile.rating || 0;
  const currentCount = profile.rating_count || 0;
  const newCount = currentCount + 1;
  const newAvg = ((currentRating * currentCount) + parseFloat(newRating)) / newCount;
  const clamped = Math.round(Math.min(Math.max(newAvg, 1), 5) * 100) / 100;

  await queryUpdate(
    'UPDATE 1ai_affiliate_marketplace_profiles SET rating = ?, rating_count = ?, updated_at = ? WHERE id = ?',
    [clamped, newCount, Math.floor(Date.now() / 1000), profile.id]
  );
}

module.exports = {
  getProfile,
  upsertProfile,
  updateProfile,
  getFeaturedProfiles,
  searchProfiles,
  updateRating,
};
