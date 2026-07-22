import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { requirePermission } from "@/lib/server/permissions";
import { cartSubtotal, validatePromoCode } from "@/lib/server/orders";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body.code ?? "");
    const items = body.items ?? [];

    if (!code.trim()) {
      return NextResponse.json({ valid: false, message: "Enter a promo code" }, { status: 400 });
    }

    const db = await getDb();
    const subtotal = cartSubtotal(items);
    const result = validatePromoCode(db.promos, code, subtotal);

    if (!result.valid) {
      return NextResponse.json({ valid: false, message: result.message });
    }

    return NextResponse.json({
      valid: true,
      discount: result.discount,
      promo: {
        id: result.promo!.id,
        code: result.promo!.code,
        type: result.promo!.type,
        value: result.promo!.value,
        maxUses: result.promo!.maxUses,
        uses: result.promo!.uses,
        status: result.promo!.status,
      },
    });
  } catch {
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}

/** Admin: list all coupons for the promotions panel */
export async function GET() {
  const session = await getSessionFromCookies();
  const denied = await requirePermission(session, "manage_promos");
  if (denied) return denied;

  const db = await getDb();
  return NextResponse.json({ promos: db.promos });
}
