#!/usr/bin/env node
/**
 * Seed script to register jendralbot lynk.id products as 1ai_offers
 * and mint smartlinks for them so the tracking loop works.
 *
 * Usage:
 *   cd ~/projects/1ai-affiliate
 *   node server/scripts/seed_jendralbot_offers.js
 *
 * This script:
 * 1. Inserts jendralbot products into 1ai_offers
 * 2. Mints smartlinks for each offer using the tracked domain
 * 2. Outputs offer_id -> smartlink mapping for verification
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const pool = require('../db/mysql');
const crypto = require('crypto');
const { mintSmartlink } = require('../services/smartlinkService');

/**
 * jendralbot products extracted from jendralbot/index.html
 * Each entry: { title, lynk_id_url, description }
 */
const JENDRALBOT_PRODUCTS = [
  {
    title: 'JobMagnet AI',
    slug: 'jobmagnet-ai',
    lynkUrl: 'https://lynk.id/jendralbot/45r5yvze3vy4',
    description: 'AI-powered job application assistant - auto-apply to jobs with tailored resumes'
  },
  {
    title: 'AI Creative Ad Engine',
    slug: 'ai-creative-ad-engine',
    lynkUrl: 'https://lynk.id/jendralbot/6821op5e24kn',
    description: 'Generate high-converting ad creatives in seconds with AI'
  },
  {
    title: 'Food Menu AI Studio',
    slug: 'food-menu-ai-studio',
    lynkUrl: 'https://lynk.id/jendralbot/89d30qd3ddnj',
    description: 'AI-generated restaurant menus with photos and descriptions'
  },
  {
    title: 'Studio Marketplace Pro',
    slug: 'studio-marketplace-pro',
    lynkUrl: 'https://lynk.id/jendralbot/9r8rj1o38q59',
    description: 'Complete marketplace solution for digital creators'
  },
  {
    title: 'AI Creative Tools',
    slug: 'ai-creative-tools',
    lynkUrl: 'https://lynk.id/jendralbot/emne05mm7v25',
    description: 'Suite of AI tools for content creators and marketers'
  },
  {
    title: 'Guru Pintar AI',
    slug: 'guru-pintar-ai',
    lynkUrl: 'https://lynk.id/jendralbot/kkjk0mv1vg7o',
    description: 'AI tutor for students - homework help and exam prep'
  },
  {
    title: 'Sekarang Gratis',
    slug: 'sekaran-gratis',
    lynkUrl: 'https://lynk.id/jendralbot/l4q49jj3z383',
    description: 'Free AI tools directory and comparison guide'
  },
  {
    title: 'Belanja Duit Balik',
    slug: 'belanja-duit-balik',
    lynkUrl: 'https://lynk.id/jendralbot/regxdn7xkpz6',
    description: 'Cashback and affiliate shopping platform'
  },
  {
    title: 'Kelas Affiliate TikTok',
    slug: 'kelas-affiliate-tiktok',
    lynkUrl: 'https://lynk.id/jendralbot/kkjk0mv1vg7o',
    description: 'TikTok affiliate marketing mastery course'
  },
];

async function seedOffers() {
  console.log('[Seed] Starting jendralbot offers seeding...');

  let createdCount = 0;
  let skippedCount = 0;
  const results = [];

  for (const product of JENDRALBOT_PRODUCTS) {
    try {
      // Check if offer already exists by slug
      const [existing] = await pool.query(
        'SELECT id FROM 1ai_offers WHERE name = ?',
        [product.title]
      );

      let offerId;
      if (existing.length) {
        offerId = existing[0].id;
        console.log(`[Seed] Offer "${product.title}" already exists (id: ${offerId}), skipping creation`);
        skippedCount++;
      } else {
        // Insert new offer
        const [result] = await pool.query(
          `INSERT INTO 1ai_offers (name, advertiser_id, network_id, vertical, geo, type, payout, network_payout, payout_currency, status, notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())`,
          [
            product.title,
            1, // advertiser_id (assuming admin user id 1)
            null, // network_id
            'tools', // vertical
            'Global', // geo
            'CPA', // type
            10.00, // payout (example $10 per action)
            15.00, // network_payout
            'USD', // payout_currency
            'active', // status
            product.description, // notes
          ]
        );
        offerId = result.insertId;
        console.log(`[Seed] Created offer "${product.title}" with id ${offerId}`);
        createdCount++;
      }

      // Now mint a smartlink for this offer
      // Using default domain (go.berkahkarya.org) and no shortener
      try {
        const smartlink = await mintSmartlink({
          offerId,
          affiliateId: 1, // admin affiliate
          domainId: null, // uses default domain
          shortenerServiceId: null
        });

        console.log(`[Seed] Minted smartlink for "${product.title}": ${smartlink.url}`);
        results.push({
          offerId,
          offerName: product.title,
          slug: smartlink.slug,
          smartlinkUrl: smartlink.url,
          lynkUrl: product.lynkUrl
        });
      } catch (mintErr) {
        console.error(`[Seed] Failed to mint smartlink for "${product.title}":`, mintErr.message);
        results.push({
          offerId,
          offerName: product.title,
          slug: null,
          smartlinkUrl: null,
          lynkUrl: product.lynkUrl,
          mintError: mintErr.message
        });
      }
    } catch (err) {
      console.error(`[Seed] Error processing "${product.title}":`, err.message);
      results.push({
        offerName: product.title,
        error: err.message
      });
    }
  }

  console.log('\n[Seed] Summary:');
  console.log(`  Created: ${createdCount} new offers`);
  console.log(`  Skipped: ${skippedCount} existing offers`);
  console.log(`  Total processed: ${JENDRALBOT_PRODUCTS.length}`);

  console.log('\n[Seed] Offer -> Smartlink Mapping:');
  for (const r of results) {
    if (r.smartlinkUrl) {
      console.log(`  [${r.offerId}] ${r.offerName}: ${r.smartlinkUrl}`);
      if (r.lynkUrl) console.log(`    Original lynk.id: ${r.lynkUrl}`);
    } else {
      console.log(`  [${r.offerId}] ${r.offerName}: FAILED (${r.mintError || r.error})`);
    }
  }

  console.log('\n[Seed] Next steps:');
  console.log('1. Update NICHE_OFFER_MAP in server/services/pipelineService.js with offer IDs');
  console.log('2. Update NICHE_OFFER_MAP in server/services/posterService.js if different');
  console.log('3. Update jendralbot/index.html CTAs to use tracked smartlink URLs');
  console.log('4. Run this script again after any changes (idempotent)');

  await pool.end();
}

// Run
seedOffers().catch(err => {
  console.error('[Seed] Fatal error:', err);
  process.exit(1);
});
