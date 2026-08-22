import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  try {
    const { data: reg, error } = await supabase
      .from("registrations")
      .select(`
        *,
        events ( id, title, slug, venue, address, city, state, event_date, banner_image, thumbnail_image, registration_fee ),
        participants ( id, participant_number, full_name, email, phone, city, state, profile_photo ),
        event_categories ( id, name ),
        dance_styles ( id, name ),
        registration_payments ( id, razorpay_order_id, razorpay_payment_id, status, paid_at, amount )
      `)
      .or(`id.eq.${id},registration_number.eq.${id},qr_token.eq.${id}`)
      .maybeSingle();

    if (error) {
      console.error(`GET /api/registrations/${id} error:`, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!reg) {
      return NextResponse.json({ error: "Registration record not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, registration: reg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
