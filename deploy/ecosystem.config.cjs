/**
 * PM2 — Corechella on a shared 1 vCPU / 2GB VPS
 *
 * Run from repo root after build:
 *   pm2 start deploy/ecosystem.config.cjs --env production
 *
 * Adjust PORT if Wavy/Valerie use 3000/3001.
 */
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const vars = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function resolveServerEntry(appRoot) {
  const candidates = [
    path.join(appRoot, "server.js"),
    path.join(appRoot, ".next", "standalone", "server.js"),
    path.join(appRoot, ".next", "standalone", ".next", "standalone", "server.js"),
  ];

  for (const entry of candidates) {
    if (fs.existsSync(entry)) {
      return { cwd: path.dirname(entry), script: path.basename(entry) };
    }
  }

  return { cwd: appRoot, script: "server.js" };
}

const appRoot = process.env.CORECHELLA_ROOT || "/var/www/corechella";
const fileEnv = loadEnvFile(path.join(appRoot, ".env.production.local"));
const server = resolveServerEntry(appRoot);

module.exports = {
  apps: [
    {
      name: "corechella",
      cwd: server.cwd,
      script: server.script,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_restarts: 15,
      min_uptime: "10s",
      kill_timeout: 5000,
      listen_timeout: 15000,
      max_memory_restart: "450M",
      node_args: "--max-old-space-size=384",
      env_production: {
        NODE_ENV: "production",
        PORT: "3002",
        HOSTNAME: "127.0.0.1",
        LOG_LEVEL: "warn",
        DB_READ_CACHE_MS: "3000",
        MONGODB_MAX_POOL_SIZE: "3",
        NEXT_PUBLIC_APP_URL: "https://corechella.com",
        CORECHELLA_ROOT: appRoot,
        ...fileEnv,
      },
      error_file: "/var/log/corechella/error.log",
      out_file: "/var/log/corechella/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      log_type: "json",
    },
  ],
};
