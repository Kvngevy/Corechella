import { NextResponse } from "next/server";
import { clearSessionCookie, getSessionFromCookies } from "@/lib/server/auth";

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: session });
}
