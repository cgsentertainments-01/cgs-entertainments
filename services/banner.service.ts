import { Banner, BannerFormData, BannerPlacement } from "@/types/banner";

export async function fetchBanners(mode: "admin" | "public" = "admin", placement?: BannerPlacement | "all"): Promise<Banner[]> {
  const url = new URL("/api/banners", window.location.origin);
  url.searchParams.set("mode", mode);
  if (placement && placement !== "all") {
    url.searchParams.set("placement", placement);
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details ? `${errorData.error} (${errorData.details})` : errorData.error;
    throw new Error(message || "Failed to fetch banners");
  }
  const data = await res.json();
  return data.banners || [];
}

export async function createBanner(formData: BannerFormData): Promise<Banner> {
  const res = await fetch("/api/banners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error;
    throw new Error(message || "Failed to create banner record");
  }

  const data = await res.json();
  return data.banner;
}

export async function updateBanner(id: string, formData: Partial<BannerFormData>): Promise<Banner> {
  const res = await fetch(`/api/banners/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error;
    throw new Error(message || "Failed to update banner");
  }

  const data = await res.json();
  return data.banner;
}

export async function deleteBanner(id: string): Promise<void> {
  const res = await fetch(`/api/banners/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error;
    throw new Error(message || "Failed to delete banner");
  }
}

export async function duplicateBanner(id: string): Promise<Banner> {
  const res = await fetch(`/api/banners/${id}/duplicate`, {
    method: "POST",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error;
    throw new Error(message || "Failed to duplicate banner");
  }

  const data = await res.json();
  return data.banner;
}

export async function reorderBanners(items: { id: string; display_order: number }[]): Promise<void> {
  const res = await fetch("/api/banners/reorder", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error;
    throw new Error(message || "Failed to reorder banners");
  }
}

export async function uploadBannerImage(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);

  const res = await fetch("/api/banners/upload", {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error;
    throw new Error(message || "Failed to upload image");
  }

  const result = await res.json();
  return result.url;
}
