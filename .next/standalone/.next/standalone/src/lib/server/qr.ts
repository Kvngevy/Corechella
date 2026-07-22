import crypto from "crypto";
import type { AttendeeRecord } from "@/lib/store/types";
import {
  buildAttendeeId,
  formatTicketCode,
  getTicketIndexFromAttendee,
  parseOrderIdInput,
  parseTicketCode,
} from "@/lib/ticket-codes";
import type { DbState } from "./types";

const QR_PREFIX = "CC";
const QR_SECRET = process.env.QR_SECRET ?? "corechella-qr-secret";
const QR_TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export function generateTicketUuid() {
  return crypto.randomUUID();
}

export function signQrPayload(orderId: string, ticketIndex: number, ticketUuid: string) {
  return crypto
    .createHmac("sha256", QR_SECRET)
    .update(`${orderId}:${ticketIndex}:${ticketUuid}`)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
}

/** Cryptographically signed QR payload for gate scanning. */
export function generateQrPayload(orderId: string, ticketIndex: number, ticketUuid: string) {
  const code = formatTicketCode(orderId, ticketIndex);
  const signature = signQrPayload(orderId, ticketIndex, ticketUuid);
  return `${code}.${signature}`;
}

export function getQrExpiryIso() {
  return new Date(Date.now() + QR_TOKEN_TTL_MS).toISOString();
}

export function verifyQrSignature(
  orderId: string,
  ticketIndex: number,
  ticketUuid: string,
  signature: string
) {
  return signQrPayload(orderId, ticketIndex, ticketUuid) === signature.trim().toUpperCase();
}

export function buildAttendeeIdFromOrder(orderId: string, ticketIndex: number) {
  return buildAttendeeId(orderId, ticketIndex);
}

export { buildAttendeeId } from "@/lib/ticket-codes";

export function normalizeScanInput(raw: string) {
  let value = raw.trim();

  try {
    value = decodeURIComponent(value);
  } catch {
    /* keep original */
  }

  value = value.trim();

  if (value.includes("?") || value.startsWith("http")) {
    try {
      const url = new URL(value.startsWith("http") ? value : `https://${value.replace(/^\/+/, "")}`);
      const dataParam = url.searchParams.get("data");
      if (dataParam) {
        return normalizeScanInput(dataParam);
      }
      const orderParam = url.searchParams.get("order");
      if (orderParam) {
        return orderParam.trim();
      }
    } catch {
      /* not a URL */
    }
  }

  return value.replace(/^QR[:\s]*/i, "").trim();
}

function parseSignedTicketCode(input: string) {
  const match = input.trim().toUpperCase().replace(/\s/g, "").match(/^(.+)\.([A-F0-9]{8})$/);
  if (!match) return null;
  const ticketCode = parseTicketCode(match[1]);
  if (!ticketCode) return null;
  return { ...ticketCode, signature: match[2] };
}

export function parseQrScan(raw: string) {
  const trimmed = normalizeScanInput(raw);
  const compact = trimmed.toUpperCase().replace(/\s/g, "");

  const signed = parseSignedTicketCode(trimmed);
  if (signed) {
    return {
      raw: trimmed,
      orderId: signed.orderId,
      ticketIndex: signed.ticketIndex,
      signature: signed.signature,
      attendeeId: buildAttendeeId(signed.orderId, signed.ticketIndex),
    };
  }

  const ticketCode = parseTicketCode(trimmed);
  if (ticketCode) {
    return {
      raw: trimmed,
      orderId: ticketCode.orderId,
      ticketIndex: ticketCode.ticketIndex,
      attendeeId: buildAttendeeId(ticketCode.orderId, ticketCode.ticketIndex),
    };
  }

  const orderIdOnly = parseOrderIdInput(trimmed);
  if (orderIdOnly) {
    return { raw: trimmed, orderId: orderIdOnly };
  }

  if (trimmed.includes("|")) {
    const parts = trimmed.split("|").map((p) => p.trim());
    if (parts[0]?.toUpperCase() === QR_PREFIX && parts.length >= 4) {
      const orderId = parts[1];
      const ticketPart = parts[2]?.toUpperCase();
      const signature = parts[3];
      const ticketIndex =
        ticketPart?.startsWith("T") ? parseInt(ticketPart.slice(1), 10) : Number.NaN;

      return {
        raw: trimmed,
        orderId,
        ticketIndex: Number.isFinite(ticketIndex) ? ticketIndex : undefined,
        signature,
        attendeeId:
          orderId && Number.isFinite(ticketIndex)
            ? buildAttendeeId(orderId, ticketIndex)
            : undefined,
      };
    }
  }

  if (/^att-/i.test(compact)) {
    return { raw: trimmed, attendeeId: compact };
  }

  return { raw: trimmed };
}

