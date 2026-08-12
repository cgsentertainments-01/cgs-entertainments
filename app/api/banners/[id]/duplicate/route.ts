import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: originalBanner, error: fetchError } = await supabase
      .from("banners")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !originalBanner) {
      return NextResponse.json({ error: "Original banner not found" }, { status: 404 });
    }

    const { data: maxOrderData } = await supabase
      .from("banners")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    const nextOrder = maxOrderData && maxOrderData.length > 0 ? (maxOrderData[0].display_order || 0) + 1 : 1;

    const duplicatePayload: Record<string, any> = {
      title: `${originalBanner.title} (Copy)`,
      subtitle: originalBanner.subtitle || null,
      image_url: originalBanner.image_url,
      mobile_image_url: originalBanner.mobile_image_url || null,
      link_url: originalBanner.link_url || null,
      button_text: originalBanner.button_text || null,
      banner_type: originalBanner.banner_type || "hero",
      display_order: nextOrder,
      is_active: false, // Default to inactive draft copy for safety
      start_date: null,
      end_date: null,
    };

    if (originalBanner.description !== undefined) duplicatePayload.description = originalBanner.description;
    if (originalBanner.target_blank !== undefined) duplicatePayload.target_blank = originalBanner.target_blank;

    const { data: newBanner, error: createError } = await supabase
      .from("banners")
      .insert([duplicatePayload])
      .select()
      .single();

    if (createError) {
      console.error("POST /api/banners/[id]/duplicate error:", createError);
      return NextResponse.json({ error: "Failed to duplicate banner", details: createError.message }, { status: 500 });
    }

    return NextResponse.json({ banner: newBanner, message: "Banner duplicated successfully" }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/banners/[id]/duplicate exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
