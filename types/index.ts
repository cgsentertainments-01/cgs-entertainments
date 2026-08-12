export * from "./banner";


export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string; // Lucide icon identifier or SVG
  color: string; // gradient color or hex
  display_order: number;
  image_url?: string;
  status: 'active' | 'hidden';
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  banner_url: string;
  event_date: string;
  location: string;
  category_name: string;
  registration_fee: number;
  currency?: string;
  status: 'published' | 'draft' | 'closed';
  seats_available?: number;
  age_group?: string;
  description?: string;
  rules?: string[];
  schedule?: { time: string; activity: string }[];
  highlights?: string[];
  is_featured?: boolean;
}

export interface StatItem {
  id: string;
  label: string;
  count: number;
  suffix: string;
  icon_name: string;
}

export interface WebsiteSettings {
  site_name: string;
  logo_url: string;
  tagline: string;
  contact_email: string;
  phone: string;
  address: string;
  social_links: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
}

export interface NewsletterSubscription {
  id?: string;
  email: string;
  created_at?: string;
}
