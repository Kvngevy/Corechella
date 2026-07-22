import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/server/auth";
import { withDb } from "@/lib/server/db";
import { requirePermission } from "@/lib/server/permissions";
import { checkRateLimit, getClientIp } from "@/lib/server/rate-limit";
import { getAttendeeTicketCode } from "@/lib/ticket-codes";
import { normalizeScanInput, resolveAttendeeForCheckIn } from "@/lib/server/qr";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  const denied = await requirePermission(session, "check_in");
  if (denied) return denied;

  const ip = getClientIp(req);
  const rate = checkRateLimit(`checkin:${ip}`, 120, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many scan attempts." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const qrCode = normalizeScanInput(String(body.qrCode ?? ""));

    if (!qrCode) {
      return NextResponse.json({ error: "QR code is required" }, { status: 400 });
    }

    const result = await withDb((state) => {
      const resolved = resolveAttendeeForCheckIn(state, qrCode);

      const logScan = (
        attendee: typeof resolved.attendee,
        scanResult: "valid" | "used" | "invalid" | "pending_payment",
        previousCheckInTime?: string
      ) => {
        if (!attendee) return;
        state.scanLogs = [
          {
            id: crypto.randomUUID(),
            ticketId: attendee.id,
            ticketCode: getAttendeeTicketCode(attendee),
            ticketType: attendee.ticketType,
            attendeeName: attendee.name,
            scannerId: session!.userId,
            scannerEmail: session!.email,
            result: scanResult,
            scannedAt: new Date().toISOString(),
            previousCheckInTime,
          },
          ...(state.scanLogs ?? []),
        ].slice(0, 2000);
      };

      if (!resolved.attendee) {
        if (resolved.reason === "order_pending") {
          return { status: "pending_payment" as const };
        }
        if (resolved.reason === "ambiguous") {
          return {
            status: "invalid" as const,
            message: "Multiple tickets on this order — enter the ticket number (e.g. CC4-000001-01)",
          };
        }
        if (resolved.reason === "invalid_signature") {
          return { status: "invalid" as const, message: "Invalid ticket signature" };
        }
        if (resolved.reason === "token_expired") {
          return { status: "invalid" as const, message: "Ticket validation token expired" };
        }
        return { status: "invalid" as const, message: "Ticket not recognized" };
      }

      const attendee = resolved.attendee;
      const order = state.orders.find((o) => o.id === attendee.orderId);
      const ticketCode = getAttendeeTicketCode(attendee);

      if (attendee.status === "checked-in") {
        logScan(attendee, "used", attendee.checkInTime);
        return {
          status: "used" as const,
          attendee,
          ticketCode,
          checkInTime: attendee.checkInTime,
          order: order
            ? { id: order.id, status: order.status, customerName: order.customerName }
            : undefined,
        };
      }

      const checkInTime = new Date().toISOString();
      attendee.status = "checked-in";
      attendee.checkInTime = checkInTime;
      const checkedInAttendee = { ...attendee, status: "checked-in" as const, checkInTime };

      logScan(checkedInAttendee, "valid");

      return {
        status: "valid" as const,
        attendee: checkedInAttendee,
        ticketCode,
        checkInTime,
        order: order
          ? { id: order.id, status: order.status, customerName: order.customerName }
          : undefined,
      };
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}
