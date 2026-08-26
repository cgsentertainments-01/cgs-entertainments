// lib/event-lifecycle.ts

export type EventLifecycleStatus =
  | "DRAFT"
  | "COMING_SOON"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSING_SOON"
  | "REGISTRATION_CLOSED"
  | "EVENT_STARTING_SOON"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED";

export interface LifecycleInfo {
  status: EventLifecycleStatus;
  label: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  ctaText: string;
  ctaEnabled: boolean;
  message?: string;
}

/**
 * Parses a date or timestamp in ISO / standard format, converting it into a valid Date object.
 * Returns null if invalid or missing.
 */
export function parseEventDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toLowerCase() === "tba" || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") {
      return null;
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

/**
 * Combines a date string (e.g. "2026-09-30") and time string (e.g. "18:00" or "06:00 PM")
 * into a single unified Date object in Asia/Kolkata (IST).
 */
export function parseDateTimeCombo(dateStr?: string | null, timeStr?: string | null): Date | null {
  if (!dateStr) return null;
  
  // If dateStr already includes full ISO time e.g. "2026-09-30T18:00:00.000Z"
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
  }

  const cleanDate = dateStr.split("T")[0].trim();
  if (!cleanDate) return null;

  let timePart = "00:00:00";
  if (timeStr && typeof timeStr === "string") {
    const t = timeStr.trim();
    if (t.includes(":")) {
      // Handle "06:00 PM" vs "18:00"
      const isPm = t.toUpperCase().includes("PM");
      const isAm = t.toUpperCase().includes("AM");
      const digits = t.replace(/[^0-9:]/g, "").split(":");
      let hours = parseInt(digits[0] || "0", 10);
      const minutes = parseInt(digits[1] || "0", 10);
      
      if (isPm && hours < 12) hours += 12;
      if (isAm && hours === 12) hours = 0;

      const hh = String(hours).padStart(2, "0");
      const mm = String(minutes).padStart(2, "0");
      timePart = `${hh}:${mm}:00`;
    }
  }

  // Construct ISO string assuming IST (+05:30) if no offset
  const isoStr = `${cleanDate}T${timePart}+05:30`;
  const parsed = new Date(isoStr);
  if (!isNaN(parsed.getTime())) return parsed;

  const fallback = new Date(`${cleanDate} ${timeStr || ""}`);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Centralized function to calculate the exact, authoritative event lifecycle status
 * based on event publication flag, cancellation status, registration dates, and event start/end dates.
 */
