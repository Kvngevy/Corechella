#!/usr/bin/env node
/**
 * Wipes all platform data (orders, attendees, promos, logs, test users)
 * and restores fresh ticket inventory. Keeps only the super admin account.
 *
 * Usage: node scripts/reset-platform-state.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
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
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(root, ".env.local"));
loadEnvFile(resolve(root, ".env.production.local"));

const EARLY_BIRD_ALLOCATION = 300;
const REGULAR_TICKET_PRICE = 3000;
const VIP_TICKET_PRICE = 25000;

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME?.trim() || "corechella";
const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL ?? "admin@corechella.com").toLowerCase();
const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

if (!superAdminPassword) {
  console.error("SUPER_ADMIN_PASSWORD is required in .env.production.local or .env.local");
  process.exit(1);
}

if (!uri) {
  console.error("MONGODB_URI is required in .env.local");
  process.exit(1);
}

const freshState = {
  users: [],
  tickets: [
    {
      id: "eb",
      name: "Early Bird",
      price: 0,
      description: "Free limited early access — 300 tickets only",
      total: EARLY_BIRD_ALLOCATION,
      remaining: EARLY_BIRD_ALLOCATION,
      sold: 0,
    },
    {
      id: "reg",
      name: "Regular Ticket",
      price: REGULAR_TICKET_PRICE,
      description: "General admission",
      total: 5000,
      remaining: 5000,
      sold: 0,
    },
    {
      id: "vip",
      name: "VIP",
      price: VIP_TICKET_PRICE,
      description: "Premium viewing, lounge & fast entry",
      total: 500,
      remaining: 500,
      sold: 0,
    },
  ],
  promos: [],
  orders: [],
  attendees: [],
  nextOrderSequence: 1,
  earlyBirdIssued: 0,
  earlyBirdRemaining: EARLY_BIRD_ALLOCATION,
  earlyBirdClaims: [],
  tableReservationCalls: 0,
  scanLogs: [],
  ipAttempts: [],
  abuseFlags: [],
};

const passwordHash = await bcrypt.hash(superAdminPassword, 12);
freshState.users = [
  {
    id: "user-super-admin",
    name: "Super Admin",
    email: superAdminEmail,
    passwordHash,
    role: "super_admin",
    permissions: [
      "manage_orders",
      "manage_attendees",
      "check_in",
      "manage_promos",
      "manage_events",
    ],
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

const client = new MongoClient(uri);
await client.connect();

const collection = client.db(dbName).collection("platform_state");
const result = await collection.replaceOne(
  { _id: "main" },
  { _id: "main", ...freshState, updatedAt: new Date().toISOString() },
  { upsert: true }
);

await client.close();

console.log("Platform reset complete.");
console.log(`  MongoDB: ${dbName}.platform_state (matched: ${result.matchedCount}, modified: ${result.modifiedCount})`);
console.log(`  Super admin: ${superAdminEmail}`);
console.log("  Cleared: orders, attendees, promos, scan logs, early-bird claims, test users");
console.log("  Tickets reset: Early Bird 300/300, Regular 5000, VIP 500");
