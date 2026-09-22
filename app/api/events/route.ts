import { NextResponse } from "next/server";
import { supabase as clientSupabase } from "@/lib/supabase";
import {
  DBEvent,
  getStoreEvents,
  insertInStore,
  deleteFromStore,
  revalidateEventCaches,
  getCachedEvents,
  setCachedEvents,
  clearEventsCache,
} from "@/lib/events-store";
import {
  transformDbEvent,
  normalizeEventIdentifier as normalizeIdentifier,
  isValidUUID,
} from "@/services/event.service";
import { isUpcomingEvent, isPublishedEvent, isCompletedEvent } from "@/lib/event-lifecycle";
import { verifyAdminApi } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createAdminNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const supabase = clientSupabase;

// Helper to find or create category ID in event_categories table
async function getOrCreateCategoryId(categoryName: string): Promise<string | null> {
  const dbClient = getSupabaseAdmin() || clientSupabase;
  if (!dbClient) return null;
  const name = categoryName || "Dance";
  const catSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "dance";

  try {
    const { data: existing } = await dbClient
      .from("event_categories")
      .select("id")
      .or(`slug.eq.${catSlug},name.ilike.${name}`)
      .limit(1);

    if (existing && existing.length > 0) {
      return existing[0].id;
    }

    const { data: inserted } = await dbClient
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

    const { data: anyCat } = await dbClient.from("event_categories").select("id").limit(1);
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
  const typeParam = searchParams.get("type");
  const isUpcomingParam = searchParams.get("upcoming") === "true" || typeParam === "upcoming";
  const isPublishedParam = typeParam === "published";
  const isCompletedParam = searchParams.get("completed") === "true";
  const isAllParam = searchParams.get("all") === "true";
  const slugParam = searchParams.get("slug") || searchParams.get("id") || searchParams.get("identifier");
  const limitParam = parseInt(searchParams.get("limit") || "8", 10);

  try {
    let supabaseEvents: any[] = [];

    // 1. Query Supabase events table with high-speed in-memory caching
    const cached = getCachedEvents();
    if (cached && cached.length > 0) {
      supabaseEvents = cached;
    } else {
      const dbClient = getSupabaseAdmin() || clientSupabase;
      if (dbClient) {
        const { data, error } = await dbClient
          .from("events")
          .select("*, event_categories(name)")
          .order("created_at", { ascending: false });

        if (!error && data) {
          supabaseEvents = data;
          setCachedEvents(data);
        } else {
          const { data: fallbackData } = await dbClient
            .from("events")
            .select("*")
            .order("created_at", { ascending: false });
          if (fallbackData) {
            supabaseEvents = fallbackData;
            setCachedEvents(fallbackData);
          }
        }
      }
    }

    // Supabase DB is the single source of truth for events
    let allEventsList = (supabaseEvents || []).map(transformDbEvent);

    // Single lookup by slug or id
    if (slugParam) {
      const cleanParam = normalizeIdentifier(slugParam);
      const isUUID = isValidUUID(cleanParam);
      const paramType = isUUID ? "UUID" : "slug";

      if (!cleanParam) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      // First, search loaded cache/store
      const foundInCache = allEventsList.find((e) => {
        if (isUUID) {
          return String(e.id).toLowerCase() === cleanParam.toLowerCase();
        } else {
          return String(e.slug).toLowerCase() === cleanParam.toLowerCase();
        }
      });

      if (foundInCache) {
        return NextResponse.json(
          { event: foundInCache },
          {
            status: 200,
            headers: {
              "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
            },
          }
        );
      }

      // Direct query in Supabase if not found in memory store
      const dbClient = getSupabaseAdmin() || clientSupabase;
      if (dbClient) {
        let query = dbClient.from("events").select("*, event_categories(name)");
        if (isUUID) {
          query = query.eq("id", cleanParam);
        } else {
          query = query.eq("slug", cleanParam);
        }

        let { data: directEvt, error: directErr } = await query.maybeSingle();

        // Fallback query if category join fails
        if (directErr) {
          let fallbackQuery = dbClient.from("events").select("*");
          if (isUUID) {
            fallbackQuery = fallbackQuery.eq("id", cleanParam);
          } else {
            fallbackQuery = fallbackQuery.eq("slug", cleanParam);
          }
          const fbRes = await fallbackQuery.maybeSingle();
          directEvt = fbRes.data;
        }

        if (directEvt) {
          const transformed = transformDbEvent(directEvt);
          return NextResponse.json(
            { event: transformed },
            {
              status: 200,
              headers: {
                "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
              },
            }
          );
        }
      }

      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Filter upcoming/public events if requested
    if (isUpcomingParam) {
      allEventsList = allEventsList.filter((evt) => isUpcomingEvent(evt));

      allEventsList.sort((a, b) => {
        const dA = new Date(a.rawDate || a.date || "").getTime() || 0;
        const dB = new Date(b.rawDate || b.date || "").getTime() || 0;
        return dB - dA;
      });

      if (limitParam && limitParam > 0) {
        allEventsList = allEventsList.slice(0, limitParam);
      }
    } else if (isCompletedParam) {
      allEventsList = allEventsList.filter((evt) => isCompletedEvent(evt));

      allEventsList.sort((a, b) => {
        const dA = new Date(a.rawDate || a.date || "").getTime() || 0;
        const dB = new Date(b.rawDate || b.date || "").getTime() || 0;
        return dB - dA;
      });
    } else if (isPublishedParam || !isAllParam) {
      // Default public events section & type=published: ONLY active published events
      allEventsList = allEventsList.filter((evt) => isPublishedEvent(evt));

      allEventsList.sort((a, b) => {
        const dA = new Date(a.rawDate || a.date || "").getTime() || 0;
        const dB = new Date(b.rawDate || b.date || "").getTime() || 0;
        return dB - dA;
      });
    } else {
      // Admin request (all=true): sort all events
      allEventsList.sort((a, b) => {
        const dA = new Date(a.rawDate || a.date || "").getTime() || 0;
        const dB = new Date(b.rawDate || b.date || "").getTime() || 0;
        return dB - dA;
      });
    }

    return NextResponse.json(
      { events: allEventsList },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: any) {
    console.error("GET /api/events error:", err);
    return NextResponse.json({ events: [] });
  }
}

function normalizeTimestamp(value: unknown): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed === "undefined" ||
    trimmed === "null" ||
    trimmed === "Open" ||
    trimmed === "Closed" ||
    trimmed === "TBA"
  ) {
    return null;
  }
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function normalizeStatus(value: unknown): string {
  if (!value || typeof value !== "string") return "registration_open";
  const val = value.trim().toLowerCase();
  const allowed = [
    "draft",
    "upcoming",
    "published",
    "registration_open",
    "registration_closed",
    "ongoing",
    "completed",
    "cancelled",
  ];
  if (allowed.includes(val)) return val;
  if (val === "archived" || val === "inactive" || val === "closed") return "registration_closed";
  return "registration_open";
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
      form_config,
      status,
      event_type,
      is_featured,
      is_published,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Event Title is required." }, { status: 400 });
    }

    const reqEventType = (event_type || (status === "upcoming" ? "upcoming" : "published")) === "upcoming" ? "upcoming" : "published";

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

    const isoDate = normalizeTimestamp(event_date || date) || new Date().toISOString();
    const normRegStart = normalizeTimestamp(registration_start_date);
    const normRegDeadline = normalizeTimestamp(registration_deadline);
    const normStatus = normalizeStatus(status);

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
      registration_start_date: normRegStart || undefined,
      registration_deadline: normRegDeadline || undefined,
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
      form_config: form_config || undefined,
      status: normStatus,
      event_type: reqEventType,
      is_featured: Boolean(is_featured),
      is_published: is_published !== undefined ? Boolean(is_published) : true,
    };

    const baseFormConfig = typeof form_config === "object" && form_config !== null ? { ...form_config } : {};
    baseFormConfig.extra = {
      event_type: reqEventType,
      schedule: schedule || [],
      judges: judges || [],
      contact_info: contact_info || {},
      seo: seo || {},
      homepage_settings: homepage_settings || {},
      dance_styles: dance_styles || [],
      dance_style,
      dance_style_id,
      participation_categories: participation_categories || [],
      rules_regulations: rules_regulations || terms_conditions || "",
      required_documents: required_documents || [],
      min_age: min_age || 5,
      max_age: max_age || 60,
      registration_type: registration_type || "individual",
      max_team_size: max_team_size || 10,
      allow_multiple_categories: Boolean(allow_multiple_categories),
      registration_form_type: registration_form_type || "standard",
      payment_required: payment_required !== undefined ? Boolean(payment_required) : true,
      currency: currency || "INR",
      refund_policy: refund_policy || "",
      event_start_time,
      event_end_date,
      event_end_time,
      google_maps_url,
      mobile_banner_image,
      timezone,
    };

    const payloadToInsert: any = {
      id: newEvent.id,
      title: newEvent.title,
      slug: newEvent.slug,
      short_description: newEvent.short_description,
      description: newEvent.description,
      event_date: newEvent.event_date,
      registration_start_date: normRegStart,
      registration_deadline: normRegDeadline,
      venue: newEvent.venue,
      address: newEvent.address,
      city: newEvent.city,
      state: newEvent.state,
      pincode: newEvent.pincode,
      banner_image: newEvent.banner_image,
      mobile_banner_image: newEvent.mobile_banner_image,
      thumbnail_image: newEvent.thumbnail_image,
      registration_fee: newEvent.registration_fee,
      max_participants: newEvent.max_participants,
      status: newEvent.status,
      event_type: reqEventType,
      is_featured: newEvent.is_featured,
      is_published: newEvent.is_published,
      terms_conditions: newEvent.terms_conditions,
      rules_regulations: newEvent.rules_regulations,
      form_config: baseFormConfig,
    };

    if (resolvedCategoryId) payloadToInsert.category_id = resolvedCategoryId;

    // CRITICAL: Always perform INSERT in Supabase and fail loudly if DB error occurs!
    const dbClient = getSupabaseAdmin() || supabase;
    if (dbClient) {
      let { error: sbErr } = await dbClient
        .from("events")
        .insert([payloadToInsert]);

      // If status check constraint fails or optional column is missing in DB schema cache, retry insert with fallback status/columns
      if (sbErr && (sbErr.code === "23514" || sbErr.message?.includes("events_status_check"))) {
        console.warn(`Notice: Check constraint events_status_check violated (${sbErr.message}). Retrying insert with status='registration_open' and event_type='${reqEventType}'.`);
        const constraintFallbackPayload = { ...payloadToInsert, status: payloadToInsert.status === "upcoming" ? "registration_open" : "published" };
        const retryRes = await dbClient.from("events").insert([constraintFallbackPayload]);
        sbErr = retryRes.error;
      }

      if (sbErr && (sbErr.code === "42703" || sbErr.message?.includes("column") || sbErr.message?.includes("rules_regulations") || sbErr.message?.includes("mobile_banner_image") || sbErr.message?.includes("event_type"))) {
        console.warn(`Notice: Column missing in DB table (${sbErr.message}). Retrying insert with sanitized payload.`);
        const fallbackPayload = { ...payloadToInsert };
        delete fallbackPayload.mobile_banner_image;
        delete fallbackPayload.event_type;
        delete fallbackPayload.rules_regulations;
        delete fallbackPayload.terms_conditions;
        const retryRes = await dbClient.from("events").insert([fallbackPayload]);
        sbErr = retryRes.error;
      }

      if (sbErr) {
        console.error("❌ Supabase events insert error:", sbErr);
        return NextResponse.json(
          {
            success: false,
            error: `Database Save Error: ${sbErr.message || "Failed to save event to Supabase."}`,
            details: sbErr,
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Database Connection Error: Supabase client is not available.",
        },
        { status: 500 }
      );
    }

    revalidateEventCaches(newEvent.id, newEvent.slug);

    await createAdminNotification({
      title: "New Event Created",
      message: `Event "${newEvent.title}" has been created successfully.`,
      type: "event",
      entityType: "event",
      entityId: newEvent.id,
      linkUrl: `/admin/events/${newEvent.id}`,
      deduplicateKey: `event_create_${newEvent.id}`,
    });

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

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase admin client unavailable" }, { status: 500 });
    }

    // 1. Resolve exact event row by UUID or slug
    const cleanId = normalizeIdentifier(id);
    if (!cleanId) {
      return NextResponse.json({ success: false, error: "Missing event ID" }, { status: 400 });
    }

    const isUUID = isValidUUID(cleanId);
    let fetchQuery = supabase.from("events").select("id, title, status");
    if (isUUID) {
      fetchQuery = fetchQuery.eq("id", cleanId);
    } else {
      fetchQuery = fetchQuery.eq("slug", cleanId);
    }

    const { data: eventRow, error: fetchErr } = await fetchQuery.maybeSingle();

    if (fetchErr) {
      console.error("Supabase fetch event error before delete:", fetchErr);
      return NextResponse.json(
        { success: false, error: `Database error while locating event: ${fetchErr.message}` },
        { status: 500 }
      );
    }

    if (!eventRow) {
      return NextResponse.json(
        { success: false, error: `Event not found for identifier: '${cleanId}'` },
        { status: 404 }
      );
    }

    const eventUUID = eventRow.id;

    const forceDelete = searchParams.get("force") === "true";

    // 2. Check foreign key relationship: registrations table
    const { count: regCount, error: regCountErr } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventUUID);

    if (regCountErr) {
      console.warn("Notice checking registrations count before event delete:", regCountErr.message);
    }

    if (regCount && regCount > 0 && !forceDelete) {
      console.warn(`[DELETE BLOCKED] Event '${eventRow.title}' (${eventUUID}) has ${regCount} existing registration(s).`);
      return NextResponse.json(
        {
          success: false,
          hasRegistrations: true,
          count: regCount,
          error: `This event has ${regCount} existing registration(s). Pass force=true to permanently delete the event and its associated records.`,
        },
        { status: 409 }
      );
    }

    if (forceDelete) {
      // Cascading cleanup of foreign key dependencies for this event
      try {
        await supabase.from("certificates").delete().eq("event_id", eventUUID);
        await supabase.from("event_results").delete().eq("event_id", eventUUID);
        await supabase.from("competition_rounds").delete().eq("event_id", eventUUID);
        
        const { data: eventRegs } = await supabase
          .from("registrations")
          .select("id")
          .eq("event_id", eventUUID);
          
        if (eventRegs && eventRegs.length > 0) {
          const regIds = eventRegs.map((r) => r.id);
          await supabase.from("registration_payments").delete().in("registration_id", regIds);
          await supabase.from("registrations").delete().eq("event_id", eventUUID);
        }
      } catch (cleanupErr: any) {
        console.warn("Notice during cascading event delete cleanup:", cleanupErr.message);
      }
    }

    console.log("DELETE EVENT ID:", eventUUID);

    // 3. Permanent deletion in Supabase using UUID primary key
    const { data: deletedRows, error: delErr } = await supabase
      .from("events")
      .delete()
      .eq("id", eventUUID)
      .select("id, title");

    if (delErr) {
      console.error("EVENT DELETE ERROR:", delErr);
      return NextResponse.json(
        { success: false, error: `Unable to delete event from database: ${delErr.message}` },
        { status: 500 }
      );
    }

    if (!deletedRows || deletedRows.length === 0) {
      console.error(`[DELETE FAILED] 0 rows deleted for event ID ${eventUUID}`);
      return NextResponse.json(
        {
          success: false,
          error: "No event was deleted. Check the event ID or database permissions.",
        },
        { status: 404 }
      );
    }

    console.log(`[DELETE SUCCESS] Deleted row from Supabase:`, deletedRows[0]);

    deleteFromStore(eventUUID);
    deleteFromStore(id);
    revalidateEventCaches(eventUUID, id);

    await createAdminNotification({
      title: "Event Deleted",
      message: `Event "${deletedRows[0]?.title || eventRow?.title || id}" was deleted permanently.`,
      type: "event",
      entityType: "event",
      entityId: eventUUID,
      linkUrl: "/admin/events",
      deduplicateKey: `event_delete_${eventUUID}`,
    });

    return NextResponse.json({ success: true, deletedEvent: deletedRows[0], permanent: true });
  } catch (err: any) {
    console.error("DELETE /api/events exception:", err);
    return NextResponse.json({ error: err.message || "Failed to delete event" }, { status: 500 });
  }
}
