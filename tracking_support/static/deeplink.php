<?php
declare(strict_types=1);

/**
 * Deep Link Landing Page (standalone — no connect2.php dependency)
 * 
 * Serves branded landing pages that trigger Universal Links / App Links.
 * URL format: l.berkahkarya.org/{slug}
 * 
 * The landing page renders a user-clickable <a href> to the deep link,
 * which is required for Universal Links / App Links to trigger app opening.
 * Server-side redirects (302, meta refresh, JS redirect) do NOT trigger deep links.
 */

// Direct DB connection (bypasses broken connect2.php vendor dependency)
require_once substr(__DIR__, 0, -23) . '/config.php';
if (!$db) {
    http_response_code(503);
    echo '<!DOCTYPE html><html><head><title>503</title></head><body><h1>Service unavailable</h1></body></html>';
    exit;
}

// Get slug from query param (nginx rewrites /{slug} → /deeplink.php?slug={slug})
$slug = $_GET['slug'] ?? '';

// Validate slug — only allow alphanumeric, hyphens, underscores
if (!preg_match('/^[a-zA-Z0-9_-]{1,32}$/', $slug)) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>404</title></head><body><h1>Page not found</h1></body></html>';
    exit;
}

// Fetch landing page from database
$mysql_slug = $db->real_escape_string($slug);
$sql = "SELECT id, slug, user_id, offer_url, app_store_url, 
               title, description, button_text, accent_color, background_color,
               image_url, logo_url, impressions, clicks, is_active
        FROM deep_link_pages 
        WHERE slug = '{$mysql_slug}' AND is_active = 1";

$result = $db->query($sql);
if (!$result || $result->num_rows === 0) {
    http_response_code(404);
    echo '<!DOCTYPE html><html><head><title>404</title></head><body><h1>Page not found</h1></body></html>';
    exit;
}

$page = $result->fetch_assoc();

// Increment impression counter (async, don't block page load)
$db->query("UPDATE deep_link_pages SET impressions = impressions + 1 WHERE id = " . (int)$page['id']);

// Build landing page HTML
$fallback_url = $page['app_store_url'] ?? 'https://shopee.co.id/';
$accent = htmlspecialchars($page['accent_color'], ENT_QUOTES);
$bg = htmlspecialchars($page['background_color'], ENT_QUOTES);
$title = htmlspecialchars($page['title'], ENT_QUOTES);
$description = htmlspecialchars($page['description'] ?? '', ENT_QUOTES);
$button_text = htmlspecialchars($page['button_text'], ENT_QUOTES);
$offer_url = htmlspecialchars($page['offer_url'], ENT_QUOTES);
$image_url = htmlspecialchars($page['image_url'] ?? '', ENT_QUOTES);
$logo_url = htmlspecialchars($page['logo_url'] ?? '', ENT_QUOTES);

?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title><?= $title ?></title>
    <meta name="robots" content="noindex, nofollow">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: <?= $bg ?>;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            max-width: 420px;
            width: 100%;
            text-align: center;
        }
        .card {
            background: #fff;
            border-radius: 16px;
            padding: 32px 24px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 16px;
            border-radius: 16px;
            object-fit: contain;
        }
        .placeholder-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 16px;
            background: <?= $accent ?>15;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
        }
        .promo-image {
            max-height: 240px;
            object-fit: cover;
            border-radius: 12px;
            margin-bottom: 16px;
        }
        h1 {
            color: #1a1a1a;
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .description {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 24px;
        }
        .btn {
            background: <?= $accent ?>;
            color: #fff;
            font-size: 17px;
            font-weight: 600;
            padding: 16px 48px;
            border-radius: 12px;
            text-decoration: none;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
            box-shadow: 0 4px 16px <?= $accent ?>40;
            width: 100%;
            max-width: 320px;
        }
        .btn:active {
            transform: scale(0.97);
        }
        .footer {
            margin-top: 16px;
            color: #999;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <?php if ($logo_url): ?>
                <img src="<?= $logo_url ?>" alt="Logo" class="logo">
            <?php else: ?>
                <div class="placeholder-logo">🎯</div>
            <?php endif; ?>
            
            <?php if ($image_url): ?>
                <img src="<?= $image_url ?>" alt="Promo" class="promo-image">
            <?php endif; ?>
            
            <h1><?= $title ?></h1>
            
            <?php if ($description): ?>
                <p class="description"><?= $description ?></p>
            <?php endif; ?>
            
            <!-- THIS IS THE CRITICAL PART: user-initiated click on <a href> -->
            <!-- Server-side redirects (302, meta refresh, JS location) do NOT trigger Universal Links -->
            <!-- Only a user click on an <a> tag triggers the deep link -->
            <a id="deeplink" class="btn" href="<?= $offer_url ?>"><?= $button_text ?></a>
        </div>
        
        <p class="footer">Powered by 1AI Affiliate</p>
    </div>

    <script>
    // Fallback: if deep link fails (app not installed), redirect to web fallback
    // This works by measuring if the page loses focus when the app opens
    (function() {
        var btn = document.getElementById('deeplink');
        var fallbackUrl = <?= json_encode($fallback_url) ?>;
        var focusLost = false;
        
        // Track if page loses focus (app opened)
        window.addEventListener('blur', function() {
            focusLost = true;
        });
        
        // Fallback timer
        btn.addEventListener('click', function(e) {
            setTimeout(function() {
                if (!focusLost) {
                    // Page didn't lose focus = app didn't open = redirect to web
                    window.location.href = fallbackUrl;
                }
            }, 2500);
        });
    })();
    </script>
</body>
</html>