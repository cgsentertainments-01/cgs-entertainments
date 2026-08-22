import { GuestJudge, GuestJudgeFormData, GuestJudgeRole } from "@/types/guest-judge";

export async function fetchGuestsJudges(
  mode: "admin" | "public" = "admin",
  role?: GuestJudgeRole | "all"
): Promise<GuestJudge[]> {
  const url = new URL("/api/guests-judges", window.location.origin);
  url.searchParams.set("mode", mode);
  if (role && role !== "all") {
    url.searchParams.set("role", role);
  }

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details
      ? `${errorData.error} (${errorData.details})`
      : errorData.error;
    throw new Error(message || "Failed to fetch guests & judges");
  }
  const data = await res.json();
  return data.data || [];
}

export async function createGuestJudge(formData: GuestJudgeFormData): Promise<GuestJudge> {
  const res = await fetch("/api/guests-judges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details
      ? `${errorData.error}: ${errorData.details}`
      : errorData.error;
    throw new Error(message || "Failed to create guest/judge record");
  }

  const data = await res.json();
  return data.data;
}

export async function updateGuestJudge(
  id: string,
  formData: Partial<GuestJudgeFormData>
): Promise<GuestJudge> {
  const res = await fetch(`/api/guests-judges/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details
      ? `${errorData.error}: ${errorData.details}`
      : errorData.error;
    throw new Error(message || "Failed to update guest/judge");
  }

  const data = await res.json();
  return data.data;
}

export async function deleteGuestJudge(id: string): Promise<void> {
  const res = await fetch(`/api/guests-judges/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details
      ? `${errorData.error}: ${errorData.details}`
      : errorData.error;
    throw new Error(message || "Failed to delete guest/judge");
  }
}

export async function reorderGuestsJudges(
  items: { id: string; display_order: number }[]
): Promise<void> {
  const res = await fetch("/api/guests-judges/reorder", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details
      ? `${errorData.error}: ${errorData.details}`
      : errorData.error;
    throw new Error(message || "Failed to reorder guests & judges");
  }
}

export async function uploadGuestPhoto(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);

  const res = await fetch("/api/guests-judges/upload", {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.details
      ? `${errorData.error}: ${errorData.details}`
      : errorData.error;
    throw new Error(message || "Failed to upload photo");
  }

  const result = await res.json();
  return result.url;
}
