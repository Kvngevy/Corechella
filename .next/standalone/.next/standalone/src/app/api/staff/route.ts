import { NextResponse } from "next/server";
import { getSessionFromCookies, hashPassword } from "@/lib/server/auth";
import { withDb, getDb } from "@/lib/server/db";
import { logger } from "@/lib/server/logger";
import { requireSuperAdmin, validateAssignablePermissions } from "@/lib/server/permissions";
import { STAFF_DEFAULT_PERMISSIONS } from "@/lib/admin-permissions";
import type { AdminPermission } from "@/lib/server/types";

export async function GET() {
  const session = await getSessionFromCookies();
  const denied = await requireSuperAdmin(session);
  if (denied) return denied;

  const db = await getDb();
  const staff = db.users
    .filter((u) => u.role === "ticket_manager" || u.role === "super_admin")
    .sort((a, b) => {
      if (a.role === "super_admin") return -1;
      if (b.role === "super_admin") return 1;
      return a.name.localeCompare(b.name);
    });

  return NextResponse.json({
    staff: staff.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      permissions: u.permissions,
      status: u.status,
      createdAt: u.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  const denied = await requireSuperAdmin(session);
  if (denied) return denied;

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const permissions = validateAssignablePermissions(
      (body.permissions as string[] | undefined) ?? STAFF_DEFAULT_PERMISSIONS
    );

    if (!name || !email || password.length < 8) {
      return NextResponse.json(
        { error: "Name, email, and password (min 8 characters) are required" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const newUserId = `user-${Date.now()}`;

    const created = await withDb((state) => {
      if (state.users.some((u) => u.email === email)) {
        return { error: "User with this email already exists" as const };
      }

      const newUser = {
        id: newUserId,
        name,
        email,
        passwordHash,
        role: "ticket_manager" as const,
        permissions,
        status: "active" as const,
        createdAt: new Date().toISOString(),
      };
      state.users.push(newUser);
      return { staff: newUser };
    });

    if ("error" in created) {
      return NextResponse.json({ error: created.error }, { status: 409 });
    }

    const { staff: newUser } = created;

    return NextResponse.json({
      success: true,
      staff: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        status: newUser.status,
      },
    });
  } catch (err) {
    logger.error("Add staff failed", { error: String(err) });
    const message =
      err instanceof Error && /EROFS|EACCES|read-only/i.test(err.message)
        ? "Storage unavailable. Add Vercel KV to this project in the Vercel dashboard."
        : "Failed to add staff";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSessionFromCookies();
  const denied = await requireSuperAdmin(session);
  if (denied) return denied;

  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    const action = String(body.action ?? "");

    if (!id) {
      return NextResponse.json({ error: "Staff member id is required" }, { status: 400 });
    }

    const updated = await withDb((state) => {
      const user = state.users.find((u) => u.id === id);
      if (!user) return { error: "Staff member not found" as const };
      if (user.role === "super_admin") return { error: "Cannot modify super admin access" as const };
      if (user.id === session!.userId && action === "revoke") {
        return { error: "You cannot revoke your own access" as const };
      }

      if (action === "revoke") {
        user.status = "inactive";
        user.permissions = [];
      } else if (action === "activate") {
        user.status = "active";
        user.permissions = validateAssignablePermissions(
          (body.permissions as string[] | undefined) ?? STAFF_DEFAULT_PERMISSIONS
        );
      } else if (action === "update_permissions") {
        if (user.status !== "active") {
          return { error: "Restore access before updating permissions" as const };
        }
        user.permissions = validateAssignablePermissions(body.permissions as string[]);
      } else {
        return { error: "Unknown action" as const };
      }

      return {
        staff: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          status: user.status,
        },
      };
    });

    if ("error" in updated) {
      return NextResponse.json({ error: updated.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, staff: updated.staff });
  } catch {
    return NextResponse.json({ error: "Failed to update staff" }, { status: 500 });
  }
}
