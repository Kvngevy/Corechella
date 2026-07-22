"use client";

import { useRef } from "react";
import type { AttendeeRecord } from "@/lib/store/types";
import { formatTicketFilename } from "@/lib/ticket-meta";
import { CorechellaTicket } from "./corechella-ticket";
import { TicketDownloadActions } from "./ticket-download-actions";

interface TicketCardProps {
  attendee: AttendeeRecord;
  eventDate?: string;
}

export function TicketCard({ attendee, eventDate }: TicketCardProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const filenameBase = formatTicketFilename(attendee);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-full overflow-x-auto pb-2 flex justify-center">
        <CorechellaTicket
          ref={ticketRef}
          attendee={attendee}
          eventDate={eventDate}
        />
      </div>
      <TicketDownloadActions ticketRef={ticketRef} filenameBase={filenameBase} />
    </div>
  );
}
