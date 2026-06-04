FROM php:8.3-cli-alpine

RUN apk add --no-cache \
    postgresql-dev \
    oniguruma-dev \
    unzip \
    linux-headers \
    $PHPIZE_DEPS \
    && docker-php-ext-install pdo pdo_pgsql mbstring bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY docker/php/conf.d/security.ini /usr/local/etc/php/conf.d/security.ini
COPY . .
RUN composer install --no-dev --optimize-autoloader
RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
