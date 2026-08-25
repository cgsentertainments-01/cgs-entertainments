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
} from "lucide-react";
import { EventItem, createEvent, updateEvent, getEventByIdOrSlug } from "@/services/event.service";
import { EventFormConfig, getDefaultFormConfig } from "@/types/event-config";
import { FormConfigEditor } from "@/components/events/FormConfigEditor";

export interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: EventItem | null;
}

const WIZARD_STEPS = [
  { step: 1, title: "Basic Information", desc: "Title, date, location & banner" },
  { step: 2, title: "Competitions / Categories", desc: "Define competition categories" },
  { step: 3, title: "Registration Form", desc: "Configure required fields & docs" },
  { step: 4, title: "Registration Fees", desc: "Fees per participation type" },
  { step: 5, title: "Rounds", desc: "Multi-round setup" },
  { step: 6, title: "Review & Publish", desc: "Final summary & publish" },
];

export function EventForm({ mode, eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [activeStep, setActiveStep] = useState<number>(1);
  const [loading, setLoading] = useState(isEdit && !initialData);
  const [realEventId, setRealEventId] = useState<string>("");

  // Step 1: Basic Event Information
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("Dance");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<string>("registration_open");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Dates & Location
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("10:00");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("20:00");
  const [regStartDate, setRegStartDate] = useState("");
  const [regDeadline, setRegDeadline] = useState("");

  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [state, setState] = useState("Telangana");
  const [pincode, setPincode] = useState("500001");

  // Media
  const [bannerImg, setBannerImg] = useState("");

  // Step 2: Competitions List
  const [competitions, setCompetitions] = useState<
    Array<{ id: string; name: string; type: string; fee: number; minAge: number; maxAge: number; rules: string }>
  >([
    { id: "comp-1", name: "Solo Dance", type: "solo", fee: 500, minAge: 5, maxAge: 60, rules: "Solo stage performance (3-5 mins)" },
    { id: "comp-2", name: "Duo Dance", type: "duo", fee: 800, minAge: 5, maxAge: 60, rules: "Duo stage performance (3-5 mins)" },
    { id: "comp-3", name: "Group Dance", type: "group", fee: 2000, minAge: 5, maxAge: 60, rules: "Group performance (min 4 members)" },
    { id: "comp-4", name: "Best Photo", type: "solo", fee: 300, minAge: 5, maxAge: 60, rules: "Photo submission contest" },
  ]);

  // Step 3: Registration Form Config
  const [formConfig, setFormConfig] = useState<EventFormConfig>(getDefaultFormConfig(categoryName));
  const [requiredDocs, setRequiredDocs] = useState<string[]>(["Passport Photo", "Aadhaar / ID Proof", "Dance Video"]);

  // Step 4: Fees by Participation Type
  const [feeSolo, setFeeSolo] = useState<number>(500);
  const [feeDuo, setFeeDuo] = useState<number>(800);
  const [feeGroup, setFeeGroup] = useState<number>(2000);
  const [generalRegFee, setGeneralRegFee] = useState<number>(500);

  // Step 5: Multi-Round Setup
  const [roundsList, setRoundsList] = useState<Array<{ name: string; status: string; fee: number }>>([
    { name: "Round 1 / Auditions", status: "active", fee: 0 },
    { name: "Semi Final", status: "upcoming", fee: 0 },
    { name: "Final", status: "upcoming", fee: 0 },
  ]);

  // State & Loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate data when editing an event
  const populateData = (evt: EventItem) => {
    if (evt.id) setRealEventId(evt.id);
    setTitle(evt.title || "");
    setSlug(evt.slug || "");
    setAutoSlug(false);
    setShortDescription(evt.short_description || "");
    setDescription(evt.description || "");
    setCategoryName(evt.category || "Dance");
    setStatus(evt.status || "registration_open");
    setIsFeatured(Boolean(evt.is_featured));
    setIsPublished(evt.is_published !== undefined ? Boolean(evt.is_published) : true);

    if (evt.rawDate || evt.event_date) {
      const dt = evt.rawDate || evt.event_date || "";
      setEventStartDate(dt.includes("T") ? dt.split("T")[0] : dt);
    }
    if (evt.venue) setVenue(evt.venue);
    if (evt.city) setCity(evt.city);
    if (evt.banner_url || evt.banner_image || evt.img) setBannerImg(evt.banner_url || evt.banner_image || evt.img || "");

    const fee = typeof evt.registrationFee === "number" ? evt.registrationFee : evt.registration_fee || 0;
    setGeneralRegFee(fee);

    if (evt.form_config) {
      setFormConfig(evt.form_config);
      if (evt.form_config.competitions && Array.isArray(evt.form_config.competitions)) {
        setCompetitions(evt.form_config.competitions);
      }
      if (evt.form_config.feeStructure) {
        if (evt.form_config.feeStructure.solo) setFeeSolo(evt.form_config.feeStructure.solo);
        if (evt.form_config.feeStructure.duo) setFeeDuo(evt.form_config.feeStructure.duo);
        if (evt.form_config.feeStructure.group) setFeeGroup(evt.form_config.feeStructure.group);
      }
    }
  };

  useEffect(() => {
    async function initForm() {
      if (isEdit) {
        setLoading(true);
        if (initialData) {
          populateData(initialData);
        } else if (eventId) {
          const evt = await getEventByIdOrSlug(eventId);
          if (evt) populateData(evt);
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

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") setBannerImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addCompetition = () => {
    const newComp = {
      id: `comp-${Date.now()}`,
      name: "New Competition",
      type: "solo",
      fee: 500,
      minAge: 5,
      maxAge: 60,
      rules: "Performance rules...",
    };
    setCompetitions((prev) => [...prev, newComp]);
  };

  const removeCompetition = (id: string) => {
    setCompetitions((prev) => prev.filter((c) => c.id !== id));
  };

  const addRound = () => {
    setRoundsList((prev) => [
      ...prev,
      { name: `Round ${prev.length + 1}`, status: "upcoming", fee: 0 },
    ]);
  };

  const removeRound = (idx: number) => {
    setRoundsList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (isPublishAction: boolean) => {
    if (isSubmitting) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg("Event Title is required.");
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const mergedFormConfig: EventFormConfig = {
        ...formConfig,
        competitions,
        feeStructure: {
          solo: feeSolo,
          duo: feeDuo,
          group: feeGroup,
        },
      };

      const payload: any = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        short_description: shortDescription || title,
        description: description || shortDescription || title,
        category: categoryName,
        event_date: eventStartDate ? `${eventStartDate}T${eventStartTime || "10:00"}:00Z` : new Date().toISOString(),
        venue: venue || "Venue TBA",
        address,
        city: city || "Hyderabad",
        state,
        pincode,
        banner_image: bannerImg,
        registration_required: true,
        registration_fee: feeSolo || generalRegFee || 0,
        price: feeSolo || generalRegFee || 0,
        required_documents: requiredDocs,
        form_config: mergedFormConfig,
        status: isPublishAction ? "registration_open" : "draft",
        is_featured: isFeatured,
        is_published: isPublishAction,
      };

      if (isEdit && (realEventId || eventId)) {
        const targetId = realEventId || eventId || "";
        payload.id = targetId;
        const res = await updateEvent(targetId, payload);
        if (res.success) {
          setSuccessMsg("Event updated successfully!");
          setTimeout(() => {
            router.refresh();
            router.push("/admin/events");
          }, 800);
        } else {
          setErrorMsg(res.error || "Unable to update event.");
          setIsSubmitting(false);
        }
      } else {
        const res = await createEvent(payload);
        if (res.success) {
          setSuccessMsg("New event created successfully!");
          setTimeout(() => {
            router.refresh();
            router.push("/admin/events");
          }, 800);
        } else {
          setErrorMsg(res.error || "Failed to create event.");
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
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
        {/* STEP 1: Basic Event Information */}
        {activeStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Step 1: Basic Event Information
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="warangal-dance-championship"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                Short Description
              </label>
              <input
                type="text"
                placeholder="National dance competition event in Telangana"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6 }}>
                  Event Date
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
                Banner / Poster Image
              </label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Image URL or upload file"
                  value={bannerImg}
                  onChange={(e) => setBannerImg(e.target.value)}
                  style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1px solid #CBD5E1", fontSize: 14, outline: "none" }}
                />
                <label style={{ padding: "11px 18px", borderRadius: 10, background: "#F1F5F9", color: "#334155", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                  Browse...
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])} style={{ display: "none" }} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Competitions / Categories */}
        {activeStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
                  Step 2: Competitions / Categories
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                  Define individual competition categories for this event.
                </p>
              </div>
              <button
                type="button"
                onClick={addCompetition}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "#7C3AED", color: "#fff", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
              >
                <Plus size={16} /> + Add Competition
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {competitions.map((c, idx) => (
                <div key={c.id} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 40px", gap: 12, alignItems: "center" }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Competition Name</label>
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const updated = [...competitions];
                        updated[idx].name = e.target.value;
                        setCompetitions(updated);
                      }}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, outline: "none", marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Category Type</label>
                    <select
                      value={c.type}
                      onChange={(e) => {
                        const updated = [...competitions];
                        updated[idx].type = e.target.value;
                        setCompetitions(updated);
                      }}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, outline: "none", marginTop: 4, background: "#fff" }}
                    >
                      <option value="solo">Solo</option>
                      <option value="duo">Duo</option>
                      <option value="trio">Trio</option>
                      <option value="group">Group</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: "#64748B" }}>Fee (₹)</label>
                    <input
                      type="number"
                      value={c.fee}
                      onChange={(e) => {
                        const updated = [...competitions];
                        updated[idx].fee = Number(e.target.value);
                        setCompetitions(updated);
                      }}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, outline: "none", marginTop: 4 }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCompetition(c.id)}
                    style={{ background: "#FEE2E2", border: "none", color: "#DC2626", borderRadius: 8, padding: 8, cursor: "pointer", marginTop: 16 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Registration Form Configuration */}
        {activeStep === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Step 3: Registration Form Configuration
            </h2>
            <FormConfigEditor formConfig={formConfig} onChange={setFormConfig} eventTitle={title || "Event"} categoryName={categoryName || "Dance"} />
          </div>
        )}

        {/* STEP 4: Registration Fees */}
        {activeStep === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0 }}>
              Step 4: Registration Fees
            </h2>
            <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
              Configure fees dynamically by participation type.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Solo Participation</div>
                <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Fee (₹)</label>
                <input
                  type="number"
                  value={feeSolo}
                  onChange={(e) => setFeeSolo(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 15, fontWeight: 800, color: "#7C3AED", outline: "none" }}
                />
              </div>

              <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Duo Participation</div>
                <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Fee (₹)</label>
                <input
                  type="number"
                  value={feeDuo}
                  onChange={(e) => setFeeDuo(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 15, fontWeight: 800, color: "#7C3AED", outline: "none" }}
                />
              </div>

              <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 14, border: "1px solid #E2E8F0" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>Group Participation</div>
                <label style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}>Fee (₹)</label>
                <input
                  type="number"
                  value={feeGroup}
                  onChange={(e) => setFeeGroup(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 15, fontWeight: 800, color: "#7C3AED", outline: "none" }}
                />
              </div>
            </div>
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
                  Configure progression rounds (e.g. Round 1, Semi Final, Final).
                </p>
              </div>
              <button
                type="button"
                onClick={addRound}
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
                    onClick={() => removeRound(idx)}
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
            <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 20, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 12 }}>
              <div><strong>Event Title:</strong> {title || "Not specified"}</div>
              <div><strong>Location:</strong> {venue}, {city}</div>
              <div><strong>Event Date:</strong> {eventStartDate || "TBA"}</div>
              <div><strong>Competitions ({competitions.length}):</strong> {competitions.map((c) => c.name).join(", ")}</div>
              <div><strong>Fee Structure:</strong> Solo: ₹{feeSolo} | Duo: ₹{feeDuo} | Group: ₹{feeGroup}</div>
              <div><strong>Configured Rounds ({roundsList.length}):</strong> {roundsList.map((r) => r.name).join(" → ")}</div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid #E2E8F0" }}>
          <button
            type="button"
            disabled={activeStep === 1}
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
              cursor: activeStep === 1 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              style={{
                padding: "10px 20px",
                borderRadius: 12,
                background: "#F1F5F9",
                color: "#334155",
                border: "none",
                fontWeight: 800,
                fontSize: 13.5,
                cursor: "pointer",
              }}
            >
              Save Draft
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
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                }}
              >
                <CheckCircle2 size={18} /> {isSubmitting ? "Publishing..." : "Publish Event"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
