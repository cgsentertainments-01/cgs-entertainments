export type BannerPlacement = 'hero' | 'event' | 'promotional' | 'announcement';

export type BannerDerivedStatus = 'active' | 'scheduled' | 'expired' | 'inactive' | 'draft';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  link_url?: string | null;
  button_text?: string | null;
  banner_type: BannerPlacement;
  display_order: number;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  target_blank?: boolean;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BannerFormData {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  mobile_image_url: string;
  link_url: string;
  button_text: string;
  banner_type: BannerPlacement;
  display_order: number;
  is_active: boolean;
  start_date: string; // ISO or datetime-local string YYYY-MM-DDTHH:mm
  end_date: string;   // ISO or datetime-local string YYYY-MM-DDTHH:mm
  target_blank: boolean;
}

export interface BannerStats {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
  inactive: number;
  draft: number;
}

export interface BannerFilterState {
  search: string;
  status: 'all' | BannerDerivedStatus;
  placement: 'all' | BannerPlacement;
}
