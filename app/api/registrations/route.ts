import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStoreEvents } from "@/lib/events-store";
import { transformDbEvent } from "@/services/event.service";
import { getDefaultFormConfig } from "@/types/event-config";

function normalizeGender(g?: string | null): string | null {
  if (!g || typeof g !== "string") return null;
  const lower = g.trim().toLowerCase();
  if (lower === "male") return "male";
  if (lower === "female") return "female";
  if (lower === "other") return "other";
  if (lower.includes("prefer_not") || lower.includes("prefer not")) return "prefer_not_to_say";
  return null;
}

// Helper to validate UUIDs
function isValidUUID(uuid: string) {
  if (!uuid || typeof uuid !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

export async function POST(request: Request) {
  console.log("[REGISTRATION] DATABASE INSERT START");
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
    } = body;

    const rzpPayId = razorpayPaymentId || paymentDetails?.paymentId || paymentDetails?.razorpay_payment_id || null;
    const rzpOrderId = razorpayOrderId || paymentDetails?.orderId || paymentDetails?.razorpay_order_id || null;
    const rzpSig = razorpaySignature || paymentDetails?.signature || paymentDetails?.razorpay_signature || null;

    if (
      String(rzpOrderId || "").startsWith("order_mock_") ||
      String(rzpPayId || "").startsWith("pay_mock_") ||
      rzpSig === "mock_signature"
    ) {
      console.error("[REGISTRATION] DATABASE INSERT REJECTED: Mock payment detected", { rzpOrderId, rzpPayId });
      return NextResponse.json(
        { success: false, error: "Mock payments are strictly prohibited." },
        { status: 400 }
      );
    }

    const isPaid = paymentStatus === "paid" || !!rzpPayId;

    const finalVideoUrl = videoUrl || videoPath || participantData?.videoUrl || participantData?.videoPath || null;
    const finalPhotoUrl = photoUrl || photoPath || participantData?.photoUrl || participantData?.photoPath || participantData?.profile_photo || null;
    const finalAadhaarUrl = aadhaarUrl || aadhaarPath || participantData?.aadhaarUrl || participantData?.aadhaarPath || null;

    if (!eventId) {
      console.error("[REGISTRATION] DATABASE INSERT FAILED: Missing eventId");
      return NextResponse.json({ success: false, error: "Missing required field: eventId (Event ID or Slug is required)." }, { status: 400 });
    }

    if (!participantData || !participantData.email || !participantData.fullName || !participantData.phone) {
      console.error("[REGISTRATION] DATABASE INSERT FAILED: Missing participant fields");
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

    if (supabase) {
      try {
        let query = supabase.from("events").select("*");
        if (isValidUUID(eventId)) {
          query = query.or(`id.eq.${eventId},slug.eq.${eventId}`);
        } else {
          query = query.eq("slug", eventId);
        }
        const { data, error } = await query.maybeSingle();

        if (error) {
          console.warn("Supabase event fetch warning:", error.message);
        }
        if (data) {
          eventRecord = data;
        }
      } catch (err: any) {
        console.warn("Exception querying events table:", err.message);
      }
    }

    // Fallback to memory store if DB record not found or seed event
    if (!eventRecord) {
      const storeEvents = getStoreEvents();
      eventRecord = storeEvents.find(
        (e) => String(e.id) === String(eventId) || e.slug === eventId
      );
    }

    if (!eventRecord) {
      console.error(`[REGISTRATION] DATABASE INSERT FAILED: Event not found for '${eventId}'`);
      return NextResponse.json({ success: false, error: `Event not found for ID/Slug: '${eventId}'` }, { status: 404 });
    }

    const event = transformDbEvent(eventRecord);

    // -------------------------------------------------------------------------
    // 2. SERVER-SIDE EVENT VALIDATION
    // -------------------------------------------------------------------------
    if (!event.is_published) {
      console.error("[REGISTRATION] DATABASE INSERT FAILED: Event unavailable");
      return NextResponse.json(
        { success: false, error: "This event is currently unavailable for registration." },
        { status: 400 }
      );
    }

    const currentStatus = String(event.status || "").toLowerCase();
    if (
      currentStatus === "registration_closed" ||
      currentStatus === "cancelled" ||
      currentStatus === "draft" ||
      currentStatus === "completed"
    ) {
      console.error(`[REGISTRATION] DATABASE INSERT FAILED: Event registration closed (Status: ${event.status})`);
      return NextResponse.json(
        { success: false, error: `Registration for this event is closed (Status: ${event.status}).` },
        { status: 400 }
      );
    }

    if (event.registration_deadline) {
      const deadlineDate = new Date(event.registration_deadline);
      if (!isNaN(deadlineDate.getTime()) && new Date() > deadlineDate) {
        console.error("[REGISTRATION] DATABASE INSERT FAILED: Registration deadline passed");
        return NextResponse.json(
          { success: false, error: "The registration deadline for this event has passed." },
          { status: 400 }
        );
      }
    }

    if (
      event.max_participants &&
      event.current_participants !== undefined &&
      event.current_participants >= event.max_participants
    ) {
      console.error("[REGISTRATION] DATABASE INSERT FAILED: Maximum participant capacity reached");
      return NextResponse.json(
        { success: false, error: "This event has reached maximum participant capacity." },
        { status: 400 }
      );
    }

    // Authoritative Amount Calculation based on Event Form Configuration
    let parsedNotes: any = {};
    if (typeof notes === "string") {
      try { parsedNotes = JSON.parse(notes); } catch (e) {}
    } else if (typeof notes === "object" && notes !== null) {
      parsedNotes = notes;
    }

    const count = Math.max(1, parseInt(String(numParticipants), 10) || 1);
    const selectedParticipationIdentifier = String(body.participationTypeId || parsedNotes.compType || compType || category || "").trim().toLowerCase();
    const formConfig = event.form_config || getDefaultFormConfig(event.category);
    const partTypes = formConfig.participationTypes || [];

    const matchedType = partTypes.find(
      (pt: any) =>
        pt.isActive !== false &&
        (String(pt.id).toLowerCase() === selectedParticipationIdentifier ||
          pt.name.toLowerCase() === selectedParticipationIdentifier ||
          pt.name.toLowerCase().includes(selectedParticipationIdentifier) ||
          selectedParticipationIdentifier.includes(pt.name.toLowerCase()))
    );

    let totalAmount = 0;
    if (matchedType) {
      totalAmount = matchedType.fee;
    } else {
      const feeRaw = typeof event.registration_fee === "number"
        ? event.registration_fee
        : typeof event.registrationFee === "number"
          ? event.registrationFee
          : parseFloat(String(event.registration_fee || event.registrationFee || (event as any).price || "0").replace(/[^0-9.]/g, "")) || 0;
      totalAmount = isNaN(feeRaw) || feeRaw < 0 ? 0 : feeRaw;
    }

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
          console.warn("Participant lookup error:", partError.message);
        }
        existingPart = data;
      } catch (e: any) {
        console.warn("Exception during participant lookup:", e.message);
      }

      if (existingPart) {
        participantId = existingPart.id;
        participantNumber = existingPart.participant_number;

        // Update profile details & profile_photo
        const updatePayload: any = {
          full_name: participantData.fullName.trim(),
          phone: cleanPhone,
          date_of_birth: participantData.dob || existingPart.date_of_birth,
          gender: normalizeGender(participantData.gender) || existingPart.gender,
          address: participantData.address || existingPart.address,
          city: participantData.city || existingPart.city,
          state: participantData.state || existingPart.state,
          pincode: participantData.pincode || existingPart.pincode,
          emergency_contact_name: participantData.emergencyName || existingPart.emergency_contact_name,
          emergency_contact_phone: participantData.emergencyMobile || existingPart.emergency_contact_phone,
          emergency_contact_relation: participantData.emergencyRelation || existingPart.emergency_contact_relation,
          updated_at: new Date().toISOString(),
        };

        if (finalPhotoUrl) {
          updatePayload.profile_photo = finalPhotoUrl;
        }

        if (finalVideoUrl) {
          updatePayload.video_path = finalVideoUrl;
          updatePayload.video_url = finalVideoUrl;
        }

        const { error: updatePartErr } = await supabase
          .from("participants")
          .update(updatePayload)
          .eq("id", participantId);

        if (updatePartErr) {
          console.warn("Notice updating participant record:", updatePartErr.message);
        }
      } else {
        // Create new participant record
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
          emergency_contact_name: participantData.emergencyName || null,
          emergency_contact_phone: participantData.emergencyMobile || null,
          emergency_contact_relation: participantData.emergencyRelation || null,
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
          console.error("[REGISTRATION] DATABASE INSERT FAILED: Participant creation failed", createPartErr.message);
          return NextResponse.json({ success: false, error: `Participant creation failed: ${createPartErr.message}` }, { status: 500 });
        }

        participantId = newPart.id;
        participantNumber = newPart.participant_number;
      }

      // Save document records in participant_documents
      if (participantId && isValidUUID(participantId)) {
        if (finalPhotoUrl) {
          try {
            await supabase.from("participant_documents").insert({
              participant_id: participantId,
              document_type: "participant_photo",
              document_url: finalPhotoUrl,
              file_name: "passport_photo",
              verification_status: "pending",
            });
          } catch (docErr) {
            console.warn("Photo document insertion notice:", docErr);
          }
        }
        if (finalAadhaarUrl) {
          try {
            await supabase.from("participant_documents").insert({
              participant_id: participantId,
              document_type: "id_proof",
              document_url: finalAadhaarUrl,
              file_name: "aadhaar_card",
              verification_status: "pending",
            });
          } catch (docErr) {
            console.warn("Aadhaar document insertion notice:", docErr);
          }
        }
        if (finalVideoUrl) {
          try {
            await supabase.from("participant_documents").insert({
              participant_id: participantId,
              document_type: "dance_video",
              document_url: finalVideoUrl,
              file_name: "audition_video",
              verification_status: "pending",
            });
          } catch (docErr) {
            console.warn("Video document insertion notice:", docErr);
          }
        }
      }
    } else {
      participantId = `part_${Date.now()}`;
      participantNumber = `CGS-P-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // -------------------------------------------------------------------------
    // 4. DUPLICATE REGISTRATION CHECK / UPDATE
    // -------------------------------------------------------------------------
    if (supabase && participantId && isValidUUID(eventRecord.id)) {
      try {
        const { data: existingRegs } = await supabase
          .from("registrations")
          .select("*")
          .eq("event_id", eventRecord.id)
          .eq("participant_id", participantId);

        const activeReg = existingRegs?.find(
          (r) => r.registration_status !== "cancelled" && r.registration_status !== "rejected"
        );

        if (activeReg) {
          // Update registration if active
          const nowIso = new Date().toISOString();
          const updateRegData: any = {
            updated_at: nowIso,
          };

          if (isPaid) {
            updateRegData.registration_status = registrationStatus || "confirmed";
            updateRegData.payment_status = paymentStatus || "paid";
          }

          await supabase.from("registrations").update(updateRegData).eq("id", activeReg.id);

          if (isPaid && rzpOrderId) {
            try {
              await supabase.from("registration_payments").upsert({
                registration_id: activeReg.id,
                razorpay_order_id: rzpOrderId,
                razorpay_payment_id: rzpPayId,
                razorpay_signature: rzpSig,
                amount: totalAmount,
                currency: "INR",
                status: "paid",
                paid_at: nowIso,
              }, { onConflict: "razorpay_order_id" });
            } catch (pErr) {
              console.warn("Payment upsert notice:", pErr);
            }
          }

          console.log("[REGISTRATION] DATABASE INSERT SUCCESS (Existing Updated)", { registrationId: activeReg.id });
          return NextResponse.json({
            success: true,
            confirmed: true,
            alreadyRegistered: true,
            registrationId: activeReg.id,
            registrationNumber: activeReg.registration_number,
            participantNumber: participantNumber,
            amount: activeReg.amount || totalAmount,
            currency: "INR",
            razorpayOrderId: rzpOrderId,
            videoPath: finalVideoUrl,
            videoUrl: finalVideoUrl,
            message: "Registration & audition video updated successfully!",
          });
        }
      } catch (dupErr: any) {
        console.warn("Notice checking duplicate registration:", dupErr.message);
      }
    }

    // -------------------------------------------------------------------------
    // 5. CREATE REGISTRATION RECORD (INSERT)
    // -------------------------------------------------------------------------
    const regNumber = `CGS-REG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const qrToken = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    const initialRegStatus = isPaid || totalAmount === 0 ? (registrationStatus || "confirmed") : "payment_pending";
    const initialPaymentStatus = isPaid || totalAmount === 0 ? (paymentStatus || "paid") : "unpaid";

    let registrationRecord: any = null;
    const nowIso = new Date().toISOString();

    if (supabase && isValidUUID(eventRecord.id) && participantId && isValidUUID(participantId)) {
      const insertPayload: any = {
        event_id: eventRecord.id,
        participant_id: participantId,
        registration_number: regNumber,
        registration_status: initialRegStatus,
        payment_status: initialPaymentStatus,
        amount: totalAmount,
        qr_token: qrToken,
        notes: typeof notes === "string" ? notes : JSON.stringify({ ...participantData, numParticipants: count }),
      };

      if (categoryId && isValidUUID(categoryId)) insertPayload.category_id = categoryId;
      if (danceStyleId && isValidUUID(danceStyleId)) insertPayload.dance_style_id = danceStyleId;

      const { data: createdReg, error: regError } = await supabase
        .from("registrations")
        .insert(insertPayload)
        .select("*")
        .single();

      if (regError) {
        console.error("[REGISTRATION] DATABASE INSERT FAILED: Registration insert failed", regError.message);
        return NextResponse.json(
          { success: false, error: `Registration creation failed: ${regError.message}` },
          { status: 500 }
        );
      }

      registrationRecord = createdReg;

      // Insert into registration_payments if payment details provided
      if (rzpOrderId || rzpPayId) {
        try {
          await supabase.from("registration_payments").insert({
            registration_id: createdReg.id,
            razorpay_order_id: rzpOrderId,
            razorpay_payment_id: rzpPayId,
            razorpay_signature: rzpSig,
            amount: totalAmount,
            currency: "INR",
            status: isPaid ? "paid" : "created",
            paid_at: isPaid ? nowIso : null,
          });
        } catch (payInsErr) {
          console.warn("Notice inserting registration_payments:", payInsErr);
        }

        try {
          await supabase.from("payment_transactions").insert({
            registration_id: createdReg.id,
            transaction_type: "payment",
            amount: totalAmount,
            currency: "INR",
            gateway: "Razorpay",
            gateway_transaction_id: rzpPayId || rzpOrderId,
            status: "success",
            gateway_response: { rzpOrderId, rzpPayId, verified_at: nowIso },
            processed_at: nowIso,
          });
        } catch (txInsErr) {
          console.warn("Notice inserting payment_transactions:", txInsErr);
        }
      }

      // Update event participant count asynchronously if available
      try {
        const { data: countData } = await supabase
          .from("registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", eventRecord.id)
          .eq("registration_status", "confirmed");

        if (countData !== null) {
          await supabase
            .from("events")
            .update({ current_participants: countData })
            .eq("id", eventRecord.id);
        }
      } catch (countErr) {
        console.warn("Notice updating event participant count:", countErr);
      }
    } else {
      registrationRecord = {
        id: `reg_${Date.now()}`,
        registration_number: regNumber,
        event_id: eventRecord.id,
        participant_id: participantId,
        amount: totalAmount,
        registration_status: initialRegStatus,
        payment_status: initialPaymentStatus,
      };
    }

    console.log("[REGISTRATION] DATABASE INSERT SUCCESS", { registrationId: registrationRecord.id, registrationNumber: regNumber });

    return NextResponse.json({
      success: true,
      confirmed: initialRegStatus === "confirmed",
      registrationId: registrationRecord.id,
      registrationNumber: regNumber,
      participantNumber: participantNumber,
      amount: totalAmount,
      currency: "INR",
      razorpayOrderId: rzpOrderId,
      videoPath: finalVideoUrl,
      videoUrl: finalVideoUrl,
    });
  } catch (err: any) {
    console.error("[REGISTRATION] DATABASE INSERT FAILED:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ success: false, error: "Database connection unavailable." }, { status: 500 });
  }

  try {
    const { data: registrations, error } = await supabase
      .from("registrations")
      .select(`
        *,
        events ( id, title, slug, venue, city, state, event_date, registration_fee ),
        participants ( id, participant_number, full_name, email, phone, city, state ),
        event_categories ( id, name ),
        dance_styles ( id, name ),
        registration_payments ( id, razorpay_order_id, razorpay_payment_id, status, paid_at, amount )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/registrations error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, registrations: registrations || [] });
  } catch (err: any) {
    console.error("GET /api/registrations exception:", err);
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch registrations." }, { status: 500 });
  }
}

