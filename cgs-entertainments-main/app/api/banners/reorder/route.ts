import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { items } = body; // Array of { id: string, display_order: number }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid items array for reordering" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const updatePromises = items.map((item) =>
      supabase
        .from("banners")
        .update({ display_order: Number(item.display_order) || 0, updated_at: new Date().toISOString() })
        .eq("id", item.id)
    );

    const results = await Promise.all(updatePromises);
    const hasError = results.some((res) => res.error);

    if (hasError) {
      return NextResponse.json({ error: "Failed to update all banner orders" }, { status: 500 });
    }

    return NextResponse.json({ message: "Banners reordered successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("PUT /api/banners/reorder exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
