"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminBannersCreatePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/banner");
  }, [router]);

  return null;
}
