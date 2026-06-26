/**
 * Campaign Template Library
 *
 * 20 pre-built campaign configurations for quick-start workflows.
 * Templates are grouped by campaign type (category) and ordered
 * consistently within each group.
 *
 * Schema per template:
 *   id               – kebab-case unique identifier
 *   name             – display name
 *   icon             – emoji
 *   category         – 'direct_link' | 'landing_page' | 'smartlink' |
 *                      'email' | 'push' | 'social' | 'native'
 *   description      – one-line summary
 *   trafficSource    – traffic platform name
 *   vertical         – offer vertical / niche
 *   defaultConfig    – campaign defaults:
 *       costModel    – 'CPC' | 'CPM' | 'CPA' | 'CPI' | 'Smart'
 *       bidStrategy  – 'lowest_cost' | 'target_cpa' | 'manual' |
 *                      'max_conversions' | 'auto'
 *       dailyBudget  – recommended daily budget (USD)
 *       targeting    – { geo, device, os, browser }
 *       schedule     – flight dates / hours description
 *       rotationModel– 'even' | 'weighted' | 'auto_optimize'
 *   recommendedOffers– offer types that pair well
 *   estimatedROI     – expected return range
 *   difficulty       – 'beginner' | 'intermediate' | 'advanced'
 */

const campaignTemplates = [

  // ─── DIRECT LINKING ──────────────────────────────────────────

  {
    id: 'meta-sweepstakes-soi-direct',
    name: 'Meta Ads → Sweepstakes SOI',
    icon: '📘',
    category: 'direct_link',
    description: 'Facebook/Instagram direct-link sweepstakes with single-opt-in flow – fast approvals and broad geo reach.',
    trafficSource: 'Meta Ads',
    vertical: 'Sweepstakes',
    defaultConfig: {
      costModel: 'CPC',
      bidStrategy: 'lowest_cost',
      dailyBudget: 50,
      targeting: {
        geo: ['US', 'CA', 'GB', 'AU'],
        device: ['mobile', 'desktop'],
        os: ['iOS', 'Android', 'Windows', 'macOS'],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'],
      },
      schedule: 'Run continuously; pause 2-6 AM local time to save budget on low-converting hours.',
      rotationModel: 'auto_optimize',
    },
    recommendedOffers: ['sweepstakes-soi', 'sweepstakes-moh', 'email-submit', 'gift-card'],
    estimatedROI: '150-300%',
    difficulty: 'beginner',
  },

  {
    id: 'google-finance-cpa-direct',
    name: 'Google Ads → Finance CPA',
    icon: '🔍',
    category: 'direct_link',
    description: 'Search campaigns targeting high-intent finance keywords with CPA payouts on lead submission.',
    trafficSource: 'Google Ads',
    vertical: 'Finance',
    defaultConfig: {
      costModel: 'CPC',
      bidStrategy: 'target_cpa',
      dailyBudget: 100,
      targeting: {
        geo: ['US', 'CA', 'GB'],
        device: ['desktop', 'mobile'],
        os: ['Windows', 'macOS', 'iOS', 'Android'],
        browser: ['Chrome', 'Safari', 'Edge', 'Firefox'],
      },
      schedule: 'Run 6 AM–11 PM weekdays; reduce bids 30% on weekends when intent drops.',
      rotationModel: 'auto_optimize',
    },
    recommendedOffers: ['finance-lead', 'insurance-quote', 'credit-card', 'loan-application'],
    estimatedROI: '200-400%',
    difficulty: 'advanced',
  },

  {
    id: 'tiktok-mobile-cpi-direct',
    name: 'TikTok → Mobile CPI',
    icon: '🎵',
    category: 'direct_link',
    description: 'In-feed TikTok video ads driving app installs on CPI offers – high CTR with native-style creatives.',
    trafficSource: 'TikTok Ads',
    vertical: 'Mobile CPI',
    defaultConfig: {
      costModel: 'CPI',
      bidStrategy: 'lowest_cost',
      dailyBudget: 80,
      targeting: {
        geo: ['US', 'BR', 'MX', 'ID', 'PH'],
        device: ['mobile'],
        os: ['iOS 15+', 'Android 10+'],
        browser: ['TikTok in-app'],
      },
      schedule: 'Run 24/7; peak performance 7-10 PM user local time.',
      rotationModel: 'auto_optimize',
    },
    recommendedOffers: ['mobile-cpi', 'game-install', 'app-install', 'utility-app'],
    estimatedROI: '120-250%',
    difficulty: 'intermediate',
  },

  {
    id: 'bing-insurance-lead-direct',
    name: 'Bing Ads → Insurance Lead',
    icon: '🔎',
    category: 'direct_link',
    description: 'Bing search campaigns targeting insurance-intent keywords – lower CPC than Google with older, high-income demographics.',
    trafficSource: 'Bing Ads',
    vertical: 'Insurance',
    defaultConfig: {
      costModel: 'CPC',
      bidStrategy: 'target_cpa',
      dailyBudget: 75,
      targeting: {
        geo: ['US'],
        device: ['desktop', 'mobile'],
        os: ['Windows', 'macOS', 'iOS', 'Android'],
        browser: ['Edge', 'Chrome', 'Firefox', 'Safari'],
      },
      schedule: 'Run 7 AM–10 PM EST weekdays; reduce bids 20% on weekends.',
      rotationModel: 'auto_optimize',
    },
    recommendedOffers: ['insurance-lead', 'auto-insurance', 'health-insurance', 'life-insurance'],
    estimatedROI: '180-350%',
    difficulty: 'intermediate',
  },

  // ─── LANDING PAGE ────────────────────────────────────────────

  {
    id: 'propellerads-push-lp-cpa',
    name: 'PropellerAds Push → LP → CPA',
    icon: '🔔',
    category: 'landing_page',
    description: 'Push notification traffic through a pre-lander to a CPA offer – proven format for broad GEO sweeps.',
    trafficSource: 'PropellerAds',
    vertical: 'Sweepstakes',
    defaultConfig: {
      costModel: 'CPM',
      bidStrategy: 'manual',
      dailyBudget: 40,
      targeting: {
        geo: ['US', 'DE', 'FR', 'IT', 'ES', 'BR'],
        device: ['mobile', 'desktop'],
        os: ['Android', 'Windows'],
        browser: ['Chrome', 'Firefox', 'Samsung Browser'],
      },
      schedule: 'Run 24/7; increase bids during 8-11 AM and 6-10 PM local user peaks.',
      rotationModel: 'weighted',
    },
    recommendedOffers: ['sweepstakes-soi', 'sweepstakes-moh', 'voucher-offer', 'gift-card'],
    estimatedROI: '130-280%',
    difficulty: 'beginner',
  },

  {
    id: 'mgid-native-review-lp-cps',
    name: 'MGID Native → Review LP → CPS',
    icon: '📰',
    category: 'landing_page',
    description: 'Native ads on MGID driving to editorial-style review pages for CPS offers – high trust, strong conversions.',
    trafficSource: 'MGID',
    vertical: 'E-Commerce',
    defaultConfig: {
      costModel: 'CPC',
      bidStrategy: 'manual',
      dailyBudget: 60,
      targeting: {
        geo: ['US', 'CA', 'GB', 'AU', 'NZ'],
        device: ['desktop', 'mobile'],
        os: ['Windows', 'macOS', 'iOS', 'Android'],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'],
      },
      schedule: 'Run 24/7; test first 3 days at low bids, then scale winners.',
      rotationModel: 'auto_optimize',
    },
    recommendedOffers: ['cps-product', 'nutra-cps', 'subscription-box', 'supplement-offer'],
    estimatedROI: '140-320%',
    difficulty: 'intermediate',
  },

  {
    id: 'popads-prelander-sweepstakes',
    name: 'PopAds → Pre-lander → Sweepstakes',
    icon: '💥',
    category: 'landing_page',
    description: 'Pop-under traffic with a gamified pre-lander that warms up cold visitors before the sweepstakes SOI flow.',
    trafficSource: 'PopAds',
    vertical: 'Sweepstakes',
    defaultConfig: {
      costModel: 'CPM',
      bidStrategy: 'manual',
      dailyBudget: 30,
      targeting: {
        geo: ['US', 'GB', 'DE', 'FR', 'CA', 'AU'],
        device: ['desktop', 'mobile'],
        os: ['Windows', 'Android', 'macOS', 'iOS'],
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'],
      },
      schedule: 'Run 24/7; cap frequency at 1 impression per user per 24 hours.',
      rotationModel: 'even',
    },
    recommendedOffers: ['sweepstakes-soi', 'wheel-spin', 'iphone-giveaway', 'gift-card-sweeps'],
    estimatedROI: '100-250%',
    difficulty: 'beginner',
  },

  {
    id: 'richads-push-crypto-lp',
    name: 'RichAds Push → Crypto Offer',
    icon: '🚀',
    category: 'landing_page',
    description: 'Premium push traffic from RichAds through a crypto education pre-lander to a CPA crypto registration offer.',
    trafficSource: 'RichAds',
    vertical: 'Crypto',
    defaultConfig: {
      costModel: 'CPC',
      bidStrategy: 'manual',
      dailyBudget: 80,
      targeting: {
        geo: ['US', 'GB', 'AU', 'DE', 'SE', 'NL'],
        device: ['desktop', 'mobile'],
        os: ['Windows', 'macOS', 'iOS', 'Android'],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'],
      },
      schedule: 'Run 6 AM–midnight; target new subscriber lists for highest CTR.',
      rotationModel: 'weighted',
    },
    recommendedOffers: ['crypto-deposit', 'crypto-registration', 'crypto-trading', 'futures-signup'],
    estimatedROI: '160-350%',
    difficulty: 'advanced',
  },

  // ─── SMARTLINK ───────────────────────────────────────────────

  {
    id: 'smartlink-global-traffic',
    name: 'Smartlink Global Traffic',
    icon: '🌐',
    category: 'smartlink',
    description: 'One link for all GEOs and devices – AI-powered offer rotation maximises fill rate and global eCPM.',
    trafficSource: 'Mixed / Remnant',
    vertical: 'Multi-Vertical',
    defaultConfig: {
      costModel: 'Smart',
      bidStrategy: 'auto',
      dailyBudget: 30,
      targeting: {
        geo: ['ALL'],
        device: ['mobile', 'desktop', 'tablet'],
        os: ['iOS', 'Android', 'Windows', 'macOS', 'Linux'],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge', 'Samsung Browser', 'Opera'],
      },
      schedule: 'Run 24/7 no schedule restrictions – Smartlink self-optimises.',
      rotationModel: 'auto_optimize',
    },
    recommendedOffers: ['smartlink-multi', 'sweepstakes-soi', 'app-install', 'content-locker'],
    estimatedROI: '80-200%',
    difficulty: 'beginner',
  },

  {
    id: 'smartlink-tier1-premium',
    name: 'Smartlink Tier-1 Premium',
    icon: '🏆',
    category: 'smartlink',
    description: 'Smartlink restricted to Tier-1 GEOs for higher payouts – ideal for quality traffic sources with good user intent.',
    trafficSource: 'Mixed / Premium',
    vertical: 'Multi-Vertical',
    defaultConfig: {
      costModel: 'Smart',
      bidStrategy: 'auto',
      dailyBudget: 100,
      targeting: {
        geo: ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'SE', 'NO', 'DK'],
        device: ['desktop', 'mobile'],
        os: ['iOS 15+', 'Android 12+', 'Windows 10+', 'macOS 12+'],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'],
      },
      schedule: 'Run 24/7; Smartlink rotates to highest-EPC offers per GEO automatically.',
      rotationModel: 'auto_optimize',
    },
    recommendedOffers: ['smartlink-premium', 'finance-cpa', 'sweepstakes-moh', 'subscription'],
    estimatedROI: '120-280%',
    difficulty: 'intermediate',
  },

  {
    id: 'smartlink-mobile-only',
    name: 'Smartlink Mobile Only',
    icon: '📱',
    category: 'smartlink',
    description: 'Mobile-optimised Smartlink for carrier traffic, in-app pops, and mobile redirect inventory.',
    trafficSource: 'Mobile Networks',
    vertical: 'Mobile',
    defaultConfig: {
      costModel: 'Smart',
      bidStrategy: 'auto',
      dailyBudget: 40,
      targeting: {
        geo: ['ALL'],
        device: ['mobile'],
        os: ['Android 8+', 'iOS 14+'],
        browser: ['Chrome', 'Safari', 'Samsung Browser', 'UC Browser'],
      },
      schedule: 'Run 24/7; carrier targeting available per GEO for 3G/4G/5G traffic.',
      rotationModel: 'auto_optimize',
    },
    recommendedOffers: ['mobile-cpi', 'app-install', 'vas-subscription', 'sweepstakes-soi'],
    estimatedROI: '100-220%',
    difficulty: 'beginner',
  },

  // ─── EMAIL ───────────────────────────────────────────────────

  {
    id: 'email-blast-sweeps-soi',
    name: 'Email Blast → SOI Sweepstakes',
    icon: '📧',
    category: 'email',
    description: 'High-volume email blast to opted-in lists with sweepstakes SOI creative – fast volume, simple conversion.',
    trafficSource: 'Email (Self-Hosted)',
    vertical: 'Sweepstakes',
    defaultConfig: {
      costModel: 'CPM',
      bidStrategy: 'manual',
      dailyBudget: 25,
      targeting: {
        geo: ['US', 'CA', 'GB'],
        device: ['desktop', 'mobile'],
        os: ['all'],
        browser: ['all'],
      },
      schedule: 'Send Tuesday–Thursday 8-11 AM recipient local time for best open rates.',
      rotationModel: 'even',
    },
    recommendedOffers: ['sweepstakes-soi', 'email-submit', 'gift-card', 'iphone-giveaway'],
    estimatedROI: '200-500%',
    difficulty: 'beginner',
  },

  {
    id: 'email-drip-finance-cpa',
    name: 'Email Drip → Finance CPA',
    icon: '💰',
    category: 'email',
    description: 'Automated multi-touch email sequence nurturing leads toward finance CPA conversions – high trust, high payout.',
    trafficSource: 'Email (Self-Hosted)',
    vertical: 'Finance',
    defaultConfig: {
      costModel: 'CPA',
      bidStrategy: 'manual',
      dailyBudget: 50,
      targeting: {
        geo: ['US', 'CA', 'GB', 'AU'],
        device: ['desktop', 'mobile'],
        os: ['all'],
        browser: ['all'],
      },
      schedule: '5-email drip over 10 days; Day 1 value, Day 3 social proof, Day 5 urgency, Day 7 FAQ, Day 10 final CTA.',
      rotationModel: 'even',
    },
    recommendedOffers: ['finance-lead', 'credit-score', 'loan-application', 'investment-signup'],
    estimatedROI: '250-600%',
    difficulty: 'advanced',
  },

  {
    id: 'email-newsletter-cps',
    name: 'Email Newsletter → CPS Offer',
    icon: '📰',
    category: 'email',
    description: 'Monetise a content newsletter with contextual CPS offer placements – organic trust drives high conversion rates.',
    trafficSource: 'Email (Self-Hosted)',
    vertical: 'E-Commerce',
    defaultConfig: {
      costModel: 'CPS',
      bidStrategy: 'manual',
      dailyBudget: 20,
      targeting: {
        geo: ['US', 'CA', 'GB', 'AU', 'NZ'],
        device: ['desktop', 'mobile'],
        os: ['all'],
        browser: ['all'],
      },
      schedule: 'Send weekly on Tuesday 9 AM recipient time; embed 2-3 contextual offers per issue.',
      rotationModel: 'weighted',
    },
    recommendedOffers: ['cps-product', 'subscription-box', 'digital-course', 'saas-trial'],
    estimatedROI: '300-800%',
    difficulty: 'intermediate',
  },

  // ─── SOCIAL ──────────────────────────────────────────────────

  {
    id: 'facebook-organic-ecommerce',
    name: 'Facebook Organic → E-commerce',
    icon: '👥',
    category: 'social',
    description: 'Organic Facebook group and page posts linking to e-commerce offers – zero ad spend, community-driven trust.',
    trafficSource: 'Facebook Organic',
    vertical: 'E-Commerce',
    defaultConfig: {
      costModel: 'CPC',
      bidStrategy: 'manual',
      dailyBudget: 0,
      targeting: {
        geo: ['US', 'CA', 'GB', 'AU'],
        device: ['mobile', 'desktop'],
        os: ['iOS', 'Android', 'Windows', 'macOS'],
        browser: ['Chrome', 'Safari', 'Facebook in-app'],
      },
      schedule: 'Post 3-5 times/week at 9 AM, 12 PM, and 7 PM; test carousel vs single image.',
      rotationModel: 'even',
    },
    recommendedOffers: ['cps-product', 'dropship', 'print-on-demand', 'digital-product'],
    estimatedROI: '400-1000%',
    difficulty: 'beginner',
  },

  {
    id: 'instagram-story-dating',
    name: 'Instagram Story → Dating',
    icon: '📸',
    category: 'social',
    description: 'Swipe-up story ads and bio link promoting dating offers – high engagement vertical for IG audience.',
    trafficSource: 'Instagram',
    vertical: 'Dating',
    defaultConfig: {
      costModel: 'CPC',
      bidStrategy: 'manual',
      dailyBudget: 35,
      targeting: {
        geo: ['US', 'GB', 'AU', 'CA', 'DE'],
        device: ['mobile'],
        os: ['iOS 15+', 'Android 10+'],
        browser: ['Instagram in-app'],
      },
      schedule: 'Post stories 6-9 PM local time; leverage swipe-up on days with highest engagement.',
      rotationModel: 'even',
    },
    recommendedOffers: ['dating-sweep', 'dating-cpa', 'adult-dating', 'match-signup'],
    estimatedROI: '150-350%',
    difficulty: 'intermediate',
  },

  {
    id: 'youtube-desc-saas-trial',
    name: 'YouTube Description → SaaS Trial',
    icon: '▶️',
    category: 'social',
    description: 'Affiliate links in YouTube video descriptions driving SaaS free trial sign-ups – long-tail passive commissions.',
    trafficSource: 'YouTube Organic',
    vertical: 'SaaS',
    defaultConfig: {
      costModel: 'CPA',
      bidStrategy: 'manual',
      dailyBudget: 0,
      targeting: {
        geo: ['US', 'CA', 'GB', 'AU', 'IN'],
        device: ['desktop', 'mobile'],
        os: ['Windows', 'macOS', 'iOS', 'Android', 'Linux'],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'],
      },
      schedule: 'Publish videos weekly; pin affiliate link as first comment and in description with timestamp.',
      rotationModel: 'even',
    },
    recommendedOffers: ['saas-trial', 'saas-freemium', 'tool-signup', 'digital-product'],
    estimatedROI: '500-1500%',
    difficulty: 'beginner',
  },

  // ─── NATIVE ──────────────────────────────────────────────────

  {
    id: 'taboola-content-health',
    name: 'Taboola Content → Health Offer',
    icon: '📰',
    category: 'native',
    description: 'Taboola native ads with editorial-style content promoting health and nutra CPS offers – high trust, strong LTV.',
    trafficSource: 'Taboola',
    vertical: 'Health / Nutra',
    defaultConfig: {
      costModel: 'CPC',
      bidStrategy: 'manual',
      dailyBudget: 75,
      targeting: {
        geo: ['US', 'CA', 'GB', 'AU'],
        device: ['desktop', 'mobile'],
        os: ['Windows', 'macOS', 'iOS', 'Android'],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'],
      },
      schedule: 'Run 24/7; test multiple creatives first 48 hours, then blacklist low-CTR placements.',
      rotationModel: 'auto_optimize',
    },
    recommendedOffers: ['nutra-cps', 'supplement', 'health-subscription', 'wellness-product'],
    estimatedROI: '130-280%',
    difficulty: 'intermediate',
  },

  {
    id: 'outbrain-editorial-finance',
    name: 'Outbrain Editorial → Finance',
    icon: '📝',
    category: 'native',
    description: 'Outbrain premium native network with financial editorial content driving qualified finance leads.',
    trafficSource: 'Outbrain',
    vertical: 'Finance',
    defaultConfig: {
      costModel: 'CPC',
      bidStrategy: 'manual',
      dailyBudget: 100,
      targeting: {
        geo: ['US', 'CA', 'GB'],
        device: ['desktop', 'mobile'],
        os: ['Windows', 'macOS', 'iOS', 'Android'],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'],
      },
      schedule: 'Run 6 AM–midnight; higher bids Mon–Thu when finance intent peaks.',
      rotationModel: 'weighted',
    },
    recommendedOffers: ['finance-lead', 'credit-card', 'investment-signup', 'loan-application'],
    estimatedROI: '160-320%',
    difficulty: 'advanced',
  },

  {
    id: 'revcontent-crypto-offer',
    name: 'RevContent → Crypto Offer',
    icon: '🪙',
    category: 'native',
    description: 'RevContent native widgets promoting crypto exchange and trading offers through educational content pages.',
    trafficSource: 'RevContent',
    vertical: 'Crypto',
    defaultConfig: {
      costModel: 'CPC',
      bidStrategy: 'manual',
      dailyBudget: 60,
      targeting: {
        geo: ['US', 'GB', 'AU', 'CA', 'DE', 'NL'],
        device: ['desktop', 'mobile'],
        os: ['Windows', 'macOS', 'iOS', 'Android'],
        browser: ['Chrome', 'Safari', 'Firefox', 'Edge'],
      },
      schedule: 'Run 24/7; blacklist low-ROI widget IDs after 1000 impressions each.',
      rotationModel: 'weighted',
    },
    recommendedOffers: ['crypto-registration', 'crypto-deposit', 'crypto-trading', 'futures-signup'],
    estimatedROI: '140-300%',
    difficulty: 'advanced',
  },
];

export default campaignTemplates;
