"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AuthContextType } from "@/types/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Single stable Supabase client instance
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const storedAdmin = typeof window !== "undefined" ? sessionStorage.getItem("cgs_admin_session") : null;
        if (storedAdmin === "true") {
          const adminUser = {
            id: "cgs-admin-user",
            email: "cgsentertainments01@gmail.com",
            user_metadata: { full_name: "Admin CGS" },
            app_metadata: { provider: "email" },
            aud: "authenticated",
            role: "authenticated",
            created_at: new Date().toISOString(),
          } as unknown as User;
          setUser(adminUser);
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error("Error fetching initial session:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Listen to Auth state changes cleanly without triggering page re-fetches
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      const storedAdmin = typeof window !== "undefined" ? sessionStorage.getItem("cgs_admin_session") : null;
      if (storedAdmin === "true") {
        const adminUser = {
          id: "cgs-admin-user",
          email: "cgsentertainments01@gmail.com",
          user_metadata: { full_name: "Admin CGS" },
          app_metadata: { provider: "email" },
          aud: "authenticated",
          role: "authenticated",
          created_at: new Date().toISOString(),
        } as unknown as User;
        setUser(adminUser);
      } else {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

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

  // Email Sign In
  const signInWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === "cgsentertainments01@gmail.com" && password === "Cgsentertainments@88112") {
      const adminUser = {
        id: "cgs-admin-user",
        email: "cgsentertainments01@gmail.com",
        user_metadata: { full_name: "Admin CGS" },
        app_metadata: { provider: "email" },
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
      } as unknown as User;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("cgs_admin_session", "true");
        document.cookie = "cgs_admin_auth=true; path=/; max-age=86400;";
      }

      setUser(adminUser);

      try {
        await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      } catch (e) {
        // Ignore Supabase error if admin credentials match
      }

      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
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
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("cgs_admin_session");
      document.cookie = "cgs_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push("/");
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPasswordForEmail,
        updatePassword,
        resendConfirmationEmail,
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
