"use client";

import { Phone } from "lucide-react";
import { TABLE_RESERVATION_PHONES } from "@/lib/data";

async function trackCall() {
  try {
    await fetch("/api/table-reservation", { method: "POST" });
  } catch {
    /* non-blocking */
  }
}

export function TableReservationPanel() {
  return (
    <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
      <p className="font-heading text-sm font-bold uppercase tracking-wide text-white">
        Table Reservation
      </p>
      <p className="mt-1 text-xs text-muted">For Premium Seating &amp; Table Reservations</p>

      <div className="mt-4 space-y-2">
        {TABLE_RESERVATION_PHONES.map((phone) => (
          <a
            key={phone}
            href={`tel:${phone}`}
            onClick={() => void trackCall()}
            className="group flex items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-3 transition-all duration-300 hover:border-gold/40 hover:bg-gold/10"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110">
              <Phone className="h-4 w-4" />
            </span>
            <span className="font-heading text-sm font-bold tracking-wide text-white">{phone}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export function TableReservationSection() {
  return (
    <section className="border-t border-white/5 bg-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="rave-subheading text-center">Premium Seating</p>
        <h2 className="rave-heading mt-3 text-center">Table Reservation</h2>
        <p className="mt-3 text-center text-sm text-muted">
          For Premium Seating &amp; Table Reservations
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:max-w-2xl sm:mx-auto">
          {TABLE_RESERVATION_PHONES.map((phone) => (
            <a
              key={phone}
              href={`tel:${phone}`}
              onClick={() => void trackCall()}
              className="group flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:bg-gold/5 hover:shadow-[0_0_24px_rgba(212,175,55,0.15)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-110">
                <Phone className="h-5 w-5" />
              </span>
              <span className="font-heading text-lg font-bold tracking-wide text-white">{phone}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
