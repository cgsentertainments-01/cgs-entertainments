import { revalidatePath, revalidateTag } from "next/cache";
import { EventFormConfig } from "@/types/event-config";

export interface DBEvent {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  category?: string;
  dance_style_id?: string;
  dance_style_name?: string;
  dance_style?: string;
  badge?: string;
  badgeBg?: string;
  event_date: string;
  date?: string;
  event_start_time?: string;
  event_end_date?: string;
  event_end_time?: string;
  registration_start_date?: string;
  registration_deadline?: string;
  timezone?: string;
  venue: string;
  address?: string;
  city: string;
  state: string;
  pincode?: string;
  location?: string;
  google_maps_url?: string;
  latitude?: string;
  longitude?: string;
  banner_image?: string;
  mobile_banner_image?: string;
  thumbnail_image?: string;
  img?: string;
  banner_url?: string;
  registration_required?: boolean;
  registration_fee: number;
  max_participants?: number;
  current_participants?: number;
  min_age?: number;
  max_age?: number;
  registration_type?: string;
  max_team_size?: number;
  allow_multiple_categories?: boolean;
  registration_form_type?: string;
  participation_categories?: string[];
  dance_styles?: string[];
  rules_regulations?: string;
  terms_conditions?: string;
  required_documents?: string[];
  payment_required?: boolean;
  currency?: string;
  refund_policy?: string;
  payment_deadline?: string;
  schedule?: any[];
  judges?: any[];
  contact_info?: any;
  seo?: any;
  homepage_settings?: any;
  form_config?: EventFormConfig;
  status: string;
  event_type?: 'published' | 'upcoming';
  is_featured?: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

// Supabase is the single source of truth for events.
// Process-local store is retired to prevent split-brain state in serverless runtimes.
export function getStoreEvents(): DBEvent[] {
  return [];
}

// Deprecated no-ops retained for backwards compatibility
export function insertInStore(_event: DBEvent) {
  // No-op: Supabase PostgreSQL is the sole authoritative data store
}

export function upsertInStore(_event: DBEvent) {
  // No-op: Supabase PostgreSQL is the sole authoritative data store
}

export function deleteFromStore(_id: string) {
  // No-op: Supabase PostgreSQL is the sole authoritative data store
}

export function revalidateEventCaches(id?: string, slug?: string) {
  try {
    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/admin/events");
    revalidatePath("/events/[slug]", "page");
    revalidatePath("/register/[eventId]", "page");
    if (slug) {
      revalidatePath(`/events/${slug}`);
      revalidatePath(`/register/${slug}`);
    }
    if (id) {
      revalidatePath(`/register/${id}`);
      revalidatePath(`/events/${id}`);
      revalidatePath(`/admin/events/${id}/edit`);
    }
    revalidateTag("events");
    if (id) revalidateTag(`event:${id}`);
    if (slug) revalidateTag(`event:${slug}`);
  } catch (err) {
    console.warn("Revalidation warning:", err);
  }
}
