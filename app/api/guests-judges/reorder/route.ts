import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { reorderFallbackGuestsJudges } from "@/lib/guests-judges-store";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid payload: items array required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Update each item in database
    for (const item of items) {
      if (item.id && typeof item.display_order === "number") {
        await supabase
          .from("guests_judges")
          .update({ display_order: item.display_order })
          .eq("id", item.id);
      }
    }

    // Also update fallback store
    reorderFallbackGuestsJudges(items);

    return NextResponse.json(
      { message: "Guests & judges order updated successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PUT /api/guests-judges/reorder exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
