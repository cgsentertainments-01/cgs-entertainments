"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Upload,
  ShieldCheck,
  Zap,
  HelpCircle,
  MessageCircle,
  Lock,
  Award,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

/* ─── EVENTS LOOKUP DATA ─── */
const EVENTS_LOOKUP: Record<string, {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  fee: string;
  prize: string;
  badge: string;
  badgeBg: string;
  img: string;
}> = {
  e1: {
    id: "e1",
    title: "National Dance Championship 2026",
    date: "20 – 22 May 2026",
    time: "9:00 AM Onwards",
    location: "Hyderabad, Telangana",
    venue: "HICC Convention Centre, Hyderabad",
    fee: "₹800",
    prize: "₹50,000",
    badge: "DANCE",
    badgeBg: "#312E81",
    img: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1200&q=85",
  },
  e2: {
    id: "e2",
    title: "Elite Modeling Show 2026",
    date: "10 June 2026",
    time: "5:00 PM – 10:00 PM",
    location: "Bangalore, Karnataka",
    venue: "The Leela Palace Ballroom, Bangalore",
    fee: "₹800",
    prize: "₹30,000",
    badge: "MODELING",
    badgeBg: "#1D4ED8",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85",
  },
  e4: {
    id: "e4",
    title: "Voice of India 2026",
    date: "30 June 2026",
    time: "6:00 PM – 11:00 PM",
    location: "Mumbai, Maharashtra",
    venue: "Nehru Centre Auditorium, Mumbai",
    fee: "₹600",
    prize: "₹75,000",
    badge: "SINGING",
    badgeBg: "#9D174D",
    img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85",
  },
};

const FALLBACK_EVENT = EVENTS_LOOKUP["e1"];

/* ─── HOVER BUTTON COMPONENTS ─── */
function SaveContinueBtn({ label = "Save & Continue", onClick }: { label?: string; onClick?: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 38px",
        borderRadius: 14,
        background: h
          ? "linear-gradient(135deg, #5B21B6 0%, #6D28D9 100%)"
          : "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
        color: "#fff",
        border: "none",
        fontSize: 15,
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: h
          ? "0 10px 32px rgba(109, 40, 217, 0.45)"
          : "0 6px 20px rgba(109, 40, 217, 0.32)",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: h ? "translateY(-3px) scale(1.02)" : "translateY(0) scale(1)",
      }}
    >
      {label}
      <ChevronRight size={18} style={{ transform: h ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "13px 26px",
        borderRadius: 12,
        border: `1.5px solid ${h ? "#6D28D9" : "#E5E7EB"}`,
        background: h ? "linear-gradient(135deg, #FAF5FF, #F3E8FF)" : "#fff",
        color: h ? "#6D28D9" : "#374151",
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.22s ease",
        transform: h ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <ChevronLeft size={16} style={{ transform: h ? "translateX(-4px)" : "translateX(0)", transition: "transform 0.2s" }} /> Back
    </button>
  );
}

function PayNowBtn({ amount, onClick }: { amount: string; onClick: () => void }) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        padding: "16px 32px",
        borderRadius: 16,
        background: h
          ? "linear-gradient(135deg, #047857 0%, #059669 100%)"
          : "linear-gradient(135deg, #059669 0%, #10B981 100%)",
        color: "#fff",
        border: "none",
        fontSize: 17,
        fontWeight: 900,
        letterSpacing: 0.3,
        cursor: "pointer",
        boxShadow: h
          ? "0 12px 36px rgba(5, 150, 105, 0.45)"
          : "0 6px 22px rgba(5, 150, 105, 0.32)",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: h ? "translateY(-3px) scale(1.02)" : "translateY(0) scale(1)",
      }}
    >
      <Lock size={18} /> Pay {amount} Now
      <ChevronRight size={19} style={{ transform: h ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />
    </button>
  );
}

