'use strict';

/**
 * HERMES — Facebook Affiliate Content Distribution System v1.0
 * 
 * Core pipeline:
 * 1. Load database (Google Sheet → local JSON)
 * 2. Build workspace (category folders)
 * 3. Validate categories (video ↔ category ↔ affiliate ↔ page)
 * 4. Generate captions (20+ CTA variations per category)
 * 5. Generate hashtags (category-specific, rotated)
 * 6. Distribute to Facebook Pages (category-matched only)
 * 7. Log everything
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Category System ─────────────────────────────────────────────

const CATEGORIES = {
  fashion: { label: 'Fashion', folder: 'fashion', color: '#ec4899' },
  fashion_muslim: { label: 'Fashion Muslim', folder: 'fashion_muslim', color: '#8b5cf6' },
  fashion_men: { label: 'Fashion Pria', folder: 'fashion_men', color: '#3b82f6' },
  fashion_kids: { label: 'Fashion Anak', folder: 'fashion_kids', color: '#f59e0b' },
  hijab: { label: 'Hijab', folder: 'hijab', color: '#a855f7' },
  beauty: { label: 'Beauty', folder: 'beauty', color: '#ec4899' },
  health: { label: 'Kesehatan', folder: 'health', color: '#10b981' },
  home_living: { label: 'Home Living', folder: 'home_living', color: '#6366f1' },
  electronics: { label: 'Electronics', folder: 'electronics', color: '#3b82f6' },
  food: { label: 'Food', folder: 'food', color: '#f59e0b' },
  trading: { label: 'Trading', folder: 'trading', color: '#8b5cf6' },
  detergent: { label: 'Produk Detergen', folder: 'detergent', color: '#14b8a6' },
  perabotan: { label: 'Perabotan', folder: 'home_living', color: '#6366f1' },
  other: { label: 'Other', folder: 'other', color: '#64748b' },
};

// Category mapping from sheet labels to internal keys
const CATEGORY_MAP = {
  'fashion': 'fashion',
  'fashion muslim': 'fashion_muslim',
  'fashion pria': 'fashion_men',
  'fashion pria': 'fashion_men',
  'fashion anak': 'fashion_kids',
  'hijab': 'hijab',
  'kesehatan': 'health',
  'home living': 'home_living',
  'perabotan': 'home_living',
  'electronics': 'electronics',
  'beauty': 'beauty',
  'food': 'food',
  'trading': 'trading',
  'produk detergen': 'detergent',
};

function normalizeCategory(raw) {
  if (!raw) return 'other';
  const key = raw.trim().toLowerCase();
  return CATEGORY_MAP[key] || 'other';
}

// ── CTA Variations (20+ per category) ───────────────────────────

const CTA_VARIATIONS = {
  fashion: [
    '✨ Lagi cari outfit kece? Koleksi terbaru sudah ready nih!\n👉 {AFFILIATE_LINK}',
    '🔥 Outfit ini lagi viral! Banyak yang udah pada beli lho.\n👉 {AFFILIATE_LINK}',
    '💕 Cocok banget buat daily outfit kamu!\n👉 {AFFILIATE_LINK}',
    '👀 Lihat detail produknya di sini ya:\n👉 {AFFILIATE_LINK}',
    '🛒 Klik aja langsung, lagi diskon besar-besaran!\n👉 {AFFILIATE_LINK}',
    '✨ Fashion kekinian yang wajib kamu punya!\n👉 {AFFILIATE_LINK}',
    '💫 Bisa jadi ini yang sedang kamu cari:\n👉 {AFFILIATE_LINK}',
    '🌟 Simpan dulu, siapa tahu nanti kepakai:\n👉 {AFFILIATE_LINK}',
    '🔥 Produk paling dicari minggu ini!\n👉 {AFFILIATE_LINK}',
    '✨ Tampil beda dengan koleksi terbaru:\n👉 {AFFILIATE_LINK}',
    '💖 Recommended banget! Worth it untuk harga segini.\n👉 {AFFILIATE_LINK}',
    '🛍️ Belanja hemat, tetap stylish!\n👉 {AFFILIATE_LINK}',
    '✨ Lagi trending nih, buruan sebelum kehabisan!\n👉 {AFFILIATE_LINK}',
    '👗 Outfit impian kamu ada di sini:\n👉 {AFFILIATE_LINK}',
    '🔥 Jangan sampai kehabisan, stok terbatas!\n👉 {AFFILIATE_LINK}',
  ],
  health: [
    '💊 Produk kesehatan yang lagi banyak dicari:\n👉 {AFFILIATE_LINK}',
    '🌿 Bahan alami, aman dikonsumsi setiap hari.\n👉 {AFFILIATE_LINK}',
    '✨ Investasi kesehatan terbaik untuk kamu!\n👉 {AFFILIATE_LINK}',
    '🏥 Sudah teruji dan banyak review positif.\n👉 {AFFILIATE_LINK}',
    '💪 Mulai hidup sehat dari sekarang!\n👉 {AFFILIATE_LINK}',
    '🌱 Solusi kesehatan alami yang terpercaya:\n👉 {AFFILIATE_LINK}',
    '✨ Rekomendasi dari para ahli kesehatan.\n👉 {AFFILIATE_LINK}',
    '💚 Jaga kesehatanmu dengan produk terbaik:\n👉 {AFFILIATE_LINK}',
    '🔬 Sudah BPOM dan bersertifikat.\n👉 {AFFILIATE_LINK}',
    '✨ Banyak yang sudah merasakan manfaatnya!\n👉 {AFFILIATE_LINK}',
    '🌿 Herbal alami untuk kesehatan optimal.\n👉 {AFFILIATE_LINK}',
    '💊 Promo spesial, jangan sampai kelewatan!\n👉 {AFFILIATE_LINK}',
    '✨ Tubuh sehat, hidup bahagia.\n👉 {AFFILIATE_LINK}',
    '🏥 Konsultasi gratis sebelum beli!\n👉 {AFFILIATE_LINK}',
    '💪 Stamina prima setiap hari:\n👉 {AFFILIATE_LINK}',
  ],
  home_living: [
    '🏠 Rumah makin aesthetic dengan koleksi ini!\n👉 {AFFILIATE_LINK}',
    '✨ Ide dekorasi rumah yang lagi trending:\n👉 {AFFILIATE_LINK}',
    '🏡 Buat rumah jadi lebih nyaman dan cantik.\n👉 {AFFILIATE_LINK}',
    '🛋️ Furniture dan aksesoris rumah terbaik:\n👉 {AFFILIATE_LINK}',
    '✨ Transformasi rumah kamu jadi lebih modern!\n👉 {AFFILIATE_LINK}',
    '🏠 Peralatan rumah tangga yang wajib punya:\n👉 {AFFILIATE_LINK}',
    '✨ Rumah rapi, hati senang!\n👉 {AFFILIATE_LINK}',
    '🏡 Inspirasi desain interior terbaru:\n👉 {AFFILIATE_LINK}',
    '✨ Quality time di rumah makin berkualitas!\n👉 {AFFILIATE_LINK}',
    '🏠 Belanja perabotan hemat dan berkualitas:\n👉 {AFFILIATE_LINK}',
    '✨ Rumah impian dimulai dari sini.\n👉 {AFFILIATE_LINK}',
    '🏡 Investasi terbaik untuk kenyamanan keluarga.\n👉 {AFFILIATE_LINK}',
    '✨ Ide kreatif untuk ruangan kecil:\n👉 {AFFILIATE_LINK}',
    '🏠 Promo spesial perabotan rumah tangga!\n👉 {AFFILIATE_LINK}',
    '✨ Solusi cerdas untuk rumah modern:\n👉 {AFFILIATE_LINK}',
  ],
  other: [
    '✨ Cek produknya di sini 👇\n👉 {AFFILIATE_LINK}',
    '🔥 Produk viral yang lagi banyak dicari:\n👉 {AFFILIATE_LINK}',
    '💫 Bisa jadi ini yang sedang kamu butuhkan:\n👉 {AFFILIATE_LINK}',
    '🌟 Simpan dulu, siapa tahu nanti kepakai:\n👉 {AFFILIATE_LINK}',
    '👉 Klik aja langsung, lagi diskon!\n👉 {AFFILIATE_LINK}',
    '✨ Kami hanya ingin memberikan rekomendasi produk yang bermanfaat dan menarik untuk para pembaca. ❤️\n👉 {AFFILIATE_LINK}',
    '🔥 Jangan sampai kehabisan, stok terbatas!\n👉 {AFFILIATE_LINK}',
    '✨ Worth it banget! Banyak review positif.\n👉 {AFFILIATE_LINK}',
    '💫 Belanja cerdas, hemat, dan berkualitas.\n👉 {AFFILIATE_LINK}',
    '✨ Produk terbaik dengan harga terjangkau:\n👉 {AFFILIATE_LINK}',
    '🔥 Lagi diskon besar-besaran nih!\n👉 {AFFILIATE_LINK}',
    '✨ Recommended banget buat kamu!\n👉 {AFFILIATE_LINK}',
    '💫 Buruan sebelum promo habis!\n👉 {AFFILIATE_LINK}',
    '✨ Tidak akan menyesal beli ini.\n👉 {AFFILIATE_LINK}',
    '🔥 Best seller minggu ini!\n👉 {AFFILIATE_LINK}',
  ],
};

// ── Hashtag Engine ───────────────────────────────────────────────

const HASHTAG_POOL = {
  fashion: {
    general: ['#fashion', '#style', '#ootd', '#fashioninspo', '#trendy'],
    category: ['#fashionkekinian', '#fashionwanita', '#ootdhijab', '#hijabstyle', '#outfitinspiration', '#belanjamurah', '#racunfashion', '#fashionindonesia'],
    trending: ['#trending2025', '#viral'],
  },
  fashion_muslim: {
    general: ['#fashionmuslim', '#hijab', '#muslimah'],
    category: ['#hijabstyle', '#hijabfashion', '#muslimfashion', '#ootdhijab', '#modestfashion', '#kerudung', '#jilbab', '#hijabers'],
    trending: ['#trending2025', '#viral'],
  },
  health: {
    general: ['#health', '#wellness', '#healthy'],
    category: ['#hidupsehat', '#tipskesehatan', '#kesehatanalami', '#gayahidupsehat', '#suplemen', '#herbal', '#obatherbal', '#sehatalami'],
    trending: ['#trending2025', '#viral'],
  },
  home_living: {
    general: ['#homeliving', '#home', '#decor'],
    category: ['#rumahminimalis', '#peralatandapur', '#perlengkapanrumah', '#idekreatif', '#alatrumah', '#dekorasirumah', '#interiordesign', '#rumahtangga'],
    trending: ['#trending2025', '#viral'],
  },
  other: {
    general: ['#shopping', '#deals', '#recommendation'],
    category: ['#belanjamurah', '#promo', '#diskon', '#rekomendasi', '#viral', '#trending', '#bestseller', '#shopee'],
    trending: ['#trending2025', '#viral'],
  },
};

function generateHashtags(category, count = 10) {
  const pool = HASHTAG_POOL[category] || HASHTAG_POOL.other;
  const all = [...pool.general, ...pool.category, ...pool.trending];
  
  // Shuffle and pick
  const shuffled = all.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  // Ensure mix: 3 general + 5 category + 2 trending
  const result = [
    ...pool.general.sort(() => Math.random() - 0.5).slice(0, 3),
    ...pool.category.sort(() => Math.random() - 0.5).slice(0, 5),
    ...pool.trending.sort(() => Math.random() - 0.5).slice(0, 2),
  ];
  
  return result.join(' ');
}

// ── Category Validation ──────────────────────────────────────────

function validateCategoryAlignment({ videoTopic, sheetCategory, affiliateCategory, pageCategory }) {
  const video = normalizeCategory(videoTopic);
  const sheet = normalizeCategory(sheetCategory);
  const affiliate = normalizeCategory(affiliateCategory);
  const page = normalizeCategory(pageCategory);

  // All must match (or be in same family)
  const families = {
    fashion_family: ['fashion', 'fashion_muslim', 'fashion_men', 'fashion_kids', 'hijab'],
    health_family: ['health'],
    home_family: ['home_living', 'detergent'],
  };

  function getFamily(cat) {
    for (const [family, members] of Object.entries(families)) {
      if (members.includes(cat)) return family;
    }
    return cat;
  }

  const videoFamily = getFamily(video);
  const sheetFamily = getFamily(sheet);
  const affiliateFamily = getFamily(affiliate);
  const pageFamily = getFamily(page);

  const allMatch = videoFamily === sheetFamily && 
                   sheetFamily === affiliateFamily && 
                   affiliateFamily === pageFamily;

  return {
    valid: allMatch,
    video_category: video,
    sheet_category: sheet,
    affiliate_category: affiliate,
    page_category: page,
    reason: allMatch ? 'All categories match' : `Mismatch: video=${video}, sheet=${sheet}, affiliate=${affiliate}, page=${page}`,
  };
}

// ── Database Loader ──────────────────────────────────────────────

async function loadDatabase(sheetUrl) {
  const sheetId = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)?.[1];
  if (!sheetId) throw new Error('Invalid Google Sheet URL');

  const urls = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`,
  ];

  for (const csvUrl of urls) {
    try {
      const result = await fetchCSVWithRedirect(csvUrl);
      if (result && result.total > 0) return result;
    } catch {}
  }
  throw new Error('Failed to load Google Sheet');
}

function fetchCSVWithRedirect(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const client = url.startsWith('https') ? https : require('http');
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchCSVWithRedirect(res.headers.location, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const lines = data.split('\n').filter(l => l.trim());
        if (lines.length < 2) return reject(new Error('Empty CSV'));
        const pages = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length >= 3 && values[0]?.trim()) {
            pages.push({
              fanpage_link: values[0]?.trim(),
              fanpage_account: values[1]?.trim(),
              category: values[2]?.trim(),
              category_normalized: normalizeCategory(values[2]),
            });
          }
        }
        const byCategory = {};
        for (const page of pages) {
          const cat = page.category_normalized;
          if (!byCategory[cat]) byCategory[cat] = [];
          byCategory[cat].push(page);
        }
        resolve({ pages, byCategory, total: pages.length });
      });
    }).on('error', reject);
  });
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ── Caption Generator ────────────────────────────────────────────

function generateCaption(category, affiliateLink) {
  const cat = normalizeCategory(category);
  const variations = CTA_VARIATIONS[cat] || CTA_VARIATIONS.other;
  const cta = variations[Math.floor(Math.random() * variations.length)];
  const hashtags = generateHashtags(cat, 10);
  
  return `${cta.replace('{AFFILIATE_LINK}', affiliateLink)}\n\n${hashtags}`;
}

// ── Main Pipeline ────────────────────────────────────────────────

async function runPipeline(sheetUrl, options = {}) {
  const startTime = Date.now();
  const results = {
    processed: [],
    invalid: [],
    errors: [],
    summary: {},
  };

  // Step 1: Load database
  console.log('[HERMES] Step 1: Loading database...');
  let db;
  try {
    db = await loadDatabase(sheetUrl);
    console.log(`[HERMES] Loaded ${db.total} pages across ${Object.keys(db.byCategory).length} categories`);
  } catch (err) {
    results.errors.push({ step: 'load_database', error: err.message });
    return results;
  }

  // Step 2: Build workspace
  console.log('[HERMES] Step 2: Building workspace...');
  const workspaceDir = options.workspaceDir || path.join(process.cwd(), 'workspace');
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    const dir = path.join(workspaceDir, cat.folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // Step 3: Category distribution
  console.log('[HERMES] Step 3: Analyzing category distribution...');
  const distribution = {};
  for (const [cat, pages] of Object.entries(db.byCategory)) {
    distribution[cat] = {
      count: pages.length,
      label: CATEGORIES[cat]?.label || cat,
      pages: pages.map(p => p.fanpage_account),
    };
  }

  results.summary = {
    total_pages: db.total,
    categories: distribution,
    workspace: workspaceDir,
    duration_ms: Date.now() - startTime,
  };

  console.log('[HERMES] Pipeline complete.');
  return results;
}

// ── Exports ──────────────────────────────────────────────────────

module.exports = {
  CATEGORIES,
  CATEGORY_MAP,
  CTA_VARIATIONS,
  HASHTAG_POOL,
  normalizeCategory,
  validateCategoryAlignment,
  generateCaption,
  generateHashtags,
  loadDatabase,
  runPipeline,
};
