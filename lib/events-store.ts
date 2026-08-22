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
  is_featured?: boolean;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

let serverEventsStore: DBEvent[] = [];

export function getStoreEvents(): DBEvent[] {
  return serverEventsStore;
}

// For CREATE operations: ALWAYS insert as a new item in the memory store
export function insertInStore(event: DBEvent) {
  // Remove any stale item matching the exact ID only
  serverEventsStore = serverEventsStore.filter(
    (e) => String(e.id) !== String(event.id)
  );
  serverEventsStore.unshift(event);
}

// For EDIT operations: Update existing item by ID or slug
export function upsertInStore(event: DBEvent) {
  const index = serverEventsStore.findIndex(
    (e) => String(e.id) === String(event.id) || (e.slug && event.slug && e.slug === event.slug)
  );
  if (index >= 0) {
    serverEventsStore[index] = { ...serverEventsStore[index], ...event };
  } else {
    serverEventsStore.unshift(event);
  }
}

export function deleteFromStore(id: string) {
  serverEventsStore = serverEventsStore.filter(
    (e) => String(e.id) !== String(id) && e.slug !== id
  );
}

export function revalidateEventCaches(id?: string, slug?: string) {
  try {
    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/events/[slug]", "page");
    revalidatePath("/register/[eventId]", "page");
    if (slug) {
      revalidatePath(`/events/${slug}`);
      revalidatePath(`/register/${slug}`);
    }
    if (id) {
      revalidatePath(`/register/${id}`);
      revalidatePath(`/events/${id}`);
    }
    revalidateTag("events");
    if (id) revalidateTag(`event:${id}`);
    if (slug) revalidateTag(`event:${slug}`);
  } catch (err) {
    console.warn("Revalidation warning:", err);
  }
}
