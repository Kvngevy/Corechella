import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Public signup is disabled. Tickets are available without an account." },
    { status: 403 }
  );
}
