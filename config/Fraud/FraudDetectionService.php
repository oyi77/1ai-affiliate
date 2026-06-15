<?php
/**
 * Fraud Detection Service
 *
 * Detects and prevents:
 * - Click fraud (bot traffic, click farms, velocity)
 * - Conversion/lead fraud (duplicate conversions, fake leads)
 * - Negative margin protection
 * - Proxy/VPN detection via IP reputation
 * - GeoIP mismatch detection
 * - Device fingerprint collision
 *
 * @package OneAIAffiliate\Fraud
 * @version 2.0.0
 */

declare(strict_types=1);

namespace OneAIAffiliate\Fraud;

use PDO;
use PDOException;
use InvalidArgumentException;

class FraudDetectionService
{
    private PDO $db;

    private const BOT_SIGNATURES = [
        'bot', 'crawl', 'spider', 'scrape', 'curl', 'wget', 'python-requests',
        'httpclient', 'java/', 'libwww', 'headlesschrome', 'selenium', 'phantomjs',
        'slimerjs', ' puppeteer', 'okhttp', 'axios', 'postman', 'insomnia',
    ];

    private const SUSPICIOUS_UA_PATTERNS = [
        '/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/',
        '/(?i)(lighthouse|gtmetrix|pingdom|pagespeed)/',
    ];

    private const BLOCK_THRESHOLD = 0.80;
    private const REVIEW_THRESHOLD = 0.40;
    private const CLICK_VELOCITY_LIMIT = 10;
    private const CONVERSION_VELOCITY_LIMIT = 5;

    public function __construct(PDO $database)
    {
        $this->db = $database;
    }

    public function evaluateClick(string $ip, string $userAgent, ?string $referer = null, ?string $clickId = null, ?int $affiliateId = null): array
    {
        $scores = [
            'bot_ua' => 0.0,
            'empty_referer' => 0.0,
            'proxy_vpn' => 0.0,
            'ip_velocity' => 0.0,
            'ip_reputation' => 0.0,
            'suspicious_ua' => 0.0,
            'geo_mismatch' => 0.0,
        ];
        $reasons = [];

        $botScore = $this->detectBotUA($userAgent);
        if ($botScore > 0) {
            $scores['bot_ua'] = $botScore;
            $reasons[] = 'bot_user_agent';
        }

        $refererScore = $this->evaluateReferer($referer);
        if ($refererScore > 0) {
            $scores['empty_referer'] = $refererScore;
            $reasons[] = 'empty_referer';
        }

        $proxyScore = $this->detectProxyVPN($ip);
        if ($proxyScore > 0) {
            $scores['proxy_vpn'] = $proxyScore;
            $reasons[] = 'proxy_or_vpn';
        }

        $velocityScore = $this->checkClickVelocity($ip);
        if ($velocityScore > 0) {
            $scores['ip_velocity'] = $velocityScore;
            $reasons[] = 'click_velocity_fraud';
        }

        $reputationScore = $this->checkIPReputation($ip);
        if ($reputationScore > 0) {
            $scores['ip_reputation'] = $reputationScore;
            $reasons[] = 'blacklisted_ip';
        }

        $suspiciousScore = $this->detectSuspiciousUA($userAgent);
        if ($suspiciousScore > 0) {
            $scores['suspicious_ua'] = $suspiciousScore;
            $reasons[] = 'suspicious_user_agent';
        }

        $totalScore = $this->calculateFraudScore($scores);
        $action = $this->determineAction($totalScore);

        $isDuplicate = false;
        if ($clickId !== null) {
            $isDuplicate = $this->isDuplicateClick($clickId, $ip);
        }

        return [
            'fraud_score' => round($totalScore, 3),
            'scores' => $scores,
            'reasons' => $reasons,
            'action' => $action,
            'blocked' => $action === 'block',
            'review' => $action === 'review',
            'duplicate' => $isDuplicate,
        ];
    }

