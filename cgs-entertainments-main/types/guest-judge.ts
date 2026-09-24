export type GuestJudgeRole = "Guest" | "Judge" | "Chief Guest";

export interface SocialLinks {
  instagram?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  website?: string;
}

export interface GuestJudge {
  id: string;
  name: string;
  role: GuestJudgeRole;
  designation?: string | null;
  organization?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  social_links: SocialLinks;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GuestJudgeFormData {
  name: string;
  role: GuestJudgeRole;
  designation?: string;
  organization?: string;
  bio?: string;
  photo_url?: string;
  social_links?: SocialLinks;
  display_order: number;
  is_active: boolean;
}

export interface GuestJudgeFilterState {
  search: string;
  role: "all" | GuestJudgeRole;
  status: "all" | "active" | "inactive";
}

export interface GuestJudgeStats {
  total: number;
  judges: number;
  guests: number;
  chiefGuests: number;
  active: number;
  inactive: number;
}
