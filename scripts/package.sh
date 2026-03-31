#!/bin/sh

set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
ARTIFACT_NAME="korean-attachment-nfc-normalizer-0.1.0.xpi"
ARTIFACT_PATH="$DIST_DIR/$ARTIFACT_NAME"
TMP_DIR="$(mktemp -d "$DIST_DIR/package.XXXXXX")"
TMP_ZIP="$TMP_DIR/$ARTIFACT_NAME"

mkdir -p "$DIST_DIR"
rm -f "$ARTIFACT_PATH"

cd "$ROOT_DIR"

zip -r "$TMP_ZIP" \
  manifest.json \
  background.js \
  src \
  icons \
  options \
  -x '**/.DS_Store'

mv "$TMP_ZIP" "$ARTIFACT_PATH"
rmdir "$TMP_DIR"

echo "Created: $ARTIFACT_PATH"
