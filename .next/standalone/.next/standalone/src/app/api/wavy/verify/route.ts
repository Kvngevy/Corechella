import { NextResponse } from "next/server";
import { withDb } from "@/lib/server/db";
import { confirmOrderFromWebhook, ensureOrderAttendees } from "@/lib/server/orders";
import {
  getWavyTransaction,
  isWavyConfigured,
  verifyWavyPayment,
} from "@/lib/server/wavy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isWavyConfigured()) {
    return NextResponse.json({ error: "Wavy is not configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const txRef = url.searchParams.get("tx_ref")?.trim();
  const reference = url.searchParams.get("reference")?.trim();

  if (!txRef && !reference) {
    return NextResponse.json({ error: "tx_ref or reference is required" }, { status: 400 });
  }

  if (reference && !txRef) {
    const existing = await withDb((state) => {
      const order = state.orders.find((o) => o.id === reference);
      if (!order) return { notFound: true as const };
      if (order.status === "completed") {
        return {
          success: true,
          status: "SUCCESS",
          orderId: order.id,
          order,
          attendees: ensureOrderAttendees(state, order),
          alreadyCompleted: true,
        };
      }
      return { pending: true as const, order };
    });

    if ("notFound" in existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if ("success" in existing && existing.success) {
      return NextResponse.json({
        success: true,
        status: "SUCCESS",
        orderId: existing.orderId,
        order: existing.order,
        attendees: existing.attendees,
        alreadyCompleted: true,
      });
    }
  }

  if (!txRef) {
    return NextResponse.json({ success: false, status: "PENDING" });
  }

  const verified = await verifyWavyPayment(txRef);
  const orderId = verified?.merchant_reference ?? reference;

  if (!verified?.success) {
    const transaction = await getWavyTransaction(txRef);

    if (orderId) {
      const existing = await withDb((state) => {
        const order = state.orders.find((o) => o.id === orderId);
        if (order?.status === "completed") {
          return {
            success: true,
            order,
            attendees: ensureOrderAttendees(state, order),
          };
        }
        return null;
      });

      if (existing) {
        return NextResponse.json({
          success: true,
          status: "SUCCESS",
          tx_ref: txRef,
          orderId,
          order: existing.order,
          attendees: existing.attendees,
          alreadyCompleted: true,
        });
      }
    }

    return NextResponse.json({
      success: false,
      status: transaction?.status ?? "UNKNOWN",
      tx_ref: txRef,
    });
  }

  if (!orderId) {
    return NextResponse.json({ error: "Missing merchant_reference on transaction" }, { status: 422 });
  }

  const result = await withDb((state) => {
    const confirm = confirmOrderFromWebhook(state, orderId, verified.amount);
    if (!confirm.success) {
      return { error: confirm.error };
    }

    const order = state.orders.find((o) => o.id === orderId) ?? confirm.order;
    if (order) order.paymentReference = txRef;

    const attendees = ensureOrderAttendees(state, order);
    return {
      success: true,
      order,
      attendees,
      alreadyCompleted: confirm.alreadyCompleted,
    };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    status: "SUCCESS",
    tx_ref: txRef,
    orderId,
    order: result.order,
    attendees: result.attendees,
    alreadyCompleted: result.alreadyCompleted,
  });
}
