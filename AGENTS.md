# Corechella

Corechella is a full-stack **Next.js 16** event-ticketing platform for a music festival. It is a single application (UI + API route handlers), not a monorepo.

## Cursor Cloud specific instructions

- **The app does NOT live at the repo root.** The runnable application (source, `package.json`, `next.config.ts`, `node_modules`) lives in `/workspace/.next/standalone/`. Run all `npm` commands from that directory. The repo root only holds `deploy/` config and a stub `package-lock.json`.
- **No external services are required for local development.** The data layer (`src/lib/server/db.ts`) automatically falls back to a local JSON file at `.next/standalone/.data/corechella.json` when `MONGODB_URI` and Redis (`KV_REST_API_*`) env vars are unset. MongoDB, Redis, and the Wavy payment gateway are only needed for production-parity / paid-checkout testing.
- **Dev server:** `cd .next/standalone && npm run dev` serves `http://localhost:3000`.
- **Lint:** `cd .next/standalone && npm run lint`. Note: lint currently reports several pre-existing errors/warnings in the checked-in code; a clean exit is not expected.
- **Tests:** there is no automated test suite (no `test` script).
- **Free checkout works offline:** when Wavy is not configured, orders with total ≤ minimum auto-complete, so the free Early Bird ticket flow (claim → QR ticket) can be exercised end-to-end without payment credentials.
- **Dev admin login:** a super-admin (`admin@corechella.com`, password `dev-only-change-me`) is auto-seeded on first DB read in non-production; log in at `/auth/admin` to reach `/admin`.
- **Do not commit `node_modules`.** `npm install` adds many untracked files under `.next/standalone/node_modules/`; commit only intended source/doc changes.
- Standard build/deploy commands live in `.next/standalone/package.json` scripts and `.next/standalone/deploy/`.
