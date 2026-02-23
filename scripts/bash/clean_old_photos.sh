#!/bin/bash
# Script para borrar fotos con más de 24 horas en storage/fotos y storage/fotos/webp

# Rutas de las carpetas donde se guardan las fotos
FOTOS_JPG_DIR="/home/juanmoreno/weather-station/storage/fotos"
FOTOS_WEBP_DIR="/home/juanmoreno/weather-station/storage/fotos/webp"

# Borrar JPGs con más de 24h
find "$FOTOS_JPG_DIR" -type f -name "*.jpg" -mmin +1440 -exec rm {} \;

# Borrar WEBPs con más de 24h
find "$FOTOS_WEBP_DIR" -type f -name "*.webp" -mmin +1440 -exec rm {} \;

echo "✅ Fotos antiguas eliminadas en:"
echo " - $FOTOS_JPG_DIR"
echo " - $FOTOS_WEBP_DIR"
