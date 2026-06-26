/**
 * Advertiser / CPA Network Template Library
 *
 * Each template defines:
 *   - id, name, icon, category, description, platformType
 *   - postbackUrl       – S2S postback template with network-specific macros
 *   - postbackParams    – { key, macro, description }[] for the network's macros
 *   - offerUrlFormat    – example offer URL with placeholders
 *   - supportedPayoutModels
 *   - region
 */

const advertiserTemplates = [
  // ─────────────────────────────────────────────────────────────
  //  CPA NETWORKS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'maxbounty',
    name: 'MaxBounty',
    icon: '💰',
    category: 'cpa',
    description: 'Leading CPA network with thousands of high-converting offers across all verticals.',
    platformType: 'maxbounty',
    postbackUrl:
      'https://postback.maxbounty.com/track?clickid={clickid}&payout={payout}&status={status}&affiliate_id={affiliate_id}&offer_id={offer_id}&transaction_id={transaction_id}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Unique click identifier passed on click' },
      { key: 'payout', macro: '{payout}', description: 'Conversion payout amount' },
      { key: 'status', macro: '{status}', description: 'Conversion status (approved/pending/rejected)' },
      { key: 'affiliate_id', macro: '{affiliate_id}', description: 'Affiliate ID' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'transaction_id', macro: '{transaction_id}', description: 'Unique transaction ID' },
    ],
    offerUrlFormat:
      'https://clicks.maxbounty.com/click?affid={aff_id}&offerid={offer_id}&clickid={click_id}&sub1={sub1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS', 'CPI'],
    region: 'global',
  },
  {
    id: 'peerfly',
    name: 'PeerFly',
    icon: '🦟',
    category: 'cpa',
    description: 'Performance-based affiliate network known for fast payments and dedicated support.',
    platformType: 'peerfly',
    postbackUrl:
      'https://postback.peerfly.com/conv?click_id={clickid}&payout={payout}&offer_id={offer_id}&affiliate_id={affiliate_id}&status={status}&ip={ip}',
    postbackParams: [
      { key: 'click_id', macro: '{clickid}', description: 'Click ID from the tracking link' },
      { key: 'payout', macro: '{payout}', description: 'Conversion payout' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer identifier' },
      { key: 'affiliate_id', macro: '{affiliate_id}', description: 'Affiliate identifier' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
      { key: 'ip', macro: '{ip}', description: 'User IP address' },
    ],
    offerUrlFormat:
      'https://trk.peerfly.com/click?aff_id={aff_id}&offer_id={offer_id}&clickid={click_id}&subid={sub_id}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS', 'CPI', 'RevShare'],
    region: 'us',
  },
  {
    id: 'clickdealer',
    name: 'ClickDealer',
    icon: '🎯',
    category: 'cpa',
    description: 'Global performance marketing network specializing in CPA, CPI, and CPL campaigns.',
    platformType: 'clickdealer',
    postbackUrl:
      'https://www.clickdealer.com/postback?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&adv_id={adv_id}&country={country}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Unique click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'adv_id', macro: '{adv_id}', description: 'Advertiser ID' },
      { key: 'country', macro: '{country}', description: 'Country code of the user' },
    ],
    offerUrlFormat:
      'https://cd.clickdealer.com/click?offer_id={offer_id}&aff_id={aff_id}&clickid={click_id}&subid={subid}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPI', 'RevShare'],
    region: 'global',
  },
  {
    id: 'advidi',
    name: 'Advidi',
    icon: '🅰️',
    category: 'cpa',
    description: 'Premium affiliate network focused on dating, health, and sweepstakes verticals.',
    platformType: 'advidi',
    postbackUrl:
      'https://postback.advidi.com/s2s?clickid={clickid}&payout={payout}&status={status}&offer={offer_id}&publisher={publisher_id}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout value' },
      { key: 'status', macro: '{status}', description: 'Approval status' },
      { key: 'offer', macro: '{offer_id}', description: 'Offer identifier' },
      { key: 'publisher', macro: '{publisher_id}', description: 'Publisher/affiliate ID' },
    ],
    offerUrlFormat:
      'https://go.advidi.com/click?offer={offer_id}&aff={aff_id}&clickid={click_id}&sub={sub}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS'],
    region: 'eu',
  },
  {
    id: 'mundomedia',
    name: 'MundoMedia',
    icon: '🌎',
    category: 'cpa',
    description: 'Mobile-first CPA network with global reach and advanced optimization tools.',
    platformType: 'mundomedia',
    postbackUrl:
      'https://postback.mundomedia.com?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&country={country}&device={device}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click ID' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status of conversion' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'country', macro: '{country}', description: 'User country' },
      { key: 'device', macro: '{device}', description: 'Device type' },
    ],
    offerUrlFormat:
      'https://trk.mundomedia.com/click?o={offer_id}&a={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPI', 'CPL'],
    region: 'global',
  },
  {
    id: 'mobidea',
    name: 'Mobidea',
    icon: '📱',
    category: 'cpa',
    description: 'Mobile CPA affiliate network with smart optimization and real-time analytics.',
    platformType: 'mobidea',
    postbackUrl:
      'https://postback.mobidea.com?click_id={clickid}&payout={payout}&status={status}&offer_id={offer_id}&affiliate_id={aff_id}&country={country}&operator={operator}',
    postbackParams: [
      { key: 'click_id', macro: '{clickid}', description: 'Click ID' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount in USD' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'affiliate_id', macro: '{aff_id}', description: 'Affiliate ID' },
      { key: 'country', macro: '{country}', description: 'Country code' },
      { key: 'operator', macro: '{operator}', description: 'Mobile carrier/operator' },
    ],
    offerUrlFormat:
      'https://go.mobidea.com/click?offer_id={offer_id}&aff_id={aff_id}&click_id={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPI', 'CPL', 'RevShare'],
    region: 'global',
  },
  {
    id: 'cpalead',
    name: 'CPAlead',
    icon: '🏆',
    category: 'cpa',
    description: 'Content-locking and CPA network with thousands of offers worldwide.',
    platformType: 'cpalead',
    postbackUrl:
      'https://www.cpalead.com/postback.php?clickid={clickid}&payout={payout}&status={status}&offerid={offer_id}&subid={subid}&ip={ip}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Unique click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
      { key: 'offerid', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'subid', macro: '{subid}', description: 'Sub ID for tracking' },
      { key: 'ip', macro: '{ip}', description: 'User IP address' },
    ],
    offerUrlFormat:
      'https://www.cpalead.com/click.php?offer_id={offer_id}&aff_id={aff_id}&clickid={click_id}&subid={subid}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPI'],
    region: 'global',
  },
  {
    id: 'ogads',
    name: 'OGAds',
    icon: '🔐',
    category: 'cpa',
    description: 'Mobile content-locking CPA network popular with social media affiliates.',
    platformType: 'ogads',
    postbackUrl:
      'https://ogads.com/postback?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&country={country}&device={device}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click ID' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status (1=approved, 0=pending)' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'country', macro: '{country}', description: 'Country code' },
      { key: 'device', macro: '{device}', description: 'Device type (mobile/desktop)' },
    ],
    offerUrlFormat:
      'https://ogads.com/click?offer={offer_id}&aff={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPI'],
    region: 'global',
  },
  {
    id: 'performcb',
    name: 'Perform[cb]',
    icon: '📊',
    category: 'cpa',
    description: 'Formerly Clickbooth. One of the largest performance marketing networks in the world.',
    platformType: 'performcb',
    postbackUrl:
      'https://postback.performcb.com?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&transaction_id={transaction_id}&aff_id={aff_id}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'transaction_id', macro: '{transaction_id}', description: 'Transaction ID' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
    ],
    offerUrlFormat:
      'https://go.performcb.com/click?offer_id={offer_id}&aff_id={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS', 'CPI', 'RevShare'],
    region: 'us',
  },
  {
    id: 'crakrevenue',
    name: 'CrakRevenue',
    icon: '💎',
    category: 'cpa',
    description: 'Premium adult and mainstream CPA network with exclusive offers and high payouts.',
    platformType: 'crakrevenue',
    postbackUrl:
      'https://postback.crakrevenue.com?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&aff_id={aff_id}&geo={geo}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click ID' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
      { key: 'geo', macro: '{geo}', description: 'Country code' },
    ],
    offerUrlFormat:
      'https://go.crakrevenue.com/click?o={offer_id}&a={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS', 'RevShare'],
    region: 'global',
  },
  {
    id: 'adcombo',
    name: 'AdCombo',
    icon: '⚡',
    category: 'cpa',
    description: 'CPA network specializing in COD (cash-on-delivery) offers across Tier-2 geos.',
    platformType: 'adcombo',
    postbackUrl:
      'https://postback.adcombo.com/track?click_id={clickid}&payout={payout}&status={status}&offer_id={offer_id}&country={country}&sub1={sub1}',
    postbackParams: [
      { key: 'click_id', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status (1=approved, 0=hold/rejected)' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'country', macro: '{country}', description: 'Country code' },
      { key: 'sub1', macro: '{sub1}', description: 'Sub tracking parameter 1' },
    ],
    offerUrlFormat:
      'https://go.adcombo.com/click?offer={offer_id}&aff={aff_id}&click_id={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS'],
    region: 'global',
  },
  {
    id: 'adworkmedia',
    name: 'AdWorkMedia',
    icon: '🛠️',
    category: 'cpa',
    description: 'Content-locking and CPA monetization platform with global offers.',
    platformType: 'adworkmedia',
    postbackUrl:
      'https://www.adworkmedia.com/postback?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&subid={subid}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'subid', macro: '{subid}', description: 'Sub ID' },
    ],
    offerUrlFormat:
      'https://www.adworkmedia.com/click?offer_id={offer_id}&aff_id={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPI'],
    region: 'global',
  },
  {
    id: 'affiliaxe',
    name: 'Affiliaxe',
    icon: '🪓',
    category: 'cpa',
    description: 'Global performance network with exclusive offers in health, beauty, and lifestyle.',
    platformType: 'affiliaxe',
    postbackUrl:
      'https://postback.affiliaxe.com/s2s?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&aff_id={aff_id}&country={country}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click ID' },
      { key: 'payout', macro: '{payout}', description: 'Payout value' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
      { key: 'country', macro: '{country}', description: 'Country code' },
    ],
    offerUrlFormat:
      'https://go.affiliaxe.com/click?offer={offer_id}&aff={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS'],
    region: 'global',
  },
  {
    id: 'lemonads',
    name: 'Lemonads',
    icon: '🍋',
    category: 'cpa',
    description: 'European affiliate network with smartlink technology and real-time optimization.',
    platformType: 'lemonads',
    postbackUrl:
      'https://postback.lemonads.com/track?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&country={country}&aff_id={aff_id}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'country', macro: '{country}', description: 'User country' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
    ],
    offerUrlFormat:
      'https://go.lemonads.com/click?offer={offer_id}&aff={aff_id}&clickid={click_id}&sub1={sub1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS', 'RevShare'],
    region: 'eu',
  },
  {
    id: 'lospollos',
    name: 'LosPollos',
    icon: '🐔',
    category: 'cpa',
    description: 'Smartlink-based CPA network with automatic offer optimization for maximum EPC.',
    platformType: 'lospollos',
    postbackUrl:
      'https://postback.lospollos.com/s2s?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&sub1={sub1}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click ID' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'sub1', macro: '{sub1}', description: 'Sub tracking 1' },
    ],
    offerUrlFormat:
      'https://lospollos.com/click?offer={offer_id}&aff={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPI', 'RevShare'],
    region: 'global',
  },
  {
    id: 'a4d',
    name: 'A4D',
    icon: '4️⃣',
    category: 'cpa',
    description: 'Performance marketing network with curated offers and dedicated account management.',
    platformType: 'a4d',
    postbackUrl:
      'https://postback.a4d.com?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&aff_id={aff_id}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
    ],
    offerUrlFormat:
      'https://go.a4d.com/click?o={offer_id}&a={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS'],
    region: 'us',
  },
  {
    id: 'matomy',
    name: 'Matomy',
    icon: '📈',
    category: 'cpa',
    description: 'Global performance advertising company specializing in mobile and programmatic.',
    platformType: 'matomy',
    postbackUrl:
      'https://postback.matomy.com/s2s?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&aff_id={aff_id}&country={country}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout value' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
      { key: 'country', macro: '{country}', description: 'Country' },
    ],
    offerUrlFormat:
      'https://go.matomy.com/click?offer_id={offer_id}&aff_id={aff_id}&clickid={click_id}&sub1={sub1}',
    supportedPayoutModels: ['CPA', 'CPI', 'CPL', 'RevShare'],
    region: 'global',
  },
  {
    id: 'neverblue',
    name: 'Neverblue',
    icon: '🔵',
    category: 'cpa',
    description: 'Established CPA network with a wide selection of offers and reliable tracking.',
    platformType: 'neverblue',
    postbackUrl:
      'https://postback.neverblue.com?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&aff_id={aff_id}&transaction_id={transaction_id}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout' },
      { key: 'status', macro: '{status}', description: 'Status (approved/pending/void)' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
      { key: 'transaction_id', macro: '{transaction_id}', description: 'Transaction ID' },
    ],
    offerUrlFormat:
      'https://trk.neverblue.com/click?offer_id={offer_id}&aff_id={aff_id}&clickid={click_id}&subid={sub_id}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS', 'CPI'],
    region: 'us',
  },
  {
    id: 'convert2media',
    name: 'Convert2Media',
    icon: '🔄',
    category: 'cpa',
    description: 'Full-service CPA network with offers in finance, health, and lead generation.',
    platformType: 'convert2media',
    postbackUrl:
      'https://postback.convert2media.com/track?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&aff_id={aff_id}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click ID' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
    ],
    offerUrlFormat:
      'https://go.convert2media.com/click?offer={offer_id}&aff={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS'],
    region: 'us',
  },
  {
    id: 'w4',
    name: 'W4',
    icon: '🇼',
    category: 'cpa',
    description: 'Performance marketing agency offering CPA campaigns with advanced tracking.',
    platformType: 'w4',
    postbackUrl:
      'https://postback.w4.com/s2s?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&aff_id={aff_id}&p1={p1}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
      { key: 'p1', macro: '{p1}', description: 'Pass-through parameter 1' },
    ],
    offerUrlFormat:
      'https://go.w4.com/click?offer_id={offer_id}&aff_id={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS', 'CPI'],
    region: 'us',
  },

  // ─────────────────────────────────────────────────────────────
  //  E-COMMERCE
  // ─────────────────────────────────────────────────────────────
  {
    id: 'shopee',
    name: 'Shopee',
    icon: '🛒',
    category: 'ecommerce',
    description: "Southeast Asia's leading e-commerce platform with a robust affiliate program.",
    platformType: 'shopee',
    postbackUrl:
      'https://affiliate.shopee.co.id/api/v2/event?app_id={app_id}&click_id={click_id}&type={type}&commission={commission}&order_id={order_id}',
    postbackParams: [
      { key: 'app_id', macro: '{app_id}', description: 'Affiliate app ID' },
      { key: 'click_id', macro: '{click_id}', description: 'Click tracking ID' },
      { key: 'type', macro: '{type}', description: 'Event type (conversion/checkout)' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'order_id', macro: '{order_id}', description: 'Shopee order ID' },
    ],
    offerUrlFormat:
      'https://affiliate.shopee.co.id/offer?app_id={app_id}&aff_id={aff_id}&click_id={click_id}&url={product_url}',
    supportedPayoutModels: ['CPS', 'RevShare'],
    region: 'id',
  },
  {
    id: 'tokopedia',
    name: 'Tokopedia',
    icon: '🟢',
    category: 'ecommerce',
    description: "Indonesia's largest marketplace with CPS affiliate partnerships.",
    platformType: 'tokopedia',
    postbackUrl:
      'https://affiliate.tokopedia.com/api/postback?click_id={click_id}&order_id={order_id}&commission={commission}&status={status}&product_id={product_id}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'order_id', macro: '{order_id}', description: 'Order ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount (IDR)' },
      { key: 'status', macro: '{status}', description: 'Order status (delivered/returned)' },
      { key: 'product_id', macro: '{product_id}', description: 'Product ID' },
    ],
    offerUrlFormat:
      'https://affiliate.tokopedia.com/click?aff_id={aff_id}&click_id={click_id}&url={product_url}',
    supportedPayoutModels: ['CPS', 'RevShare'],
    region: 'id',
  },
  {
    id: 'lazada',
    name: 'Lazada',
    icon: '🔴',
    category: 'ecommerce',
    description: "Alibaba's Southeast Asian e-commerce giant with affiliate commission programs.",
    platformType: 'lazada',
    postbackUrl:
      'https://www.lazada.vn/affiliate/postback?click_id={click_id}&order_id={order_id}&commission={commission}&status={status}&country={country}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click tracking ID' },
      { key: 'order_id', macro: '{order_id}', description: 'Lazada order ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'status', macro: '{status}', description: 'Order status' },
      { key: 'country', macro: '{country}', description: 'Country code (MY/ID/TH/VN/PH/SG)' },
    ],
    offerUrlFormat:
      'https://www.lazada.com/affiliate/click?aff_id={aff_id}&click_id={click_id}&url={product_url}',
    supportedPayoutModels: ['CPS', 'RevShare'],
    region: 'asia',
  },
  {
    id: 'blibli',
    name: 'Blibli',
    icon: '🔵',
    category: 'ecommerce',
    description: "Indonesia's trusted e-commerce platform with affiliate marketing partnerships.",
    platformType: 'blibli',
    postbackUrl:
      'https://affiliate.blibli.com/api/postback?click_id={click_id}&order_id={order_id}&commission={commission}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'order_id', macro: '{order_id}', description: 'Order ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount (IDR)' },
      { key: 'status', macro: '{status}', description: 'Order status' },
    ],
    offerUrlFormat:
      'https://affiliate.blibli.com/click?aff_id={aff_id}&click_id={click_id}&url={product_url}',
    supportedPayoutModels: ['CPS', 'RevShare'],
    region: 'id',
  },
  {
    id: 'bukalapak',
    name: 'Bukalapak',
    icon: '🟠',
    category: 'ecommerce',
    description: 'Indonesian marketplace with an open affiliate program and competitive commissions.',
    platformType: 'bukalapak',
    postbackUrl:
      'https://affiliate.bukalapak.com/postback?click_id={click_id}&order_id={order_id}&commission={commission}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'order_id', macro: '{order_id}', description: 'Order ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount (IDR)' },
      { key: 'status', macro: '{status}', description: 'Order status' },
    ],
    offerUrlFormat:
      'https://affiliate.bukalapak.com/click?aff_id={aff_id}&click_id={click_id}&url={product_url}',
    supportedPayoutModels: ['CPS', 'RevShare'],
    region: 'id',
  },
  {
    id: 'amazon-associates',
    name: 'Amazon Associates',
    icon: '📦',
    category: 'ecommerce',
    description: "The world's largest affiliate program with millions of products and categories.",
    platformType: 'amazon',
    postbackUrl:
      'https://affiliate-program.amazon.com/api/postback?tag={tag}&click_id={click_id}&order_id={order_id}&commission={commission}&status={status}&asin={asin}',
    postbackParams: [
      { key: 'tag', macro: '{tag}', description: 'Amazon Associates tracking tag' },
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'order_id', macro: '{order_id}', description: 'Amazon order ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'status', macro: '{status}', description: 'Shipment/return status' },
      { key: 'asin', macro: '{asin}', description: 'Amazon Standard Identification Number' },
    ],
    offerUrlFormat:
      'https://www.amazon.com/dp/{asin}?tag={tag}&linkCode=as2&camp={camp}&creative={creative}',
    supportedPayoutModels: ['CPS', 'RevShare'],
    region: 'global',
  },
  {
    id: 'aliexpress',
    name: 'AliExpress',
    icon: '🅰️',
    category: 'ecommerce',
    description: "Alibaba's global retail marketplace with a comprehensive affiliate program.",
    platformType: 'aliexpress',
    postbackUrl:
      'https://portals.aliexpress.com/api/postback?click_id={click_id}&order_id={order_id}&commission={commission}&status={status}&app_key={app_key}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click tracking ID' },
      { key: 'order_id', macro: '{order_id}', description: 'AliExpress order ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount (USD)' },
      { key: 'status', macro: '{status}', description: 'Order/return status' },
      { key: 'app_key', macro: '{app_key}', description: 'Affiliate app key' },
    ],
    offerUrlFormat:
      'https://www.aliexpress.com/item/{product_id}.html?aff_platform=portals&aff_trace_key={click_id}&app_key={app_key}',
    supportedPayoutModels: ['CPS', 'RevShare'],
    region: 'global',
  },
  {
    id: 'ebay-partner',
    name: 'eBay Partner Network',
    icon: '🏷️',
    category: 'ecommerce',
    description: "eBay's official affiliate program with commissions on new and used items.",
    platformType: 'ebay',
    postbackUrl:
      'https://api.ebay.com/affiliate/postback?click_id={click_id}&order_id={order_id}&commission={commission}&auction_id={auction_id}&epid={epid}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'order_id', macro: '{order_id}', description: 'eBay order ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'auction_id', macro: '{auction_id}', description: 'eBay item/listing ID' },
      { key: 'epid', macro: '{epid}', description: 'eBay product ID' },
    ],
    offerUrlFormat:
      'https://www.ebay.com/itm/{auction_id}?campid={camp_id}&customid={click_id}&toolid=10001',
    supportedPayoutModels: ['CPS', 'RevShare'],
    region: 'global',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '💚',
    category: 'ecommerce',
    description: "Shopify's affiliate program promoting e-commerce store creation and plans.",
    platformType: 'shopify',
    postbackUrl:
      'https://www.shopify.com/affiliates/postback?click_id={click_id}&merchant_id={merchant_id}&commission={commission}&plan={plan}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'merchant_id', macro: '{merchant_id}', description: 'New merchant store ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'plan', macro: '{plan}', description: 'Shopify plan type' },
      { key: 'status', macro: '{status}', description: 'Subscription status' },
    ],
    offerUrlFormat:
      'https://www.shopify.com/?ref={aff_id}&click_id={click_id}&utm_source=affiliate',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'global',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    icon: '🟣',
    category: 'ecommerce',
    description: "WooCommerce affiliate program for promoting WordPress e-commerce solutions.",
    platformType: 'woocommerce',
    postbackUrl:
      'https://woocommerce.com/affiliate/postback?click_id={click_id}&commission={commission}&product={product}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'product', macro: '{product}', description: 'Product/extension name' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
    ],
    offerUrlFormat:
      'https://woocommerce.com/products/{product}?aff={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPS', 'RevShare'],
    region: 'global',
  },

  // ─────────────────────────────────────────────────────────────
  //  FINANCE
  // ─────────────────────────────────────────────────────────────
  {
    id: 'binance',
    name: 'Binance',
    icon: '🟡',
    category: 'finance',
    description: "The world's largest crypto exchange with generous referral commissions.",
    platformType: 'binance',
    postbackUrl:
      'https://www.binance.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&asset={asset}&type={type}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'Referred user ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'asset', macro: '{asset}', description: 'Crypto asset (BTC/USDT/BNB)' },
      { key: 'type', macro: '{type}', description: 'Commission type (spot/futures/earn)' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.binance.com/en/register?ref={ref_id}&click_id={click_id}',
    supportedPayoutModels: ['RevShare', 'CPA'],
    region: 'global',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    icon: '🔵',
    category: 'finance',
    description: "America's largest crypto exchange with a clean referral commission model.",
    platformType: 'coinbase',
    postbackUrl:
      'https://www.coinbase.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&trading_volume={trading_volume}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'Referred user ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission (USD)' },
      { key: 'trading_volume', macro: '{trading_volume}', description: 'Trading volume' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.coinbase.com/join/{ref_code}?click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'us',
  },
  {
    id: 'etoro',
    name: 'eToro',
    icon: '📈',
    category: 'finance',
    description: 'Social trading platform with CPA affiliate program for funded accounts.',
    platformType: 'etoro',
    postbackUrl:
      'https://www.etoro.com/affiliate/postback?click_id={click_id}&trader_id={trader_id}&commission={commission}&deposit_amount={deposit_amount}&country={country}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'trader_id', macro: '{trader_id}', description: 'Referred trader ID' },
      { key: 'commission', macro: '{commission}', description: 'CPA commission amount' },
      { key: 'deposit_amount', macro: '{deposit_amount}', description: 'First deposit amount' },
      { key: 'country', macro: '{country}', description: 'Trader country' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
    ],
    offerUrlFormat:
      'https://www.etoro.com/trading/?ref={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare', 'CPL'],
    region: 'global',
  },
  {
    id: 'plus500',
    name: 'Plus500',
    icon: '➕',
    category: 'finance',
    description: 'CFD trading platform with high CPA payouts for qualified trader deposits.',
    platformType: 'plus500',
    postbackUrl:
      'https://www.plus500.com/affiliate/postback?click_id={click_id}&trader_id={trader_id}&commission={commission}&country={country}&deposit={deposit}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'trader_id', macro: '{trader_id}', description: 'Trader ID' },
      { key: 'commission', macro: '{commission}', description: 'CPA commission' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'deposit', macro: '{deposit}', description: 'Deposit amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.plus500.com/trading/?id={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'CPL', 'RevShare'],
    region: 'global',
  },
  {
    id: 'iq-option',
    name: 'IQ Option',
    icon: '🧠',
    category: 'finance',
    description: 'Binary options and CFD trading platform with aggressive affiliate CPA payouts.',
    platformType: 'iqoption',
    postbackUrl:
      'https://affiliate.iqoption.com/postback?click_id={click_id}&trader_id={trader_id}&commission={commission}&country={country}&deposit={deposit}&status={status}&revenue={revenue}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'trader_id', macro: '{trader_id}', description: 'Trader ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'country', macro: '{country}', description: 'Trader country' },
      { key: 'deposit', macro: '{deposit}', description: 'Deposit amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'revenue', macro: '{revenue}', description: 'Net revenue from trader' },
    ],
    offerUrlFormat:
      'https://iqoption.com/lp/register?aff={aff_id}&click_id={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'RevShare', 'CPL'],
    region: 'global',
  },
  {
    id: 'olymp-trade',
    name: 'Olymp Trade',
    icon: '🏅',
    category: 'finance',
    description: 'Online trading platform with CPA program for qualified trader registrations.',
    platformType: 'olymptrade',
    postbackUrl:
      'https://olymptrade.com/affiliate/postback?click_id={click_id}&trader_id={trader_id}&commission={commission}&country={country}&deposit={deposit}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'trader_id', macro: '{trader_id}', description: 'Trader ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'deposit', macro: '{deposit}', description: 'Deposit' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://olymptrade.com/register?aff_id={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'global',
  },
  {
    id: 'exness',
    name: 'Exness',
    icon: '💱',
    category: 'finance',
    description: 'Forex broker with high CPA payouts and multi-tier affiliate commissions.',
    platformType: 'exness',
    postbackUrl:
      'https://www.exness.com/affiliate/postback?click_id={click_id}&trader_id={trader_id}&commission={commission}&lot_size={lot_size}&country={country}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'trader_id', macro: '{trader_id}', description: 'Trader ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission (USD)' },
      { key: 'lot_size', macro: '{lot_size}', description: 'Trading volume in lots' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.exness.com/register/?partner_id={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare', 'CPL'],
    region: 'global',
  },
  {
    id: 'xm',
    name: 'XM',
    icon: '🇽',
    category: 'finance',
    description: 'Global forex broker with CPA affiliate program and competitive rebates.',
    platformType: 'xm',
    postbackUrl:
      'https://www.xm.com/affiliate/postback?click_id={click_id}&trader_id={trader_id}&commission={commission}&lot_size={lot_size}&country={country}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'trader_id', macro: '{trader_id}', description: 'Trader ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'lot_size', macro: '{lot_size}', description: 'Volume traded (lots)' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.xm.com/register?ref={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare', 'CPL'],
    region: 'global',
  },
  {
    id: 'octafx',
    name: 'OctaFX',
    icon: '🐙',
    category: 'finance',
    description: 'Online forex broker with IB and affiliate commission programs.',
    platformType: 'octafx',
    postbackUrl:
      'https://www.octafx.com/affiliate/postback?click_id={click_id}&trader_id={trader_id}&commission={commission}&deposit={deposit}&country={country}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'trader_id', macro: '{trader_id}', description: 'Trader ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'deposit', macro: '{deposit}', description: 'Deposit amount' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.octafx.com/register/?partner_id={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'global',
  },
  {
    id: 'fbs',
    name: 'FBS',
    icon: '🅱️',
    category: 'finance',
    description: 'International forex broker with CPA and lot-rebate affiliate models.',
    platformType: 'fbs',
    postbackUrl:
      'https://www.fbs.com/affiliate/postback?click_id={click_id}&trader_id={trader_id}&commission={commission}&lot_size={lot_size}&country={country}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'trader_id', macro: '{trader_id}', description: 'Trader ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission (USD)' },
      { key: 'lot_size', macro: '{lot_size}', description: 'Trading lots' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://fbs.com/register/?aff={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare', 'CPL'],
    region: 'global',
  },

  // ─────────────────────────────────────────────────────────────
  //  GAMING
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ggpoker',
    name: 'GGPoker',
    icon: '🃏',
    category: 'gaming',
    description: "The world's largest poker network with CPA and rakeback affiliate programs.",
    platformType: 'ggpoker',
    postbackUrl:
      'https://www.ggpoker.com/affiliate/postback?click_id={click_id}&player_id={player_id}&commission={commission}&rake={rake}&country={country}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'player_id', macro: '{player_id}', description: 'Referred player ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'rake', macro: '{rake}', description: 'Generated rake amount' },
      { key: 'country', macro: '{country}', description: 'Player country' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.ggpoker.com/register/?aff={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'global',
  },
  {
    id: '888casino',
    name: '888casino',
    icon: '🎰',
    category: 'gaming',
    description: 'Award-winning online casino with high CPA payouts for depositing players.',
    platformType: '888casino',
    postbackUrl:
      'https://www.888casino.com/affiliate/postback?click_id={click_id}&player_id={player_id}&commission={commission}&deposit={deposit}&country={country}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'player_id', macro: '{player_id}', description: 'Player ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'deposit', macro: '{deposit}', description: 'Deposit amount' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.888casino.com/register?aff_id={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare', 'CPL'],
    region: 'global',
  },
  {
    id: 'bet365',
    name: 'Bet365',
    icon: '🎲',
    category: 'gaming',
    description: "The world's largest online gambling company with tiered affiliate commissions.",
    platformType: 'bet365',
    postbackUrl:
      'https://www.bet365.com/affiliate/postback?click_id={click_id}&player_id={player_id}&commission={commission}&revenue={revenue}&country={country}&product={product}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'player_id', macro: '{player_id}', description: 'Player ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'revenue', macro: '{revenue}', description: 'Net revenue' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'product', macro: '{product}', description: 'Product (sports/casino/poker)' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.bet365.com/affiliate?aff_id={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'global',
  },
  {
    id: '1xbet',
    name: '1xBet',
    icon: '🥇',
    category: 'gaming',
    description: 'Global sports betting and casino platform with high-volume affiliate program.',
    platformType: '1xbet',
    postbackUrl:
      'https://1xbet.com/affiliate/postback?click_id={click_id}&player_id={player_id}&commission={commission}&revenue={revenue}&country={country}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'player_id', macro: '{player_id}', description: 'Player ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'revenue', macro: '{revenue}', description: 'Net revenue' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://1xbet.com/en/registration/?aff={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'global',
  },
  {
    id: 'stake',
    name: 'Stake',
    icon: '🥩',
    category: 'gaming',
    description: 'Crypto casino and sportsbook with transparent affiliate revenue share.',
    platformType: 'stake',
    postbackUrl:
      'https://stake.com/affiliate/postback?click_id={click_id}&player_id={player_id}&commission={commission}&wager={wager}&currency={currency}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'player_id', macro: '{player_id}', description: 'Player ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission (crypto)' },
      { key: 'wager', macro: '{wager}', description: 'Total wagered' },
      { key: 'currency', macro: '{currency}', description: 'Crypto currency (BTC/ETH/USDT)' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://stake.com/?c={aff_code}&click_id={click_id}',
    supportedPayoutModels: ['RevShare', 'CPA'],
    region: 'global',
  },
  {
    id: 'bcgame',
    name: 'BC.Game',
    icon: '🎮',
    category: 'gaming',
    description: 'Crypto-native casino with NFT rewards and multi-tier affiliate system.',
    platformType: 'bcgame',
    postbackUrl:
      'https://bc.game/affiliate/postback?click_id={click_id}&player_id={player_id}&commission={commission}&wager={wager}&currency={currency}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'player_id', macro: '{player_id}', description: 'Player ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'wager', macro: '{wager}', description: 'Wagered amount' },
      { key: 'currency', macro: '{currency}', description: 'Crypto currency' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://bc.game/i-{aff_code}/c-{click_id}/',
    supportedPayoutModels: ['RevShare', 'CPA'],
    region: 'global',
  },

  // ─────────────────────────────────────────────────────────────
  //  DATING
  // ─────────────────────────────────────────────────────────────
  {
    id: 'matchcom',
    name: 'Match.com',
    icon: '💘',
    category: 'dating',
    description: "The world's largest dating platform with CPL and CPS affiliate programs.",
    platformType: 'match',
    postbackUrl:
      'https://www.match.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&subscription={subscription}&country={country}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'Referred user ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'subscription', macro: '{subscription}', description: 'Subscription plan type' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.match.com/registration?aff={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPL', 'CPS', 'RevShare'],
    region: 'us',
  },
  {
    id: 'tinder',
    name: 'Tinder',
    icon: '🔥',
    category: 'dating',
    description: "The world's most popular dating app with CPI and subscription affiliate offers.",
    platformType: 'tinder',
    postbackUrl:
      'https://tinder.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&platform={platform}&subscription={subscription}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'User ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'platform', macro: '{platform}', description: 'Platform (ios/android)' },
      { key: 'subscription', macro: '{subscription}', description: 'Subscription tier (gold/plus/platinum)' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://tinder.com/?aff={aff_id}&click_id={click_id}&s1={s1}',
    supportedPayoutModels: ['CPI', 'CPS', 'CPA'],
    region: 'global',
  },
  {
    id: 'bumble',
    name: 'Bumble',
    icon: '🐝',
    category: 'dating',
    description: "Women-first dating app with CPA offers for app installs and subscriptions.",
    platformType: 'bumble',
    postbackUrl:
      'https://bumble.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&platform={platform}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'User ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'platform', macro: '{platform}', description: 'Platform' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://bumble.com/get-started?aff={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'CPI', 'CPS'],
    region: 'global',
  },
  {
    id: 'zoosk',
    name: 'Zoosk',
    icon: '💜',
    category: 'dating',
    description: 'Behavioral matchmaking dating platform with CPL and CPS affiliate programs.',
    platformType: 'zoosk',
    postbackUrl:
      'https://www.zoosk.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&subscription={subscription}&country={country}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'User ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'subscription', macro: '{subscription}', description: 'Subscription plan' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.zoosk.com/registration?aff={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPL', 'CPS', 'RevShare'],
    region: 'us',
  },
  {
    id: 'cupid-media',
    name: 'Cupid Media',
    icon: '💘',
    category: 'dating',
    description: 'Niche dating network with 35+ sites covering ethnic, religious, and lifestyle dating.',
    platformType: 'cupidmedia',
    postbackUrl:
      'https://www.cupidmedia.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&site={site}&subscription={subscription}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'User ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'site', macro: '{site}', description: 'Dating site name' },
      { key: 'subscription', macro: '{subscription}', description: 'Subscription plan' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.cupidmedia.com/aff/{aff_id}/?click_id={click_id}&site={site}',
    supportedPayoutModels: ['CPS', 'RevShare', 'CPL'],
    region: 'global',
  },

  // ─────────────────────────────────────────────────────────────
  //  SWEEPSTAKES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'cpalead-sweepstakes',
    name: 'CPAlead (Sweepstakes)',
    icon: '🎰',
    category: 'sweepstakes',
    description: 'CPAlead sweepstakes vertical with high-converting content-locking offers.',
    platformType: 'cpalead',
    postbackUrl:
      'https://www.cpalead.com/postback.php?clickid={clickid}&payout={payout}&status={status}&offerid={offer_id}&country={country}&device={device}&subid={subid}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offerid', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'country', macro: '{country}', description: 'Country code' },
      { key: 'device', macro: '{device}', description: 'Device type' },
      { key: 'subid', macro: '{subid}', description: 'Sub ID' },
    ],
    offerUrlFormat:
      'https://www.cpalead.com/click.php?offer_id={offer_id}&aff_id={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL'],
    region: 'global',
  },
  {
    id: 'ogads-sweepstakes',
    name: 'OGAds (Sweepstakes)',
    icon: '🎁',
    category: 'sweepstakes',
    description: 'OGAds sweepstakes content-locking offers with mobile-first targeting.',
    platformType: 'ogads',
    postbackUrl:
      'https://ogads.com/postback?clickid={clickid}&payout={payout}&status={status}&offer_id={offer_id}&country={country}&device={device}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'device', macro: '{device}', description: 'Device type' },
    ],
    offerUrlFormat:
      'https://ogads.com/click?offer={offer_id}&aff={aff_id}&clickid={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL'],
    region: 'global',
  },
  {
    id: 'adgate-media',
    name: 'AdGate Media',
    icon: '🚪',
    category: 'sweepstakes',
    description: 'Offerwall and incentive CPA network with sweepstakes and survey offers.',
    platformType: 'adgatemedia',
    postbackUrl:
      'https://www.adgatemedia.com/postback?click_id={click_id}&payout={payout}&status={status}&offer_id={offer_id}&subid={subid}&country={country}&ip={ip}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status (1=approved, 0=chargeback)' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'subid', macro: '{subid}', description: 'Sub ID' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'ip', macro: '{ip}', description: 'User IP address' },
    ],
    offerUrlFormat:
      'https://www.adgatemedia.com/click?offer_id={offer_id}&aff_id={aff_id}&click_id={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPI'],
    region: 'global',
  },
  {
    id: 'adscend-media',
    name: 'Adscend Media',
    icon: '⬆️',
    category: 'sweepstakes',
    description: 'Offerwall monetization platform with sweepstakes, surveys, and rewarded content.',
    platformType: 'adscendmedia',
    postbackUrl:
      'https://www.adscendmedia.com/postback?click_id={click_id}&payout={payout}&status={status}&offer_id={offer_id}&subid={subid}&country={country}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'subid', macro: '{subid}', description: 'Sub ID' },
      { key: 'country', macro: '{country}', description: 'Country' },
    ],
    offerUrlFormat:
      'https://www.adscendmedia.com/click?offer_id={offer_id}&aff_id={aff_id}&click_id={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPI'],
    region: 'global',
  },
  {
    id: 'revenue-universe',
    name: 'Revenue Universe',
    icon: '🌌',
    category: 'sweepstakes',
    description: 'CPA network focused on sweepstakes, surveys, and incentivized offers.',
    platformType: 'revenueuniverse',
    postbackUrl:
      'https://www.revenueuniverse.com/postback?click_id={click_id}&payout={payout}&status={status}&offer_id={offer_id}&subid={subid}&country={country}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'subid', macro: '{subid}', description: 'Sub ID' },
      { key: 'country', macro: '{country}', description: 'Country' },
    ],
    offerUrlFormat:
      'https://www.revenueuniverse.com/click?offer_id={offer_id}&aff_id={aff_id}&click_id={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL'],
    region: 'global',
  },

  // ─────────────────────────────────────────────────────────────
  //  HEALTH
  // ─────────────────────────────────────────────────────────────
  {
    id: 'morenuts',
    name: 'MoreNuts',
    icon: '🥜',
    category: 'health',
    description: 'Nutra CPA network with COD and trial offers across health and beauty verticals.',
    platformType: 'morenuts',
    postbackUrl:
      'https://morenuts.com/postback?click_id={click_id}&payout={payout}&status={status}&offer_id={offer_id}&country={country}&sub1={sub1}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Status (1=approved, 0=pending/rejected)' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'country', macro: '{country}', description: 'Country' },
      { key: 'sub1', macro: '{sub1}', description: 'Sub tracking 1' },
    ],
    offerUrlFormat:
      'https://morenuts.com/click?offer={offer_id}&aff={aff_id}&click_id={click_id}&s1={s1}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS'],
    region: 'global',
  },
  {
    id: 'sellhealth',
    name: 'SellHealth',
    icon: '💊',
    category: 'health',
    description: 'Health and wellness affiliate network with exclusive supplement brands.',
    platformType: 'sellhealth',
    postbackUrl:
      'https://www.sellhealth.com/postback?click_id={click_id}&payout={payout}&status={status}&offer_id={offer_id}&aff_id={aff_id}&order_id={order_id}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Commission amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer/product ID' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
      { key: 'order_id', macro: '{order_id}', description: 'Order ID' },
    ],
    offerUrlFormat:
      'https://www.sellhealth.com/click?offer_id={offer_id}&aff_id={aff_id}&click_id={click_id}&s1={s1}',
    supportedPayoutModels: ['CPS', 'CPA', 'RevShare'],
    region: 'us',
  },
  {
    id: 'markethealth',
    name: 'MarketHealth',
    icon: '❤️',
    category: 'health',
    description: 'Health affiliate network with exclusive offers in beauty, weight loss, and supplements.',
    platformType: 'markethealth',
    postbackUrl:
      'https://www.markethealth.com/postback?click_id={click_id}&payout={payout}&status={status}&offer_id={offer_id}&aff_id={aff_id}&order_id={order_id}&country={country}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Commission amount' },
      { key: 'status', macro: '{status}', description: 'Status' },
      { key: 'offer_id', macro: '{offer_id}', description: 'Offer ID' },
      { key: 'aff_id', macro: '{aff_id}', description: 'Affiliate ID' },
      { key: 'order_id', macro: '{order_id}', description: 'Order ID' },
      { key: 'country', macro: '{country}', description: 'Country' },
    ],
    offerUrlFormat:
      'https://www.markethealth.com/click?offer_id={offer_id}&aff_id={aff_id}&click_id={click_id}&s1={s1}',
    supportedPayoutModels: ['CPS', 'CPA', 'RevShare'],
    region: 'global',
  },

  // ─────────────────────────────────────────────────────────────
  //  SAAS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: '🧡',
    category: 'saas',
    description: "HubSpot's affiliate program with recurring commissions on CRM, marketing, and sales tools.",
    platformType: 'hubspot',
    postbackUrl:
      'https://www.hubspot.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&product={product}&plan={plan}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'Referred user ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'product', macro: '{product}', description: 'HubSpot product (CRM/Marketing/Sales)' },
      { key: 'plan', macro: '{plan}', description: 'Plan tier (Starter/Pro/Enterprise)' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.hubspot.com/pricing?aff={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'global',
  },
  {
    id: 'semrush',
    name: 'SEMrush',
    icon: '🔍',
    category: 'saas',
    description: "SEMrush affiliate program with recurring commissions on SEO and marketing toolkit subscriptions.",
    platformType: 'semrush',
    postbackUrl:
      'https://www.semrush.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&subscription={subscription}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'Referred user ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission amount' },
      { key: 'subscription', macro: '{subscription}', description: 'Subscription plan' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.semrush.com/signup/?aff={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'global',
  },
  {
    id: 'nordvpn',
    name: 'NordVPN',
    icon: '🛡️',
    category: 'saas',
    description: "NordVPN affiliate program with high CPA payouts for VPN subscriptions.",
    platformType: 'nordvpn',
    postbackUrl:
      'https://nordvpn.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&plan={plan}&coupon={coupon}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'User ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'plan', macro: '{plan}', description: 'Subscription plan (1yr/2yr)' },
      { key: 'coupon', macro: '{coupon}', description: 'Coupon code used' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://nordvpn.com/aff/?aff_id={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare', 'CPS'],
    region: 'global',
  },
  {
    id: 'surfshark',
    name: 'Surfshark',
    icon: '🦈',
    category: 'saas',
    description: "Surfshark VPN affiliate program with competitive CPA and long cookie duration.",
    platformType: 'surfshark',
    postbackUrl:
      'https://surfshark.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&plan={plan}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'User ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'plan', macro: '{plan}', description: 'Plan type' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://surfshark.com/deal?aff={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'global',
  },
  {
    id: 'expressvpn',
    name: 'ExpressVPN',
    icon: '⚡',
    category: 'saas',
    description: "ExpressVPN's premium affiliate program with industry-leading CPA commissions.",
    platformType: 'expressvpn',
    postbackUrl:
      'https://www.expressvpn.com/affiliate/postback?click_id={click_id}&user_id={user_id}&commission={commission}&plan={plan}&status={status}',
    postbackParams: [
      { key: 'click_id', macro: '{click_id}', description: 'Click identifier' },
      { key: 'user_id', macro: '{user_id}', description: 'User ID' },
      { key: 'commission', macro: '{commission}', description: 'Commission' },
      { key: 'plan', macro: '{plan}', description: 'Subscription plan' },
      { key: 'status', macro: '{status}', description: 'Status' },
    ],
    offerUrlFormat:
      'https://www.expressvpn.com/go?aff_id={aff_id}&click_id={click_id}',
    supportedPayoutModels: ['CPA', 'RevShare'],
    region: 'global',
  },

  // ─────────────────────────────────────────────────────────────
  //  OTHER
  // ─────────────────────────────────────────────────────────────
  {
    id: 'custom',
    name: 'Custom',
    icon: '⚙️',
    category: 'other',
    description: 'Create a custom advertiser configuration with your own postback parameters.',
    platformType: 'custom',
    postbackUrl: 'https://your-postback-url.example.com?clickid={clickid}&payout={payout}&status={status}',
    postbackParams: [
      { key: 'clickid', macro: '{clickid}', description: 'Click identifier' },
      { key: 'payout', macro: '{payout}', description: 'Payout amount' },
      { key: 'status', macro: '{status}', description: 'Conversion status' },
    ],
    offerUrlFormat: 'https://your-offer-url.example.com?clickid={clickid}&aff_id={aff_id}',
    supportedPayoutModels: ['CPA', 'CPL', 'CPS', 'CPI', 'RevShare'],
    region: 'global',
  },
];

export default advertiserTemplates;
