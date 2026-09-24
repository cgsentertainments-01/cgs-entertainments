"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Users,
  Plus,
  Trash2,
  Check,
  Sparkles,
} from "lucide-react";
import { EventItem, getEventByIdOrSlug, normalizeEventIdentifier, deduplicateParticipationTypes } from "@/services/event.service";
import { getEventLifecycleStatus } from "@/lib/event-lifecycle";
import {
  EventFormConfig,
  getDefaultFormConfig,
  ParticipationTypeConfig,
} from "@/types/event-config";

/* ─── HOVER BUTTON COMPONENTS ─── */
function SaveContinueBtn({
  label = "Continue",
  onClick,
  disabled = false,
}: {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
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
      <ChevronRight
        size={18}
        style={{
          transform: h && !disabled ? "translateX(4px)" : "translateX(0)",
          transition: "transform 0.2s",
        }}
      />
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
      <ChevronLeft
        size={16}
        style={{
          transform: h ? "translateX(-4px)" : "translateX(0)",
          transition: "transform 0.2s",
        }}
      />{" "}
      Back
    </button>
  );
}

function PayNowBtn({
  amount,
  onClick,
  disabled = false,
  loading = false,
  loadingText,
}: {
  amount: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string | null;
}) {
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
      <Lock size={18} />
      {loading ? loadingText || "Processing..." : `Pay ${amount} Now`}
      {!loading && (
        <ChevronRight
          size={19}
          style={{
            transform: h && !disabled ? "translateX(4px)" : "translateX(0)",
            transition: "transform 0.2s",
          }}
        />
      )}
    </button>
  );
}

