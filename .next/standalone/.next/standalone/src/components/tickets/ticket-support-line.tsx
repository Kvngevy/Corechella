import { Phone } from "lucide-react";
import { TICKET_SUPPORT_PHONE } from "@/lib/data";
import { cn } from "@/lib/utils";

export function TicketSupportLine({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <p className={cn("text-sm text-muted", className)}>
      {!compact && <Phone className="mr-1.5 inline h-4 w-4 -translate-y-px text-gold" aria-hidden />}
      Ticket issues? Call or WhatsApp{" "}
      <a
        href={`tel:${TICKET_SUPPORT_PHONE}`}
        className="font-semibold text-gold transition-opacity hover:opacity-80"
      >
        {TICKET_SUPPORT_PHONE}
      </a>
    </p>
  );
}
