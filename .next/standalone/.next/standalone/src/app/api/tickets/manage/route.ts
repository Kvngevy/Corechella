import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/server/auth";
import { withDb } from "@/lib/server/db";
import { requireSuperAdmin } from "@/lib/server/permissions";
import type { TicketInventory } from "@/lib/store/types";

export async function PATCH(req: Request) {
  const session = await getSessionFromCookies();
  const denied = await requireSuperAdmin(session);
  if (denied) return denied;

  try {
    const body = await req.json();
    const id = String(body.id ?? "").trim();

    if (!id) {
      return NextResponse.json({ error: "Ticket id is required" }, { status: 400 });
    }

    const ticket = await withDb((state) => {
      const existing = state.tickets.find((t) => t.id === id);
      if (!existing) return null;

      if (body.name !== undefined) {
        const name = String(body.name).trim();
        if (!name) return null;
        existing.name = name;
      }

      if (body.description !== undefined) {
        existing.description = String(body.description).trim();
      }

      if (body.price !== undefined) {
        const price = Number(body.price);
        if (!Number.isFinite(price) || price < 0) return null;
        existing.price = price;
      }

      if (body.total !== undefined) {
        const total = Math.floor(Number(body.total));
        if (!Number.isFinite(total) || total < existing.sold) return null;
        existing.total = total;
        existing.remaining = total - existing.sold;
      }

      return existing;
    });

    if (!ticket) {
      return NextResponse.json({ error: "Invalid ticket or update data" }, { status: 400 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
