import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { canAccessAdmin } from "@/lib/server/permissions";

export async function GET(req: Request) {
  const session = await getSessionFromCookies();
  const db = await getDb();
  const { searchParams } = new URL(req.url);
  const guestOrderIds = searchParams.get("guestOrderIds")?.split(",").filter(Boolean) ?? [];
  const guestOrderId = searchParams.get("guestOrderId");

  if (canAccessAdmin(session)) {
    return NextResponse.json({ orders: db.orders, attendees: db.attendees });
  }

  const ids = guestOrderIds.length ? guestOrderIds : guestOrderId ? [guestOrderId] : [];
  if (ids.length) {
    const orders = db.orders.filter((o) => ids.includes(o.id));
    const orderIdSet = new Set(orders.map((o) => o.id));
    const attendees = db.attendees.filter((a) => orderIdSet.has(a.orderId));
    return NextResponse.json({ orders, attendees });
  }

  return NextResponse.json({ orders: [], attendees: [] });
}