export function getEventLifecycleStatus(event: any, nowInput?: Date): LifecycleInfo {
  const now = nowInput || new Date();

  // 1. Check Cancelled State
  const rawStatus = String(event.status || "").toLowerCase();
  if (rawStatus === "cancelled" || event.is_cancelled === true) {
    return {
      status: "CANCELLED",
      label: "Cancelled",
      badgeBg: "#FEF2F2",
      badgeColor: "#DC2626",
      badgeBorder: "#FCA5A5",
      ctaText: "Event Cancelled",
      ctaEnabled: false,
      message: "This event has been cancelled.",
    };
  }

  // 2. Check Draft State (Unpublished or explicitly set to draft)
  const isPublished = event.is_published !== undefined ? Boolean(event.is_published) : true;
  if (!isPublished || rawStatus === "draft") {
    return {
      status: "DRAFT",
      label: "Draft",
      badgeBg: "#F1F5F9",
      badgeColor: "#64748B",
      badgeBorder: "#CBD5E1",
      ctaText: "Draft Event",
      ctaEnabled: false,
      message: "Event is in draft mode and not visible publicly.",
    };
  }

  // Parse Dates
  const regStart = parseEventDate(event.registration_start_date);
  const regClose = parseEventDate(event.registration_deadline);

  // Parse Event Start Date & Time
  const evtStart = parseDateTimeCombo(
    event.event_date || event.date || event.rawDate,
    event.event_start_time
  );

  // Parse Event End Date & Time (default to 1 day after start if missing)
  let evtEnd = parseDateTimeCombo(
    event.event_end_date || event.event_date || event.date || event.rawDate,
    event.event_end_time
  );
  if (!evtEnd && evtStart) {
    evtEnd = new Date(evtStart.getTime() + 24 * 60 * 60 * 1000); // +24 hours
  }

  // 3. Check Completed State
  if (evtEnd && now > evtEnd) {
    return {
      status: "COMPLETED",
      label: "Completed",
      badgeBg: "#F8FAFC",
      badgeColor: "#475569",
      badgeBorder: "#E2E8F0",
      ctaText: "Event Completed",
      ctaEnabled: false,
      message: "This event has ended.",
    };
  }

  // 4. Check Live / Ongoing State
  if (evtStart && now >= evtStart && (!evtEnd || now <= evtEnd)) {
    return {
      status: "LIVE",
      label: "● LIVE",
      badgeBg: "#DCFCE7",
      badgeColor: "#15803D",
      badgeBorder: "#86EFAC",
      ctaText: "Event Live",
      ctaEnabled: false,
      message: "Event is happening right now!",
    };
  }

  // 5. Check Coming Soon / Upcoming State (Published, but registration opening date is in the future or explicitly set as upcoming before registration opens)
  const isExplicitUpcoming = (event.event_type === "upcoming" || rawStatus === "upcoming" || rawStatus === "coming_soon");
  if ((regStart && now < regStart) || (isExplicitUpcoming && (!regStart || now < regStart))) {
    const dayStr = regStart
      ? regStart.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : (event.date || event.event_date || "Coming Soon");
    return {
      status: "COMING_SOON",
      label: "Coming Soon",
      badgeBg: "#F3E8FF",
      badgeColor: "#6D28D9",
      badgeBorder: "#DDD6FE",
      ctaText: "Registration Opens Soon",
      ctaEnabled: false,
      message: regStart ? `Registration opens on ${dayStr}` : "Registration opening soon",
    };
  }

  // 6. Check Registration Closed & Event Starting Soon
  if (regClose && now > regClose) {
    // If event start is within 3 days (72h)
    const msUntilStart = evtStart ? evtStart.getTime() - now.getTime() : Infinity;
    const isStartingSoon = msUntilStart > 0 && msUntilStart <= 3 * 24 * 60 * 60 * 1000;

    if (isStartingSoon) {
      const daysLeft = Math.ceil(msUntilStart / (1000 * 60 * 60 * 24));
      return {
        status: "EVENT_STARTING_SOON",
        label: "Event Starting Soon",
        badgeBg: "#FFFBEB",
        badgeColor: "#B45309",
        badgeBorder: "#FDE68A",
        ctaText: "Registration Closed",
        ctaEnabled: false,
        message: `Event starts in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
      };
    }

    return {
      status: "REGISTRATION_CLOSED",
      label: "Registration Closed",
      badgeBg: "#FEF2F2",
      badgeColor: "#991B1B",
      badgeBorder: "#FCA5A5",
      ctaText: "Registration Closed",
      ctaEnabled: false,
      message: "Registrations for this event are now closed.",
    };
  }

  // 7. Check Registration Closing Soon (Active registration, closing within 3 days / 72 hours)
  if (regClose && now <= regClose) {
    const msUntilClose = regClose.getTime() - now.getTime();
    const isClosingSoon = msUntilClose > 0 && msUntilClose <= 3 * 24 * 60 * 60 * 1000;

    if (isClosingSoon) {
      const daysLeft = Math.ceil(msUntilClose / (1000 * 60 * 60 * 24));
      return {
        status: "REGISTRATION_CLOSING_SOON",
        label: "Closing Soon",
        badgeBg: "#FFF7ED",
        badgeColor: "#C2410C",
        badgeBorder: "#FFEDD5",
        ctaText: "Register Now",
        ctaEnabled: true,
        message: `Registration closes in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
      };
    }
  }

  // 8. Registration Open (Default if published and within registration dates)
  return {
    status: "REGISTRATION_OPEN",
    label: "Registration Open",
    badgeBg: "#EFF6FF",
    badgeColor: "#1D4ED8",
    badgeBorder: "#BFDBFE",
    ctaText: "Register Now",
    ctaEnabled: true,
    message: "Registrations are currently active.",
  };
}

/**
 * Returns true if an event belongs to the UPCOMING lifecycle stage (COMING_SOON).
 * Events with registration in the future MUST appear under Upcoming Events, NOT Published Events.
 */
export function isUpcomingEvent(event: any, nowInput?: Date): boolean {
  if (!event) return false;
  const lc = event.lifecycle || getEventLifecycleStatus(event, nowInput);
  return lc.status === "COMING_SOON";
}

/**
 * Returns true if an event belongs to the PUBLISHED lifecycle stage
 * (REGISTRATION_OPEN, REGISTRATION_CLOSING_SOON, REGISTRATION_CLOSED, EVENT_STARTING_SOON, LIVE, COMPLETED).
 * Events in DRAFT or COMING_SOON MUST NOT appear as Published Events.
 */
export function isPublishedEvent(event: any, nowInput?: Date): boolean {
  if (!event) return false;
  const lc = event.lifecycle || getEventLifecycleStatus(event, nowInput);
  return (
    lc.status === "REGISTRATION_OPEN" ||
    lc.status === "REGISTRATION_CLOSING_SOON" ||
    lc.status === "REGISTRATION_CLOSED" ||
    lc.status === "EVENT_STARTING_SOON" ||
    lc.status === "LIVE" ||
    lc.status === "COMPLETED"
  );
}

/**
 * Returns true if an event is in DRAFT state (unpublished or explicit draft).
 */
export function isDraftEvent(event: any, nowInput?: Date): boolean {
  if (!event) return false;
  const lc = event.lifecycle || getEventLifecycleStatus(event, nowInput);
  return lc.status === "DRAFT";
}

