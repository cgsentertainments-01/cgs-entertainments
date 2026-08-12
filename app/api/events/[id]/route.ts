import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";
import { upsertInStore, deleteFromStore, revalidateEventCaches, DBEvent } from "@/lib/events-store";
import { transformDbEvent } from "@/services/event.service";

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidUUID(uuid: string) {
  if (!uuid || typeof uuid !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Resolve a slug or UUID identifier to a confirmed Supabase row UUID.
 * Always returns the UUID primary key so the update targets exactly one row.
 */
async function resolveEventId(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  identifier: string
): Promise<{ uuid: string; slugFromDb: string } | null> {
  if (!supabase) return null;

  try {
    // Try UUID-exact match first, then slug fallback
    const query = isValidUUID(identifier)
      ? supabase
          .from("events")
          .select("id, slug")
          .or(`id.eq.${identifier},slug.eq.${identifier}`)
          .limit(1)
      : supabase
          .from("events")
          .select("id, slug")
          .eq("slug", identifier)
          .limit(1);

    const { data, error } = await query;
    if (error || !data || data.length === 0) return null;
    return { uuid: data[0].id, slugFromDb: data[0].slug };
  } catch {
    return null;
  }
}

async function getOrCreateCategoryId(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  categoryName: string
): Promise<string | null> {
  if (!supabase) return null;
  const name = categoryName || "Dance";
  const catSlug =
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "dance";

  try {
    const { data: existing } = await supabase
      .from("event_categories")
      .select("id")
      .or(`slug.eq.${catSlug},name.ilike.${name}`)
      .limit(1);

    if (existing && existing.length > 0) return existing[0].id;

    const { data: inserted } = await supabase
      .from("event_categories")
      .insert([
        {
          name,
          slug: catSlug,
          description: `${name} Events & Competitions`,
          is_active: true,
          display_order: 1,
        },
      ])
      .select("id");

    if (inserted && inserted.length > 0) return inserted[0].id;

    // Last resort: any existing category
    const { data: anyCat } = await supabase
      .from("event_categories")
      .select("id")
      .limit(1);
    if (anyCat && anyCat.length > 0) return anyCat[0].id;
  } catch (err) {
    console.warn("Category resolution warning:", err);
  }
  return null;
}

// ─── PUT /api/events/[id] ────────────────────────────────────────────────────

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify admin auth
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    // 2. Use service-role client so RLS does not block admin writes
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase admin client unavailable. Check SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      );
    }

    // 3. Resolve the URL param (could be UUID or slug) to the actual DB row UUID
    const resolved = await resolveEventId(supabase, id);
    if (!resolved) {
      return NextResponse.json(
        { error: `Event not found for identifier: '${id}'` },
        { status: 404 }
      );
    }
    const { uuid: eventUUID, slugFromDb: existingSlug } = resolved;

    // 4. Parse request body
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
      registration_fee,
      price,
      max_participants,
      maxSeats,
      status,
      is_featured,
      is_published,
      rules_regulations,
      terms_conditions,
      schedule,
      judges,
      contact_info,
      seo,
      homepage_settings,
    } = body;

    // 5. Check slug uniqueness if slug is changing
    const newSlug = slug || existingSlug;
    if (newSlug && newSlug !== existingSlug) {
      const { data: existingWithSlug } = await supabase
        .from("events")
        .select("id")
        .eq("slug", newSlug)
        .neq("id", eventUUID)
        .maybeSingle();

      if (existingWithSlug) {
        return NextResponse.json(
          {
            error:
              "This slug is already used by another event. Please choose a different slug.",
          },
          { status: 400 }
        );
      }
    }

    // 6. Normalise fields
    const feeNum =
      typeof registration_fee === "number"
        ? registration_fee
        : typeof price === "number"
        ? price
        : parseFloat(
            String(price || registration_fee || "0").replace(/[^0-9.]/g, "")
          ) || 0;

    let isoDate = new Date().toISOString();
    const dateInput = event_date || date;
    if (dateInput) {
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) isoDate = parsed.toISOString();
    }

    const categoryId =
      category_id || (await getOrCreateCategoryId(supabase, category || "Dance"));

    // 7. Build the update payload — strictly matching actual events table columns:
    //    id, title, slug, short_description, description, category_id,
    //    event_date, registration_start_date, registration_deadline,
    //    venue, address, city, state, pincode,
    //    banner_image, thumbnail_image, registration_fee,
    //    max_participants, status, is_featured, is_published, terms_conditions, updated_at
    const updatePayload: Record<string, unknown> = {
      title: title || body.title,
      event_date: isoDate,
      venue: venue || "HICC Convention Centre",
      city: city || "Hyderabad",
      state: state || "Telangana",
      registration_fee: feeNum,
      max_participants: max_participants || maxSeats || 500,
      status:
        status === "Upcoming"
          ? "registration_open"
          : status?.toLowerCase() || "registration_open",
      is_published: is_published !== undefined ? Boolean(is_published) : true,
      updated_at: new Date().toISOString(),
    };

    if (newSlug) updatePayload.slug = newSlug;
    if (short_description) updatePayload.short_description = short_description;
    if (description) updatePayload.description = description;
    if (categoryId) updatePayload.category_id = categoryId;
    if (address !== undefined) updatePayload.address = address;
    if (pincode) updatePayload.pincode = pincode;
    // NOTE: google_maps_url and mobile_banner_image are NOT in the events schema — omitted

    const bannerImg = banner_image || img;
    if (bannerImg) updatePayload.banner_image = bannerImg;
    if (thumbnail_image || bannerImg)
      updatePayload.thumbnail_image = thumbnail_image || bannerImg;

    if (registration_start_date)
      updatePayload.registration_start_date = registration_start_date;
    if (registration_deadline)
      updatePayload.registration_deadline = registration_deadline;
    if (is_featured !== undefined)
      updatePayload.is_featured = Boolean(is_featured);
    if (terms_conditions || rules_regulations)
      updatePayload.terms_conditions = terms_conditions || rules_regulations;

    // 8. Execute UPDATE — target exactly the resolved UUID, confirm row returned
    const { data: updatedRow, error: sbErr } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", eventUUID)       // strict UUID match — never touches other rows
      .select("*")               // fetch the saved row back
      .single();                 // fails if no row matched

    if (sbErr) {
      console.error(`Supabase UPDATE error for event ${eventUUID}:`, sbErr);
      return NextResponse.json(
        {
          error: `Unable to update event: ${sbErr.message}`,
          detail: sbErr,
        },
        { status: 500 }
      );
    }

    if (!updatedRow) {
      return NextResponse.json(
        { error: "Event update returned no data — the row may not exist." },
        { status: 500 }
      );
    }

    // 9. Sync in-memory store and revalidate Next.js cache
    const storeItem: DBEvent = {
      id: updatedRow.id,
      title: updatedRow.title,
      slug: updatedRow.slug,
      short_description: updatedRow.short_description,
      description: updatedRow.description,
      category_id: updatedRow.category_id,
      category_name: category,
      dance_style_id,
      dance_style_name: dance_style,
      event_date: updatedRow.event_date,
      event_start_time,
      event_end_date,
      event_end_time,
      registration_start_date: updatedRow.registration_start_date,
      registration_deadline: updatedRow.registration_deadline,
      timezone,
      venue: updatedRow.venue,
      address: updatedRow.address,
      city: updatedRow.city,
      state: updatedRow.state,
      pincode: updatedRow.pincode,
      google_maps_url: updatedRow.google_maps_url,
      banner_image: updatedRow.banner_image,
      mobile_banner_image: updatedRow.mobile_banner_image,
      thumbnail_image: updatedRow.thumbnail_image,
      img: updatedRow.banner_image,
      registration_fee: updatedRow.registration_fee,
      max_participants: updatedRow.max_participants,
      status: updatedRow.status,
      is_featured: updatedRow.is_featured,
      is_published: updatedRow.is_published,
      terms_conditions: updatedRow.terms_conditions,
      schedule: schedule || [],
      judges: judges || [],
      contact_info: contact_info || {},
      seo: seo || {},
      homepage_settings: homepage_settings || {},
    };

    upsertInStore(storeItem);
    revalidateEventCaches(updatedRow.id, updatedRow.slug);

    return NextResponse.json({
      success: true,
      updated: transformDbEvent({ ...updatedRow, category_name: category }),
    });
  } catch (err: any) {
    console.error("PUT /api/events/[id] exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── DELETE /api/events/[id] ─────────────────────────────────────────────────

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    // Use service-role client for admin write operations
    const supabase = getSupabaseAdmin();

    if (supabase) {
      // Resolve to UUID first so we never accidentally delete by slug collision
      const resolved = await resolveEventId(supabase, id);
      if (resolved) {
        const { error: delErr } = await supabase
          .from("events")
          .delete()
          .eq("id", resolved.uuid);

        if (delErr) {
          console.error(`Supabase DELETE error for event ${resolved.uuid}:`, delErr);
          return NextResponse.json(
            { error: `Unable to delete event: ${delErr.message}` },
            { status: 500 }
          );
        }
      }
    }

    deleteFromStore(id);
    revalidateEventCaches(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/events/[id] exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
