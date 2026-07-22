"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Check, Tag, Shield, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { TicketCard } from "@/components/tickets/ticket-card";
import { TicketSupportLine } from "@/components/tickets/ticket-support-line";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { corechella, TICKET_SUPPORT_PHONE } from "@/lib/data";
import { apiClient } from "@/lib/api-client";
import { getGuestOrderBundle, saveGuestOrderBundle } from "@/lib/guest-ticket-storage";
import { cartSubtotal, usePlatform } from "@/lib/store/platform-store";
import type { AttendeeRecord, OrderRecord } from "@/lib/store/types";
import { formatEventDates, formatPrice } from "@/lib/utils";

function orderTicketsUnlocked(order: Pick<OrderRecord, "status" | "total">) {
  return order.status === "completed" || order.total <= 0;
}

type TicketLoadState = "idle" | "loading" | "ready" | "error";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnOrderId = searchParams.get("order") ?? searchParams.get("reference");
  const returnTxRef = searchParams.get("tx_ref");
  const paymentStatus = searchParams.get("status")?.toLowerCase();

  const { ready, cart, validatePromo, completeCheckout } = usePlatform();

  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState<string | undefined>();
  const [promoError, setPromoError] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<OrderRecord | null>(null);
  const [successTickets, setSuccessTickets] = useState<AttendeeRecord[]>([]);
  const [ticketLoadState, setTicketLoadState] = useState<TicketLoadState>("idle");
  const loadAttemptRef = useRef(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentGatewayDown, setPaymentGatewayDown] = useState(false);

  const activeOrderId = returnOrderId ?? successOrderId;

  const loadOrderTickets = useCallback(async (orderId: string, txRef?: string | null) => {
    const attempt = ++loadAttemptRef.current;
    setTicketLoadState("loading");

    const cached = getGuestOrderBundle(orderId);
    if (cached && orderTicketsUnlocked(cached.order) && cached.attendees.length) {
      setSuccessOrder(cached.order);
      setSuccessTickets(cached.attendees);
      setSuccessOrderId(orderId);
      setTicketLoadState("ready");
    }

    if (txRef) {
      try {
        const verifyParams = new URLSearchParams({ tx_ref: txRef, reference: orderId });
        await fetch(`/api/wavy/verify?${verifyParams.toString()}`, { cache: "no-store" });
      } catch {
        /* guest poll will retry */
      }
    }

    try {
      const data = await apiClient.getGuestOrderTickets(orderId, txRef ?? undefined);
      if (attempt !== loadAttemptRef.current) return data;

      setSuccessOrder(data.order);

      if (data.status === "completed" && data.attendees.length > 0) {
        setSuccessTickets(data.attendees);
        setSuccessOrderId(orderId);
        setTicketLoadState("ready");
        saveGuestOrderBundle(data.order, data.attendees);
        return data;
      }

      if (data.status === "completed") {
        setSuccessTickets([]);
        setSuccessOrderId(orderId);
        setTicketLoadState("error");
        return data;
      }

      setSuccessTickets([]);
      setTicketLoadState("loading");
      return data;
    } catch {
      if (attempt !== loadAttemptRef.current) return undefined;
      const cachedPending = getGuestOrderBundle(orderId);
      if (
        cachedPending &&
        orderTicketsUnlocked(cachedPending.order) &&
        cachedPending.attendees.length
      ) {
        setSuccessOrder(cachedPending.order);
        setSuccessTickets(cachedPending.attendees);
        setSuccessOrderId(orderId);
        setTicketLoadState("ready");
        return undefined;
      }
      setTicketLoadState("error");
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (ready && cart.length === 0 && !activeOrderId) {
      router.replace("/tickets");
    }
  }, [ready, cart, router, activeOrderId]);

  useEffect(() => {
    if (!activeOrderId || !ready) return;

    const cached = getGuestOrderBundle(activeOrderId);
    if (cached && orderTicketsUnlocked(cached.order) && cached.attendees.length) {
      setSuccessOrder(cached.order);
      setSuccessTickets(cached.attendees);
      setSuccessOrderId(activeOrderId);
      setTicketLoadState("ready");
    }

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        if (returnTxRef && attempts === 0) {
          try {
            const verifyParams = new URLSearchParams({
              tx_ref: returnTxRef,
              reference: activeOrderId,
            });
            await fetch(`/api/wavy/verify?${verifyParams.toString()}`, { cache: "no-store" });
          } catch {
            /* continue polling */
          }
        }

        const data = await apiClient.getGuestOrderTickets(
          activeOrderId,
          returnTxRef ?? undefined
        );
        if (cancelled) return;

        setSuccessOrder(data.order);

        if (data.status === "completed" && data.attendees.length > 0) {
          setSuccessTickets(data.attendees);
          setSuccessOrderId(activeOrderId);
          setTicketLoadState("ready");
          saveGuestOrderBundle(data.order, data.attendees);
          return;
        }

        if (data.status === "completed") {
          attempts += 1;
          if (attempts < 6) {
            setTimeout(poll, 2000);
          } else {
            setSuccessOrderId(activeOrderId);
            setSuccessTickets([]);
            setTicketLoadState("error");
          }
          return;
        }

        attempts += 1;
        if (attempts < 20) {
          setTicketLoadState("loading");
          setTimeout(poll, 2000);
        } else {
          if (paymentStatus === "success" || paymentStatus === "successful") {
            setError(
              `Payment received — tickets are still generating. Please refresh in a moment or call ${TICKET_SUPPORT_PHONE} with your order ID.`
            );
          } else {
            setError(`Payment is still processing. Refresh this page in a moment or call ${TICKET_SUPPORT_PHONE}.`);
          }
        }
      } catch {
        if (cancelled) return;
        const local = getGuestOrderBundle(activeOrderId);
        if (local && orderTicketsUnlocked(local.order) && local.attendees.length) {
          setSuccessOrder(local.order);
          setSuccessTickets(local.attendees);
          setSuccessOrderId(activeOrderId);
          setTicketLoadState("ready");
          return;
        }
        attempts += 1;
        if (attempts < 6) {
          setTimeout(poll, 2000);
        } else {
          setTicketLoadState("error");
          setError("Unable to load your order. Your saved tickets may still be available — try reload.");
        }
      }
    };

    if (!cached || !orderTicketsUnlocked(cached.order) || !cached.attendees.length) {
      setTicketLoadState("loading");
    }
    void poll();

    return () => {
      cancelled = true;
      loadAttemptRef.current += 1;
    };
  }, [activeOrderId, ready, returnTxRef, paymentStatus]);

  const subtotal = cartSubtotal(cart);
  const total = Math.max(0, subtotal - promoDiscount);

  useEffect(() => {
    if (!ready || total <= 0) {
      setPaymentGatewayDown(false);
      return;
    }

    let cancelled = false;
    void fetch("/api/payments/health", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { ok?: boolean }) => {
        if (!cancelled) setPaymentGatewayDown(data.ok === false);
      })
      .catch(() => {
        if (!cancelled) setPaymentGatewayDown(true);
      });

    return () => {
      cancelled = true;
    };
  }, [ready, total]);

  const applyPromo = async () => {
    const result = await validatePromo(promo, subtotal);
    if (!result.valid) {
      setPromoError(result.message ?? "Invalid code");
      setPromoApplied(false);
      setPromoDiscount(0);
      setPromoCode(undefined);
      return;
    }
    setPromoApplied(true);
    setPromoDiscount(result.discount);
    setPromoCode(result.promo?.code);
    setPromoError("");
  };

  const handlePay = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in all buyer details");
      return;
    }

    setError("");
    setProcessing(true);
    const result = await completeCheckout({
      firstName,
      lastName,
      email,
      phone,
      paymentMethod: "wavy",
      promoCode: promoApplied ? promoCode : undefined,
    });
    setProcessing(false);

    if (!result.success) {
      setError(result.error ?? "Payment failed");
      return;
    }

    if (result.checkoutUrl) {
      if (result.order) {
        saveGuestOrderBundle(result.order, []);
      }
      window.location.href = result.checkoutUrl;
      return;
    }

    const orderId = result.orderId ?? null;
    if (result.order) setSuccessOrder(result.order);
    if (orderId) setSuccessOrderId(orderId);

    if (result.attendees?.length && result.order && orderTicketsUnlocked(result.order)) {
      setSuccessTickets(result.attendees);
      setTicketLoadState("ready");
      saveGuestOrderBundle(result.order, result.attendees);
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted">Loading checkout...</p>
      </div>
    );
  }

  if (activeOrderId) {
    const tickets = successTickets;
    const order = successOrder;
    const paymentConfirmed = order ? orderTicketsUnlocked(order) : tickets.length > 0;
    const confirmingPayment =
      ticketLoadState === "loading" && tickets.length === 0 && !error;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 electric-grid">
        <div className="w-full max-w-4xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-bold text-white">
            {paymentConfirmed ? "You&apos;re In!" : "Confirming Payment"}
          </h1>
          <p className="mt-2 text-muted">
            Order <span className="text-electric font-mono">{activeOrderId}</span>
            {paymentConfirmed ? " confirmed." : " — waiting for payment confirmation."}
            {paymentConfirmed && order?.customerEmail
              ? ` Tickets sent to ${order.customerEmail}.`
              : ""}
          </p>
          <p className="mt-1 text-sm text-muted">
            {confirmingPayment || !paymentConfirmed
              ? "Your tickets will appear here once payment is confirmed."
              : "Download each ticket as PNG or PDF below. Tickets are saved on this device."}
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {confirmingPayment ? (
            <div className="mt-10 flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-electric border-t-transparent" />
            </div>
          ) : tickets.length === 0 || !paymentConfirmed ? (
            <div className="mt-10 space-y-4">
              <p className="text-sm text-muted">
                {ticketLoadState === "error"
                  ? `We confirmed your order but tickets are not available yet. Tap reload — if this persists, call ${TICKET_SUPPORT_PHONE} with your order ID.`
                  : "Tickets are still loading. If they don&apos;t appear, try again."}
              </p>
              <Button
                variant="outline"
                onClick={() => void loadOrderTickets(activeOrderId)}
              >
                Reload Tickets
              </Button>
              <TicketSupportLine className="mt-4" />
            </div>
          ) : (
            <div className="mt-10 space-y-10">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} attendee={ticket} eventDate={corechella.date} />
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center">
            <Link href="/tickets">
              <Button variant="outline">Buy More Tickets</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">Checkout</h1>
              <p className="mt-1 text-sm text-muted">Secure payment via Wavy — no account needed</p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-10 grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-8">
              <div className="rounded-2xl electric-card p-6">
                <h2 className="font-heading text-xl font-bold text-white">Your Order</h2>
                <div className="mt-4 flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={corechella.image} alt={corechella.title} fill className="object-cover" sizes="80px" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{corechella.title}</p>
                    <p className="text-sm text-muted">
                      {formatEventDates(corechella.date, corechella.endDate)} · {corechella.location}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {cart.map((item) => (
                    <div key={item.ticketId} className="flex justify-between text-sm">
                      <span className="text-muted">{item.ticketName} × {item.quantity}</span>
                      <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  {promoApplied && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({promoCode})</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-white text-base">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl electric-card p-6">
                <h2 className="font-heading text-xl font-bold text-white">Buyer Information</h2>
                <p className="mt-1 text-xs text-muted">Required for ticket delivery — guest checkout supported</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><Label className="mb-2 block">First Name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Amara" required /></div>
                  <div><Label className="mb-2 block">Last Name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Okafor" required /></div>
                  <div className="sm:col-span-2"><Label className="mb-2 block">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required /></div>
                  <div className="sm:col-span-2"><Label className="mb-2 block">Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" required /></div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl electric-card p-6">
                <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="h-4 w-4 text-electric" /> Promo Code
                </h2>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Enter your promo code"
                    value={promo}
                    onChange={(e) => { setPromo(e.target.value); setPromoError(""); }}
                    disabled={promoApplied}
                  />
                  <Button variant="outline" onClick={applyPromo} disabled={promoApplied || !promo.trim()}>
                    {promoApplied ? "Applied" : "Apply"}
                  </Button>
                </div>
                {promoError && <p className="mt-2 text-xs text-red-400">{promoError}</p>}
              </div>

              <div className="rounded-2xl electric-card p-6">
                <h2 className="font-heading text-xl font-bold text-white">Payment</h2>
                {total <= 0 ? (
                  <p className="mt-2 text-sm text-muted">
                    Your promo covers the full amount — no payment needed. Click below to get your tickets.
                  </p>
                ) : (
                  <>
                    {paymentGatewayDown && (
                      <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        Card and bank payments are temporarily unavailable. Please try again shortly or call{" "}
                        {TICKET_SUPPORT_PHONE} for help completing your purchase.
                      </div>
                    )}
                    <p className="mt-2 text-sm text-muted">
                      You&apos;ll be redirected to Wavy&apos;s secure checkout to pay by card, bank transfer, or USSD.
                    </p>
                    <div className="mt-4 space-y-3 text-sm text-muted">
                      <p className="flex items-center gap-2"><Shield className="h-4 w-4 text-electric" /> Encrypted payment processing</p>
                      <p className="flex items-center gap-2"><Zap className="h-4 w-4 text-electric" /> Powered by Wavy</p>
                    </div>
                  </>
                )}

                <Button className="mt-6 w-full" size="lg" onClick={handlePay} disabled={processing}>
                  {processing
                    ? total <= 0
                      ? "Completing order..."
                      : "Redirecting to Wavy..."
                    : total <= 0
                      ? "Get Free Tickets"
                      : `Pay ${formatPrice(total)} with Wavy`}
                </Button>
                <TicketSupportLine className="mt-4 text-center text-xs" compact />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted">Loading checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
