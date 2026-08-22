import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { EventFormConfig, getDefaultFormConfig } from "@/types/event-config";

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  category?: string;
  category_id?: string;
  dance_style?: string;
  dance_style_id?: string;
  badge?: string;
  badgeBg?: string;
  date?: string;
  rawDate?: string;
  event_date?: string;
  event_start_time?: string;
  event_end_date?: string;
  event_end_time?: string;
  registration_start_date?: string;
  registration_deadline?: string;
  timezone?: string;
  venue?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  location?: string;
  google_maps_url?: string;
  banner_image?: string;
  mobile_banner_image?: string;
  thumbnail_image?: string;
  img?: string;
  banner_url?: string;
  registration_required?: boolean;
  registration_fee: number;
  registrationFee?: number;
  max_participants?: number;
  maxSeats?: number;
  current_participants?: number;
  participantsCount?: number;
  min_age?: number;
  max_age?: number;
  registration_type?: string;
  max_team_size?: number;
  allow_multiple_categories?: boolean;
  registration_form_type?: string;
  participation_categories?: string[];
  dance_styles?: string[];
  rules_regulations?: string;
  rules?: string;
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

// Transform raw Supabase event record to standard UI Event format
export function transformDbEvent(evt: any): EventItem {
  const categoryName = evt.category_name || evt.category || evt.event_categories?.name || "DANCE";

  const getBadgeStyle = (cat: string) => {
    const catUpper = (cat || "DANCE").toUpperCase();
    switch (catUpper) {
      case "DANCE": return { badge: "DANCE", badgeBg: "#312E81" };
      case "MODELING": return { badge: "MODELING", badgeBg: "#1D4ED8" };
      case "ACTING": return { badge: "ACTING", badgeBg: "#78350F" };
      case "SINGING": return { badge: "SINGING", badgeBg: "#9D174D" };
      case "MUSIC": return { badge: "MUSIC", badgeBg: "#065F46" };
      case "PHOTOGRAPHY":
      case "PHOTO": return { badge: "PHOTO", badgeBg: "#92400E" };
      case "TECHNOLOGY":
      case "TECH": return { badge: "TECHNOLOGY", badgeBg: "#1E40AF" };
      case "CODING": return { badge: "CODING", badgeBg: "#047857" };
      case "DESIGN": return { badge: "DESIGN", badgeBg: "#B45309" };
      case "CAREER": return { badge: "CAREER", badgeBg: "#6B21A8" };
      default: return { badge: catUpper, badgeBg: "#6D28D9" };
    }
  };

  const { badge, badgeBg } = getBadgeStyle(categoryName);

  const rawImg =
    evt.banner_image ||
    evt.banner_url ||
    evt.thumbnail_image ||
    evt.img ||
    "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=85";

  const rawDate = evt.event_date || evt.date || new Date().toISOString();
  
  let formattedDate = rawDate;
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = d.toLocaleString("en-US", { month: "long" });
      const year = d.getFullYear();
      formattedDate = `${day} ${month} ${year}`;
    }
  } catch {
    // Keep rawDate
  }

  const feeNum = typeof evt.registration_fee === "number"
    ? evt.registration_fee
    : typeof evt.registrationFee === "number"
      ? evt.registrationFee
      : parseFloat(String(evt.registration_fee || evt.registrationFee || evt.price || "0").replace(/[^0-9.]/g, "")) || 0;

  const loc =
    evt.location ||
    (evt.venue && evt.city ? `${evt.venue}, ${evt.city}` : evt.city || evt.venue || "Hyderabad");

  const rulesText = evt.rules_regulations || evt.rules || evt.terms_conditions || "";

  let parsedFormConfig: EventFormConfig | undefined = undefined;
  if (evt.form_config) {
    if (typeof evt.form_config === "string") {
      try {
        parsedFormConfig = JSON.parse(evt.form_config);
      } catch (e) {
        parsedFormConfig = undefined;
      }
    } else if (typeof evt.form_config === "object") {
      parsedFormConfig = evt.form_config;
    }
  }
  if (!parsedFormConfig || !parsedFormConfig.participationTypes || parsedFormConfig.participationTypes.length === 0) {
    parsedFormConfig = getDefaultFormConfig(categoryName);
  }

  return {
    id: String(evt.id),
    title: evt.title || "",
    slug: evt.slug || evt.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || String(evt.id),
    short_description: evt.short_description || evt.title || "",
    description: evt.description || evt.short_description || "",
    category: categoryName,
    category_id: evt.category_id || "",
    dance_style: evt.dance_style || evt.dance_style_name || "",
    dance_style_id: evt.dance_style_id || "",
    badge,
    badgeBg,
    date: formattedDate,
    rawDate: rawDate,
    event_date: rawDate,
    event_start_time: evt.event_start_time || "10:00 AM",
    event_end_date: evt.event_end_date || "",
    event_end_time: evt.event_end_time || "08:00 PM",
    registration_start_date: evt.registration_start_date || "",
    registration_deadline: evt.registration_deadline || "",
    timezone: evt.timezone || "Asia/Kolkata (IST)",
    location: loc,
    venue: evt.venue || evt.city || "Venue TBA",
    address: evt.address || "",
    city: evt.city || "Hyderabad",
    state: evt.state || "Telangana",
    pincode: evt.pincode || "500001",
    google_maps_url: evt.google_maps_url || "",
    img: rawImg,
    banner_url: rawImg,
    banner_image: rawImg,
    mobile_banner_image: evt.mobile_banner_image || rawImg,
    thumbnail_image: evt.thumbnail_image || rawImg,
    registration_required: evt.registration_required !== undefined ? Boolean(evt.registration_required) : true,
    registrationFee: feeNum,
    registration_fee: feeNum,
    maxSeats: evt.max_participants || evt.maxSeats || 500,
    max_participants: evt.max_participants || evt.maxSeats || 500,
    current_participants: evt.current_participants || evt.participantsCount || 0,
    participantsCount: evt.current_participants || evt.participantsCount || 0,
    min_age: evt.min_age || 5,
    max_age: evt.max_age || 60,
    registration_type: evt.registration_type || "individual",
    max_team_size: evt.max_team_size || 10,
    allow_multiple_categories: Boolean(evt.allow_multiple_categories),
    registration_form_type: evt.registration_form_type || "standard",
    participation_categories: evt.participation_categories || ["Solo", "Duo", "Group"],
    dance_styles: evt.dance_styles || ["Classical", "Hip Hop", "Western"],
    rules_regulations: rulesText,
    rules: rulesText,
    terms_conditions: evt.terms_conditions || rulesText,
    required_documents: evt.required_documents || ["Profile Photo", "ID Proof", "Dance Video"],
    payment_required: evt.payment_required !== undefined ? Boolean(evt.payment_required) : true,
    currency: evt.currency || "INR",
    refund_policy: evt.refund_policy || "Registration fee is non-refundable.",
    payment_deadline: evt.payment_deadline || "",
    schedule: evt.schedule || [],
    judges: evt.judges || [],
    contact_info: evt.contact_info || { name: "CGS Event Team", phone: "+91 98765 43210", email: "cgsentertainments01@gmail.com" },
    seo: evt.seo || { title: evt.title, description: evt.short_description || evt.title },
    homepage_settings: evt.homepage_settings || { show_on_homepage: true, is_featured: Boolean(evt.is_featured) },
    form_config: parsedFormConfig,
    status: evt.status || "registration_open",
    is_featured: Boolean(evt.is_featured),
    is_published: evt.is_published !== undefined ? Boolean(evt.is_published) : true,
    created_at: evt.created_at,
    updated_at: evt.updated_at,
  };
}

