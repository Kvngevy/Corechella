import {
  corechella,
  EARLY_BIRD_ALLOCATION,
  EARLY_BIRD_TICKET_ID,
} from "@/lib/data";
import type { TicketInventory } from "@/lib/store/types";
import { syncEarlyBirdCounters } from "./early-bird";
import type { DbState } from "./types";

export function getCatalogTicket(id: string) {
  return corechella.tickets.find((t) => t.id === id);
}

export function resolveCatalogPrice(id: string, fallback = 0) {
  return getCatalogTicket(id)?.price ?? fallback;
}

export function syncTicketCatalog(state: DbState): DbState {
  const storedById = new Map(state.tickets.map((t) => [t.id, t]));

  state.tickets = corechella.tickets.map((catalog) => {
    const stored = storedById.get(catalog.id);

    if (!stored) {
      return {
        id: catalog.id,
        name: catalog.name,
        price: catalog.price,
        description: catalog.description,
        total: catalog.id === EARLY_BIRD_TICKET_ID ? EARLY_BIRD_ALLOCATION : catalog.remaining,
        remaining: catalog.id === EARLY_BIRD_TICKET_ID ? EARLY_BIRD_ALLOCATION : catalog.remaining,
        sold: 0,
      };
    }

    const sold = stored.sold ?? 0;

    if (catalog.id === EARLY_BIRD_TICKET_ID) {
      return {
        ...stored,
        id: catalog.id,
        name: catalog.name,
        price: 0,
        description: catalog.description,
        total: EARLY_BIRD_ALLOCATION,
        sold,
        remaining: Math.max(0, EARLY_BIRD_ALLOCATION - sold),
      };
    }

    return {
      ...stored,
      id: catalog.id,
      name: catalog.name,
      price: catalog.price,
      description: catalog.description,
    };
  });

  syncEarlyBirdCounters(state);
  return state;
}

export function catalogMetadataChanged(before: TicketInventory[], after: TicketInventory[]) {
  return after.some((ticket) => {
    const prev = before.find((p) => p.id === ticket.id);
    if (!prev) return true;
    return (
      prev.price !== ticket.price ||
      prev.name !== ticket.name ||
      prev.description !== ticket.description
    );
  });
}
