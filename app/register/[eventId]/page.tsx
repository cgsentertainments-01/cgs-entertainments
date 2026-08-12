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
  FileText,
  AlertCircle,
  Ban,
} from "lucide-react";
import { EventItem, getEventByIdOrSlug } from "@/services/event.service";

/* ─── HOVER BUTTON COMPONENTS ─── */
function SaveContinueBtn({ label = "Save & Continue", onClick, disabled = false }: { label?: string; onClick?: () => void; disabled?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 38px",
        borderRadius: 14,
        background: disabled
          ? "#9CA3AF"
          : h
          ? "linear-gradient(135deg, #5B21B6 0%, #6D28D9 100%)"
          : "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
        color: "#fff",
        border: "none",
        fontSize: 15,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled
          ? "none"
          : h
          ? "0 10px 32px rgba(109, 40, 217, 0.45)"
          : "0 6px 20px rgba(109, 40, 217, 0.32)",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: disabled ? "none" : h ? "translateY(-3px) scale(1.02)" : "translateY(0) scale(1)",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {label}
      <ChevronRight size={18} style={{ transform: h && !disabled ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />
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

function PayNowBtn({ amount, onClick, disabled = false, loading = false }: { amount: string; onClick: () => void; disabled?: boolean; loading?: boolean }) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
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
        background: disabled
          ? "#9CA3AF"
          : h
          ? "linear-gradient(135deg, #047857 0%, #059669 100%)"
          : "linear-gradient(135deg, #059669 0%, #10B981 100%)",
        color: "#fff",
        border: "none",
        fontSize: 17,
        fontWeight: 900,
        letterSpacing: 0.3,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        boxShadow: disabled
          ? "none"
          : h
          ? "0 12px 36px rgba(5, 150, 105, 0.45)"
          : "0 6px 22px rgba(5, 150, 105, 0.32)",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: disabled || loading ? "none" : h ? "translateY(-3px) scale(1.02)" : "translateY(0) scale(1)",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <Lock size={18} /> {loading ? "Processing..." : `Pay ${amount} Now`}
      {!loading && <ChevronRight size={19} style={{ transform: h && !disabled ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />}
    </button>
  );
}

/* ─── MAIN PAGE ─── */
export default function RegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const eventIdParam = (params?.eventId as string) || "";

  // Dynamic Event Data state fetched from Database Single Source of Truth
  const [evt, setEvt] = useState<EventItem | null>(null);
  const [eventLoading, setEventLoading] = useState(true);

  const [activeStep, setActiveStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const [compType, setCompType] = useState("Solo");
  const [ageCat, setAgeCat] = useState("Teens (16 – 20 Yrs)");
  const [aadhaarFile, setAadhaarFile] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoFileObject, setVideoFileObject] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);

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

  // Load current event from Database using ID or Slug
  useEffect(() => {
    async function fetchCurrentEvent() {
      if (!eventIdParam) return;
      try {
        setEventLoading(true);
        const data = await getEventByIdOrSlug(eventIdParam);
        setEvt(data);
        if (data && data.dance_styles && data.dance_styles.length > 0) {
          setForm((prev) => ({ ...prev, danceStyle: data.dance_styles?.[0] || "" }));
        }
      } catch (err) {
        console.error("Error fetching event for registration:", err);
        setEvt(null);
      } finally {
        setEventLoading(false);
      }
    }
    fetchCurrentEvent();
  }, [eventIdParam]);

  // Auth Redirect check
  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : `/register/${eventIdParam}`;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, router, eventIdParam]);

  // Check Registration Availability (Status, Deadline, Capacity)
  const isRegistrationClosed = React.useMemo(() => {
    if (!evt) return false;
    if (!evt.is_published) return true;
    const st = String(evt.status || "").toLowerCase();
    if (st === "registration_closed" || st === "cancelled" || st === "draft" || st === "completed") {
      return true;
    }
    if (evt.registration_deadline) {
      const deadline = new Date(evt.registration_deadline);
      if (!isNaN(deadline.getTime()) && new Date() > deadline) {
        return true;
      }
    }
    if (evt.max_participants && evt.current_participants !== undefined && evt.current_participants >= evt.max_participants) {
      return true;
    }
    return false;
  }, [evt]);

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg(null);

    if (isRegistrationClosed) {
      setErrorMsg("Registrations for this event are currently closed.");
      return false;
    }

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

  // Secure Backend Registration & Payment Handler
  const handleFinalPayment = async () => {
    if (!form.agreeCorrect || !form.agreeRules || !form.signature.trim() || !form.signatureDate.trim()) {
      setErrorMsg("Please agree to the declaration and enter your signature full name before paying.");
      return;
    }

    if (!evt) return;

    setSubmittingPayment(true);
    setErrorMsg(null);

    try {
      // 0. Upload Video File to Supabase Storage if file selected
      let uploadedVideoUrl: string | null = null;
      if (videoFileObject) {
        setVideoUploading(true);
        setUploadProgressMsg("Uploading video to Supabase Storage...");
        try {
          const uploadFormData = new FormData();
          uploadFormData.append("file", videoFileObject);
          const uploadRes = await fetch("/api/uploads/video", {
            method: "POST",
            body: uploadFormData,
          });
          const uploadData = await uploadRes.json();

          if (!uploadRes.ok || !uploadData.success) {
            setErrorMsg(uploadData.error || "Video upload failed. Registration cannot proceed without video.");
            setSubmittingPayment(false);
            setVideoUploading(false);
            setUploadProgressMsg(null);
            return;
          }

          uploadedVideoUrl = uploadData.videoPath || uploadData.path;
        } catch (uploadErr: any) {
          console.error("Video upload error:", uploadErr);
          setErrorMsg("Network error while uploading video. Please check your connection and try again.");
          setSubmittingPayment(false);
          setVideoUploading(false);
          setUploadProgressMsg(null);
          return;
        } finally {
          setVideoUploading(false);
          setUploadProgressMsg(null);
        }
      } else if (videoFile && (videoFile.startsWith("http://") || videoFile.startsWith("https://"))) {
        uploadedVideoUrl = videoFile;
      }

      // 1. Submit Registration Form to Backend API
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: evt.id,
          numParticipants: form.numParticipants,
          videoUrl: uploadedVideoUrl,
          videoPath: uploadedVideoUrl,
          participant: {
            fullName: form.fullName,
            dob: form.dob,
            age: form.age,
            gender: form.gender,
            email: form.email,
            phone: form.mobile,
            whatsapp: form.whatsapp,
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            emergencyName: form.emergencyName,
            emergencyMobile: form.emergencyMobile,
            emergencyRelation: form.emergencyRelation,
            videoUrl: uploadedVideoUrl,
            videoPath: uploadedVideoUrl,
          },
          categoryId: evt.category_id,
          danceStyleId: evt.dance_style_id,
          notes: JSON.stringify({
            compType,
            ageCat,
            danceStyle: form.danceStyle,
            teamName: form.teamName,
            songTitle: form.songTitle,
            duration: form.duration,
            academy: form.academy,
            videoUrl: uploadedVideoUrl,
            videoPath: uploadedVideoUrl,
          }),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to complete registration. Please try again.");
        setSubmittingPayment(false);
        return;
      }

      // If registration is free or already confirmed immediately
      if (data.confirmed || !data.razorpayOrderId || data.amount === 0) {
        router.push(`/registration-success?registrationId=${encodeURIComponent(data.registrationId)}`);
        return;
      }

      // 2. Process Razorpay Payment & Backend Verification
      const triggerVerification = async (payDetails: any) => {
        try {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              registrationId: data.registrationId,
              razorpayOrderId: payDetails.razorpay_order_id || data.razorpayOrderId,
              razorpayPaymentId: payDetails.razorpay_payment_id || `pay_${Date.now()}`,
              razorpaySignature: payDetails.razorpay_signature || "simulated_signature",
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            router.push(`/registration-success?registrationId=${encodeURIComponent(data.registrationId)}`);
          } else {
            setErrorMsg(verifyData.error || "Payment verification failed. Please contact support.");
            setSubmittingPayment(false);
          }
        } catch (vErr) {
          console.error("Verification error:", vErr);
          setErrorMsg("Payment verification network error. Please refresh and check your registration status.");
          setSubmittingPayment(false);
        }
      };

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount * 100,
        currency: data.currency || "INR",
        name: "CGS Entertainments",
        description: `Event Registration - ${evt.title}`,
        order_id: data.razorpayOrderId,
        handler: function (response: any) {
          triggerVerification(response);
        },
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.mobile,
        },
        theme: {
          color: "#6D28D9",
        },
        modal: {
          ondismiss: function () {
            setSubmittingPayment(false);
          },
        },
      };

      if (typeof (window as any).Razorpay !== "undefined") {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct simulation fallback if Razorpay script is not pre-loaded on window
        await triggerVerification({
          razorpay_order_id: data.razorpayOrderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: "simulated_signature",
        });
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setErrorMsg("Network error during registration. Please check your connection.");
      setSubmittingPayment(false);
    }
  };

  if (eventLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
        <Navbar />
        <div style={{ marginTop: 140, textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 18, color: "#6B7280", fontWeight: 700 }}>Fetching latest event information...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!evt) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
        <Navbar />
        <div style={{ marginTop: 140, textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎭</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#111827", marginBottom: 8 }}>Event Not Found</h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>
            The requested event registration page could not be found or has been removed.
          </p>
          <Link
            href="/events"
            style={{
              padding: "10px 24px",
              background: "#6D28D9",
              color: "#fff",
              borderRadius: 10,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Explore Available Events
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const feeDisplay = typeof evt.registration_fee === "number" ? `₹${evt.registration_fee}` : `₹${evt.registrationFee || 0}`;

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
            src={evt.img || evt.banner_image || "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1600&q=85"}
            alt={evt.title}
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
          <h1 style={{ fontSize: 40, fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: -1 }}>
            {evt.title} — <span style={{ color: "#A78BFA" }}>Registration</span>
          </h1>
          <p style={{ fontSize: 15, color: "#C4B5FD", margin: "0 0 24px", fontWeight: 500 }}>
            {evt.venue}, {evt.city} · {evt.date} · Fee: {feeDisplay}
          </p>

          {/* Trust Badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }} className="reg-badges">
            {[
              { icon: <ShieldCheck size={18} color="#A78BFA" />, title: "Secure Registration", sub: "Official CGS Entertainments Portal" },
              { icon: <Zap size={18} color="#A78BFA" />, title: "Instant Access", sub: "Digital Participant Pass" },
              { icon: <Mail size={18} color="#A78BFA" />, title: "Automated Receipts", sub: "Sent to your email & WhatsApp" },
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
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }} className="cgs-main-container">
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

      {/* ── Main Container ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 32px 60px" }}>
        {/* Closed Registration Warning Alert */}
        {isRegistrationClosed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 24px",
              borderRadius: 16,
              background: "#FEF2F2",
              border: "1.5px solid #FCA5A5",
              color: "#991B1B",
              marginBottom: 24,
              boxShadow: "0 4px 16px rgba(239,68,68,0.12)",
            }}
          >
            <Ban size={24} color="#DC2626" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>Registration Closed for this Event</div>
              <div style={{ fontSize: 13, color: "#7F1D1D", marginTop: 2, fontWeight: 500 }}>
                This event is currently closed for new registrations by the organizer (Status: {evt.status}).
              </div>
            </div>
          </div>
        )}

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
                      disabled={isRegistrationClosed}
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
                      disabled={isRegistrationClosed}
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
                      disabled={isRegistrationClosed}
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
                      disabled={isRegistrationClosed}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.gender && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer Not To Say</option>
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
                      disabled={isRegistrationClosed}
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
                      disabled={isRegistrationClosed}
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
                      disabled={isRegistrationClosed}
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
                      disabled={isRegistrationClosed}
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
                    disabled={isRegistrationClosed}
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
                      disabled={isRegistrationClosed}
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
                      disabled={isRegistrationClosed}
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
                      disabled={isRegistrationClosed}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.pincode && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>
                </div>

                {/* Step 1 Action Button */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28, paddingTop: 20, borderTop: "1.5px solid #F3F4F6" }}>
                  <SaveContinueBtn onClick={goToNextStep} disabled={isRegistrationClosed} />
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
                    {(evt.participation_categories && evt.participation_categories.length > 0
                      ? evt.participation_categories
                      : ["Solo", "Duo", "Group"]
                    ).map((t) => (
                      <label key={t} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#111827" }}>
                        <input
                          type="radio"
                          name="compType"
                          checked={compType === t}
                          onChange={() => setCompType(t)}
                          disabled={isRegistrationClosed}
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
                          disabled={isRegistrationClosed}
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
                      Dance / Performance Style <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <select
                      value={form.danceStyle}
                      onChange={(e) => updateField("danceStyle", e.target.value)}
                      disabled={isRegistrationClosed}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.danceStyle && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    >
                      <option value="">Select style</option>
                      {(evt.dance_styles && evt.dance_styles.length > 0
                        ? evt.dance_styles
                        : ["Classical", "Hip Hop", "Contemporary", "Bollywood", "Western", "Folk"]
                      ).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
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
                      disabled={isRegistrationClosed}
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
                      max={evt.max_team_size || 20}
                      placeholder="Enter number"
                      value={form.numParticipants}
                      onChange={(e) => updateField("numParticipants", e.target.value)}
                      disabled={isRegistrationClosed}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${!form.numParticipants && errorMsg ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, outline: "none", background: "#FAFAFA" }}
                    />
                  </div>
                </div>

                {/* Step 2 Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 28, paddingTop: 20, borderTop: "1.5px solid #F3F4F6" }}>
                  <BackBtn onClick={goToPrevStep} />
                  <SaveContinueBtn onClick={goToNextStep} disabled={isRegistrationClosed} />
                </div>
              </div>
            )}

            {/* STEP 3: Uploads */}
            {activeStep === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                    <Upload size={22} color="#6D28D9" />
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>Uploads</h2>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }} className="form-grid-2">
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                        Track / Performance Title <span style={{ color: "#EF4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter track title"
                        value={form.songTitle}
                        onChange={(e) => updateField("songTitle", e.target.value)}
                        disabled={isRegistrationClosed}
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
                        disabled={isRegistrationClosed}
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
                          cursor: isRegistrationClosed ? "not-allowed" : "pointer",
                        }}
                      >
                        <span style={{ padding: "4px 12px", background: "#E5E7EB", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#374151" }}>Choose File</span>
                        <span style={{ fontSize: 12, color: aadhaarFile ? "#111827" : "#6B7280", fontWeight: aadhaarFile ? 700 : 500 }}>{aadhaarFile || "No file chosen"}</span>
                        <input
                          type="file"
                          disabled={isRegistrationClosed}
                          style={{ display: "none" }}
                          onChange={(e) => setAadhaarFile(e.target.files?.[0]?.name || null)}
                        />
                      </label>
                      <span style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4, display: "block" }}>PDF, JPG or PNG (Max 5MB)</span>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                        Audition Video <span style={{ color: "#EF4444" }}>*</span>
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
                          cursor: isRegistrationClosed ? "not-allowed" : "pointer",
                        }}
                      >
                        <span style={{ padding: "4px 12px", background: "#6D28D9", color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>Select Video</span>
                        <span style={{ fontSize: 12, color: videoFile ? "#111827" : "#6B7280", fontWeight: videoFile ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {videoFile || "No video selected"}
                        </span>
                        <input
                          type="file"
                          accept="video/*,.mp4,.mov,.webm,.avi"
                          disabled={isRegistrationClosed || videoUploading}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setVideoFile(file.name);
                              setVideoFileObject(file);
                            }
                          }}
                        />
                      </label>
                      <span style={{ fontSize: 11, color: "#6B7280", marginTop: 4, display: "block" }}>
                        Supported formats: MP4, MOV, WEBM (Max 100MB). Will be stored securely in Supabase Storage.
                      </span>

                      {/* Video Link option fallback */}
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: "#6B7280", marginBottom: 4 }}>Or paste Video URL (YouTube / Drive link):</div>
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={videoFile && !videoFileObject ? videoFile : ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVideoFile(val || null);
                            setVideoFileObject(null);
                          }}
                          disabled={isRegistrationClosed || videoUploading}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #E5E7EB",
                            fontSize: 13,
                            outline: "none",
                            background: "#FAFAFA",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 20, padding: "20px 28px" }}>
                  <BackBtn onClick={goToPrevStep} />
                  <SaveContinueBtn onClick={goToNextStep} disabled={isRegistrationClosed} />
                </div>
              </div>
            )}

            {/* STEP 4: Review & Payment */}
            {activeStep === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <CreditCard size={22} color="#6D28D9" />
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827", margin: 0 }}>Review Registration Details</h2>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, background: "#FAFAFA", border: "1.5px solid #F3F4F6", borderRadius: 14, padding: "20px", marginBottom: 24 }} className="form-grid-2">
                    <div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" }}>Event Title</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginTop: 2 }}>{evt.title}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" }}>Participant Name</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginTop: 2 }}>{form.fullName || "Not provided"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" }}>Category &amp; Style</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#6D28D9", marginTop: 2 }}>{compType} ({ageCat}) — {form.danceStyle || "Standard"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase" }}>Registration Fee</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#059669", marginTop: 2 }}>{feeDisplay}</div>
                    </div>
                  </div>

                  {/* Declaration & Rules */}
                  <div style={{ borderTop: "1.5px solid #F3F4F6", paddingTop: 20, marginTop: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 14 }}>Declaration &amp; Signature</h3>

                    {/* Rules & Regulations text from DB */}
                    {evt.rules_regulations && (
                      <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: "14px", marginBottom: 16, fontSize: 12.5, color: "#4B5563", lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 800, color: "#111827", marginBottom: 4 }}>Event Rules &amp; Guidelines:</div>
                        {evt.rules_regulations}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13.5, color: "#374151", fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={form.agreeCorrect}
                          onChange={(e) => updateField("agreeCorrect", e.target.checked)}
                          disabled={isRegistrationClosed}
                          style={{ accentColor: "#6D28D9", width: 17, height: 17 }}
                        />
                        I confirm that the information provided above is accurate and true.
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13.5, color: "#374151", fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={form.agreeRules}
                          onChange={(e) => updateField("agreeRules", e.target.checked)}
                          disabled={isRegistrationClosed}
                          style={{ accentColor: "#6D28D9", width: 17, height: 17 }}
                        />
                        I agree to abide by all competition rules and terms set by CGS Entertainments.
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
                          disabled={isRegistrationClosed}
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
                          disabled={isRegistrationClosed}
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
                      <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>Total Registration Fee</div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: "#6D28D9" }}>{feeDisplay}</div>
                    </div>
                  </div>

                  {uploadProgressMsg && (
                    <div style={{ padding: "10px 14px", background: "#F3E8FF", border: "1px solid #C4B5FD", borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 700, color: "#6D28D9", textAlign: "center" }}>
                      ⏳ {uploadProgressMsg}
                    </div>
                  )}

                  <PayNowBtn amount={feeDisplay} onClick={handleFinalPayment} disabled={isRegistrationClosed || videoUploading} loading={submittingPayment || videoUploading} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                    <BackBtn onClick={goToPrevStep} />
                    <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>🔒 Verified Razorpay Gateway &amp; SSL Encrypted</span>
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
                <Image src={evt.img || evt.banner_image || "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=85"} alt={evt.title} fill style={{ objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
                <span style={{ position: "absolute", bottom: 12, left: 14, padding: "4px 10px", borderRadius: 6, background: evt.badgeBg || "#6D28D9", color: "#fff", fontSize: 10, fontWeight: 800 }}>
                  {evt.badge || evt.category}
                </span>
              </div>

              <div style={{ padding: "20px" }}>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: "0 0 14px", lineHeight: 1.3 }}>{evt.title}</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#4B5563" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={15} color="#6D28D9" /> <span>{evt.date}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={15} color="#6D28D9" /> <span>{evt.event_start_time || "10:00 AM Onwards"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MapPin size={15} color="#EC4899" /> <span>{evt.location || evt.venue}</span>
                  </div>
                </div>

                <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1.5px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 600 }}>Registration Fee</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#6D28D9" }}>{feeDisplay}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Rules & Terms */}
            {(evt.rules_regulations || evt.terms_conditions) && (
              <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                  <FileText size={16} color="#6D28D9" /> Event Rules &amp; Terms
                </h4>
                <div style={{ fontSize: 12.5, color: "#4B5563", lineHeight: 1.6, maxHeight: 180, overflowY: "auto", paddingRight: 4 }}>
                  {evt.rules_regulations || evt.terms_conditions}
                </div>
              </div>
            )}

            {/* Card 3: Need Help? */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <HelpCircle size={18} color="#6D28D9" />
                <h4 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Need Help?</h4>
              </div>
              <p style={{ fontSize: 12.5, color: "#6B7280", margin: "0 0 14px", lineHeight: 1.5 }}>
                Our team is here to help you with your event registration.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#374151" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Phone size={14} color="#6D28D9" /> <span>+91 98765 43210</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Mail size={14} color="#6D28D9" /> <span>cgsentertainments01@gmail.com</span>
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
