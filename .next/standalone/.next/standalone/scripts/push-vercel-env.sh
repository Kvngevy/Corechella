#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

TARGET="${1:-production}"

add_env() {
  local key="$1"
  local value="$2"
  echo "Setting $key ($TARGET)..."
  if [[ "$key" == NEXT_PUBLIC_* ]]; then
    vercel env add "$key" "$TARGET" --value "$value" --yes --force < /dev/null
  else
    vercel env add "$key" "$TARGET" --value "$value" --yes --force --sensitive < /dev/null
  fi
}

APP_URL="${NEXT_PUBLIC_APP_URL:-https://corechella.vercel.app}"

add_env NEXT_PUBLIC_APP_URL "$APP_URL"
add_env WAVY_API_BASE "https://api.wavy.ng"

if [[ -f .env.local ]]; then
  get_var() {
    grep -E "^${1}=" .env.local | head -1 | cut -d= -f2- | tr -d '\r'
  }
  for key in MONGODB_URI MONGODB_DB_NAME JWT_SECRET QR_SECRET SUPER_ADMIN_EMAIL SUPER_ADMIN_PASSWORD NEXT_PUBLIC_WAVY_PUBLISHABLE_KEY WAVY_SECRET_KEY WAVY_WEBHOOK_SECRET; do
    value="$(get_var "$key" || true)"
    if [[ -n "${value:-}" ]]; then
      add_env "$key" "$value"
    fi
  done
fi

echo "Done ($TARGET)."
