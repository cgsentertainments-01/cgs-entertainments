import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";
import { upsertInStore, deleteFromStore, revalidateEventCaches, DBEvent } from "@/lib/events-store";
import { transformDbEvent } from "@/services/event.service";
import { createAdminNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

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

// ─── GET /api/events/[id] ────────────────────────────────────────────────────

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const resolved = await resolveEventId(supabase, id);
      if (resolved) {
        const { data, error } = await supabase
          .from("events")
          .select("*, event_categories(name)")
          .eq("id", resolved.uuid)
          .maybeSingle();

        if (data && !error) {
          const transformed = transformDbEvent(data);
          return NextResponse.json({ event: transformed });
        }

        const { data: fallbackData } = await supabase
          .from("events")
          .select("*")
          .eq("id", resolved.uuid)
          .maybeSingle();

        if (fallbackData) {
          const transformed = transformDbEvent(fallbackData);
          return NextResponse.json({ event: transformed });
        }
      }
    }

    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  } catch (err: any) {
    console.error("GET /api/events/[id] exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
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
      dance_styles,
      participation_categories,
      required_documents,
      min_age,
      max_age,
      registration_type,
      max_team_size,
      allow_multiple_categories,
      registration_form_type,
      payment_required,
      currency,
      refund_policy,
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
      form_config,
      event_type,
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
    "published",
    "registration_open",
    "registration_closed",
    "ongoing",
    "completed",
    "cancelled",
  ];
  if (allowed.includes(val)) return val;
  if (val === "upcoming") return "registration_open";
  if (val === "archived" || val === "inactive" || val === "closed") return "registration_closed";
  return "registration_open";
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

    const categoryId =
      category_id || (await getOrCreateCategoryId(supabase, category || "Dance"));

    // Prepare extended form_config to preserve all event metadata in JSONB
    const baseFormConfig = typeof form_config === "object" && form_config !== null ? { ...form_config } : {};
    const existingExtra = baseFormConfig.extra || {};
    baseFormConfig.extra = {
      ...existingExtra,
      schedule: schedule !== undefined ? schedule : existingExtra.schedule,
      judges: judges !== undefined ? judges : existingExtra.judges,
      contact_info: contact_info !== undefined ? contact_info : existingExtra.contact_info,
      seo: seo !== undefined ? seo : existingExtra.seo,
      homepage_settings: homepage_settings !== undefined ? homepage_settings : existingExtra.homepage_settings,
      dance_styles: dance_styles !== undefined ? dance_styles : existingExtra.dance_styles,
      dance_style: dance_style !== undefined ? dance_style : existingExtra.dance_style,
      dance_style_id: dance_style_id !== undefined ? dance_style_id : existingExtra.dance_style_id,
      participation_categories: participation_categories !== undefined ? participation_categories : existingExtra.participation_categories,
      rules_regulations: rules_regulations !== undefined ? rules_regulations : existingExtra.rules_regulations,
      required_documents: required_documents !== undefined ? required_documents : existingExtra.required_documents,
      min_age: min_age !== undefined ? min_age : existingExtra.min_age,
      max_age: max_age !== undefined ? max_age : existingExtra.max_age,
      registration_type: registration_type !== undefined ? registration_type : existingExtra.registration_type,
      max_team_size: max_team_size !== undefined ? max_team_size : existingExtra.max_team_size,
      allow_multiple_categories: allow_multiple_categories !== undefined ? allow_multiple_categories : existingExtra.allow_multiple_categories,
      registration_form_type: registration_form_type !== undefined ? registration_form_type : existingExtra.registration_form_type,
      payment_required: payment_required !== undefined ? payment_required : existingExtra.payment_required,
      currency: currency !== undefined ? currency : existingExtra.currency,
      refund_policy: refund_policy !== undefined ? refund_policy : existingExtra.refund_policy,
      event_start_time: event_start_time !== undefined ? event_start_time : existingExtra.event_start_time,
      event_end_date: event_end_date !== undefined ? event_end_date : existingExtra.event_end_date,
      event_end_time: event_end_time !== undefined ? event_end_time : existingExtra.event_end_time,
      google_maps_url: google_maps_url !== undefined ? google_maps_url : existingExtra.google_maps_url,
      mobile_banner_image: mobile_banner_image !== undefined ? mobile_banner_image : existingExtra.mobile_banner_image,
      timezone: timezone !== undefined ? timezone : existingExtra.timezone,
    };

    // 7. Build the update payload using explicit column mappings and sanitized types
    const updatePayload: Record<string, unknown> = {
      status: normalizeStatus(status),
      is_published: is_published !== undefined ? Boolean(is_published) : true,
      updated_at: new Date().toISOString(),
      form_config: baseFormConfig,
    };

    if (event_type !== undefined) {
      const resolvedType = event_type === "upcoming" ? "upcoming" : "published";
      updatePayload.event_type = resolvedType;
      baseFormConfig.extra.event_type = resolvedType;
    }

    if (title !== undefined) updatePayload.title = title;
    if (newSlug !== undefined) updatePayload.slug = newSlug;
    if (short_description !== undefined) updatePayload.short_description = short_description;
    if (description !== undefined) updatePayload.description = description;
    if (categoryId) updatePayload.category_id = categoryId;
    if (address !== undefined) updatePayload.address = address;
    if (venue !== undefined) updatePayload.venue = venue;
    if (city !== undefined) updatePayload.city = city;
    if (state !== undefined) updatePayload.state = state;
    if (pincode !== undefined) updatePayload.pincode = pincode;
    if (registration_fee !== undefined || price !== undefined) updatePayload.registration_fee = feeNum;
    if (max_participants !== undefined || maxSeats !== undefined) updatePayload.max_participants = Number(max_participants || maxSeats) || 500;

    const normEventDate = normalizeTimestamp(event_date || date);
    if (normEventDate) {
      updatePayload.event_date = normEventDate;
    }

    updatePayload.registration_start_date = normalizeTimestamp(registration_start_date);
    updatePayload.registration_deadline = normalizeTimestamp(registration_deadline);

    const bannerImg = banner_image || img;
    if (bannerImg !== undefined) updatePayload.banner_image = bannerImg;
    if (thumbnail_image !== undefined || bannerImg !== undefined)
      updatePayload.thumbnail_image = thumbnail_image || bannerImg;

    if (is_featured !== undefined)
      updatePayload.is_featured = Boolean(is_featured);
    if (terms_conditions !== undefined) updatePayload.terms_conditions = terms_conditions;
    if (rules_regulations !== undefined) updatePayload.rules_regulations = rules_regulations;
    if (mobile_banner_image !== undefined) updatePayload.mobile_banner_image = mobile_banner_image;

    console.log(`[PUT /api/events/${eventUUID}] Target Event UUID: ${eventUUID}`);
    console.log(`[PUT /api/events/${eventUUID}] Update payload:`, JSON.stringify(updatePayload));

    // 8. Execute UPDATE — target exactly the resolved UUID, confirm row returned
    let { data: updatedRow, error: sbErr } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", eventUUID)
      .select("*")
      .single();

    if (sbErr && (sbErr.code === "42703" || sbErr.message?.includes("column") || sbErr.message?.includes("rules_regulations") || sbErr.message?.includes("mobile_banner_image") || sbErr.message?.includes("event_type"))) {
      console.warn(`Notice: Column missing in DB table during update (${sbErr.message}). Retrying update using fallback payload.`);
      const fallbackPayload = { ...updatePayload };
      delete fallbackPayload.mobile_banner_image;
      delete fallbackPayload.event_type;
      delete fallbackPayload.rules_regulations;
      delete fallbackPayload.terms_conditions;
      const retryRes = await supabase
        .from("events")
        .update(fallbackPayload)
        .eq("id", eventUUID)
        .select("*")
        .single();
      updatedRow = retryRes.data;
      sbErr = retryRes.error;
    }

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
        { status: 404 }
      );
    }

    // 9. Sync in-memory store and revalidate Next.js cache
    const transformedObj = transformDbEvent({ ...updatedRow, category_name: category });
    upsertInStore(transformedObj as any);
    revalidateEventCaches(updatedRow.id, updatedRow.slug);

    await createAdminNotification({
      title: "Event Updated",
      message: `Event "${updatedRow.title}" has been updated.`,
      type: "event",
      entityType: "event",
      entityId: updatedRow.id,
      linkUrl: `/admin/events/${updatedRow.id}`,
      deduplicateKey: `event_update_${updatedRow.id}_${new Date().toISOString().substring(0, 16)}`,
    });

    return NextResponse.json({
      success: true,
      updated: transformedObj,
      id: updatedRow.id,
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
        const { searchParams } = new URL(request.url);
        const forceDelete = searchParams.get("force") === "true";

        // Check foreign key relationship: registrations table
        const { count: regCount } = await supabase
          .from("registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", resolved.uuid);

        if (regCount && regCount > 0 && !forceDelete) {
          console.warn(`[DELETE BLOCKED] Event ${resolved.uuid} has ${regCount} existing registration(s).`);
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
            await supabase.from("certificates").delete().eq("event_id", resolved.uuid);
            await supabase.from("event_results").delete().eq("event_id", resolved.uuid);
            await supabase.from("competition_rounds").delete().eq("event_id", resolved.uuid);
            
            const { data: eventRegs } = await supabase
              .from("registrations")
              .select("id")
              .eq("event_id", resolved.uuid);
              
            if (eventRegs && eventRegs.length > 0) {
              const regIds = eventRegs.map((r) => r.id);
              await supabase.from("registration_payments").delete().in("registration_id", regIds);
              await supabase.from("registrations").delete().eq("event_id", resolved.uuid);
            }
          } catch (cleanupErr: any) {
            console.warn("Notice during cascading event delete cleanup:", cleanupErr.message);
          }
        }

        console.log("DELETE EVENT ID:", resolved.uuid);

        const { data: deletedRows, error: delErr } = await supabase
          .from("events")
          .delete()
          .eq("id", resolved.uuid)
          .select("id, title");

        if (delErr) {
          console.error("EVENT DELETE ERROR:", delErr);
          return NextResponse.json(
            { success: false, error: `Unable to delete event: ${delErr.message}` },
            { status: 500 }
          );
        }

        if (!deletedRows || deletedRows.length === 0) {
          console.error(`[DELETE FAILED] 0 rows deleted for event ID ${resolved.uuid}`);
          return NextResponse.json(
            {
              success: false,
              error: "No event was deleted. Check the event ID or database permissions.",
            },
            { status: 404 }
          );
        }

        console.log(`[DELETE SUCCESS] Deleted row from Supabase:`, deletedRows[0]);
        deleteFromStore(resolved.uuid);
        deleteFromStore(id);
        revalidateEventCaches(resolved.uuid, id);

        return NextResponse.json({ success: true, deletedEvent: deletedRows[0] });
      }
    }

    return NextResponse.json(
      { success: false, error: "Event not found in database." },
      { status: 404 }
    );
  } catch (err: any) {
    console.error("DELETE /api/events/[id] exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
