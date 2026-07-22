"use client";

import Link from "next/link";
import Image from "next/image";
import { corechella } from "@/lib/data";
import { usePlatform } from "@/lib/store/platform-store";
import { formatEventDates, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketEditor } from "@/components/admin/ticket-editor";

export default function AdminEventsPage() {
  const { tickets, session, updateTicket } = usePlatform();
  const isSuperAdmin = session?.role === "super_admin";
  const totalSold = tickets.reduce((s, t) => s + t.sold, 0);
  const totalRemaining = tickets.reduce((s, t) => s + t.remaining, 0);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Ticket Monitoring</h1>
          <p className="mt-1 text-muted">
            Live inventory for Corechella {corechella.edition}
            {isSuperAdmin ? " — you can edit prices and details below." : " — view only."}
          </p>
        </div>
        {isSuperAdmin && (
          <Link href="/admin/events/create">
            <Button>Configure Edition</Button>
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Sold", value: totalSold },
          { label: "Remaining", value: totalRemaining },
          { label: "Revenue Potential", value: formatPrice(tickets.reduce((s, t) => s + t.remaining * t.price, 0)) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl electric-card p-5">
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl electric-card">
        <table className="w-full text-sm">
          <thead className="border-b border-electric/10">
            <tr>
              <th className="px-6 py-4 text-left font-medium text-muted">Edition</th>
              <th className="px-6 py-4 text-left font-medium text-muted">Dates</th>
              <th className="px-6 py-4 text-left font-medium text-muted">Venue</th>
              <th className="px-6 py-4 text-left font-medium text-muted">From</th>
              <th className="px-6 py-4 text-left font-medium text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-electric/10 hover:bg-white/2">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                    <Image src={corechella.image} alt="" fill className="object-cover" sizes="40px" />
                  </div>
                  <span className="font-medium text-white">{corechella.title}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-muted">{formatEventDates(corechella.date, corechella.endDate)}</td>
              <td className="px-6 py-4 text-muted">{corechella.venue}, {corechella.city}</td>
              <td className="px-6 py-4 text-white">
                From {formatPrice(Math.min(...tickets.map((t) => t.price)))}
              </td>
              <td className="px-6 py-4"><Badge variant="success">On Sale</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tickets.map((t) =>
          isSuperAdmin ? (
            <TicketEditor key={t.id} ticket={t} onSave={updateTicket} />
          ) : (
            <div key={t.id} className="rounded-2xl electric-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-heading text-lg font-bold text-white">{t.name}</p>
                  <p className="text-sm text-muted mt-1">{t.description}</p>
                </div>
                <p className="font-semibold text-electric">{formatPrice(t.price)}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-lg font-bold text-white">{t.sold}</p>
                  <p className="text-[10px] text-muted uppercase">Sold</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className={`text-lg font-bold ${t.remaining < 50 ? "text-orange-400" : "text-white"}`}>
                    {t.remaining}
                  </p>
                  <p className="text-[10px] text-muted uppercase">Left</p>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-lg font-bold text-white">
                    {t.total ? Math.round((t.sold / t.total) * 100) : 0}%
                  </p>
                  <p className="text-[10px] text-muted uppercase">Capacity</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
