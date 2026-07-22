"use client";

import { forwardRef } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Sparkles,
} from "lucide-react";
import type { AttendeeRecord } from "@/lib/store/types";
import { corechella, CORECHELLA_THEME } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";
import { getAttendeeTicketCode } from "@/lib/ticket-codes";
import {
  formatTicketDisplayId,
  formatTicketHeaderDate,
  formatTicketStubDate,
  getTicketIncludes,
  ticketTimeLine,
  ticketVenueLine,
} from "@/lib/ticket-meta";

function BarcodeStrip({ value, vertical = false }: { value: string; vertical?: boolean }) {
  const bars = value
    .split("")
    .flatMap((char) => {
      const code = char.charCodeAt(0);
      return [code % 3 === 0 ? 3 : 2, code % 2 === 0 ? 2 : 1];
    })
    .slice(0, 48);

  return (
    <div
      className={cn(
        "flex items-stretch gap-[1.5px]",
        vertical ? "flex-col h-full w-10" : "h-10 w-full"
      )}
    >
      {bars.map((w, i) => (
        <div
          key={i}
          className="bg-white"
          style={
            vertical
              ? { height: `${w * 2}px`, width: "100%" }
              : { width: `${w}px`, height: "100%" }
          }
        />
      ))}
    </div>
  );
}

export interface CorechellaTicketProps {
  attendee: AttendeeRecord;
  eventDate?: string;
  className?: string;
  id?: string;
}

