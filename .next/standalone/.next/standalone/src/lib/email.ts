import { corechella, VENUE_FULL } from "@/lib/data";
import type { AttendeeRecord } from "@/lib/store/types";

export interface TicketEmailPayload {
  to: string;
  subject: string;
  body: string;
}

export function buildTicketEmail(attendee: AttendeeRecord): TicketEmailPayload {
  const subject = `Your ${corechella.title} ticket — ${attendee.ticketType}`;
  const body = [
    `Hi ${attendee.name},`,
    "",
    `Your ${attendee.ticketType} ticket for ${corechella.title} is confirmed.`,
    "",
    `QR Code: ${attendee.qrCode}`,
    `Venue: ${VENUE_FULL}`,
    "",
    "Show this QR code at the gate for entry. See you at the rave!",
    "",
    "— Corechella Team",
  ].join("\n");

  return { to: attendee.email, subject, body };
}

/** Simulates sending — swap for a real provider (Resend, SendGrid, etc.) in production. */
export async function dispatchEmails(payloads: TicketEmailPayload[]): Promise<{ sent: number }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { sent: payloads.length };
}
