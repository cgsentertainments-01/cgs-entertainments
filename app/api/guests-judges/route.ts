import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getFallbackGuestsJudges,
  addFallbackGuestJudge,
} from "@/lib/guests-judges-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "admin";
    const roleFilter = searchParams.get("role");

    const supabase = getSupabaseAdmin();
    let query = supabase.from("guests_judges").select("*");

    if (roleFilter && roleFilter !== "all") {
      query = query.eq("role", roleFilter);
    }

    if (mode === "public") {
      query = query.eq("is_active", true);
    }

    query = query.order("display_order", { ascending: true }).order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.warn("Supabase guests_judges query warning/fallback:", error.message);
      // Fallback if table doesn't exist in Supabase yet
      let list = getFallbackGuestsJudges();
      if (roleFilter && roleFilter !== "all") {
        list = list.filter((item) => item.role === roleFilter);
      }
      if (mode === "public") {
        list = list.filter((item) => item.is_active);
      }
      return NextResponse.json({ data: list }, { status: 200 });
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/guests-judges exception:", err);
    // Fallback to in-memory store
    const list = getFallbackGuestsJudges().filter((i) => i.is_active);
    return NextResponse.json({ data: list }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      role = "Judge",
      designation,
      organization,
      bio,
      photo_url,
      social_links = {},
      display_order = 0,
      is_active = true,
    } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }

    if (!role || !["Guest", "Judge", "Chief Guest"].includes(role)) {
      return NextResponse.json(
        { error: "Valid role is required (Guest, Judge, Chief Guest)" },
        { status: 400 }
      );
    }

    const payload = {
      name: name.trim(),
      role: role,
      designation: designation?.trim() || null,
      organization: organization?.trim() || null,
      bio: bio?.trim() || null,
      photo_url: photo_url?.trim() || null,
      social_links: typeof social_links === "object" ? social_links : {},
      display_order: Number(display_order) || 0,
      is_active: Boolean(is_active),
    };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("guests_judges")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn("Supabase insert guests_judges failed, using fallback store:", error.message);
      const created = addFallbackGuestJudge(payload);
      return NextResponse.json(
        { data: created, message: "Guest/Judge record created successfully" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { data: data, message: "Guest/Judge record created successfully" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/guests-judges exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
