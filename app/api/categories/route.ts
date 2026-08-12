import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("all") === "true";

    let categories: any[] = [];
    let eventsList: any[] = [];

    // Fetch categories directly from Supabase ordered by display_order
    if (supabase) {
      let query = supabase
        .from("event_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error fetching event_categories:", error);
        return NextResponse.json({ categories: [], error: true }, { status: 500 });
      }

      if (data) {
        categories = data;
      }
    }

    // Fetch events to compute dynamic category event counts
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

    const enriched = categories.map((cat) => {
      const catSlug = (cat.slug || cat.name?.toLowerCase() || "").replace(/[^a-z0-9]+/g, "-");
      const fallbackImg =
        GENERIC_CATEGORY_IMAGES[catSlug] ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85";

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

    return NextResponse.json(
      { categories: enriched },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json({ categories: [], error: true }, { status: 500 });
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

    if (supabase) {
      const { data, error } = await supabase
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

    if (supabase) {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image = image;
      if (is_active !== undefined) updateData.is_active = is_active;
      if (display_order !== undefined) updateData.display_order = Number(display_order);

      const { data, error } = await supabase
        .from("event_categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating category in Supabase:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

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

    if (supabase) {
      // 1. Attempt hard delete from event_categories
      const { error } = await supabase
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
          const { error: updateErr } = await supabase
            .from("event_categories")
            .update({ is_active: false })
            .eq("id", id);

          if (updateErr) {
            return NextResponse.json({ error: updateErr.message }, { status: 500 });
          }

          return NextResponse.json({
            success: true,
            softDeleted: true,
            message: "Category was deactivated and removed from the public website because existing events are linked to it.",
          });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
  } catch (err: any) {
    console.error("DELETE /api/categories error:", err);
    return NextResponse.json({ error: err.message || "Failed to delete category" }, { status: 500 });
  }
}



