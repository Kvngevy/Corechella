import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/server/auth";
import { withDb } from "@/lib/server/db";
import { logger } from "@/lib/server/logger";
import {
  cancelPendingOrder,
  confirmOrderFromWebhook,
  ensureOrderAttendees,
} from "@/lib/server/orders";
import { requirePermission } from "@/lib/server/permissions";
import { isWavyConfigured, verifyWavyPayment } from "@/lib/server/wavy";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Admin-only: verify pending orders against Wavy and confirm paid ones.
 * Also removes stale pending orders that never received a payment reference.
 */
export async function POST() {
  const session = await getSessionFromCookies();
  const denied = await requirePermission(session, "manage_orders");
  if (denied) return denied;

  if (!isWavyConfigured()) {
    return NextResponse.json({ error: "Wavy is not configured" }, { status: 503 });
  }

  const summary = {
    scanned: 0,
    confirmed: 0,
    cancelled: 0,
    stillPending: 0,
    errors: [] as string[],
  };

  const pending = await withDb((state) =>
    state.orders.filter((order) => order.status === "pending")
  );

  for (const order of pending) {
    summary.scanned += 1;

    if (!order.paymentReference) {
      const cancelled = await withDb((state) => cancelPendingOrder(state, order.id));
      if (cancelled.success) {
        summary.cancelled += 1;
      } else {
        summary.stillPending += 1;
      }
      continue;
    }

    try {
      const verified = await verifyWavyPayment(order.paymentReference);
      if (!verified?.success) {
        summary.stillPending += 1;
        continue;
      }

      const result = await withDb((state) => {
        const confirm = confirmOrderFromWebhook(
          state,
          verified.merchant_reference ?? order.id,
          verified.amount
        );
        if (!confirm.success) {
          return { error: confirm.error };
        }

        const resolved = state.orders.find((o) => o.id === order.id) ?? confirm.order;
        if (resolved) resolved.paymentReference = order.paymentReference;
        ensureOrderAttendees(state, resolved);
        return { success: true as const };
      });

      if ("error" in result) {
        summary.errors.push(`${order.id}: ${result.error}`);
        summary.stillPending += 1;
        continue;
      }

      summary.confirmed += 1;
    } catch (err) {
      logger.error("Reconcile pending order failed", { orderId: order.id, error: String(err) });
      summary.errors.push(`${order.id}: reconciliation failed`);
      summary.stillPending += 1;
    }
  }

  return NextResponse.json({ success: true, ...summary });
}
