#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies (including dev deps for build)"
unset NODE_ENV
npm ci

echo "==> Production build + standalone bundle"
NODE_ENV=production npm run build:production

echo "==> Pruning dev dependencies"
npm prune --omit=dev

echo "==> Reload PM2"
export CORECHELLA_ROOT="${CORECHELLA_ROOT:-/var/www/corechella}"
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload deploy/ecosystem.config.cjs --env production --update-env || \
    pm2 start deploy/ecosystem.config.cjs --env production
  pm2 save
else
  echo "PM2 not installed. Start manually:"
  echo "  CORECHELLA_ROOT=${CORECHELLA_ROOT} NODE_ENV=production node server.js"
fi

echo "==> Done"
