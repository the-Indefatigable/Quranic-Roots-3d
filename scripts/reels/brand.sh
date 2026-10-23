#!/bin/sh
# Screenshot every piece of channel art in brand.html into <out-dir> (default ./out/brand).
OUT=${1:-out/brand}; mkdir -p "$OUT"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PAGE="file://$(cd "$(dirname "$0")" && pwd)/brand.html"
PROFILE=$(mktemp -d)
shot() { "$CH" --headless=new --hide-scrollbars --no-first-run --user-data-dir="$PROFILE" --virtual-time-budget=5000 \
  --window-size="$2" --screenshot="$OUT/$1.png" "$PAGE#$1" 2>/dev/null; }
shot profile 1080,1080; shot banner 2560,1440; shot header 1500,500
for r in hamd rahma-quiz sajada fatiha-1; do shot cover-$r 1080,1920; done
for i in 1 2 3 4 5 6; do shot slide-$i 1080,1350; done
rm -rf "$PROFILE"; ls "$OUT"
