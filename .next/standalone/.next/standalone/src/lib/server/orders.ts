import type { AttendeeRecord, CartItem, OrderRecord } from "@/lib/store/types";
import {
  corechella,
  EARLY_BIRD_TICKET_ID,
} from "@/lib/data";
import { SERVICE_FEE } from "@/lib/store/defaults";
import {
  buildAttendeeId,
  formatOrderIdForCurrentEdition,
  formatTicketCode,
} from "@/lib/ticket-codes";
import {
  getEarlyBirdStats,
  registerEarlyBirdClaim,
  syncEarlyBirdCounters,
  validateEarlyBirdClaim,
} from "./early-bird";
import { generateQrPayload, generateTicketUuid, getQrExpiryIso } from "./qr";
import type { DbState } from "./types";
import type { PromoCode } from "@/lib/store/types";

export function generateOrderId(sequence: number) {
  return formatOrderIdForCurrentEdition(sequence);
}

export { generateQrPayload } from "./qr";

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function validatePromoCode(promos: PromoCode[], code: string, subtotal: number) {
  const promo = promos.find((p) => p.code.toUpperCase() === code.trim().toUpperCase());
  if (!promo) return { valid: false as const, discount: 0, message: "Invalid promo code" };
  if (promo.status !== "active") return { valid: false as const, discount: 0, message: "This promo has expired" };
  if (promo.uses >= promo.maxUses) return { valid: false as const, discount: 0, message: "Promo code limit reached" };

  const discount =
    promo.type === "percent"
      ? Math.round(subtotal * (promo.value / 100))
      : Math.min(promo.value, subtotal);

  return { valid: true as const, discount, promo };
}

export interface CreateOrderInput {
  items: CartItem[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  promoCode?: string;
  status?: OrderRecord["status"];
  deviceFingerprint?: string;
  ip?: string;
}

export function createOrderFromCheckout(state: DbState, input: CreateOrderInput) {
  if (input.items.length === 0) {
    return { success: false as const, error: "Your cart is empty" };
  }

  syncEarlyBirdCounters(state);

  const earlyBirdItem = input.items.find((i) => i.ticketId === EARLY_BIRD_TICKET_ID);
  if (earlyBirdItem) {
    const validation = validateEarlyBirdClaim(state, {
      email: input.email,
      phone: input.phone,
      quantity: earlyBirdItem.quantity,
    });

    if (!validation.ok) {
      return {
        success: false as const,
        error: validation.error,
        status: validation.status,
      };
    }

    if (input.items.length > 1 || input.items.some((i) => i.ticketId !== EARLY_BIRD_TICKET_ID)) {
      return {
        success: false as const,
        error: "Free Early Bird tickets must be claimed separately.",
        status: 400,
      };
    }
  }

  const normalizedItems: CartItem[] = [];
  for (const item of input.items) {
    const tier = state.tickets.find((t) => t.id === item.ticketId);
    if (!tier) {
      return { success: false as const, error: `Unknown ticket type: ${item.ticketName}` };
    }

    if (tier.id === EARLY_BIRD_TICKET_ID) {
      const stats = getEarlyBirdStats(state);
      if (stats.exhausted || stats.remaining < item.quantity) {
        return {
          success: false as const,
          error: "Early Bird allocation exhausted.",
          status: 403,
        };
      }
    } else if (tier.remaining < item.quantity) {
      return { success: false as const, error: `Not enough ${item.ticketName} tickets available` };
    }

    normalizedItems.push({
      ticketId: item.ticketId,
      ticketName: tier.name,
      price: tier.price,
      quantity: item.quantity,
    });
  }

  const subtotal = cartSubtotal(normalizedItems);
  const promoResult = input.promoCode
    ? validatePromoCode(state.promos, input.promoCode, subtotal)
    : null;

  if (input.promoCode && promoResult && !promoResult.valid) {
    return { success: false as const, error: promoResult.message ?? "Invalid promo code" };
  }

  const discount = promoResult?.valid ? promoResult.discount : 0;

  const total = Math.max(0, subtotal + SERVICE_FEE - discount);
  const orderId = generateOrderId(state.nextOrderSequence);
  const customerName = `${input.firstName.trim()} ${input.lastName.trim()}`;
  const createdAt = new Date().toISOString();
  const orderStatus = total === 0 ? "completed" : (input.status ?? "completed");

  const order: OrderRecord = {
    id: orderId,
    customerName,
    customerEmail: input.email.trim().toLowerCase(),
    customerPhone: input.phone.trim(),
    event: corechella.title,
    items: normalizedItems,
    subtotal,
    fee: SERVICE_FEE,
    discount,
    promoCode: promoResult?.valid ? promoResult.promo?.code : undefined,
    total,
    status: orderStatus,
    paymentMethod: input.paymentMethod,
    createdAt,
  };

  const attendees: AttendeeRecord[] = [];

  if (orderStatus === "completed") {
    let ticketIndex = 0;

    normalizedItems.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        ticketIndex += 1;
        const attendeeId = buildAttendeeId(orderId, ticketIndex);
        const ticketUuid = generateTicketUuid();
        attendees.push({
          id: attendeeId,
          orderId,
          ticketIndex,
          ticketCode: formatTicketCode(orderId, ticketIndex),
          ticketUuid,
          name: customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          ticketType: item.ticketName,
          ticketTypeId: item.ticketId,
          amount: item.price,
          status: "not-checked-in",
          deviceFingerprint: input.deviceFingerprint?.trim() || undefined,
          qrCode: generateQrPayload(orderId, ticketIndex, ticketUuid),
          qrExpiresAt: getQrExpiryIso(),
          date: createdAt.slice(0, 10),
        });
      }
    });

    state.attendees.unshift(...attendees);
  }

  state.nextOrderSequence += 1;
  state.orders.unshift(order);

  if (orderStatus === "completed") {
    state.tickets = state.tickets.map((t) => {
      const bought = normalizedItems.find((c) => c.ticketId === t.id);
      if (!bought) return t;
      return {
        ...t,
        remaining: t.remaining - bought.quantity,
        sold: t.sold + bought.quantity,
      };
    });

    if (earlyBirdItem) {
      registerEarlyBirdClaim(state, {
        email: order.customerEmail,
        phone: order.customerPhone,
        deviceFingerprint: input.deviceFingerprint,
        orderId,
        quantity: earlyBirdItem.quantity,
      });
    } else {
      syncEarlyBirdCounters(state);
    }

    if (promoResult?.valid && promoResult.promo) {
      state.promos = state.promos.map((p) =>
        p.id === promoResult.promo!.id ? { ...p, uses: p.uses + 1 } : p
      );
    }
  }

  return { success: true as const, order, attendees };
}

