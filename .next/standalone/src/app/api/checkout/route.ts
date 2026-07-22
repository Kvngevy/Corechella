import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/server/auth";
import { isAdminRole } from "@/lib/server/auth-jwt";
import { withDb } from "@/lib/server/db";
import { logger } from "@/lib/server/logger";
import { createOrderFromCheckout } from "@/lib/server/orders";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { corechella } from "@/lib/data";
import {
  createWavyCheckout,
  getAppUrlFromRequest,
  isWavyConfigured,
  WAVY_MIN_AMOUNT_NGN,
} from "@/lib/server/wavy";

export const maxDuration = 60;

function checkoutErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : "Checkout failed";
  if (raw === "fetch failed") {
    return "Payment service is unreachable. Please try again in a moment.";
  }
  return raw;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`checkout:${ip}`, 20, 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
    }

    const body = await req.json();
    const session = await getSessionFromCookies();

    const result = await withDb((state) =>
      createOrderFromCheckout(state, {
        items: body.items ?? [],
        firstName: String(body.firstName ?? ""),
        lastName: String(body.lastName ?? ""),
        email: String(body.email ?? ""),
        phone: String(body.phone ?? ""),
        paymentMethod: "wavy",
        promoCode: body.promoCode ? String(body.promoCode) : undefined,
        status: isWavyConfigured() ? "pending" : "completed",
        deviceFingerprint: body.deviceFingerprint ? String(body.deviceFingerprint) : undefined,
        ip,
      })
    );

    if (!result.success) {
      const status = "status" in result && result.status ? result.status : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    const guestAccess = !session || !isAdminRole(session.role) ? result.order.id : undefined;

    if (!isWavyConfigured() || result.order.total <= 0) {
      return NextResponse.json({
        orderId: result.order.id,
        order: result.order,
        attendees: result.order.status === "completed" ? result.attendees : [],
        guestAccess,
      });
    }

    if (result.order.total < WAVY_MIN_AMOUNT_NGN) {
      return NextResponse.json(
        { error: `Minimum Wavy payment amount is ₦${WAVY_MIN_AMOUNT_NGN}` },
        { status: 400 }
      );
    }

    const orderId = result.order.id;
    const appUrl = getAppUrlFromRequest(req);
    const payment = await createWavyCheckout({
      amount: result.order.total,
      description: `Corechella tickets — ${orderId}`,
      email: result.order.customerEmail,
      merchant_reference: orderId,
      success_url: `${appUrl}/checkout?order=${encodeURIComponent(orderId)}`,
      cancel_url: `${appUrl}/payment/cancelled?reference=${encodeURIComponent(orderId)}`,
    });

    await withDb((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (order) order.paymentReference = payment.tx_ref;
    });

    return NextResponse.json({
      orderId,
      order: result.order,
      attendees: [],
      guestAccess,
      checkoutUrl: payment.authorization_url,
      authorization_url: payment.authorization_url,
      tx_ref: payment.tx_ref,
      paymentReference: payment.tx_ref,
      pending: true,
    });
  } catch (err) {
    logger.error("Checkout failed", { error: String(err) });
    return NextResponse.json({ error: checkoutErrorMessage(err) }, { status: 500 });
  }
}
