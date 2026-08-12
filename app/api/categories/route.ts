import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getStoreEvents } from "@/lib/events-store";

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  dance: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=85",
  modeling: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
  acting: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1200&q=85",
  singing: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85",
  music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85",
  photography: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=85",
  cultural: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85",
  corporate: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85",
  entertainment: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85",
};

export async function GET() {
  try {
    let categories: any[] = [];
    let eventsList: any[] = [];

    // 1. Fetch categories from Supabase if configured
    if (supabase) {
      const { data, error } = await supabase
        .from("event_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        categories = data;
      }
    }

    // 2. Fallback default categories if empty
    if (categories.length === 0) {
      categories = [
        { id: "11111111-1111-1111-1111-111111111111", name: "Dance", slug: "dance", description: "Concerts & Stage Dance Competitions" },
        { id: "22222222-2222-2222-2222-222222222222", name: "Modeling", slug: "modeling", description: "Fashion Runway & Modeling Shows" },
        { id: "33333333-3333-3333-3333-333333333333", name: "Acting", slug: "acting", description: "Theatre & Drama Competitions" },
        { id: "44444444-4444-4444-4444-444444444444", name: "Singing", slug: "singing", description: "Solo & Group Vocal Competitions" },
        { id: "55555555-5555-5555-5555-555555555555", name: "Music", slug: "music", description: "Live Concerts & Instrumental Shows" },
        { id: "66666666-6666-6666-6666-666666666666", name: "Photography", slug: "photography", description: "National Photo & Visual Contests" },
      ];
    }

    // 3. Fetch events to calculate dynamic event counts
    if (supabase) {
      const { data: dbEvts } = await supabase
        .from("events")
        .select("id, category_id, is_published, status, event_categories(name)");
      if (dbEvts) eventsList = dbEvts;
    }
    const storeEvts = getStoreEvents();
    if (storeEvts && storeEvts.length > 0) {
      eventsList = [...eventsList, ...storeEvts];
    }

    // 4. Enrich categories with fallback images & event counts
    const enriched = categories.map((cat) => {
      const catSlug = (cat.slug || cat.name?.toLowerCase() || "").replace(/[^a-z0-9]+/g, "-");
      const fallbackImg =
        FALLBACK_CATEGORY_IMAGES[catSlug] ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";

      // Count events matching category
      const count = eventsList.filter((e) => {
        if (e.category_id && cat.id && String(e.category_id) === String(cat.id)) return true;
        const eCatName = e.category_name || e.category || e.event_categories?.name || e.badge || "";
        return eCatName.toLowerCase() === cat.name.toLowerCase() || eCatName.toLowerCase() === catSlug;
      }).length;

      return {
        ...cat,
        image: cat.image || fallbackImg,
        eventsCount: count,
      };
    });

    return NextResponse.json({ categories: enriched });
  } catch (err: any) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json({ categories: [] });
  }
}

