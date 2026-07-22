#!/usr/bin/env node
/**
 * Copies static assets into the Next.js standalone output (required for self-hosted deploy).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const nestedStandaloneDir = path.join(root, ".next", "standalone");
const staticDir = path.join(root, ".next", "static");
const publicDir = path.join(root, "public");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Missing source path: ${src}`);
    process.exit(1);
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

if (!fs.existsSync(nestedStandaloneDir)) {
  console.error("Run `npm run build` first — .next/standalone not found.");
  process.exit(1);
}

copyRecursive(publicDir, path.join(nestedStandaloneDir, "public"));
copyRecursive(staticDir, path.join(nestedStandaloneDir, ".next", "static"));

// Keep a top-level server.js in sync with the freshly built bundle.
const nestedServer = path.join(nestedStandaloneDir, "server.js");
const rootServer = path.join(root, "server.js");
if (fs.existsSync(nestedServer)) {
  fs.copyFileSync(nestedServer, rootServer);
}

console.log("Standalone bundle prepared:", nestedStandaloneDir);
