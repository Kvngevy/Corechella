import { MongoClient, type Collection } from "mongodb";
import type { DbState } from "./types";

const uri = process.env.MONGODB_URI;

export interface PlatformStateDocument extends DbState {
  _id: string;
  updatedAt?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var _corechellaMongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured() {
  return Boolean(uri?.trim());
}

export function getMongoDbName() {
  return process.env.MONGODB_DB_NAME?.trim() || "corechella";
}

export const STATE_COLLECTION = "platform_state";
export const STATE_DOCUMENT_ID = "main";

function createClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  const client = new MongoClient(uri, {
    maxPoolSize: Math.min(
      10,
      Math.max(1, parseInt(process.env.MONGODB_MAX_POOL_SIZE ?? "3", 10) || 3)
    ),
    minPoolSize: 0,
    maxIdleTimeMS: 30_000,
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20_000,
  });

  return client.connect();
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

export async function getStateCollection(): Promise<Collection<PlatformStateDocument>> {
  const client = await getMongoClient();
  return client.db(getMongoDbName()).collection<PlatformStateDocument>(STATE_COLLECTION);
}
