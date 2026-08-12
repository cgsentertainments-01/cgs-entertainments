import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();

  try {
    const body = await request.json();
    const {
      registrationId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const orderId = razorpayOrderId || razorpay_order_id;
    const paymentId = razorpayPaymentId || razorpay_payment_id;
    const signature = razorpaySignature || razorpay_signature;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required for payment verification." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    // -------------------------------------------------------------------------
    // 1. STRICT SERVER-SIDE SIGNATURE VERIFICATION
    // -------------------------------------------------------------------------
    if (secret) {
      if (!orderId || !paymentId || !signature) {
        return NextResponse.json(
          { error: "Missing Razorpay payment parameters (order_id, payment_id, or signature)." },
          { status: 400 }
        );
      }

      const isValid = verifyRazorpaySignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      });

      if (!isValid) {
        // Mark payment record as failed in database if available
        if (supabase && registrationId) {
          try {
            await supabase
              .from("registrations")
              .update({ payment_status: "failed", updated_at: new Date().toISOString() })
              .eq("id", registrationId);

            if (orderId) {
              await supabase
                .from("registration_payments")
                .update({
                  status: "failed",
                  failure_reason: "Invalid HMAC SHA256 Signature",
                  updated_at: new Date().toISOString(),
                })
                .eq("razorpay_order_id", orderId);
            }
          } catch (dbErr) {
            console.error("Error updating failed payment status in DB:", dbErr);
          }
        }

        return NextResponse.json(
          { error: "Invalid Razorpay payment signature. Payment verification failed." },
          { status: 400 }
        );
      }
    } else {
      console.warn("Notice: RAZORPAY_KEY_SECRET is not configured in env. Skipping strict signature check in development.");
    }

    // -------------------------------------------------------------------------
    // 2. FETCH REGISTRATION RECORD FROM SUPABASE DATABASE
    // -------------------------------------------------------------------------
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection unavailable for verification." },
        { status: 500 }
      );
    }

    const { data: reg, error: fetchErr } = await supabase
      .from("registrations")
      .select("*, participants(*), events(*)")
      .eq("id", registrationId)
      .maybeSingle();

    if (fetchErr || !reg) {
      return NextResponse.json(
        { error: fetchErr?.message || "Registration record not found." },
        { status: 404 }
      );
    }

    const nowIso = new Date().toISOString();

    // -------------------------------------------------------------------------
    // 3. UPDATE REGISTRATION STATUS IN SUPABASE DATABASE
    // -------------------------------------------------------------------------
    const { data: updatedReg, error: regUpdateErr } = await supabase
      .from("registrations")
      .update({
        registration_status: "confirmed",
        payment_status: "paid",
        updated_at: nowIso,
      })
      .eq("id", registrationId)
      .select("*")
      .single();

    if (regUpdateErr) {
      console.error("Error updating registration status:", regUpdateErr.message);
      return NextResponse.json(
        { error: `Failed to update registration status: ${regUpdateErr.message}` },
        { status: 500 }
      );
    }

    // -------------------------------------------------------------------------
    // 4. UPDATE REGISTRATION PAYMENTS & AUDIT TRANSACTIONS
    // -------------------------------------------------------------------------
    let paymentRecordId: string | null = null;

    if (orderId) {
      const { data: payRec } = await supabase
        .from("registration_payments")
        .select("id")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();

      if (payRec) {
        paymentRecordId = payRec.id;
        await supabase
          .from("registration_payments")
          .update({
            razorpay_payment_id: paymentId || `pay_${Date.now()}`,
            razorpay_signature: signature || null,
            status: "paid",
            paid_at: nowIso,
            updated_at: nowIso,
          })
          .eq("id", payRec.id);
      } else {
        const { data: newPayRec } = await supabase
          .from("registration_payments")
          .insert({
            registration_id: registrationId,
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId || `pay_${Date.now()}`,
            razorpay_signature: signature || null,
            amount: reg.amount || 0,
            currency: "INR",
            status: "paid",
            paid_at: nowIso,
          })
          .select("id")
          .single();

        if (newPayRec) paymentRecordId = newPayRec.id;
      }
    }

    // Financial Audit Transaction entry
    await supabase.from("payment_transactions").insert({
      registration_id: registrationId,
      payment_id: paymentRecordId,
      transaction_type: "payment",
      amount: reg.amount || 0,
      currency: "INR",
      gateway: "Razorpay",
      gateway_transaction_id: paymentId || orderId || `tx_${Date.now()}`,
      status: "success",
      gateway_response: { orderId, paymentId, verified_at: nowIso },
      processed_at: nowIso,
    });

    // Synchronize event participant count
    if (reg.event_id) {
      try {
        const { count } = await supabase
          .from("registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", reg.event_id)
          .eq("registration_status", "confirmed");

        if (count !== null) {
          await supabase
            .from("events")
            .update({ current_participants: count })
            .eq("id", reg.event_id);
        }
      } catch (countErr) {
        console.warn("Notice syncing event participant count:", countErr);
      }
    }

    // -------------------------------------------------------------------------
    // 5. EMAIL & WHATSAPP LOGS
    // -------------------------------------------------------------------------
    const participantEmail = reg.participants?.email;
    const participantPhone = reg.participants?.phone;
    const participantName = reg.participants?.full_name || "Participant";
    const eventTitle = reg.events?.title || "CGS Talent Event";

    if (participantEmail) {
      await supabase.from("email_logs").insert({
        recipient_email: participantEmail,
        recipient_name: participantName,
        email_type: "registration_confirmation",
        subject: `Payment Confirmed - ${eventTitle}`,
        status: "sent",
        sent_at: nowIso,
      });
    }

    if (participantPhone) {
      await supabase.from("whatsapp_logs").insert({
        phone: participantPhone,
        message_type: "registration_confirmation",
        message: `Your payment for registration #${updatedReg.registration_number} (${eventTitle}) has been verified and confirmed!`,
        status: "sent",
        sent_at: nowIso,
      });
    }

    return NextResponse.json({
      success: true,
      registrationId,
      registrationNumber: updatedReg.registration_number,
      status: "confirmed",
      paymentStatus: "paid",
    });
  } catch (err: any) {
    console.error("POST /api/payments/verify error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify registration payment." },
      { status: 500 }
    );
  }
}
