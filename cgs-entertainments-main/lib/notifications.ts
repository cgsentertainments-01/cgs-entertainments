import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminNotificationType =
  | "registration"
  | "payment"
  | "payment_failed"
  | "event"
  | "certificate"
  | "certificate_error"
  | "verification"
  | "system"
  | "contact";

export interface CreateNotificationParams {
  title: string;
  message: string;
  type?: AdminNotificationType;
  entityType?: string;
  entityId?: string;
  linkUrl?: string;
  recipientId?: string;
  deduplicateKey?: string;
  metadata?: Record<string, any>;
}

/**
 * Creates an admin system notification safely and idempotently.
 * Never throws exceptions to caller so main database transactions remain uninterrupted.
 */
export async function createAdminNotification(params: CreateNotificationParams) {
  const {
    title,
    message,
    type = "system",
    entityType,
    entityId,
    linkUrl,
    recipientId,
    deduplicateKey,
    metadata = {},
  } = params;

  if (!title || !message) {
    console.warn("[AdminNotification] Missing required title or message.");
    return null;
  }

  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.warn("[AdminNotification] Database connection unavailable.");
      return null;
    }

    // Deduplication check if deduplicateKey is provided
    if (deduplicateKey) {
      try {
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("deduplicate_key", deduplicateKey)
          .maybeSingle();

        if (existing) {
          console.log(`[AdminNotification] Skipped duplicate notification (Key: ${deduplicateKey})`);
          return existing;
        }
      } catch (dedupErr) {
        // Table column might be missing if migration not run yet, proceed to insert
      }
    }

    const payload: Record<string, any> = {
      title,
      message,
      notification_type: type,
      reference_type: entityType || null,
      entity_type: entityType || null,
      reference_id: entityId || null,
      entity_id: entityId || null,
      link_url: linkUrl || null,
      admin_id: recipientId || null,
      recipient_id: recipientId || null,
      deduplicate_key: deduplicateKey || null,
      metadata: metadata,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from("notifications")
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) {
      // If error caused by new schema columns, fallback to core table columns
      if (
        error.message.includes("column") ||
        error.message.includes("schema cache")
      ) {
        const corePayload = {
          title,
          message,
          notification_type: type,
          reference_type: entityType || null,
          reference_id: entityId || null,
          admin_id: recipientId || null,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        const { data: fallbackInserted, error: fallbackErr } = await supabase
          .from("notifications")
          .insert([corePayload])
          .select()
          .maybeSingle();

        if (fallbackErr) {
          console.warn("[AdminNotification] Fallback insert failed:", fallbackErr.message);
          return null;
        }
        return fallbackInserted;
      }

      console.warn("[AdminNotification] Insert warning:", error.message);
      return null;
    }

    console.log(`[AdminNotification] Notification created: "${title}" (Type: ${type})`);
    return inserted;
  } catch (err: any) {
    console.error("[AdminNotification] Unexpected error:", err.message || err);
    return null;
  }
}
