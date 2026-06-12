# Usar la imagen oficial de PHP con Apache
FROM php:8.1-apache

# Actualizar e instalar extensiones necesarias
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    nano \
    libmagickwand-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd calendar \
    && pecl install imagick \
    && docker-php-ext-enable imagick calendar

# Configurar ajustes personalizados de PHP
RUN echo "upload_max_filesize = 50M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "post_max_size = 60M" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "max_execution_time = 300" >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "memory_limit = 256M" >> /usr/local/etc/php/conf.d/custom.ini

# Copiar Composer desde su imagen oficial
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configurar el directorio de trabajo
WORKDIR /var/www/html

# Copiar el proyecto al contenedor
COPY . .



# Instalar las dependencias del proyecto
RUN composer install --no-dev --optimize-autoloader

# Asignar permisos necesarios
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Generar la clave de la aplicación y enlazar el almacenamiento

# Optimizar la aplicación
RUN php artisan optimize
RUN php artisan storage:link
# Exponer el puerto 8000 para el servidor Laravel
EXPOSE 8000

# Comando por defecto para ejecutar el servidor Laravel
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]