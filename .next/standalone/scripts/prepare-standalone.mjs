#!/usr/bin/env node
/**
 * Copies static assets into the Next.js standalone output (required for self-hosted deploy).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const nestedStandaloneDir = path.join(root, ".next", "standalone");
const standaloneDir = fs.existsSync(path.join(root, "server.js"))
  ? root
  : nestedStandaloneDir;
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

if (!fs.existsSync(standaloneDir)) {
  console.error("Run `npm run build` first — .next/standalone not found.");
  process.exit(1);
}

copyRecursive(publicDir, path.join(standaloneDir, "public"));
copyRecursive(staticDir, path.join(standaloneDir, ".next", "static"));

const serverJs = path.join(standaloneDir, "server.js");
if (fs.existsSync(serverJs)) {
  const marker = "require('./scripts/load-env.cjs')";
  let source = fs.readFileSync(serverJs, "utf8");
  if (!source.includes(marker)) {
    source = `${marker}\n\n${source}`;
    fs.writeFileSync(serverJs, source);
    console.log("Injected env loader into standalone server.js");
  }
}

console.log("Standalone bundle prepared:", standaloneDir);
