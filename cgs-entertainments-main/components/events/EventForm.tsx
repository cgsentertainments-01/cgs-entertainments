"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Tag,
  DollarSign,
  Layers,
  FileText,
  Users,
  Globe,
  Clock,
} from "lucide-react";
import { EventItem, createEvent, updateEvent, getEventByIdOrSlug, deduplicateParticipationTypes } from "@/services/event.service";
import { EventFormConfig, getDefaultFormConfig, ParticipationTypeConfig } from "@/types/event-config";
import { FormConfigEditor } from "@/components/events/FormConfigEditor";
import { getEventLifecycleStatus } from "@/lib/event-lifecycle";

export interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: EventItem | null;
}

const WIZARD_STEPS = [
  { step: 1, title: "Event Information", desc: "Title, slug, category & media" },
  { step: 2, title: "Event & Registration Schedule", desc: "Dates, times & timezone" },
  { step: 3, title: "Competitions & Fees", desc: "Solo, Duo, Group options & fees" },
  { step: 4, title: "Registration Form Setup", desc: "Basic & custom fields, documents" },
  { step: 5, title: "Rounds & Progression", desc: "Configure competition rounds" },
  { step: 6, title: "Review & Publish", desc: "Final verification & publish" },
];

const DEFAULT_PARTICIPATION_TYPES: ParticipationTypeConfig[] = [
  { id: "solo", name: "Solo", minParticipants: 1, maxParticipants: 1, fee: 500, isActive: true, order: 1 },
  { id: "duo", name: "Duo", minParticipants: 2, maxParticipants: 2, fee: 800, isActive: true, order: 2 },
  { id: "group", name: "Group", minParticipants: 4, maxParticipants: 10, fee: 1500, isActive: true, order: 3 },
];

