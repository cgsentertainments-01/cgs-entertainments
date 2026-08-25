import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "admin";
    const placement = searchParams.get("placement");
    const supabase = getSupabaseAdmin();

    let query = supabase.from("banners").select("*");

    if (placement && placement !== "all") {
      query = query.eq("banner_type", placement);
    }

    if (mode === "public") {
      const nowIso = new Date().toISOString();
      query = query
        .eq("is_active", true)
        .or(`start_date.is.null,start_date.lte.${nowIso}`)
        .or(`end_date.is.null,end_date.gte.${nowIso}`);
    }

    query = query.order("display_order", { ascending: true }).order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/banners error:", error);
      return NextResponse.json({ error: error.message || "Failed to fetch banners" }, { status: 500 });
    }

    return NextResponse.json({ banners: data || [] }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/banners exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      image_url,
      mobile_image_url,
      link_url,
      button_text,
      banner_type = "hero",
      display_order = 0,
      is_active = true,
      start_date = null,
      end_date = null,
      target_blank = false,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Banner title is required" }, { status: 400 });
    }

    if (!image_url || !image_url.trim()) {
      return NextResponse.json({ error: "Banner image URL is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Standard Core DB Payload (Matches public.banners schema in schema.sql 100%)
    const corePayload: Record<string, any> = {
      title: title.trim(),
      subtitle: subtitle?.trim() || null,
      image_url: image_url.trim(),
      mobile_image_url: mobile_image_url?.trim() || null,
      link_url: link_url?.trim() || null,
      button_text: button_text?.trim() || null,
      banner_type: banner_type || "hero",
      display_order: Number(display_order) || 0,
      is_active: Boolean(is_active),
      start_date: start_date ? new Date(start_date).toISOString() : null,
      end_date: end_date ? new Date(end_date).toISOString() : null,
    };

    // Extended payload if migration columns exist
    const extendedPayload = {
      ...corePayload,
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(target_blank !== undefined ? { target_blank: Boolean(target_blank) } : {}),
    };

    // Attempt 1: Extended Payload
    let { data, error } = await supabase.from("banners").insert([extendedPayload]).select().single();

    // Attempt 2 Fallback: Core Payload if extended columns (description/target_blank) do not exist in DB yet
    if (error && (error.message?.includes("column") || error.code === "PGRST204" || error.code === "42703")) {
      console.warn("Retrying banner insert without optional extended columns...", error.message);
      const fallbackResult = await supabase.from("banners").insert([corePayload]).select().single();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error("POST /api/banners database error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create banner record", details: error.details || error.hint },
        { status: 500 }
      );
    }

    return NextResponse.json({ banner: data, message: "Banner created successfully" }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/banners exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
