"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ScanLine,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlatform } from "@/lib/store/platform-store";
import { formatPrice } from "@/lib/utils";
import { corechella, CURRENT_EDITION } from "@/lib/data";
import {
  TicketValidationList,
} from "@/components/admin/ticket-validation-row";
import { getAttendeeTicketCode } from "@/lib/ticket-codes";

type StatusFilter = "all" | "pending" | "checked-in";

export default function AttendeesPage() {
  const { attendees, tickets, checkInByQr, sendAttendeeEmail, sendBulkAttendeeEmails } = usePlatform();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [ticketTypeFilter, setTicketTypeFilter] = useState<string>("all");
  const [sendingBulk, setSendingBulk] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [quickCode, setQuickCode] = useState("");
  const [quickValidating, setQuickValidating] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const ticketTypes = useMemo(() => {
    const fromAttendees = attendees.map((a) => a.ticketType);
    const fromInventory = tickets.map((t) => t.name);
    return [...new Set([...fromInventory, ...fromAttendees])].sort();
  }, [attendees, tickets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return attendees.filter((a) => {
      const ticketCode = getAttendeeTicketCode(a).toLowerCase();
      const matchesSearch =
        !q ||
        ticketCode.includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.orderId.toLowerCase().includes(q) ||
        a.ticketType.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "checked-in" && a.status === "checked-in") ||
        (statusFilter === "pending" && a.status !== "checked-in");

      const matchesType =
        ticketTypeFilter === "all" ||
        a.ticketType.toLowerCase() === ticketTypeFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [attendees, search, statusFilter, ticketTypeFilter]);

  const checkedIn = attendees.filter((a) => a.status === "checked-in").length;
  const isFiltered = search.trim().length > 0 || statusFilter !== "all" || ticketTypeFilter !== "all";

  const showNotice = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const handleBulkEmail = async () => {
    if (filtered.length === 0 || sendingBulk) return;
    setSendingBulk(true);
    try {
      const result = await sendBulkAttendeeEmails(filtered.map((a) => a.id));
      showNotice(result.success ? "success" : "error", result.message);
    } finally {
      setSendingBulk(false);
    }
  };

  const handleSingleEmail = async (attendeeId: string) => {
    if (sendingId) return;
    setSendingId(attendeeId);
    try {
      const result = await sendAttendeeEmail(attendeeId);
      showNotice(result.success ? "success" : "error", result.message);
    } finally {
      setSendingId(null);
    }
  };

  const handleCheckIn = async (code: string) => {
    const result = await checkInByQr(code);
    if (result.status === "valid") {
      showNotice("success", `Validated ${code} — checked in successfully`);
    } else if (result.status === "used") {
      showNotice("error", `${code} was already checked in`);
    } else if (result.status === "pending_payment") {
      showNotice("error", "Order payment is not completed");
    } else {
      showNotice("error", result.message ?? "Ticket not recognized");
    }
  };

  const handleQuickValidate = async () => {
    const code = quickCode.trim();
    if (!code || quickValidating) return;
    setQuickValidating(true);
    try {
      await handleCheckIn(code);
      setQuickCode("");
    } finally {
      setQuickValidating(false);
    }
  };

  const exportCsv = () => {
    const header = "Ticket Code,Order,Guest,Email,Ticket Type,Amount,Status";
    const rows = filtered.map((a) => {
      const code = getAttendeeTicketCode(a);
      return [
        code,
        a.orderId,
        a.name,
        a.email,
        a.ticketType,
        a.amount,
        a.status,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `corechella-e${CURRENT_EDITION}-attendees.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Attendee Validation</h1>
          <p className="mt-1 text-muted">
            Edition {CURRENT_EDITION} · {corechella.venue} · validate by ticket code
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={handleBulkEmail}
            disabled={sendingBulk || filtered.length === 0}
          >
            {sendingBulk ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {sendingBulk ? "Sending..." : isFiltered ? `Email (${filtered.length})` : "Email All"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {notice && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {notice.message}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-electric/20 bg-electric/5 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-electric">Quick validate</p>
        <p className="mt-1 text-sm text-muted">
          Enter a ticket code (e.g. CC4-000001-01) or scan from the check-in page
        </p>
        <div className="mt-3 flex gap-2 max-w-lg">
          <Input
            placeholder="CC4-000001-01"
            className="font-mono"
            value={quickCode}
            onChange={(e) => setQuickCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuickValidate()}
          />
          <Button onClick={handleQuickValidate} disabled={!quickCode.trim() || quickValidating}>
            {quickValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ScanLine className="h-4 w-4" />
            )}
            Validate
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Tickets", value: attendees.length },
          { label: "Validated", value: checkedIn },
          { label: "Pending", value: attendees.length - checkedIn },
          {
            label: "Revenue",
            value: formatPrice(attendees.reduce((s, a) => s + a.amount, 0)),
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl electric-card p-5">
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder="Ticket code, order, name, email, ticket type..."
            className="pl-10 font-mono text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={ticketTypeFilter === "all" ? "default" : "outline"}
            onClick={() => setTicketTypeFilter("all")}
          >
            All types
          </Button>
          {ticketTypes.map((type) => (
            <Button
              key={type}
              size="sm"
              variant={ticketTypeFilter === type ? "default" : "outline"}
              onClick={() => setTicketTypeFilter(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "pending", "checked-in"] as StatusFilter[]).map((filter) => (
          <Button
            key={filter}
            size="sm"
            variant={statusFilter === filter ? "default" : "outline"}
            onClick={() => setStatusFilter(filter)}
          >
            {filter === "all" ? "All status" : filter === "pending" ? "Not checked in" : "Validated"}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <p className="rounded-2xl electric-card px-6 py-10 text-center text-sm text-muted">
            No tickets match your filters.
          </p>
        ) : (
          <TicketValidationList
            attendees={filtered}
            onCheckIn={handleCheckIn}
            onEmail={handleSingleEmail}
            emailingId={sendingId}
            emailDisabled={sendingBulk}
          />
        )}
      </div>

      <p className="mt-6 text-xs text-muted">
        Ticket codes follow <span className="font-mono text-gold">CC{CURRENT_EDITION}-000001-01</span> —
        edition, order number, and ticket number for fast gate validation.
      </p>
    </div>
  );
}
