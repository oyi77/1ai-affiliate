#!/usr/bin/env php
<?php
/**
 * Import data from BeMob API into 1ai-affiliate
 * Usage: php scripts/import_bemob.php
 */

define('BEMOB_ACCESS_KEY', '4CA5B4E9350942E39E2D5B4682A41E9A');
define('BEMOB_SECRET_KEY', 'cbaj4UMK1qBnnZou2cOSJjjmAzqAKJ792vofi9jcjMAGVAPYt6AISisvI1YpcTbxmWq2Qt9NXKtM5RsTpcuTqA==');
define('BEMOB_BASE_URL', 'https://api.bemob.com/v1');

function bemobApi($endpoint) {
    $ch = curl_init(BEMOB_BASE_URL . $endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'X-ACCESS-KEY: ' . BEMOB_ACCESS_KEY,
            'X-SECRET-KEY: ' . BEMOB_SECRET_KEY,
        ],
        CURLOPT_TIMEOUT => 30,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        echo "  ❌ API error ($httpCode): $endpoint\n";
        return null;
    }
    
    $data = json_decode($response, true);
    return ($data && $data['success']) ? $data['payload'] : null;
}

echo "╔══════════════════════════════════════════════════════════════╗\n";
echo "║         BeMob → 1ai-Affiliate Data Import                   ║\n";
echo "╚══════════════════════════════════════════════════════════════╝\n\n";

// Direct DB connection
$db = new mysqli('localhost', 'affiliate', 'testpass', '1ai_affiliate');
if ($db->connect_error) {
    die("❌ DB connection failed: " . $db->connect_error . "\n");
}
$db->set_charset('utf8mb4');
echo "✅ Connected to database\n\n";

// ━━━ 1. Import Affiliate Networks → Advertisers ━━━
echo "━━━ 1. Importing Affiliate Networks → Advertisers ━━━\n";
$networks = bemobApi('/affiliate-networks');
if ($networks) {
    $seen = [];
    foreach ($networks as $net) {
        $name = $net['name'];
        if (in_array($name, $seen)) continue;
        $seen[] = $name;
        
        $stmt = $db->prepare("SELECT id FROM 1ai_advertisers WHERE company_name = ?");
        $stmt->bind_param('s', $name);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $email = strtolower(str_replace(' ', '', $name)) . '@bemob.import';
            $password = password_hash('password', PASSWORD_BCRYPT);
            $stmt2 = $db->prepare("INSERT INTO 1ai_users (user_name, user_email, user_pass, user_role, user_date_added) VALUES (?, ?, ?, 'advertiser', UNIX_TIMESTAMP())");
            $stmt2->bind_param('sss', $name, $email, $password);
            $stmt2->execute();
            $userId = $stmt2->insert_id;
            
            $stmt3 = $db->prepare("INSERT INTO 1ai_advertisers (user_id, company_name, status, created_at, updated_at) VALUES (?, ?, 'active', UNIX_TIMESTAMP(), UNIX_TIMESTAMP())");
            $stmt3->bind_param('is', $userId, $name);
            $stmt3->execute();
            echo "  ✅ Created advertiser: $name (user_id=$userId)\n";
        } else {
            echo "  ⏭️  Already exists: $name\n";
        }
    }
}

// ━━━ 2. Import Traffic Sources ━━━
echo "\n━━━ 2. Importing Traffic Sources ━━━\n";
$sources = bemobApi('/traffic-sources');
if ($sources) {
    foreach ($sources as $src) {
        $name = $src['name'];
        $status = $src['status'] === 'active' ? 'active' : 'paused';
        
        $stmt = $db->prepare("SELECT id FROM 1ai_traffic_sources WHERE name = ?");
        $stmt->bind_param('s', $name);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $isActive = $src['status'] === 'active' ? 1 : 0;
            $stmt2 = $db->prepare("INSERT INTO 1ai_traffic_sources (name, is_active, platform_type, created_at, updated_at, user_id) VALUES (?, ?, 'social', UNIX_TIMESTAMP(), UNIX_TIMESTAMP(), 1)");
            $stmt2->bind_param('si', $name, $isActive);
            $stmt2->execute();
            echo "  ✅ Created traffic source: $name\n";
        } else {
            echo "  ⏭️  Already exists: $name\n";
        }
    }
}

