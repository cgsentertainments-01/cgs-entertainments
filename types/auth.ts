import { User, Session } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
};

export type AdminProfile = {
  id: string;
  auth_user_id?: string;
  name: string;
  email: string;
  phone?: string;
  role: "super_admin" | "admin" | "manager" | string;
  avatar?: string;
  is_active: boolean;
  last_login?: string;
};

export type AuthContextType = {
  user: User | null;
  adminProfile: AdminProfile | null;
  isAdmin: boolean;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null; adminCode?: "ok" | "not_found" | "inactive" }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: Error | null }>;
  refreshAdminProfile: () => Promise<AdminProfile | null>;
};

