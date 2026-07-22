#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VPS_HOST="${VPS_HOST:-root@102.212.246.179}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/corechella}"

cd "$ROOT"

BUNDLE_DIR=""
for candidate in \
  ".next/standalone/.next/standalone" \
  ".next/standalone"; do
  if [[ -f "${candidate}/server.js" ]]; then
    BUNDLE_DIR="${candidate}"
    break
  fi
done

if [[ -z "${BUNDLE_DIR}" ]]; then
  echo "Missing standalone server.js — run: npm run build:production"
  exit 1
fi

echo "==> Using standalone bundle: ${BUNDLE_DIR}"
echo "==> Syncing bundle to ${VPS_HOST}:${REMOTE_DIR}"
ssh "$VPS_HOST" "mkdir -p ${REMOTE_DIR}/deploy ${REMOTE_DIR}/src /var/log/corechella"

rsync -az --delete \
  "${BUNDLE_DIR}/" \
  "${VPS_HOST}:${REMOTE_DIR}/"

rsync -az \
  src/ \
  "${VPS_HOST}:${REMOTE_DIR}/src/"

rsync -az \
  deploy/ecosystem.config.cjs \
  deploy/nginx-corechella.conf \
  deploy/setup-vps-remote.sh \
  deploy/deploy-vps.sh \
  "${VPS_HOST}:${REMOTE_DIR}/deploy/"

if [[ -f package.json ]]; then
  rsync -az package.json package-lock.json next.config.ts \
    "${VPS_HOST}:${REMOTE_DIR}/"
fi

echo "==> Done. Run deploy/setup-vps-remote.sh on the server next."