// Primary Event Service API
export async function getUpcomingEvents(limit = 8): Promise<EventItem[]> {
  try {
    const res = await fetch(`/api/events?upcoming=true&limit=${limit}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return (data.events || []).map(transformDbEvent);
    }
  } catch (err) {
    console.error("Error fetching upcoming events:", err);
  }
  return [];
}

export async function getPublishedEvents(): Promise<EventItem[]> {
  try {
    const res = await fetch("/api/events?upcoming=true", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return (data.events || []).map(transformDbEvent);
    }
  } catch (err) {
    console.error("Error fetching published events:", err);
  }
  return [];
}

export async function getAllEvents(): Promise<EventItem[]> {
  try {
    const res = await fetch("/api/events?all=true", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return (data.events || []).map(transformDbEvent);
    }
  } catch (err) {
    console.error("Error fetching all events:", err);
  }
  return [];
}

export async function getEventByIdOrSlug(identifier: string): Promise<EventItem | null> {
  if (!identifier) return null;
  try {
    const res = await fetch(`/api/events?slug=${encodeURIComponent(identifier)}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.event) return transformDbEvent(data.event);
    }
  } catch (err) {
    console.error("Error fetching event by identifier:", err);
  }
  return null;
}

export async function createEvent(eventData: any): Promise<{ success: boolean; event?: EventItem; error?: string }> {
  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, event: transformDbEvent(data.event) };
    }
    return { success: false, error: data.error || "Failed to create event" };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create event" };
  }
}

export async function updateEvent(id: string, eventData: any): Promise<{ success: boolean; updated?: any; error?: string }> {
  try {
    const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, updated: data.updated };
    }
    return { success: false, error: data.error || "Failed to update event" };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update event" };
  }
}

export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || "Failed to delete event" };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete event" };
  }
}
