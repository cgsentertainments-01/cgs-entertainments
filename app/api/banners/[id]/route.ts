import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.from("banners").select("*").eq("id", id).single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ banner: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    const corePayload: Record<string, any> = {};

    if (body.title !== undefined) corePayload.title = body.title.trim();
    if (body.subtitle !== undefined) corePayload.subtitle = body.subtitle?.trim() || null;
    if (body.image_url !== undefined) corePayload.image_url = body.image_url.trim();
    if (body.mobile_image_url !== undefined) corePayload.mobile_image_url = body.mobile_image_url?.trim() || null;
    if (body.link_url !== undefined) corePayload.link_url = body.link_url?.trim() || null;
    if (body.button_text !== undefined) corePayload.button_text = body.button_text?.trim() || null;
    if (body.banner_type !== undefined) corePayload.banner_type = body.banner_type;
    if (body.display_order !== undefined) corePayload.display_order = Number(body.display_order) || 0;
    if (body.is_active !== undefined) corePayload.is_active = Boolean(body.is_active);
    if (body.start_date !== undefined) corePayload.start_date = body.start_date ? new Date(body.start_date).toISOString() : null;
    if (body.end_date !== undefined) corePayload.end_date = body.end_date ? new Date(body.end_date).toISOString() : null;

    corePayload.updated_at = new Date().toISOString();

    const extendedPayload = {
      ...corePayload,
      ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
      ...(body.target_blank !== undefined ? { target_blank: Boolean(body.target_blank) } : {}),
    };

    // Attempt 1: Extended Payload
    let { data, error } = await supabase.from("banners").update(extendedPayload).eq("id", id).select().single();

    // Attempt 2 Fallback: Core Payload if extended columns do not exist in DB yet
    if (error && (error.message?.includes("column") || error.code === "PGRST204" || error.code === "42703")) {
      console.warn("Retrying banner update without optional extended columns...", error.message);
      const fallbackResult = await supabase.from("banners").update(corePayload).eq("id", id).select().single();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error("PUT /api/banners/[id] database error:", error);
      return NextResponse.json({ error: error.message || "Failed to update banner" }, { status: 500 });
    }

    return NextResponse.json({ banner: data, message: "Banner updated successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/banners/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data: existingBanner } = await supabase.from("banners").select("*").eq("id", id).single();

    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    const cleanupStorageImage = async (imageUrl?: string | null) => {
      if (!imageUrl) return;
      try {
        const match = imageUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
        if (match) {
          const bucketName = match[1];
          const fileKey = match[2];
          await supabase.storage.from(bucketName).remove([fileKey]);
        }
      } catch (storageErr) {
        console.warn("Storage cleanup failed for URL:", imageUrl, storageErr);
      }
    };

    await cleanupStorageImage(existingBanner.image_url);
    if (existingBanner.mobile_image_url) {
      await cleanupStorageImage(existingBanner.mobile_image_url);
    }

    const { error } = await supabase.from("banners").delete().eq("id", id);

    if (error) {
      console.error("DELETE /api/banners/[id] error:", error);
      return NextResponse.json({ error: error.message || "Failed to delete banner record" }, { status: 500 });
    }

    return NextResponse.json({ message: "Banner and associated media deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/banners/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