export type CheckInResolveReason =
  | "not_found"
  | "invalid_signature"
  | "token_expired"
  | "order_missing"
  | "order_pending"
  | "ambiguous";

function findAttendeeByOrderAndIndex(
  state: DbState,
  orderId: string,
  ticketIndex: number
): AttendeeRecord | undefined {
  return state.attendees.find((attendee) => {
    if (attendee.orderId.toUpperCase() !== orderId.toUpperCase()) return false;
    if (attendee.ticketIndex === ticketIndex) return true;
    const index = getTicketIndexFromAttendee(attendee);
    return index === ticketIndex;
  });
}

function findAttendeeByNormalizedCode(state: DbState, normalized: string): AttendeeRecord | undefined {
  return state.attendees.find((attendee) => {
    const qr = attendee.qrCode.toUpperCase().replace(/\s/g, "");
    const index = getTicketIndexFromAttendee(attendee);
    const ticketCode = (
      attendee.ticketCode ??
      (index != null ? formatTicketCode(attendee.orderId, index) : "")
    )
      .toUpperCase()
      .replace(/\s/g, "");

    return (
      qr === normalized ||
      qr.startsWith(`${normalized}.`) ||
      (ticketCode.length > 0 && (ticketCode === normalized || normalized.startsWith(`${ticketCode}.`)))
    );
  });
}

function verifyAttendeeSignature(
  attendee: AttendeeRecord,
  signature?: string
): CheckInResolveReason | null {
  const index = getTicketIndexFromAttendee(attendee);
  if (index == null || !attendee.ticketUuid) return null;

  if (attendee.qrExpiresAt && new Date(attendee.qrExpiresAt).getTime() < Date.now()) {
    return "token_expired";
  }

  if (!signature) return null;

  const valid = verifyQrSignature(attendee.orderId, index, attendee.ticketUuid, signature);
  return valid ? null : "invalid_signature";
}

export function resolveAttendeeForCheckIn(state: DbState, scan: string): {
  attendee: AttendeeRecord | null;
  reason?: CheckInResolveReason;
} {
  const parsed = parseQrScan(scan);
  const normalized = parsed.raw.toUpperCase().replace(/\s/g, "");

  let attendee: AttendeeRecord | undefined =
    findAttendeeByNormalizedCode(state, normalized);

  if (!attendee && parsed.orderId && parsed.ticketIndex != null) {
    attendee = findAttendeeByOrderAndIndex(state, parsed.orderId, parsed.ticketIndex);
  }

  if (!attendee && parsed.attendeeId) {
    attendee = state.attendees.find(
      (a) => a.id.toUpperCase() === parsed.attendeeId!.toUpperCase()
    );
  }

  if (!attendee && parsed.orderId && !parsed.ticketIndex) {
    const orderAttendees = state.attendees.filter(
      (a) => a.orderId.toUpperCase() === parsed.orderId!.toUpperCase()
    );
    if (orderAttendees.length === 1) {
      attendee = orderAttendees[0];
    } else if (orderAttendees.length > 1) {
      return { attendee: null, reason: "ambiguous" };
    }
  }

  if (!attendee) {
    return { attendee: null, reason: "not_found" };
  }

  const signatureError = verifyAttendeeSignature(attendee, parsed.signature);
  if (signatureError) {
    return { attendee: null, reason: signatureError };
  }

  return validateAttendeeForCheckIn(state, attendee);
}

function validateAttendeeForCheckIn(state: DbState, attendee: AttendeeRecord): {
  attendee: AttendeeRecord | null;
  reason?: CheckInResolveReason;
} {
  const order = state.orders.find((o) => o.id === attendee.orderId);
  if (!order) {
    return { attendee: null, reason: "order_missing" };
  }
  if (order.status !== "completed") {
    return { attendee: null, reason: "order_pending" };
  }
  return { attendee };
}
