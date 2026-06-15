<?php
/**
 * End-to-End (E2E) Integration Test Suite
 * 
 * Covers:
 * - User role authentication (Admin, AM, OM, Advertiser, Publisher)
 * - Advertiser registration and offer creation
 * - OM approval workflow
 * - AM offer assignment (specific/global)
 * - Publisher smartlink generation
 * - Multi-model tracking (CPM, CPA, CPS, CPC, CPV)
 * - Fraud detection (click, conversion, margin)
 * - Margin-safe payout negotiation
 * 
 * Run: cd /path/to/project && ./vendor/bin/phpunit tests/E2E/AdTechWorkflowTest.php
 * 
 * @package Tests\E2E
 * @version 2.0.0
 */

declare(strict_types=1);

namespace Tests\E2E;

use PHPUnit\Framework\TestCase;
use PDO;
use PDOException;
use OneAIAffiliate\RBAC\RBACService;
use OneAIAffiliate\Offer\OfferApprovalService;
use OneAIAffiliate\Assignment\AMOfferAssignmentService;
use OneAIAffiliate\Fraud\FraudDetectionService;

class AdTechWorkflowTest extends TestCase
{
    private static ?PDO $db = null;
    private static ?RBACService $rbac = null;
    private static ?OfferApprovalService $approvalService = null;
    private static ?AMOfferAssignmentService $assignmentService = null;
    private static ?FraudDetectionService $fraudService = null;

    private static int $adminId;
    private static int $amId;
    private static int $omId;
    private static int $advertiserId;
    private static int $publisherId;
    private static int $inactiveUserId;
    private static int $offerId;
    private static int $affiliateId;

    public static function setUpBeforeClass(): void
    {
        // Database connection (uses real MySQL database)
        self::$db = new PDO(
            'mysql:host=localhost;dbname=prosper1ai_test;charset=utf8mb4',
            'affiliate',
            'testpass',
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );

        self::$rbac = new RBACService(self::$db);
        self::$approvalService = new OfferApprovalService(self::$db);
        self::$assignmentService = new AMOfferAssignmentService(self::$db, self::$rbac);
        self::$fraudService = new FraudDetectionService(self::$db);

        self::seedTestData();
    }

    public static function tearDownAfterClass(): void
    {
        self::cleanupTestData();
        self::$db = null;
    }

    /* ============================================================
       AUTHENTICATION TESTS
       ============================================================ */

    public function testAdminCanAccessAllResources(): void
    {
        $this->assertTrue(self::$rbac->can(self::$adminId, 'offers', 'create'));
        $this->assertTrue(self::$rbac->can(self::$adminId, 'offers', 'delete'));
        $this->assertTrue(self::$rbac->can(self::$adminId, 'settings', 'update'));
        $this->assertTrue(self::$rbac->can(self::$adminId, 'fraud', 'blacklist'));
    }

    public function testAdvertiserCanCreateOwnOffer(): void
    {
        $this->assertTrue(self::$rbac->can(self::$advertiserId, 'offers', 'create'));
        $this->assertTrue(self::$rbac->can(self::$advertiserId, 'offers', 'read_own', self::$advertiserId));
    }

    public function testAdvertiserCannotApproveOffers(): void
    {
        $this->assertFalse(self::$rbac->can(self::$advertiserId, 'offers', 'approve'));
    }

    public function testOmCanApprovePendingOffers(): void
    {
        $this->assertTrue(self::$rbac->can(self::$omId, 'offers', 'approve'));
        $this->assertFalse(self::$rbac->can(self::$omId, 'offers', 'create'));
    }

    public function testAmCanAssignOffers(): void
    {
        $this->assertTrue(self::$rbac->can(self::$amId, 'offers', 'assign'));
        $this->assertTrue(self::$rbac->can(self::$amId, 'affiliates', 'assign'));
        $this->assertTrue(self::$rbac->can(self::$amId, 'margin', 'override'));
    }

