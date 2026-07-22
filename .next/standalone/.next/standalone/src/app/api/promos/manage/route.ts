import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/server/auth";
import { withDb } from "@/lib/server/db";
import { requirePermission } from "@/lib/server/permissions";
import type { PromoCode, PromoType } from "@/lib/store/types";

function validatePromoInput(type: PromoType, value: number, maxUses: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "Discount value must be greater than zero";
  }
  if (!Number.isInteger(maxUses) || maxUses <= 0) {
    return "Max uses must be a positive whole number";
  }
  if (type === "percent" && value > 100) {
    return "Percentage discount cannot exceed 100%";
  }
  return null;
}

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  const denied = await requirePermission(session, "manage_promos");
  if (denied) return denied;

  try {
    const body = await req.json();
    const code = String(body.code ?? "").trim().toUpperCase();
    const type = body.type as PromoType;
    const value = Number(body.value);
    const maxUses = Number(body.maxUses);

    if (!code || !["percent", "fixed"].includes(type)) {
      return NextResponse.json({ error: "Enter a valid coupon code and type" }, { status: 400 });
    }

    const validationError = validatePromoInput(type, value, maxUses);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const result = await withDb((state) => {
      const duplicate = state.promos.find((p) => p.code.toUpperCase() === code);
      if (duplicate) {
        return { error: "A coupon with this code already exists" as const };
      }

      const promo: PromoCode = {
        id: `p-${Date.now()}`,
        code,
        type,
        value,
        maxUses,
        uses: 0,
        status: "active",
      };

      state.promos.unshift(promo);
      return { promo };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, promo: result.promo });
  } catch {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSessionFromCookies();
  const denied = await requirePermission(session, "manage_promos");
  if (denied) return denied;

  try {
    const body = await req.json();
    const id = String(body.id ?? "");

    if (!id) {
      return NextResponse.json({ error: "Coupon id is required" }, { status: 400 });
    }

    const result = await withDb((state) => {
      const promo = state.promos.find((p) => p.id === id);
      if (!promo) {
        return { error: "Coupon not found" as const };
      }

      promo.status = promo.status === "active" ? "expired" : "active";
      return { promo: { ...promo } };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, promo: result.promo });
  } catch {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSessionFromCookies();
  const denied = await requirePermission(session, "manage_promos");
  if (denied) return denied;

  try {
    const id = new URL(req.url).searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "Coupon id is required" }, { status: 400 });
    }

    const result = await withDb((state) => {
      const index = state.promos.findIndex((p) => p.id === id);
      if (index === -1) {
        return { error: "Coupon not found" as const };
      }

      state.promos.splice(index, 1);
      return { success: true as const };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
