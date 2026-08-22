import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  
  if (!token) {
    return NextResponse.json(
      { verified: false, error: "Verification token or Registration ID is required." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { verified: false, error: "Database unavailable." },
      { status: 500 }
    );
  }

  try {
    const decodedToken = decodeURIComponent(token).trim();

    // Query registration by qr_token, registration_number, or id
    const { data: reg, error } = await supabase
      .from("registrations")
      .select(`
        id,
        registration_number,
        registration_status,
        payment_status,
        amount,
        registration_date,
        qr_token,
        qr_enabled,
        notes,
        events (
          id,
          title,
          slug,
          venue,
          address,
          city,
          state,
          event_date,
          banner_image,
          thumbnail_image
        ),
        participants (
          id,
          participant_number,
          full_name,
          email,
          phone,
          city,
          state,
          profile_photo
        ),
        event_categories (
          id,
          name
        ),
        dance_styles (
          id,
          name
        ),
        registration_payments (
          razorpay_payment_id,
          status,
          paid_at,
          amount
        )
      `)
      .or(`qr_token.eq.${decodedToken},registration_number.eq.${decodedToken},id.eq.${decodedToken}`)
      .maybeSingle();

    if (error) {
      console.error(`Verification API error for token "${decodedToken}":`, error.message);
      return NextResponse.json(
        { verified: false, error: "Verification processing error." },
        { status: 500 }
      );
    }

    if (!reg) {
      return NextResponse.json(
        {
          verified: false,
          error: "Unable to verify this participant. The QR code is invalid or no longer active.",
        },
        { status: 404 }
      );
    }

    // Check QR active status
    const isQrEnabled = reg.qr_enabled !== false;
    const status = (reg.registration_status || "").toLowerCase();
    const isActiveStatus = status === "confirmed" || status === "completed" || status === "active";

    if (!isQrEnabled || !isActiveStatus) {
      return NextResponse.json({
        verified: false,
        status: status.toUpperCase(),
        error: "Unable to verify this participant. The QR code is invalid or no longer active.",
        registration: {
          registration_number: reg.registration_number,
          registration_status: reg.registration_status,
          payment_status: reg.payment_status,
          event_title: (reg.events as any)?.title || "CGS Event",
          participant_name: (reg.participants as any)?.full_name || "Participant",
        },
      });
    }

    // Fetch participant photo if missing in participant table
    let photoUrl = (reg.participants as any)?.profile_photo || null;
    if (!photoUrl && (reg.participants as any)?.id) {
      const { data: doc } = await supabase
        .from("participant_documents")
        .select("document_url")
        .eq("participant_id", (reg.participants as any).id)
        .eq("document_type", "participant_photo")
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (doc?.document_url) {
        photoUrl = doc.document_url;
      }
    }

    // Process payment info
    const isFree = Number(reg.amount) === 0;
    const paymentRecords = Array.isArray(reg.registration_payments)
      ? reg.registration_payments
      : reg.registration_payments
      ? [reg.registration_payments]
      : [];
    
    const latestPayment = paymentRecords.find((p: any) => p.status === "paid" || p.razorpay_payment_id) || paymentRecords[0];

    const paymentId = isFree
      ? "N/A (Free Registration)"
      : latestPayment?.razorpay_payment_id || "pay_verified";

    const paymentStatusText = isFree
      ? "FREE REGISTRATION"
      : (reg.payment_status || "PAID").toUpperCase();

    // Return sanitized verified object
    return NextResponse.json({
      verified: true,
      registration: {
        id: reg.id,
        registration_number: reg.registration_number,
        registration_status: (reg.registration_status || "CONFIRMED").toUpperCase(),
        registration_date: reg.registration_date,
        amount: Number(reg.amount || 0),
        is_free: isFree,
        payment_status: paymentStatusText,
        payment_id: paymentId,
        qr_token: reg.qr_token,
        participant: {
          id: (reg.participants as any)?.id,
          participant_number: (reg.participants as any)?.participant_number,
          full_name: (reg.participants as any)?.full_name || "Valued Participant",
          email: (reg.participants as any)?.email,
          phone: (reg.participants as any)?.phone,
          city: (reg.participants as any)?.city,
          state: (reg.participants as any)?.state,
          photo_url: photoUrl,
        },
        event: {
          id: (reg.events as any)?.id,
          title: (reg.events as any)?.title || "CGS Entertainments Event",
          slug: (reg.events as any)?.slug,
          event_date: (reg.events as any)?.event_date,
          venue: (reg.events as any)?.venue,
          address: (reg.events as any)?.address,
          city: (reg.events as any)?.city || "Hyderabad",
          state: (reg.events as any)?.state,
          banner_image: (reg.events as any)?.banner_image,
        },
        category: (reg.event_categories as any)?.name || (reg.dance_styles as any)?.name || "Participant",
      },
    });
  } catch (err: any) {
    console.error("GET /api/verify/[token] exception:", err);
    return NextResponse.json(
      { verified: false, error: "An error occurred while verifying registration." },
      { status: 500 }
    );
  }
}