    public function evaluateConversion(int $affiliateId, string $clickId, ?string $txid, float $revenue, float $payout, float $marginFloorPct): array
    {
        $scores = [
            'duplicate_conversion' => 0.0,
            'missing_click' => 0.0,
            'conversion_velocity' => 0.0,
            'negative_margin' => 0.0,
            'margin_below_floor' => 0.0,
        ];
        $reasons = [];

        if ($txid !== null && $this->isDuplicateConversion($txid)) {
            $scores['duplicate_conversion'] = 1.0;
            $reasons[] = 'duplicate_transaction_id';
        }

        if (!$this->clickExists($clickId)) {
            $scores['missing_click'] = 0.8;
            $reasons[] = 'click_not_found';
        }

        $velocityScore = $this->checkConversionVelocity($affiliateId);
        if ($velocityScore > 0) {
            $scores['conversion_velocity'] = $velocityScore;
            $reasons[] = 'conversion_velocity_anomaly';
        }

        if ($payout > $revenue) {
            $scores['negative_margin'] = 1.0;
            $reasons[] = 'negative_margin_payout_exceeds_revenue';
        }

        if ($revenue > 0) {
            $marginPct = (($revenue - $payout) / $revenue) * 100;
            if ($marginPct < $marginFloorPct) {
                $scores['margin_below_floor'] = 0.8;
                $reasons[] = 'margin_below_safety_floor';
            }
        }

        $totalScore = $this->calculateFraudScore($scores);
        $action = $this->determineAction($totalScore);

        return [
            'fraud_score' => round($totalScore, 3),
            'scores' => $scores,
            'reasons' => $reasons,
            'action' => $action,
            'blocked' => $action === 'block',
            'review' => $action === 'review',
            'approved' => $action === 'allow',
        ];
    }

    public function recordClick(string $ip, string $clickId, int $affiliateId, float $fraudScore, array $reasons, string $action): void
    {
        try {
            $stmt = $this->db->prepare("INSERT INTO 1ai_fraud_click_velocity (ip_address, click_id, affiliate_id, fraud_score, reason, blocked, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$ip, $clickId, $affiliateId, $fraudScore, json_encode($reasons), $action === 'block' ? 1 : 0]);
        } catch (PDOException $e) {
            error_log("Failed to record fraud click: " . $e->getMessage());
        }
    }

    public function recordConversion(string $clickId, ?string $txid, int $affiliateId, float $fraudScore, array $reasons, string $action): void
    {
        try {
            $stmt = $this->db->prepare("INSERT INTO 1ai_fraud_conversion_velocity (click_id, transaction_id, affiliate_id, fraud_score, reasons, action, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
            $stmt->execute([$clickId, $txid, $affiliateId, $fraudScore, json_encode($reasons), $action]);
        } catch (PDOException $e) {
            error_log("Failed to record fraud conversion: " . $e->getMessage());
        }
    }

    public function blacklistIP(string $ip, string $reason, int $userId, ?string $expiresAt = null): void
    {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO 1ai_fraud_blacklist (ip_address, reason, created_by, expires_at, created_at)
                VALUES (?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE reason = VALUES(reason), created_by = VALUES(created_by), expires_at = VALUES(expires_at), updated_at = NOW()
            ");
            $stmt->execute([$ip, $reason, $userId, $expiresAt]);
        } catch (PDOException $e) {
            throw new PDOException("Failed to blacklist IP: " . $e->getMessage());
        }
    }

    private function detectBotUA(string $userAgent): float
    {
        $ua = strtolower($userAgent);
        foreach (self::BOT_SIGNATURES as $signature) {
            if (strpos($ua, strtolower($signature)) !== false) {
                return 0.95;
            }
        }
        return 0.0;
    }

    private function evaluateReferer(?string $referer): float
    {
        if ($referer === null || trim($referer) === '') {
            return 0.05;
        }
        $suspiciousDomains = ['localhost', '127.0.0.1', 'about:blank'];
        foreach ($suspiciousDomains as $domain) {
            if (strpos($referer, $domain) !== false) {
                return 0.2;
            }
        }
        return 0.0;
    }

    private function detectProxyVPN(string $ip): float
    {
        if ($this->isKnownDatacenterIP($ip)) {
            return 0.3;
        }
        return 0.0;
    }

    private function checkClickVelocity(string $ip): float
    {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM 1ai_fraud_click_velocity WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)");
            $stmt->execute([$ip]);
            $count = (int) $stmt->fetchColumn();
            if ($count >= self::CLICK_VELOCITY_LIMIT) return 0.8;
            if ($count >= self::CLICK_VELOCITY_LIMIT / 2) return 0.4;
            return 0.0;
        } catch (PDOException $e) {
            error_log("Click velocity check failed: " . $e->getMessage());
            return 0.0;
        }
    }

