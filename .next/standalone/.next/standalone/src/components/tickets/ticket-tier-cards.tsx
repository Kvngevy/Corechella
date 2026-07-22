"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { EARLY_BIRD_ALLOCATION } from "@/lib/data";
import type { EarlyBirdStats } from "@/lib/store/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface EarlyBirdCardProps {
  stats: EarlyBirdStats;
  onClaim: () => void;
  disabled?: boolean;
}

function remainingLabel(count: number) {
  if (count <= 0) return "SOLD OUT";
  if (count === 1) return "1 Free Ticket Remaining";
  return `${count} Free Tickets Remaining`;
}

export function EarlyBirdCard({ stats, onClaim, disabled }: EarlyBirdCardProps) {
  const soldOut = stats.exhausted || stats.remaining <= 0;
  const progress = Math.min(100, (stats.issued / EARLY_BIRD_ALLOCATION) * 100);

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-5">
      {soldOut && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/55">
          <span className="rotate-[-12deg] rounded border-4 border-red-600 px-6 py-2 font-heading text-3xl font-bold uppercase tracking-widest text-red-500 shadow-lg">
            SOLD OUT
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-heading text-lg font-bold uppercase text-white">Free Early Bird</h4>
            <span className="rounded bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-400">
              Free
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Limited to 300 free tickets</p>
        </div>
        <p className="font-heading text-xl font-bold text-gold">FREE</p>
      </div>

      <div className="mt-4">
        <p className={cn("text-sm font-semibold uppercase tracking-wide", soldOut ? "text-red-400" : "text-white")}>
          {remainingLabel(stats.remaining)}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn("h-full rounded-full transition-all duration-500", soldOut ? "bg-red-500" : "bg-primary")}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-muted">
          {stats.issued} / {EARLY_BIRD_ALLOCATION} claimed
        </p>
      </div>

      <button
        type="button"
        onClick={onClaim}
        disabled={soldOut || disabled}
        className="btn-purple mt-5 w-full py-3 text-[10px] font-bold uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40"
      >
        {soldOut ? "Sold Out" : "Claim Ticket"}
      </button>
    </div>
  );
}

interface PaidTicketCardProps {
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onPurchase: () => void;
}

export function PaidTicketCard({
  name,
  price,
  description,
  popular,
  quantity,
  onIncrease,
  onDecrease,
  onPurchase,
}: PaidTicketCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border p-5 transition-colors",
        popular ? "border-gold/40 bg-gold/5" : "border-electric/10 hover:border-electric/40"
      )}
    >
      {popular && (
        <span className="absolute -top-3 left-4 rounded-full bg-gold px-3 py-0.5 text-[9px] font-bold uppercase text-black">
          Most Popular
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-heading text-lg font-bold uppercase text-white">{name}</h4>
          <p className="mt-1 text-xs text-muted">{description}</p>
        </div>
        <p className="font-heading text-xl font-bold text-gold">{formatPrice(price)}</p>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onDecrease}
          disabled={quantity <= 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-electric/10 text-white hover:bg-white/5 disabled:opacity-30"
        >
          −
        </button>
        <span className="w-6 text-center text-white">{quantity}</span>
        <button
          type="button"
          onClick={onIncrease}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-electric/10 text-white hover:bg-white/5"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onPurchase}
        className={cn("mt-4 w-full py-3 text-[10px] font-bold uppercase tracking-wider", popular ? "btn-gold" : "btn-purple")}
      >
        Purchase Ticket
      </button>
    </div>
  );
}

export function HomepageEarlyBirdCard({
  stats,
}: {
  stats: EarlyBirdStats;
}) {
  const soldOut = stats.exhausted || stats.remaining <= 0;
  const progress = Math.min(100, (stats.issued / EARLY_BIRD_ALLOCATION) * 100);

  return (
    <div className="rave-card-purple relative flex flex-col p-6">
      {soldOut && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/55">
          <span className="rotate-[-12deg] rounded border-4 border-red-600 px-5 py-2 font-heading text-2xl font-bold uppercase text-red-500">
            SOLD OUT
          </span>
        </div>
      )}

      <span className="absolute -top-3 right-4 rounded border border-green-500/50 bg-green-500/10 px-2 py-0.5 text-[8px] font-bold uppercase text-green-400">
        Free
      </span>

      <h3 className="font-heading text-lg font-bold uppercase text-white">Early Bird</h3>
      <p className="mt-2 font-body text-3xl font-bold text-gold">FREE</p>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-white">
        {remainingLabel(stats.remaining)}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <ul className="mt-5 flex-1 space-y-2">
        {["General entry", "Main floor access", "Food village"].map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-xs text-muted">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
            {perk}
          </li>
        ))}
      </ul>

      <Link
        href="/tickets"
        className={cn("btn-purple mt-6 block w-full py-3 text-center text-[10px] font-bold uppercase tracking-wider", soldOut && "pointer-events-none opacity-40")}
      >
        {soldOut ? "Sold Out" : "Claim Ticket"}
      </Link>
    </div>
  );
}
