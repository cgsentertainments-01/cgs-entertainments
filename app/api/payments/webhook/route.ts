import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();

  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // Verify webhook signature if webhook secret or key secret is set
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (secret && signature) {
      const isValid = verifyWebhookSignature({
        body: rawBody,
        signature,
        secret,
      });

      if (!isValid) {
        console.warn("Invalid Razorpay Webhook signature");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    console.log(`Received Razorpay Webhook: ${eventType} (Order: ${orderId}, Payment: ${paymentId})`);

    if (!supabase || !orderId) {
      return NextResponse.json({ status: "ok", message: "Webhook acknowledged" });
    }

    const nowIso = new Date().toISOString();

    // 1. Fetch linked registration payment record
    const { data: payRec } = await supabase
      .from("registration_payments")
      .select("id, registration_id, amount")
      .eq("razorpay_order_id", orderId)
      .maybeSingle();

    if (eventType === "payment.captured") {
      if (payRec) {
        // Update registration payment
        await supabase
          .from("registration_payments")
          .update({
            razorpay_payment_id: paymentId,
            status: "paid",
            paid_at: nowIso,
            updated_at: nowIso,
          })
          .eq("id", payRec.id);

        // Update registration
        await supabase
          .from("registrations")
          .update({
            payment_status: "paid",
            registration_status: "confirmed",
            updated_at: nowIso,
          })
          .eq("id", payRec.registration_id);

        // Record financial audit transaction
        await supabase.from("payment_transactions").insert({
          registration_id: payRec.registration_id,
          payment_id: payRec.id,
          transaction_type: "payment",
          amount: payRec.amount || 0,
          currency: "INR",
          gateway: "Razorpay",
          gateway_transaction_id: paymentId,
          status: "success",
          gateway_response: payload,
          processed_at: nowIso,
        });
      }
    } else if (eventType === "payment.failed") {
      if (payRec) {
        await supabase
          .from("registration_payments")
          .update({
            status: "failed",
            failure_reason: paymentEntity?.error_description || "Payment failed at gateway",
            updated_at: nowIso,
          })
          .eq("id", payRec.id);

        await supabase
          .from("registrations")
          .update({
            payment_status: "failed",
            updated_at: nowIso,
          })
          .eq("id", payRec.registration_id);
      }
    } else if (eventType === "refund.created" || eventType === "refund.processed") {
      if (payRec) {
        await supabase
          .from("registration_payments")
          .update({
            status: "refunded",
            updated_at: nowIso,
          })
          .eq("id", payRec.id);

        await supabase
          .from("registrations")
          .update({
            payment_status: "refunded",
            updated_at: nowIso,
          })
          .eq("id", payRec.registration_id);
      }
    }

    return NextResponse.json({ status: "ok", event: eventType });
  } catch (err: any) {
    console.error("Razorpay Webhook handler error:", err);
    return NextResponse.json({ error: err.message || "Webhook processing failed" }, { status: 500 });
  }
}
