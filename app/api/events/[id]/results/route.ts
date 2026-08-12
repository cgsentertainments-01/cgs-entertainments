import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verifyAdminApi } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    if (!eventId) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: true, results: [] });
    }

    let results: any[] = [];
    const { data: dbResults, error } = await supabase
      .from("event_results")
      .select("*")
      .eq("event_id", eventId)
      .order("position", { ascending: true });

    if (!error && dbResults && dbResults.length > 0) {
      results = dbResults;
    } else {
      // Resilient fallback to registrations notes
      const { data: regs } = await supabase
        .from("registrations")
        .select("*")
        .eq("event_id", eventId);

      if (regs) {
        regs.forEach((r) => {
          let parsedNotes: any = {};
          if (r.notes) {
            try {
              parsedNotes = typeof r.notes === "string" ? JSON.parse(r.notes) : r.notes;
            } catch {}
          }
          if (parsedNotes.result) {
            results.push({
              id: parsedNotes.result.id || r.id,
              event_id: eventId,
              participant_id: r.participant_id,
              registration_id: r.id,
              result_type: parsedNotes.result.result_type || "pending",
              position: parsedNotes.result.position || 99,
              selected_at: parsedNotes.result.selected_at || r.updated_at,
              notes: parsedNotes.result.notes || null,
            });
          }
        });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("GET /api/events/[id]/results exception:", err);
    return NextResponse.json({ success: false, error: err.message, results: [] }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error || "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;
    if (!eventId) {
      return NextResponse.json({ success: false, error: "Missing event ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      participant_id,
      registration_id,
      result_type, // 'winner' | 'runner_up' | 'finalist' | 'special_mention' | 'participant' | 'pending'
      position,
      notes,
      notify = false,
      send_email = false,
    } = body;

    if (!participant_id || !result_type) {
      return NextResponse.json(
        { success: false, error: "participant_id and result_type are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: "Supabase connection unavailable" },
        { status: 500 }
      );
    }

    // 1. Fetch event title
    const { data: eventData } = await supabase
      .from("events")
      .select("id, title")
      .eq("id", eventId)
      .maybeSingle();

    const eventTitle = eventData?.title || "CGS Talent Event";

    // 2. Fetch participant details (name, email)
    const { data: participantData } = await supabase
      .from("participants")
      .select("id, full_name, email, phone")
      .eq("id", participant_id)
      .maybeSingle();

    const participantName = participantData?.full_name || "Participant";
    const participantEmail = participantData?.email || "";

    // 3. Find matching auth user if any
    let authUserId: string | null = null;
    if (participantEmail) {
      try {
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const matched = authUsers?.users?.find(
          (u) => u.email?.toLowerCase() === participantEmail.toLowerCase()
        );
        if (matched) {
          authUserId = matched.id;
        }
      } catch (e) {
        const { data: authUser } = await supabase
          .from("admins")
          .select("auth_user_id")
          .ilike("email", participantEmail)
          .maybeSingle();
        if (authUser?.auth_user_id) {
          authUserId = authUser.auth_user_id;
        }
      }
    }

    // Determine position ranking default if not passed
    let rankPos = position;
    if (!rankPos) {
      switch (result_type) {
        case "winner":
          rankPos = 1;
          break;
        case "runner_up":
          rankPos = 2;
          break;
        case "finalist":
          rankPos = 3;
          break;
        case "special_mention":
          rankPos = 4;
          break;
        case "participant":
          rankPos = 5;
          break;
        default:
          rankPos = 99;
      }
    }

    // 4. Save result into event_results with registration notes fallback
    const payload: any = {
      event_id: eventId,
      participant_id,
      registration_id: registration_id || null,
      result_type,
      position: rankPos,
      selected_by: authCheck.admin?.id || null,
      selected_at: new Date().toISOString(),
      notify_sent: Boolean(notify),
      notes: notes || null,
      updated_at: new Date().toISOString(),
    };

    let savedResult: any = null;
    const { data: dbSaved, error: saveErr } = await supabase
      .from("event_results")
      .upsert(payload, { onConflict: "event_id,participant_id" })
      .select()
      .single();

    if (!saveErr && dbSaved) {
      savedResult = dbSaved;
    } else {
      // Fallback: save inside registration notes
      const { data: reg } = await supabase
        .from("registrations")
        .select("*")
        .eq("event_id", eventId)
        .eq("participant_id", participant_id)
        .maybeSingle();

      let notesObj: any = {};
      if (reg?.notes) {
        try {
          notesObj = typeof reg.notes === "string" ? JSON.parse(reg.notes) : reg.notes;
        } catch {}
      }

      savedResult = {
        id: reg?.id || participant_id,
        event_id: eventId,
        participant_id,
        registration_id: reg?.id || registration_id || null,
        result_type,
        position: rankPos,
        selected_by: authCheck.admin?.id || null,
        selected_at: new Date().toISOString(),
        notify_sent: Boolean(notify),
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      notesObj.result = savedResult;

      if (reg) {
        await supabase
          .from("registrations")
          .update({ notes: JSON.stringify(notesObj), updated_at: new Date().toISOString() })
          .eq("id", reg.id);
      }
    }

    // 5. Send Notification if requested (Do NOT notify for pending)
    let notificationRecord = null;
    if (notify && result_type !== "pending") {
      const resultTitleMap: Record<string, string> = {
        winner: "🏆 Congratulations!",
        runner_up: "🥈 Congratulations!",
        finalist: "🥉 Congratulations!",
        special_mention: "⭐ Special Recognition",
        participant: "Event Participation Completed 🎓",
      };

      const resultMsgMap: Record<string, string> = {
        winner: `You have been selected as the Winner of ${eventTitle}.`,
        runner_up: `You have been selected as the Runner-up of ${eventTitle}.`,
        finalist: `You have been selected as a Finalist for ${eventTitle}.`,
        special_mention: `You have received a Special Mention in ${eventTitle}.`,
        participant: `Thank you for participating in ${eventTitle}.`,
      };

      const notifTitle = resultTitleMap[result_type] || `Result Announcement: ${eventTitle}`;
      const notifMsg = resultMsgMap[result_type] || `Your result for ${eventTitle} has been updated to ${result_type}.`;

      // Check for existing unread result notification for duplicate prevention
      const { data: existingNotifs } = await supabase
        .from("notifications")
        .select("*")
        .eq("reference_type", "event_result")
        .eq("reference_id", participant_id)
        .eq("is_read", false);

      const notifPayload = {
        title: notifTitle,
        message: notifMsg,
        notification_type: "system",
        reference_type: "event_result",
        reference_id: participant_id,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      if (existingNotifs && existingNotifs.length > 0) {
        // Update existing notification to prevent duplicate entries
        const { data: updatedNotif } = await supabase
          .from("notifications")
          .update({
            title: notifTitle,
            message: notifMsg,
            created_at: new Date().toISOString(),
          })
          .eq("id", existingNotifs[0].id)
          .select()
          .single();
        notificationRecord = updatedNotif;
      } else {
        // Insert new notification
        const { data: notifData } = await supabase
          .from("notifications")
          .insert([notifPayload])
          .select()
          .single();

        notificationRecord = notifData;
      }
    }

    // 6. Log email if requested
    if (send_email && participantEmail) {
      try {
        await supabase.from("email_logs").insert([
          {
            recipient_email: participantEmail,
            recipient_name: participantName,
            email_type: "result_notification",
            subject: `Result Announcement: ${eventTitle}`,
            status: "pending",
            sent_at: new Date().toISOString(),
          },
        ]);
      } catch (e) {
        console.warn("Email log insertion error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Result saved successfully",
      result: savedResult,
      notification: notificationRecord,
    });
  } catch (err: any) {
    console.error("POST /api/events/[id]/results exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
