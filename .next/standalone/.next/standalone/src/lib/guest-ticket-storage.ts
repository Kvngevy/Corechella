import type { AttendeeRecord, OrderRecord } from "@/lib/store/types";

export const GUEST_TICKETS_STORAGE_KEY = "corechella-guest-tickets-v1";

export interface SavedGuestOrder {
  order: OrderRecord;
  attendees: AttendeeRecord[];
  savedAt: string;
}

type GuestTicketStore = Record<string, SavedGuestOrder>;

function readStore(): GuestTicketStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(GUEST_TICKETS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as GuestTicketStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: GuestTicketStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_TICKETS_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota or private mode */
  }
}

export function saveGuestOrderBundle(order: OrderRecord, attendees: AttendeeRecord[]) {
  if (!order?.id) return;
  const store = readStore();
  store[order.id] = {
    order,
    attendees: attendees.filter((a) => a.orderId === order.id),
    savedAt: new Date().toISOString(),
  };
  writeStore(store);
}

export function getGuestOrderBundle(orderId: string): SavedGuestOrder | null {
  return readStore()[orderId] ?? null;
}

export function getGuestBundlesForIds(orderIds: string[]): SavedGuestOrder[] {
  const store = readStore();
  return orderIds
    .map((id) => store[id])
    .filter((bundle): bundle is SavedGuestOrder => Boolean(bundle));
}

export function getAllGuestBundles(): SavedGuestOrder[] {
  const store = readStore();
  return Object.values(store).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}

export function mergeGuestBundles(
  orderIds: string[],
  orders: OrderRecord[],
  attendees: AttendeeRecord[]
): { orders: OrderRecord[]; attendees: AttendeeRecord[] } {
  const bundles = getGuestBundlesForIds(orderIds);
  if (!bundles.length) return { orders, attendees };

  const orderMap = new Map(orders.map((o) => [o.id, o]));
  const attendeeMap = new Map(attendees.map((a) => [a.id, a]));

  bundles.forEach((bundle) => {
    orderMap.set(bundle.order.id, bundle.order);
    bundle.attendees.forEach((attendee) => {
      attendeeMap.set(attendee.id, attendee);
    });
  });

  return {
    orders: Array.from(orderMap.values()),
    attendees: Array.from(attendeeMap.values()),
  };
}
