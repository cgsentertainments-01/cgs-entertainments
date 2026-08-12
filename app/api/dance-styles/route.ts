import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    let styles: any[] = [];
    if (supabase) {
      const { data, error } = await supabase
        .from("dance_styles")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (!error && data && data.length > 0) {
        styles = data;
      }
    }

    if (styles.length === 0) {
      styles = [
        { id: "ds-1", name: "Classical", slug: "classical" },
        { id: "ds-2", name: "Hip Hop", slug: "hip-hop" },
        { id: "ds-3", name: "Western", slug: "western" },
        { id: "ds-4", name: "Folk", slug: "folk" },
        { id: "ds-5", name: "Contemporary", slug: "contemporary" },
        { id: "ds-6", name: "Bollywood", slug: "bollywood" },
        { id: "ds-7", name: "Freestyle", slug: "freestyle" },
        { id: "ds-8", name: "Bharatanatyam", slug: "bharatanatyam" },
        { id: "ds-9", name: "Kathak", slug: "kathak" },
        { id: "ds-10", name: "Salsa / Latin", slug: "salsa" },
      ];
    }

    return NextResponse.json({ styles });
  } catch (err: any) {
    return NextResponse.json({ styles: [] });
  }
}
