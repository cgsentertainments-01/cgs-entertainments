import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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
    } = body;

    if (!registrationId) {
      return NextResponse.json({ error: "Registration ID is required for verification." }, { status: 400 });
    }

    // -------------------------------------------------------------------------
    // 1. SIGNATURE VERIFICATION (IF KEY SECRET IS SET)
    // -------------------------------------------------------------------------
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (secret && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json(
          { error: "Invalid Razorpay payment signature. Payment verification failed." },
          { status: 400 }
        );
      }
    }

    // -------------------------------------------------------------------------
    // 2. FETCH REGISTRATION RECORD FROM DATABASE
    // -------------------------------------------------------------------------
    if (!supabase) {
      return NextResponse.json({ error: "Database connection unavailable." }, { status: 500 });
    }

    const { data: reg, error: fetchErr } = await supabase
      .from("registrations")
      .select("*, participants(*), events(*)")
      .eq("id", registrationId)
      .maybeSingle();

    if (fetchErr || !reg) {
      return NextResponse.json(
        { error: fetchErr?.message || "Registration record not found for payment update." },
        { status: 404 }
      );
    }

    const nowIso = new Date().toISOString();

    // -------------------------------------------------------------------------
    // 3. UPDATE REGISTRATION STATUS IN DATABASE
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
        { error: `Failed to update registration: ${regUpdateErr.message}` },
        { status: 500 }
      );
    }

    // -------------------------------------------------------------------------
    // 4. UPDATE REGISTRATION PAYMENTS & AUDIT TRANSACTIONS
    // -------------------------------------------------------------------------
    let paymentRecordId: string | null = null;

    if (razorpayOrderId) {
      const { data: payRec } = await supabase
        .from("registration_payments")
        .select("id")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (payRec) {
        paymentRecordId = payRec.id;
        await supabase
          .from("registration_payments")
          .update({
            razorpay_payment_id: razorpayPaymentId || `pay_${Date.now()}`,
            razorpay_signature: razorpaySignature || null,
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
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId || `pay_${Date.now()}`,
            razorpay_signature: razorpaySignature || null,
            amount: reg.amount,
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
      amount: reg.amount,
      currency: "INR",
      gateway: "Razorpay",
      gateway_transaction_id: razorpayPaymentId || razorpayOrderId || `tx_${Date.now()}`,
      status: "success",
      gateway_response: { razorpayOrderId, razorpayPaymentId, verified_at: nowIso },
      processed_at: nowIso,
    });

    // -------------------------------------------------------------------------
    // 5. LOG EMAIL & WHATSAPP CONFIRMATION ATTEMPTS
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
        message: `Your payment for registration #${reg.registration_number} (${eventTitle}) has been verified and confirmed!`,
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
