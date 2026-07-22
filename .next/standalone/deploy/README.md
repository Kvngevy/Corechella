# Corechella VPS deployment (1 vCPU · 2GB RAM)

Shared host with **Wavy** and **Valerie** on `102.212.246.179`.

## DNS (Truehost / Cloudoon)

In the **corechella.com** DNS zone, add **two A records** (keep existing MX/TXT/NS):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `102.212.246.179` | 14400 |
| A | `www` | `102.212.246.179` | 14400 |

Do **not** remove MX, SPF, DMARC, or DKIM records — email will keep working.

## Deploy from your Mac

```bash
npm run build:production
chmod +x deploy/rsync-to-vps.sh
./deploy/rsync-to-vps.sh
ssh root@102.212.246.179 '/var/www/corechella/deploy/setup-vps-remote.sh'
```

## Enable SSL (after DNS propagates)

```bash
scp deploy/enable-ssl-remote.sh root@102.212.246.179:/var/www/corechella/deploy/
ssh root@102.212.246.179 'chmod +x /var/www/corechella/deploy/enable-ssl-remote.sh && /var/www/corechella/deploy/enable-ssl-remote.sh'
```

Or on the VPS directly:

```bash
certbot --nginx -d corechella.com -d www.corechella.com
```

## Quick deploy (build on VPS — uses more RAM)

```bash
chmod +x deploy/deploy-vps.sh
cp deploy/env.production.example .env.production.local
# edit secrets, then:
./deploy/deploy-vps.sh
```

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node 20+ standalone (`output: "standalone"`) |
| Process | PM2 fork, **1 instance** (do not cluster on 1 vCPU) |
| Proxy | nginx (static assets + gzip) |
| DB | **External MongoDB Atlas** recommended |
| Images | `sharp` + AVIF/WebP via Next Image |

## RAM estimate (after deploy)

Assumes MongoDB/Redis are **external** (not on this VPS).

| Component | Typical RSS |
|-----------|-------------|
| Corechella (Node, heap cap 320MB) | **280–380 MB** |
| PM2 supervisor | ~15–25 MB |
| nginx | ~10–20 MB |
| OS + buffers | ~200–350 MB |
| **Corechella stack subtotal** | **~505–775 MB** |

Leave headroom for co-hosted apps:

| App | Suggested PM2 `max_memory_restart` |
|-----|-------------------------------------|
| Corechella | 380M (configured) |
| Wavy | ~400–500M |
| Valerie | ~400–500M |

**Total with all three on 2GB:** ~1.3–1.7 GB under normal load — tight but viable if:

- Only **one Node instance** per app
- MongoDB **not** on this box
- `LOG_LEVEL=warn` in production
- nginx serves `/_next/static` and `/images` directly

If RAM spikes during builds, run `npm run build` **off-peak** or on CI, then rsync `.next/standalone` to the VPS.

## Files

- `ecosystem.config.cjs` — PM2 memory limits & logging
- `nginx-corechella.conf.example` — reverse proxy + cache headers
- `env.production.example` — environment template
- `deploy-vps.sh` — build & reload script

## Manual start (no PM2)

```bash
npm run build:production
NODE_ENV=production PORT=3002 node .next/standalone/server.js
```
