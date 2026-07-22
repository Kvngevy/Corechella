"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Music,
  Utensils,
  Shield,
  ChevronDown,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EarlyBirdCard, PaidTicketCard } from "@/components/tickets/ticket-tier-cards";
import { TicketSupportLine } from "@/components/tickets/ticket-support-line";
import {
  TableReservationPanel,
  TableReservationSection,
} from "@/components/tickets/table-reservation-section";
import {
  corechella,
  EARLY_BIRD_TICKET_ID,
  REGULAR_TICKET_PRICE,
  TOTAL_EDITIONS,
  VIP_TICKET_PRICE,
  VENUE_FULL,
  CORECHELLA_THEME,
} from "@/lib/data";
import { getAllGuestBundles } from "@/lib/guest-ticket-storage";
import { usePlatform } from "@/lib/store/platform-store";
import { formatEventDates, formatPrice, cn } from "@/lib/utils";

export default function TicketsPage() {
  const router = useRouter();
  const { tickets, earlyBird, setCart } = usePlatform();
  const savedOrders = getAllGuestBundles().filter((b) => b.attendees.length > 0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const earlyBirdTier = tickets.find((t) => t.id === EARLY_BIRD_TICKET_ID);
  const regularTier = tickets.find((t) => t.id === "reg");
  const vipTier = tickets.find((t) => t.id === "vip");

  const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice =
    (quantities.reg || 0) * REGULAR_TICKET_PRICE + (quantities.vip || 0) * VIP_TICKET_PRICE;

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const tier = tickets.find((t) => t.id === id);
      const current = prev[id] || 0;
      const max = tier?.remaining ?? 10;
      const next = Math.max(0, Math.min(Math.min(10, max), current + delta));
      return { ...prev, [id]: next };
    });
  };

  const goToCheckout = (items: typeof tickets extends infer _ ? { ticketId: string; ticketName: string; price: number; quantity: number }[] : never) => {
    if (items.length === 0) return;
    setCart(items);
    router.push("/checkout");
  };

  const claimEarlyBird = () => {
    if (!earlyBirdTier || earlyBird.exhausted) return;
    goToCheckout([
      {
        ticketId: earlyBirdTier.id,
        ticketName: earlyBirdTier.name,
        price: 0,
        quantity: 1,
      },
    ]);
  };

  const purchasePaid = (tierId: string) => {
    const tier = tickets.find((t) => t.id === tierId);
    const qty = quantities[tierId] || 1;
    if (!tier) return;
    const price =
      tierId === "reg" ? REGULAR_TICKET_PRICE : tierId === "vip" ? VIP_TICKET_PRICE : tier.price;
    goToCheckout([
      {
        ticketId: tier.id,
        ticketName: tier.name,
        price,
        quantity: Math.max(1, qty),
      },
    ]);
  };

  return (
    <>
      <Navbar />
      <main className="pt-16">
        <div className="relative h-[50vh] min-h-[400px]">
          <Image src={corechella.banner} alt={corechella.title} fill className="object-cover object-center" priority sizes="100vw" />
          <div className="hero-gradient absolute inset-0" />
          <div className="hero-electric-overlay absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Badge variant="gold" className="mb-4">
                <Zap className="h-3 w-3 mr-1" /> {CORECHELLA_THEME} · Edition {corechella.editionNumber} of {TOTAL_EDITIONS}
              </Badge>
              <h1 className="font-heading text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                {corechella.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> {formatEventDates(corechella.date, corechella.endDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {corechella.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {VENUE_FULL}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {savedOrders.length > 0 && (
            <div className="mb-10 rounded-2xl border border-electric/20 bg-electric/5 p-5">
              <p className="text-sm font-semibold text-white">Your tickets on this device</p>
              <p className="mt-1 text-xs text-muted">
                Saved locally — view and download even if the server is slow
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {savedOrders.map((bundle) => (
                  <Link
                    key={bundle.order.id}
                    href={`/checkout?order=${encodeURIComponent(bundle.order.id)}`}
                    className="rounded-lg border border-electric/30 bg-black/40 px-4 py-2 text-sm font-mono text-electric hover:bg-electric/10"
                  >
                    {bundle.order.id} · {bundle.attendees.length} ticket
                    {bundle.attendees.length !== 1 ? "s" : ""}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h2 className="font-heading text-2xl font-bold text-white">About Corechella</h2>
                <p className="mt-4 text-muted leading-relaxed">{corechella.description}</p>
                <p className="mt-4 text-sm text-electric">
                  No account required — buy tickets instantly as a guest.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { icon: Music, text: "Full Day of Live Music" },
                    { icon: Utensils, text: "Food Village & Drinks" },
                    { icon: Shield, text: "Secure Event Grounds" },
                    { icon: Zap, text: "Every 3–4 Months" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 text-sm text-muted">
                      <item.icon className="h-4 w-4 text-electric shrink-0" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </section>

              {corechella.gallery.length > 0 && (
                <section>
                  <h2 className="font-heading text-2xl font-bold text-white">Gallery</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    {corechella.gallery.slice(0, 6).map((img, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                        <Image src={img} alt={`Corechella gallery ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section id="faqs">
                <h2 className="font-heading text-2xl font-bold text-white">FAQs</h2>
                <div className="mt-4 space-y-2">
                  {corechella.faqs.map((faq, i) => (
                    <div key={i} className="rounded-xl electric-card overflow-hidden">
                      <button
                        className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-white"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        {faq.question}
                        <ChevronDown className={cn("h-4 w-4 transition-transform", openFaq === i && "rotate-180")} />
                      </button>
                      {openFaq === i && (
                        <div className="border-t border-electric/10 px-4 pb-4 text-sm text-muted">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl electric-card p-6 electric-glow-sm">
                  <h3 className="font-heading text-xl font-bold text-white">Select Ticket Type</h3>
                  <p className="mt-1 text-xs text-muted">Rave pass · Corechella {corechella.edition}</p>

                  <div className="mt-4 space-y-4">
                    <EarlyBirdCard stats={earlyBird} onClaim={claimEarlyBird} />

                    {regularTier && (
                      <PaidTicketCard
                        name="Regular"
                        price={REGULAR_TICKET_PRICE}
                        description={regularTier.description}
                        quantity={quantities.reg || 0}
                        onIncrease={() => updateQty("reg", 1)}
                        onDecrease={() => updateQty("reg", -1)}
                        onPurchase={() => purchasePaid("reg")}
                      />
                    )}

                    {vipTier && (
                      <PaidTicketCard
                        name="VIP"
                        price={VIP_TICKET_PRICE}
                        description={vipTier.description}
                        popular
                        quantity={quantities.vip || 0}
                        onIncrease={() => updateQty("vip", 1)}
                        onDecrease={() => updateQty("vip", -1)}
                        onPurchase={() => purchasePaid("vip")}
                      />
                    )}

                    <TableReservationPanel />
                  </div>

                  {totalTickets > 0 && totalPrice > 0 && (
                    <>
                      <Separator className="my-6" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">{totalTickets} ticket{totalTickets !== 1 ? "s" : ""}</span>
                        <span className="font-heading text-xl font-bold text-white">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                      <Button
                        className="mt-4 w-full"
                        size="lg"
                        onClick={() =>
                          goToCheckout(
                            tickets
                              .filter((t) => t.id !== EARLY_BIRD_TICKET_ID && (quantities[t.id] || 0) > 0)
                              .map((t) => ({
                                ticketId: t.id,
                                ticketName: t.name,
                                price: t.id === "reg" ? REGULAR_TICKET_PRICE : t.id === "vip" ? VIP_TICKET_PRICE : t.price,
                                quantity: quantities[t.id],
                              }))
                          )
                        }
                      >
                        Continue to Checkout
                      </Button>
                    </>
                  )}

                  <p className="mt-3 text-center text-[11px] text-muted">Guest checkout · no login required</p>
                  <TicketSupportLine className="mt-4 text-center text-xs" compact />
                </div>
              </div>
            </div>
          </div>
        </div>

        <TableReservationSection />
      </main>
      <Footer />
    </>
  );
}
