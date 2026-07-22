import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/server/db";
import { getEarlyBirdStats } from "@/lib/server/early-bird";
import { getCheckInsToday } from "@/lib/server/orders";
import { catalogMetadataChanged, syncTicketCatalog } from "@/lib/server/ticket-catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDb();
  const before = db.tickets;
  syncTicketCatalog(db);

  if (catalogMetadataChanged(before, db.tickets)) {
    await saveDb(db);
  }

  const earlyBird = getEarlyBirdStats(db);

  return NextResponse.json(
    {
      tickets: db.tickets,
      earlyBird,
      tableReservationCalls: db.tableReservationCalls ?? 0,
      checkInsToday: getCheckInsToday(db),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30",
      },
    }
  );
}
