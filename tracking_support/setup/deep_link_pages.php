<?php
declare(strict_types=1);

/**
 * Deep Link Pages Manager
 * 
 * Admin interface for creating and managing deep link landing pages.
 * Access: affiliate.berkahkarya.org/tracking_support/setup/deep_link_pages.php
 */

include_once(substr(__DIR__, 0, -21) . '/config/connect2.php');
$conn = \OneAIAffiliate\Repository\LookupRepositoryFactory::connection($db);
AUTH::require_user();

$user_id = $_SESSION['user_id'] ?? 0;
$success = '';
$error = '';

// Handle form submissions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'create') {
        $slug = trim($_POST['slug'] ?? '');
        $offer_url = trim($_POST['offer_url'] ?? '');
        $title = trim($_POST['title'] ?? 'Special Offer');
        $description = trim($_POST['description'] ?? '');
        $button_text = trim($_POST['button_text'] ?? 'Open Now');
        $accent_color = trim($_POST['accent_color'] ?? '#ee4d2d');
        $background_color = trim($_POST['background_color'] ?? '#ffffff');
        $image_url = trim($_POST['image_url'] ?? '');
        $logo_url = trim($_POST['logo_url'] ?? '');
        $app_store_url = trim($_POST['app_store_url'] ?? '');
        
        // Validate
        if (!preg_match('/^[a-zA-Z0-9_-]{1,32}$/', $slug)) {
            $error = 'Slug must be alphanumeric (hyphens and underscores allowed), max 32 chars';
        } elseif (empty($offer_url)) {
            $error = 'Offer URL is required';
        } else {
            // Check slug uniqueness
            $check = $conn->query("SELECT id FROM deep_link_pages WHERE slug = '" . $conn->escape($slug) . "'");
            if ($check && $check->num_rows > 0) {
                $error = 'Slug already exists';
            } else {
                $now = time();
                $sql = "INSERT INTO deep_link_pages (
                    slug, user_id, offer_url, app_store_url, title, description,
                    button_text, accent_color, background_color, image_url, logo_url,
                    created_at, updated_at
                ) VALUES (
                    '" . $conn->escape($slug) . "',
                    " . (int)$user_id . ",
                    '" . $conn->escape($offer_url) . "',
                    '" . $conn->escape($app_store_url) . "',
                    '" . $conn->escape($title) . "',
                    '" . $conn->escape($description) . "',
                    '" . $conn->escape($button_text) . "',
                    '" . $conn->escape($accent_color) . "',
                    '" . $conn->escape($background_color) . "',
                    '" . $conn->escape($image_url) . "',
                    '" . $conn->escape($logo_url) . "',
                    {$now}, {$now}
                )";
                
                if ($conn->query($sql)) {
                    $success = "Landing page created! URL: https://l.berkahkarya.org/{$slug}";
                } else {
                    $error = 'Database error: ' . $conn->writeConnection()->error;
                }
            }
        }
    } elseif ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            $conn->query("DELETE FROM deep_link_pages WHERE id = {$id} AND user_id = " . (int)$user_id);
            $success = 'Landing page deleted';
        }
    } elseif ($action === 'toggle') {
        $id = (int)($_POST['id'] ?? 0);
        if ($id > 0) {
            $conn->query("UPDATE deep_link_pages SET is_active = NOT is_active WHERE id = {$id} AND user_id = " . (int)$user_id);
            $success = 'Status updated';
        }
    }
}

