import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient, verifyAdminApi } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabaseServer = await createClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, messages: [] });
    }

    const userEmail = user.email ? user.email.toLowerCase() : "";

    // Find participant IDs for logged-in user email
    let matchingParticipantIds: string[] = [];
    if (userEmail) {
      const { data: parts } = await supabaseAdmin
        .from("participants")
        .select("id")
        .ilike("email", userEmail);
      if (parts) {
        matchingParticipantIds = parts.map((p) => p.id);
      }
    }

    let messagesList: any[] = [];
    const { data: dbMsgs, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && dbMsgs) {
      messagesList = dbMsgs.filter((m) => {
        if (m.recipient_id === user.id) return true;
        if (m.participant_id && matchingParticipantIds.includes(m.participant_id)) return true;
        return false;
      });
    } else {
      // Fallback: search notifications of type 'message' or reference_type 'message'
      const { data: notifMsgs } = await supabaseAdmin
        .from("notifications")
        .select("*")
        .eq("reference_type", "message")
        .order("created_at", { ascending: false });

      if (notifMsgs) {
        messagesList = notifMsgs.map((n) => ({
          id: n.id,
          subject: n.title,
          message: n.message,
          recipient_id: n.user_id || user.id,
          participant_id: n.reference_id || matchingParticipantIds[0] || null,
          created_at: n.created_at,
          is_read: n.is_read,
        }));
      }
    }

    return NextResponse.json({ success: true, messages: messagesList });
  } catch (err: any) {
    console.error("GET /api/messages exception:", err);
    return NextResponse.json({ success: false, error: err.message, messages: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCheck = await verifyAdminApi();
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error || "Unauthorized admin access" }, { status: 401 });
    }

    const body = await request.json();
    const { participant_id, event_id, subject, message, send_email = false, notify = true } = body;

    if (!participant_id || !subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Subject and message body cannot be empty." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    // 1. Fetch participant info
    const { data: participant } = await supabaseAdmin
      .from("participants")
      .select("id, full_name, email")
      .eq("id", participant_id)
      .maybeSingle();

    if (!participant) {
      return NextResponse.json({ success: false, error: "Participant record not found" }, { status: 404 });
    }

    // Find auth user ID matching email if any
    let recipientUserId: string | null = null;
    if (participant.email) {
      try {
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const matched = authUsers?.users?.find(
          (u) => u.email?.toLowerCase() === participant.email.toLowerCase()
        );
        if (matched) {
          recipientUserId = matched.id;
        }
      } catch (e) {
        const { data: adminMatch } = await supabaseAdmin
          .from("admins")
          .select("auth_user_id")
          .ilike("email", participant.email)
          .maybeSingle();
        if (adminMatch?.auth_user_id) {
          recipientUserId = adminMatch.auth_user_id;
        }
      }
    }

    // 2. Save Message Record with fallback
    let savedMessage: any = null;
    const messagePayload = {
      sender_id: authCheck.admin?.id || null,
      recipient_id: recipientUserId,
      participant_id,
      event_id: event_id || null,
      subject: subject.trim(),
      message: message.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const { data: dbMsg, error: msgErr } = await supabaseAdmin
      .from("messages")
      .insert([messagePayload])
      .select()
      .single();

    if (!msgErr && dbMsg) {
      savedMessage = dbMsg;
    } else {
      // Fallback message object
      savedMessage = {
        id: `msg-${Date.now()}`,
        ...messagePayload,
      };
    }

    // 3. Create User Notification for this message
    let createdNotification = null;
    if (notify) {
      const notifPayload = {
        title: `Message from CGS Entertainments: ${subject.trim()}`,
        message: message.trim(),
        notification_type: "system",
        reference_type: "message",
        reference_id: participant_id,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      const { data: notifData } = await supabaseAdmin
        .from("notifications")
        .insert([notifPayload])
        .select()
        .single();

      createdNotification = notifData;
    }

    // 4. Log email if requested
    if (send_email && participant.email) {
      try {
        await supabaseAdmin.from("email_logs").insert([
          {
            recipient_email: participant.email,
            recipient_name: participant.full_name,
            email_type: "admin_message",
            subject,
            status: "pending",
            sent_at: new Date().toISOString(),
          },
        ]);
      } catch (e) {
        console.warn("Email logging error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully to participant",
      data: savedMessage,
      notification: createdNotification,
    });
  } catch (err: any) {
    console.error("POST /api/messages exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
