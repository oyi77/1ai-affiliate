<?php
declare(strict_types=1);

namespace OneAIAffiliate\Database\Schema;

/**
 * Registry of all table names in the 1ai-Affiliate database.
 * Use these constants instead of magic strings to prevent typos and enable IDE auto-completion.
 */
final class TableRegistry
{
    // Core tables
    public const string VERSION = 'version';
    public const string SESSIONS = 'sessions';
    public const string CRONJOBS = 'cronjobs';
    public const string CRONJOB_LOGS = 'cronjob_logs';
    public const string MYSQL_ERRORS = 'mysql_errors';
    public const string DELAYED_SQLS = 'delayed_sqls';
    public const string ALERTS = 'alerts';
    public const string OFFERS = 'tracking_offers';
    public const string FILTERS = 'filters';
    public const string SYNC_JOBS = 'sync_jobs';
    public const string SYNC_JOB_EVENTS = 'sync_job_events';
    public const string SYNC_JOB_ITEMS = 'sync_job_items';
    public const string CHANGE_LOG = 'change_log';
    public const string DELETED_LOG = 'deleted_log';
    public const string SYNC_AUDIT = 'sync_audit';

    // User tables
    public const string USERS = 'users';
    public const string USERS_PREF = 'users_pref';
    public const string USERS_LOG = 'users_log';
    public const string USER_ROLE = 'user_role';
    public const string ROLES = 'roles';
    public const string PERMISSIONS = 'permissions';
    public const string ROLE_PERMISSION = 'role_permission';
    public const string API_KEYS = 'api_keys';
    public const string AUTH_KEYS = 'auth_keys';
    public const string USER_DATA_FEEDBACK = 'user_data_feedback';

    // Click tables
    public const string CLICKS = 'clicks';
    public const string CLICKS_ADVANCE = 'clicks_advance';
    public const string CLICKS_COUNTER = 'clicks_counter';
    public const string CLICKS_RECORD = 'clicks_record';
    public const string CLICKS_SITE = 'clicks_site';
    public const string CLICKS_SPY = 'clicks_spy';
    public const string CLICKS_TRACKING = 'clicks_tracking';
    public const string CLICKS_VARIABLE = 'clicks_variable';
    public const string CLICKS_ROTATOR = 'clicks_rotator';
    public const string CLICKS_TOTAL = 'clicks_total';

    // Tracking tables
    public const string TRACKING_C1 = 'tracking_c1';
    public const string TRACKING_C2 = 'tracking_c2';
    public const string TRACKING_C3 = 'tracking_c3';
    public const string TRACKING_C4 = 'tracking_c4';
    public const string TRACKERS = 'trackers';
    public const string CPA_TRACKERS = 'cpa_trackers';
    public const string KEYWORDS = 'keywords';
    public const string GOOGLE = 'google';
    public const string BING = 'bing';
    public const string FACEBOOK = 'facebook';
    public const string UTM_CAMPAIGN = 'utm_campaign';
    public const string UTM_CONTENT = 'utm_content';
    public const string UTM_MEDIUM = 'utm_medium';
    public const string UTM_SOURCE = 'utm_source';
    public const string UTM_TERM = 'utm_term';
    public const string CUSTOM_VARIABLES = 'custom_variables';
    public const string PPC_NETWORK_VARIABLES = 'ppc_network_variables';
    public const string VARIABLE_SETS = 'variable_sets';
    public const string VARIABLE_SETS2 = 'variable_sets2';

    // Campaign tables
    public const string AFF_CAMPAIGNS = 'aff_campaigns';
    public const string AFF_NETWORKS = 'aff_networks';
    public const string PPC_ACCOUNTS = 'ppc_accounts';
    public const string PPC_NETWORKS = 'ppc_networks';
    public const string PPC_ACCOUNT_PIXELS = 'ppc_account_pixels';
    public const string LANDING_PAGES = 'landing_pages';
    public const string TEXT_ADS = 'text_ads';