// Fetch all landing pages for this user
$pages = [];
$result = $conn->query("SELECT * FROM deep_link_pages WHERE user_id = " . (int)$user_id . " ORDER BY created_at DESC");
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $pages[] = $row;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deep Link Pages - 1AI Affiliate</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { margin-bottom: 20px; color: #333; }
        
        .card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .card h2 { margin-bottom: 16px; font-size: 18px; color: #333; }
        
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 4px; font-weight: 500; color: #555; font-size: 14px; }
        .form-group input, .form-group textarea, .form-group select {
            width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px;
            font-size: 14px; transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: #ee4d2d; outline: none; }
        .form-group textarea { min-height: 80px; resize: vertical; }
        .form-group small { color: #888; font-size: 12px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        .btn { display: inline-block; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
        .btn-primary { background: #ee4d2d; color: #fff; }
        .btn-primary:hover { background: #d6421f; }
        .btn-danger { background: #ff4444; color: #fff; }
        .btn-danger:hover { background: #cc0000; }
        .btn-sm { padding: 6px 12px; font-size: 12px; }
        
        .alert { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
        .alert-success { background: #d4edda; color: #155724; }
        .alert-error { background: #f8d7da; color: #721c24; }
        
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f9f9f9; font-weight: 600; color: #555; }
        tr:hover { background: #f5f5f5; }
        .slug { font-family: monospace; color: #ee4d2d; }
        .status-active { color: #28a745; }
        .status-inactive { color: #dc3545; }
        .url-preview { font-size: 12px; color: #888; word-break: break-all; }
        
        .actions { display: flex; gap: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Deep Link Pages</h1>
        
        <?php if ($success): ?>
            <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
        <?php endif; ?>
        <?php if ($error): ?>
            <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        
        <!-- Create Form -->
        <div class="card">
            <h2>Create New Landing Page</h2>
            <form method="POST">
                <input type="hidden" name="action" value="create">
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Slug (URL path)</label>
                        <input type="text" name="slug" pattern="[a-zA-Z0-9_-]{1,32}" required placeholder="shopee-deal">
                        <small>l.berkahkarya.org/<strong>shopee-deal</strong></small>
                    </div>
                    <div class="form-group">
                        <label>Page Title</label>
                        <input type="text" name="title" value="Special Offer" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Offer URL (Deep Link Target)</label>
                    <input type="url" name="offer_url" required placeholder="https://s.shopee.co.id/xxx">
                    <small>The destination URL that opens when the user clicks the button</small>
                </div>
                
                <div class="form-group">
                    <label>Fallback URL (App Not Installed)</label>
                    <input type="url" name="app_store_url" placeholder="https://shopee.co.id/">
                    <small>Where to redirect if the app doesn't open</small>
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" placeholder="Click the button below to open this deal in the app"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Button Text</label>
                        <input type="text" name="button_text" value="Open Now" required>
                    </div>
                    <div class="form-group">
                        <label>Accent Color</label>
                        <input type="color" name="accent_color" value="#ee4d2d">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Background Color</label>
                        <input type="color" name="background_color" value="#ffffff">
                    </div>
                    <div class="form-group">
                        <label>Product Image URL (optional)</label>
                        <input type="url" name="image_url" placeholder="https://...">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Logo URL (optional)</label>
                    <input type="url" name="logo_url" placeholder="https://...">
                </div>
                
                <button type="submit" class="btn btn-primary">Create Landing Page</button>
            </form>
        </div>
        
        <!-- Existing Pages -->
        <div class="card">
            <h2>Your Landing Pages (<?= count($pages) ?>)</h2>
            
            <?php if (empty($pages)): ?>
                <p style="color: #888; text-align: center; padding: 20px;">No landing pages yet. Create one above!</p>
            <?php else: ?>
                <table>
                    <thead>
                        <tr>
                            <th>Slug</th>
                            <th>Title</th>
                            <th>URL</th>
                            <th>Views/Clicks</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($pages as $p): ?>
                            <tr>
                                <td class="slug"><?= htmlspecialchars($p['slug']) ?></td>
                                <td><?= htmlspecialchars($p['title']) ?></td>
                                <td>
                                    <span class="url-preview">https://l.berkahkarya.org/<?= htmlspecialchars($p['slug']) ?></span>
                                </td>
                                <td><?= (int)$p['impressions'] ?> / <?= (int)$p['clicks'] ?></td>
                                <td class="<?= $p['is_active'] ? 'status-active' : 'status-inactive' ?>">
                                    <?= $p['is_active'] ? 'Active' : 'Inactive' ?>
                                </td>
                                <td>
                                    <div class="actions">
                                        <form method="POST" style="display:inline">
                                            <input type="hidden" name="action" value="toggle">
                                            <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">
                                            <button type="submit" class="btn btn-sm btn-primary">
                                                <?= $p['is_active'] ? 'Disable' : 'Enable' ?>
                                            </button>
                                        </form>
                                        <form method="POST" style="display:inline" onsubmit="return confirm('Delete this landing page?')">
                                            <input type="hidden" name="action" value="delete">
                                            <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">
                                            <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>