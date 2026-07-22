import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { Redis } from "@upstash/redis";
import { corechella, EARLY_BIRD_ALLOCATION } from "@/lib/data";
import { SERVICE_FEE } from "@/lib/store/defaults";
import {
  getStateCollection,
  isMongoConfigured,
  resetMongoClient,
  STATE_DOCUMENT_ID,
  type PlatformStateDocument,
} from "./mongodb";
import type { DbState, DbUser } from "./types";
import { catalogMetadataChanged, syncTicketCatalog } from "./ticket-catalog";
import { logger } from "./logger";

const DB_KEY = "corechella:state";

let mongoBackoffUntil = 0;
let lastGoodMongoState: DbState | null = null;

const READ_CACHE_MS = Math.max(
  0,
  parseInt(process.env.DB_READ_CACHE_MS ?? "3000", 10) || 0
);
let readCache: { expiresAt: number; state: DbState } | null = null;

function invalidateReadCache() {
  readCache = null;
}

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "admin@corechella.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? "Corechella2026!";

let redis: Redis | null = null;

function getRedis() {
  if (redis) return redis;

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

function getAppRoot() {
  const configured = process.env.CORECHELLA_ROOT?.trim();
  if (configured) return configured;
  return process.cwd();
}

function getFilePaths() {
  const dataDir = process.env.VERCEL
    ? path.join("/tmp", "corechella-data")
    : path.join(getAppRoot(), ".data");

  return { dataDir, dbFile: path.join(dataDir, "corechella.json") };
}

function defaultState(): DbState {
  return {
    users: [],
    tickets: corechella.tickets.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      description: t.description,
      total: t.id === "eb" ? EARLY_BIRD_ALLOCATION : t.remaining,
      remaining: t.remaining,
      sold: 0,
    })),
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
}

async function seedSuperAdmin(state: DbState): Promise<DbState> {
  const exists = state.users.some((u) => u.email === SUPER_ADMIN_EMAIL.toLowerCase());
  if (exists) return state;

  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 12);
  const superAdmin: DbUser = {
    id: "user-super-admin",
    name: "Super Admin",
    email: SUPER_ADMIN_EMAIL.toLowerCase(),
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
  };

  return { ...state, users: [superAdmin, ...state.users] };
}

function mergeStoredState(stored: Partial<DbState>): DbState {
  const base = defaultState();
  const merged: DbState = {
    ...base,
    ...stored,
    users: Array.isArray(stored.users) ? stored.users : base.users,
    tickets: Array.isArray(stored.tickets) && stored.tickets.length ? stored.tickets : base.tickets,
    promos: Array.isArray(stored.promos) ? stored.promos : base.promos,
    orders: Array.isArray(stored.orders) ? stored.orders : base.orders,
    attendees: Array.isArray(stored.attendees) ? stored.attendees : base.attendees,
    nextOrderSequence: stored.nextOrderSequence ?? base.nextOrderSequence,
    earlyBirdIssued: stored.earlyBirdIssued ?? base.earlyBirdIssued,
    earlyBirdRemaining: stored.earlyBirdRemaining ?? base.earlyBirdRemaining,
    earlyBirdClaims: Array.isArray(stored.earlyBirdClaims) ? stored.earlyBirdClaims : base.earlyBirdClaims,
    tableReservationCalls: stored.tableReservationCalls ?? base.tableReservationCalls,
    scanLogs: Array.isArray(stored.scanLogs) ? stored.scanLogs : base.scanLogs,
    ipAttempts: Array.isArray(stored.ipAttempts) ? stored.ipAttempts : base.ipAttempts,
    abuseFlags: Array.isArray(stored.abuseFlags) ? stored.abuseFlags : base.abuseFlags,
  };

  return syncTicketCatalog(merged);
}

