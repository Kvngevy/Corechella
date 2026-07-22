#!/usr/bin/env bash
set -euo pipefail

# Run on VPS after DNS A records for corechella.com → 102.212.246.179 propagate.

APP_ROOT="/var/www/corechella"

if ! dig +short corechella.com A | grep -q "102.212.246.179"; then
  echo "DNS not ready: corechella.com must resolve to 102.212.246.179"
  echo "Add A records in Truehost DNS, then wait a few minutes and retry."
  exit 1
fi

certbot --nginx -d corechella.com -d www.corechella.com --non-interactive --agree-tos -m admin@corechella.com --redirect || {
  echo "Certbot failed — ensure port 80 is open and DNS has propagated."
  exit 1
}

cp "${APP_ROOT}/deploy/nginx-corechella.conf" /etc/nginx/conf.d/corechella.conf
rm -f /etc/nginx/conf.d/corechella-http.conf
nginx -t
systemctl reload nginx

echo "SSL enabled: https://corechella.com"
