import { NextResponse } from "next/server";
import { checkWavyGatewayHealth, isWavyConfigured } from "@/lib/server/wavy";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isWavyConfigured()) {
    return NextResponse.json(
      { ok: false, provider: "wavy", configured: false, message: "Payment gateway is not configured" },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }

  const health = await checkWavyGatewayHealth();

  return NextResponse.json(
    {
      ok: health.ok,
      provider: "wavy",
      configured: true,
      status: health.status,
      message: health.ok
        ? "Payment gateway is available"
        : "Payment gateway is temporarily unavailable. Card and bank payments may fail until service is restored.",
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
