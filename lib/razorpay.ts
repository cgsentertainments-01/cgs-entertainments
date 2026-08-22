import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Returns an instance of Razorpay SDK initialized with server environment variables.
 * Returns null if credentials are not configured.
 */
export function getRazorpayInstance(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Safely logs Razorpay configuration status without exposing secrets.
 */
export function logRazorpayConfig(): void {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

  const isConfigured = Boolean(key_id && key_secret);
  const keyType = key_id.startsWith("rzp_live_")
    ? "live"
    : key_id.startsWith("rzp_test_")
      ? "test"
      : key_id
        ? "unknown"
        : "missing";

  console.log(`Razorpay key configured: ${Boolean(key_id)}`);
  console.log(`Razorpay key type: ${keyType}`);
  console.log(`Razorpay secret configured: ${Boolean(key_secret)}`);
}

/**
 * Verifies the Razorpay payment signature received from client callback server-side using HMAC-SHA256.
 */
export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  const genBuf = Buffer.from(generatedSignature);
  const sigBuf = Buffer.from(razorpaySignature);

  if (genBuf.length !== sigBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(genBuf, sigBuf);
}

/**
 * Verifies Razorpay Webhook signature using HMAC-SHA256.
 */
export function verifyWebhookSignature({
  body,
  signature,
  secret,
}: {
  body: string;
  signature: string;
  secret?: string;
}): boolean {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!webhookSecret || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}
