#!/usr/bin/env bash
# 1ai-Affiliate unified test runner.
# Runs PHP unit tests + JS unit tests in one command.
# Usage: ./test.sh [php|js|all]
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# PSR-4 autoload compatibility symlinks for stale vendor/ (see install.sh)
ensure_autoload_symlinks() {
    declare -A symlinks=(
        ["1ai-config"]="config"
        ["1ai-interfaces"]="interfaces"
        ["tracking1ai"]="tracking_support"
    )
    for src in "${!symlinks[@]}"; do
        local dst="${symlinks[$src]}"
        if [ -d "$SCRIPT_DIR/$dst" ] && [ ! -e "$SCRIPT_DIR/$src" ]; then
            ln -s "$dst" "$SCRIPT_DIR/$src" 2>/dev/null
        fi
    done
}

ensure_autoload_symlinks

MODE="${1:-all}"
FAILED=0

run_php() {
    echo ""
    echo "▶ PHP unit tests (phpunit)"
    echo "────────────────────────────────────────"
    if [ -d vendor ]; then
        vendor/bin/phpunit --testsuite default 2>&1 | tail -20 || FAILED=1
    else
        echo "vendor/ missing — run ./install.sh first"; FAILED=1
    fi
}

run_js() {
    echo ""
    echo "▶ JS unit tests (jest)"
    echo "────────────────────────────────────────"
    if [ -d server/node_modules ]; then
        (cd server && npx jest --testPathIgnorePatterns=ui.spec 2>&1 | tail -25) || FAILED=1
    else
        echo "server/node_modules/ missing — run npm install in server/"; FAILED=1
    fi
}

case "$MODE" in
    php) run_php ;;
    js)  run_js ;;
    all) run_php; run_js ;;
    *) echo "Usage: $0 [php|js|all]"; exit 2 ;;
esac

if [ $FAILED -ne 0 ]; then
    echo ""
    echo "✗ Tests failed"
    exit 1
fi
echo ""
echo "✓ All tests passed"