type MongoReadResult =
  | { kind: "ok"; state: DbState }
  | { kind: "empty"; connected: true }
  | { kind: "error"; connected: false; error: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readFromMongoOnce(): Promise<MongoReadResult> {
  if (!isMongoConfigured()) {
    return { kind: "error", connected: false, error: "MONGODB_URI is not configured" };
  }

  try {
    const collection = await getStateCollection();
    const doc = await collection.findOne({ _id: STATE_DOCUMENT_ID });

    if (!doc) {
      return { kind: "empty", connected: true };
    }

    const stored: Partial<DbState> = {
      users: doc.users as DbState["users"],
      tickets: doc.tickets as DbState["tickets"],
      promos: doc.promos as DbState["promos"],
      orders: doc.orders as DbState["orders"],
      attendees: doc.attendees as DbState["attendees"],
      nextOrderSequence: doc.nextOrderSequence as number,
      earlyBirdIssued: doc.earlyBirdIssued as number | undefined,
      earlyBirdRemaining: doc.earlyBirdRemaining as number | undefined,
      earlyBirdClaims: doc.earlyBirdClaims as DbState["earlyBirdClaims"],
      tableReservationCalls: doc.tableReservationCalls as number | undefined,
      scanLogs: doc.scanLogs as DbState["scanLogs"],
      ipAttempts: doc.ipAttempts as DbState["ipAttempts"],
      abuseFlags: doc.abuseFlags as DbState["abuseFlags"],
    };

    return { kind: "ok", state: mergeStoredState(stored) };
  } catch (error) {
    resetMongoClient();
    return { kind: "error", connected: false, error: String(error) };
  }
}

async function readFromMongo(): Promise<MongoReadResult> {
  if (!isMongoConfigured()) {
    return { kind: "error", connected: false, error: "MONGODB_URI is not configured" };
  }

  if (Date.now() < mongoBackoffUntil) {
    if (lastGoodMongoState) {
      return { kind: "ok", state: structuredClone(lastGoodMongoState) };
    }
    return { kind: "error", connected: false, error: "MongoDB temporarily unavailable (backoff)" };
  }

  const maxAttempts = 3;
  let lastError = "MongoDB read failed";

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await readFromMongoOnce();

    if (result.kind === "ok") {
      mongoBackoffUntil = 0;
      lastGoodMongoState = structuredClone(result.state);
      return result;
    }

    if (result.kind === "empty") {
      mongoBackoffUntil = 0;
      return result;
    }

    lastError = result.error;
    logger.error("MongoDB read failed", { attempt: attempt + 1, error: result.error });

    if (attempt < maxAttempts - 1) {
      await sleep(500 * (attempt + 1));
    }
  }

  mongoBackoffUntil = Date.now() + 10_000;

  if (lastGoodMongoState) {
    logger.warn("Serving last known MongoDB state after read failures");
    return { kind: "ok", state: structuredClone(lastGoodMongoState) };
  }

  return { kind: "error", connected: false, error: lastError };
}

async function writeToMongo(state: DbState): Promise<boolean> {
  if (!isMongoConfigured()) return false;
  if (Date.now() < mongoBackoffUntil) return false;

  try {
    const collection = await getStateCollection();
    const document: PlatformStateDocument = {
      _id: STATE_DOCUMENT_ID,
      users: state.users,
      tickets: state.tickets,
      promos: state.promos,
      orders: state.orders,
      attendees: state.attendees,
      nextOrderSequence: state.nextOrderSequence,
      earlyBirdIssued: state.earlyBirdIssued,
      earlyBirdRemaining: state.earlyBirdRemaining,
      earlyBirdClaims: state.earlyBirdClaims,
      tableReservationCalls: state.tableReservationCalls,
      scanLogs: state.scanLogs,
      ipAttempts: state.ipAttempts,
      abuseFlags: state.abuseFlags,
      updatedAt: new Date().toISOString(),
    };

    await collection.replaceOne({ _id: STATE_DOCUMENT_ID }, document, { upsert: true });
    lastGoodMongoState = structuredClone(state);
    mongoBackoffUntil = 0;
    return true;
  } catch (error) {
    logger.error("MongoDB write failed", { error: String(error) });
    resetMongoClient();
    mongoBackoffUntil = Date.now() + 10_000;
    return false;
  }
}

async function readFromRedis(): Promise<DbState | null> {
  const client = getRedis();
  if (!client) return null;

  const stored = await client.get<DbState>(DB_KEY);
  if (!stored) return null;
  return mergeStoredState(stored);
}

async function writeToRedis(state: DbState): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;

  try {
    await client.set(DB_KEY, state);
    return true;
  } catch (error) {
    logger.error("Redis write failed", { error: String(error) });
    return false;
  }
}

function readFromFile(): DbState | null {
  const { dataDir, dbFile } = getFilePaths();

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dbFile)) return null;
    const parsed = JSON.parse(fs.readFileSync(dbFile, "utf-8")) as Partial<DbState>;
    return mergeStoredState(parsed);
  } catch {
    return null;
  }
}

function writeToFile(state: DbState) {
  const { dataDir, dbFile } = getFilePaths();

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbFile, JSON.stringify(state, null, 2));
}

async function loadFromLegacyStores(): Promise<DbState | null> {
  const client = getRedis();
  if (client) {
    try {
      const fromRedis = await readFromRedis();
      if (fromRedis) return fromRedis;
    } catch (error) {
      logger.error("Redis read failed", { error: String(error) });
      const fromFile = readFromFile();
      if (fromFile) return fromFile;
      throw error;
    }
  }

  return readFromFile();
}

async function loadRawState(): Promise<DbState> {
  if (isMongoConfigured()) {
    const mongoResult = await readFromMongo();

    if (mongoResult.kind === "ok") {
      return mongoResult.state;
    }

    if (mongoResult.kind === "error") {
      logger.error("MongoDB is configured but unreachable; refusing file fallback", {
        error: mongoResult.error,
      });
      throw new Error(`MongoDB unavailable: ${mongoResult.error}`);
    }

    const legacy = await loadFromLegacyStores();
    if (legacy) {
      logger.info("Migrating legacy platform state into MongoDB");
      await writeToMongo(legacy);
      return legacy;
    }

    return defaultState();
  }

  const legacy = await loadFromLegacyStores();
  if (legacy) return legacy;

  return defaultState();
}

