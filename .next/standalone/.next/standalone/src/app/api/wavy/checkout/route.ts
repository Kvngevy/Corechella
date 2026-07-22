import { NextResponse } from "next/server";
import { withDb } from "@/lib/server/db";
import { confirmOrderFromWebhook } from "@/lib/server/orders";
import {
  createWavyCheckout,
  getAppUrlFromRequest,
  isWavyConfigured,
  WAVY_MIN_AMOUNT_NGN,
} from "@/lib/server/wavy";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isWavyConfigured()) {
    return NextResponse.json({ error: "Wavy is not configured" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const email = String(body.email ?? "").trim();
    const merchant_reference = String(body.merchant_reference ?? "").trim();
    const description = String(body.description ?? "Corechella ticket").trim();
    const appUrl = getAppUrlFromRequest(req);
    const success_url =
      String(body.success_url ?? "").trim() ||
      `${appUrl}/checkout?order=${encodeURIComponent(merchant_reference)}`;
    const cancel_url =
      String(body.cancel_url ?? "").trim() ||
      `${appUrl}/payment/cancelled?reference=${encodeURIComponent(merchant_reference)}`;

    if (!Number.isFinite(amount) || amount < WAVY_MIN_AMOUNT_NGN) {
      return NextResponse.json(
        { error: `Minimum payment amount is ₦${WAVY_MIN_AMOUNT_NGN}` },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
    }
    if (!merchant_reference) {
      return NextResponse.json({ error: "merchant_reference is required" }, { status: 400 });
    }

    const session = await createWavyCheckout({
      amount,
      description,
      email,
      merchant_reference,
      success_url,
      cancel_url,
    });

    await withDb((state) => {
      const order = state.orders.find((o) => o.id === merchant_reference);
      if (order) {
        order.paymentReference = session.tx_ref;
      }
    });

    return NextResponse.json({
      authorization_url: session.authorization_url,
      tx_ref: session.tx_ref,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create Wavy checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
