import { NextResponse } from "next/server";
import { getActiveUser, setSessionCookie, toAuthSession, verifyPassword } from "@/lib/server/auth";
import { isAdminRole } from "@/lib/server/auth-jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await getActiveUser(email);
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.role === "ticket_manager" && user.permissions.length === 0) {
      return NextResponse.json({ error: "Your access has been revoked" }, { status: 403 });
    }

    await setSessionCookie(toAuthSession(user));
    return NextResponse.json({ user: toAuthSession(user) });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
