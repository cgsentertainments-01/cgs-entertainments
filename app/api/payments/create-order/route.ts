import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStoreEvents } from "@/lib/events-store";
import { transformDbEvent } from "@/services/event.service";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();

  try {
    const body = await request.json();
    const { eventId, numParticipants = 1, participant } = body;

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required." }, { status: 400 });
    }

    let eventRecord: any = null;

    if (supabase) {
      const { data } = await supabase
        .from("events")
        .select("*")
        .or(`id.eq.${eventId},slug.eq.${eventId}`)
        .maybeSingle();

      if (data) {
        eventRecord = data;
      }
    }

    if (!eventRecord) {
      const storeEvents = getStoreEvents();
      eventRecord = storeEvents.find(
        (e) => String(e.id) === String(eventId) || e.slug === eventId
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

    if (
      event.max_participants &&
      event.current_participants !== undefined &&
      event.current_participants >= event.max_participants
    ) {
      return NextResponse.json(
        { error: "This event has reached maximum participant capacity." },
        { status: 400 }
      );
    }

    // Authoritative fee calculation
    const unitFee = Number(event.registration_fee || 0);
    const count = Math.max(1, parseInt(String(numParticipants), 10) || 1);
    const totalAmount = unitFee * count;

    const razorpayOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrderId,
        eventId: event.id,
        eventTitle: event.title,
        unitFee,
        numParticipants: count,
        amount: totalAmount,
        currency: event.currency || "INR",
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
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
