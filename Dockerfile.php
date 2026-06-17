# 1ai-Affiliate PHP Application Dockerfile
# Multi-stage build for production

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BUILD STAGE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FROM composer:2.7 AS builder

WORKDIR /app

# Copy composer files first for caching
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --optimize-autoloader \
    --ignore-platform-req=ext-geoip2 \
    && composer clear-cache

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PRODUCTION STAGE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FROM php:8.3-fpm-alpine

# Install system deps + PHP extensions
RUN apk add --no-cache \
    # Build deps
    $PHPIZE_DEPS \
    # Runtime deps
    nginx \
    supervisor \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libxml2-dev \
    icu-dev \
    oniguruma-dev \
    curl-dev \
    openssl-dev \
    geoip-dev \
    # GeoIP2
    && apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing \
    maxminddb-dev

# Configure and install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mysqli \
    zip \
    gd \
    intl \
    mbstring \
    opcache \
    bcmath \
    sockets \
    exif \
    pcntl \
    # MaxMind DB
    maxminddb

# Install Composer (for runtime)
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Nginx + PHP-FPM Config
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Nginx config for Slim/Slim4 routing
RUN mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled \
    && rm -f /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/php.conf /etc/nginx/conf.d/php.conf
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# PHP.ini
COPY docker/php.ini /usr/local/etc/php/conf.d/99-custom.ini

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# APPLICATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKDIR /var/www/html

# Copy composer files first (for cache)
COPY composer.json composer.lock ./

# Install production deps
RUN composer install --no-dev --no-interaction --no-progress --prefer-dist --optimize-autoloader

# Copy application code
COPY . .

# Create compat symlinks for autoload (legacy namespaces)
RUN ln -snf config 1ai-config 2>/dev/null; \
    ln -snf interfaces 1ai-interfaces 2>/dev/null; \
    ln -snf tracking_support tracking1ai 2>/dev/null; \
    true

# Create writable directories
RUN mkdir -p \
    /var/www/html/storage \
    /var/www/html/logs \
    /var/www/html/cache \
    && chown -R www-data:www-data /var/www/html

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# OPcache Config
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.memory_consumption=128" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.interned_strings_buffer=8" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.max_accelerated_files=4000" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.revalidate_freq=60" >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo "opcache.fast_shutdown=1" >> /usr/local/etc/php/conf.d/opcache.ini

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENTRYPOINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port 9000 for PHP-FPM (nginx proxies to this)
EXPOSE 9000

# Supervisor runs nginx + php-fpm
ENTRYPOINT ["entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]