/* ─── MAIN PAGE ─── */
export default function RegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const eventId = (params?.eventId as string) || "e1";
  const evt = EVENTS_LOOKUP[eventId] ?? FALLBACK_EVENT;

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : `/register/${eventId}`;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router, eventId]);

  const [activeStep, setActiveStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [compType, setCompType] = useState("Solo");
  const [ageCat, setAgeCat] = useState("Teens (16 – 20 Yrs)");
  const [aadhaarFile, setAadhaarFile] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    age: "",
    gender: "",
    parentName: "",
    mobile: "",
    whatsapp: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    danceStyle: "",
    teamName: "",
    numParticipants: "1",
    songTitle: "",
    duration: "",
    awards: "",
    academy: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyMobile: "",
    agreeCorrect: false,
    agreeRules: false,
    signature: "",
    signatureDate: "",
  });

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg(null);

    if (step === 1) {
      if (
        !form.fullName.trim() ||
        !form.dob.trim() ||
        !form.age.trim() ||
        !form.gender.trim() ||
        !form.mobile.trim() ||
        !form.whatsapp.trim() ||
        !form.email.trim() ||
        !form.address.trim() ||
        !form.city.trim() ||
        !form.state.trim() ||
        !form.pincode.trim()
      ) {
        setErrorMsg("Please fill in all required fields marked with * before moving to the next step.");
        return false;
      }
    }

    if (step === 2) {
      if (!form.danceStyle.trim() || !form.numParticipants.trim()) {
        setErrorMsg("Please select your dance style and number of participants before proceeding.");
        return false;
      }
    }

    if (step === 3) {
      if (
        !form.songTitle.trim() ||
        !form.duration.trim() ||
        !aadhaarFile ||
        !videoFile
      ) {
        setErrorMsg("Please upload your required documents and fill song details before proceeding.");
        return false;
      }
    }

    return true;
  };

  const goToNextStep = () => {
    if (!validateStep(activeStep)) return;

    const next = activeStep + 1;
    setActiveStep(next);
    if (next > maxReachedStep) setMaxReachedStep(next);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  const goToPrevStep = () => {
    if (activeStep > 1) {
      setErrorMsg(null);
      setActiveStep((prev) => prev - 1);
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  const handleStepClick = (stepNum: number) => {
    if (stepNum < activeStep) {
      setErrorMsg(null);
      setActiveStep(stepNum);
    } else if (stepNum > activeStep) {
      if (validateStep(activeStep)) {
        setActiveStep(stepNum);
      }
    }
  };

  const handleFinalPayment = () => {
    if (!form.agreeCorrect || !form.agreeRules || !form.signature.trim() || !form.signatureDate.trim()) {
      setErrorMsg("Please agree to the declaration and enter your signature full name before paying.");
      return;
    }
    router.push("/registration-success");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />

      {/* ── Top Header Hero Banner ── */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(135deg, #0F0A28 0%, #1E1B4B 50%, #312E81 100%)",
          paddingTop: 64,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 0.35, pointerEvents: "none" }}>
          <Image
            src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1600&q=85"
            alt="Event Registration Dancers"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #0F0A28 0%, rgba(15,10,40,0.6) 50%, #0F0A28 100%)" }} />
        </div>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 32px 48px", position: "relative", zIndex: 10 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Link href="/" style={{ fontSize: 13, color: "#C4B5FD", textDecoration: "none", fontWeight: 500 }}>
              Home
            </Link>
            <ChevronRight size={14} color="#7C3AED" />
            <Link href="/events" style={{ fontSize: 13, color: "#C4B5FD", textDecoration: "none", fontWeight: 500 }}>
              Events
            </Link>
            <ChevronRight size={14} color="#7C3AED" />
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>Register</span>
          </div>

          {/* Page Title */}
          <h1 style={{ fontSize: 42, fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: -1 }}>
            Event <span style={{ color: "#A78BFA" }}>Registration</span>
          </h1>
          <p style={{ fontSize: 15, color: "#C4B5FD", margin: "0 0 24px", fontWeight: 500 }}>
            Fill in the details below to register for the event.
          </p>

          {/* 3 Trust Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }} className="reg-badges">
            {[
              { icon: <ShieldCheck size={18} color="#A78BFA" />, title: "Secure Registration", sub: "Your data is safe with us" },
              { icon: <Zap size={18} color="#A78BFA" />, title: "Easy Process", sub: "Takes only a few minutes" },
              { icon: <Mail size={18} color="#A78BFA" />, title: "Instant Confirmation", sub: "Get updates on your email" },
            ].map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {b.icon}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: "#fff" }}>{b.title}</div>
                  <div style={{ fontSize: 11, color: "#C4B5FD", fontWeight: 500 }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4-Step Progress Stepper Bar ── */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid #E5E7EB", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }} className="stepper-row">
            {[
              { num: 1, label: "Personal Details" },
              { num: 2, label: "Competition Details" },
              { num: 3, label: "Uploads" },
              { num: 4, label: "Review & Payment" },
            ].map((step) => {
              const active = activeStep === step.num;
              const completed = activeStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => handleStepClick(step.num)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "8px 12px",
                    borderRadius: 10,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: completed ? "#059669" : active ? "#6D28D9" : "#F3F4F6",
                      color: completed || active ? "#fff" : "#6B7280",
                      fontSize: 13.5,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: active ? "0 4px 14px rgba(109,40,217,0.35)" : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {completed ? <CheckCircle2 size={19} color="#fff" /> : step.num}
                  </div>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: active ? 800 : 600,
                      color: active ? "#6D28D9" : completed ? "#111827" : "#6B7280",
                    }}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Container: Form Steps (Left) & Sidebar (Right) ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 32px 60px" }}>
        {/* Error Warning Alert */}
        {errorMsg && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 20px",
              borderRadius: 14,
              background: "#FEF2F2",
              border: "1.5px solid #FCA5A5",
              color: "#991B1B",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 24,
              boxShadow: "0 4px 14px rgba(239,68,68,0.12)",
            }}
          >
            <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }} className="reg-main-grid">
          {/* ── LEFT COLUMN: STEP WIZARD FORM ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* STEP 1: Personal Details */}
            {activeStep === 1 && (
              <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <User size={22} color="#6D28D9" />
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>Personal Details</h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="form-grid-4">
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Full Name <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.fullName && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Date of Birth <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => updateField("dob", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.dob && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 13.5, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Age <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter age"
                      value={form.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.age && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }} className="form-grid-3">
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Gender <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.gender && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Parent/Guardian Name <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>(for under 18)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter parent/guardian name"
                      value={form.parentName}
                      onChange={(e) => updateField("parentName", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }} className="form-grid-3">
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Mobile Number <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={form.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.mobile && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      WhatsApp Number <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter WhatsApp number"
                      value={form.whatsapp}
                      onChange={(e) => updateField("whatsapp", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.whatsapp && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Email ID <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.email && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Full Address <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter full address"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.address && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }} className="form-grid-3">
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      City <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter city"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.city && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      State <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <select
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.state && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    >
                      <option value="">Select state</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      PIN Code <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter PIN code"
                      value={form.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.pincode && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>
                </div>

                {/* Step 1 Action Button */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28, paddingTop: 20, borderTop: "1.5px solid #F3F4F6" }}>
                  <SaveContinueBtn onClick={goToNextStep} />
                </div>
              </div>
            )}

            {/* STEP 2: Competition Details */}
            {activeStep === 2 && (
              <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <Award size={22} color="#6D28D9" />
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>Competition Details</h2>
                </div>

                {/* Competition Type */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>
                    Competition Type <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: 20 }}>
                    {["Solo", "Duo", "Group"].map((t) => (
                      <label key={t} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#111827" }}>
                        <input
                          type="radio"
                          name="compType"
                          checked={compType === t}
                          onChange={() => setCompType(t)}
                          style={{ accentColor: "#6D28D9", width: 16, height: 16 }}
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Age Category */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>
                    Age Category <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} className="form-grid-3">
                    {[
                      "Tiny Tots (3 – 5 Yrs)",
                      "Kids (6 – 10 Yrs)",
                      "Juniors (11 – 15 Yrs)",
                      "Teens (16 – 20 Yrs)",
                      "Seniors (21 – 30 Yrs)",
                      "Open Category (All Ages)",
                    ].map((cat) => (
                      <label
                        key={cat}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 14px",
                          border: `1.5px solid ${ageCat === cat ? "#6D28D9" : "#E5E7EB"}`,
                          background: ageCat === cat ? "#F5F3FF" : "#FAFAFA",
                          borderRadius: 12,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 700,
                          color: ageCat === cat ? "#6D28D9" : "#374151",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <input
                          type="radio"
                          name="ageCat"
                          checked={ageCat === cat}
                          onChange={() => setAgeCat(cat)}
                          style={{ accentColor: "#6D28D9" }}
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="form-grid-3">
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Dance Style <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <select
                      value={form.danceStyle}
                      onChange={(e) => updateField("danceStyle", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.danceStyle && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    >
                      <option value="">Select dance style</option>
                      <option value="Classical">Classical</option>
                      <option value="Hip Hop">Hip Hop</option>
                      <option value="Contemporary">Contemporary</option>
                      <option value="Bollywood">Bollywood</option>
                      <option value="Western">Western</option>
                      <option value="Folk">Folk</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Team Name <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>(For Duo/Group)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter team name"
                      value={form.teamName}
                      onChange={(e) => updateField("teamName", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                      Number of Participants <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Enter number"
                      value={form.numParticipants}
                      onChange={(e) => updateField("numParticipants", e.target.value)}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.numParticipants && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>
                </div>

                {/* Step 2 Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 20, borderTop: "1.5px solid #F3F4F6" }}>
                  <BackBtn onClick={goToPrevStep} />
                  <SaveContinueBtn onClick={goToNextStep} />
                </div>
              </div>
            )}

            {/* STEP 3: Uploads & Emergency Contact */}
            {activeStep === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Uploads Box */}
                <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                    <Upload size={22} color="#6D28D9" />
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>Uploads</h2>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="form-grid-2">
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                        Song Title <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter song title"
                        value={form.songTitle}
                        onChange={(e) => updateField("songTitle", e.target.value)}
                        style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.songTitle && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                        Duration (in minutes) <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 3:45"
                        value={form.duration}
                        onChange={(e) => updateField("duration", e.target.value)}
                        style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.duration && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                      />
                    </div>
                  </div>

                  {/* File Inputs */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 16 }} className="form-grid-2">
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                        Aadhaar Card / School ID <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          border: `1.5px solid ${!aadhaarFile && errorMsg ? "#EF4444" : "#E5E7EB"}`,
                          borderRadius: 10,
                          background: "#FAFAFA",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ padding: "4px 12px", background: "#E5E7EB", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#374151" }}>Choose File</span>
                        <span style={{ fontSize: 12, color: aadhaarFile ? "#111827" : "#6B7280", fontWeight: aadhaarFile ? 700 : 500 }}>{aadhaarFile || "No file chosen"}</span>
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) => setAadhaarFile(e.target.files?.[0]?.name || null)}
                        />
                      </label>
                      <span style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4, display: "block" }}>PDF, JPG or PNG (Max 5MB)</span>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                        Dance Video (MP4 or Link) <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 14px",
                          border: `1.5px solid ${!videoFile && errorMsg ? "#EF4444" : "#E5E7EB"}`,
                          borderRadius: 10,
                          background: "#FAFAFA",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ padding: "4px 12px", background: "#E5E7EB", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#374151" }}>Choose File</span>
                        <span style={{ fontSize: 12, color: videoFile ? "#111827" : "#6B7280", fontWeight: videoFile ? 700 : 500 }}>{videoFile || "No file chosen"}</span>
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) => setVideoFile(e.target.files?.[0]?.name || null)}
                        />
                      </label>
                      <span style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4, display: "block" }}>MP4 file (Max 100MB) or YouTube link</span>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 16 }} className="form-grid-2">
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                        Awards Won <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter awards"
                        value={form.awards}
                        onChange={(e) => updateField("awards", e.target.value)}
                        style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                        Dance Academy Name <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter academy name"
                        value={form.academy}
                        onChange={(e) => updateField("academy", e.target.value)}
                        style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3 Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 20, padding: "20px 28px" }}>
                  <BackBtn onClick={goToPrevStep} />
                  <SaveContinueBtn onClick={goToNextStep} />
                </div>
              </div>
            )}

            {/* STEP 4: Review & Payment */}
            {activeStep === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Review Details Box */}
                <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <CreditCard size={22} color="#6D28D9" />
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>Review Registration Details</h2>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, background: "#FAFAFA", border: "1.5px solid #F3F4F6", borderRadius: 14, padding: "20px", marginBottom: 24 }} className="form-grid-2">
                    <div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" }}>Participant Name</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginTop: 2 }}>{form.fullName || "Not provided"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" }}>Category &amp; Style</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#6D28D9", marginTop: 2 }}>{compType} ({ageCat}) — {form.danceStyle || "Bollywood"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" }}>Contact</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginTop: 2 }}>{form.mobile || "Not provided"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" }}>Location</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginTop: 2 }}>{form.city || "Hyderabad"}, {form.state || "Telangana"}</div>
                    </div>
                  </div>

                  {/* Declaration & Rules */}
                  <div style={{ borderTop: "1.5px solid #F3F4F6", paddingTop: 20, marginTop: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 14 }}>Declaration &amp; Signature</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13.5, color: "#374151", fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={form.agreeCorrect}
                          onChange={(e) => updateField("agreeCorrect", e.target.checked)}
                          style={{ accentColor: "#6D28D9", width: 17, height: 17 }}
                        />
                        I confirm that the information provided above is accurate and true.
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13.5, color: "#374151", fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={form.agreeRules}
                          onChange={(e) => updateField("agreeRules", e.target.checked)}
                          style={{ accentColor: "#6D28D9", width: 17, height: 17 }}
                        />
                        I agree to abide by all competition rules and guidelines set by CGS Entertainments.
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="form-grid-2">
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                          Participant Signature (Type Full Name) <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Type your full name"
                          value={form.signature}
                          onChange={(e) => updateField("signature", e.target.value)}
                          style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.signature && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                          Date <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          type="date"
                          value={form.signatureDate}
                          onChange={(e) => updateField("signatureDate", e.target.value)}
                          style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.signatureDate && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 13.5, outline: "none", background: "#FAFAFA" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Payment Box */}
                <div style={{ background: "#fff", border: "1.5px solid #C4B5FD", borderRadius: 22, padding: "28px 32px", boxShadow: "0 8px 32px rgba(109,40,217,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#6D28D9", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 }}>Ready to Register</div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#111827" }}>Complete Your Payment</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Total Fee</div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: "#6D28D9" }}>{evt.fee}</div>
                    </div>
                  </div>

                  <PayNowBtn amount={evt.fee} onClick={handleFinalPayment} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                    <BackBtn onClick={goToPrevStep} />
                    <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>🔒 SSL Encrypted &amp; Secure Payment</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Event Summary & Help Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Card 1: Event Summary */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ position: "relative", width: "100%", height: 160 }}>
                <Image src={evt.img} alt={evt.title} fill style={{ objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
                <span style={{ position: "absolute", bottom: 12, left: 14, padding: "4px 10px", borderRadius: 6, background: evt.badgeBg, color: "#fff", fontSize: 10, fontWeight: 800 }}>
                  {evt.badge}
                </span>
              </div>

              <div style={{ padding: "20px" }}>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: "0 0 14px", lineHeight: 1.3 }}>{evt.title}</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#4B5563" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={15} color="#6D28D9" /> <span>{evt.date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={15} color="#6D28D9" /> <span>{evt.time}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={15} color="#EC4899" /> <span>{evt.location}</span>
                  </div>
                </div>

                <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1.5px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>Registration Fee</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#6D28D9" }}>{evt.fee} <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>Per Participant</span></span>
                </div>
              </div>
            </div>

            {/* Card 2: What you get? */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>What you get?</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  "Exciting Cash Prizes",
                  "Certificates for all participants",
                  "Medals & Trophies",
                  "Media Coverage",
                  "Professional Stage",
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", fontWeight: 500 }}>
                    <CheckCircle2 size={16} color="#6D28D9" /> {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Need Help? */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <HelpCircle size={18} color="#6D28D9" />
                <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Need Help?</h4>
              </div>
              <p style={{ fontSize: 12.5, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.5 }}>
                Our team is here to help you with any queries.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#374151" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Phone size={14} color="#6D28D9" /> <span>+91 98765 43210</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={14} color="#6D28D9" /> <span>support@cgsentertainments.com</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#059669", fontWeight: 700, cursor: "pointer" }}>
                  <MessageCircle size={15} color="#059669" /> <span>Chat on WhatsApp</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom 100% Secure Registration Bar ── */}
      <div style={{ background: "#F5F3FF", borderTop: "1.5px solid #EDE9FE", padding: "24px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }} className="sec-bar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock size={20} color="#6D28D9" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>100% Secure Registration</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Your information is safe with us and will never be shared.</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 24, fontSize: 12, fontWeight: 700, color: "#4B5563" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Lock size={14} color="#059669" /> SSL Secured</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><ShieldCheck size={14} color="#2563EB" /> Secure Payments</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><ShieldCheck size={14} color="#6D28D9" /> Privacy Protected</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @media (max-width: 960px) {
          .reg-main-grid { grid-template-columns: 1fr !important; }
          .stepper-row { flex-wrap: wrap !important; height: auto !important; padding: 12px 0 !important; gap: 8px !important; }
          .form-grid-4 { grid-template-columns: 1fr !important; }
          .form-grid-3 { grid-template-columns: 1fr !important; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
