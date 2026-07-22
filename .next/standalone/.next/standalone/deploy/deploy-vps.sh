#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing dependencies"
npm ci

echo "==> Production build + standalone bundle"
export NODE_ENV=production
npm run build:production

echo "==> Pruning dev dependencies"
npm prune --omit=dev

echo "==> Reload PM2"
if command -v pm2 >/dev/null 2>&1; then
  pm2 reload deploy/ecosystem.config.cjs --env production || \
    pm2 start deploy/ecosystem.config.cjs --env production
  pm2 save
else
  echo "PM2 not installed. Start manually:"
  echo "  NODE_ENV=production node .next/standalone/server.js"
fi

echo "==> Done"