export default function DynamicRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const rawEventIdParam = (params?.eventId as string) || "";
  const cleanEventIdParam = useMemo(() => normalizeEventIdentifier(rawEventIdParam), [rawEventIdParam]);

  // Event loading & target event state
  const [evt, setEvt] = useState<EventItem | null>(null);
  const [eventLoading, setEventLoading] = useState(true);

  // Stepper state: Step 1 to Step 5
  const [activeStep, setActiveStep] = useState(1);
  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Dynamic Event Form Configuration
  const formConfig: EventFormConfig = useMemo(() => {
    if (evt && evt.form_config) {
      return evt.form_config;
    }
    return getDefaultFormConfig(evt?.category || "Dance", evt?.registration_fee);
  }, [evt]);

  // Active participation types (deduplicated)
  const activeParticipationTypes = useMemo(() => {
    const list = (formConfig.participationTypes || []).filter((pt) => pt.isActive !== false);
    return deduplicateParticipationTypes(list);
  }, [formConfig]);

  // Selected participation type state
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");

  useEffect(() => {
    if (activeParticipationTypes.length > 0 && !selectedTypeId) {
      setSelectedTypeId(activeParticipationTypes[0].id);
    }
  }, [activeParticipationTypes, selectedTypeId]);

  const currentParticipationType: ParticipationTypeConfig = useMemo(() => {
    const matched = activeParticipationTypes.find((pt) => pt.id === selectedTypeId);
    return (
      matched ||
      activeParticipationTypes[0] || {
        id: "solo",
        name: "Solo",
        minParticipants: 1,
        maxParticipants: 1,
        fee: evt?.registration_fee || 0,
        isActive: true,
        order: 1,
      }
    );
  }, [activeParticipationTypes, selectedTypeId, evt]);

  // Dynamic Participant count state
  const [numParticipants, setNumParticipants] = useState<number>(1);

  // Multi-participant check: Duo, Trio, Group/Multiple
  const isMultiParticipant = useMemo(() => {
    if (!currentParticipationType) return false;
    return (currentParticipationType.maxParticipants || 1) > 1 || (currentParticipationType.minParticipants || 1) > 1;
  }, [currentParticipationType]);

  // When selected participation type changes, adjust numParticipants to min
  useEffect(() => {
    if (currentParticipationType) {
      setNumParticipants(currentParticipationType.minParticipants || 1);
    }
  }, [currentParticipationType]);

  // Authoritative Fee calculation: Event + Participation Type
  const calculatedFeeInfo = useMemo(() => {
    const fee = currentParticipationType ? currentParticipationType.fee : (evt?.registration_fee || 0);
    return {
      amount: fee,
      display: `₹${fee.toLocaleString("en-IN")}`,
      unit: fee,
      numParticipants,
    };
  }, [currentParticipationType, evt, numParticipants]);

  // Team Information state
  const [teamInfo, setTeamInfo] = useState({
    teamName: "",
    teamLeader: "",
    teamContact: "",
  });

  // Participant 1 (Primary) State
  const [primaryParticipant, setPrimaryParticipant] = useState({
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Additional Participants State (for Duo, Trio, Group)
  const [additionalParticipants, setAdditionalParticipants] = useState<any[]>([]);

  // Keep additionalParticipants array in sync with numParticipants - 1
  useEffect(() => {
    const requiredExtra = Math.max(0, numParticipants - 1);
    setAdditionalParticipants((prev) => {
      if (prev.length < requiredExtra) {
        const added = Array.from({ length: requiredExtra - prev.length }).map(() => ({
          fullName: "",
          dob: "",
          gender: "",
          phone: "",
          email: "",
          address: "",
        }));
        return [...prev, ...added];
      } else if (prev.length > requiredExtra) {
        return prev.slice(0, requiredExtra);
      }
      return prev;
    });
  }, [numParticipants]);

  // Custom Field values state
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});

  // Document Uploads state
  const [uploadedDocs, setUploadedDocs] = useState<
    Record<string, { file?: File; url?: string; name: string }>
  >({});

  // Declaration state
  const [agreeCorrect, setAgreeCorrect] = useState(false);
  const [agreeRules, setAgreeRules] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signatureDate, setSignatureDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Fetch Target Event Details
  useEffect(() => {
    async function initEvent() {
      if (!cleanEventIdParam) {
        setEventLoading(false);
        return;
      }
      try {
        setEventLoading(true);
        console.log(`[FRONTEND REGISTRATION] Loading event parameter: "${cleanEventIdParam}"`);
        const targetData = await getEventByIdOrSlug(cleanEventIdParam);
        if (targetData) {
          console.log(`[FRONTEND REGISTRATION] Loaded event: "${targetData.title}" (${targetData.id})`);
          setEvt(targetData);
        } else {
          console.warn(`[FRONTEND REGISTRATION] Event not found for parameter: "${cleanEventIdParam}"`);
          setEvt(null);
        }
      } catch (err) {
        console.error("Error loading event data:", err);
        setEvt(null);
      } finally {
        setEventLoading(false);
      }
    }
    initEvent();
  }, [cleanEventIdParam]);

  // Session Storage Persistence Key: Consistent Key using cleanEventIdParam or evt.id
  const sessionStorageKey = useMemo(() => {
    const keyId = evt?.id || cleanEventIdParam;
    return keyId ? `cgs_reg_${keyId}` : "";
  }, [evt?.id, cleanEventIdParam]);

  // Session Storage Persistence: Restore Saved State
  useEffect(() => {
    if (sessionStorageKey) {
      try {
        const saved = sessionStorage.getItem(sessionStorageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.selectedTypeId) setSelectedTypeId(parsed.selectedTypeId);
          if (parsed.numParticipants) setNumParticipants(parsed.numParticipants);
          if (parsed.teamInfo) setTeamInfo(parsed.teamInfo);
          if (parsed.primaryParticipant) setPrimaryParticipant(parsed.primaryParticipant);
          if (parsed.additionalParticipants) setAdditionalParticipants(parsed.additionalParticipants);
          if (parsed.customFieldValues) setCustomFieldValues(parsed.customFieldValues);
          if (parsed.signatureName) setSignatureName(parsed.signatureName);
          if (parsed.agreeCorrect !== undefined) setAgreeCorrect(parsed.agreeCorrect);
          if (parsed.agreeRules !== undefined) setAgreeRules(parsed.agreeRules);
        }
      } catch (e) {
        console.warn("Could not restore session storage state:", e);
      }
    }
  }, [sessionStorageKey]);

  // Session Storage Persistence: Save Form Changes
  useEffect(() => {
    if (sessionStorageKey && evt?.id) {
      try {
        const stateToSave = {
          selectedTypeId,
          numParticipants,
          teamInfo,
          primaryParticipant,
          additionalParticipants,
          customFieldValues,
          signatureName,
          agreeCorrect,
          agreeRules,
        };
        sessionStorage.setItem(sessionStorageKey, JSON.stringify(stateToSave));
      } catch (e) {
        console.warn("Could not save to session storage:", e);
      }
    }
  }, [
    sessionStorageKey,
    evt?.id,
    selectedTypeId,
    numParticipants,
    teamInfo,
    primaryParticipant,
    additionalParticipants,
    customFieldValues,
    signatureName,
    agreeCorrect,
    agreeRules,
  ]);

  // Auth Redirect check
  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname
          : `/register/${cleanEventIdParam}`;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, router, cleanEventIdParam]);

  // Check Registration Availability
  const isRegistrationClosed = useMemo(() => {
    if (!evt) return false;
    if (evt.event_type === "upcoming") return true;
    if (!evt.is_published) return true;
    const st = String(evt.status || "").toLowerCase();
    if (
      st === "registration_closed" ||
      st === "cancelled" ||
      st === "draft" ||
      st === "completed"
    ) {
      return true;
    }
    if (evt.registration_deadline) {
      const deadline = new Date(evt.registration_deadline);
      if (!isNaN(deadline.getTime()) && new Date() > deadline) {
        return true;
      }
    }
    if (
      evt.max_participants &&
      evt.current_participants !== undefined &&
      evt.current_participants >= evt.max_participants
    ) {
      return true;
    }
    return false;
  }, [evt]);

  // Validation function per step
  const validateStep = (step: number): boolean => {
    setErrorMsg(null);

    // Lifecycle validation check
    const lifecycle = evt ? (evt.lifecycle || getEventLifecycleStatus(evt)) : null;
    if (lifecycle && !lifecycle.ctaEnabled) {
      setErrorMsg(`Registrations for this event are not available: ${lifecycle.message}`);
      return false;
    }

    if (isRegistrationClosed) {
      setErrorMsg("Registrations for this event are currently closed.");
      return false;
    }

    if (!evt) {
      setErrorMsg("Event could not be loaded.");
      return false;
    }

    // Step 1: Participation Type Selection
    if (step === 1) {
      if (!currentParticipationType) {
        setErrorMsg("Please select a participation option.");
        return false;
      }
      if (isMultiParticipant && !teamInfo.teamName.trim()) {
        setErrorMsg(`Team Name is required for ${currentParticipationType.name} registration.`);
        return false;
      }
    }

    // Step 2: Participant Details
    if (step === 2) {
      if (isMultiParticipant && !teamInfo.teamName.trim()) {
        setErrorMsg(`Team Name is required for ${currentParticipationType.name} registration.`);
        return false;
      }

      const enabledBasic = (formConfig.basicFields || []).filter((f) => f.enabled && f.required);
      for (const field of enabledBasic) {
        if (field.id === "fullName" && !primaryParticipant.fullName.trim()) {
          setErrorMsg("Full Name for Participant #1 is required.");
          return false;
        }
        if (field.id === "dob" && !primaryParticipant.dob.trim()) {
          setErrorMsg("Date of Birth for Participant #1 is required.");
          return false;
        }
        if (field.id === "gender" && !primaryParticipant.gender.trim()) {
          setErrorMsg("Gender for Participant #1 is required.");
          return false;
        }
        if (field.id === "phone" && !primaryParticipant.phone.trim()) {
          setErrorMsg("Phone Number for Participant #1 is required.");
          return false;
        }
        if (field.id === "email" && !primaryParticipant.email.trim()) {
          setErrorMsg("Email Address for Participant #1 is required.");
          return false;
        }
        if (field.id === "address" && !primaryParticipant.address.trim()) {
          setErrorMsg("Address for Participant #1 is required.");
          return false;
        }
      }

      // Validate Custom Required Fields
      const requiredCustom = (formConfig.customFields || []).filter((cf) => cf.required);
      for (const cf of requiredCustom) {
        if (!customFieldValues[cf.id] || !String(customFieldValues[cf.id]).trim()) {
          setErrorMsg(`Please fill in required custom field: '${cf.label}'.`);
          return false;
        }
      }

      // Validate Additional Participants if multi-participant
      for (let i = 0; i < additionalParticipants.length; i++) {
        const extra = additionalParticipants[i];
        if (!extra.fullName || !extra.fullName.trim()) {
          setErrorMsg(`Full Name for Participant #${i + 2} is required.`);
          return false;
        }
      }
    }

    // Step 3: Documents Upload
    if (step === 3) {
      const requiredDocsConfig = (formConfig.documents || []).filter((d) => d.required);
      for (const docReq of requiredDocsConfig) {
        if (!uploadedDocs[docReq.id] || (!uploadedDocs[docReq.id].file && !uploadedDocs[docReq.id].url)) {
          setErrorMsg(`Required document missing: '${docReq.name}'. Please upload a file.`);
          return false;
        }
      }
    }

    // Step 4: Review & Terms Agreement
    if (step === 4) {
      if (!agreeCorrect || !agreeRules) {
        setErrorMsg("Please agree to the declaration terms.");
        return false;
      }
      if (!signatureName.trim()) {
        setErrorMsg("Please type your full name digital signature.");
        return false;
      }
    }

    return true;
  };

  // Step Navigation Handlers
  const goToNextStep = () => {
    setErrorMsg(null);
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

  // Header Stepper Click Handler
  const handleStepClick = (targetStep: number) => {
    if (targetStep === activeStep) return;
    setErrorMsg(null);

    if (targetStep < activeStep) {
      setActiveStep(targetStep);
      window.scrollTo({ top: 380, behavior: "smooth" });
    } else {
      for (let s = 1; s < targetStep; s++) {
        if (!validateStep(s)) {
          setActiveStep(s);
          window.scrollTo({ top: 380, behavior: "smooth" });
          return;
        }
      }
      setActiveStep(targetStep);
      if (targetStep > maxReachedStep) setMaxReachedStep(targetStep);
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  // Direct URL Step Protection Guard
  useEffect(() => {
    if (!eventLoading && evt) {
      if (activeStep > 1) {
        for (let s = 1; s < activeStep; s++) {
          if (!validateStep(s)) {
            setActiveStep(s);
            break;
          }
        }
      }
    }
  }, [activeStep, eventLoading, evt]);

  // Payment State Machine
  type PaymentState = "idle" | "creating_pending" | "creating_order" | "verifying" | "verified" | "failed";
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const paymentProcessingRef = useRef(false);

  // Dynamic Razorpay Checkout SDK Script Loader
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ─── PHASE 1 REFACTORED REGISTRATION & PAYMENT PIPELINE ───
  // 1. Create PENDING registration in Supabase BEFORE payment
  // 2. Pass exact pending registrationId to Razorpay order creation
  // 3. Launch Razorpay modal
  // 4. Update the EXACT SAME registration row upon signature verification
  const handleFinalPayment = async () => {
    if (submittingPayment || paymentProcessingRef.current) return;

    // Sanity check on all prior steps
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        setActiveStep(s);
        return;
      }
    }

    if (!evt) return;

    setSubmittingPayment(true);
    paymentProcessingRef.current = true;
    setErrorMsg(null);

    try {
      // -----------------------------------------------------------------------
      // STEP A: UPLOAD DOCUMENT FILES
      // -----------------------------------------------------------------------
      setPaymentState("creating_pending");
      setStatusMessage("Saving Documents & Creating Registration...");

      const docUrls: Record<string, string> = {};
      let extractedVideoUrl: string | null = null;
      let extractedVideoPath: string | null = null;

      for (const [docId, docData] of Object.entries(uploadedDocs)) {
        if (docData.file) {
          try {
            const isVideo =
              docData.file.type.startsWith("video/") ||
              docId.toLowerCase().includes("video");
            const uploadEndpoint = isVideo ? "/api/uploads/video" : "/api/uploads/document";

            const fd = new FormData();
            fd.append("file", docData.file);
            fd.append("type", docId);

            console.log(`[FRONTEND REGISTRATION] Uploading document '${docId}' (${docData.file.name}) to '${uploadEndpoint}'...`);
            const res = await fetch(uploadEndpoint, { method: "POST", body: fd });
            const data = await res.json();
            if (res.ok && data.success) {
              const savedRef = data.videoPath || data.path || data.url;
              docUrls[docId] = savedRef;
              if (isVideo) {
                extractedVideoUrl = savedRef;
                extractedVideoPath = data.videoPath || data.path || savedRef;
              }
            } else {
              console.error(`Upload error for '${docId}':`, data.error);
              setErrorMsg(data.error || `Upload failed for document '${docId}'.`);
              setSubmittingPayment(false);
              paymentProcessingRef.current = false;
              return;
            }
          } catch (e: any) {
            console.warn(`Doc upload warning for ${docId}:`, e);
          }
        } else if (docData.url) {
          docUrls[docId] = docData.url;
          if (docId.toLowerCase().includes("video")) {
            extractedVideoUrl = docData.url;
            extractedVideoPath = docData.url;
          }
        }
      }

      // -----------------------------------------------------------------------
      // STEP B: CREATE PENDING REGISTRATION IN SUPABASE (BEFORE PAYMENT)
      // -----------------------------------------------------------------------
      const finalPayableAmount = calculatedFeeInfo.amount;
      const isFree = finalPayableAmount === 0;

      const regRes = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: evt.id,
          participationType: currentParticipationType.name,
          participationTypeId: currentParticipationType.id,
          numParticipants,
          category: evt.category,
          registrationStatus: isFree ? "confirmed" : "payment_pending",
          paymentStatus: isFree ? "paid" : "unpaid",
          videoUrl: extractedVideoUrl,
          videoPath: extractedVideoPath,
          participant: {
            fullName: primaryParticipant.fullName,
            dob: primaryParticipant.dob,
            gender: primaryParticipant.gender,
            phone: primaryParticipant.phone,
            email: primaryParticipant.email,
            address: primaryParticipant.address,
            city: primaryParticipant.city,
            state: primaryParticipant.state,
            pincode: primaryParticipant.pincode,
            videoUrl: extractedVideoUrl,
            videoPath: extractedVideoPath,
          },
          additionalParticipants,
          teamInfo,
          customFields: customFieldValues,
          documentUrls: docUrls,
          notes: JSON.stringify({
            participationType: currentParticipationType.name,
            numParticipants,
            teamInfo,
            customFields: customFieldValues,
            docUrls,
            videoUrl: extractedVideoUrl,
            videoPath: extractedVideoPath,
          }),
        }),
      });

      const regData = await regRes.json();

      if (!regRes.ok || !regData.success || !regData.registrationId) {
        paymentProcessingRef.current = false;
        setErrorMsg(regData.error || "Failed to create pre-payment registration record.");
        setSubmittingPayment(false);
        setPaymentState("failed");
        setStatusMessage(null);
        return;
      }

      const pendingRegistrationId = regData.registrationId;
      console.log(`[PIPELINE] Created PENDING registration ID="${pendingRegistrationId}" in Supabase DB.`);

      // Handle Free Registration
      if (isFree) {
        if (sessionStorageKey) sessionStorage.removeItem(sessionStorageKey);
        router.push(`/registration-success?registrationId=${encodeURIComponent(pendingRegistrationId)}`);
        return;
      }

      // -----------------------------------------------------------------------
      // STEP C: CREATE RAZORPAY ORDER LINKED TO PENDING REGISTRATION ID
      // -----------------------------------------------------------------------
      setPaymentState("creating_order");
      setStatusMessage("Opening Razorpay Payment Gateway...");

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: pendingRegistrationId,
          amount: finalPayableAmount,
          eventId: evt.id,
          compType: currentParticipationType.name,
          participationTypeId: currentParticipationType.id,
          numParticipants,
          customerName: primaryParticipant.fullName,
          email: primaryParticipant.email,
          phone: primaryParticipant.phone,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        paymentProcessingRef.current = false;
        setErrorMsg(orderData.error || "Failed to initialize payment gateway order.");
        setSubmittingPayment(false);
        setPaymentState("failed");
        setStatusMessage(null);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        paymentProcessingRef.current = false;
        setErrorMsg("Failed to load Razorpay Payment Gateway SDK. Check internet connection.");
        setSubmittingPayment(false);
        setPaymentState("failed");
        setStatusMessage(null);
        return;
      }

      const razorpayKey = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";

      // -----------------------------------------------------------------------
      // STEP D: OPEN RAZORPAY CHECKOUT MODAL
      // -----------------------------------------------------------------------
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "CGS Entertainments",
        description: `Registration - ${evt.title} (${currentParticipationType.name})`,
        order_id: orderData.orderId || orderData.id,
        prefill: {
          name: primaryParticipant.fullName,
          email: primaryParticipant.email,
          contact: primaryParticipant.phone,
        },
        theme: { color: "#6D28D9" },
        handler: async function (response: any) {
          setPaymentState("verifying");
          setStatusMessage("Verifying Payment Signature & Confirming Registration...");

          try {
            // -----------------------------------------------------------------
            // STEP E: VERIFY PAYMENT & CONFIRM THE EXACT SAME REGISTRATION
            // -----------------------------------------------------------------
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                registrationId: pendingRegistrationId,
                razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success && verifyData.verified) {
              setPaymentState("verified");
              if (sessionStorageKey) sessionStorage.removeItem(sessionStorageKey);
              const finalConfirmedId = verifyData.registrationId || pendingRegistrationId;
              router.push(`/registration-success?registrationId=${encodeURIComponent(finalConfirmedId)}`);
            } else {
              paymentProcessingRef.current = false;
              setPaymentState("failed");
              setErrorMsg(verifyData.error || "Payment signature verification failed.");
              setSubmittingPayment(false);
            }
          } catch (vErr: any) {
            paymentProcessingRef.current = false;
            setPaymentState("failed");
            setErrorMsg("Network error verifying payment.");
            setSubmittingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            paymentProcessingRef.current = false;
            setSubmittingPayment(false);
            setPaymentState("idle");
            setStatusMessage(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      paymentProcessingRef.current = false;
      setErrorMsg(err.message || "Payment initialization failed.");
      setSubmittingPayment(false);
      setPaymentState("failed");
      setStatusMessage(null);
    }
  };

  if (eventLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
        <Navbar />
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#64748B" }}>
            Loading Event Registration System...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!evt) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
        <Navbar />
        <div style={{ maxWidth: 800, margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 40, border: "1.5px solid #E2E8F0", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <AlertTriangle size={48} color="#DC2626" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", marginBottom: 8 }}>
              Event Not Found
            </h2>
            <p style={{ fontSize: 15, color: "#64748B", marginBottom: 24 }}>
              The event you requested could not be located or is no longer available.
            </p>
            <Link
              href="/events"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                borderRadius: 14,
                background: "#6D28D9",
                color: "#fff",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Browse All Events <ChevronRight size={18} />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: "32px auto 80px", padding: "0 24px" }}>
        {/* Banner Card displaying Selected Event Context */}
        <div
          style={{
            background: "linear-gradient(135deg, #090314 0%, #1A0A3A 40%, #2E1065 75%, #4C1D95 100%)",
            borderRadius: 24,
            padding: "32px 36px",
            color: "#fff",
            marginBottom: 32,
            boxShadow: "0 20px 50px rgba(15, 10, 40, 0.15)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <span
              style={{
                background: "rgba(167, 139, 250, 0.2)",
                color: "#E9D5FF",
                padding: "4px 14px",
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {evt.category} EVENT REGISTRATION
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "10px 0 6px", color: "#fff" }}>
              {evt.title}
            </h1>
            <p style={{ fontSize: 14, color: "#C4B5FD", margin: 0 }}>
              Venue: <strong>{evt.venue}, {evt.city}</strong> • Date: <strong>{evt.date}</strong>
            </p>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 18,
              padding: "16px 24px",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: 12, color: "#C4B5FD", fontWeight: 700 }}>SELECTED OPTION FEE</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#86EFAC" }}>
              {calculatedFeeInfo.display}
            </div>
            <div style={{ fontSize: 12, color: "#E9D5FF" }}>
              Option: {currentParticipationType.name}
            </div>
          </div>
        </div>

        {/* 5-STEP NAVIGATION HEADER */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 20,
            border: "1.5px solid #E2E8F0",
            padding: "16px 24px",
            marginBottom: 32,
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            overflowX: "auto",
            gap: 12,
          }}
        >
          {[
            { num: 1, label: "Step 1", sub: "Participation Type" },
            { num: 2, label: "Step 2", sub: "Participant Details" },
            { num: 3, label: "Step 3", sub: "Documents" },
            { num: 4, label: "Step 4", sub: "Review" },
            { num: 5, label: "Step 5", sub: "Payment" },
          ].map((s) => {
            const isActive = activeStep === s.num;
            const isCompleted = s.num < activeStep;
            const isUnlocked = s.num <= maxReachedStep || s.num === activeStep;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => handleStepClick(s.num)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "transparent",
                  border: "none",
                  cursor: isUnlocked || isCompleted ? "pointer" : "not-allowed",
                  opacity: isUnlocked || isCompleted ? 1 : 0.45,
                  padding: "8px 12px",
                  borderRadius: 12,
                  whiteSpace: "nowrap",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: isActive
                      ? "linear-gradient(135deg, #6D28D9, #7C3AED)"
                      : isCompleted
                        ? "#22C55E"
                        : "#E2E8F0",
                    color: isActive || isCompleted ? "#fff" : "#64748B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  {isCompleted ? "✓" : s.num}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#6D28D9" : "#94A3B8" }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? "#0F172A" : "#64748B" }}>
                    {s.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1.5px solid #FECACA",
              borderRadius: 16,
              padding: "14px 20px",
              marginBottom: 24,
              color: "#991B1B",
              fontSize: 14,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <AlertCircle size={20} color="#DC2626" />
            {errorMsg}
          </div>
        )}

        {/* MAIN STEP CARDS */}
        <div style={{ background: "#ffffff", borderRadius: 24, border: "1.5px solid #E2E8F0", padding: 36, boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
          {/* STEP 1: SELECT PARTICIPATION TYPE */}
          {activeStep === 1 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
                Step 1: Select Participation Option
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px" }}>
                Configured options for <strong>{evt.title}</strong>. Selecting an option automatically updates your payable registration fee.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                {activeParticipationTypes.map((pt) => {
                  const isSel = pt.id === selectedTypeId;
                  return (
                    <div
                      key={pt.id}
                      onClick={() => {
                        setSelectedTypeId(pt.id);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      style={{
                        border: `2.5px solid ${isSel ? "#6D28D9" : "#E2E8F0"}`,
                        background: isSel ? "#FAF5FF" : "#ffffff",
                        borderRadius: 20,
                        padding: 24,
                        cursor: "pointer",
                        transition: "all 0.25s",
                        boxShadow: isSel ? "0 10px 28px rgba(109, 40, 217, 0.18)" : "none",
                        transform: isSel ? "translateY(-4px)" : "none",
                      }}
                    >
                      <div style={{ fontSize: 20, fontWeight: 900, color: isSel ? "#6D28D9" : "#0F172A", marginBottom: 6 }}>
                        [ {pt.name} ]
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 16 }}>
                        {pt.minParticipants === pt.maxParticipants
                          ? `${pt.minParticipants} Participant${pt.minParticipants > 1 ? "s" : ""}`
                          : `${pt.minParticipants}–${pt.maxParticipants} Participants`}
                      </div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: "#059669" }}>
                        ₹{pt.fee.toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Immediately display Team Name field when a multi-participant option is selected */}
              {isMultiParticipant && (
                <div
                  style={{
                    marginTop: 24,
                    background: "#F8FAFC",
                    border: `1.5px solid ${errorMsg && !teamInfo.teamName.trim() ? "#FECACA" : "#E2E8F0"}`,
                    borderRadius: 20,
                    padding: 24,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                  }}
                >
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "#1E293B", margin: "0 0 16px" }}>
                    Group / Team Details ({currentParticipationType.name})
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                        Team Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your Team / Group Name"
                        value={teamInfo.teamName}
                        onChange={(e) => {
                          setTeamInfo({ ...teamInfo, teamName: e.target.value });
                          if (errorMsg) setErrorMsg(null);
                        }}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 12,
                          border: `1.5px solid ${errorMsg && !teamInfo.teamName.trim() ? "#DC2626" : "#CBD5E1"}`,
                          fontSize: 14,
                          outline: "none",
                        }}
                      />
                      {errorMsg && !teamInfo.teamName.trim() && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", marginTop: 4, display: "block" }}>
                          Team Name is required for {currentParticipationType.name} registration.
                        </span>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                        Team Leader Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Leader Full Name"
                        value={teamInfo.teamLeader}
                        onChange={(e) => setTeamInfo({ ...teamInfo, teamLeader: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 12,
                          border: "1.5px solid #CBD5E1",
                          fontSize: 14,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 36, textAlign: "right" }}>
                <SaveContinueBtn label="Continue to Participant Details" onClick={goToNextStep} />
              </div>
            </div>
          )}

          {/* STEP 2: PARTICIPANT DETAILS */}
          {activeStep === 2 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 4px" }}>
                    Step 2: Participant Details ({currentParticipationType.name})
                  </h2>
                  <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>
                    Enter information for all participants under option <strong>{currentParticipationType.name}</strong>.
                  </p>
                </div>

                {currentParticipationType.minParticipants !== currentParticipationType.maxParticipants && (
                  <div style={{ background: "#EDE9FE", color: "#6D28D9", padding: "10px 20px", borderRadius: 20, fontWeight: 900, fontSize: 14 }}>
                    Participants: {numParticipants} / {currentParticipationType.maxParticipants}
                  </div>
                )}
              </div>

              {/* Group Add/Remove Controls */}
              {currentParticipationType.minParticipants !== currentParticipationType.maxParticipants && (
                <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 24, background: "#F8FAFC", padding: 16, borderRadius: 16, border: "1px solid #E2E8F0" }}>
                  <button
                    type="button"
                    disabled={numParticipants <= currentParticipationType.minParticipants}
                    onClick={() => setNumParticipants((p) => Math.max(currentParticipationType.minParticipants, p - 1))}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 12,
                      border: "1px solid #CBD5E1",
                      background: "#fff",
                      fontWeight: 800,
                      cursor: numParticipants <= currentParticipationType.minParticipants ? "not-allowed" : "pointer",
                      opacity: numParticipants <= currentParticipationType.minParticipants ? 0.5 : 1,
                    }}
                  >
                    - Remove Participant
                  </button>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#1E293B" }}>
                    Participant Count: {numParticipants}
                  </span>
                  <button
                    type="button"
                    disabled={numParticipants >= currentParticipationType.maxParticipants}
                    onClick={() => setNumParticipants((p) => Math.min(currentParticipationType.maxParticipants, p + 1))}
                    style={{
                      padding: "10px 18px",
                      borderRadius: 12,
                      border: "none",
                      background: "#6D28D9",
                      color: "#fff",
                      fontWeight: 800,
                      cursor: numParticipants >= currentParticipationType.maxParticipants ? "not-allowed" : "pointer",
                      opacity: numParticipants >= currentParticipationType.maxParticipants ? 0.5 : 1,
                    }}
                  >
                    + Add Participant
                  </button>
                </div>
              )}

              {/* Team Information if Multi-participant */}
              {isMultiParticipant && (
                <div style={{ background: "#F8FAFC", border: `1.5px solid ${errorMsg && !teamInfo.teamName.trim() ? "#FECACA" : "#E2E8F0"}`, borderRadius: 20, padding: 24, marginBottom: 28 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "#1E293B", margin: "0 0 16px" }}>
                    Group / Team Details ({currentParticipationType.name})
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                        Team Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Thunder Dancers"
                        value={teamInfo.teamName}
                        onChange={(e) => {
                          setTeamInfo({ ...teamInfo, teamName: e.target.value });
                          if (errorMsg) setErrorMsg(null);
                        }}
                        style={{
                          width: "100%",
                          padding: "11px 14px",
                          borderRadius: 12,
                          border: `1.5px solid ${errorMsg && !teamInfo.teamName.trim() ? "#DC2626" : "#CBD5E1"}`,
                          fontSize: 14,
                          outline: "none",
                        }}
                      />
                      {errorMsg && !teamInfo.teamName.trim() && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", marginTop: 4, display: "block" }}>
                          Team Name is required for {currentParticipationType.name} registration.
                        </span>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                        Team Leader Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={teamInfo.teamLeader}
                        onChange={(e) => setTeamInfo({ ...teamInfo, teamLeader: e.target.value })}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Participant #1 Details */}
              <div style={{ border: "1.5px solid #E2E8F0", borderRadius: 20, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#6D28D9", margin: "0 0 16px" }}>
                  Participant #1 (Lead / Main Registrant)
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={primaryParticipant.fullName}
                      onChange={(e) => setPrimaryParticipant({ ...primaryParticipant, fullName: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={primaryParticipant.dob}
                      onChange={(e) => setPrimaryParticipant({ ...primaryParticipant, dob: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                      Gender *
                    </label>
                    <select
                      value={primaryParticipant.gender}
                      onChange={(e) => setPrimaryParticipant({ ...primaryParticipant, gender: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={primaryParticipant.phone}
                      onChange={(e) => setPrimaryParticipant({ ...primaryParticipant, phone: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={primaryParticipant.email}
                      onChange={(e) => setPrimaryParticipant({ ...primaryParticipant, email: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                      Address *
                    </label>
                    <input
                      type="text"
                      placeholder="City / Address"
                      value={primaryParticipant.address}
                      onChange={(e) => setPrimaryParticipant({ ...primaryParticipant, address: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                    />
                  </div>
                </div>

                {/* Custom Fields */}
                {(formConfig.customFields || []).length > 0 && (
                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px dashed #E2E8F0" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", marginBottom: 14 }}>
                      Event Custom Fields
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      {formConfig.customFields.map((cf) => (
                        <div key={cf.id}>
                          <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                            {cf.label} {cf.required ? "*" : "(Optional)"}
                          </label>
                          {cf.type === "dropdown" ? (
                            <select
                              value={customFieldValues[cf.id] || ""}
                              onChange={(e) => setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })}
                              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                            >
                              <option value="">Select Choice</option>
                              {(cf.options || []).map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : cf.type === "radio" ? (
                            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                              {(cf.options || []).map((opt) => (
                                <label key={opt} style={{ fontSize: 13, display: "flex", gap: 6, cursor: "pointer" }}>
                                  <input
                                    type="radio"
                                    name={cf.id}
                                    value={opt}
                                    checked={customFieldValues[cf.id] === opt}
                                    onChange={(e) => setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })}
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          ) : (
                            <input
                              type={cf.type === "number" ? "number" : cf.type === "date" ? "date" : "text"}
                              placeholder={`Enter ${cf.label}`}
                              value={customFieldValues[cf.id] || ""}
                              onChange={(e) => setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })}
                              style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Participants (#2..N) */}
              {additionalParticipants.map((pExtra, idx) => (
                <div key={idx} style={{ border: "1.5px solid #E2E8F0", borderRadius: 20, padding: 24, marginBottom: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "#4338CA", margin: "0 0 16px" }}>
                    Participant #{idx + 2} Details
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={pExtra.fullName || ""}
                        onChange={(e) => {
                          const copy = [...additionalParticipants];
                          copy[idx] = { ...copy[idx], fullName: e.target.value };
                          setAdditionalParticipants(copy);
                        }}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={pExtra.dob || ""}
                        onChange={(e) => {
                          const copy = [...additionalParticipants];
                          copy[idx] = { ...copy[idx], dob: e.target.value };
                          setAdditionalParticipants(copy);
                        }}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid #CBD5E1", fontSize: 14 }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between" }}>
                <BackBtn onClick={goToPrevStep} />
                <SaveContinueBtn label="Continue to Documents" onClick={goToNextStep} />
              </div>
            </div>
          )}

          {/* STEP 3: DOCUMENTS */}
          {activeStep === 3 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
                Step 3: Upload Required Documents
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px" }}>
                Provide required document files for <strong>{evt.title}</strong>.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {(formConfig.documents || []).map((docReq) => {
                  const docState = uploadedDocs[docReq.id];
                  return (
                    <div
                      key={docReq.id}
                      style={{
                        border: "1.5px solid #E2E8F0",
                        borderRadius: 20,
                        padding: 24,
                        background: "#F8FAFC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 16,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#0F172A" }}>
                          {docReq.name} {docReq.required ? <span style={{ color: "#DC2626" }}>*</span> : "(Optional)"}
                        </div>
                        <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 4 }}>
                          Allowed Formats: {docReq.allowedFileTypes} • Max Size: {docReq.maxSizeMB}MB
                        </div>
                        {docState?.name && (
                          <div style={{ fontSize: 13, color: "#166534", fontWeight: 700, marginTop: 6 }}>
                            ✓ Selected File: {docState.name}
                          </div>
                        )}
                      </div>

                      <div>
                        <input
                          type="file"
                          id={`file_${docReq.id}`}
                          accept={docReq.allowedFileTypes}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedDocs({
                                ...uploadedDocs,
                                [docReq.id]: { file, name: file.name },
                              });
                            }
                          }}
                          style={{ display: "none" }}
                        />
                        <label
                          htmlFor={`file_${docReq.id}`}
                          style={{
                            padding: "10px 20px",
                            borderRadius: 12,
                            background: docState?.name ? "#DCFCE7" : "#6D28D9",
                            color: docState?.name ? "#166534" : "#fff",
                            fontSize: 13.5,
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Upload size={16} />
                          {docState?.name ? "Change File" : "Choose File"}
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between" }}>
                <BackBtn onClick={goToPrevStep} />
                <SaveContinueBtn label="Continue to Review" onClick={goToNextStep} />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {activeStep === 4 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
                Step 4: Review Registration Details
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px" }}>
                Verify all information before proceeding to payment.
              </p>

              <div style={{ border: "1.5px solid #E2E8F0", borderRadius: 20, padding: 28, background: "#FAF5FF" }}>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#6D28D9", margin: "0 0 18px" }}>
                  Registration Summary
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
                  <div>
                    <span style={{ color: "#64748B" }}>Event:</span>{" "}
                    <strong>{evt.title}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Participation Option:</span>{" "}
                    <strong>{currentParticipationType.name}</strong>
                  </div>
                  {isMultiParticipant && teamInfo.teamName && (
                    <div>
                      <span style={{ color: "#64748B" }}>Team Name:</span>{" "}
                      <strong style={{ color: "#6D28D9" }}>{teamInfo.teamName}</strong>
                    </div>
                  )}
                  <div>
                    <span style={{ color: "#64748B" }}>Registrant Name:</span>{" "}
                    <strong>{primaryParticipant.fullName}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Phone &amp; Email:</span>{" "}
                    <strong>{primaryParticipant.phone} • {primaryParticipant.email}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Participant Count:</span>{" "}
                    <strong>{numParticipants}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Authoritative Fee:</span>{" "}
                    <strong style={{ color: "#059669", fontSize: 18 }}>
                      {calculatedFeeInfo.display}
                    </strong>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px dashed #E2E8F0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, cursor: "pointer", marginBottom: 10 }}>
                    <input
                      type="checkbox"
                      checked={agreeCorrect}
                      onChange={(e) => setAgreeCorrect(e.target.checked)}
                    />
                    I declare that all entered information is accurate and correct.
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, cursor: "pointer", marginBottom: 16 }}>
                    <input
                      type="checkbox"
                      checked={agreeRules}
                      onChange={(e) => setAgreeRules(e.target.checked)}
                    />
                    I agree to CGS Entertainments event guidelines and non-refundable fee policy.
                  </label>

                  <div style={{ maxWidth: 360 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 4, display: "block" }}>
                      Digital Signature (Full Name) *
                    </label>
                    <input
                      type="text"
                      placeholder="Type your full name"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13.5 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between" }}>
                <BackBtn onClick={goToPrevStep} />
                <SaveContinueBtn label="Proceed to Payment" onClick={goToNextStep} />
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT */}
          {activeStep === 5 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: "0 0 8px" }}>
                Step 5: Payment &amp; Confirmation
              </h2>
              <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 24px" }}>
                A pending registration is saved in Supabase BEFORE Razorpay payment.
              </p>

              <div style={{ border: "2px solid #059669", borderRadius: 24, padding: 32, background: "#F0FDF4", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#166534", textTransform: "uppercase" }}>
                  FINAL PAYABLE REGISTRATION AMOUNT
                </div>
                <div style={{ fontSize: 44, fontWeight: 900, color: "#059669", margin: "8px 0" }}>
                  {calculatedFeeInfo.display}
                </div>
                <p style={{ fontSize: 14, color: "#15803D", margin: "0 0 24px" }}>
                  Event: {evt.title} ({currentParticipationType.name})
                </p>

                <div style={{ maxWidth: 420, margin: "0 auto" }}>
                  <PayNowBtn
                    amount={calculatedFeeInfo.display}
                    onClick={handleFinalPayment}
                    disabled={submittingPayment}
                    loading={submittingPayment}
                    loadingText={statusMessage}
                  />
                </div>
              </div>

              <div style={{ marginTop: 36, textAlign: "left" }}>
                <BackBtn onClick={goToPrevStep} />
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
