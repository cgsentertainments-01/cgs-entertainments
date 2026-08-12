import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Banner, Category, Event, StatItem, WebsiteSettings } from "@/types";

// Fallback Mock Data matching Reference Design EXACTLY
export const MOCK_BANNERS: Banner[] = [
  {
    id: "banner-1",
    title: "DANCE COMPETITION 2026",
    subtitle: "CGS ENTERTAINMENTS",
    description: "Show Your Talent. Shine On Stage. Be A Star!",
    button_text: "Register Now",
    link_url: "/events",
    image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1920&q=80",
    banner_type: "hero",
    is_active: true,
    display_order: 1,
  },
  {
    id: "banner-2",
    title: "NATIONAL MODELING LEAGUE",
    subtitle: "CGS ENTERTAINMENTS",
    description: "Walk the Ramp of Excellence & Glamour",
    button_text: "Explore Events",
    link_url: "/categories",
    image_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80",
    banner_type: "hero",
    is_active: true,
    display_order: 2,
  },
];


export const MOCK_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Dance",
    slug: "dance",
    description: "Explore Dance Competitions",
    icon_name: "Footprints",
    color: "from-purple-600 to-indigo-600",
    display_order: 1,
    status: "active",
  },
  {
    id: "cat-2",
    name: "Modeling",
    slug: "modeling",
    description: "Showcase Your Modeling Skills",
    icon_name: "Sparkles",
    color: "from-blue-500 to-cyan-500",
    display_order: 2,
    status: "active",
  },
  {
    id: "cat-3",
    name: "Acting",
    slug: "acting",
    description: "Drama, Theatre & Performances",
    icon_name: "Theater",
    color: "from-amber-500 to-orange-500",
    display_order: 3,
    status: "active",
  },
  {
    id: "cat-4",
    name: "Singing",
    slug: "singing",
    description: "Solo & Group Singing Events",
    icon_name: "Mic",
    color: "from-pink-500 to-rose-500",
    display_order: 4,
    status: "active",
  },
  {
    id: "cat-5",
    name: "Music",
    slug: "music",
    description: "Instrumental & Band Performances",
    icon_name: "Music",
    color: "from-emerald-500 to-teal-500",
    display_order: 5,
    status: "active",
  },
  {
    id: "cat-6",
    name: "Photography",
    slug: "photography",
    description: "Capture Moments, Win Rewards",
    icon_name: "Camera",
    color: "from-orange-500 to-red-500",
    display_order: 6,
    status: "active",
  },
  {
    id: "cat-7",
    name: "More",
    slug: "more",
    description: "Many More Categories",
    icon_name: "MoreHorizontal",
    color: "from-purple-500 to-pink-500",
    display_order: 7,
    status: "active",
  },
];

export const MOCK_EVENTS: Event[] = [];

export const MOCK_STATS: StatItem[] = [
  { id: "s1", label: "Events Organized", count: 150, suffix: "+", icon_name: "Trophy" },
  { id: "s2", label: "Participants", count: 25, suffix: "K+", icon_name: "Users" },
  { id: "s3", label: "Certificates Issued", count: 20, suffix: "K+", icon_name: "Award" },
  { id: "s4", label: "Cities Covered", count: 10, suffix: "+", icon_name: "MapPin" },
];

export const MOCK_SETTINGS: WebsiteSettings = {
  site_name: "CGS Entertainments",
  logo_url: "/images/logo.png",
  tagline: "Show Your Talent. Shine On Stage. Be A Star!",
  contact_email: "contact@cgsentertainments.com",
  phone: "+91 98765 43210",
  address: "Hyderabad, Telangana, India",
  social_links: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    twitter: "https://twitter.com",
  },
};

export async function getBanners(): Promise<Banner[]> {
  try {
    const res = await fetch("/api/banners?mode=public", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.banners && data.banners.length > 0) {
        return data.banners as Banner[];
      }
    }
  } catch {
    // Fallback to direct client query if fetch fails
  }

  if (isSupabaseConfigured()) {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .or(`start_date.is.null,start_date.lte.${nowIso}`)
        .or(`end_date.is.null,end_date.gte.${nowIso}`)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Banner[];
      }
    } catch {
      // Fallback to MOCK_BANNERS if error
    }
  }

  return MOCK_BANNERS;
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return MOCK_CATEGORIES;
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("status", "active")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) return MOCK_CATEGORIES;
    return data as Category[];
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function getEvents(): Promise<Event[]> {
  try {
    const res = await fetch("/api/events?upcoming=true", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return (data.events || []) as Event[];
    }
  } catch {
    // Return empty array if error occurs - no hardcoded fallback
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_published", true)
        .order("event_date", { ascending: true });

      if (!error && data) return data as Event[];
    } catch {
      // Return empty array
    }
  }

  return [];
}

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  if (!isSupabaseConfigured()) return MOCK_SETTINGS;
  try {
    const { data, error } = await supabase
      .from("website_settings")
      .select("*")
      .single();

    if (error || !data) return MOCK_SETTINGS;
    return data as WebsiteSettings;
  } catch {
    return MOCK_SETTINGS;
  }
}

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true, message: "Thank you for subscribing!" };
  }
  try {
    const { error } = await supabase.from("newsletter_subscriptions").insert([{ email }]);
    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "This email is already subscribed." };
      }
      return { success: false, message: "Failed to subscribe. Please try again." };
    }
    return { success: true, message: "Successfully subscribed to newsletter!" };
  } catch {
    return { success: false, message: "An error occurred. Please try again." };
  }
}
