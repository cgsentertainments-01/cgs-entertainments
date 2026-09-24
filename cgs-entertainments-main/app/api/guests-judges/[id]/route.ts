import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  updateFallbackGuestJudge,
  deleteFallbackGuestJudge,
} from "@/lib/guests-judges-store";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing guest/judge ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      role,
      designation,
      organization,
      bio,
      photo_url,
      social_links,
      display_order,
      is_active,
    } = body;

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name.trim();
    if (role !== undefined) updates.role = role;
    if (designation !== undefined) updates.designation = designation ? designation.trim() : null;
    if (organization !== undefined) updates.organization = organization ? organization.trim() : null;
    if (bio !== undefined) updates.bio = bio ? bio.trim() : null;
    if (photo_url !== undefined) updates.photo_url = photo_url ? photo_url.trim() : null;
    if (social_links !== undefined) updates.social_links = typeof social_links === "object" ? social_links : {};
    if (display_order !== undefined) updates.display_order = Number(display_order);
    if (is_active !== undefined) updates.is_active = Boolean(is_active);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("guests_judges")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.warn(`Supabase update guests_judges failed for ${id}, using fallback:`, error.message);
      const updated = updateFallbackGuestJudge(id, updates);
      if (!updated) {
        return NextResponse.json({ error: "Record not found" }, { status: 404 });
      }
      return NextResponse.json(
        { data: updated, message: "Guest/Judge record updated successfully" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { data: data, message: "Guest/Judge record updated successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PUT /api/guests-judges/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing guest/judge ID" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("guests_judges").delete().eq("id", id);

    if (error) {
      console.warn(`Supabase delete guests_judges failed for ${id}, using fallback:`, error.message);
      deleteFallbackGuestJudge(id);
    } else {
      deleteFallbackGuestJudge(id);
    }

    return NextResponse.json(
      { message: "Guest/Judge record permanently deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("DELETE /api/guests-judges/[id] exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
