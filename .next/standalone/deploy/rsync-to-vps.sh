#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VPS_HOST="${VPS_HOST:-root@102.212.246.179}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/corechella}"

cd "$ROOT"

if [[ ! -d .next/standalone ]]; then
  echo "Missing .next/standalone — run: npm run build:production"
  exit 1
fi

echo "==> Syncing standalone bundle to ${VPS_HOST}:${REMOTE_DIR}"
ssh "$VPS_HOST" "mkdir -p ${REMOTE_DIR}/deploy ${REMOTE_DIR}/.next/standalone /var/log/corechella"

rsync -az --delete \
  .next/standalone/ \
  "${VPS_HOST}:${REMOTE_DIR}/.next/standalone/"

rsync -az \
  deploy/ecosystem.config.cjs \
  deploy/nginx-corechella.conf \
  "${VPS_HOST}:${REMOTE_DIR}/deploy/"

echo "==> Done. Run deploy/setup-vps-remote.sh on the server next."
