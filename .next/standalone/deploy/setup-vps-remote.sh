#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/var/www/corechella"
ENV_FILE="${APP_ROOT}/.env.production.local"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Create ${ENV_FILE} first (copy from deploy/env.production.example)."
  exit 1
fi

mkdir -p /var/log/corechella /var/www/certbot

if [[ ! -f /etc/nginx/conf.d/corechella-http.conf ]]; then
  cat > /etc/nginx/conf.d/corechella-http.conf <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name corechella.com www.corechella.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /_next/static/ {
        alias /var/www/corechella/.next/static/;
        access_log off;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /images/ {
        alias /var/www/corechella/public/images/;
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
    }
}
NGINX
fi

nginx -t
systemctl reload nginx

cd "${APP_ROOT}"
export CORECHELLA_ROOT="${APP_ROOT}"

if pm2 describe corechella >/dev/null 2>&1; then
  pm2 delete corechella || true
fi

pm2 start "${APP_ROOT}/deploy/ecosystem.config.cjs" --env production
pm2 save

echo "Corechella running on port 3002."
echo "After DNS A records point here, run:"
echo "  certbot --nginx -d corechella.com -d www.corechella.com"
echo "  cp ${APP_ROOT}/deploy/nginx-corechella.conf /etc/nginx/conf.d/corechella.conf"
echo "  rm -f /etc/nginx/conf.d/corechella-http.conf"
echo "  nginx -t && systemctl reload nginx"
