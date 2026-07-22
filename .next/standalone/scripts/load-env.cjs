/**
 * Loads .env files before the Next.js standalone server starts.
 * PM2 also injects env vars, but direct `node server.js` runs need this.
 */
const fs = require("fs");
const path = require("path");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

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

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function loadEnvFromRoots(roots) {
  for (const root of roots) {
    if (!root) continue;
    loadEnvFile(path.join(root, ".env.production.local"));
    loadEnvFile(path.join(root, ".env.local"));
    loadEnvFile(path.join(root, ".env"));
  }
}

const standaloneDir = path.join(__dirname, "..");
const appRoot = process.env.CORECHELLA_ROOT || path.join(standaloneDir, "..");

loadEnvFromRoots([appRoot, standaloneDir]);

if (!process.env.CORECHELLA_ROOT) {
  process.env.CORECHELLA_ROOT = appRoot;
}

module.exports = { loadEnvFile, loadEnvFromRoots };
