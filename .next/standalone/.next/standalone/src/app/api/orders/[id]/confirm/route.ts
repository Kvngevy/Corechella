import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/server/auth";
import { withDb } from "@/lib/server/db";
import { confirmOrderFromWebhook } from "@/lib/server/orders";
import { requirePermission } from "@/lib/server/permissions";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookies();
  const denied = await requirePermission(session, "manage_orders");
  if (denied) return denied;

  const { id } = await params;

  const result = await withDb((state) => confirmOrderFromWebhook(state, id));

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    order: result.order,
    alreadyCompleted: result.alreadyCompleted,
  });
}
