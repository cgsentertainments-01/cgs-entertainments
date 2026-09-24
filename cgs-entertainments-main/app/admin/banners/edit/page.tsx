"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminBannersEditPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/banner");
  }, [router]);

  return <div style={{ padding: 20 }}>Redirecting to Banners...</div>;
}
