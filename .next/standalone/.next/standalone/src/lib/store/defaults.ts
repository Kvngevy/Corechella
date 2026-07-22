import { corechella } from "@/lib/data";
import type { PlatformState } from "./types";

export const SERVICE_FEE = 0;
export const STORAGE_KEY = "corechella-platform-v1";

export function createDefaultState(): PlatformState {
  return {
    cart: [],
    tickets: corechella.tickets.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      description: t.description,
      total: t.remaining,
      remaining: t.remaining,
      sold: 0,
    })),
    promos: [],
    orders: [],
    attendees: [],
    staff: [],
    guestOrderIds: [],
    session: null,
  };
}
