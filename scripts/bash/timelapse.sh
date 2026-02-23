#!/bin/bash

# Directorios de trabajo
INPUT_DIR="/home/juanmoreno/weather-station/storage/fotos"
OUTPUT_DIR="/home/juanmoreno/weather-station/storage/timelapses"
THUMBNAIL_DIR="$OUTPUT_DIR/thumbnails"

# Nombre de archivo según la fecha (día anterior)
DATE=$(date +%F)
OUTPUT_FILE="$OUTPUT_DIR/$DATE.mp4"
OUTPUT_THUMBNAIL="$THUMBNAIL_DIR/$DATE.jpg"

# Crear carpetas si no existen
mkdir -p "$OUTPUT_DIR"
mkdir -p "$THUMBNAIL_DIR"

# Generar timelapse con ffmpeg
/usr/bin/ffmpeg -y -framerate 15 -pattern_type glob -i "$INPUT_DIR/*.jpg" \
  -vf "scale=-2:1440" \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset superfast "$OUTPUT_FILE"

# Si el vídeo se creó correctamente, generar miniatura
if [ -f "$OUTPUT_FILE" ]; then
  # Calcular duración total del vídeo
  DURATION=$(/usr/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUTPUT_FILE")
  DURATION=${DURATION%.*}

  # Segundo para la miniatura
  if [ "$DURATION" -gt 12 ]; then
    THUMB_SECOND=10
  else
    THUMB_SECOND=$((DURATION / 2))
  fi

  # Generar miniatura
  /usr/bin/ffmpeg -y -ss $THUMB_SECOND -i "$OUTPUT_FILE" -frames:v 1 -vf "scale=640:-1" "$OUTPUT_THUMBNAIL"
fi
