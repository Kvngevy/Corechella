import type { AttendeeRecord } from "@/lib/store/types";
import { CURRENT_EDITION } from "./data";

/** Order reference: CC4-000001 */
export function formatOrderId(edition: number, sequence: number) {
  return `CC${edition}-${String(sequence).padStart(6, "0")}`;
}

export function formatOrderIdForCurrentEdition(sequence: number) {
  return formatOrderId(CURRENT_EDITION, sequence);
}

/** Human-readable ticket code for gate validation: CC4-000001-01 */
export function formatTicketCode(orderId: string, ticketIndex: number) {
  return `${orderId}-${String(ticketIndex).padStart(2, "0")}`;
}

export function buildAttendeeId(orderId: string, ticketIndex: number) {
  return `att-${orderId}-${String(ticketIndex).padStart(2, "0")}`;
}

export function parseTicketCode(input: string): { orderId: string; ticketIndex: number } | null {
  const raw = input.trim().toUpperCase().replace(/\s/g, "");

  const editionFormat = raw.match(/^CC(\d+)-(\d{6})-(?:T)?(\d{1,2})$/);
  if (editionFormat) {
    return {
      orderId: `CC${editionFormat[1]}-${editionFormat[2]}`,
      ticketIndex: parseInt(editionFormat[3], 10),
    };
  }

  const legacyFormat = raw.match(/^CC-(\d{4})-(\d{6})-(?:T)?(\d{1,2})$/);
  if (legacyFormat) {
    return {
      orderId: `CC-${legacyFormat[1]}-${legacyFormat[2]}`,
      ticketIndex: parseInt(legacyFormat[3], 10),
    };
  }

  return null;
}

export function parseOrderIdInput(input: string): string | null {
  const raw = input.trim().toUpperCase().replace(/\s/g, "");
  if (/^CC\d+-\d{6}$/.test(raw)) return raw;
  if (/^CC-\d{4}-\d{6}$/.test(raw)) return raw;
  return null;
}

export function getTicketIndexFromAttendee(attendee: {
  id: string;
  orderId: string;
  ticketIndex?: number;
}): number | undefined {
  if (attendee.ticketIndex != null) return attendee.ticketIndex;

  const prefix = `att-${attendee.orderId}-`;
  if (attendee.id.toLowerCase().startsWith(prefix.toLowerCase())) {
    const tail = attendee.id.slice(prefix.length);
    const parsed = parseInt(tail, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function getAttendeeTicketCode(attendee: AttendeeRecord): string {
  if (attendee.ticketCode) return attendee.ticketCode;
  const index = getTicketIndexFromAttendee(attendee);
  if (index != null) return formatTicketCode(attendee.orderId, index);
  return attendee.id;
}
