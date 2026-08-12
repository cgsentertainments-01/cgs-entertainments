import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStoreEvents } from "@/lib/events-store";
import { transformDbEvent } from "@/services/event.service";
import { getRazorpayInstance } from "@/lib/razorpay";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();

  try {
    const body = await request.json();
    const { registrationId, eventId, numParticipants = 1 } = body;

    if (!eventId && !registrationId) {
      return NextResponse.json(
        { error: "Event ID or Registration ID is required." },
        { status: 400 }
      );
    }

    let targetEventId = eventId;
    let registrationRecord: any = null;

    // 1. If registrationId is provided, fetch authoritative registration & event from Supabase
    if (supabase && registrationId) {
      const { data: regData } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .eq("id", registrationId)
        .maybeSingle();

      if (regData) {
        registrationRecord = regData;
        targetEventId = regData.event_id || regData.events?.id || targetEventId;
        
        // Prevent duplicate payment if already paid
        if (regData.payment_status === "paid" || regData.registration_status === "confirmed") {
          return NextResponse.json(
            { error: "This registration is already paid and confirmed." },
            { status: 400 }
          );
        }
      }
    }

    // 2. Fetch authoritative Event record from Supabase or fallback store
    let eventRecord: any = null;

    if (supabase && targetEventId) {
      const { data } = await supabase
        .from("events")
        .select("*")
        .or(`id.eq.${targetEventId},slug.eq.${targetEventId}`)
        .maybeSingle();

      if (data) {
        eventRecord = data;
      }
    }

    if (!eventRecord && targetEventId) {
      const storeEvents = getStoreEvents();
      eventRecord = storeEvents.find(
        (e) => String(e.id) === String(targetEventId) || e.slug === targetEventId
      );
    }

    if (!eventRecord) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const event = transformDbEvent(eventRecord);

    if (!event.is_published) {
      return NextResponse.json(
        { error: "This event is currently unavailable for registration." },
        { status: 400 }
      );
    }

    const currentStatus = String(event.status || "").toLowerCase();
    if (
      currentStatus === "registration_closed" ||
      currentStatus === "cancelled" ||
      currentStatus === "draft" ||
      currentStatus === "completed"
    ) {
      return NextResponse.json(
        { error: `Registration for this event is closed (Status: ${event.status}).` },
        { status: 400 }
      );
    }

    if (event.registration_deadline) {
      const deadlineDate = new Date(event.registration_deadline);
      if (!isNaN(deadlineDate.getTime()) && new Date() > deadlineDate) {
        return NextResponse.json(
          { error: "The registration deadline for this event has passed." },
          { status: 400 }
        );
      }
    }

    // 3. Authoritative fee calculation (NEVER trust frontend amount!)
    const unitFee = Number(event.registration_fee || 0);
    const count = Math.max(1, parseInt(String(numParticipants), 10) || 1);
    const totalAmountInRupees = registrationRecord?.amount !== undefined ? Number(registrationRecord.amount) : unitFee * count;
    
    // Amount in paise (1 INR = 100 Paise)
    const amountInPaise = Math.round(totalAmountInRupees * 100);

    let razorpayOrderId = "";
    const razorpayInstance = getRazorpayInstance();
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";

    if (razorpayInstance) {
      try {
        const orderOptions = {
          amount: amountInPaise,
          currency: "INR",
          receipt: registrationRecord?.registration_number || `receipt_${Date.now()}`,
          notes: {
            eventId: event.id,
            registrationId: registrationId || "",
            eventTitle: event.title,
          },
        };

        const razorpayOrder = await razorpayInstance.orders.create(orderOptions);
        razorpayOrderId = razorpayOrder.id;
      } catch (rzpErr: any) {
        console.error("Razorpay SDK Order Creation error:", rzpErr);
        return NextResponse.json(
          { error: rzpErr.description || rzpErr.message || "Failed to create order with Razorpay Gateway." },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Razorpay environment variables (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are missing or incomplete on the server." },
        { status: 500 }
      );
    }

    // 4. Save/Update payment record in Supabase registration_payments
    if (supabase && registrationId) {
      try {
        const { data: existingPay } = await supabase
          .from("registration_payments")
          .select("id")
          .eq("registration_id", registrationId)
          .maybeSingle();

        if (existingPay) {
          await supabase
            .from("registration_payments")
            .update({
              razorpay_order_id: razorpayOrderId,
              amount: totalAmountInRupees,
              currency: "INR",
              status: "created",
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingPay.id);
        } else {
          await supabase.from("registration_payments").insert({
            registration_id: registrationId,
            razorpay_order_id: razorpayOrderId,
            amount: totalAmountInRupees,
            currency: "INR",
            status: "created",
          });
        }
      } catch (dbPayErr) {
        console.warn("Notice updating registration_payments record:", dbPayErr);
      }
    }

    // Return standardized Razorpay order response
    return NextResponse.json({
      success: true,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      keyId: keyId,
      order: {
        id: razorpayOrderId,
        eventId: event.id,
        eventTitle: event.title,
        unitFee,
        numParticipants: count,
        amount: totalAmountInRupees,
        amountInPaise,
        currency: "INR",
        razorpayKeyId: keyId,
      },
    });
  } catch (err: any) {
    console.error("POST /api/payments/create-order error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create registration payment order." },
      { status: 500 }
    );
  }
}
