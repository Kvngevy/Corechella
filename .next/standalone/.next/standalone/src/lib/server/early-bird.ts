import {
  EARLY_BIRD_ALLOCATION,
  EARLY_BIRD_MAX_PER_EMAIL,
  EARLY_BIRD_MAX_PER_PHONE,
  EARLY_BIRD_MAX_QUANTITY_PER_ORDER,
  EARLY_BIRD_TICKET_ID,
} from "@/lib/data";
import type { DbState } from "./types";

export {
  EARLY_BIRD_MAX_PER_EMAIL,
  EARLY_BIRD_MAX_PER_PHONE,
  EARLY_BIRD_MAX_QUANTITY_PER_ORDER,
} from "@/lib/data";

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length >= 13) return digits.slice(-10);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getEarlyBirdStats(state: DbState) {
  const tier = state.tickets.find((t) => t.id === EARLY_BIRD_TICKET_ID);
  const issued = state.earlyBirdIssued ?? tier?.sold ?? 0;
  const remaining = Math.max(0, EARLY_BIRD_ALLOCATION - issued);
  return {
    issued,
    remaining,
    allocation: EARLY_BIRD_ALLOCATION,
    exhausted: remaining <= 0,
  };
}

export function syncEarlyBirdCounters(state: DbState) {
  const stats = getEarlyBirdStats(state);
  state.earlyBirdIssued = stats.issued;
  state.earlyBirdRemaining = stats.remaining;

  state.tickets = state.tickets.map((t) => {
    if (t.id !== EARLY_BIRD_TICKET_ID) return t;
    return {
      ...t,
      total: EARLY_BIRD_ALLOCATION,
      sold: stats.issued,
      remaining: stats.remaining,
      price: 0,
    };
  });
}

function isEarlyBirdAttendee(attendee: { ticketTypeId?: string; ticketType: string }) {
  return attendee.ticketTypeId === EARLY_BIRD_TICKET_ID || attendee.ticketType === "Early Bird";
}

export function countEarlyBirdClaims(
  state: DbState,
  field: "email" | "phone",
  value: string
) {
  const normalized =
    field === "email" ? normalizeEmail(value) : normalizePhone(value);

  if (!normalized) return 0;

  let count = 0;

  for (const attendee of state.attendees) {
    if (!isEarlyBirdAttendee(attendee)) continue;
    if (field === "email" && normalizeEmail(attendee.email) === normalized) count += 1;
    if (field === "phone" && normalizePhone(attendee.phone) === normalized) count += 1;
  }

  return count;
}

function orderHasEarlyBird(state: DbState, orderId: string) {
  const order = state.orders.find((o) => o.id === orderId);
  return order?.items.some((i) => i.ticketId === EARLY_BIRD_TICKET_ID) ?? false;
}

export interface EarlyBirdValidationInput {
  email: string;
  phone: string;
  quantity: number;
}

export function validateEarlyBirdClaim(state: DbState, input: EarlyBirdValidationInput) {
  const stats = getEarlyBirdStats(state);

  if (stats.exhausted || stats.remaining < input.quantity) {
    return {
      ok: false as const,
      status: 403,
      error: "Early Bird allocation exhausted.",
    };
  }

  if (input.quantity < 1 || input.quantity > EARLY_BIRD_MAX_QUANTITY_PER_ORDER) {
    return {
      ok: false as const,
      status: 400,
      error: `You can claim up to ${EARLY_BIRD_MAX_QUANTITY_PER_ORDER} free Early Bird tickets per order.`,
    };
  }

  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);

  const emailClaims = countEarlyBirdClaims(state, "email", email);
  if (emailClaims + input.quantity > EARLY_BIRD_MAX_PER_EMAIL) {
    const remaining = Math.max(0, EARLY_BIRD_MAX_PER_EMAIL - emailClaims);
    return {
      ok: false as const,
      status: 400,
      error:
        remaining === 0
          ? "This email has already claimed the maximum free Early Bird tickets."
          : `This email can only claim ${remaining} more free Early Bird ticket${remaining === 1 ? "" : "s"}.`,
    };
  }

  if (phone.length < 10) {
    return {
      ok: false as const,
      status: 400,
      error: "A valid phone number is required.",
    };
  }

  const phoneClaims = countEarlyBirdClaims(state, "phone", phone);
  if (phoneClaims + input.quantity > EARLY_BIRD_MAX_PER_PHONE) {
    const remaining = Math.max(0, EARLY_BIRD_MAX_PER_PHONE - phoneClaims);
    return {
      ok: false as const,
      status: 400,
      error:
        remaining === 0
          ? "This phone number has already claimed the maximum free Early Bird tickets."
          : `This phone number can only claim ${remaining} more free Early Bird ticket${remaining === 1 ? "" : "s"}.`,
    };
  }

  return { ok: true as const };
}

export function registerEarlyBirdClaim(
  state: DbState,
  input: { email: string; phone: string; deviceFingerprint?: string; orderId: string; quantity?: number }
) {
  const quantity = Math.max(1, input.quantity ?? 1);
  const claimBase = {
    email: normalizeEmail(input.email),
    phone: normalizePhone(input.phone),
    deviceFingerprint: input.deviceFingerprint?.trim() || undefined,
    orderId: input.orderId,
  };

  const newClaims = Array.from({ length: quantity }, () => ({
    ...claimBase,
    at: new Date().toISOString(),
  }));

  state.earlyBirdClaims = [...(state.earlyBirdClaims ?? []), ...newClaims].slice(
    -EARLY_BIRD_ALLOCATION * 2
  );

  state.earlyBirdIssued = (state.earlyBirdIssued ?? 0) + quantity;
  syncEarlyBirdCounters(state);
}

export { orderHasEarlyBird };