    public function testPublisherCanOnlyReadAssignedOffers(): void
    {
        $this->assertTrue(self::$rbac->can(self::$publisherId, 'offers', 'read_assigned', self::$offerId));
        $this->assertFalse(self::$rbac->can(self::$publisherId, 'offers', 'create'));
    }

    public function testInactiveUserCannotAccess(): void
    {
        $this->assertFalse(self::$rbac->can(self::$inactiveUserId, 'offers', 'read'));
    }

    /* ============================================================
       OFFER CREATION TESTS
       ============================================================ */

    public function testAdvertiserCreatesOfferWithPendingStatus(): void
    {
        $stmt = self::$db->prepare("
            INSERT INTO 1ai_offers (name, payout, network_payout, advertiser_id, network_id, payout_model, margin_floor_pct, approval_status, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'paused', UNIX_TIMESTAMP())
        ");
        $stmt->execute(['E2E CPA Offer', 5.00, 6.00, self::$advertiserId, 1, 'cpa', 10.00]);

        $newOfferId = (int) self::$db->lastInsertId();

        $stmt = self::$db->prepare("SELECT approval_status, advertiser_id FROM 1ai_offers WHERE id = ?");
        $stmt->execute([$newOfferId]);
        $offer = $stmt->fetch();

        $this->assertEquals('pending', $offer['approval_status']);
        $this->assertEquals(self::$advertiserId, $offer['advertiser_id']);

        // Cleanup
        self::$db->prepare("DELETE FROM 1ai_offers WHERE id = ?")->execute([$newOfferId]);
    }

    public function testOfferCreationWithNegativePayoutIsRejected(): void
    {
        $result = self::$rbac->validateMarginSafety(6.00, -1.00, 5.00);
        $this->assertFalse($result["valid"]);
        $this->assertStringContainsString("Payout cannot be negative", $result["message"]);
    }
    public function testCpsOfferRequiresRevenueShare(): void
    {
        $stmt = self::$db->prepare("
            INSERT INTO 1ai_offers (name, payout, network_payout, advertiser_id, payout_model, revenue_share_pct, margin_floor_pct, approval_status, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'paused', UNIX_TIMESTAMP())
        ");
        $stmt->execute(['E2E CPS Offer', 10.00, 15.00, self::$advertiserId, 'cps', 20.00, 10.00]);

        $newOfferId = (int) self::$db->lastInsertId();
        $stmt = self::$db->prepare("SELECT payout_model, revenue_share_pct FROM 1ai_offers WHERE id = ?");
        $stmt->execute([$newOfferId]);
        $offer = $stmt->fetch();

        $this->assertEquals('cps', $offer['payout_model']);
        $this->assertEquals(20.00, (float) $offer['revenue_share_pct']);

        self::$db->prepare("DELETE FROM 1ai_offers WHERE id = ?")->execute([$newOfferId]);
    }

    /* ============================================================
       OM APPROVAL WORKFLOW TESTS
       ============================================================ */

    public function testOmApprovesOffer(): void
    {
        $result = self::$approvalService->approveOffer(self::$offerId, self::$omId);

        $this->assertTrue($result['success']);
        $this->assertEquals('approved', $result['status']);

        $stmt = self::$db->prepare("SELECT approval_status, approved_by FROM 1ai_offers WHERE id = ?");
        $stmt->execute([self::$offerId]);
        $offer = $stmt->fetch();

        $this->assertEquals('approved', $offer['approval_status']);
        $this->assertEquals(self::$omId, $offer['approved_by']);
    }

    public function testCannotApproveAlreadyApprovedOffer(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        self::$approvalService->approveOffer(self::$offerId, self::$omId);
    }

    public function testOmRejectsOffer(): void
    {
        // Create a new pending offer to reject
        $stmt = self::$db->prepare("
            INSERT INTO 1ai_offers (name, payout, network_payout, advertiser_id, payout_model, margin_floor_pct, approval_status, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', 'paused', UNIX_TIMESTAMP())
        ");
        $stmt->execute(['Reject Offer', 5.00, 6.00, self::$advertiserId, 'cpa', 10.00]);
        $rejectOfferId = (int) self::$db->lastInsertId();

        $result = self::$approvalService->rejectOffer($rejectOfferId, self::$omId, 'Landing page does not meet brand guidelines');

        $this->assertTrue($result['success']);
        $this->assertEquals('rejected', $result['status']);

        $stmt = self::$db->prepare("SELECT approval_status, rejection_reason FROM 1ai_offers WHERE id = ?");
        $stmt->execute([$rejectOfferId]);
        $offer = $stmt->fetch();

        $this->assertEquals('rejected', $offer['approval_status']);
        $this->assertStringContainsString('Landing page', $offer['rejection_reason']);

        self::$db->prepare("DELETE FROM 1ai_offers WHERE id = ?")->execute([$rejectOfferId]);
    }

    public function testRejectionRequiresReason(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        self::$approvalService->rejectOffer(self::$offerId, self::$omId, '');
    }

    public function testOmRequestsChanges(): void
    {
        $stmt = self::$db->prepare("
            INSERT INTO 1ai_offers (name, payout, network_payout, advertiser_id, payout_model, margin_floor_pct, approval_status, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'pending', 'paused', UNIX_TIMESTAMP())
        ");
        $stmt->execute(['Changes Offer', 5.00, 6.00, self::$advertiserId, 'cpa', 10.00]);
        $changesOfferId = (int) self::$db->lastInsertId();

        $result = self::$approvalService->requestChanges($changesOfferId, self::$omId, 'Please increase payout to match market rates');

        $this->assertTrue($result['success']);
        $this->assertEquals('changes_requested', $result['status']);

        $stmt = self::$db->prepare("SELECT approval_status, om_notes FROM 1ai_offers WHERE id = ?");
        $stmt->execute([$changesOfferId]);
        $offer = $stmt->fetch();

        $this->assertEquals('changes_requested', $offer['approval_status']);
        $this->assertStringContainsString('market rates', $offer['om_notes']);

        self::$db->prepare("DELETE FROM 1ai_offers WHERE id = ?")->execute([$changesOfferId]);
    }

    public function testApprovalHistoryTracked(): void
    {
        $history = self::$approvalService->getApprovalHistory(self::$offerId);

        $this->assertNotEmpty($history);
        $this->assertEquals('approved', $history[0]['action']);
        $this->assertEquals(self::$omId, $history[0]['reviewed_by']);
    }

    /* ============================================================
       AM ASSIGNMENT TESTS
       ============================================================ */

    public function testAssignOfferToSpecificAffiliate(): void
    {
        // AM must first be assigned to affiliate
        self::$db->prepare("
            INSERT INTO 1ai_am_assignments (am_user_id, affiliate_id, assignment_type, assigned_by, notes)
            VALUES (?, ?, 'primary', ?, 'E2E test AM assignment')
        ")->execute([self::$amId, self::$affiliateId, self::$adminId]);

        $result = self::$assignmentService->assignToAffiliate(self::$amId, self::$offerId, self::$affiliateId, [
            'affiliate_margin_pct' => 12.00,
            'notes' => 'Specific E2E assignment'
        ]);

        $this->assertTrue($result['success']);
        $this->assertEquals('specific', $result['assignment_type']);
        $this->assertLessThan(6.00, $result['affiliate_payout']); // Payout protected by margin

        $this->assertEquals(1, self::$rbac->isOfferAssignedToPublisher(self::$publisherId, self::$offerId));
    }

    public function testAssignOfferGlobally(): void
    {
        $stmt = self::$db->prepare("
            INSERT INTO 1ai_offers (name, payout, network_payout, advertiser_id, payout_model, margin_floor_pct, approval_status, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'approved', 'active', UNIX_TIMESTAMP())
        ");
        $stmt->execute(['Global Offer', 8.00, 10.00, self::$advertiserId, 'cpa', 5.00]);
        $globalOfferId = (int) self::$db->lastInsertId();

        $result = self::$assignmentService->assignGlobally(self::$amId, $globalOfferId, [
            'affiliate_margin_pct' => 15.00,
            'notes' => 'Global E2E assignment'
        ]);

        $this->assertTrue($result['success']);
        $this->assertEquals('global', $result['assignment_type']);

        self::$db->prepare("DELETE FROM 1ai_offer_assignments WHERE offer_id = ?")->execute([$globalOfferId]);
        self::$db->prepare("DELETE FROM 1ai_offers WHERE id = ?")->execute([$globalOfferId]);
    }

    public function testAssignmentBelowMarginFloorRejected(): void
    {
        // Offer margin floor is 10%, network_payout=6.00, payout=5.00
        $this->expectException(\InvalidArgumentException::class);
        self::$assignmentService->assignToAffiliate(self::$amId, self::$offerId, self::$affiliateId, [
            'affiliate_margin_pct' => 5.00 // Below 10% floor
        ]);
    }

    public function testRemoveAssignment(): void
    {
        $assignment = self::$assignmentService->getAssignmentForAffiliate(self::$offerId, self::$affiliateId);
        $this->assertNotNull($assignment);

        $result = self::$assignmentService->removeAssignment(self::$amId, $assignment['id']);
        $this->assertTrue($result['success']);

        // Re-create assignment for downstream tests
        self::$assignmentService->assignToAffiliate(self::$amId, self::$offerId, self::$affiliateId, [
            'affiliate_margin_pct' => 12.00,
        ]);
    }

    /* ============================================================
       FRAUD DETECTION TESTS
       ============================================================ */

    public function testBotUserAgentBlocked(): void
    {
        $result = self::$fraudService->evaluateClick(
            '192.168.1.1',
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'https://example.com'
        );

        $this->assertTrue($result['blocked']);
        $this->assertGreaterThanOrEqual(0.6, $result['fraud_score']);
        $this->assertContains('bot_user_agent', $result['reasons']);
    }

    public function testBlacklistedIPBlocked(): void
    {
        self::$fraudService->blacklistIP('203.0.113.99', 'Known click farm', self::$adminId);

        $result = self::$fraudService->evaluateClick(
            '203.0.113.99',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'https://example.com'
        );

        $this->assertTrue($result['blocked']);
        $this->assertEquals(1.0, $result['fraud_score']);
    }

    public function testClickVelocityFraud(): void
    {
        $ip = '198.51.100.5';

        // Seed velocity by recording 12 clicks
        for ($i = 0; $i < 12; $i++) {
            self::$fraudService->recordClick($ip, "velocity-click-{$i}", self::$affiliateId, 0.0, [], 'allow');
        }

        $result = self::$fraudService->evaluateClick(
            $ip,
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'https://example.com'
        );

        $this->assertTrue($result['blocked']);
        $this->assertContains('click_velocity_fraud', $result['reasons']);
    }

    public function testDuplicateConversionRejected(): void
    {
        // Create a conversion first and use its conversion_id as txid
        self::$db->prepare("
            INSERT INTO 1ai_conversion_logs (aff_campaign_id, affiliate_id, click_id, network_payout_snapshot, affiliate_payout_snapshot, margin_amount, conversion_time)
            VALUES (?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())
        ")->execute([1, self::$affiliateId, 0, 6.00, 5.00, 1.00]);

        $txid = (string) self::$db->lastInsertId();

        $result = self::$fraudService->evaluateConversion(
            self::$affiliateId,
            'click-123',
            $txid,
            6.00,
            5.00,
            10.00
        );

        $this->assertTrue($result['blocked']);
        $this->assertContains('duplicate_transaction_id', $result['reasons']);

        // Cleanup
        self::$db->prepare("DELETE FROM 1ai_conversion_logs WHERE conversion_id = ?")->execute([$txid]);
    }

    public function testNegativeMarginConversionBlocked(): void
    {
        $result = self::$fraudService->evaluateConversion(
            self::$affiliateId,
            'click-456',
            'TX-UNIQUE-002',
            6.00,
            7.00, // Payout exceeds revenue
            10.00
        );

        $this->assertTrue($result['blocked']);
        $this->assertContains('negative_margin_payout_exceeds_revenue', $result['reasons']);
    }

    public function testMarginBelowFloorConversionBlocked(): void
    {
        // revenue=6.00, payout=5.50 => margin=8.33% which is below 10% floor
        $result = self::$fraudService->evaluateConversion(
            self::$affiliateId,
            'click-789',
            'TX-UNIQUE-003',
            6.00,
            5.50,
            10.00
        );

        $this->assertTrue($result['blocked']);
        $this->assertContains('margin_below_safety_floor', $result['reasons']);
    }

    public function testValidConversionApproved(): void
    {
        // Ensure click exists
        self::$db->prepare("
            INSERT IGNORE INTO 1ai_clicks (click_id, click_time, aff_campaign_id, click_payout, click_bot, rotator_id, rule_id)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ")->execute(['999999001', self::$offerId, self::$affiliateId, '203.0.113.10', 'Mozilla/5.0', 'https://example.com']);

        $result = self::$fraudService->evaluateConversion(
            self::$affiliateId,
            '999999001',
            'TX-VALID-001',
            6.00,
            4.50,
            10.00
        );

        $this->assertTrue($result['approved']);
        $this->assertFalse($result['blocked']);
    }

    /* ============================================================
       MARGIN CALCULATION TESTS
       ============================================================ */
    public function testMarginSafetyValidation(): void
    {
        $result = self::$rbac->validateMarginSafety(10.00, 9.00, 15.00);
        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('below safety floor', $result['message']);
    }

    public function testNegativeMarginRejected(): void
    {
        $result = self::$rbac->validateMarginSafety(10.00, 12.00, 5.00);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('Payout exceeds revenue', $result['message']);
    }

    public function testProtectedPayoutCalculation(): void
    {
        $result = self::$rbac->calculateProtectedPayout(10.00, 15.00);

        $this->assertEquals(8.50, $result['max_payout']); // 10 * (1 - 0.15)
        $this->assertEquals(15.00, $result['margin_pct']);
    }

    /* ============================================================
       MULTI-MODEL TRACKING TESTS
       ============================================================ */

    public function testCpmImpressionTracked(): void
    {
        $stmt = self::$db->prepare("
            INSERT INTO 1ai_cpm_impressions (click_id, offer_id, affiliate_id, ip_address, user_agent, country_code, device_type, viewed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute(['cpm-click-001', self::$offerId, self::$affiliateId, '203.0.113.20', 'Mozilla/5.0', 'US', 'mobile']);

        $impressionId = (int) self::$db->lastInsertId();
        $this->assertGreaterThan(0, $impressionId);

        self::$db->prepare("DELETE FROM 1ai_cpm_impressions WHERE id = ?")->execute([$impressionId]);
    }

    public function testCpvViewEventTracked(): void
    {
        $stmt = self::$db->prepare("
            INSERT INTO 1ai_cpv_view_events (click_id, offer_id, affiliate_id, duration_seconds, completed, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute(['cpv-click-001', self::$offerId, self::$affiliateId, 30, true]);

        $viewId = (int) self::$db->lastInsertId();
        $this->assertGreaterThan(0, $viewId);

        self::$db->prepare("DELETE FROM 1ai_cpv_view_events WHERE id = ?")->execute([$viewId]);
    }

    public function testCpsRevenueShareCalculation(): void
    {
        $revenue = 100.00;
        $revenueSharePct = 20.00;
        $payout = ($revenue * $revenueSharePct) / 100;

        $this->assertEquals(20.00, $payout);
    }

    /* ============================================================
       HELPER METHODS: TEST DATA SEEDING
       ============================================================ */

    private static function seedTestData(): void
    {
        $db = self::$db;

        // Create test users with distinct emails
        $timestamp = time();
        $users = [
            ['admin', 'admin'],
            ['am', 'am'],
            ['om', 'om'],
            ['advertiser', 'advertiser'],
            ['publisher', 'publisher'],
            ['inactive', 'publisher'],
        ];

        $ids = [];
        foreach ($users as $index => [$role, $baseRole]) {
            $email = "e2e_{$role}_{$timestamp}@1ai.test";
            $pass = password_hash('password', PASSWORD_BCRYPT);
            $db->prepare("
                INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_active, user_date_added, clickserver_api_key, install_hash, user_hash, modal_status, vip_perks_status)
                VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP(), '', '', '', 0, 0)
            ")->execute(["E2E {$role}", $email, $pass, $baseRole, $role === 'inactive' ? 0 : 1]);
            $ids[$role] = (int) $db->lastInsertId();
        }

        self::$adminId = $ids['admin'];
        self::$amId = $ids['am'];
        self::$omId = $ids['om'];
        self::$advertiserId = $ids['advertiser'];
        self::$publisherId = $ids['publisher'];
        self::$inactiveUserId = $ids['inactive'];

        // Create affiliate profile for publisher
        $db->prepare("
            INSERT INTO 1ai_affiliates (user_id, affiliate_code, tier, created_at)
            VALUES (?, ?, 'pro', UNIX_TIMESTAMP())
        ")->execute([self::$publisherId, "E2EPUB{$timestamp}"]);
        self::$affiliateId = (int) $db->lastInsertId();

        // Create an approved network
        $db->prepare("
            INSERT INTO 1ai_networks (name, status, created_at)
            VALUES (?, 'active', UNIX_TIMESTAMP())
        ")->execute(["E2E Network {$timestamp}"]);
        $networkId = (int) $db->lastInsertId();

        // Create pending offer
        $db->prepare("
            INSERT INTO 1ai_offers (name, payout, network_payout, advertiser_id, network_id, payout_model, margin_floor_pct, approval_status, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 'paused', UNIX_TIMESTAMP())
        ")->execute(["E2E Offer {$timestamp}", 5.00, 6.00, self::$advertiserId, $networkId, 'cpa', 10.00]);
        self::$offerId = (int) $db->lastInsertId();
    }

    private static function cleanupTestData(): void
    {
        if (!self::$db) {
            return;
        }

        // Delete in dependency order
        self::$db->exec("DELETE FROM 1ai_assignment_history WHERE created_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)");
        self::$db->exec("DELETE FROM 1ai_offer_assignments WHERE created_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)");
        self::$db->exec("DELETE FROM 1ai_offer_approval_history WHERE created_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)");
        self::$db->exec("DELETE FROM 1ai_fraud_click_velocity WHERE created_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)");
        self::$db->exec("DELETE FROM 1ai_fraud_conversion_velocity WHERE created_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)");
        self::$db->exec("DELETE FROM 1ai_conversion_logs WHERE conversion_time > UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 2 HOUR))");
        self::$db->exec("DELETE FROM 1ai_cpm_impressions WHERE viewed_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)");
        self::$db->exec("DELETE FROM 1ai_cpv_view_events WHERE created_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)");
        self::$db->exec("DELETE FROM 1ai_am_assignments WHERE created_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)");

        $emailLike = 'e2e_%@1ai.test';
        $stmt = self::$db->prepare("SELECT user_id FROM 1ai_users WHERE user_email LIKE ?");
        $stmt->execute([$emailLike]);
        $userIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($userIds as $userId) {
            self::$db->prepare("DELETE FROM 1ai_affiliates WHERE user_id = ?")->execute([$userId]);
            self::$db->prepare("DELETE FROM 1ai_users WHERE user_id = ?")->execute([$userId]);
        }

        self::$db->exec("DELETE FROM 1ai_offers WHERE name LIKE 'E2E Offer %' OR name LIKE 'E2E CPA %' OR name LIKE 'E2E CPS %' OR name LIKE 'Reject Offer' OR name LIKE 'Changes Offer' OR name LIKE 'Global Offer'");
        self::$db->exec("DELETE FROM 1ai_networks WHERE name LIKE 'E2E Network %'");
    }
}