export const CorechellaTicket = forwardRef<HTMLDivElement, CorechellaTicketProps>(
  function CorechellaTicket({ attendee, eventDate = corechella.date, className, id }, ref) {
    const ticketCode = getAttendeeTicketCode(attendee);
    const stubDate = formatTicketStubDate(eventDate);
    const headerDate = formatTicketHeaderDate(eventDate);
    const displayId = formatTicketDisplayId(eventDate, attendee.ticketType);
    const includes = getTicketIncludes(attendee.ticketType);
    const scannableCode = ticketCode;
    const qrSrc = `/api/qr?data=${encodeURIComponent(scannableCode)}&size=256`;

    return (
      <div
        ref={ref}
        id={id}
        className={cn(
          "overflow-hidden rounded-2xl border border-[#7b2ff7]/40 bg-black text-white shadow-2xl shadow-purple-900/30",
          className
        )}
        style={{ width: 920 }}
      >
        <div className="flex min-h-[480px]">
          {/* Left stub */}
          <aside
            className="relative flex w-[148px] shrink-0 flex-col border-r border-dashed border-white/25 bg-[#0a0514]"
          >
            <div className="flex flex-1 flex-col items-center px-3 py-5 text-center">
              <Sparkles className="h-3 w-3 text-gold" />
              <p className="mt-1 font-heading text-[11px] font-bold tracking-[0.25em] text-gold">
                CORECHELLA
              </p>

              <div className="mt-6 space-y-4 w-full text-left">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">Guest</p>
                  <p className="text-[10px] font-bold leading-snug text-white">{attendee.name}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">Ticket</p>
                  <p className="text-[10px] font-bold font-mono text-gold">{ticketCode}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">Order</p>
                  <p className="text-[10px] font-bold font-mono text-white/90">{attendee.orderId}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">Date</p>
                  <p className="text-[10px] font-semibold text-white">{stubDate.line}</p>
                  <p className="text-[9px] text-white/80">{stubDate.weekday}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">Venue</p>
                  <p className="text-[9px] font-semibold leading-snug text-white">{ticketVenueLine}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">Time</p>
                  <p className="text-[9px] font-semibold text-white">{ticketTimeLine}</p>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <p className="font-heading text-4xl font-bold leading-none text-gold">
                  {attendee.ticketType.toUpperCase()}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.35em] text-white/90">
                  ADMIT ONE
                </p>
              </div>
            </div>

            <div className="border-t border-gold/40 bg-gradient-to-br from-gold/30 via-gold/10 to-transparent px-2 py-3 space-y-1">
              <p className="text-center font-mono text-[9px] font-bold tracking-wide text-white/90">
                {attendee.orderId}
              </p>
              <p className="text-center font-mono text-[10px] font-bold tracking-wide text-gold">
                {displayId}
              </p>
            </div>
          </aside>

          {/* Main body */}
          <div className="flex min-w-0 flex-1 flex-col bg-black">
            <div className="relative h-[168px] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/crowd-purple.png"
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-purple-900/40 to-black" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
            </div>

            <div className="relative z-10 -mt-16 px-6 pb-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">
                Edition {corechella.editionNumber}
              </p>
              <h2 className="mt-1 font-heading text-[42px] font-bold uppercase leading-none tracking-wide text-white">
                CORECHELLA
              </h2>
              <p className="tagline-script mt-1 text-lg text-gold">{CORECHELLA_THEME}</p>

              <div className="mt-3 rounded-lg border border-gold/30 bg-black/50 px-4 py-2">
                <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#b026ff]">
                  Ticket Holder
                </p>
                <p className="mt-0.5 font-heading text-xl font-bold uppercase tracking-wide text-white">
                  {attendee.name}
                </p>
                <p className="mt-1 font-mono text-[10px] font-semibold text-gold/90">
                  Order {attendee.orderId}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[9px] font-semibold uppercase tracking-wide text-white/90">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gold shrink-0" />
                  {headerDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                  {ticketVenueLine}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
                  {ticketTimeLine}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gold text-[8px] font-bold text-gold">
                    18+
                  </span>
                  NO UNDER 18
                </span>
              </div>
            </div>

            <div className="mx-6 rounded-xl border border-white/15 bg-[#111111]/90 p-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">
                    Ticket Type
                  </p>
                  <p className="mt-2 font-heading text-3xl font-bold text-gold">
                    {attendee.ticketType.toUpperCase()}
                  </p>
                  <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">
                    Name
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-white">{attendee.name}</p>
                  <p className="mt-2 text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">
                    Order
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] font-semibold text-gold">
                    {attendee.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">
                    Includes
                  </p>
                  <ul className="mt-2 space-y-1">
                    {includes.map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-[9px] text-white/85">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-[#b026ff]">
                    Price
                  </p>
                  <p className="mt-2 font-heading text-3xl font-bold text-white">
                    {formatPrice(attendee.amount)}
                  </p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-gold">
                    Non-Refundable
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-6 mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#7b2ff7]/50 bg-[#0a0514]/80 px-4 py-2.5 text-[8px] uppercase tracking-wide">
              <span className="flex items-center gap-2 text-white/80">
                <Shield className="h-3.5 w-3.5 text-gold shrink-0" />
                Secure your spot. Tickets are limited.
              </span>
              <span className="font-bold text-white/60">Powered by Wavy</span>
              <span className="text-white/50">@CORECHELLA</span>
            </div>
          </div>

          {/* Right validation strip */}
          <aside className="flex w-[118px] shrink-0 flex-col items-center border-l border-white/10 bg-[#0a0514] py-4 px-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-lg border border-gold/30 bg-gradient-to-br from-[#7b2ff7]/40 via-[#00f0ff]/20 to-gold/30"
            >
              <span className="font-heading text-2xl font-bold text-white">C</span>
            </div>
            <p className="mt-1 text-[7px] font-bold tracking-widest text-gold">CORECHELLA</p>
            <p className="mt-2 font-mono text-[8px] font-bold text-white/80">{attendee.orderId}</p>

            <div className="mt-3 flex h-28 items-center gap-2">
              <BarcodeStrip value={displayId} vertical />
              <p
                className="font-mono text-[9px] font-bold text-gold [writing-mode:vertical-rl] rotate-180"
              >
                {displayId}
              </p>
            </div>

            <div className="mt-4 rounded-lg border-2 border-gold/50 bg-white p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt="Ticket QR code"
                width={96}
                height={96}
                className="h-[96px] w-[96px] object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <p className="mt-2 font-mono text-[9px] font-bold text-gold text-center">{scannableCode}</p>
          </aside>
        </div>
      </div>
    );
  }
);
