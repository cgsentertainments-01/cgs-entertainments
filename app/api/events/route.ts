import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  DBEvent,
  getStoreEvents,
  insertInStore,
  deleteFromStore,
  revalidateEventCaches,
} from "@/lib/events-store";
import { transformDbEvent } from "@/services/event.service";
import { verifyAdminApi } from "@/lib/supabase/server";

// Helper to find or create category ID in event_categories table
async function getOrCreateCategoryId(categoryName: string): Promise<string | null> {
  if (!supabase) return null;
  const name = categoryName || "Dance";
  const catSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "dance";

  try {
    const { data: existing } = await supabase
      .from("event_categories")
      .select("id")
      .or(`slug.eq.${catSlug},name.ilike.${name}`)
      .limit(1);

    if (existing && existing.length > 0) {
      return existing[0].id;
    }

    const { data: inserted } = await supabase
      .from("event_categories")
      .insert([
        {
          name: name,
          slug: catSlug,
          description: `${name} Events & Competitions`,
          is_active: true,
          display_order: 1,
        },
      ])
      .select("id");

    if (inserted && inserted.length > 0) {
      return inserted[0].id;
    }

    const { data: anyCat } = await supabase.from("event_categories").select("id").limit(1);
    if (anyCat && anyCat.length > 0) {
      return anyCat[0].id;
    }
  } catch (err) {
    console.warn("Category resolution warning:", err);
  }
  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isUpcomingParam = searchParams.get("upcoming") === "true";
  const isAllParam = searchParams.get("all") === "true";
  const slugParam = searchParams.get("slug") || searchParams.get("id") || searchParams.get("identifier");
  const limitParam = parseInt(searchParams.get("limit") || "8", 10);

  try {
    let supabaseEvents: any[] = [];

    // 1. Query Supabase events table
    if (supabase) {
      const { data, error } = await supabase
        .from("events")
        .select("*, event_categories(name)");

      if (!error && data) {
        supabaseEvents = data;
      } else {
        const { data: fallbackData } = await supabase.from("events").select("*");
        if (fallbackData) supabaseEvents = fallbackData;
      }
    }

    // Merge Supabase events with server-side store events
    // CRITICAL: Key ONLY by unique event ID so items NEVER appear duplicated!
    const combinedMap = new Map<string, any>();

    for (const item of supabaseEvents) {
      if (item && item.id) {
        combinedMap.set(String(item.id), item);
      }
    }
    for (const item of getStoreEvents()) {
      if (item && item.id) {
        combinedMap.set(String(item.id), item);
      }
    }

    const uniqueRawEvents = Array.from(combinedMap.values());
    let allEventsList = uniqueRawEvents.map(transformDbEvent);

    // Single lookup by slug or id
    if (slugParam) {
      const found = allEventsList.find(
        (e) =>
          String(e.id).toLowerCase() === slugParam.toLowerCase() ||
          String(e.slug).toLowerCase() === slugParam.toLowerCase()
      );
      if (found) {
        return NextResponse.json({ event: found });
      }

      // Direct query by ID or Slug in Supabase if not in cache
      if (supabase) {
        const { data: directEvt } = await supabase
          .from("events")
          .select("*, event_categories(name)")
          .or(`id.eq.${slugParam},slug.eq.${slugParam}`)
          .maybeSingle();

        if (directEvt) {
          const transformed = transformDbEvent(directEvt);
          insertInStore(transformed as any);
          return NextResponse.json({ event: transformed });
        }
      }

      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Filter upcoming events if requested
    if (isUpcomingParam) {
      allEventsList = allEventsList.filter((evt) => {
        if (evt.is_published === false) return false;
        const statusUpper = String(evt.status || "").toUpperCase();
        if (statusUpper === "CANCELLED" || statusUpper === "COMPLETED" || statusUpper === "DRAFT") return false;
        return true;
      });

      allEventsList.sort((a, b) => {
        const dA = new Date(a.rawDate || a.date || "").getTime() || 0;
        const dB = new Date(b.rawDate || b.date || "").getTime() || 0;
        return dB - dA;
      });

      if (limitParam && limitParam > 0) {
        allEventsList = allEventsList.slice(0, limitParam);
      }
    } else if (isAllParam) {
      allEventsList.sort((a, b) => {
        const dA = new Date(a.rawDate || a.date || "").getTime() || 0;
        const dB = new Date(b.rawDate || b.date || "").getTime() || 0;
        return dB - dA;
      });
    }

    return NextResponse.json({ events: allEventsList });
  } catch (err: any) {
    console.error("GET /api/events error:", err);
    return NextResponse.json({ events: [] });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = await request.json();
    const {
      title,
      slug,
      short_description,
      description,
      category,
      category_id,
      dance_style,
      dance_style_id,
      event_date,
      date,
      event_start_time,
      event_end_date,
      event_end_time,
      registration_start_date,
      registration_deadline,
      timezone,
      venue,
      address,
      city,
      state,
      pincode,
      google_maps_url,
      banner_image,
      mobile_banner_image,
      thumbnail_image,
      img,
      registration_required,
      registration_fee,
      price,
      max_participants,
      maxSeats,
      min_age,
      max_age,
      registration_type,
      max_team_size,
      allow_multiple_categories,
      registration_form_type,
      participation_categories,
      dance_styles,
      rules_regulations,
      terms_conditions,
      required_documents,
      payment_required,
      currency,
      refund_policy,
      payment_deadline,
      schedule,
      judges,
      contact_info,
      seo,
      homepage_settings,
      status,
      is_featured,
      is_published,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Event Title is required." }, { status: 400 });
    }

    // ALWAYS generate a new unique UUID for CREATE operations!
    const eventId = crypto.randomUUID();

    const baseSlug = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let generatedSlug = baseSlug;

    // Check slug uniqueness in Supabase & memory store
    if (supabase) {
      const { data: existingSlug } = await supabase
        .from("events")
        .select("id")
        .eq("slug", generatedSlug)
        .maybeSingle();

      if (existingSlug) {
        // Append random 4-char suffix to guarantee slug uniqueness rather than overwriting
        generatedSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    }

    const feeNum = typeof registration_fee === "number"
      ? registration_fee
      : parseFloat(String(price || registration_fee || "0").replace(/[^0-9.]/g, "")) || 0;

    let isoDate = new Date().toISOString();
    const dateInput = event_date || date;
    if (dateInput) {
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) {
        isoDate = parsed.toISOString();
      }
    }

    const resolvedCategoryId = category_id || (await getOrCreateCategoryId(category || "Dance"));
    const bannerImg = banner_image || img || "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=85";

    const newEvent: DBEvent = {
      id: eventId,
      title,
      slug: generatedSlug,
      short_description: short_description || title,
      description: description || short_description || `Official ${category || "Talent"} Event hosted by CGS Entertainments.`,
      category_id: resolvedCategoryId || undefined,
      category_name: category || "Dance",
      dance_style_id,
      dance_style_name: dance_style,
      badge: (category || "DANCE").toUpperCase(),
      event_date: isoDate,
      event_start_time: event_start_time || "10:00 AM",
      event_end_date: event_end_date || "",
      event_end_time: event_end_time || "08:00 PM",
      registration_start_date: registration_start_date || undefined,
      registration_deadline: registration_deadline || undefined,
      timezone: timezone || "Asia/Kolkata (IST)",
      venue: venue || "HICC Convention Centre",
      address: address || "",
      city: city || "Hyderabad",
      state: state || "Telangana",
      pincode: pincode || "500001",
      google_maps_url: google_maps_url || "",
      banner_image: bannerImg,
      mobile_banner_image: mobile_banner_image || bannerImg,
      thumbnail_image: thumbnail_image || bannerImg,
      registration_required: registration_required !== undefined ? Boolean(registration_required) : true,
      registration_fee: feeNum,
      max_participants: max_participants || maxSeats || 500,
      current_participants: 0,
      min_age: min_age || 5,
      max_age: max_age || 60,
      registration_type: registration_type || "individual",
      max_team_size: max_team_size || 10,
      allow_multiple_categories: Boolean(allow_multiple_categories),
      registration_form_type: registration_form_type || "standard",
      participation_categories: participation_categories || ["Solo", "Duo", "Group"],
      dance_styles: dance_styles || ["Classical", "Hip Hop", "Western"],
      rules_regulations: rules_regulations || terms_conditions || "",
      terms_conditions: terms_conditions || rules_regulations || "",
      required_documents: required_documents || ["Profile Photo", "ID Proof", "Dance Video"],
      payment_required: payment_required !== undefined ? Boolean(payment_required) : true,
      currency: currency || "INR",
      refund_policy: refund_policy || "Registration fee is non-refundable.",
      payment_deadline: payment_deadline || "",
      schedule: schedule || [],
      judges: judges || [],
      contact_info: contact_info || {},
      seo: seo || {},
      homepage_settings: homepage_settings || { show_on_homepage: true, is_featured: Boolean(is_featured) },
      status: status === "Upcoming" ? "registration_open" : status?.toLowerCase() || "registration_open",
      is_featured: Boolean(is_featured),
      is_published: is_published !== undefined ? Boolean(is_published) : true,
    };

    const payloadToInsert: any = {
      id: newEvent.id,
      title: newEvent.title,
      slug: newEvent.slug,
      short_description: newEvent.short_description,
      description: newEvent.description,
      event_date: newEvent.event_date,
      registration_start_date: newEvent.registration_start_date || null,
      registration_deadline: newEvent.registration_deadline || null,
      venue: newEvent.venue,
      address: newEvent.address,
      city: newEvent.city,
      state: newEvent.state,
      pincode: newEvent.pincode,
      banner_image: newEvent.banner_image,
      thumbnail_image: newEvent.thumbnail_image,
      registration_fee: newEvent.registration_fee,
      max_participants: newEvent.max_participants,
      status: newEvent.status,
      is_featured: newEvent.is_featured,
      is_published: newEvent.is_published,
      terms_conditions: newEvent.terms_conditions,
    };

    if (resolvedCategoryId) payloadToInsert.category_id = resolvedCategoryId;

    // CRITICAL: Always perform INSERT (never UPSERT) for new event creation!
    if (supabase) {
      try {
        const { error: sbErr } = await supabase
          .from("events")
          .insert([payloadToInsert]);

        if (sbErr) {
          console.error("Supabase events insert error:", sbErr);
        }
      } catch (sbErr) {
        console.warn("Supabase insert exception:", sbErr);
      }
    }

    insertInStore(newEvent);
    revalidateEventCaches(newEvent.id, newEvent.slug);

    return NextResponse.json({ success: true, event: transformDbEvent(newEvent) }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/events error:", err);
    return NextResponse.json({ error: err.message || "Failed to create event" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    // CRITICAL: Only delete WHERE id = selectedEventId
    if (supabase) {
      try {
        await supabase.from("events").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete warning:", err);
      }
    }

    deleteFromStore(id);
    revalidateEventCaches(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
