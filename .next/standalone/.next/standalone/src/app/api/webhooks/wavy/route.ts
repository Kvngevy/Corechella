import { handleWavyWebhookRequest } from "@/lib/server/wavy-webhook-handler";
import { logger } from "@/lib/server/logger";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    return await handleWavyWebhookRequest(req);
  } catch (err) {
    logger.error("Wavy webhook legacy failed", { error: String(err) });
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
