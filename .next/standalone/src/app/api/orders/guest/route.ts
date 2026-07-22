import { NextResponse } from "next/server";
import { withDb } from "@/lib/server/db";
import {
  confirmOrderFromWebhook,
  ensureOrderAttendees,
  orderTicketsUnlocked,
} from "@/lib/server/orders";
import { isWavyConfigured, verifyWavyPayment } from "@/lib/server/wavy";
import type { OrderRecord } from "@/lib/store/types";

export const dynamic = "force-dynamic";

async function tryConfirmPendingOrder(order: OrderRecord, txRef?: string) {
  if (order.status !== "pending") return order;

  const paymentRef = txRef?.trim() || order.paymentReference;
  if (isWavyConfigured() && paymentRef) {
    const verified = await verifyWavyPayment(paymentRef);
    if (!verified?.success) return order;

    const confirmed = await withDb((state) => {
      const result = confirmOrderFromWebhook(
        state,
        verified.merchant_reference ?? order.id,
        verified.amount
      );
      if (!result.success) return null;

      const resolved = state.orders.find((o) => o.id === order.id) ?? result.order;
      if (resolved && paymentRef) resolved.paymentReference = paymentRef;
      return resolved;
    });

    return confirmed ?? order;
  }

  if (!isWavyConfigured()) {
    const confirmed = await withDb((state) => {
      const result = confirmOrderFromWebhook(state, order.id);
      if (!result.success) return null;
      return state.orders.find((o) => o.id === order.id) ?? result.order;
    });
    return confirmed ?? order;
  }

  return order;
}

/**
 * Public guest ticket retrieval by order ID.
 * Completed orders return full ticket payloads for checkout success / downloads.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId")?.trim();
  const txRef = url.searchParams.get("tx_ref")?.trim();

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  const initial = await withDb((state) => {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return { notFound: true as const };
    return { order };
  });

  if ("notFound" in initial) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const resolvedOrder = await tryConfirmPendingOrder(initial.order, txRef);

  const payload = await withDb((state) => {
    const order = state.orders.find((o) => o.id === orderId) ?? resolvedOrder;
    const attendees = orderTicketsUnlocked(order) ? ensureOrderAttendees(state, order) : [];

    return {
      order,
      status: order.status,
      attendees,
      ticketCount: attendees.length,
    };
  });

  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
