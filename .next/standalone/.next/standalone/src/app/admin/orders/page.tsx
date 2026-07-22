"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown, ChevronRight, Copy } from "lucide-react";
import { formatOrderDate, usePlatform } from "@/lib/store/platform-store";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TicketValidationList,
} from "@/components/admin/ticket-validation-row";
import { getAttendeeTicketCode, parseOrderIdInput } from "@/lib/ticket-codes";
import { corechella } from "@/lib/data";

export default function OrdersPage() {
  const { orders, attendees, markOrderComplete, checkInByQr } = usePlatform();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    const orderIdQuery = parseOrderIdInput(search);
    return orders.filter((o) => {
      if (orderIdQuery && o.id.toUpperCase() === orderIdQuery) return true;
      const orderAttendees = attendees.filter((a) => a.orderId === o.id);
      const ticketMatch = orderAttendees.some((a) =>
        getAttendeeTicketCode(a).toLowerCase().includes(q)
      );
      return (
        ticketMatch ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q)
      );
    });
  }, [orders, attendees, search]);

  const getOrderAttendees = (orderId: string) =>
    attendees
      .filter((a) => a.orderId === orderId)
      .sort((a, b) => (a.ticketIndex ?? 0) - (b.ticketIndex ?? 0));

  const handleCheckIn = async (code: string) => {
    await checkInByQr(code);
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-heading text-3xl font-bold text-white">Orders</h1>
      <p className="mt-1 text-muted">
        {orders.length} orders · expand any order to validate tickets by code (e.g. CC4-000001-01)
      </p>

      <div className="mt-6 relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Search order CC4-000001, ticket code, name, email..."
          className="pl-10 font-mono text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-8 space-y-3">
        {filtered.map((o) => {
          const orderAttendees = getOrderAttendees(o.id);
          const checkedIn = orderAttendees.filter((a) => a.status === "checked-in").length;
          const expanded = expandedId === o.id;
          const canValidate = o.status === "completed";

          return (
            <div key={o.id} className="rounded-2xl electric-card overflow-hidden">
              <button
                type="button"
                className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-white/2"
                onClick={() => setExpandedId(expanded ? null : o.id)}
              >
                <span className="mt-1 text-muted">
                  {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </span>
                <div className="flex-1 min-w-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted">Order</p>
                    <p className="font-mono text-sm font-semibold text-gold">{o.id}</p>
                    <p className="text-xs text-muted">{formatOrderDate(o.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted">Customer</p>
                    <p className="text-sm text-white">{o.customerName}</p>
                    <p className="text-xs text-muted">{o.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted">Tickets</p>
                    <p className="text-sm text-white">
                      {o.items.map((i) => `${i.ticketName}×${i.quantity}`).join(", ")}
                    </p>
                    <p className="text-xs text-muted">{orderAttendees.length} ticket code(s)</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted">Check-in</p>
                    {canValidate ? (
                      <p className="text-sm text-white">
                        {checkedIn}/{orderAttendees.length} validated
                      </p>
                    ) : (
                      <p className="text-sm text-yellow-400">Awaiting payment</p>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted">Total</p>
                      <p className="text-sm font-semibold text-white">{formatPrice(o.total)}</p>
                      <Badge
                        variant={o.status === "completed" ? "success" : "warning"}
                        className="mt-1"
                      >
                        {o.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </button>

              {expanded && (
                <div className="border-t border-electric/10 bg-black/20 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <p className="text-sm text-muted">
                      Validate each ticket using its code — scan QR or enter{" "}
                      <span className="font-mono text-gold">CC4-000001-01</span>
                    </p>
                    <div className="flex gap-2">
                      {o.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => void markOrderComplete(o.id)}>
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void navigator.clipboard.writeText(o.id)}
                      >
                        <Copy className="h-4 w-4" />
                        Copy order
                      </Button>
                    </div>
                  </div>

                  {orderAttendees.length === 0 ? (
                    <p className="text-sm text-muted py-4 text-center">No tickets for this order yet.</p>
                  ) : (
                    <TicketValidationList
                      attendees={orderAttendees}
                      onCheckIn={handleCheckIn}
                      onEmail={() => {}}
                      emailingId={null}
                      emailDisabled
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted">No orders match your search.</p>
      )}

      <p className="mt-8 text-xs text-muted">
        Edition {corechella.editionNumber} · {corechella.venue}, {corechella.city}
      </p>
    </div>
  );
}