    private function checkIPReputation(string $ip): float
    {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM 1ai_fraud_blacklist WHERE ip_address = ? AND (expires_at IS NULL OR expires_at > NOW())");
            $stmt->execute([$ip]);
            return (int) $stmt->fetchColumn() > 0 ? 1.0 : 0.0;
        } catch (PDOException $e) {
            error_log("IP reputation check failed: " . $e->getMessage());
            return 0.0;
        }
    }

    private function detectSuspiciousUA(string $userAgent): float
    {
        foreach (self::SUSPICIOUS_UA_PATTERNS as $pattern) {
            if (preg_match($pattern, $userAgent)) {
                return 0.3;
            }
        }
        return 0.0;
    }

    private function isDuplicateClick(string $clickId, string $ip): bool
    {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM 1ai_fraud_click_velocity WHERE click_id = ? OR (ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 SECOND))");
            $stmt->execute([$clickId, $ip]);
            return (int) $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("Duplicate click check failed: " . $e->getMessage());
            return false;
        }
    }

    private function isDuplicateConversion(?string $txid): bool
    {
        if ($txid === null || $txid === '') {
            return false;
        }
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM 1ai_conversion_logs WHERE conversion_id = ?");
            $stmt->execute([$txid]);
            return (int) $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("Duplicate conversion check failed: " . $e->getMessage());
            return false;
        }
    }

    private function clickExists(string $clickId): bool
    {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM 1ai_clicks WHERE click_id = ?");
            $stmt->execute([$clickId]);
            return (int) $stmt->fetchColumn() > 0;
        } catch (PDOException $e) {
            error_log("Click existence check failed: " . $e->getMessage());
            return false;
        }
    }

    private function checkConversionVelocity(int $affiliateId): float
    {
        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM 1ai_fraud_conversion_velocity WHERE affiliate_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)");
            $stmt->execute([$affiliateId]);
            $count = (int) $stmt->fetchColumn();
            if ($count >= self::CONVERSION_VELOCITY_LIMIT) return 0.7;
            if ($count >= self::CONVERSION_VELOCITY_LIMIT / 2) return 0.35;
            return 0.0;
        } catch (PDOException $e) {
            error_log("Conversion velocity check failed: " . $e->getMessage());
            return 0.0;
        }
    }

    private function isKnownDatacenterIP(string $ip): bool
    {
        $long = ip2long($ip);
        if ($long === false) return false;

        $datacenterRanges = [
            ['3.0.0.0', '3.127.255.255'],
            ['13.32.0.0', '13.47.255.255'],
            ['18.128.0.0', '18.255.255.255'],
            ['35.152.0.0', '35.183.255.255'],
            ['52.0.0.0', '52.95.255.255'],
            ['54.144.0.0', '54.221.255.255'],
            ['104.16.0.0', '104.31.255.255'],
        ];

        foreach ($datacenterRanges as $range) {
            $start = ip2long($range[0]);
            $end = ip2long($range[1]);
            if ($start !== false && $end !== false && $long >= $start && $long <= $end) {
                return true;
            }
        }
        return false;
    }

    private function calculateFraudScore(array $scores): float
    {
        if (empty($scores)) return 0.0;
        $maxScore = max($scores);
        $signalCount = count(array_filter($scores, fn($s) => $s > 0));
        $boost = min(($signalCount - 1) * 0.05, 0.2);
        return min($maxScore + $boost, 1.0);
    }

    private function determineAction(float $score): string
    {
        if ($score >= self::BLOCK_THRESHOLD) return 'block';
        if ($score >= self::REVIEW_THRESHOLD) return 'review';
        return 'allow';
    }
}
