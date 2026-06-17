#!/bin/sh
# Entrypoint for 1ai-Affiliate PHP container
# Runs migrations, sets up log dirs, then starts supervisord

set -e

echo "[entrypoint] Starting 1ai-Affiliate PHP container..."

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CREATE LOG DIRECTORIES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
mkdir -p /var/log/nginx /var/log/php-fpm /var/log/supervisor
chown -R www-data:www-data /var/log/nginx /var/log/php-fpm /var/log/supervisor

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# RUN MIGRATIONS (if database is ready)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
run_migrations() {
    echo "[entrypoint] Waiting for database..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt 30 ]; do
        if php -r "
            \$conn = @new mysqli(getenv('DB_HOST'), getenv('DB_USER'), getenv('DB_PASS'), getenv('DB_NAME'));
            if (\$conn->connect_error) {
                exit(1);
            }
            echo 'OK';
            \$conn->close();
        " 2>/dev/null; then
            echo "[entrypoint] Database connected"
            break
        fi
        attempt=$((attempt + 1))
        sleep 2
    done

    if [ $attempt -eq 30 ]; then
        echo "[entrypoint] WARNING: Database not ready after 60s, skipping migrations"
        return
    fi

    echo "[entrypoint] Running migrations..."
    if [ -f /var/www/html/scripts/migrate.php ]; then
        php /var/www/html/scripts/migrate.php 2>&1 || echo "[entrypoint] Migration warning (continuing)"
    elif [ -f /var/www/html/scripts/migrate.sh ]; then
        bash /var/www/html/scripts/migrate.sh 2>&1 || echo "[entrypoint] Migration warning (continuing)"
    else
        echo "[entrypoint] No migration script found, skipping"
    fi
}

run_migrations

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# COMPOSER AUTLOAD SYMLINKS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cd /var/www/html
for src in 1ai-config 1ai-interfaces tracking1ai; do
    dst=""
    case "$src" in
        "1ai-config") dst="config" ;;
        "1ai-interfaces") dst="interfaces" ;;
        "tracking1ai") dst="tracking_support" ;;
    esac
    if [ -d "$dst" ] && [ ! -e "$src" ]; then
        ln -snf "$dst" "$src"
        echo "[entrypoint] Created compat symlink: $src -> $dst"
    fi
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CREATE WRITABLE DIRS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
mkdir -p /var/www/html/storage /var/www/html/logs /var/www/html/cache
chown -R www-data:www-data /var/www/html/storage /var/www/html/logs /var/www/html/cache

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# START SUPERVISORD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf