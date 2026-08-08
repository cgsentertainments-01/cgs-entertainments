"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  HelpCircle,
  CreditCard,
  Calendar,
  FileText,
  Award,
  Upload,
  RefreshCw,
  Phone,
  MessageCircle,
  Mail,
  Plus,
  Minus,
  ChevronRight,
  Headphones,
  Send,
  Star,
  Shield,
} from "lucide-react";

/* ─── TOPICS DATA ─── */
const TOPICS = [
  { id: "general", label: "General Information", icon: <HelpCircle size={18} />, count: "06" },
  { id: "registration", label: "Registration & Payment", icon: <CreditCard size={18} />, count: "07" },
  { id: "events", label: "Events & Participation", icon: <Calendar size={18} />, count: "06" },
  { id: "rules", label: "Rules & Guidelines", icon: <FileText size={18} />, count: "05" },
  { id: "certificates", label: "Certificates & Awards", icon: <Award size={18} />, count: "04" },
  { id: "uploads", label: "Technical & Uploads", icon: <Upload size={18} />, count: "04" },
  { id: "refund", label: "Refund & Cancellation", icon: <RefreshCw size={18} />, count: "03" },
  { id: "support", label: "Contact & Support", icon: <Phone size={18} />, count: "03" },
];

/* ─── FAQS BY TOPIC ─── */
const FAQS_BY_TOPIC: Record<string, { q: string; a: string }[]> = {
  general: [
    {
      q: "What is CGS Entertainments?",
      a: "CGS Entertainments is a platform dedicated to discovering talent and creating memorable experiences through dance competitions, events and excellence.",
    },
    {
      q: "Who can participate in the events?",
      a: "Dancers, performers, and artists of all skill levels and ages across India can participate. We have categories ranging from Tiny Tots (3–5 years) to Seniors (18+ years).",
    },
    {
      q: "How can I stay updated about upcoming events?",
      a: "You can subscribe to our newsletter, follow our official social media channels, or regularly check the Events section on our website.",
    },
    {
      q: "Is there any age limit to participate?",
      a: "No, there is no age limit! We have age-specific categories for juniors, teens, and seniors, as well as an Open Category accessible to all age groups.",
    },
    {
      q: "Where are the events held?",
      a: "Our events are hosted in major cities across India, including Hyderabad, Bangalore, Mumbai, Chennai, and Delhi at top convention centers and auditoriums.",
    },
    {
      q: "How can I contact CGS Entertainments?",
      a: "You can reach out to us via email at support@cgsentertainments.com, call us at +91 98765 43210, or chat directly on WhatsApp.",
    },
  ],
  registration: [
    {
      q: "How do I register for an event?",
      a: "Click on the Register button on any event page, fill in your participant details, select your category, upload required documents, and complete the secure payment.",
    },
    {
      q: "What payment methods are supported?",
      a: "We accept UPI (GPay, PhonePe, Paytm), Credit Cards, Debit Cards, Net Banking, and major digital wallets.",
    },
    {
      q: "Can I register for multiple categories?",
      a: "Yes! You can enter multiple categories (e.g. Solo and Group) by selecting them during registration.",
    },
    {
      q: "Is on-spot registration available at the venue?",
      a: "On-spot registration depends on seat availability. We strongly recommend online registration in advance to guarantee your spot.",
    },
    {
      q: "Do I get a confirmation receipt after payment?",
      a: "Yes, an instant confirmation ticket with your Registration ID and QR code will be displayed and emailed to you.",
    },
    {
      q: "Can I edit my registration details after submission?",
      a: "You can request minor updates to your registration (such as song title or spelling corrections) up to 3 days before the event by contacting support.",
    },
    {
      q: "What are the registration fees?",
      a: "Registration fees vary by event and category, starting from ₹300 for solo events to ₹1200 for group categories.",
    },
  ],
  events: [
    {
      q: "How long can each dance performance be?",
      a: "Solo performances are typically 2 to 3 minutes, while group performances can range from 3 to 5 minutes.",
    },
    {
      q: "What styles of dance are permitted?",
      a: "All dance styles are welcome, including Classical, Folk, Western, Hip-Hop, Bollywood, Contemporary, Semi-Classical, Freestyle, and Fusion.",
    },
    {
      q: "Is props allowed during performance?",
      a: "Yes, safe stage props are allowed. Please ensure props do not damage the stage floor or create fire hazards.",
    },
    {
      q: "Can parents/guardians accompany participants?",
      a: "Yes, parents and guardians are welcome to attend. Audience passes can be booked online or obtained at the venue entrance.",
    },
    {
      q: "What time should participants arrive at the venue?",
      a: "Participants should arrive at least 45 minutes before their scheduled category time for check-in and stage preparation.",
    },
    {
      q: "Will there be green rooms for costume changes?",
      a: "Yes, dedicated separate male and female green rooms/changing areas are available at all event venues.",
    },
  ],
  rules: [
    {
      q: "What are the general rules for stage performances?",
      a: "Performers must adhere to stage decorum, wear appropriate costumes, respect time limits, and follow instructions from venue managers.",
    },
    {
      q: "How are performances judged?",
      a: "Our celebrity panel of judges evaluates performances based on technique, rhythm, choreography, stage presence, costume, and overall expression.",
    },
    {
      q: "Is the judges' decision final?",
      a: "Yes, judges' scoring decisions are final and binding across all competition categories.",
    },
    {
      q: "Can I bring my own audio track on a USB drive?",
      a: "Yes! While you upload your audio online during registration, we recommend carrying a backup USB drive to the venue.",
    },
    {
      q: "What happens if a participant exceeds the time limit?",
      a: "Exceeding the time limit by more than 15 seconds may result in a slight point deduction in the choreography score.",
    },
  ],
  certificates: [
    {
      q: "Will all participants receive a certificate?",
      a: "Yes! Every participant receives an official CGS Certificate of Participation signed by our celebrity judges.",
    },
    {
      q: "What prizes do winners receive?",
      a: "Winners receive cash prizes, trophies, medals, merit certificates, and media coverage across major news portals.",
    },
    {
      q: "How and when are prizes distributed?",
      a: "Prize distribution takes place during the Grand Award Ceremony at the conclusion of each event day.",
    },
    {
      q: "Can I get a digital copy of my certificate?",
      a: "Yes, digital e-certificates can be downloaded from your student profile after the event.",
    },
  ],
  uploads: [
    {
      q: "What audio file formats are accepted?",
      a: "We accept MP3, WAV, and AAC audio files up to 15MB in size.",
    },
    {
      q: "What document format should I upload for ID proof?",
      a: "PDF, JPG, or PNG images of Aadhaar Card, School ID, or Birth Certificate up to 5MB are accepted.",
    },
    {
      q: "How do I upload my practice dance video?",
      a: "You can upload an MP4 video file (up to 100MB) or paste a YouTube / Google Drive video link directly in the registration form.",
    },
    {
      q: "What if my video file upload fails?",
      a: "If your file fails to upload, you can paste a Google Drive or YouTube link, or contact our support team for assistance.",
    },
  ],
  refund: [
    {
      q: "What is the refund policy if I cancel my registration?",
      a: "Cancellations made 7+ days before the event are eligible for a 80% refund. No refunds are issued within 3 days of the event.",
    },
    {
      q: "What happens if an event is rescheduled or cancelled by CGS?",
      a: "If an event is rescheduled or cancelled by CGS Entertainments, participants receive a 100% full refund or credit for the rescheduled date.",
    },
    {
      q: "How long does it take to process a refund?",
      a: "Approved refunds are credited back to your original payment source within 5–7 business days.",
    },
  ],
  support: [
    {
      q: "How quickly does customer support respond?",
      a: "WhatsApp and phone support offer instant responses between 10 AM and 7 PM. Email queries are answered within 24 hours.",
    },
    {
      q: "Where is CGS Entertainments head office located?",
      a: "Our head office is located in Hyderabad, Telangana (500001), India.",
    },
    {
      q: "Can dance academies partner with CGS Entertainments?",
      a: "Yes! We offer official academy partnerships, group registration discounts, and franchise opportunities. Contact us to learn more.",
    },
  ],
};

/* ─── HOVER COMPONENT: Topic Sidebar Item ─── */
function TopicItem({
  topic,
  selected,
  onClick,
}: {
  topic: typeof TOPICS[0];
  selected: boolean;
  onClick: () => void;
}) {
  const [h, setH] = useState(false);
  const active = h || selected;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 14,
        background: selected ? "#6D28D9" : h ? "#FAF5FF" : "transparent",
        color: selected ? "#fff" : h ? "#6D28D9" : "#374151",
        cursor: "pointer",
        transition: "all 0.22s ease",
        transform: h && !selected ? "translateX(4px)" : "translateX(0)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ color: selected ? "#fff" : h ? "#6D28D9" : "#6B7280" }}>
          {topic.icon}
        </div>
        <span style={{ fontSize: 13.5, fontWeight: selected ? 800 : 600 }}>
          {topic.label}
        </span>
      </div>

      <span
        style={{
          padding: "2px 8px",
          borderRadius: 10,
          background: selected ? "rgba(255,255,255,0.2)" : h ? "#EDE9FE" : "#F3F4F6",
          color: selected ? "#fff" : h ? "#6D28D9" : "#6B7280",
          fontSize: 11,
          fontWeight: 800,
        }}
      >
        {topic.count}
      </span>
    </div>
  );
}

