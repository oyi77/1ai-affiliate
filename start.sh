#!/usr/bin/env bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1ai-Affiliate — Single startup script
# Starts: MySQL, Redis, PHP-FPM, Node.js (PM2), nginx, cron jobs
# Usage: ./start.sh [--docker] [--stop] [--status]
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PM2_APP="1ai-affiliate"
PHP_POOL="tracking"
PHP_PORT=9002
NODE_PORT=3001
NGINX_PORT=6969

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { printf "${GREEN}  ✅ %s${NC}\n" "$1"; }
warn() { printf "${YELLOW}  ⚠️  %s${NC}\n" "$1"; }
fail() { printf "${RED}  ❌ %s${NC}\n" "$1"; }
check() { command -v "$1" &>/dev/null; }

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STOP MODE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if [[ "${1:-}" == "--stop" ]]; then
    echo "Stopping 1ai-Affiliate..."
    pm2 stop "$PM2_APP" 2>/dev/null && ok "PM2 stopped" || warn "PM2 not running"
    sudo systemctl stop php8.4-fpm 2>/dev/null && ok "PHP-FPM stopped" || warn "PHP-FPM not running"
    echo "Done."
    exit 0
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STATUS MODE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if [[ "${1:-}" == "--status" ]]; then
    echo "━━━ 1ai-Affiliate Stack Status ━━━"
    printf "  MySQL:     "; ss -tlnp 2>/dev/null | grep -q "3306" && ok "running (3306)" || fail "not running"
    printf "  Redis:     "; redis-cli ping 2>/dev/null | grep -q PONG && ok "running (6379)" || fail "not running"
    printf "  PHP-FPM:   "; ss -tlnp | grep -q ":$PHP_PORT" && ok "running ($PHP_PORT)" || fail "not running"
    printf "  Node.js:   "; ss -tlnp | grep -q ":$NODE_PORT" && ok "running ($NODE_PORT)" || fail "not running"
    printf "  nginx:     "; ss -tlnp | grep -q ":$NGINX_PORT" && ok "running ($NGINX_PORT)" || fail "not running"
    printf "  PM2:       "; pm2 list 2>/dev/null | grep -q "$PM2_APP" && ok "managed" || fail "not managed"
    echo ""
    pm2 list 2>/dev/null | grep -E "affiliate|name" | head -3
    exit 0
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# DOCKER MODE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if [[ "${1:-}" == "--docker" ]]; then
    echo "Starting 1ai-Affiliate via Docker Compose..."
    cd "$PROJECT_DIR"
    docker compose up -d --build
    echo ""
    docker compose ps
    echo ""
    ok "Docker stack started. Access at http://localhost:$NGINX_PORT"
    exit 0
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# NATIVE MODE (default)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         Starting 1ai-Affiliate Stack (native)               ║"
echo "╚══════════════════════════════════━━══════════════════════════╝"
echo ""

# ── 1. MySQL ─────────────────────────────────────────────────────
printf "  MySQL:     "
if ss -tlnp 2>/dev/null | grep -q "3306"; then
    ok "already running"
else
    sudo systemctl start mysql 2>/dev/null || sudo systemctl start mariadb 2>/dev/null
    sleep 2
    ss -tlnp 2>/dev/null | grep -q "3306" && ok "started" || { fail "failed to start"; exit 1; }
fi

# ── 2. Redis ─────────────────────────────────────────────────────
printf "  Redis:     "
if redis-cli ping 2>/dev/null | grep -q PONG; then
    ok "already running"
else
    sudo systemctl start redis-server 2>/dev/null || redis-server --daemonize yes 2>/dev/null
    sleep 1
    redis-cli ping 2>/dev/null | grep -q PONG && ok "started" || { fail "failed to start"; exit 1; }
fi

# ── 3. PHP-FPM ───────────────────────────────────────────────────
printf "  PHP-FPM:   "
if ss -tlnp | grep -q ":$PHP_PORT"; then
    ok "already running (port $PHP_PORT)"
else
    sudo systemctl start php8.4-fpm 2>/dev/null || sudo systemctl start php8.3-fpm 2>/dev/null
    sleep 2
    ss -tlnp | grep -q ":$PHP_PORT" && ok "started (port $PHP_PORT)" || { fail "failed to start"; exit 1; }
