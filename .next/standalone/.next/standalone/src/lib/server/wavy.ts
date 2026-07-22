import crypto from "crypto";

export const WAVY_API_BASE = process.env.WAVY_API_BASE ?? "https://api.wavy.ng";
export const WAVY_CHECKOUT_PATH = "/api/gateway/v1/checkout";
export const WAVY_WEBHOOK_PATH = "/WEBHOOKS/WAVY";
export const WAVY_MIN_AMOUNT_NGN = 100;

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://corechella.com").replace(/\/$/, "");
}

/** Prefer the live request host so Wavy returns users to corechella.com, not Vercel. */
export function getAppUrlFromRequest(req: Request) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost?.split(",")[0]?.trim() || req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (host?.includes("localhost") ? "http" : "https");

  if (host && !host.includes("127.0.0.1")) {
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  return getAppUrl();
}

export function getWavyPublishableKey() {
  return process.env.NEXT_PUBLIC_WAVY_PUBLISHABLE_KEY ?? "";
}

export function getWavySecretKey() {
  return process.env.WAVY_SECRET_KEY ?? "";
}

export function getWavyWebhookSecret() {
  return process.env.WAVY_WEBHOOK_SECRET ?? "";
}

export function isWavyConfigured() {
  return Boolean(getWavySecretKey());
}

export interface WavyCheckoutRequest {
  amount: number;
  description: string;
  email: string;
  merchant_reference: string;
  success_url: string;
  cancel_url: string;
}

export interface WavyCheckoutResult {
  authorization_url: string;
  tx_ref: string;
}

export interface WavyTransaction {
  tx_ref: string;
  status: string;
  amount?: number;
  gross_amount?: number;
  vendor_net?: number;
  currency?: string;
  merchant_reference?: string;
  customer_email?: string;
  paid_at?: string;
}

export interface WavyWebhookPayload {
  event?: string;
  tx_ref?: string;
  status?: string;
  amount?: number;
  gross_amount?: number;
  vendor_net?: number;
  currency?: string;
  merchant_reference?: string;
  customer_email?: string;
  paid_at?: string;
}

const WAVY_RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function gatewayUnavailableMessage(status?: number) {
  if (status === 502 || status === 503 || status === 504) {
    return "Payment gateway is temporarily unavailable. Please try again in a few minutes.";
  }
  return "Could not reach Wavy payment gateway. Please try again in a moment.";
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 20000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Payment gateway timed out — please try again");
    }
    const msg = err instanceof Error ? err.message : "Network error";
    if (msg === "fetch failed") {
      throw new Error(gatewayUnavailableMessage());
    }
    throw err instanceof Error ? err : new Error(msg);
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  timeoutMs = 20000,
  maxAttempts = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const res = await fetchWithTimeout(url, options, timeoutMs);
      if (res.ok || !WAVY_RETRYABLE_STATUSES.has(res.status) || attempt === maxAttempts - 1) {
        return res;
      }
      lastError = new Error(gatewayUnavailableMessage(res.status));
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Network error");
      if (attempt === maxAttempts - 1) throw lastError;
    }

    await sleep(400 * 2 ** attempt);
  }

  throw lastError ?? new Error(gatewayUnavailableMessage());
}

export async function checkWavyGatewayHealth(): Promise<{ ok: boolean; status?: number }> {
  if (!isWavyConfigured()) return { ok: false };

  try {
    const res = await fetchWithTimeout(
      `${WAVY_API_BASE}${WAVY_CHECKOUT_PATH}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getWavySecretKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: WAVY_MIN_AMOUNT_NGN,
          currency: "NGN",
          description: "Corechella health check",
          email: "healthcheck@corechella.com",
          merchant_reference: "HEALTHCHECK",
          success_url: `${getAppUrl()}/tickets`,
          cancel_url: `${getAppUrl()}/tickets`,
        }),
      },
      8000
    );

    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false };
  }
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function unwrapPayload<T extends Record<string, unknown>>(payload: T) {
  const nested = payload.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return { ...(payload as Record<string, unknown>), ...(nested as Record<string, unknown>) };
  }
  return payload as Record<string, unknown>;
}

export function verifyWavyWebhookSignature(rawBody: string, signatureHeader: string | null) {
  const secret = getWavyWebhookSecret();
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signatureHeader) return false;

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signatureHeader.replace(/^sha256=/, "").trim();

  try {
    return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  } catch {
    return received === expected;
  }
}

function isSuccessfulTransactionStatus(status?: string) {
  const normalized = (status ?? "").toUpperCase();
  return ["SUCCESS", "SUCCESSFUL", "COMPLETED", "PAID"].includes(normalized);
}

export function isWavyPaymentSuccess(event?: string, status?: string) {
  const normalizedEvent = (event ?? "").toLowerCase();
  if (normalizedEvent === "payment.success" || normalizedEvent === "charge.completed") {
    return isSuccessfulTransactionStatus(status ?? "SUCCESS");
  }
  return isSuccessfulTransactionStatus(status);
}

export function parseWavyWebhookPayload(payload: WavyWebhookPayload) {
  const flat = unwrapPayload(payload as Record<string, unknown>);
  return {
    event: pickString(flat.event, payload.event),
    tx_ref: pickString(flat.tx_ref, payload.tx_ref),
    status: pickString(flat.status, payload.status),
    merchant_reference: pickString(flat.merchant_reference, payload.merchant_reference),
    gross_amount: pickNumber(flat.gross_amount, payload.gross_amount, flat.amount, payload.amount),
    vendor_net: pickNumber(flat.vendor_net, payload.vendor_net),
    customer_email: pickString(flat.customer_email, payload.customer_email),
    paid_at: pickString(flat.paid_at, payload.paid_at),
  };
}

export async function createWavyCheckout(input: WavyCheckoutRequest): Promise<WavyCheckoutResult> {
  const secret = getWavySecretKey();
  if (!secret) {
    throw new Error("Wavy payment gateway is not configured");
  }
  if (input.amount < WAVY_MIN_AMOUNT_NGN) {
    throw new Error(`Minimum Wavy payment amount is ₦${WAVY_MIN_AMOUNT_NGN}`);
  }

  const res = await fetchWithRetry(`${WAVY_API_BASE}${WAVY_CHECKOUT_PATH}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: "NGN",
      description: input.description,
      email: input.email,
      merchant_reference: input.merchant_reference,
      success_url: input.success_url,
      cancel_url: input.cancel_url,
    }),
  });

  const payload = unwrapPayload((await res.json().catch(() => ({}))) as Record<string, unknown>);
  if (!res.ok) {
    if (WAVY_RETRYABLE_STATUSES.has(res.status)) {
      throw new Error(gatewayUnavailableMessage(res.status));
    }
    const message =
      pickString(payload.message, payload.error) ?? "Failed to create Wavy checkout session";
    throw new Error(message);
  }

  const authorization_url = pickString(
    payload.authorization_url,
    payload.authorizationUrl,
    payload.checkout_url,
    payload.checkoutUrl
  );
  const tx_ref = pickString(payload.tx_ref, payload.txRef, payload.reference);

  if (!authorization_url || !tx_ref) {
    throw new Error("Wavy did not return authorization_url and tx_ref");
  }

  return { authorization_url, tx_ref };
}

