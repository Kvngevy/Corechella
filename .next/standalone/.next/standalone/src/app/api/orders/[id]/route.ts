import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { requirePermission } from "@/lib/server/permissions";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookies();
  const { id } = await params;
  const db = await getDb();

  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const attendees = db.attendees.filter((a) => a.orderId === order.id);

  const denied = await requirePermission(session, "manage_orders");
  if (!denied) {
    const checkedIn = attendees.filter((a) => a.status === "checked-in").length;
    return NextResponse.json({
      order,
      attendees,
      summary: {
        ticketCount: attendees.length,
        checkedIn,
        pendingCheckIn: attendees.length - checkedIn,
      },
    });
  }

  if (order.status === "completed") {
    return NextResponse.json({ order, attendees });
  }

  return NextResponse.json({ error: "Order not available" }, { status: 403 });
}
