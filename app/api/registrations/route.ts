import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStoreEvents } from "@/lib/events-store";
import { transformDbEvent, normalizeEventIdentifier, isValidUUID } from "@/services/event.service";
import { getDefaultFormConfig } from "@/types/event-config";
import { createAdminNotification } from "@/lib/notifications";

function normalizeGender(g?: string | null): string | null {
  if (!g || typeof g !== "string") return null;
  const lower = g.trim().toLowerCase();
  if (lower === "male") return "male";
  if (lower === "female") return "female";
  if (lower === "other") return "other";
  if (lower.includes("prefer_not") || lower.includes("prefer not")) return "prefer_not_to_say";
  return null;
}

export async function POST(request: Request) {
  console.log("[REGISTRATION] API POST START (PRE-PAYMENT PENDING / CONFIRMED PIPELINE)");
  const supabase = getSupabaseAdmin();

  try {
    const body = await request.json();

    const {
      eventId,
      numParticipants = 1,
      participant: participantData,
      categoryId,
      danceStyleId,
      notes,
      videoUrl,
      videoPath,
      photoUrl,
      photoPath,
      aadhaarUrl,
      aadhaarPath,
      compType,
      category,
      paymentDetails,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      paymentStatus,
      registrationStatus,
      // Structured Fields
      participationTypeId,
      participationType: participationTypeBody,
      teamInfo,
      customFields: customFieldsBody,
      documentUrls: documentUrlsBody,
      additionalParticipants: additionalParticipantsBody,
    } = body;

    const rzpPayId = razorpayPaymentId || paymentDetails?.paymentId || paymentDetails?.razorpay_payment_id || null;
    const rzpOrderId = razorpayOrderId || paymentDetails?.orderId || paymentDetails?.razorpay_order_id || null;
    const rzpSig = razorpaySignature || paymentDetails?.signature || paymentDetails?.razorpay_signature || null;

    if (
      String(rzpOrderId || "").startsWith("order_mock_") ||
      String(rzpPayId || "").startsWith("pay_mock_") ||
      rzpSig === "mock_signature"
    ) {
      console.error("[REGISTRATION] DATABASE REJECTED: Mock payment detected", { rzpOrderId, rzpPayId });
      return NextResponse.json(
        { success: false, error: "Mock payments are strictly prohibited." },
        { status: 400 }
      );
    }

    const cleanEventId = normalizeEventIdentifier(eventId);
    if (!cleanEventId) {
      console.error("[REGISTRATION] FAILED: Missing eventId");
      return NextResponse.json({ success: false, error: "Missing required field: eventId (Event ID or Slug is required)." }, { status: 400 });
    }

    if (!participantData || !participantData.email || !participantData.fullName || !participantData.phone) {
      console.error("[REGISTRATION] FAILED: Missing participant fields");
      return NextResponse.json(
        { success: false, error: "Missing required participant fields: fullName, email, and phone are required." },
        { status: 400 }
      );
    }

    const cleanEmail = participantData.email.trim().toLowerCase();
    const cleanPhone = participantData.phone.trim();

    // -------------------------------------------------------------------------
    // 1. FETCH AUTHORITATIVE EVENT FROM SUPABASE OR STORE
    // -------------------------------------------------------------------------
    let eventRecord: any = null;
    const isUUID = isValidUUID(cleanEventId);
    const eventParamType = isUUID ? "UUID" : "slug";

    console.log(`[REGISTRATION] Requested event parameter: "${eventId}" -> clean: "${cleanEventId}" (${eventParamType})`);

    if (supabase && cleanEventId) {
      try {
        let query = supabase.from("events").select("*");
        if (isUUID) {
          query = query.eq("id", cleanEventId);
        } else {
          query = query.eq("slug", cleanEventId);
        }
        const { data, error } = await query.maybeSingle();
        if (error) {
          console.warn("Supabase event fetch notice in registration:", error.message);
        }
        if (data) {
          eventRecord = data;
        }
      } catch (err: any) {
        console.warn("Exception querying events table in registration:", err.message);
      }
    }

    if (!eventRecord && cleanEventId) {
      const storeEvents = getStoreEvents();
      eventRecord = storeEvents.find(
        (e) => String(e.id).toLowerCase() === cleanEventId.toLowerCase() || (e.slug && e.slug.toLowerCase() === cleanEventId.toLowerCase())
      );
    }

    if (!eventRecord) {
      console.error(`[REGISTRATION] FAILED: Event not found for ${eventParamType} '${cleanEventId}'`);
      return NextResponse.json({ success: false, error: `Event not found for ID/Slug: '${cleanEventId}'` }, { status: 404 });
    }

    const event = transformDbEvent(eventRecord);

    // -------------------------------------------------------------------------
    // 2. SERVER-SIDE EVENT & FORM VALIDATION
    // -------------------------------------------------------------------------
    if (!event.is_published) {
      return NextResponse.json({ success: false, error: "This event is currently unavailable for registration." }, { status: 400 });
    }

    const currentStatus = String(event.status || "").toLowerCase();
    if (
      currentStatus === "registration_closed" ||
      currentStatus === "cancelled" ||
      currentStatus === "draft" ||
      currentStatus === "completed"
    ) {
      return NextResponse.json(
        { success: false, error: `Registration for this event is closed (Status: ${event.status}).` },
        { status: 400 }
      );
    }

    if (event.registration_deadline) {
      const deadlineDate = new Date(event.registration_deadline);
      if (!isNaN(deadlineDate.getTime()) && new Date() > deadlineDate) {
        return NextResponse.json({ success: false, error: "The registration deadline for this event has passed." }, { status: 400 });
      }
    }

    if (
      event.max_participants &&
      event.current_participants !== undefined &&
      event.current_participants >= event.max_participants
    ) {
      return NextResponse.json({ success: false, error: "This event has reached maximum participant capacity." }, { status: 400 });
    }

    // Resolve Participation Type & Fee
    let parsedNotes: any = {};
    if (typeof notes === "string") {
      try { parsedNotes = JSON.parse(notes); } catch (e) {}
    } else if (typeof notes === "object" && notes !== null) {
      parsedNotes = notes;
    }

    const count = Math.max(1, parseInt(String(numParticipants), 10) || 1);
    const selectedTypeIdentifier = String(
      participationTypeId || participationTypeBody || parsedNotes.compType || compType || category || ""
    ).trim().toLowerCase();

    const formConfig = event.form_config || getDefaultFormConfig(event.category, event.registration_fee);
    const partTypes = formConfig.participationTypes || [];

    const matchedType = partTypes.find(
      (pt: any) =>
        pt.isActive !== false &&
        (String(pt.id).toLowerCase() === selectedTypeIdentifier ||
          pt.name.toLowerCase() === selectedTypeIdentifier ||
          pt.name.toLowerCase().includes(selectedTypeIdentifier) ||
          selectedTypeIdentifier.includes(pt.name.toLowerCase()))
    );

    const resolvedParticipationType = matchedType ? matchedType.name : compType || "Solo";

    let totalAmount = 0;
    if (matchedType && typeof matchedType.fee === "number") {
      totalAmount = matchedType.fee;
    } else {
      const feeRaw = typeof event.registration_fee === "number"
        ? event.registration_fee
        : parseFloat(String(event.registration_fee || (event as any).price || "0").replace(/[^0-9.]/g, "")) || 0;
      totalAmount = isNaN(feeRaw) || feeRaw < 0 ? 0 : feeRaw;
    }

    // Multi-participant & Team validation
    const isMultiParticipant = matchedType
      ? ((matchedType.maxParticipants || 1) > 1 || (matchedType.minParticipants || 1) > 1)
      : count > 1;

    const extractedTeamName =
      teamInfo?.teamName ||
      body.teamName ||
      parsedNotes?.teamInfo?.teamName;

    const extractedTeamLeader =
      teamInfo?.teamLeader ||
      body.teamLeader ||
      parsedNotes?.teamInfo?.teamLeader;

    const extractedTeamContact =
      teamInfo?.teamContact ||
      body.teamContact ||
      parsedNotes?.teamInfo?.teamContact;

    if (isMultiParticipant && (!extractedTeamName || !String(extractedTeamName).trim())) {
      return NextResponse.json(
        { success: false, error: `Team Name is required for ${resolvedParticipationType} registration.` },
        { status: 400 }
      );
    }

    // Validate Required Custom Fields
    const customFieldsObj = customFieldsBody || parsedNotes?.customFields || {};
    const requiredCustom = (formConfig.customFields || []).filter((cf: any) => cf.required);
    for (const cf of requiredCustom) {
      if (!customFieldsObj[cf.id] || !String(customFieldsObj[cf.id]).trim()) {
        return NextResponse.json(
          { success: false, error: `Required field missing: '${cf.label}'.` },
          { status: 400 }
        );
      }
    }

    // Document URLs object & robust Video URL resolution
    const docUrlsObj = documentUrlsBody || parsedNotes?.docUrls || {};

    const videoFromDocs =
      docUrlsObj.danceVideo ||
      docUrlsObj.dance_video ||
      docUrlsObj.performanceVideo ||
      docUrlsObj.video ||
      docUrlsObj.danceAuditionVideo ||
      (typeof docUrlsObj === "object" && docUrlsObj !== null
        ? Object.entries(docUrlsObj).find(([k, v]) => k.toLowerCase().includes("video") || String(v).includes("videos/"))?.[1]
        : null);

    const finalPhotoUrl = photoUrl || photoPath || participantData?.photoUrl || participantData?.photoPath || participantData?.profile_photo || null;
    const finalVideoUrl =
      videoUrl ||
      videoPath ||
      participantData?.videoUrl ||
      participantData?.videoPath ||
      parsedNotes?.videoUrl ||
      parsedNotes?.videoPath ||
      videoFromDocs ||
      null;
    const finalAadhaarUrl = aadhaarUrl || aadhaarPath || participantData?.aadhaarUrl || participantData?.aadhaarPath || null;

    if (finalPhotoUrl) docUrlsObj.photo = finalPhotoUrl;
    if (finalVideoUrl) {
      docUrlsObj.danceVideo = finalVideoUrl;
      docUrlsObj.video = finalVideoUrl;
    }
    if (finalAadhaarUrl) docUrlsObj.idProof = finalAadhaarUrl;

    const additionalPartsArr = additionalParticipantsBody || body.additionalParticipants || parsedNotes?.additionalParticipants || [];

    // Complete fallback notes object ensuring all dynamic values are preserved even if custom table columns are missing in PostgREST cache
    const fallbackNotesObj = {
      participationType: resolvedParticipationType,
      numParticipants: count,
      teamInfo: {
        teamName: extractedTeamName || null,
        teamLeader: extractedTeamLeader || null,
        teamContact: extractedTeamContact || null,
      },
      customFields: customFieldsObj,
      docUrls: docUrlsObj,
      additionalParticipants: additionalPartsArr,
      compType: resolvedParticipationType,
    };
    const notesJsonString = typeof notes === "string" ? notes : JSON.stringify(fallbackNotesObj);

    // -------------------------------------------------------------------------
    // 3. PARTICIPANT LOOKUP OR CREATION
    // -------------------------------------------------------------------------
    let participantId: string | null = null;
    let participantNumber: string | null = null;

    if (supabase) {
      let existingPart: any = null;
      try {
        const { data, error: partError } = await supabase
          .from("participants")
          .select("*")
          .or(`email.eq.${cleanEmail},phone.eq.${cleanPhone}`)
          .maybeSingle();

        if (partError) {
          console.warn("Participant lookup notice:", partError.message);
        }
        existingPart = data;
      } catch (e: any) {
        console.warn("Exception during participant lookup:", e.message);
      }

      if (existingPart) {
        participantId = existingPart.id;
        participantNumber = existingPart.participant_number;

        const updatePayload: any = {
          full_name: participantData.fullName.trim(),
          phone: cleanPhone,
          date_of_birth: participantData.dob ? participantData.dob : existingPart.date_of_birth,
          gender: normalizeGender(participantData.gender) || existingPart.gender,
          address: participantData.address || existingPart.address,
          city: participantData.city || existingPart.city,
          state: participantData.state || existingPart.state,
          pincode: participantData.pincode || existingPart.pincode,
          updated_at: new Date().toISOString(),
        };

        if (finalPhotoUrl) updatePayload.profile_photo = finalPhotoUrl;
        if (finalVideoUrl) {
          updatePayload.video_path = finalVideoUrl;
          updatePayload.video_url = finalVideoUrl;
        }

        await supabase.from("participants").update(updatePayload).eq("id", participantId);
      } else {
        const newPartNum = `CGS-P-${Math.floor(100000 + Math.random() * 900000)}`;
        const insertPartPayload: any = {
          participant_number: newPartNum,
          full_name: participantData.fullName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          date_of_birth: participantData.dob || null,
          gender: normalizeGender(participantData.gender),
          address: participantData.address || null,
          city: participantData.city || null,
          state: participantData.state || null,
          pincode: participantData.pincode || null,
          profile_photo: finalPhotoUrl || null,
          video_path: finalVideoUrl,
          video_url: finalVideoUrl,
        };

        const { data: newPart, error: createPartErr } = await supabase
          .from("participants")
          .insert(insertPartPayload)
          .select("*")
          .single();

        if (createPartErr) {
          console.error("[REGISTRATION] Participant creation error:", createPartErr.message);
          return NextResponse.json({ success: false, error: `Participant creation failed: ${createPartErr.message}` }, { status: 500 });
        }

        participantId = newPart.id;
        participantNumber = newPart.participant_number;
      }
    } else {
      participantId = `part_${Date.now()}`;
      participantNumber = `CGS-P-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    if (supabase && participantId && finalVideoUrl) {
      try {
        const fileName = finalVideoUrl.split("/").pop() || "audition-video.mp4";
        await supabase.from("participant_documents").insert({
          participant_id: participantId,
          document_type: "dance_video",
          document_url: finalVideoUrl,
          file_name: fileName,
          mime_type: "video/mp4",
        });
      } catch (docErr) {
        console.warn("Notice inserting participant_document for dance_video:", docErr);
      }
    }

    // -------------------------------------------------------------------------
    // 4. CREATE OR UPDATE REGISTRATION RECORD (WITH SCHEMA CACHE RESILIENCE)
    // -------------------------------------------------------------------------
    const isAlreadyPaid = (paymentStatus === "paid" || !!rzpPayId) && totalAmount > 0;
    const isFreeEvent = totalAmount === 0;

    const targetRegStatus = isAlreadyPaid || isFreeEvent ? (registrationStatus || "confirmed") : "payment_pending";
    const targetPayStatus = isAlreadyPaid || isFreeEvent ? (paymentStatus || "paid") : "unpaid";

    let registrationRecord: any = null;
    const nowIso = new Date().toISOString();

    if (supabase && isValidUUID(eventRecord.id) && participantId && isValidUUID(participantId)) {
      // Check if participant already has a registration row for this event
      const { data: existingRegs } = await supabase
        .from("registrations")
        .select("*")
        .eq("event_id", eventRecord.id)
        .eq("participant_id", participantId);

      const existingPendingOrActive = existingRegs?.find(
        (r) => r.registration_status !== "cancelled" && r.registration_status !== "rejected"
      );

      // Primary Payload with structured columns
      const fullPayload: any = {
        event_id: eventRecord.id,
        participant_id: participantId,
        registration_status: targetRegStatus,
        payment_status: targetPayStatus,
        amount: totalAmount,
        notes: notesJsonString,
        participation_type: resolvedParticipationType,
        team_name: extractedTeamName || null,
        team_leader: extractedTeamLeader || null,
        team_contact: extractedTeamContact || null,
        participant_count: count,
        custom_fields: customFieldsObj,
        form_config_snapshot: formConfig,
        additional_participants: additionalPartsArr,
        document_urls: docUrlsObj,
        updated_at: nowIso,
      };

      if (categoryId && isValidUUID(categoryId)) fullPayload.category_id = categoryId;
      if (danceStyleId && isValidUUID(danceStyleId)) fullPayload.dance_style_id = danceStyleId;

      // Fallback Core Payload (used if Supabase schema cache hasn't loaded new columns yet)
      const coreFallbackPayload: any = {
        event_id: eventRecord.id,
        participant_id: participantId,
        registration_status: targetRegStatus,
        payment_status: targetPayStatus,
        amount: totalAmount,
        notes: notesJsonString,
        updated_at: nowIso,
      };
      if (categoryId && isValidUUID(categoryId)) coreFallbackPayload.category_id = categoryId;
      if (danceStyleId && isValidUUID(danceStyleId)) coreFallbackPayload.dance_style_id = danceStyleId;

      if (existingPendingOrActive) {
        // Attempt update with full payload
        const { data: updatedReg, error: updateErr } = await supabase
          .from("registrations")
          .update(fullPayload)
          .eq("id", existingPendingOrActive.id)
          .select("*")
          .maybeSingle();

        if (updateErr) {
          console.warn("[REGISTRATION NOTICE] Full payload update failed (schema cache check):", updateErr.message);
          // If error is due to missing column in PostgREST schema cache, retry with core payload + notes
          if (
            updateErr.message.includes("column") ||
            updateErr.message.includes("schema cache") ||
            updateErr.message.includes("additional_participants")
          ) {
            console.log("[REGISTRATION FALLBACK] Retrying update with core columns & embedded notes JSON...");
            const { data: fbReg, error: fbErr } = await supabase
              .from("registrations")
              .update(coreFallbackPayload)
              .eq("id", existingPendingOrActive.id)
              .select("*")
              .single();

            if (fbErr) {
              console.error("[REGISTRATION] Core fallback update error:", fbErr.message);
              return NextResponse.json({ success: false, error: `Registration update failed: ${fbErr.message}` }, { status: 500 });
            }
            registrationRecord = fbReg;
          } else {
            return NextResponse.json({ success: false, error: `Registration update failed: ${updateErr.message}` }, { status: 500 });
          }
        } else {
          registrationRecord = updatedReg;
        }

        console.log(`[REGISTRATION] PENDING/UPDATED registration row ID="${registrationRecord.id}", Number="${registrationRecord.registration_number}"`);
      } else {
        // Insert new pending registration record
        const regNumber = `CGS-REG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const qrToken = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

        fullPayload.registration_number = regNumber;
        fullPayload.qr_token = qrToken;

        coreFallbackPayload.registration_number = regNumber;
        coreFallbackPayload.qr_token = qrToken;

        const { data: insertedReg, error: insertErr } = await supabase
          .from("registrations")
          .insert(fullPayload)
          .select("*")
          .maybeSingle();

        if (insertErr) {
          console.warn("[REGISTRATION NOTICE] Full payload insert failed (schema cache check):", insertErr.message);
          if (
            insertErr.message.includes("column") ||
            insertErr.message.includes("schema cache") ||
            insertErr.message.includes("additional_participants")
          ) {
            console.log("[REGISTRATION FALLBACK] Retrying insert with core columns & embedded notes JSON...");
            const { data: fbInsert, error: fbErr } = await supabase
              .from("registrations")
              .insert(coreFallbackPayload)
              .select("*")
              .single();

            if (fbErr) {
              console.error("[REGISTRATION] Core fallback insert error:", fbErr.message);
              return NextResponse.json({ success: false, error: `Registration insertion failed: ${fbErr.message}` }, { status: 500 });
            }
            registrationRecord = fbInsert;
          } else {
            return NextResponse.json({ success: false, error: `Registration insertion failed: ${insertErr.message}` }, { status: 500 });
          }
        } else {
          registrationRecord = insertedReg;
        }

        console.log(`[REGISTRATION] NEW PENDING registration created ID="${registrationRecord.id}", Number="${registrationRecord.registration_number}"`);
      }

      // Record payment transaction if payment details present
      if (rzpOrderId || rzpPayId) {
        try {
          await supabase.from("registration_payments").upsert({
            registration_id: registrationRecord.id,
            razorpay_order_id: rzpOrderId,
            razorpay_payment_id: rzpPayId,
            razorpay_signature: rzpSig,
            amount: totalAmount,
            currency: "INR",
            status: targetPayStatus === "paid" ? "paid" : "created",
            paid_at: targetPayStatus === "paid" ? nowIso : null,
          }, { onConflict: "razorpay_order_id" });
        } catch (payErr) {
          console.warn("Notice updating registration_payments:", payErr);
        }
      }
    } else {
      registrationRecord = {
        id: `reg_${Date.now()}`,
        registration_number: `CGS-REG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        event_id: eventRecord.id,
        participant_id: participantId,
        amount: totalAmount,
        registration_status: targetRegStatus,
        payment_status: targetPayStatus,
        participation_type: resolvedParticipationType,
        team_name: extractedTeamName,
        participant_count: count,
      };
    }

    // Trigger Admin System Notification
    await createAdminNotification({
      title: "New Participant Registration",
      message: `${participantData.fullName} registered for "${event.title}" (${resolvedParticipationType})`,
      type: "registration",
      entityType: "registration",
      entityId: registrationRecord.id,
      linkUrl: `/admin/participants?id=${registrationRecord.participant_id}`,
      deduplicateKey: `reg_create_${registrationRecord.id}`,
      metadata: {
        registration_number: registrationRecord.registration_number,
        participant_name: participantData.fullName,
        event_title: event.title,
        amount: totalAmount,
      },
    });

    return NextResponse.json({
      success: true,
      pending: targetRegStatus === "payment_pending",
      confirmed: targetRegStatus === "confirmed",
      registrationId: registrationRecord.id,
      registrationNumber: registrationRecord.registration_number,
      participantNumber: participantNumber,
      amount: totalAmount,
      currency: "INR",
      participationType: resolvedParticipationType,
      teamName: extractedTeamName || null,
      participantCount: count,
    });
  } catch (err: any) {
    console.error("[REGISTRATION] API POST EXCEPTION:", err);
    await createAdminNotification({
      title: "Registration Error",
      message: `Participant registration error: ${err.message || "Unknown error"}`,
      type: "system",
      linkUrl: "/admin/dashboard",
      deduplicateKey: `err_reg_${Date.now()}`,
    });
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}

async function resolveStorageSignedUrl(supabase: any, rawPathOrUrl: string | null): Promise<string | null> {
  if (!rawPathOrUrl || typeof rawPathOrUrl !== "string") return null;
  const trimmed = rawPathOrUrl.trim();
  if (!trimmed) return null;

  if (trimmed.includes("youtube.com") || trimmed.includes("youtu.be") || trimmed.includes("vimeo.com") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  let cleanPath = trimmed;
  let bucket = "participant-documents";

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const storageMatch = trimmed.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/);
    if (storageMatch) {
      bucket = storageMatch[1];
      cleanPath = storageMatch[2].split("?")[0];
    } else {
      return trimmed;
    }
  }

  cleanPath = cleanPath.replace(/^\/+/, "");
  if (cleanPath.startsWith("dance-videos/")) {
    bucket = "dance-videos";
    cleanPath = cleanPath.replace(/^dance-videos\//, "");
  } else if (cleanPath.startsWith("participant-documents/")) {
    bucket = "participant-documents";
    cleanPath = cleanPath.replace(/^participant-documents\//, "");
  } else if (cleanPath.endsWith(".mp4") || cleanPath.endsWith(".mov") || cleanPath.endsWith(".avi") || cleanPath.endsWith(".webm") || cleanPath.includes("videos/")) {
    bucket = "dance-videos";
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(cleanPath, 86400);
    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
    const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
    return pubData?.publicUrl || trimmed;
  } catch (e) {
    return trimmed;
  }
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Database connection unavailable." }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageParam = parseInt(searchParams.get("page") || "0", 10);
    const limitParam = parseInt(searchParams.get("limit") || "0", 10);
    const statusParam = searchParams.get("status");
    const eventIdParam = searchParams.get("eventId") || searchParams.get("event_id");

    // Try full select query with structured columns first
    let query = supabase
      .from("registrations")
      .select(`
        id, registration_number, event_id, participant_id, category_id, dance_style_id,
        registration_status, payment_status, registration_date, amount, notes, qr_token,
        participation_type, team_name, team_leader, participant_count, custom_fields, additional_participants, document_urls,
        created_at, updated_at,
        events ( id, title, slug, venue, city, state, event_date, registration_fee ),
        participants ( id, participant_number, full_name, email, phone, city, state, video_path, video_url ),
        event_categories ( id, name ),
        dance_styles ( id, name ),
        registration_payments ( id, razorpay_order_id, razorpay_payment_id, status, paid_at, amount )
      `, pageParam > 0 && limitParam > 0 ? { count: "exact" } : undefined);

    if (eventIdParam && eventIdParam !== "all") {
      query = query.eq("event_id", eventIdParam);
    }

    if (statusParam && statusParam !== "all") {
      query = query.eq("registration_status", statusParam);
    }

    query = query.order("created_at", { ascending: false });

    if (pageParam > 0 && limitParam > 0) {
      const from = (pageParam - 1) * limitParam;
      const to = from + limitParam - 1;
      query = query.range(from, to);
    }

    let { data: registrations, count, error } = await query;

    // Fallback GET query if new columns are not yet in PostgREST schema cache
    if (error && (error.message.includes("column") || error.message.includes("schema cache"))) {
      console.warn("[GET /api/registrations] Full select failed due to schema cache. Retrying with core columns fallback...");
      let fbQuery = supabase
        .from("registrations")
        .select(`
          id, registration_number, event_id, participant_id, category_id, dance_style_id,
          registration_status, payment_status, registration_date, amount, notes, qr_token,
          created_at, updated_at,
          events ( id, title, slug, venue, city, state, event_date, registration_fee ),
          participants ( id, participant_number, full_name, email, phone, city, state, video_path, video_url ),
          event_categories ( id, name ),
          dance_styles ( id, name ),
          registration_payments ( id, razorpay_order_id, razorpay_payment_id, status, paid_at, amount )
        `, pageParam > 0 && limitParam > 0 ? { count: "exact" } : undefined);

      if (statusParam && statusParam !== "all") {
        fbQuery = fbQuery.eq("registration_status", statusParam);
      }
      fbQuery = fbQuery.order("created_at", { ascending: false });
      if (pageParam > 0 && limitParam > 0) {
        const from = (pageParam - 1) * limitParam;
        const to = from + limitParam - 1;
        fbQuery = fbQuery.range(from, to);
      }

      const fbRes = await fbQuery;
      registrations = fbRes.data as any;
      count = fbRes.count;
      error = fbRes.error;
    }

    if (error) {
      console.error("GET /api/registrations error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formattedRegistrations = await Promise.all(
      (registrations || []).map(async (reg: any) => {
        let parsedNotes: any = {};
        if (reg.notes) {
          try {
            parsedNotes = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes;
          } catch {
            parsedNotes = {};
          }
        }

        const resolvedParticipationType =
          reg.participation_type ||
          parsedNotes.participationType ||
          parsedNotes.participation_type ||
          parsedNotes.compType ||
          "Solo";

        const resolvedTeamName =
          reg.team_name ||
          parsedNotes.teamInfo?.teamName ||
          parsedNotes.teamName ||
          null;

        const rawDocumentUrls = {
          ...(reg.document_urls || {}),
          ...(parsedNotes.docUrls || {}),
          ...(parsedNotes.documentUrls || {}),
        };

        const rawIdProofUrl =
          reg.id_proof_url ||
          reg.participants?.id_proof_url ||
          reg.participants?.id_proof ||
          rawDocumentUrls.idProof ||
          rawDocumentUrls.id_proof ||
          rawDocumentUrls.idProofUrl ||
          rawDocumentUrls.id_proof_url ||
          rawDocumentUrls.aadhaar ||
          rawDocumentUrls.aadhaar_card ||
          rawDocumentUrls.aadhaarFile ||
          rawDocumentUrls.identity_proof ||
          parsedNotes.idProof ||
          parsedNotes.id_proof ||
          parsedNotes.idProofPath ||
          parsedNotes.id_proof_url ||
          parsedNotes.idProofUrl ||
          parsedNotes.aadhaarFile ||
          parsedNotes.aadhaar ||
          parsedNotes.aadhaar_card ||
          null;

        const rawPhotoUrl =
          rawDocumentUrls.photo ||
          rawDocumentUrls.profile_photo ||
          rawDocumentUrls.passportPhoto ||
          rawDocumentUrls.passport_photo ||
          parsedNotes.photo ||
          parsedNotes.passportPhoto ||
          parsedNotes.photoUrl ||
          reg.participants?.photo_url ||
          null;

        const rawVideoUrl =
          reg.participants?.video_url ||
          reg.participants?.video_path ||
          rawDocumentUrls.danceVideo ||
          rawDocumentUrls.dance_video ||
          rawDocumentUrls.performanceVideo ||
          rawDocumentUrls.video ||
          parsedNotes.videoUrl ||
          parsedNotes.videoPath ||
          null;

        const signedIdProofUrl = await resolveStorageSignedUrl(supabase, rawIdProofUrl);
        const signedPhotoUrl = await resolveStorageSignedUrl(supabase, rawPhotoUrl);
        const signedVideoUrl = await resolveStorageSignedUrl(supabase, rawVideoUrl);

        const resolvedDocumentUrls: Record<string, string> = {};
        for (const k of Object.keys(rawDocumentUrls)) {
          const val = rawDocumentUrls[k];
          if (typeof val === "string" && val.trim()) {
            resolvedDocumentUrls[k] = (await resolveStorageSignedUrl(supabase, val)) || val;
          }
        }

        if (signedIdProofUrl) {
          resolvedDocumentUrls.idProof = signedIdProofUrl;
          resolvedDocumentUrls.id_proof = signedIdProofUrl;
        }
        if (signedPhotoUrl) {
          resolvedDocumentUrls.photo = signedPhotoUrl;
          resolvedDocumentUrls.passportPhoto = signedPhotoUrl;
        }
        if (signedVideoUrl) {
          resolvedDocumentUrls.danceVideo = signedVideoUrl;
          resolvedDocumentUrls.video = signedVideoUrl;
        }

        return {
          ...reg,
          participation_type: resolvedParticipationType,
          team_name: resolvedTeamName,
          participant_count: reg.participant_count || parsedNotes.numParticipants || 1,
          document_urls: resolvedDocumentUrls,
          id_proof_url: signedIdProofUrl || rawIdProofUrl,
          photo_url: signedPhotoUrl || rawPhotoUrl,
          video_url: signedVideoUrl || rawVideoUrl,
          custom_fields: reg.custom_fields || parsedNotes.customFields || {},
          additional_participants: reg.additional_participants || parsedNotes.additionalParticipants || [],
        };
      })
    );

    return NextResponse.json({
      success: true,
      registrations: formattedRegistrations,
      total: count !== null ? count : (formattedRegistrations ? formattedRegistrations.length : 0),
      page: pageParam || 1,
      totalPages: limitParam > 0 && count ? Math.ceil(count / limitParam) : 1,
    });
  } catch (err: any) {
    console.error("GET /api/registrations exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch registrations." }, { status: 500 });
  }
}
