import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { supabase as clientSupabase } from "@/lib/supabase";
import { getStoreEvents } from "@/lib/events-store";

export const dynamic = "force-dynamic";

const GENERIC_CATEGORY_IMAGES: Record<string, string> = {
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

const DEFAULT_FALLBACK_CATEGORIES = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Dance",
    slug: "dance",
    description: "Stage Dance Competitions & Auditions",
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=85",
    is_active: true,
    display_order: 1,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Modeling",
    slug: "modeling",
    description: "Fashion Shows & Runway Competitions",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
    is_active: true,
    display_order: 2,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Acting",
    slug: "acting",
    description: "Theatre, Monologues & Acting Awards",
    image: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1200&q=85",
    is_active: true,
    display_order: 3,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Singing",
    slug: "singing",
    description: "Vocal & Music Auditions",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85",
    is_active: true,
    display_order: 4,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Music",
    slug: "music",
    description: "Instrumental & Band Festivals",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=85",
    is_active: true,
    display_order: 5,
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Photography",
    slug: "photography",
    description: "Talent Photo Contests",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85",
    is_active: true,
    display_order: 6,
  },
];

interface CategoryCacheItem {
  data: any[];
  timestamp: number;
}

let categoriesCacheAll: CategoryCacheItem | null = null;
let categoriesCacheActive: CategoryCacheItem | null = null;
const CAT_CACHE_TTL = 60 * 1000;

function clearCategoriesCache() {
  categoriesCacheAll = null;
  categoriesCacheActive = null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    const cached = includeInactive ? categoriesCacheAll : categoriesCacheActive;
    if (cached && Date.now() - cached.timestamp < CAT_CACHE_TTL && cached.data.length > 0) {
      return NextResponse.json(
        { categories: cached.data },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    let categories: any[] = [];
    let eventsList: any[] = [];

    // Fetch categories directly from Supabase ordered by display_order
    try {
      const supabaseAdmin = getSupabaseAdmin() || clientSupabase;
      if (supabaseAdmin) {
        let query = supabaseAdmin
          .from("event_categories")
          .select("id, name, slug, description, image, is_active, display_order, created_at, updated_at")
          .order("display_order", { ascending: true });

        if (!includeInactive) {
          query = query.eq("is_active", true);
        }

        const { data, error } = await query;

        if (error) {
          console.warn("Supabase query event_categories warning:", error.message);
        } else if (data && data.length > 0) {
          categories = data;
        }
      }
    } catch (dbErr) {
      console.warn("Exception connecting to Supabase for categories:", dbErr);
    }

    // Fallback to default categories if empty or DB is not reachable
    if (categories.length === 0) {
      categories = DEFAULT_FALLBACK_CATEGORIES;
    }

    // Fetch events to compute dynamic category event counts
    try {
      const supabaseAdmin = getSupabaseAdmin() || clientSupabase;
      if (supabaseAdmin) {
        const { data: dbEvts } = await supabaseAdmin
          .from("events")
          .select("id, category_id, is_published, status, event_categories(name)");
        if (dbEvts) eventsList = dbEvts;
      }
    } catch (evtErr) {
      console.warn("Exception querying events for category counts:", evtErr);
    }

    const storeEvts = getStoreEvents();
    if (storeEvts && storeEvts.length > 0) {
      eventsList = [...eventsList, ...storeEvts];
    }

    const enriched = categories.map((cat) => {
      const catSlug = (cat.slug || cat.name?.toLowerCase() || "").replace(/[^a-z0-9]+/g, "-");
      const fallbackImg =
        GENERIC_CATEGORY_IMAGES[catSlug] ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";

      const count = eventsList.filter((e) => {
        if (e.category_id && cat.id && String(e.category_id) === String(cat.id)) return true;
        const eCatName = e.category_name || e.category || e.event_categories?.name || e.badge || "";
        return eCatName.toLowerCase() === (cat.name || "").toLowerCase() || eCatName.toLowerCase() === catSlug;
      }).length;

      return {
        ...cat,
        image: cat.image || fallbackImg,
        eventsCount: count,
      };
    });

    if (includeInactive) {
      categoriesCacheAll = { data: enriched, timestamp: Date.now() };
    } else {
      categoriesCacheActive = { data: enriched, timestamp: Date.now() };
    }

    return NextResponse.json(
      { categories: enriched },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json(
      { categories: DEFAULT_FALLBACK_CATEGORIES },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  }
}

// POST: Admin creates a new category in Supabase
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, description, image, is_active, display_order } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const supabaseAdmin = getSupabaseAdmin() || clientSupabase;

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("event_categories")
        .insert([
          {
            name,
            slug: catSlug,
            description: description || null,
            image: image || null,
            is_active: is_active !== undefined ? is_active : true,
            display_order: display_order !== undefined ? Number(display_order) : 0,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating category in Supabase:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      clearCategoriesCache();
      return NextResponse.json({ success: true, category: data });
    }

    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  } catch (err: any) {
    console.error("POST /api/categories error:", err);
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
  }
}

// PUT: Admin updates an existing category in Supabase
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, slug, description, image, is_active, display_order } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin() || clientSupabase;

    if (supabaseAdmin) {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image = image;
      if (is_active !== undefined) updateData.is_active = is_active;
      if (display_order !== undefined) updateData.display_order = Number(display_order);

      const { data, error } = await supabaseAdmin
        .from("event_categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating category in Supabase:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      clearCategoriesCache();
      return NextResponse.json({ success: true, category: data });
    }

    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  } catch (err: any) {
    console.error("PUT /api/categories error:", err);
    return NextResponse.json({ error: err.message || "Failed to update category" }, { status: 500 });
  }
}

// DELETE: Admin deletes a category from Supabase
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin() || clientSupabase;

    if (supabaseAdmin) {
      // 1. Attempt hard delete from event_categories
      const { error } = await supabaseAdmin
        .from("event_categories")
        .delete()
        .eq("id", id);

      if (error) {
        console.warn("Supabase category hard delete failed:", error.message, error.code);

        // 2. If Foreign Key Constraint violation (events are linked to this category)
        if (
          error.code === "23503" ||
          error.message?.includes("foreign key constraint") ||
          error.message?.includes("violates") ||
          error.message?.includes("events_category_id_fkey")
        ) {
          // Deactivate category (is_active = false) so it is immediately removed from public website
          const { error: updateErr } = await supabaseAdmin
            .from("event_categories")
            .update({ is_active: false })
            .eq("id", id);

          if (updateErr) {
            return NextResponse.json({ error: updateErr.message }, { status: 500 });
          }

          clearCategoriesCache();
          return NextResponse.json({
            success: true,
            softDeleted: true,
            message: "Category was deactivated and removed from the public website because existing events are linked to it.",
          });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      clearCategoriesCache();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  } catch (err: any) {
    console.error("DELETE /api/categories error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete category" }, { status: 500 });
  }
}



