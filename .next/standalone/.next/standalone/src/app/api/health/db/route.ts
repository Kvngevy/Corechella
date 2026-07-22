import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/server/auth";
import { canAccessAdmin } from "@/lib/server/permissions";
import { getMongoHealthStatus } from "@/lib/server/mongodb";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!canAccessAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getMongoHealthStatus();
  return NextResponse.json(status, { status: status.connected ? 200 : 503 });
}
