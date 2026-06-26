/**
 * Smartlink Templates
 *
 * Pre-configured smartlink templates that rotate multiple offers per
 * geo/device/vertical segment. Each template ships sensible defaults
 * for caps, day-parting, and auto-optimisation so affiliates can
 * activate a link in seconds.
 *
 * Fields per template:
 *   id              – kebab-case unique identifier
 *   name            – human-readable display name
 *   icon            – emoji icon
 *   category        – 'global' | 'geo_targeted' | 'device_specific'
 *                   | 'vertical_specific' | 'premium'
 *   description     – one-line summary
 *   rotationModel   – 'even' | 'weighted' | 'performance' | 'sequential'
 *   geoTargets      – array of ISO 3166-1 alpha-2 country codes, or 'WW'
 *   deviceTarget    – 'all' | 'mobile' | 'desktop'
 *   verticals       – array of vertical slugs this smartlink targets
 *   fallbackUrl     – example fallback URL
 *   offersPerGeo    – number of offers to rotate per geo segment
 *   estimatedEPC    – string like '$0.05-$0.15'
 *   configuration   – { autoOptimize, minClicks, pauseBelowCR, dayParting,
 *                       caps: { daily, hourly } }
 */

const smartlinkTemplates = [

  // ──────────────────────────────────────────────────────────────
  //  GLOBAL
  // ──────────────────────────────────────────────────────────────

  {
    id: 'global-smartlink-ww',
    name: 'Global Smartlink WW',
    icon: '🌍',
    category: 'global',
    description: 'Worldwide smartlink that auto-optimises offers across every geo and device type.',
    rotationModel: 'performance',
    geoTargets: ['WW'],
    deviceTarget: 'all',
    verticals: ['sweepstakes', 'ecommerce', 'finance', 'gaming', 'utilities', 'dating'],
    fallbackUrl: 'https://example.com/offers/global-fallback',
    offersPerGeo: 5,
    estimatedEPC: '$0.03-$0.10',
    configuration: {
      autoOptimize: true,
      minClicks: 100,
      pauseBelowCR: 0.5,
      dayParting: false,
      caps: { daily: 10000, hourly: 1000 },
    },
  },

  {
    id: 'global-tier1-premium',
    name: 'Global Tier-1 Premium',
    icon: '🏆',
    category: 'global',
    description: 'High-EPC smartlink targeting Tier-1 geos with premium offers and strict quality filters.',
    rotationModel: 'weighted',
    geoTargets: ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO', 'DK', 'FI', 'NZ'],
    deviceTarget: 'all',
    verticals: ['finance', 'insurance', 'saas', 'sweepstakes', 'ecommerce'],
    fallbackUrl: 'https://example.com/offers/tier1-premium-fallback',
    offersPerGeo: 8,
    estimatedEPC: '$0.10-$0.30',
    configuration: {
      autoOptimize: true,
      minClicks: 200,
      pauseBelowCR: 1.0,
      dayParting: true,
      caps: { daily: 5000, hourly: 500 },
    },
  },

  {
    id: 'global-tier2-3-volume',
    name: 'Global Tier-2/3 Volume',
    icon: '📈',
    category: 'global',
    description: 'High-volume smartlink optimized for Tier-2 and Tier-3 geos with fast-converting offers.',
    rotationModel: 'performance',
    geoTargets: [
      'IN', 'ID', 'PH', 'BD', 'PK', 'NG', 'EG', 'VN', 'BR', 'MX',
      'CO', 'AR', 'TH', 'MY', 'PL', 'RO', 'UA', 'ZA', 'KE', 'GH',
    ],
    deviceTarget: 'all',
    verticals: ['sweepstakes', 'gaming', 'ecommerce', 'utilities', 'mobile_content'],
    fallbackUrl: 'https://example.com/offers/tier2-3-volume-fallback',
    offersPerGeo: 10,
    estimatedEPC: '$0.01-$0.06',
    configuration: {
      autoOptimize: true,
      minClicks: 50,
      pauseBelowCR: 0.3,
      dayParting: false,
      caps: { daily: 50000, hourly: 5000 },
    },
  },

  // ──────────────────────────────────────────────────────────────
  //  GEO TARGETED
  // ──────────────────────────────────────────────────────────────

  {
    id: 'us-uk-ca-au-smartlink',
    name: 'US/UK/CA/AU Smartlink',
    icon: '🇺🇸',
    category: 'geo_targeted',
    description: 'Anglosphere smartlink with high-payout offers across US, UK, Canada, and Australia.',
    rotationModel: 'weighted',
    geoTargets: ['US', 'UK', 'CA', 'AU'],
    deviceTarget: 'all',
    verticals: ['finance', 'insurance', 'sweepstakes', 'ecommerce', 'saas'],
    fallbackUrl: 'https://example.com/offers/anglosphere-fallback',
    offersPerGeo: 8,
    estimatedEPC: '$0.12-$0.35',
    configuration: {
      autoOptimize: true,
      minClicks: 200,
      pauseBelowCR: 1.0,
      dayParting: true,
      caps: { daily: 8000, hourly: 800 },
    },
  },

  {
    id: 'sea-smartlink',
    name: 'ID/MY/TH/PH SEA Smartlink',
    icon: '🌴',
    category: 'geo_targeted',
    description: 'Southeast Asia smartlink with Shopee, Lazada, and mobile-first offers for ID, MY, TH, PH.',
    rotationModel: 'performance',
    geoTargets: ['ID', 'MY', 'TH', 'PH'],
    deviceTarget: 'mobile',
    verticals: ['ecommerce', 'gaming', 'mobile_content', 'fintech', 'sweepstakes'],
    fallbackUrl: 'https://example.com/offers/sea-fallback',
    offersPerGeo: 6,
    estimatedEPC: '$0.02-$0.08',
    configuration: {
      autoOptimize: true,
      minClicks: 80,
      pauseBelowCR: 0.4,
      dayParting: false,
      caps: { daily: 20000, hourly: 2000 },
    },
  },

  {
    id: 'eu-smartlink',
    name: 'DE/FR/IT/ES EU Smartlink',
    icon: '🇪🇺',
    category: 'geo_targeted',
    description: 'Western Europe smartlink with localized offers for Germany, France, Italy, and Spain.',
    rotationModel: 'weighted',
    geoTargets: ['DE', 'FR', 'IT', 'ES'],
    deviceTarget: 'all',
    verticals: ['ecommerce', 'finance', 'insurance', 'sweepstakes', 'travel'],
    fallbackUrl: 'https://example.com/offers/eu-fallback',
    offersPerGeo: 7,
    estimatedEPC: '$0.08-$0.22',
    configuration: {
      autoOptimize: true,
      minClicks: 150,
      pauseBelowCR: 0.8,
      dayParting: true,
      caps: { daily: 6000, hourly: 600 },
    },
  },

  // ──────────────────────────────────────────────────────────────
  //  DEVICE SPECIFIC
  // ──────────────────────────────────────────────────────────────

  {
    id: 'mobile-only-smartlink',
    name: 'Mobile Only Smartlink',
    icon: '📱',
    category: 'device_specific',
    description: 'Mobile-only smartlink for app installs, mobile content, and carrier billing offers.',
    rotationModel: 'performance',
    geoTargets: ['WW'],
    deviceTarget: 'mobile',
    verticals: ['app_installs', 'mobile_content', 'gaming', 'utilities', 'sweepstakes'],
    fallbackUrl: 'https://example.com/offers/mobile-only-fallback',
    offersPerGeo: 6,
    estimatedEPC: '$0.02-$0.09',
    configuration: {
      autoOptimize: true,
      minClicks: 80,
      pauseBelowCR: 0.5,
      dayParting: false,
      caps: { daily: 30000, hourly: 3000 },
    },
  },

  {
    id: 'desktop-only-smartlink',
    name: 'Desktop Only Smartlink',
    icon: '🖥️',
    category: 'device_specific',
    description: 'Desktop-only smartlink focused on finance, SaaS, and high-value lead gen offers.',
    rotationModel: 'weighted',
    geoTargets: ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'NL'],
    deviceTarget: 'desktop',
    verticals: ['finance', 'saas', 'insurance', 'b2b', 'trading'],
    fallbackUrl: 'https://example.com/offers/desktop-only-fallback',
    offersPerGeo: 5,
    estimatedEPC: '$0.15-$0.40',
    configuration: {
      autoOptimize: true,
      minClicks: 150,
      pauseBelowCR: 1.0,
      dayParting: true,
      caps: { daily: 3000, hourly: 300 },
    },
  },

  // ──────────────────────────────────────────────────────────────
  //  VERTICAL SPECIFIC
  // ──────────────────────────────────────────────────────────────

  {
    id: 'sweepstakes-smartlink',
    name: 'Sweepstakes Smartlink',
    icon: '🎰',
    category: 'vertical_specific',
    description: 'Auto-optimized sweepstakes smartlink that rotates SOI/DOI flows based on conversion rate.',
    rotationModel: 'performance',
    geoTargets: ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'BR', 'MX', 'ID', 'PH'],
    deviceTarget: 'all',
    verticals: ['sweepstakes'],
    fallbackUrl: 'https://example.com/offers/sweepstakes-fallback',
    offersPerGeo: 8,
    estimatedEPC: '$0.04-$0.15',
    configuration: {
      autoOptimize: true,
      minClicks: 80,
      pauseBelowCR: 0.5,
      dayParting: false,
      caps: { daily: 15000, hourly: 1500 },
    },
  },

  {
    id: 'ecommerce-smartlink',
    name: 'E-Commerce Smartlink',
    icon: '🛒',
    category: 'vertical_specific',
    description: 'E-commerce smartlink with Shopee, Lazada, Amazon, and regional marketplace offers.',
    rotationModel: 'weighted',
    geoTargets: ['WW'],
    deviceTarget: 'all',
    verticals: ['ecommerce'],
    fallbackUrl: 'https://example.com/offers/ecommerce-fallback',
    offersPerGeo: 6,
    estimatedEPC: '$0.03-$0.12',
    configuration: {
      autoOptimize: true,
      minClicks: 100,
      pauseBelowCR: 0.4,
      dayParting: true,
      caps: { daily: 20000, hourly: 2000 },
    },
  },

  // ──────────────────────────────────────────────────────────────
  //  PREMIUM
  // ──────────────────────────────────────────────────────────────

  {
    id: 'premium-smartlink',
    name: 'Premium Smartlink',
    icon: '💎',
    category: 'premium',
    description: 'High-EPC smartlink with strict quality requirements — only top-performing offers qualify.',
    rotationModel: 'weighted',
    geoTargets: ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'NL', 'SE', 'NO'],
    deviceTarget: 'all',
    verticals: ['finance', 'insurance', 'saas', 'trading', 'b2b'],
    fallbackUrl: 'https://example.com/offers/premium-fallback',
    offersPerGeo: 4,
    estimatedEPC: '$0.20-$0.50',
    configuration: {
      autoOptimize: true,
      minClicks: 300,
      pauseBelowCR: 2.0,
      dayParting: true,
      caps: { daily: 2000, hourly: 200 },
    },
  },

  {
    id: 'high-volume-smartlink',
    name: 'High-Volume Smartlink',
    icon: '🚀',
    category: 'premium',
    description: 'High-volume smartlink that accepts all traffic types and maximizes fill rate.',
    rotationModel: 'even',
    geoTargets: ['WW'],
    deviceTarget: 'all',
    verticals: ['sweepstakes', 'ecommerce', 'gaming', 'utilities', 'mobile_content', 'dating'],
    fallbackUrl: 'https://example.com/offers/high-volume-fallback',
    offersPerGeo: 12,
    estimatedEPC: '$0.01-$0.06',
    configuration: {
      autoOptimize: false,
      minClicks: 25,
      pauseBelowCR: 0.2,
      dayParting: false,
      caps: { daily: 100000, hourly: 10000 },
    },
  },
];

export default smartlinkTemplates;
