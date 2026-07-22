import type { AdminPermission, AuthSession } from "./types";
import { getDb } from "./db";
import {
  STAFF_DEFAULT_PERMISSIONS,
  sanitizeStaffPermissions,
} from "@/lib/admin-permissions";

export function hasPermission(session: AuthSession | null, permission: AdminPermission) {
  if (!session) return false;
  if (session.role === "super_admin") return true;
  if (session.role !== "ticket_manager") return false;
  return session.permissions.includes(permission);
}

export function isSuperAdmin(session: AuthSession | null) {
  return session?.role === "super_admin";
}

export function canAccessAdmin(session: AuthSession | null) {
  return session?.role === "super_admin" || session?.role === "ticket_manager";
}

export function unauthorized(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return Response.json({ error: message }, { status: 403 });
}

async function getLiveStaffUser(session: AuthSession) {
  const db = await getDb();
  return db.users.find((u) => u.id === session.userId);
}

/** Re-check DB so revoked staff lose access immediately, even with an old session cookie */
async function ensureActiveStaffSession(session: AuthSession) {
  if (session.role !== "ticket_manager") return null;

  const user = await getLiveStaffUser(session);
  if (!user || user.status !== "active") {
    return forbidden("Your staff access has been revoked");
  }
  if (user.permissions.length === 0) {
    return forbidden("Your staff access has been revoked");
  }

  return user;
}

export async function requireAdmin(session: AuthSession | null) {
  if (!session || !canAccessAdmin(session)) return unauthorized("Staff login required");

  if (session.role === "ticket_manager") {
    const staffCheck = await ensureActiveStaffSession(session);
    if (staffCheck && staffCheck instanceof Response) return staffCheck;
  }

  return null;
}

export async function requirePermission(session: AuthSession | null, permission: AdminPermission) {
  const adminCheck = await requireAdmin(session);
  if (adminCheck) return adminCheck;

  if (session!.role === "super_admin") return null;

  const user = await getLiveStaffUser(session!);
  if (!user || !user.permissions.includes(permission)) {
    return forbidden("Insufficient permissions");
  }

  return null;
}

export async function requireSuperAdmin(session: AuthSession | null) {
  const adminCheck = await requireAdmin(session);
  if (adminCheck) return adminCheck;
  if (!isSuperAdmin(session)) return forbidden("Super admin access required");
  return null;
}

export function validateAssignablePermissions(permissions: string[]): AdminPermission[] {
  const sanitized = sanitizeStaffPermissions(permissions);
  if (sanitized.length === 0) return [...STAFF_DEFAULT_PERMISSIONS];
  return [...new Set(sanitized)];
}