export async function getWavyTransaction(txRef: string): Promise<WavyTransaction | null> {
  const secret = getWavySecretKey();
  if (!secret || !txRef.trim()) return null;

  const res = await fetchWithTimeout(
    `${WAVY_API_BASE}/api/gateway/v1/transactions/${encodeURIComponent(txRef.trim())}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    }
  );

  if (!res.ok) return null;

  const payload = unwrapPayload((await res.json().catch(() => ({}))) as Record<string, unknown>);
  const nested =
    payload.transaction && typeof payload.transaction === "object" && !Array.isArray(payload.transaction)
      ? { ...payload, ...(payload.transaction as Record<string, unknown>) }
      : payload;

  const tx_ref = pickString(nested.tx_ref, nested.txRef, payload.tx_ref, txRef) ?? txRef;
  const status = pickString(nested.status, nested.payment_status, payload.status) ?? "";

  return {
    tx_ref,
    status,
    amount: pickNumber(nested.amount, payload.amount),
    gross_amount: pickNumber(nested.gross_amount, nested.grossAmount, payload.gross_amount, nested.amount),
    vendor_net: pickNumber(nested.vendor_net, nested.vendorNet, payload.vendor_net),
    currency: pickString(nested.currency, payload.currency),
    merchant_reference: pickString(
      nested.merchant_reference,
      nested.merchantReference,
      payload.merchant_reference,
      nested.reference
    ),
    customer_email: pickString(nested.customer_email, nested.customerEmail, payload.customer_email),
    paid_at: pickString(nested.paid_at, nested.paidAt, payload.paid_at),
  };
}

export async function verifyWavyPayment(txRef: string) {
  const transaction = await getWavyTransaction(txRef);
  if (!transaction || !isSuccessfulTransactionStatus(transaction.status)) {
    return null;
  }

  return {
    success: true as const,
    tx_ref: transaction.tx_ref,
    merchant_reference: transaction.merchant_reference,
    amount: transaction.gross_amount ?? transaction.vendor_net ?? transaction.amount,
    transaction,
  };
}

export async function confirmOrderWithWavyTxRef(orderId: string, txRef?: string) {
  if (!txRef?.trim()) return null;

  const verified = await verifyWavyPayment(txRef.trim());
  if (!verified?.success) return null;

  const resolvedOrderId = verified.merchant_reference ?? orderId;
  return { ...verified, orderId: resolvedOrderId };
}

/** @deprecated Use createWavyCheckout */
export async function createWavyPayment(input: {
  amount: number;
  title: string;
  description: string;
  email: string;
  callbackUrl: string;
  metadata: Record<string, string>;
}) {
  const orderId = input.metadata.order_id ?? input.metadata.orderId ?? "";
  const result = await createWavyCheckout({
    amount: input.amount,
    description: input.description || input.title,
    email: input.email,
    merchant_reference: orderId,
    success_url: `${getAppUrl()}/checkout?order=${encodeURIComponent(orderId)}`,
    cancel_url: `${getAppUrl()}/payment/cancelled?reference=${encodeURIComponent(orderId)}`,
  });

  return {
    checkoutUrl: result.authorization_url,
    reference: result.tx_ref,
  };
}

/** @deprecated Use verifyWavyWebhookSignature */
export function verifyWavyWebhook(rawBody: string, headers: Headers) {
  const signature =
    headers.get("x-wavy-signature") ??
    headers.get("x-wavy-signature-256") ??
    headers.get("wavy-signature");
  return verifyWavyWebhookSignature(rawBody, signature);
}

/** @deprecated Use parseWavyWebhookPayload */
export function parseWavyEvent(payload: WavyWebhookPayload) {
  const parsed = parseWavyWebhookPayload(payload);
  return {
    eventType: parsed.event ?? "",
    orderId: parsed.merchant_reference,
    reference: parsed.tx_ref,
    amount: parsed.gross_amount ?? parsed.vendor_net,
    status: parsed.status,
  };
}

export type WavyWebhookEvent = WavyWebhookPayload;
