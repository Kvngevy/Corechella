import { EVENT_TIME_LINE_TICKET, VENUE_FULL } from "@/lib/data";

const TICKET_INCLUDES: Record<string, string[]> = {
  "Early Bird": ["Early Access Entry", "General Festival Grounds", "Food Village Access"],
  Regular: ["General Admission", "Food Village Access", "Main Stage Viewing"],
  "Regular Ticket": ["General Admission", "Food Village Access", "Main Stage Viewing"],
  VIP: [
    "Fast Track Entry",
    "VIP Lounge Access",
    "Complimentary Drinks",
    "Dedicated VIP Restrooms",
    "Exclusive Viewing Area",
  ],
  VVIP: [
    "All VIP Perks",
    "Backstage Access",
    "Premium Lounge",
    "Complimentary Drinks",
    "Dedicated Host",
    "Exclusive Viewing Deck",
  ],
};

export function getTicketIncludes(ticketType: string): string[] {
  const key = Object.keys(TICKET_INCLUDES).find(
    (k) => k.toLowerCase() === ticketType.toLowerCase()
  );
  if (key) return TICKET_INCLUDES[key];
  return TICKET_INCLUDES.Regular;
}

export function formatTicketStubDate(date: string) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  return { line: `${day}.${month}.${year}`, weekday };
}

export function formatTicketHeaderDate(date: string) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  return `${day}TH ${month}, ${year} ${weekday}`;
}

export function formatTicketDisplayId(eventDate: string, ticketType: string) {
  const d = new Date(eventDate);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const typeCode = ticketType.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6);
  return `#CC${yy}${mm}${dd}${typeCode}`;
}

export function formatTicketFilename(attendee: { ticketType: string; id: string }) {
  const safeType = attendee.ticketType.replace(/\s+/g, "-").toLowerCase();
  return `corechella-${safeType}-${attendee.id}`;
}

export const ticketVenueLine = VENUE_FULL.toUpperCase();
export const ticketTimeLine = EVENT_TIME_LINE_TICKET;
