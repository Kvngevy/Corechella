import bcrypt from "bcryptjs";
import { getDb } from "./db";
import type { DbUser } from "./types";
import { toAuthSession } from "./auth-jwt";

export { toAuthSession, setSessionCookie, clearSessionCookie, getSessionFromCookies, getSessionFromRequest, isAdminRole } from "./auth-jwt";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getActiveUser(email: string): Promise<DbUser | null> {
  const db = await getDb();
  const user = db.users.find((u) => u.email === email.toLowerCase());
  if (!user || user.status !== "active") return null;
  return user;
}