    // Attribution tables
    public const string ATTRIBUTION_MODELS = 'attribution_models';
    public const string ATTRIBUTION_SNAPSHOTS = 'attribution_snapshots';
    public const string ATTRIBUTION_TOUCHPOINTS = 'attribution_touchpoints';
    public const string ATTRIBUTION_SETTINGS = 'attribution_settings';
    public const string ATTRIBUTION_AUDIT = 'attribution_audit';
    public const string ATTRIBUTION_EXPORTS = 'attribution_exports';
    public const string CONVERSION_LOGS = 'conversion_logs';
    public const string CONVERSION_TOUCHPOINTS = 'conversion_touchpoints';

    // Rotator tables
    public const string ROTATORS = 'rotators';
    public const string ROTATOR_RULES = 'rotator_rules';
    public const string ROTATOR_RULES_CRITERIA = 'rotator_rules_criteria';
    public const string ROTATOR_RULES_REDIRECTS = 'rotator_rules_redirects';
    public const string ROTATIONS = 'rotations';

    // Ad network tables
    public const string AD_NETWORK_FEEDS = 'ad_network_feeds';
    public const string AD_NETWORK_ADS = 'ad_network_ads';
    public const string AD_NETWORK_TITLES = 'ad_network_titles';
    public const string AD_NETWORK_BODIES = 'ad_network_bodies';
    public const string AD_FEED_CONTENTAD_TOKENS = 'ad_feed_contentad_tokens';
    public const string AD_FEED_OUTBRAIN_TOKENS = 'ad_feed_outbrain_tokens';
    public const string AD_FEED_TABOOLA_TOKENS = 'ad_feed_taboola_tokens';
    public const string AD_FEED_CUSTOM_TOKENS = 'ad_feed_custom_tokens';
    public const string AD_FEED_REVCONTENT_TOKENS = 'ad_feed_revcontent_tokens';
    public const string AD_FEED_FACEBOOK_TOKENS = 'ad_feed_facebook_tokens';

    // Export tables
    public const string EXPORT_ADGROUPS = 'export_adgroups';
    public const string EXPORT_CAMPAIGNS = 'export_campaigns';
    public const string EXPORT_KEYWORDS = 'export_keywords';
    public const string EXPORT_SESSIONS = 'export_sessions';
    public const string EXPORT_TEXTADS = 'export_textads';

    // Location tables
    public const string IPS = 'ips';
    public const string IPS_V6 = 'ips_v6';
    public const string LAST_IPS = 'last_ips';
    public const string LOCATIONS_CITY = 'locations_city';
    public const string LOCATIONS_COUNTRY = 'locations_country';
    public const string LOCATIONS_REGION = 'locations_region';
    public const string LOCATIONS_ISP = 'locations_isp';

    // Device/browser tables
    public const string BROWSERS = 'browsers';
    public const string PLATFORMS = 'platforms';
    public const string DEVICE_TYPES = 'device_types';
    public const string DEVICE_MODELS = 'device_models';
    public const string PIXEL_TYPES = 'pixel_types';

    // Site tables
    public const string SITE_DOMAINS = 'site_domains';
    public const string SITE_URLS = 'site_urls';

    // Data engine tables
    public const string DATAENGINE = 'dataengine';
    public const string DATAENGINE_JOB = 'dataengine_job';
    public const string DIRTY_HOURS = 'dirty_hours';
    public const string SORT_BREAKDOWNS = 'sort_breakdowns';
    public const string CHARTS = 'charts';

    // DNI tables
    public const string DNI_NETWORKS = 'dni_networks';

    // Bot202 Facebook Pixel tables
    public const string BOT202_FACEBOOK_PIXEL_ASSISTANT = 'botfacebook_pixel_assistant';
    public const string BOT202_FACEBOOK_PIXEL_CONTENT_TYPE = 'botfacebook_pixel_content_type';
    public const string BOT202_FACEBOOK_PIXEL_CLICK_EVENTS = 'botfacebook_pixel_click_events';

    /**
     * Get all table names as an array.
     *
     * @return array<string>
     */
    public static function getAllTables(): array
    {
        $reflection = new \ReflectionClass(self::class);
        return array_values($reflection->getConstants());
    }

    /**
     * Check if a table name is valid.
     */
    public static function isValidTable(string $tableName): bool
    {
        return in_array($tableName, self::getAllTables(), true);
    }
}
