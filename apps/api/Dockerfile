FROM php:8.3-fpm-alpine
RUN apk add --no-cache postgresql-dev && docker-php-ext-install pdo pdo_pgsql
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY . .
RUN composer install --no-dev --optimize-autoloader
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
