"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Upload,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Image as ImageIcon,
  Shield,
  Tag,
  DollarSign,
  FileText,
  Users,
  Settings,
  Globe,
  Star,
  Check,
} from "lucide-react";
import { EventItem, createEvent, updateEvent, getEventByIdOrSlug } from "@/services/event.service";
import { EventFormConfig, getDefaultFormConfig } from "@/types/event-config";
import { FormConfigEditor } from "@/components/events/FormConfigEditor";

interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}

interface JudgeItem {
  name: string;
  role: string;
  img: string;
  description: string;
}

export interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: EventItem | null;
}

export function EventForm({ mode, eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(isEdit && !initialData);
  // Stores the actual Supabase UUID after loading — used as the update target.
  // The URL param (eventId) may be a slug; we always update by UUID.
  const [realEventId, setRealEventId] = useState<string>("");

  // Dynamic Options
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [danceStylesList, setDanceStylesList] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Section 1: Basic Event Information
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("Dance");
  const [danceStyleId, setDanceStyleId] = useState("");
  const [danceStyleName, setDanceStyleName] = useState("Hip Hop");
  const [status, setStatus] = useState<string>("registration_open");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Section 2: Event Date & Registration Dates
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("10:00");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("20:00");
  const [regStartDate, setRegStartDate] = useState("");
  const [regDeadline, setRegDeadline] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");

  // Section 3: Venue & Location
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [state, setState] = useState("Telangana");
  const [pincode, setPincode] = useState("500001");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Section 4: Event Images
  const [bannerImg, setBannerImg] = useState("");
  const [mobileBannerImg, setMobileBannerImg] = useState("");
  const [thumbnailImg, setThumbnailImg] = useState("");

  // Section 5: Event Registration Settings
  const [regRequired, setRegRequired] = useState(true);
  const [regFee, setRegFee] = useState<number>(500);
  const [maxParticipants, setMaxParticipants] = useState<number>(500);
  const [minAge, setMinAge] = useState<number>(5);
  const [maxAge, setMaxAge] = useState<number>(60);
  const [regType, setRegType] = useState<"individual" | "team" | "both">("individual");
  const [maxTeamSize, setMaxTeamSize] = useState<number>(10);
  const [allowMultiCats, setAllowMultiCats] = useState(false);
  const [regFormType, setRegFormType] = useState("standard");

  // Section 6: Participation Categories
  const [selectedCats, setSelectedCats] = useState<string[]>(["Solo", "Duo", "Group"]);

  // Section 7: Dance Styles
  const [selectedStyles, setSelectedStyles] = useState<string[]>(["Classical", "Hip Hop", "Western", "Contemporary", "Bollywood"]);

  // Section 8: Event Rules & Requirements
  const [rules, setRules] = useState("1. Performance duration must be 3-5 minutes.\n2. Bring music track in USB/AUX.\n3. Stage costumes must be decent.\n4. Judges' decision is final.");
  const [terms, setTerms] = useState("By registering, participants agree to follow CGS Entertainments competition guidelines and terms.");

  // Section 9: Participant Requirements
  const [requiredDocs, setRequiredDocs] = useState<string[]>(["Profile Photo", "ID Proof", "Dance Video"]);

  // Section 10: Payment Settings
  const [paymentRequired, setPaymentRequired] = useState(true);
  const [currency, setCurrency] = useState("INR");
  const [refundPolicy, setRefundPolicy] = useState("Registration fee is non-refundable.");
  const [paymentDeadline, setPaymentDeadline] = useState("");

  // Section 11: Event Schedule
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { time: "10:00 AM", title: "Registration & Check-in", description: "Reporting at venue counter" },
    { time: "11:00 AM", title: "Opening Auditions Round", description: "First stage performance round" },
    { time: "02:00 PM", title: "Final Stage Performances", description: "Selected finalists round" },
    { time: "06:00 PM", title: "Prize Distribution Ceremony", description: "Awards & closing performance" },
  ]);

  // Section 12: Judges / Guests
  const [judges, setJudges] = useState<JudgeItem[]>([
    { name: "Shiamak Davar", role: "Chief Judge", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", description: "Celebrity Choreographer" },
    { name: "Shakti Mohan", role: "Guest Judge", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", description: "Contemporary Dance Star" },
  ]);

  // Section 13: Contact Information
  const [contactName, setContactName] = useState("CGS Event Team");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [contactEmail, setContactEmail] = useState("cgsentertainments01@gmail.com");
  const [contactWhatsapp, setContactWhatsapp] = useState("+91 98765 43210");

  // Section 14: SEO Settings
  const [showSeo, setShowSeo] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("dance, modeling, cgs, talent, competition, 2026");

  // Section 15: Homepage Display Settings
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [showRegButton, setShowRegButton] = useState(true);

  // Dynamic Registration Form Config
  const [formConfig, setFormConfig] = useState<EventFormConfig>(getDefaultFormConfig(categoryName));

  // Submit & Guard State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate data when editing an event
  const populateData = (evt: EventItem) => {
    // Always capture the real DB UUID so updates target the correct row
    if (evt.id) setRealEventId(evt.id);
    setTitle(evt.title || "");
    setSlug(evt.slug || "");
    setAutoSlug(false);
    setShortDescription(evt.short_description || "");
    setDescription(evt.description || "");
    setCategoryName(evt.category || "Dance");
    setCategoryId(evt.category_id || "");
    setDanceStyleName(evt.dance_style || "Hip Hop");
    setDanceStyleId(evt.dance_style_id || "");
    setStatus(evt.status || "registration_open");
    setIsFeatured(Boolean(evt.is_featured));
    setIsPublished(evt.is_published !== undefined ? Boolean(evt.is_published) : true);

    if (evt.rawDate || evt.event_date) {
      const dt = evt.rawDate || evt.event_date || "";
      if (dt.includes("T")) {
        setEventStartDate(dt.split("T")[0]);
      } else {
        setEventStartDate(dt);
      }
    }
    if (evt.event_start_time) setEventStartTime(evt.event_start_time);
    if (evt.event_end_date) setEventEndDate(evt.event_end_date);
    if (evt.event_end_time) setEventEndTime(evt.event_end_time);
    if (evt.registration_start_date) setRegStartDate(evt.registration_start_date.split("T")[0]);
    if (evt.registration_deadline) setRegDeadline(evt.registration_deadline.split("T")[0]);

    setVenue(evt.venue || "");
    setAddress(evt.address || "");
    setCity(evt.city || "Hyderabad");
    setState(evt.state || "Telangana");
    setPincode(evt.pincode || "500001");

    setBannerImg(evt.img || evt.banner_url || evt.banner_image || "");
    setMobileBannerImg(evt.mobile_banner_image || evt.img || "");
    setThumbnailImg(evt.thumbnail_image || evt.img || "");

    const fee = typeof evt.registrationFee === "number" ? evt.registrationFee : evt.registration_fee || 0;
    setRegFee(fee);

    const seats = evt.maxSeats || evt.max_participants || 500;
    setMaxParticipants(seats);
    if (evt.min_age) setMinAge(evt.min_age);
    if (evt.max_age) setMaxAge(evt.max_age);

    if (evt.rules_regulations) setRules(evt.rules_regulations);
    if (evt.terms_conditions) setTerms(evt.terms_conditions);
    if (evt.schedule && Array.isArray(evt.schedule)) setSchedule(evt.schedule);
    if (evt.judges && Array.isArray(evt.judges)) setJudges(evt.judges);
    if (evt.required_documents) setRequiredDocs(evt.required_documents);
    if (evt.participation_categories) setSelectedCats(evt.participation_categories);
    if (evt.dance_styles) setSelectedStyles(evt.dance_styles);
    if (evt.form_config) {
      setFormConfig(evt.form_config);
    } else {
      setFormConfig(getDefaultFormConfig(evt.category || "Dance"));
    }
  };

  // Fetch Category / Style Options and Initial Event Data for Edit Mode
  useEffect(() => {
    async function initForm() {
      try {
        setLoading(true);
        const [catRes, styleRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/dance-styles"),
        ]);
        if (catRes.ok) {
          const cData = await catRes.json();
          setCategoriesList(cData.categories || []);
        }
        if (styleRes.ok) {
          const sData = await styleRes.json();
          setDanceStylesList(sData.styles || []);
        }

        if (isEdit) {
          if (initialData) {
            populateData(initialData);
          } else if (eventId) {
            const evt = await getEventByIdOrSlug(eventId);
            if (evt) {
              populateData(evt);
            } else {
              setErrorMsg("Could not load event for editing.");
            }
          }
        }
      } catch (err) {
        console.error("Form initialization error:", err);
      } finally {
        setLoading(false);
      }
    }
    initForm();
  }, [isEdit, eventId, initialData]);

  // Handle Title change -> auto slug generation
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug && !isEdit) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  // Handle Image File conversion to base64 preview
  const handleImageFile = (file: File, setter: (val: string) => void) => {
    if (file.size > 8 * 1024 * 1024) {
      alert("Image size too large (max 8MB).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") setter(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Schedule Management
  const addScheduleRow = () => {
    setSchedule((prev) => [...prev, { time: "00:00 AM", title: "New Schedule Item", description: "Details..." }]);
  };
  const updateScheduleRow = (idx: number, key: keyof ScheduleItem, val: string) => {
    setSchedule((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  };
  const removeScheduleRow = (idx: number) => {
    setSchedule((prev) => prev.filter((_, i) => i !== idx));
  };

  // Judges Management
  const addJudgeRow = () => {
    setJudges((prev) => [...prev, { name: "Judge Name", role: "Guest Judge", img: "", description: "Expert" }]);
  };
  const updateJudgeRow = (idx: number, key: keyof JudgeItem, val: string) => {
    setJudges((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: val };
      return copy;
    });
  };
  const removeJudgeRow = (idx: number) => {
    setJudges((prev) => prev.filter((_, i) => i !== idx));
  };

  // FORM SUBMISSION (CREATE or EDIT)
  const handleSubmit = async (isPublishAction: boolean) => {
    if (isSubmitting) return; // PREVENT DOUBLE SUBMISSION

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg("Event Title is required.");
      return;
    }
    if (!venue.trim()) {
      setErrorMsg("Venue Name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        short_description: shortDescription || title,
        description: description || shortDescription || title,
        category: categoryName,
        category_id: categoryId,
        dance_style: danceStyleName,
        dance_style_id: danceStyleId,
        event_date: eventStartDate ? `${eventStartDate}T${eventStartTime || "10:00"}:00Z` : new Date().toISOString(),
        event_start_time: eventStartTime,
        event_end_date: eventEndDate,
        event_end_time: eventEndTime,
        registration_start_date: regStartDate,
        registration_deadline: regDeadline,
        timezone,
        venue,
        address,
        city,
        state,
        pincode,
        google_maps_url: googleMapsUrl,
        banner_image: bannerImg,
        mobile_banner_image: mobileBannerImg || bannerImg,
        thumbnail_image: thumbnailImg || bannerImg,
        registration_required: regRequired,
        registration_fee: Number(regFee) || 0,
        price: Number(regFee) || 0,
        max_participants: Number(maxParticipants) || 500,
        maxSeats: Number(maxParticipants) || 500,
        min_age: Number(minAge) || 5,
        max_age: Number(maxAge) || 60,
        registration_type: regType,
        max_team_size: Number(maxTeamSize) || 10,
        allow_multiple_categories: allowMultiCats,
        registration_form_type: regFormType,
        participation_categories: selectedCats,
        dance_styles: selectedStyles,
        rules_regulations: rules,
        terms_conditions: terms,
        required_documents: requiredDocs,
        payment_required: paymentRequired,
        currency,
        refund_policy: refundPolicy,
        schedule,
        judges,
        contact_info: { name: contactName, phone: contactPhone, email: contactEmail, whatsapp: contactWhatsapp },
        seo: { title: seoTitle || title, description: seoDescription || shortDescription, keywords: seoKeywords, og_image: bannerImg },
        homepage_settings: { show_on_homepage: showOnHomepage, is_featured: isFeatured, display_order: 1, show_registration_button: showRegButton },
        form_config: formConfig,
        status: isPublishAction ? "registration_open" : "draft",
        is_featured: isFeatured,
        is_published: isPublishAction,
      };

      if (isEdit && eventId) {
        // EDIT MODE: PUT to update existing row.
        // Use realEventId (UUID from the loaded event) when available;
        // fall back to the URL param (eventId) which the API also accepts.
        const updateTarget = realEventId || eventId;
        payload.id = updateTarget;
        const res = await updateEvent(updateTarget, payload);
        if (res.success) {
          setSuccessMsg("Event updated successfully!");
          setTimeout(() => {
            router.push("/admin/events");
          }, 1000);
        } else {
          setErrorMsg(res.error || "Unable to update event. The event could not be saved. Please try again.");
          setIsSubmitting(false);
        }
      } else {
        // CREATE MODE: POST to create new row (no existing event ID)
        const res = await createEvent(payload);
        if (res.success) {
          setSuccessMsg("New event created successfully!");
          setTimeout(() => {
            router.push("/admin/events");
          }, 1000);
        } else {
          setErrorMsg(res.error || "Failed to create event.");
          setIsSubmitting(false);
        }
      }
    } catch (err: any) {
      console.error("Form submit error:", err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB", padding: "60px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#6B7280" }}>
          Loading event form options...
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", paddingBottom: 80 }}>
      {/* Top Bar Navigation */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #E5E7EB", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link
              href="/admin/events"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#374151",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: 0 }}>
                {isEdit ? "Edit Event" : "Create New Event"}
              </h1>
              <p style={{ fontSize: 12, color: "#6B7280", margin: 0, fontWeight: 500 }}>
                {isEdit ? "Update details for this event" : "Add a new competition event to CGS Entertainments"}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "1.5px solid #E5E7EB",
                background: "#fff",
                color: "#374151",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 800,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(109,40,217,0.3)",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? (isEdit ? "Updating Event..." : "Creating Event...") : isEdit ? "Update & Publish Event" : "Publish Event Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div style={{ maxWidth: 1280, margin: "28px auto 0", padding: "0 32px" }}>
        {/* Error Notification */}
        {errorMsg && (
          <div style={{ padding: "14px 20px", borderRadius: 12, background: "#FEF2F2", border: "1.5px solid #FCA5A5", color: "#991B1B", fontWeight: 700, fontSize: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={20} color="#DC2626" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div style={{ padding: "14px 20px", borderRadius: 12, background: "#DCFCE7", border: "1.5px solid #86EFAC", color: "#166534", fontWeight: 700, fontSize: 14, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={20} color="#166534" />
            <span>{successMsg}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28 }}>
          {/* LEFT FORM SECTIONS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* SECTION 1: Basic Event Information */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 18, padding: "24px" }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: "0 0 16px" }}>
                1. Basic Event Information
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Event Title <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. National Dance Championship 2026"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Event Slug
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. national-dance-championship-2026"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setAutoSlug(false);
                      }}
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Event Category
                    </label>
                    <select
                      value={categoryName}
                      onChange={(e) => {
                        setCategoryName(e.target.value);
                        const match = categoriesList.find((c) => c.name.toLowerCase() === e.target.value.toLowerCase());
                        if (match) setCategoryId(match.id);
                      }}
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    >
                      {categoriesList.length > 0 ? (
                        categoriesList.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))
                      ) : (
                        <>
                          <option value="Dance">Dance</option>
                          <option value="Modeling">Modeling</option>
                          <option value="Acting">Acting</option>
                          <option value="Singing">Singing</option>
                          <option value="Music">Music</option>
                          <option value="Photography">Photography</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Short Description / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="Short catchy summary for cards and search results"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Full Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detailed event background, highlights, and judging criteria"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none", fontFamily: "inherit" }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Dates & Times */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 18, padding: "24px" }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: "0 0 16px" }}>
                2. Event Date &amp; Registration Dates
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Event Date <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Event Start Time
                  </label>
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Registration Start Date
                  </label>
                  <input
                    type="date"
                    value={regStartDate}
                    onChange={(e) => setRegStartDate(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={regDeadline}
                    onChange={(e) => setRegDeadline(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Venue & Location */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 18, padding: "24px" }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: "0 0 16px" }}>
                3. Venue &amp; Location Details
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Venue Name <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HICC Convention Centre"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Full Address</label>
                  <input
                    type="text"
                    placeholder="Full street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none" }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Event Images */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 18, padding: "24px" }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: "0 0 16px" }}>
                4. Event Images &amp; Banners
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Banner Image URL or File
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={bannerImg}
                    onChange={(e) => setBannerImg(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none" }}
                  />
                  <div style={{ marginTop: 8 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0], setBannerImg)}
                      style={{ fontSize: 12 }}
                    />
                  </div>
                  {bannerImg && (
                    <div style={{ position: "relative", width: "100%", height: 140, marginTop: 10, borderRadius: 10, overflow: "hidden", border: "1px solid #E5E7EB" }}>
                      <img src={bannerImg} alt="Banner Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 5: Registration Settings */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 18, padding: "24px" }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: "0 0 16px" }}>
                5. Registration Fees &amp; Seats
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Registration Fee (₹) <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={regFee}
                    onChange={(e) => setRegFee(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Max Participant Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none" }}
                  >
                    <option value="registration_open">Registration Open</option>
                    <option value="registration_closed">Registration Closed</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DYNAMIC REGISTRATION FORM CONFIGURATION */}
            <FormConfigEditor
              formConfig={formConfig}
              onChange={setFormConfig}
              eventTitle={title}
              categoryName={categoryName}
            />

            {/* SECTION 8: Rules & Terms */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 18, padding: "24px" }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: "0 0 16px" }}>
                6. Competition Rules &amp; Guidelines
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Rules &amp; Regulations
                  </label>
                  <textarea
                    rows={4}
                    value={rules}
                    onChange={(e) => setRules(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none", fontFamily: "inherit" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Terms &amp; Conditions
                  </label>
                  <textarea
                    rows={2}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 13.5, outline: "none", fontFamily: "inherit" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: Settings & Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Publishing Toggles */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 18, padding: "20px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: "0 0 14px" }}>
                Publishing Settings
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#374151" }}>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    style={{ accentColor: "#6D28D9", width: 16, height: 16 }}
                  />
                  Published on Website
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#374151" }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ accentColor: "#6D28D9", width: 16, height: 16 }}
                  />
                  Featured Event
                </label>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              onClick={() => handleSubmit(isPublished)}
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 900,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 6px 20px rgba(109,40,217,0.3)",
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? (isEdit ? "Updating Event..." : "Creating Event...") : isEdit ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