export function EventForm({ mode, eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [activeStep, setActiveStep] = useState<number>(1);
  const [loading, setLoading] = useState(isEdit && !initialData);
  const [realEventId, setRealEventId] = useState<string>("");
  const [selectedEventType, setSelectedEventType] = useState<"published" | "upcoming" | null>(isEdit ? "published" : null);
  const [comingSoonText, setComingSoonText] = useState("Coming Soon");

  // Step 1: Basic Event Information
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("Dance");
  const [status, setStatus] = useState<string>("registration_open");
  const [completed, setCompleted] = useState<boolean>(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Step 2: Event & Registration Schedule
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("10:00");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("20:00");
  const [regStartDate, setRegStartDate] = useState("");
  const [regStartTime, setRegStartTime] = useState("09:00");
  const [regDeadlineDate, setRegDeadlineDate] = useState("");
  const [regDeadlineTime, setRegDeadlineTime] = useState("23:59");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  // Venue & Location
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [state, setState] = useState("Telangana");
  const [pincode, setPincode] = useState("500001");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");

  // Media
  const [bannerImg, setBannerImg] = useState("");
  const [mobileBannerImg, setMobileBannerImg] = useState("");

  // Step 3 & 4: Registration Form Config (Single canonical source of truth for participation types)
  const [formConfig, setFormConfig] = useState<EventFormConfig>(() => {
    const base = getDefaultFormConfig(categoryName, 500);
    base.participationTypes = DEFAULT_PARTICIPATION_TYPES;
    return base;
  });

  // Step 5: Multi-Round Setup
  const [roundsList, setRoundsList] = useState<Array<{ id?: string; name: string; status: string; fee: number }>>([
    { name: "Round 1 / Auditions", status: "active", fee: 0 },
    { name: "Semi Final", status: "upcoming", fee: 0 },
    { name: "Final", status: "upcoming", fee: 0 },
  ]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate data when editing an event
  const populateData = (evt: EventItem) => {
    if (evt.id) setRealEventId(evt.id);
    setSelectedEventType(evt.event_type || "published");
    setTitle(evt.title || "");
    setSlug(evt.slug || "");
    setAutoSlug(false);
    setShortDescription(evt.short_description || "");
    setDescription(evt.description || "");
    setCategoryName(evt.category || "Dance");
    const isComp = Boolean(evt.completed || evt.is_completed || evt.status === "completed");
    setCompleted(isComp);
    setStatus(evt.status || (isComp ? "completed" : "registration_open"));
    setIsFeatured(Boolean(evt.is_featured));
    setIsPublished(evt.is_published !== undefined ? Boolean(evt.is_published) : true);

    // Parse Event Dates
    if (evt.rawDate || evt.event_date) {
      const dt = evt.rawDate || evt.event_date || "";
      if (dt.includes("T")) {
        const parts = dt.split("T");
        setEventStartDate(parts[0]);
        setEventStartTime(parts[1]?.substring(0, 5) || "10:00");
      } else {
        setEventStartDate(dt);
      }
    }
    if (evt.event_end_date) {
      const dt = evt.event_end_date;
      if (dt.includes("T")) {
        const parts = dt.split("T");
        setEventEndDate(parts[0]);
        setEventEndTime(parts[1]?.substring(0, 5) || "20:00");
      } else {
        setEventEndDate(dt);
      }
    }
    if (evt.registration_start_date) {
      const dt = evt.registration_start_date;
      if (dt.includes("T")) {
        const parts = dt.split("T");
        setRegStartDate(parts[0]);
        setRegStartTime(parts[1]?.substring(0, 5) || "09:00");
      } else {
        setRegStartDate(dt);
      }
    }
    if (evt.registration_deadline) {
      const dt = evt.registration_deadline;
      if (dt.includes("T")) {
        const parts = dt.split("T");
        setRegDeadlineDate(parts[0]);
        setRegDeadlineTime(parts[1]?.substring(0, 5) || "23:59");
      } else {
        setRegDeadlineDate(dt);
      }
    }

    if (evt.venue) setVenue(evt.venue);
    if (evt.address) setAddress(evt.address);
    if (evt.city) setCity(evt.city);
    if (evt.state) setState(evt.state);
    if (evt.pincode) setPincode(evt.pincode);
    if (evt.google_maps_url) setGoogleMapsUrl(evt.google_maps_url);

    if (evt.banner_url || evt.banner_image || evt.img) setBannerImg(evt.banner_url || evt.banner_image || evt.img || "");
    if (evt.mobile_banner_image) setMobileBannerImg(evt.mobile_banner_image);

    // Form Config & Participation Types (Loaded without duplicating)
    if (evt.form_config) {
      const cfg = { ...evt.form_config };
      if (Array.isArray(cfg.participationTypes) && cfg.participationTypes.length > 0) {
        cfg.participationTypes = deduplicateParticipationTypes(cfg.participationTypes);
      } else {
        cfg.participationTypes = DEFAULT_PARTICIPATION_TYPES;
      }
      setFormConfig(cfg);
    }
  };

  useEffect(() => {
    async function initForm() {
      if (isEdit) {
        setLoading(true);
        let targetId = "";
        if (initialData) {
          populateData(initialData);
          targetId = initialData.id || "";
        } else if (eventId) {
          const evt = await getEventByIdOrSlug(eventId);
          if (evt) {
            populateData(evt);
            targetId = evt.id || "";
          }
        }
        if (targetId) {
          try {
            const rRes = await fetch(`/api/events/${encodeURIComponent(targetId)}/rounds`, { cache: "no-store" });
            if (rRes.ok) {
              const rData = await rRes.json();
              if (Array.isArray(rData.rounds) && rData.rounds.length > 0) {
                setRoundsList(
                  rData.rounds.map((r: any, idx: number) => ({
                    id: r.id,
                    name: r.name || `Round ${idx + 1}`,
                    status: r.status || "upcoming",
                    fee: typeof r.fee === "number" ? r.fee : parseFloat(r.fee) || 0,
                  }))
                );
              }
            }
          } catch (rErr) {
            console.warn("Could not load competition rounds:", rErr);
          }
        }
        setLoading(false);
      }
    }
    initForm();
  }, [isEdit, eventId, initialData]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug && !isEdit) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleImageFile = (file: File, isMobile = false) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        if (isMobile) setMobileBannerImg(reader.result);
        else setBannerImg(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Synchronize Participation Types directly in formConfig
  const updateParticipationType = (idx: number, field: keyof ParticipationTypeConfig, val: any) => {
    const types = [...(formConfig.participationTypes || [])];
    types[idx] = { ...types[idx], [field]: val };
    setFormConfig({ ...formConfig, participationTypes: deduplicateParticipationTypes(types) });
  };

  const addParticipationType = () => {
    const currentTypes = formConfig.participationTypes || [];
    const newType: ParticipationTypeConfig = {
      id: `comp_${Date.now()}`,
      name: "Custom Competition",
      minParticipants: 1,
      maxParticipants: 1,
      fee: 500,
      isActive: true,
      order: currentTypes.length + 1,
    };
    setFormConfig({
      ...formConfig,
      participationTypes: deduplicateParticipationTypes([...currentTypes, newType]),
    });
  };

  const removeParticipationType = (idx: number) => {
    const currentTypes = (formConfig.participationTypes || []).filter((_, i) => i !== idx);
    setFormConfig({
      ...formConfig,
      participationTypes: currentTypes.length > 0 ? currentTypes : DEFAULT_PARTICIPATION_TYPES,
    });
  };

  // Submit Handler
  const handleSubmit = async (isPublishAction: boolean) => {
    if (isSubmitting) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation Rules
    if (!title.trim()) {
      setErrorMsg("Event Title is required.");
      setActiveStep(1);
      return;
    }

    if (!eventStartDate) {
      setErrorMsg("Event Start Date is required.");
      setActiveStep(2);
      return;
    }

    // Combine ISO dates cleanly
    const fullEventStartISO = `${eventStartDate}T${eventStartTime || "10:00"}:00+05:30`;
    const fullEventEndISO = eventEndDate ? `${eventEndDate}T${eventEndTime || "20:00"}:00+05:30` : undefined;
    const fullRegStartISO = regStartDate ? `${regStartDate}T${regStartTime || "09:00"}:00+05:30` : undefined;
    const fullRegCloseISO = regDeadlineDate ? `${regDeadlineDate}T${regDeadlineTime || "23:59"}:00+05:30` : undefined;

    if (fullRegStartISO && fullRegCloseISO) {
      if (new Date(fullRegCloseISO) <= new Date(fullRegStartISO)) {
        setErrorMsg("Registration Closing date must be after Registration Opening date.");
        setActiveStep(2);
        return;
      }
    }

    const activeTypes = (formConfig.participationTypes || []).filter((pt) => pt.isActive !== false);
    if (activeTypes.length === 0) {
      setErrorMsg("At least one enabled competition is required.");
      setActiveStep(3);
      return;
    }

    // Primary fee = lowest active fee
    const primaryFee = Math.min(...activeTypes.map((pt) => Number(pt.fee) || 0));

    setIsSubmitting(true);

    try {
      const cleanedTypes = deduplicateParticipationTypes(formConfig.participationTypes);

      const mergedFormConfig: EventFormConfig = {
        ...formConfig,
        participationTypes: cleanedTypes,
        feeStructure: cleanedTypes.reduce((acc: any, pt: any) => {
          acc[pt.id || pt.name.toLowerCase()] = pt.fee;
          return acc;
        }, {}),
      };

      const payload: any = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        short_description: shortDescription || title,
        description: description || shortDescription || title,
        category: categoryName,
        event_date: fullEventStartISO,
        event_start_time: eventStartTime || "10:00 AM",
        event_end_date: fullEventEndISO,
        event_end_time: eventEndTime || "08:00 PM",
        registration_start_date: fullRegStartISO,
        registration_deadline: fullRegCloseISO,
        timezone: timezone || "Asia/Kolkata",
        venue: venue || "Venue TBA",
        address: address || "",
        city: city || "Hyderabad",
        state: state || "Telangana",
        pincode: pincode || "500001",
        google_maps_url: googleMapsUrl,
        banner_image: bannerImg,
        mobile_banner_image: mobileBannerImg || bannerImg,
        registration_required: true,
        registration_fee: primaryFee,
        price: primaryFee,
        form_config: mergedFormConfig,
        status: isEdit
          ? (isPublishAction ? (status === "draft" ? "registration_open" : status) : "draft")
          : (isPublishAction ? "registration_open" : "draft"),
        event_type: "published",
        is_featured: isFeatured,
        is_published: isPublishAction,
        completed: isEdit ? completed : false,
        is_completed: isEdit ? completed : false,
      };

      if (isEdit && (realEventId || eventId)) {
        const targetId = realEventId || eventId || "";
        payload.id = targetId;
        const res = await updateEvent(targetId, payload);
        if (res.success) {
          // Persist rounds to competition_rounds in Supabase
          if (roundsList && roundsList.length > 0) {
            try {
              await fetch(`/api/events/${encodeURIComponent(targetId)}/rounds`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  rounds: roundsList.map((r, idx) => ({
                    ...(r.id ? { id: r.id } : {}),
                    name: r.name,
                    status: r.status || "upcoming",
                    fee: typeof r.fee === "number" ? r.fee : parseFloat(r.fee) || 0,
                    round_number: idx + 1,
                  })),
                }),
              });
            } catch (roundSaveErr) {
              console.error("Error persisting competition rounds on edit:", roundSaveErr);
            }
          }

          setSuccessMsg("Event updated successfully in Supabase!");
          setTimeout(() => {
            router.refresh();
            router.push("/admin/events");
          }, 800);
        } else {
          setErrorMsg(res.error || "Unable to update event in Supabase.");
          setIsSubmitting(false);
        }
      } else {
        const res = await createEvent(payload);
        if (res.success) {
          const targetId = res.event?.id;
          // Persist rounds to competition_rounds in Supabase
          if (roundsList && roundsList.length > 0 && targetId) {
            try {
              await fetch(`/api/events/${encodeURIComponent(targetId)}/rounds`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  rounds: roundsList.map((r, idx) => ({
                    name: r.name,
                    status: r.status || "upcoming",
                    fee: typeof r.fee === "number" ? r.fee : parseFloat(r.fee) || 0,
                    round_number: idx + 1,
                  })),
                }),
              });
            } catch (roundSaveErr) {
              console.error("Error persisting competition rounds on create:", roundSaveErr);
            }
          }

          setSuccessMsg("Event published successfully in Supabase!");
          setTimeout(() => {
            router.refresh();
            router.push("/admin/events");
          }, 800);
        } else {
          setErrorMsg(res.error || "Failed to save event to Supabase database.");
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      setErrorMsg(err.message || "An unexpected technical error occurred while connecting to Supabase.");
      setIsSubmitting(false);
    }
  };

  // Submit Handler for Upcoming Event (Lightweight promotional announcement)
  const handleSubmitUpcoming = async () => {
    if (isSubmitting) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg("Event Name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const fullEventStartISO = eventStartDate ? `${eventStartDate}T${eventStartTime || "10:00"}:00+05:30` : new Date().toISOString();

      const payload: any = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        short_description: shortDescription || title,
        description: description || shortDescription || title,
        category: categoryName,
        event_date: fullEventStartISO,
        venue: venue || "Venue TBA",
        city: city || "Hyderabad",
        banner_image: bannerImg,
        mobile_banner_image: mobileBannerImg || bannerImg,
        event_type: "upcoming",
        status: "upcoming",
        is_published: isPublished,
        completed: false,
        is_completed: false,
        registration_required: false,
        registration_fee: 0,
        price: 0,
        homepage_settings: { show_on_homepage: true, coming_soon_text: comingSoonText },
        form_config: {
          ...(formConfig || {}),
          extra: {
            ...(formConfig?.extra || {}),
            event_type: "upcoming",
            coming_soon_text: comingSoonText,
          },
        },
      };

      if (isEdit && (realEventId || eventId)) {
        const targetId = realEventId || eventId || "";
        payload.id = targetId;
        const res = await updateEvent(targetId, payload);
        if (res.success) {
          setSuccessMsg("Upcoming Event saved successfully!");
          setTimeout(() => {
            router.refresh();
            router.push("/admin/events");
          }, 800);
        } else {
          setErrorMsg(res.error || "Unable to update upcoming event.");
          setIsSubmitting(false);
        }
      } else {
        const res = await createEvent(payload);
        if (res.success) {
          setSuccessMsg("Upcoming Event created successfully!");
          setTimeout(() => {
            router.refresh();
            router.push("/admin/events");
          }, 800);
        } else {
          setErrorMsg(res.error || "Failed to save upcoming event.");
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      console.error("Submit upcoming error:", err);
      setErrorMsg(err.message || "An error occurred while saving upcoming event.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748B", fontWeight: 600 }}>
        Loading event workspace...
      </div>
    );
  }

  // ── 1. SELECT EVENT TYPE CHOICE SCREEN (CREATE MODE INITIAL STEP) ──
  if (!selectedEventType && !isEdit) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Link
          href="/admin/events"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#64748B", textDecoration: "none" }}
        >
          <ArrowLeft size={16} /> Back to Events
        </Link>

        <div style={{ background: "#fff", borderRadius: 24, border: "1px solid #E2E8F0", padding: "48px 36px", textAlign: "center", maxWidth: 780, margin: "0 auto", width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>Select Event Type</h2>
          <p style={{ fontSize: 14.5, color: "#64748B", margin: "0 0 36px", fontWeight: 500 }}>
            Choose how you want to create this event. This controls required fields and frontend placement.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {/* Option 1: Publish Event */}
            <div
              onClick={() => setSelectedEventType("published")}
              style={{
                border: "2px solid #7C3AED",
                borderRadius: 20,
                padding: 28,
                cursor: "pointer",
                background: "linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%)",
                textAlign: "left",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#7C3AED", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)" }}>
                  <CheckCircle2 size={26} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>Publish Event</h3>
                <p style={{ fontSize: 13.5, color: "#475569", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  Configure a full registration-ready event. Setup event dates, venue, solo/duo/group options, registration fees, payment settings, documents, and judges.
                </p>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #F3E8FF", fontSize: 13, fontWeight: 800, color: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Main Events Section</span>
                <ChevronRight size={18} />
              </div>
            </div>

            {/* Option 2: Upcoming Event */}
            <div
              onClick={() => setSelectedEventType("upcoming")}
              style={{
                border: "2px solid #3B82F6",
                borderRadius: 20,
                padding: 28,
                cursor: "pointer",
                background: "linear-gradient(180deg, #EFF6FF 0%, #FFFFFF 100%)",
                textAlign: "left",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 14px rgba(59, 130, 246, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#3B82F6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}>
                  <Clock size={26} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>Upcoming Event</h3>
                <p style={{ fontSize: 13.5, color: "#475569", margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  Quick promotional announcement. Requires only Event Name, Image, Category, Short description, and optional expected date/location.
                </p>
              </div>

              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #DBEAFE", fontSize: 13, fontWeight: 800, color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Upcoming Events Section Only</span>
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. UPCOMING EVENT CREATION / EDIT FORM (LIGHTWEIGHT PROMOTIONAL FLOW) ──
  if (selectedEventType === "upcoming") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Link
              href="/admin/events"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#64748B", textDecoration: "none", marginBottom: 6 }}
            >
              <ArrowLeft size={16} /> Back to Events
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0 }}>
                {isEdit ? `Edit Upcoming Event: ${title || "Untitled"}` : "Create Upcoming Event"}
              </h1>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", fontSize: 11, fontWeight: 900 }}>
                UPCOMING EVENT
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => setSelectedEventType("published")}
              style={{ padding: "10px 18px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)", color: "#fff", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 14px rgba(109, 40, 217, 0.25)" }}
            >
              <Sparkles size={16} /> Complete &amp; Publish Event
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 14, padding: "14px 18px", color: "#DC2626", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 14, padding: "14px 18px", color: "#15803D", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Lightweight Form Box */}
        <div style={{ background: "#fff", padding: 32, borderRadius: 20, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", padding: 16, borderRadius: 14, color: "#1D4ED8", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>📢 This will create a promotional card under <strong>Upcoming Events</strong> with a <strong>COMING SOON</strong> badge. Registration fees &amp; forms will be hidden until published.</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                Event Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Warangal Dance Championship"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                Category *
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", background: "#fff" }}
              >
                <option value="Dance">Dance</option>
                <option value="Modeling">Modeling</option>
                <option value="Acting">Acting</option>
                <option value="Singing">Singing</option>
                <option value="Music">Music</option>
                <option value="Photography">Photography</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
              Short Description / Subtitle
            </label>
            <input
              type="text"
              placeholder="e.g. Grand National Dance Competition coming soon to Telangana."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                Expected Event Date (Optional)
              </label>
              <input
                type="date"
                value={eventStartDate}
                onChange={(e) => setEventStartDate(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                Expected Location / City (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Warangal, Telangana"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
              Banner Image URL / File
            </label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={bannerImg}
                onChange={(e) => setBannerImg(e.target.value)}
                style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
              />
              <label style={{ padding: "11px 18px", borderRadius: 10, background: "#F1F5F9", color: "#334155", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                Browse...
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0], false)} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          <div style={{ background: "#F8FAFC", padding: 18, borderRadius: 14, border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0F172A" }}>Coming Soon Announcement Status</div>
              <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 2 }}>
                {isPublished ? "Active — Visible in Upcoming Events section on public frontend" : "Hidden Draft — Saved in admin panel only"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                background: isPublished ? "#DCFCE7" : "#F1F5F9",
                color: isPublished ? "#15803D" : "#64748B",
                border: `1.5px solid ${isPublished ? "#86EFAC" : "#CBD5E1"}`,
                fontWeight: 900,
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isPublished ? <CheckCircle2 size={16} /> : null}
              <span>{isPublished ? "Active Coming Soon" : "Hidden Draft"}</span>
            </button>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
              Badge Text (Optional)
            </label>
            <input
              type="text"
              placeholder="COMING SOON"
              value={comingSoonText}
              onChange={(e) => setComingSoonText(e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, paddingTop: 20, borderTop: "1px solid #E2E8F0" }}>
            <button
              type="button"
              onClick={() => setSelectedEventType(null)}
              style={{ padding: "10px 20px", borderRadius: 12, background: "#F1F5F9", color: "#334155", border: "1px solid #CBD5E1", fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}
            >
              Change Event Type
            </button>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={handleSubmitUpcoming}
                disabled={isSubmitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "11px 26px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                <CheckCircle2 size={18} /> {isSubmitting ? "Saving Upcoming Event..." : "Save Upcoming Event"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate live preview lifecycle badge
  const previewLifecycle = getEventLifecycleStatus({
    is_published: isPublished,
    status: isPublished ? "registration_open" : "draft",
    registration_start_date: regStartDate ? `${regStartDate}T${regStartTime}:00+05:30` : null,
    registration_deadline: regDeadlineDate ? `${regDeadlineDate}T${regDeadlineTime}:00+05:30` : null,
    event_date: eventStartDate ? `${eventStartDate}T${eventStartTime}:00+05:30` : null,
    event_end_date: eventEndDate ? `${eventEndDate}T${eventEndTime}:00+05:30` : null,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Link
            href="/admin/events"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#64748B", textDecoration: "none", marginBottom: 6 }}
          >
            <ArrowLeft size={16} /> Back to Events
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0 }}>
            {isEdit ? `Edit Event: ${title || "Untitled"}` : "Create New Event"}
          </h1>
        </div>
      </div>

      {/* Stepper Bar */}
      <div style={{ background: "#fff", padding: 20, borderRadius: 18, border: "1px solid #E2E8F0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {WIZARD_STEPS.map((s) => {
            const isActive = activeStep === s.step;
            const isCompleted = activeStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStep(s.step)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: isActive ? "#F3E8FF" : isCompleted ? "#F0FDF4" : "#F8FAFC",
                  border: isActive ? "1.5px solid #7C3AED" : isCompleted ? "1px solid #86EFAC" : "1px solid #E2E8F0",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: isActive ? "#7C3AED" : isCompleted ? "#16A34A" : "#CBD5E1",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCompleted ? <Check size={14} /> : s.step}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: isActive ? "#6D28D9" : "#0F172A" }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 10.5, color: "#64748B" }}>Step {s.step}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 14, padding: "14px 18px", color: "#DC2626", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 14, padding: "14px 18px", color: "#15803D", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* STEP CONTENT CONTAINERS */}
      <div style={{ background: "#fff", padding: 28, borderRadius: 20, border: "1px solid #E2E8F0" }}>
        {/* STEP 1: Event Information */}
        {activeStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Step 1: Event Information
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                  Event Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Warangal Dance Championship 2026"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                  URL Slug *
                </label>
                <input
                  type="text"
                  placeholder="warangal-dance-championship-2026"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", background: "#fff" }}
                >
                  <option value="Dance">Dance</option>
                  <option value="Modeling">Modeling</option>
                  <option value="Acting">Acting</option>
                  <option value="Singing">Singing</option>
                  <option value="Music">Music</option>
                  <option value="Photography">Photography</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                  Short Description / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="National dance competition event in Telangana"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                />
              </div>
            </div>

            {isEdit && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                    Event Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => {
                      const newStat = e.target.value;
                      setStatus(newStat);
                      if (newStat === "completed") setCompleted(true);
                      else if (newStat === "registration_open" || newStat === "draft") setCompleted(false);
                    }}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", background: "#fff" }}
                  >
                    <option value="registration_open">Registration Open</option>
                    <option value="registration_closed">Registration Closed</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 26 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 800, color: "#334155", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={completed}
                      onChange={(e) => {
                        const isChk = e.target.checked;
                        setCompleted(isChk);
                        if (isChk) setStatus("completed");
                        else if (status === "completed") setStatus("registration_open");
                      }}
                      style={{ width: 18, height: 18, accentColor: "#7C3AED", cursor: "pointer" }}
                    />
                    Event Completed
                  </label>
                </div>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                Full Description
              </label>
              <textarea
                rows={4}
                placeholder="Detailed event description, highlights, eligibility, guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                  Venue Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ambedkar Auditorium"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                  City
                </label>
                <input
                  type="text"
                  placeholder="Warangal"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                Banner Image URL
              </label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={bannerImg}
                  onChange={(e) => setBannerImg(e.target.value)}
                  style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                />
                <label style={{ padding: "11px 18px", borderRadius: 10, background: "#F1F5F9", color: "#334155", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  Browse...
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0], false)} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Event & Registration Schedule */}
        {activeStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Step 2: Event & Registration Schedule
            </h2>
            <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
              Specify event dates, registration dates, and times in Asia/Kolkata (IST).
            </p>

            {/* Event Schedule Section */}
            <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 14, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>Event Schedule</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Event Start Date *</label>
                  <input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Event Start Time</label>
                  <input type="time" value={eventStartTime} onChange={(e) => setEventStartTime(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Event End Date</label>
                  <input type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Event End Time</label>
                  <input type="time" value={eventEndTime} onChange={(e) => setEventEndTime(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5, outline: "none" }} />
                </div>
              </div>
            </div>

            {/* Registration Schedule Section */}
            <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 14, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>Registration Schedule</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Registration Opens Date</label>
                  <input type="date" value={regStartDate} onChange={(e) => setRegStartDate(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Opens Time</label>
                  <input type="time" value={regStartTime} onChange={(e) => setRegStartTime(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Registration Closes Date</label>
                  <input type="date" value={regDeadlineDate} onChange={(e) => setRegDeadlineDate(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", display: "block", marginBottom: 4 }}>Closes Time</label>
                  <input type="time" value={regDeadlineTime} onChange={(e) => setRegDeadlineTime(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5, outline: "none" }} />
                </div>
              </div>
            </div>

            {/* Calculated Lifecycle State Preview */}
            <div style={{ background: "#F1F5F9", padding: 16, borderRadius: 12, border: "1px solid #CBD5E1", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>Automated Lifecycle Calculation</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginTop: 2 }}>{previewLifecycle.message}</div>
              </div>
              <span style={{ padding: "6px 14px", borderRadius: 8, background: previewLifecycle.badgeBg, color: previewLifecycle.badgeColor, border: `1px solid ${previewLifecycle.badgeBorder}`, fontSize: 12, fontWeight: 900 }}>
                {previewLifecycle.label}
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Competitions & Participation Fees */}
        {activeStep === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
                  Step 3: Competitions & Participation Fees
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                  Define competition options (Solo, Duo, Group, etc.) and registration fees. Each option is displayed exactly once.
                </p>
              </div>
              <button
                type="button"
                onClick={addParticipationType}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
              >
                <Plus size={16} /> + Add Competition Option
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(formConfig.participationTypes || []).map((pt, idx) => (
                <div key={pt.id || idx} style={{ background: pt.isActive !== false ? "#ffffff" : "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 16, padding: 18, display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.2fr 0.8fr 40px", gap: 12, alignItems: "center" }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 4, display: "block" }}>Competition Option Name</label>
                    <input
                      type="text"
                      value={pt.name}
                      onChange={(e) => updateParticipationType(idx, "name", e.target.value)}
                      placeholder="Solo / Duo / Group / Trio"
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5, fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 4, display: "block" }}>Min Members</label>
                    <input
                      type="number"
                      min={1}
                      value={pt.minParticipants}
                      onChange={(e) => updateParticipationType(idx, "minParticipants", parseInt(e.target.value, 10) || 1)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 4, display: "block" }}>Max Members</label>
                    <input
                      type="number"
                      min={1}
                      value={pt.maxParticipants}
                      onChange={(e) => updateParticipationType(idx, "maxParticipants", parseInt(e.target.value, 10) || 1)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 4, display: "block" }}>Registration Fee (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={pt.fee}
                      onChange={(e) => updateParticipationType(idx, "fee", parseFloat(e.target.value) || 0)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 14, fontWeight: 800, color: "#059669" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 4, display: "block" }}>Status</label>
                    <button
                      type="button"
                      onClick={() => updateParticipationType(idx, "isActive", !pt.isActive)}
                      style={{ width: "100%", padding: "8px", borderRadius: 8, border: "none", background: pt.isActive !== false ? "#DCFCE7" : "#F1F5F9", color: pt.isActive !== false ? "#166534" : "#64748B", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                    >
                      {pt.isActive !== false ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeParticipationType(idx)}
                    style={{ background: "#FEE2E2", border: "none", color: "#DC2626", borderRadius: 8, padding: 8, cursor: "pointer", marginTop: 16 }}
                    title="Remove Option"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Registration Form Configuration */}
        {activeStep === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Step 4: Registration Form Setup
            </h2>
            <FormConfigEditor formConfig={formConfig} onChange={setFormConfig} eventTitle={title || "Event"} categoryName={categoryName || "Dance"} />
          </div>
        )}

        {/* STEP 5: Multi-Round Setup */}
        {activeStep === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
                  Step 5: Multi-Round Setup
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                  Configure competition progression rounds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoundsList([...roundsList, { name: `Round ${roundsList.length + 1}`, status: "upcoming", fee: 0 }])}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
              >
                <Plus size={16} /> + Add Round
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {roundsList.map((r, idx) => (
                <div key={idx} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16, display: "grid", gridTemplateColumns: "2fr 1fr 40px", gap: 12, alignItems: "center" }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Round Name</label>
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => {
                        const updated = [...roundsList];
                        updated[idx].name = e.target.value;
                        setRoundsList(updated);
                      }}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, outline: "none", marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Initial Status</label>
                    <select
                      value={r.status}
                      onChange={(e) => {
                        const updated = [...roundsList];
                        updated[idx].status = e.target.value;
                        setRoundsList(updated);
                      }}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, outline: "none", marginTop: 4, background: "#fff" }}
                    >
                      <option value="active">Active</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRoundsList(roundsList.filter((_, i) => i !== idx))}
                    style={{ background: "#FEE2E2", border: "none", color: "#DC2626", borderRadius: 8, padding: 8, cursor: "pointer", marginTop: 16 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Review & Publish */}
        {activeStep === 6 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Step 6: Review & Publish
            </h2>

            <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 14 }}>
              <div><strong>Event Title:</strong> {title || "Untitled Event"}</div>
              <div><strong>Category:</strong> {categoryName}</div>
              <div><strong>Location:</strong> {venue || "TBA"}, {city}</div>
              <div><strong>Event Start:</strong> {eventStartDate || "TBA"} {eventStartTime}</div>
              <div><strong>Registration Period:</strong> {regStartDate || "Immediate"} to {regDeadlineDate || "Continuous"}</div>
              <div>
                <strong>Configured Competitions ({formConfig.participationTypes?.length || 0}):</strong>
                <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  {(formConfig.participationTypes || []).map((pt) => (
                    <span key={pt.id} style={{ background: "#EDE9FE", color: "#6D28D9", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 800 }}>
                      {pt.name}: ₹{pt.fee} ({pt.isActive !== false ? "Enabled" : "Disabled"})
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 8, paddingTop: 14, borderTop: "1px solid #E2E8F0" }}>
                <strong>Calculated Public Status:</strong>{" "}
                <span style={{ padding: "4px 10px", borderRadius: 6, background: previewLifecycle.badgeBg, color: previewLifecycle.badgeColor, fontWeight: 900, fontSize: 12 }}>
                  {previewLifecycle.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid #E2E8F0" }}>
          <button
            type="button"
            disabled={activeStep === 1 || isSubmitting}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              borderRadius: 12,
              background: activeStep === 1 ? "#F1F5F9" : "#fff",
              color: activeStep === 1 ? "#94A3B8" : "#334155",
              border: "1px solid #CBD5E1",
              fontWeight: 800,
              fontSize: 13.5,
              cursor: activeStep === 1 || isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                background: "#F1F5F9",
                color: "#334155",
                border: "1px solid #CBD5E1",
                fontWeight: 800,
                fontSize: 13.5,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Saving Draft..." : "Save Draft"}
            </button>

            {activeStep < 6 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.min(6, prev + 1))}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 22px",
                  borderRadius: 12,
                  background: "#7C3AED",
                  color: "#fff",
                  border: "none",
                  fontWeight: 800,
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 26px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                  color: "#fff",
                  border: "none",
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                <CheckCircle2 size={18} /> {isSubmitting ? "Saving to Supabase..." : "Publish Event"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
