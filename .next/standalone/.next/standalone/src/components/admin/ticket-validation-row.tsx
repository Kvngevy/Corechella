"use client";

import { Copy, ScanLine, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAttendeeTicketCode } from "@/lib/ticket-codes";
import { formatPrice } from "@/lib/utils";
import type { AttendeeRecord } from "@/lib/store/types";

interface TicketValidationRowProps {
  attendee: AttendeeRecord;
  onCheckIn: (code: string) => void;
  onEmail: (id: string) => void;
  emailingId: string | null;
  emailDisabled?: boolean;
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

function ticketTypeBadgeVariant(ticketType: string) {
  const t = ticketType.toLowerCase();
  if (t.includes("vvip") || t.includes("table")) return "gold" as const;
  if (t.includes("vip")) return "default" as const;
  if (t.includes("early")) return "warning" as const;
  return "secondary" as const;
}

export function TicketValidationCard({
  attendee,
  onCheckIn,
  onEmail,
  emailingId,
  emailDisabled,
}: TicketValidationRowProps) {
  const ticketCode = getAttendeeTicketCode(attendee);
  const checkedIn = attendee.status === "checked-in";

  return (
    <div className="rounded-xl border border-electric/10 bg-black/20 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Ticket Code</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-gold">{ticketCode}</span>
            <button
              type="button"
              className="text-muted hover:text-white"
              title="Copy ticket code"
              onClick={() => copyText(ticketCode)}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1 font-mono text-[10px] text-muted">{attendee.orderId}</p>
        </div>
        <Badge variant={ticketTypeBadgeVariant(attendee.ticketType)}>{attendee.ticketType}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted">Guest</p>
          <p className="font-medium text-white">{attendee.name}</p>
          <p className="text-xs text-muted truncate">{attendee.email}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted">Ticket Type</p>
          <p className="text-white">{attendee.ticketType}</p>
          <p className="text-xs text-muted">{formatPrice(attendee.amount)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <Badge variant={checkedIn ? "success" : "warning"}>
          {checkedIn ? "Checked In" : "Not Checked In"}
        </Badge>
        <div className="flex gap-1">
          {!checkedIn && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => onCheckIn(ticketCode)}
            >
              <ScanLine className="h-3.5 w-3.5" />
              Validate
            </Button>
          )}
          {checkedIn && (
            <span className="flex items-center gap-1 text-xs text-green-400 px-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Valid
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Resend ticket email"
            disabled={emailDisabled || emailingId === attendee.id}
            onClick={() => onEmail(attendee.id)}
          >
            {emailingId === attendee.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TicketValidationRow({
  attendee,
  onCheckIn,
  onEmail,
  emailingId,
  emailDisabled,
}: TicketValidationRowProps) {
  const ticketCode = getAttendeeTicketCode(attendee);
  const checkedIn = attendee.status === "checked-in";

  return (
    <tr className="border-b border-electric/10 hover:bg-white/2">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-gold">{ticketCode}</span>
          <button
            type="button"
            className="text-muted hover:text-white"
            title="Copy ticket code"
            onClick={() => copyText(ticketCode)}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-0.5 font-mono text-[10px] text-muted">{attendee.orderId}</p>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-white">{attendee.name}</p>
        <p className="text-xs text-muted">{attendee.email}</p>
      </td>
      <td className="px-4 py-3">
        <Badge variant={ticketTypeBadgeVariant(attendee.ticketType)}>{attendee.ticketType}</Badge>
      </td>
      <td className="px-4 py-3 text-white">{formatPrice(attendee.amount)}</td>
      <td className="px-4 py-3">
        <Badge variant={checkedIn ? "success" : "warning"}>
          {checkedIn ? "Checked In" : "Not Checked In"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {!checkedIn && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => onCheckIn(ticketCode)}
            >
              <ScanLine className="h-3.5 w-3.5" />
              Validate
            </Button>
          )}
          {checkedIn && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Valid
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Resend ticket email"
            disabled={emailDisabled || emailingId === attendee.id}
            onClick={() => onEmail(attendee.id)}
          >
            {emailingId === attendee.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function TicketValidationTableHead() {
  return (
    <thead className="border-b border-electric/10 bg-white/2">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
          Ticket Code
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
          Guest
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
          Ticket Type
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
          Price
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
          Validation
        </th>
        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted">
          Actions
        </th>
      </tr>
    </thead>
  );
}

interface TicketValidationListProps extends Omit<TicketValidationRowProps, "attendee"> {
  attendees: AttendeeRecord[];
}

export function TicketValidationList({
  attendees,
  onCheckIn,
  onEmail,
  emailingId,
  emailDisabled,
}: TicketValidationListProps) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto rounded-xl border border-electric/10">
        <table className="w-full text-sm">
          <TicketValidationTableHead />
          <tbody>
            {attendees.map((a) => (
              <TicketValidationRow
                key={a.id}
                attendee={a}
                onCheckIn={onCheckIn}
                onEmail={onEmail}
                emailingId={emailingId}
                emailDisabled={emailDisabled}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-3">
        {attendees.map((a) => (
          <TicketValidationCard
            key={a.id}
            attendee={a}
            onCheckIn={onCheckIn}
            onEmail={onEmail}
            emailingId={emailingId}
            emailDisabled={emailDisabled}
          />
        ))}
      </div>
    </>
  );
}
