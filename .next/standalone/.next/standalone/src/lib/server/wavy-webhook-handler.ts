import { NextResponse } from "next/server";
import { withDb } from "@/lib/server/db";
import { confirmOrderFromWebhook } from "@/lib/server/orders";
import {
  isWavyPaymentSuccess,
  parseWavyWebhookPayload,
  verifyWavyWebhookSignature,
  type WavyWebhookPayload,
} from "@/lib/server/wavy";

export async function handleWavyWebhookRequest(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-wavy-signature");
  const eventHeader = req.headers.get("x-wavy-event") ?? "";

  if (!verifyWavyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: WavyWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WavyWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = parseWavyWebhookPayload(payload);
  const event = parsed.event ?? eventHeader;

  if (!isWavyPaymentSuccess(event, parsed.status)) {
    return NextResponse.json({ received: true, ignored: event || "unknown" });
  }

  const orderId = parsed.merchant_reference;
  if (!orderId) {
    return NextResponse.json({ error: "Missing merchant_reference" }, { status: 400 });
  }

  const amount = parsed.gross_amount ?? parsed.vendor_net;

  const result = await withDb((state) => {
    const confirm = confirmOrderFromWebhook(state, orderId, amount);
    if (!confirm.success) {
      return { error: confirm.error };
    }

    const order = state.orders.find((o) => o.id === orderId) ?? confirm.order;
    if (order && parsed.tx_ref) {
      order.paymentReference = parsed.tx_ref;
    }

    return {
      success: true,
      orderId,
      tx_ref: parsed.tx_ref,
      alreadyCompleted: confirm.alreadyCompleted,
    };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    received: true,
    orderId: result.orderId,
    tx_ref: result.tx_ref,
    status: result.alreadyCompleted ? "already_completed" : "completed",
  });
}
