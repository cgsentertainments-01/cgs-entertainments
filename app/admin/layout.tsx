"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If on admin login page, bypass layout shell
  if (isLoginPage) {
    return <AdminGuard>{children}</AdminGuard>;
  }

  return (
    <AdminGuard>
      <div style={{ minHeight: "100vh", display: "flex", background: "#F8FAFC", fontFamily: "inherit" }}>
        {/* Fixed Desktop Sidebar */}
        <AdminSidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />

        {/* Main Content Body */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: "100vh" }}>
          <AdminTopbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
          <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
