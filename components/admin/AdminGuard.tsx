"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, Loader2 } from "lucide-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdminPath = pathname?.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && isAdminPath && !isLoginPage) {
      const adminEmail = "cgsentertainments01@gmail.com";
      if (!user || user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
        router.push("/admin/login");
      }
    }
  }, [user, loading, pathname, isAdminPath, isLoginPage, router]);

  // If on login page, render children directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading spinner while checking auth session
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
          Verifying Admin Credentials...
        </div>
      </div>
    );
  }

  // If not authenticated or wrong email, return redirect state
  if (!user || user.email?.toLowerCase() !== "cgsentertainments01@gmail.com") {
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
        <ShieldAlert size={48} color="#EF4444" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>Unauthorized Access</h2>
        <p style={{ fontSize: 14, color: "#94A3B8", maxWidth: 400, margin: "0 0 24px" }}>
          You must be logged in as the official CGS Admin to access this panel.
        </p>
        <button
          type="button"
          onClick={() => router.push("/admin/login")}
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
          Go to Admin Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
