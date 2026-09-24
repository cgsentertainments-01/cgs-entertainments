import { Banner, BannerDerivedStatus } from "@/types/banner";

export function deriveBannerStatus(banner: Partial<Banner>): BannerDerivedStatus {
  if (!banner.title || !banner.image_url) {
    return "draft";
  }

  if (banner.is_active === false) {
    return "inactive";
  }

  const now = new Date();

  if (banner.start_date) {
    const startDate = new Date(banner.start_date);
    if (!isNaN(startDate.getTime()) && startDate > now) {
      return "scheduled";
    }
  }

  if (banner.end_date) {
    const endDate = new Date(banner.end_date);
    if (!isNaN(endDate.getTime()) && endDate < now) {
      return "expired";
    }
  }

  return "active";
}

export function getStatusBadgeConfig(status: BannerDerivedStatus): {
  label: string;
  color: string;
  bg: string;
  border: string;
  dotColor: string;
} {
  switch (status) {
    case "active":
      return {
        label: "Active",
        color: "#15803D",
        bg: "#DCFCE7",
        border: "#BBF7D0",
        dotColor: "#22C55E",
      };
    case "scheduled":
      return {
        label: "Scheduled",
        color: "#1D4ED8",
        bg: "#EFF6FF",
        border: "#BFDBFE",
        dotColor: "#3B82F6",
      };
    case "expired":
      return {
        label: "Expired",
        color: "#C2410C",
        bg: "#FFEDD5",
        border: "#FED7AA",
        dotColor: "#F97316",
      };
    case "inactive":
      return {
        label: "Inactive",
        color: "#475569",
        bg: "#F1F5F9",
        border: "#E2E8F0",
        dotColor: "#94A3B8",
      };
    case "draft":
    default:
      return {
        label: "Draft",
        color: "#7E22CE",
        bg: "#F3E8FF",
        border: "#E9D5FF",
        dotColor: "#A855F7",
      };
  }
}