function mergeDbStates(base: DbState, incoming: DbState): DbState {
  const ordersMap = new Map(base.orders.map((o) => [o.id, o]));
  incoming.orders.forEach((o) => ordersMap.set(o.id, o));

  const attendeesMap = new Map(base.attendees.map((a) => [a.id, a]));
  incoming.attendees.forEach((a) => attendeesMap.set(a.id, a));

  const usersMap = new Map(base.users.map((u) => [u.id, u]));
  incoming.users.forEach((u) => usersMap.set(u.id, u));

  const promosMap = new Map(base.promos.map((p) => [p.id, p]));
  incoming.promos.forEach((p) => promosMap.set(p.id, p));

  const ticketsMap = new Map(base.tickets.map((t) => [t.id, t]));
  incoming.tickets.forEach((t) => {
    const baseTicket = ticketsMap.get(t.id);
    if (!baseTicket) {
      ticketsMap.set(t.id, t);
      return;
    }

    const baseSold = baseTicket.sold ?? 0;
    const incomingSold = t.sold ?? 0;

    if (incomingSold > baseSold) {
      ticketsMap.set(t.id, { ...baseTicket, ...t });
      return;
    }

    ticketsMap.set(t.id, {
      ...t,
      ...baseTicket,
      sold: baseSold,
      remaining: baseTicket.remaining,
      total: baseTicket.total,
    });
  });

  return {
    ...incoming,
    users: Array.from(usersMap.values()),
    tickets: Array.from(ticketsMap.values()),
    promos: Array.from(promosMap.values()),
    orders: Array.from(ordersMap.values()),
    attendees: Array.from(attendeesMap.values()),
    nextOrderSequence: Math.max(base.nextOrderSequence, incoming.nextOrderSequence),
    earlyBirdIssued: Math.max(base.earlyBirdIssued ?? 0, incoming.earlyBirdIssued ?? 0),
    earlyBirdRemaining: incoming.earlyBirdRemaining ?? base.earlyBirdRemaining,
    earlyBirdClaims: incoming.earlyBirdClaims ?? base.earlyBirdClaims,
    tableReservationCalls: Math.max(base.tableReservationCalls ?? 0, incoming.tableReservationCalls ?? 0),
    scanLogs: [...(base.scanLogs ?? []), ...(incoming.scanLogs ?? [])].slice(0, 2000),
    ipAttempts: incoming.ipAttempts ?? base.ipAttempts,
    abuseFlags: incoming.abuseFlags ?? base.abuseFlags,
  };
}

async function persistState(state: DbState) {
  if (isMongoConfigured()) {
    const savedToMongo = await writeToMongo(state);
    if (savedToMongo) return;

    throw new Error("MongoDB write failed while MongoDB is configured");
  }

  const savedToRedis = await writeToRedis(state);
  if (savedToRedis) return;

  writeToFile(state);
}

export async function getDb(): Promise<DbState> {
  const now = Date.now();
  if (READ_CACHE_MS > 0 && readCache && now < readCache.expiresAt) {
    return structuredClone(readCache.state);
  }

  const loaded = await loadRawState();
  const beforeTickets = loaded.tickets;
  const synced = syncTicketCatalog(loaded);
  const seeded = await seedSuperAdmin(synced);

  const addedSuperAdmin = seeded.users.length > synced.users.length;
  const catalogChanged = catalogMetadataChanged(beforeTickets, seeded.tickets);

  if (addedSuperAdmin || catalogChanged) {
    await persistState(seeded);
    invalidateReadCache();
  }

  if (READ_CACHE_MS > 0) {
    readCache = { state: structuredClone(seeded), expiresAt: now + READ_CACHE_MS };
  }

  return seeded;
}

export async function saveDb(state: DbState) {
  invalidateReadCache();
  await persistState(state);
}

export async function withDb<T>(fn: (state: DbState) => T | Promise<T>): Promise<T> {
  invalidateReadCache();
  const maxAttempts = 4;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const state = await getDb();
    const result = await fn(state);

    const latest = await loadRawState();
    const seededLatest = await seedSuperAdmin(latest);
    const merged = mergeDbStates(seededLatest, state);
    syncTicketCatalog(merged);
    await persistState(merged);

    return result;
  }

  throw new Error("Failed to persist database state");
}

export async function resetPlatformState(): Promise<DbState> {
  invalidateReadCache();
  const fresh = await seedSuperAdmin(syncTicketCatalog(defaultState()));
  await persistState(fresh);
  return fresh;
}

export { SERVICE_FEE, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD };
