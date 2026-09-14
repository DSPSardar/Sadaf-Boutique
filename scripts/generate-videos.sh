#!/usr/bin/env bash
# Generates short muted preview clips (slow zoom on the still) for the assets listed in
# VIDEO_ASSETS (src/data/assets.ts). Output: public/products/<id>/preview.mp4 (720x900, 5 s, h264).
set -euo pipefail
cd "$(dirname "$0")/.."
ids=$(grep -A 12 'VIDEO_ASSETS' src/data/assets.ts | grep -oE '"[0-9a-f]{8}"' | tr -d '"')
for id in $ids; do
  src=$(ls assets/source/${id}*.jp*g | head -1)
  out="public/products/${id}/preview.mp4"
  mkdir -p "public/products/${id}"
  ffmpeg -y -loglevel error -loop 1 -i "$src" -t 5 \
    -vf "scale=1440:1800:force_original_aspect_ratio=increase,crop=1440:1800,zoompan=z='min(zoom+0.0009,1.14)':d=150:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=720x900:fps=30,format=yuv420p" \
    -c:v libx264 -profile:v main -preset slow -crf 30 -movflags +faststart -an "$out"
  printf '%s %s\n' "$out" "$(du -h "$out" | cut -f1)"
done
