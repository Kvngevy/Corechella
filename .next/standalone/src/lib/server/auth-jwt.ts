import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { AuthSession } from "./types";

let jwtSecretKey: Uint8Array | null = null;

function getJwtSecretKey(): Uint8Array {
  if (jwtSecretKey) return jwtSecretKey;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set in production");
    }
    jwtSecretKey = new TextEncoder().encode("corechella-dev-secret-change-in-production");
    return jwtSecretKey;
  }

  jwtSecretKey = new TextEncoder().encode(secret);
  return jwtSecretKey;
}
export const COOKIE_NAME = "corechella_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function createToken(session: AuthSession) {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecretKey());
}

export async function verifyToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      name: String(payload.name ?? ""),
      email: payload.email,
      role: payload.role as AuthSession["role"],
      permissions: (payload.permissions as AuthSession["permissions"]) ?? [],
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: AuthSession) {
  const token = await createToken(session);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionFromCookies(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<AuthSession | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function isAdminRole(role: AuthSession["role"]) {
  return role === "super_admin" || role === "ticket_manager";
}

export function toAuthSession(user: {
  id: string;
  name: string;
  email: string;
  role: AuthSession["role"];
  permissions: AuthSession["permissions"];
}): AuthSession {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };
}
