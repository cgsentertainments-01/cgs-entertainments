"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AuthContextType, AdminProfile } from "@/types/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Single stable Supabase client instance
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  // Helper to fetch matching admin profile from public.admins
  const fetchAdminProfile = useCallback(
    async (authUser: User | null): Promise<AdminProfile | null> => {
      if (!authUser) {
        setAdminProfile(null);
        return null;
      }

      try {
        const { data, error } = await supabase
          .from("admins")
          .select("*")
          .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id},email.eq.${authUser.email}`)
          .maybeSingle();

        if (error) {
          console.warn("Notice: Querying public.admins profile:", error.message);
        }

        if (data) {
          const profile: AdminProfile = {
            id: data.id,
            auth_user_id: data.auth_user_id,
            name: data.name || authUser.user_metadata?.full_name || authUser.email || "Admin",
            email: data.email || authUser.email || "",
            phone: data.phone,
            role: data.role || "admin",
            avatar: data.avatar || authUser.user_metadata?.avatar_url,
            is_active: Boolean(data.is_active),
            last_login: data.last_login,
          };
          setAdminProfile(profile);
          return profile;
        } else {
          setAdminProfile(null);
          return null;
        }
      } catch (err) {
        console.error("Failed to fetch admin profile:", err);
        setAdminProfile(null);
        return null;
      }
    },
    [supabase]
  );

  const refreshAdminProfile = useCallback(async () => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    return await fetchAdminProfile(currentUser);
  }, [supabase, fetchAdminProfile]);

  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await fetchAdminProfile(initialSession.user);
        } else {
          setAdminProfile(null);
        }
      } catch (err) {
        console.error("Error fetching initial session:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Listen to Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      const authUser = currentSession?.user ?? null;
      setUser(authUser);

      if (authUser) {
        await fetchAdminProfile(authUser);
      } else {
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchAdminProfile]);

  // Google OAuth Trigger
  const signInWithGoogle = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  // Email Sign In with Supabase Auth + Admin Authorization
  const signInWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Supabase Authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData.user) {
      return { error: authError || new Error("Authentication failed."), adminCode: undefined };
    }

    // 2. Query public.admins profile
    const profile = await fetchAdminProfile(authData.user);

    if (!profile) {
      return {
        error: new Error("Your account is authenticated but is not authorized as an administrator. Please contact the system administrator."),
        adminCode: "not_found" as const,
      };
    }

    if (!profile.is_active) {
      return {
        error: new Error("Your admin account is inactive. Please contact the system administrator."),
        adminCode: "inactive" as const,
      };
    }

    // Update last_login timestamp in background if column exists
    try {
      await supabase
        .from("admins")
        .update({ last_login: new Date().toISOString() })
        .eq("id", profile.id);
    } catch {
      // Ignore background timestamp update error
    }

    return { error: null, adminCode: "ok" as const };
  };

  // Email Sign Up
  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || "",
        },
      },
    });

    return { error };
  };

  // Sign Out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAdminProfile(null);
    router.push("/admin/login");
  };

  // Reset Password for Email
  const resetPasswordForEmail = async (email: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });
    return { error };
  };

  // Update Password
  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  // Resend Email Confirmation Link
  const resendConfirmationEmail = async (email: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${origin}/`,
      },
    });
    return { error };
  };

  const isAdmin = Boolean(user && adminProfile && adminProfile.is_active === true);

  return (
    <AuthContext.Provider
      value={{
        user,
        adminProfile,
        isAdmin,
        session,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        resendConfirmationEmail,
        refreshAdminProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

