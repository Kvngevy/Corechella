import type { AuthSession } from "@/lib/server/types";
import type { AttendeeRecord, CartItem, OrderRecord, PromoCode, TicketInventory } from "@/lib/store/types";

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid server response (${res.status})`);
  }
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
      credentials: "include",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    if (message === "fetch failed" || message === "Failed to fetch") {
      throw new Error(
        "Could not reach the server. Check your connection and try again in a moment."
      );
    }
    throw new Error(message);
  }

  const data = await parseResponse<{ error?: string } & T>(res);
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export const apiClient = {
  getSession: () => api<{ user: AuthSession | null }>("/api/auth/logout"),
  login: (payload: { email: string; password: string }) =>
    api<{ user: AuthSession }>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => api<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
  getTickets: () =>
    api<{
      tickets: TicketInventory[];
      earlyBird: import("@/lib/store/types").EarlyBirdStats;
      tableReservationCalls?: number;
      checkInsToday?: number;
    }>("/api/tickets", { cache: "no-store" }),
  getPromos: () => api<{ promos: PromoCode[] }>("/api/promos"),
  validatePromo: (code: string, items: CartItem[]) =>
    api<{ valid: boolean; discount?: number; promo?: PromoCode; message?: string }>(
      "/api/promos",
      { method: "POST", body: JSON.stringify({ code, items }) }
    ),
  checkout: (payload: {
    items: CartItem[];
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paymentMethod: string;
    promoCode?: string;
    deviceFingerprint?: string;
  }) =>
    api<{
      orderId: string;
      order: OrderRecord;
      attendees: AttendeeRecord[];
      guestAccess?: string;
      checkoutUrl?: string;
      pending?: boolean;
      paymentReference?: string;
    }>("/api/checkout", { method: "POST", body: JSON.stringify(payload) }),
  getOrders: (guestOrderIds?: string[]) => {
    const query =
      guestOrderIds && guestOrderIds.length
        ? `?guestOrderIds=${guestOrderIds.map(encodeURIComponent).join(",")}`
        : "";
    return api<{ orders: OrderRecord[]; attendees: AttendeeRecord[] }>(`/api/orders${query}`);
  },
  getGuestOrderTickets: (orderId: string, txRef?: string) => {
    const params = new URLSearchParams({ orderId });
    if (txRef) params.set("tx_ref", txRef);
    return api<{
      order: OrderRecord;
      status: OrderRecord["status"];
      attendees: AttendeeRecord[];
      ticketCount: number;
    }>(`/api/orders/guest?${params.toString()}`, { cache: "no-store" });
  },
  getOrder: (orderId: string) =>
    api<{
      order: OrderRecord;
      attendees: AttendeeRecord[];
      summary?: { ticketCount: number; checkedIn: number; pendingCheckIn: number };
    }>(`/api/orders/${encodeURIComponent(orderId)}`),
  confirmOrder: (orderId: string) =>
    api<{ success: boolean; order?: OrderRecord; alreadyCompleted?: boolean }>(
      `/api/orders/${orderId}/confirm`,
      { method: "PATCH" }
    ),
  checkIn: (qrCode: string) =>
    api<{
      status: "valid" | "used" | "invalid" | "pending_payment";
      message?: string;
      attendee?: AttendeeRecord;
      ticketCode?: string;
      checkInTime?: string;
      order?: { id: string; status: OrderRecord["status"]; customerName: string };
    }>("/api/check-in", { method: "POST", body: JSON.stringify({ qrCode }) }),
  getStaff: () =>
    api<{
      staff: {
        id: string;
        name: string;
        email: string;
        role: string;
        permissions: string[];
        status: string;
      }[];
    }>("/api/staff"),
  addStaff: (payload: { name: string; email: string; password: string; permissions?: string[] }) =>
    api<{
      success: boolean;
      staff?: {
        id: string;
        name: string;
        email: string;
        role: string;
        permissions: string[];
        status: string;
      };
    }>("/api/staff", { method: "POST", body: JSON.stringify(payload) }),
  updateStaff: (payload: { id: string; action: string; permissions?: string[] }) =>
    api<{ success: boolean }>("/api/staff", { method: "PATCH", body: JSON.stringify(payload) }),
  addPromo: (payload: { code: string; type: string; value: number; maxUses: number }) =>
    api<{ success: boolean; promo?: PromoCode }>("/api/promos/manage", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  togglePromo: (id: string) =>
    api<{ success: boolean; promo?: PromoCode }>("/api/promos/manage", {
      method: "PATCH",
      body: JSON.stringify({ id }),
    }),
  deletePromo: (id: string) =>
    api<{ success: boolean }>(`/api/promos/manage?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  updateTicket: (payload: {
    id: string;
    name?: string;
    price?: number;
    description?: string;
    total?: number;
  }) =>
    api<{ success: boolean; ticket: TicketInventory }>("/api/tickets/manage", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