// ━━━ 3. Import Campaigns → Offers ━━━
echo "\n━━━ 3. Importing Campaigns → Offers ━━━\n";
$campaigns = bemobApi('/campaigns?limit=100');
if ($campaigns) {
    foreach ($campaigns as $camp) {
        $name = $camp['name'];
        $status = $camp['status'] === 'active' ? 'active' : 'paused';
        $destUrl = $camp['destinationUrl'] ?? '';
        $costValue = $camp['costValue'] ?? 0;
        
        $stmt = $db->prepare("SELECT id FROM 1ai_offers WHERE name = ?");
        $stmt->bind_param('s', $name);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt2 = $db->prepare("INSERT INTO 1ai_offers (name, status, payout, network_payout, affiliate_url, created_at) VALUES (?, ?, ?, ?, ?, UNIX_TIMESTAMP())");
            $payout = max($costValue, 0);
            $stmt2->bind_param('ssdds', $name, $status, $payout, $payout, $destUrl);
            $stmt2->execute();
            $offerId = $stmt2->insert_id;
            
            // Create campaign entry
            $stmt3 = $db->prepare("INSERT INTO 1ai_aff_campaigns (aff_campaign_name, aff_campaign_payout, aff_campaign_status) VALUES (?, ?, 'active')");
            $stmt3->bind_param('sd', $name, $payout);
            $stmt3->execute();
            
            echo "  ✅ Created offer: $name (id=$offerId, status=$status)\n";
        } else {
            echo "  ⏭️  Already exists: $name\n";
        }
    }
}

// ━━━ 4. Import BeMob Offers ━━━
echo "\n━━━ 4. Importing BeMob Offers ━━━\n";
$offers = bemobApi('/offers?limit=100');
if ($offers) {
    foreach ($offers as $off) {
        $name = $off['name'];
        $status = $off['status'] === 'active' ? 'active' : 'paused';
        $payoutValue = $off['payoutValue'] ?? 0;
        $url = $off['url'] ?? '';
        
        $stmt = $db->prepare("SELECT id FROM 1ai_offers WHERE name = ?");
        $stmt->bind_param('s', $name);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            $stmt2 = $db->prepare("INSERT INTO 1ai_offers (name, status, payout, affiliate_url, created_at) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP())");
            $stmt2->bind_param('ssds', $name, $status, $payoutValue, $url);
            $stmt2->execute();
            $offerId = $stmt2->insert_id;
            echo "  ✅ Created offer: $name (id=$offerId, payout=$payoutValue)\n";
        } else {
            echo "  ⏭️  Already exists: $name\n";
        }
    }
}

// ━━━ 5. Fetch Campaign Stats ━━━
echo "\n━━━ 5. Fetching Campaign Statistics ━━━\n";
$stats = bemobApi('/statistics/campaigns?period=today&group=campaign');
if ($stats) {
    echo "  📊 Found " . count($stats) . " campaign stats entries\n";
    foreach (array_slice($stats, 0, 5) as $stat) {
        $clicks = $stat['clicks'] ?? 0;
        $conversions = $stat['conversions'] ?? 0;
        $revenue = $stat['revenue'] ?? 0;
        echo "  📈 Campaign {$stat['campaignId']}: {$clicks} clicks, {$conversions} conversions, \${$revenue}\n";
    }
} else {
    echo "  ⚠️  No stats available\n";
}

// ━━━ Summary ━━━
echo "\n╔══════════════════════════════════════════════════════════════╗\n";
echo "║  Import Complete!                                           ║\n";
echo "╠══════════════════════════════════════════════════════════════╣\n";

$tables = ['1ai_offers', '1ai_advertisers', '1ai_traffic_sources', '1ai_aff_campaigns', '1ai_affiliates'];
foreach ($tables as $table) {
    $result = $db->query("SELECT COUNT(*) as cnt FROM $table");
    $row = $result->fetch_assoc();
    printf("║  %-25s %5d records                    ║\n", $table, $row['cnt']);
}
echo "╚══════════════════════════════════════════════════════════════╝\n";

$db->close();