/* ─── HOVER COMPONENT: FAQ Accordion Item ─── */
function AccordionItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: { q: string; a: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [h, setH] = useState(false);

  return (
    <div
      style={{
        background: isOpen ? "#FAF5FF" : h ? "#FAFAFA" : "#fff",
        border: `1.5px solid ${isOpen ? "#C4B5FD" : h ? "#E5E7EB" : "#F3F4F6"}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "all 0.25s ease",
        boxShadow: isOpen ? "0 4px 16px rgba(109,40,217,0.08)" : "none",
      }}
    >
      <div
        onClick={onToggle}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          padding: "18px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: isOpen ? 800 : 700, color: isOpen ? "#6D28D9" : "#111827" }}>
          {faq.q}
        </span>

        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: isOpen ? "#6D28D9" : "#F3F4F6",
            color: isOpen ? "#fff" : "#4B5563",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.22s ease",
          }}
        >
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: "0 22px 20px", fontSize: 14, color: "#4B5563", lineHeight: 1.7, borderTop: "1px dashed #E9D5FF", paddingTop: 14 }}>
          {faq.a}
        </div>
      )}
    </div>
  );
}

/* ─── HOVER COMPONENT: 3 Support Card Item ─── */
function SupportCardItem({
  title,
  sub,
  contact,
  icon,
  accentColor,
  accentBg,
  hoverBg,
  hoverBorder,
  hoverShadow,
}: {
  type: string;
  title: string;
  sub: string;
  contact: string;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
  hoverBg: string;
  hoverBorder: string;
  hoverShadow: string;
}) {
  const [h, setH] = useState(false);

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: h ? hoverBg : "#fff",
        border: `2px solid ${h ? hoverBorder : "#E5E7EB"}`,
        borderRadius: 22,
        padding: "24px 28px",
        display: "flex",
        alignItems: "center",
        gap: 18,
        boxShadow: h ? hoverShadow : "0 2px 10px rgba(0,0,0,0.03)",
        transform: h ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: h ? accentColor : accentBg,
          color: h ? "#fff" : accentColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: h ? `0 8px 20px ${accentColor}44` : "none",
          transform: h ? "scale(1.15) rotate(-5deg)" : "scale(1)",
          transition: "all 0.28s ease",
        }}
      >
        {icon}
      </div>
      <div>
        <h4 style={{ fontSize: 16, fontWeight: 900, color: "#111827", margin: "0 0 3px" }}>
          {title}
        </h4>
        <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 6px", fontWeight: 500 }}>
          {sub}
        </p>
        <div style={{ fontSize: 13.5, fontWeight: 900, color: accentColor, wordBreak: "break-all" }}>
          {contact}
        </div>
      </div>
    </div>
  );
}

/* ─── HOVER COMPONENT: Newsletter Section ─── */
function FaqNewsletterSection({
  subscribed,
  email,
  setEmail,
  onSubscribe,
}: {
  subscribed: boolean;
  email: string;
  setEmail: (val: string) => void;
  onSubscribe: () => void;
}) {
  const [h, setH] = useState(false);
  const [btnH, setBtnH] = useState(false);

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: "linear-gradient(135deg, #090314 0%, #1A0A3A 50%, #311068 100%)",
        borderRadius: 24,
        padding: "32px 40px",
        color: "#fff",
        marginBottom: 64,
        border: `2px solid ${h ? "#A78BFA" : "rgba(167, 139, 250, 0.25)"}`,
        boxShadow: h
          ? "0 22px 54px rgba(109, 40, 217, 0.45), 0 0 30px rgba(167, 139, 250, 0.25)"
          : "0 12px 36px rgba(15,10,40,0.4)",
        transform: h ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}
      className="faq-newsletter-bar"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: h ? "rgba(167, 139, 250, 0.25)" : "rgba(255,255,255,0.12)",
            border: `1.5px solid ${h ? "#C4B5FD" : "rgba(255,255,255,0.2)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transform: h ? "scale(1.1) rotate(-6deg)" : "scale(1)",
            transition: "all 0.28s ease",
          }}
        >
          <Mail size={26} color="#C4B5FD" />
        </div>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: "#fff", margin: "0 0 4px", letterSpacing: -0.3 }}>
            Don&apos;t Miss Any Update!
          </h3>
          <p style={{ fontSize: 13.5, color: "#C4B5FD", margin: 0, fontWeight: 500 }}>
            Subscribe to our newsletter and get updates on new events, registrations and more.
          </p>
        </div>
      </div>

      {/* Form input & button */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0, width: 400 }} className="faq-news-form">
        {subscribed ? (
          <div style={{ padding: "12px 20px", background: "rgba(34,197,94,0.2)", border: "1.5px solid #22C55E", borderRadius: 14, color: "#86EFAC", fontSize: 14, fontWeight: 800, width: "100%", textAlign: "center" }}>
            ✓ Thank you for subscribing!
          </div>
        ) : (
          <>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: 14,
                border: "1.5px solid #E5E7EB",
                fontSize: 14,
                outline: "none",
                background: "#fff",
                color: "#111827",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            />
            <button
              onClick={onSubscribe}
              onMouseEnter={() => setBtnH(true)}
              onMouseLeave={() => setBtnH(false)}
              style={{
                padding: "12px 24px",
                borderRadius: 14,
                background: btnH
                  ? "linear-gradient(135deg, #5B21B6 0%, #6D28D9 100%)"
                  : "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                color: "#fff",
                border: "none",
                fontSize: 14,
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: btnH
                  ? "0 10px 28px rgba(109, 40, 217, 0.5)"
                  : "0 6px 20px rgba(109, 40, 217, 0.35)",
                transform: btnH ? "translateY(-2px) scale(1.04)" : "translateY(0) scale(1)",
                transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <Send size={16} style={{ transform: btnH ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />
              Subscribe
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function FaqsPage() {
  const [activeTopic, setActiveTopic] = useState<string>("general");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const currentTopicObj = TOPICS.find((t) => t.id === activeTopic) || TOPICS[0];
  const currentFaqs = FAQS_BY_TOPIC[activeTopic] || FAQS_BY_TOPIC["general"];

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />

      {/* ── 1. Hero Banner matching reference image ── */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(135deg, #090314 0%, #150933 50%, #251052 100%)",
          paddingTop: 64,
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px 56px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 520px", gap: 32, alignItems: "center" }} className="faq-hero-grid">
            <div>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: -1 }}>
                FAQ<span style={{ color: "#C4B5FD" }}>s</span>
              </h1>
              <p style={{ fontSize: 16, color: "#DDD6FE", margin: 0, fontWeight: 500, maxWidth: 440 }}>
                Find answers to common questions about our events, registrations and more.
              </p>
            </div>

            {/* Right Hero Image */}
            <div style={{ position: "relative", height: 240, borderRadius: 22, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
              <Image
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=90"
                alt="FAQs Stage Performer"
                fill
                priority
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #090314 0%, transparent 60%)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Main Section Header ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#111827", margin: "0 0 10px", letterSpacing: -0.5 }}>
            Frequently Asked <span style={{ color: "#6D28D9" }}>Questions</span>
          </h2>
          {/* Star Accent line */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "10px 0" }}>
            <div style={{ width: 40, height: 1.5, background: "#C4B5FD" }} />
            <Star size={14} color="#6D28D9" fill="#6D28D9" />
            <div style={{ width: 40, height: 1.5, background: "#C4B5FD" }} />
          </div>
          <p style={{ fontSize: 14.5, color: "#6B7280", margin: 0, fontWeight: 500 }}>
            Everything you need to know about CGS Entertainments events.
          </p>
        </div>

        {/* ── 3. Main 2-Column FAQs Layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "310px 1fr", gap: 32 }} className="faq-layout">

          {/* ── LEFT COLUMN: Browse by Topics Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#111827", margin: "0 0 18px", paddingBottom: 12, borderBottom: "1.5px solid #F3F4F6" }}>
                Browse by Topics
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {TOPICS.map((topic) => (
                  <TopicItem
                    key={topic.id}
                    topic={topic}
                    selected={activeTopic === topic.id}
                    onClick={() => {
                      setActiveTopic(topic.id);
                      setOpenFaqIndex(0);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Can't find your answer? Box */}
            <div style={{ background: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)", border: "1.5px solid #E9D5FF", borderRadius: 22, padding: "24px", textAlign: "center" }}>
              <h4 style={{ fontSize: 15, fontWeight: 900, color: "#111827", margin: "0 0 4px" }}>
                Can&apos;t find your answer?
              </h4>
              <p style={{ fontSize: 12.5, color: "#6B7280", margin: "0 0 16px", fontWeight: 500 }}>
                We&apos;re here to help you.
              </p>
              <Link
                href="/contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "#fff",
                  border: "1.5px solid #6D28D9",
                  color: "#6D28D9",
                  fontSize: 13,
                  fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 2px 8px rgba(109,40,217,0.1)",
                }}
              >
                <Headphones size={16} />
                Contact Support
              </Link>
            </div>
          </div>

          {/* ── RIGHT COLUMN: FAQs Accordion Box ── */}
          <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            {/* Active Topic Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: "1.5px solid #F3F4F6" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#FAF5FF", border: "1px solid #E9D5FF", color: "#6D28D9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {currentTopicObj.icon}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: 0 }}>
                {currentTopicObj.label}
              </h2>
            </div>

            {/* Accordion List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {currentFaqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  faq={faq}
                  isOpen={openFaqIndex === idx}
                  onToggle={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                />
              ))}
            </div>
          </div>

        </div>

        {/* ── 4. 3-Card Premium Support Section ── */}
        <div style={{ margin: "56px 0 64px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="support-cards-grid-3">
            {/* Card 1: Chat on WhatsApp */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
            >
              <SupportCardItem
                type="whatsapp"
                title="Chat on WhatsApp"
                sub="Quick support on WhatsApp"
                contact="+91 98765 43210"
                icon={<MessageCircle size={24} />}
                accentColor="#16A34A"
                accentBg="#DCFCE7"
                hoverBg="linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)"
                hoverBorder="#86EFAC"
                hoverShadow="0 16px 36px rgba(34,197,94,0.22)"
              />
            </a>

            {/* Card 2: Email Support */}
            <a
              href="mailto:support@cgsentertainments.com"
              style={{ textDecoration: "none" }}
            >
              <SupportCardItem
                type="email"
                title="Email Support"
                sub="We reply within 24 hours"
                contact="support@cgsentertainments.com"
                icon={<Mail size={24} />}
                accentColor="#6D28D9"
                accentBg="#F3E8FF"
                hoverBg="linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)"
                hoverBorder="#C4B5FD"
                hoverShadow="0 16px 36px rgba(109,40,217,0.22)"
              />
            </a>

            {/* Card 3: Call Us */}
            <a
              href="tel:+919876543210"
              style={{ textDecoration: "none" }}
            >
              <SupportCardItem
                type="call"
                title="Call Us"
                sub="Mon – Sat (10 AM - 7 PM)"
                contact="+91 98765 43210"
                icon={<Phone size={24} />}
                accentColor="#EA580C"
                accentBg="#FFEDD5"
                hoverBg="linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)"
                hoverBorder="#FDBA74"
                hoverShadow="0 16px 36px rgba(234,88,12,0.22)"
              />
            </a>
          </div>
        </div>

        {/* ── 5. "Our Sponsors & Partners" Section with Left-to-Right Infinite Ticker ── */}
        <div style={{ marginBottom: 64, textAlign: "center", overflow: "hidden" }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#111827", margin: "0 0 6px", letterSpacing: -0.5 }}>
            Our Sponsors &amp; Partners
          </h2>
          <p style={{ fontSize: 13.5, color: "#6B7280", margin: "0 0 28px", fontWeight: 500 }}>
            Proudly supported by India&apos;s leading dance academies, media channels &amp; entertainment networks.
          </p>

          {/* ── Infinite Marquee 1 (Dance & Singing Academies - Left to Right) ── */}
          <div style={{ position: "relative", width: "100%", overflow: "hidden", padding: "12px 0", marginBottom: 16 }} className="marquee-wrapper">
            {/* Fade edges */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 90, background: "linear-gradient(to right, #F9FAFB, transparent)", zIndex: 5, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 90, background: "linear-gradient(to left, #F9FAFB, transparent)", zIndex: 5, pointerEvents: "none" }} />

            <div className="marquee-track-container">
              <div className="marquee-track marquee-anim-ltr">
                {[
                  "💃 Kalanikethan Dance Academy",
                  "🩰 Terre Dance Company",
                  "🕺 Step Up Dance Studio",
                  "🎵 Beat & Rhythm Studio",
                  "🌟 Groove Nation Academy",
                  "🎤 Sun Music",
                  "📻 RED FM 93.5",
                  "💃 Kalanikethan Dance Academy",
                  "🩰 Terre Dance Company",
                  "🕺 Step Up Dance Studio",
                  "🎵 Beat & Rhythm Studio",
                  "🌟 Groove Nation Academy",
                  "🎤 Sun Music",
                  "📻 RED FM 93.5",
                ].map((brand, idx) => (
                  <div key={idx} className="sponsor-chip-large">
                    {brand}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Infinite Marquee 2 (Media & Entertainment Partners - Right to Left) ── */}
          <div style={{ position: "relative", width: "100%", overflow: "hidden", padding: "12px 0" }} className="marquee-wrapper">
            {/* Fade edges */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 90, background: "linear-gradient(to right, #F9FAFB, transparent)", zIndex: 5, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 90, background: "linear-gradient(to left, #F9FAFB, transparent)", zIndex: 5, pointerEvents: "none" }} />

            <div className="marquee-track-container">
              <div className="marquee-track marquee-anim-rtl">
                {[
                  "📺 TV5 News",
                  "📰 ABN Andhra Jyothi",
                  "📺 Sakshi TV",
                  "🎬 NTV Entertainment",
                  "🎟️ EventuMozo",
                  "🌆 CityLight News",
                  "⭐ Star Vijay Entertainment",
                  "📺 TV5 News",
                  "📰 ABN Andhra Jyothi",
                  "📺 Sakshi TV",
                  "🎬 NTV Entertainment",
                  "🎟️ EventuMozo",
                  "🌆 CityLight News",
                  "⭐ Star Vijay Entertainment",
                ].map((p, idx) => (
                  <div key={idx} className="sponsor-chip-large">
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 6. Ultra-Premium Hoverable Newsletter Banner ── */}
        <FaqNewsletterSection
          subscribed={subscribed}
          email={newsletterEmail}
          setEmail={setNewsletterEmail}
          onSubscribe={() => {
            if (newsletterEmail.trim()) setSubscribed(true);
          }}
        />

      </div>

      <style>{`
        /* Marquee infinite scrolling tracks */
        .marquee-track-container {
          display: flex;
          width: 100%;
          overflow: hidden;
        }

        .marquee-track {
          display: flex;
          gap: 20px;
          white-space: nowrap;
          will-change: transform;
        }

        /* Line 1: Left to Right */
        .marquee-anim-ltr {
          animation: marqueeScrollLTR 26s linear infinite;
        }

        /* Line 2: Right to Left */
        .marquee-anim-rtl {
          animation: marqueeScrollRTL 28s linear infinite;
        }

        /* Pause scrolling when mouse is over marquee */
        .marquee-wrapper:hover .marquee-track {
          animation-play-state: paused !important;
        }

        @keyframes marqueeScrollLTR {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        @keyframes marqueeScrollRTL {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Large Prominent Sponsor Chips with Spring Hover Physics */
        .sponsor-chip-large {
          padding: 14px 28px;
          background: #fff;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          font-size: 14.5px;
          font-weight: 900;
          color: #111827;
          box-shadow: 0 4px 14px rgba(0,0,0,0.04);
          transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .sponsor-chip-large:hover {
          transform: translateY(-5px) scale(1.06);
          border-color: #6D28D9;
          color: #6D28D9;
          box-shadow: 0 14px 32px rgba(109,40,217,0.25);
          background: linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%);
        }

        @media (max-width: 1024px) {
          .faq-hero-grid { grid-template-columns: 1fr !important; }
          .faq-layout { grid-template-columns: 1fr !important; }
          .support-cards-grid-3 { grid-template-columns: 1fr !important; }
          .faq-newsletter-bar { flex-direction: column !important; align-items: flex-start !important; }
          .faq-news-form { width: 100% !important; }
        }
      `}</style>
      <Footer />
    </div>
  );
}