fi

# ── 4. Run DB migrations ────────────────────────────────────────
printf "  Migrations: "
if [ -f "$PROJECT_DIR/scripts/run_migrations.php" ]; then
    php "$PROJECT_DIR/scripts/run_migrations.php" 2>/dev/null && ok "applied" || warn "skipped (may already be applied)"
else
    warn "no migration script found"
fi

# ── 5. Node.js (PM2) ────────────────────────────────────────────
printf "  Node.js:   "
if pm2 list 2>/dev/null | grep -q "$PM2_APP.*online"; then
    ok "already running (PM2)"
else
    cd "$PROJECT_DIR/server"
    pm2 start ecosystem.config.js 2>/dev/null || pm2 start app.js --name "$PM2_APP" --cwd "$PROJECT_DIR/server"
    sleep 2
    pm2 list 2>/dev/null | grep -q "$PM2_APP" && ok "started (PM2)" || { fail "failed to start"; exit 1; }
fi

# ── 6. nginx ─────────────────────────────────────────────────────
printf "  nginx:     "
if ss -tlnp | grep -q ":$NGINX_PORT"; then
    ok "already running (port $NGINX_PORT)"
else
    sudo systemctl start nginx 2>/dev/null
    sleep 1
    ss -tlnp | grep -q ":$NGINX_PORT" && ok "started (port $NGINX_PORT)" || { fail "failed to start"; exit 1; }
fi

# ── 7. Install cron jobs ────────────────────────────────────────
printf "  Cron jobs: "
if crontab -l 2>/dev/null | grep -q "1ai-affiliate"; then
    ok "already installed"
else
    # Add cron jobs for PHP tracking
    (crontab -l 2>/dev/null; cat <<'CRON'
# 1ai-Affiliate cron jobs
*/5 * * * * cd /home/openclaw/.paseo/worktrees/3q6b2aw8/smooth-cobra && php cronjobs/dni.php >> /tmp/1ai-cron-dni.log 2>&1
*/15 * * * * cd /home/openclaw/.paseo/worktrees/3q6b2aw8/smooth-cobra && php cronjobs/health.php >> /tmp/1ai-cron-health.log 2>&1
0 */6 * * * cd /home/openclaw/.paseo/worktrees/3q6b2aw8/smooth-cobra && php cronjobs/attribution-rebuild.php >> /tmp/1ai-cron-attr.log 2>&1
0 2 * * * cd /home/openclaw/.paseo/worktrees/3q6b2aw8/smooth-cobra && php cronjobs/daily-email.php >> /tmp/1ai-cron-email.log 2>&1
CRON
    ) | crontab -
    ok "installed (5 jobs)"
fi

# ── 8. Verify ────────────────────────────────────────────────────
echo ""
echo "━━━ Verification ━━━"
printf "  Health check: "
HEALTH=$(curl -s --max-time 5 http://localhost:$NODE_PORT/health 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','fail'))" 2>/dev/null || echo "fail")
[ "$HEALTH" = "ok" ] && ok "API healthy" || fail "API unhealthy ($HEALTH)"

printf "  nginx proxy:  "
NGINX_STATUS=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://localhost:$NGINX_PORT/ 2>/dev/null)
[ "$NGINX_STATUS" = "200" ] && ok "nginx → Node.js working" || fail "nginx proxy failed ($NGINX_STATUS)"

printf "  PHP tracking: "
PHP_STATUS=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 -H "Host: affiliate.berkahkarya.org" http://localhost:$NGINX_PORT/health 2>/dev/null)
[ "$PHP_STATUS" = "200" ] && ok "PHP-FPM accessible" || warn "PHP-FPM not routed via nginx"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Stack running at http://localhost:$NGINX_PORT                     ║"
echo "║  Public: https://affiliate.berkahkarya.org                  ║"
echo "║                                                             ║"
echo "║  Commands:                                                  ║"
echo "║    ./start.sh --status    Show status                       ║"
echo "║    ./start.sh --stop      Stop services                    ║"
echo "║    ./start.sh --docker    Start via Docker Compose          ║"
echo "║    pm2 logs $PM2_APP      View Node.js logs            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
