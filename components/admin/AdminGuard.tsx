"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, adminProfile, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdminPath = pathname?.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && isAdminPath && !isLoginPage) {
      if (!user || !isAdmin) {
        router.push("/admin/login");
      }
    }
  }, [user, isAdmin, loading, pathname, isAdminPath, isLoginPage, router]);

  // If on login page, render children directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading spinner while checking auth session & admin profile
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#090314",
          color: "#fff",
          gap: 16,
        }}
      >
        <Loader2 size={40} color="#7C3AED" className="animate-spin" />
        <div style={{ fontSize: 14, fontWeight: 700, color: "#C4B5FD", letterSpacing: 0.5 }}>
          Verifying Admin Credentials &amp; Permissions...
        </div>
      </div>
    );
  }

  // Handle case where user is logged into Supabase Auth but not an authorized admin or inactive
  if (!user || !isAdmin) {
    const isInactive = adminProfile && adminProfile.is_active === false;

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#090314",
          color: "#fff",
          padding: 24,
          textAlign: "center",
        }}
      >
        <ShieldAlert size={52} color="#EF4444" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 10px" }}>
          {isInactive ? "Admin Account Inactive" : "Unauthorized Admin Access"}
        </h2>
        <p style={{ fontSize: 14, color: "#94A3B8", maxWidth: 440, margin: "0 0 28px", lineHeight: 1.6 }}>
          {isInactive
            ? "Your administrator account has been set to inactive. Please contact the system administrator."
            : "Your account is authenticated with Supabase Auth, but is not authorized as an administrator in public.admins."}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              router.push("/admin/login");
            }}
            style={{
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Return to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

