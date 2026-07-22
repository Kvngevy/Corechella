import { MongoClient, type Collection, type Db } from "mongodb";
import type { DbState } from "./types";
import { logger } from "./logger";

const uri = process.env.MONGODB_URI?.trim();

function parseDbNameFromUri(connectionUri: string): string | null {
  try {
    const withoutQuery = connectionUri.split("?")[0] ?? connectionUri;
    const path = withoutQuery.replace(/^[^/]+\/\/[^/]+/, "");
    const dbName = path.replace(/^\//, "").split("/")[0]?.trim();
    return dbName || null;
  } catch {
    return null;
  }
}

export interface PlatformStateDocument extends DbState {
  _id: string;
  updatedAt?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var _corechellaMongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured() {
  return Boolean(uri);
}

export function getMongoDbName() {
  const fromEnv = process.env.MONGODB_DB_NAME?.trim();
  if (fromEnv) return fromEnv;

  if (!uri) return "corechella";

  const fromUri = parseDbNameFromUri(uri);
  if (fromUri) return fromUri;

  return "corechella";
}

export const STATE_COLLECTION = "platform_state";
export const STATE_DOCUMENT_ID = "main";

function getClientOptions() {
  return {
    maxPoolSize: Math.min(
      10,
      Math.max(1, parseInt(process.env.MONGODB_MAX_POOL_SIZE ?? "3", 10) || 3)
    ),
    minPoolSize: 0,
    maxIdleTimeMS: 30_000,
    connectTimeoutMS: 15_000,
    serverSelectionTimeoutMS: 15_000,
    socketTimeoutMS: 30_000,
    retryWrites: true,
    retryReads: true,
  };
}

function createClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  const client = new MongoClient(uri, getClientOptions());
  return client.connect();
}

export function resetMongoClient() {
  global._corechellaMongoClientPromise = undefined;
}

export function getMongoClient(): Promise<MongoClient> {
  if (!isMongoConfigured()) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!global._corechellaMongoClientPromise) {
    global._corechellaMongoClientPromise = createClientPromise();
  }
  return global._corechellaMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getMongoDbName());
}

export async function getStateCollection(): Promise<Collection<PlatformStateDocument>> {
  const db = await getMongoDb();
  return db.collection<PlatformStateDocument>(STATE_COLLECTION);
}

export interface MongoHealthStatus {
  configured: boolean;
  connected: boolean;
  dbName: string;
  collection: string;
  documentExists: boolean;
  databases: string[];
  orderCount?: number;
  error?: string;
}

export async function getMongoHealthStatus(): Promise<MongoHealthStatus> {
  const dbName = getMongoDbName();
  const base: MongoHealthStatus = {
    configured: isMongoConfigured(),
    connected: false,
    dbName,
    collection: STATE_COLLECTION,
    documentExists: false,
    databases: [],
  };

  if (!isMongoConfigured()) {
    return { ...base, error: "MONGODB_URI is not configured" };
  }

  try {
    const client = await getMongoClient();
    const admin = client.db().admin();
    const listed = await admin.listDatabases({ nameOnly: true });
    base.databases = listed.databases.map((db) => db.name).sort();

    const collection = await getStateCollection();
    const doc = await collection.findOne(
      { _id: STATE_DOCUMENT_ID },
      { projection: { orders: 1 } }
    );

    base.connected = true;
    base.documentExists = Boolean(doc);
    base.orderCount = Array.isArray(doc?.orders) ? doc.orders.length : 0;
    return base;
  } catch (error) {
    resetMongoClient();
    return { ...base, error: String(error) };
  }
}