/** Rebuild ticket rows for a paid order when attendee records were lost from storage. */
export function rebuildAttendeesForOrder(order: OrderRecord): AttendeeRecord[] {
  const attendees: AttendeeRecord[] = [];
  let ticketIndex = 0;
  const createdAt = order.createdAt;

  order.items.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      ticketIndex += 1;
      const attendeeId = buildAttendeeId(order.id, ticketIndex);
      const ticketUuid = generateTicketUuid();
      attendees.push({
        id: attendeeId,
        orderId: order.id,
        ticketIndex,
        ticketCode: formatTicketCode(order.id, ticketIndex),
        ticketUuid,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        ticketType: item.ticketName,
        ticketTypeId: item.ticketId,
        amount: item.price,
        status: "not-checked-in",
        qrCode: generateQrPayload(order.id, ticketIndex, ticketUuid),
        qrExpiresAt: getQrExpiryIso(),
        date: createdAt.slice(0, 10),
      });
    }
  });

  return attendees;
}

export function ensureOrderAttendees(state: DbState, order: OrderRecord): AttendeeRecord[] {
  const currentOrder = state.orders.find((o) => o.id === order.id) ?? order;
  const existing = state.attendees.filter((a) => a.orderId === currentOrder.id);
  if (existing.length > 0) return existing;

  if (currentOrder.status !== "completed") return [];

  const rebuilt = rebuildAttendeesForOrder(currentOrder);
  if (rebuilt.length > 0) {
    state.attendees.unshift(...rebuilt);
  }
  return rebuilt;
}

/** Remove a pending order when payment session creation fails (does not affect inventory). */
export function cancelPendingOrder(state: DbState, orderId: string) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return { success: false as const, error: "Order not found" };
  if (order.status !== "pending") {
    return { success: false as const, error: "Only pending orders can be cancelled" };
  }

  state.orders = state.orders.filter((o) => o.id !== orderId);
  return { success: true as const };
}

export function confirmOrderFromWebhook(state: DbState, orderId: string, amount?: number) {
  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return { success: false as const, error: "Order not found" };
  if (order.status === "completed") return { success: true as const, order, alreadyCompleted: true };

  if (amount != null && amount !== order.total) {
    const tolerance = 150;
    const feeAdjusted = amount - 50;
    if (
      Math.abs(amount - order.total) > tolerance &&
      Math.abs(feeAdjusted - order.total) > tolerance
    ) {
      return { success: false as const, error: "Payment amount mismatch" };
    }
  }

  order.status = "completed";

  state.tickets = state.tickets.map((t) => {
    const bought = order.items.find((c) => c.ticketId === t.id);
    if (!bought) return t;
    return {
      ...t,
      remaining: t.remaining - bought.quantity,
      sold: t.sold + bought.quantity,
    };
  });

  syncEarlyBirdCounters(state);

  if (order.promoCode) {
    const promo = state.promos.find((p) => p.code === order.promoCode);
    if (promo) {
      state.promos = state.promos.map((p) =>
        p.id === promo.id ? { ...p, uses: p.uses + 1 } : p
      );
    }
  }

  ensureOrderAttendees(state, order);

  return { success: true as const, order, alreadyCompleted: false };
}

export function orderTicketsUnlocked(order: Pick<OrderRecord, "status" | "total">) {
  return order.status === "completed" || order.total <= 0;
}

export function getCheckInsToday(state: DbState) {
  const today = new Date().toISOString().slice(0, 10);
  return (state.scanLogs ?? []).filter(
    (log) => log.result === "valid" && log.scannedAt.startsWith(today)
  ).length;
}
