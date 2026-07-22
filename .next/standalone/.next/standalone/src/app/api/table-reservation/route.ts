import { NextResponse } from "next/server";
import { withDb } from "@/lib/server/db";

export async function POST() {
  await withDb((state) => {
    state.tableReservationCalls = (state.tableReservationCalls ?? 0) + 1;
  });
  return NextResponse.json({ success: true });
}
