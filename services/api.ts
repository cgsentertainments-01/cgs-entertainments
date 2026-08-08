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
    button_url: "/events",
    event_date: "20 - 22 March, 2026",
    location: "Hyderabad, Telangana",
    desktop_image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1920&q=80",
    status: "active",
    priority: 1,
  },
  {
    id: "banner-2",
    title: "NATIONAL MODELING LEAGUE",
    subtitle: "CGS ENTERTAINMENTS",
    description: "Walk the Ramp of Excellence & Glamour",
    button_text: "Explore Events",
    button_url: "/categories",
    event_date: "15 - 18 April, 2026",
    location: "Bangalore, Karnataka",
    desktop_image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80",
    status: "active",
    priority: 2,
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

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "National Dance Championship",
    slug: "national-dance-championship",
    banner_url: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80",
    event_date: "25 May 2026",
    location: "Hyderabad",
    category_name: "DANCE",
    registration_fee: 499,
    status: "published",
  },
  {
    id: "evt-2",
    title: "Elite Modeling Show",
    slug: "elite-modeling-show",
    banner_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    event_date: "10 June 2026",
    location: "Bangalore",
    category_name: "MODELING",
    registration_fee: 799,
    status: "published",
  },
  {
    id: "evt-3",
    title: "Acting Excellence Awards",
    slug: "acting-excellence-awards",
    banner_url: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80",
    event_date: "18 June 2026",
    location: "Chennai",
    category_name: "ACTING",
    registration_fee: 399,
    status: "published",
  },
  {
    id: "evt-4",
    title: "Voice of India 2026",
    slug: "voice-of-india-2026",
    banner_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    event_date: "30 June 2026",
    location: "Mumbai",
    category_name: "SINGING",
    registration_fee: 599,
    status: "published",
  },
];

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

// API Functions
export async function getBanners(): Promise<Banner[]> {
  if (!isSupabaseConfigured()) return MOCK_BANNERS;
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("status", "active")
      .order("priority", { ascending: true });

    if (error || !data || data.length === 0) return MOCK_BANNERS;
    return data as Banner[];
  } catch {
    return MOCK_BANNERS;
  }
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
  if (!isSupabaseConfigured()) return MOCK_EVENTS;
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return MOCK_EVENTS;
    return data as Event[];
  } catch {
    return MOCK_EVENTS;
  }
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
