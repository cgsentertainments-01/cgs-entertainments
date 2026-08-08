"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Clock,
  Globe,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Instagram,
  Youtube,
  Facebook,
  ArrowRight,
  User,
  FileText,
  Building,
  Award,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/* ── INQUIRY TOPICS ── */
const INQUIRY_TOPICS = [
  { id: "general", label: "General Question" },
  { id: "registration", label: "Event Registration" },
  { id: "sponsorship", label: "Sponsorship & Media" },
  { id: "judge", label: "Judge / Guest Request" },
  { id: "payment", label: "Payment & Invoice" },
];

/* ── QUICK FAQS ── */
const QUICK_FAQS = [
  {
    q: "How fast will I receive a reply from CGS Support?",
    a: "Our support team responds within 15 minutes during operating hours (Mon-Sat, 9:00 AM - 8:00 PM IST). Emails sent after hours are addressed early next morning.",
  },
  {
    q: "Can I register for events directly at the venue?",
    a: "On-spot registrations depend on slot availability. We strongly recommend registering online in advance to secure your stage slot and receive instant confirmation badges.",
  },
  {
    q: "How do I submit or replace my audio music track?",
    a: "You can upload your MP3 track during step 3 of the registration wizard or update it anytime through your Participant Dashboard up to 48 hours before the event.",
  },
  {
    q: "What should I do if my payment is deducted but status says pending?",
    a: "Payment gateways take 5-10 minutes to sync. If your status doesn't update automatically, email your transaction ID to cgsentertainment's 01@gmail.com for instant verification.",
  },
];

export default function ContactPage() {
  const [selectedTopic, setSelectedTopic] = useState("general");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && email && message) {
      setIsSubmitted(true);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "inherit" }}>
      <Navbar />

      {/* ── 1. HERO HEADER ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #090314 0%, #1A0A3A 40%, #2E1065 75%, #4C1D95 100%)",
          paddingTop: 76,
          paddingBottom: 60,
          position: "relative",
          overflow: "hidden",
          color: "#fff",
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: "absolute",
            top: "-30%",
            right: "5%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", position: "relative", zIndex: 2 }}>
          {/* Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Link href="/" style={{ fontSize: 13, color: "#C4B5FD", textDecoration: "none", fontWeight: 500 }}>
              Home
            </Link>
            <ChevronRight size={14} color="#A78BFA" />
            <span style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>Contact Us</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 14px",
                  borderRadius: 20,
                  background: "rgba(167, 139, 250, 0.15)",
                  border: "1px solid rgba(167, 139, 250, 0.3)",
                  color: "#E9D5FF",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                <Sparkles size={14} color="#C4B5FD" />
                24/7 PARTICIPANT SUPPORT
              </div>

              <h1
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  margin: "0 0 12px",
                  letterSpacing: -1,
                  background: "linear-gradient(135deg, #FFFFFF 0%, #E9D5FF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Get In Touch With Us
              </h1>

              <p style={{ fontSize: 15.5, color: "#C4B5FD", margin: 0, maxWidth: 580, lineHeight: 1.6, fontWeight: 500 }}>
                Have questions about dance competitions, slot bookings, media partnerships, or guest requests? Reach out to our dedicated support team!
              </p>
            </div>

            {/* Live Support Indicator */}
            <div
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: 18,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ position: "relative", width: 12, height: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22C55E" }} />
                <div
                  style={{
                    position: "absolute",
                    inset: -3,
                    borderRadius: "50%",
                    border: "2px solid #22C55E",
                    animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
                    opacity: 0.75,
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 900, color: "#fff" }}>Support Team Online</div>
                <div style={{ fontSize: 12, color: "#86EFAC", fontWeight: 700 }}>Avg Response Time: &lt; 15 mins</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. 3 HIGH-IMPACT FEATURE CARDS ── */}
      <div style={{ maxWidth: 1200, margin: "-32px auto 0", padding: "0 28px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="contact-3-cards">
          {/* Card 1: Official Email */}
          <FeatureCard
            icon={<Mail size={24} color="#6D28D9" />}
            title="Official Email"
            value="cgsentertainment's 01@gmail.com"
            desc="For event slots, queries &amp; document support"
            actionLabel="Send Email"
            href="mailto:cgsentertainment's 01@gmail.com"
            accent="#6D28D9"
            bg="#F3E8FF"
          />

          {/* Card 2: Phone & WhatsApp */}
          <FeatureCard
            icon={<Phone size={24} color="#16A34A" />}
            title="Helpline &amp; WhatsApp"
            value="+91 80194 88112"
            desc="Mon – Sat (9:00 AM – 8:00 PM IST)"
            actionLabel="Chat on WhatsApp"
            href="https://wa.me/918019488112"
            accent="#16A34A"
            bg="#DCFCE7"
          />

          {/* Card 3: Headquarters */}
          <FeatureCard
            icon={<MapPin size={24} color="#0284C7" />}
            title="Corporate Headquarters"
            value="Jubilee Hills, Hyderabad"
            desc="Road No. 36, Hyderabad, Telangana 500033"
            actionLabel="View Location"
            href="https://maps.google.com"
            accent="#0284C7"
            bg="#E0F2FE"
          />
        </div>
      </div>

      {/* ── 3. MAIN SECTION: MSME DETAILS & CONTACT FORM ── */}
      <div style={{ maxWidth: 1200, margin: "44px auto 64px", padding: "0 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: 32 }} className="contact-grid-main">
          
          {/* ── LEFT COLUMN: MSME Certificate Card, Hours, Socials ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* MSME GOVT REGISTERED CERTIFICATE CARD */}
            <CardWrapper accent="#D97706">
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)", border: "1.5px solid #FCD34D", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Award size={26} />
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#D97706", textTransform: "uppercase", letterSpacing: 1.2, display: "block" }}>
                    GOVT. OF INDIA REGISTERED
                  </span>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "#111827", margin: "2px 0 0" }}>
                    MSME &amp; ISO 9001:2015 Certified
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: "#4B5563", margin: "0 0 14px", lineHeight: 1.5, fontWeight: 500 }}>
                CGS Entertainments is an officially registered enterprise under the Ministry of MSME, Govt. of India.
              </p>
              <div style={{ padding: "10px 14px", background: "#FEF3C7", borderRadius: 12, border: "1px solid #FDE68A", fontSize: 12.5, fontWeight: 800, color: "#78350F" }}>
                📜 Reg. No: UDYAM-TS-02-0048112
              </div>
            </CardWrapper>

            {/* QUICK CONTACT DETAILS CARD */}
            <CardWrapper accent="#6D28D9">
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: "0 0 16px" }}>
                Direct Contact Information
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Email */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#F3E8FF", color: "#6D28D9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>Primary Mail</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>cgsentertainment&apos;s 01@gmail.com</div>
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>WhatsApp Helpline</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>+91 80194 88112</div>
                  </div>
                </div>

                {/* Hours */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase" }}>Operating Hours</div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#111827" }}>Mon – Sat: 9:00 AM – 8:00 PM IST</div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Launch Banner */}
              <a
                href="https://wa.me/918019488112"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                  color: "#fff",
                  textDecoration: "none",
                  marginTop: 20,
                  boxShadow: "0 6px 18px rgba(22,163,74,0.25)",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className="wa-btn-hover"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <MessageCircle size={20} />
                  <span style={{ fontSize: 13.5, fontWeight: 900 }}>Chat Directly on WhatsApp</span>
                </div>
                <ArrowRight size={16} />
              </a>
            </CardWrapper>

            {/* SOCIAL MEDIA HANDLES CARD */}
            <CardWrapper accent="#EC4899">
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#111827", margin: "0 0 6px" }}>
                Official Social Media Channels
              </h3>
              <p style={{ fontSize: 12.5, color: "#6B7280", margin: "0 0 14px", fontWeight: 500 }}>
                Follow us for live stage highlights, winner updates &amp; announcements.
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <SocialChip icon={<Instagram size={16} />} label="cgs_entertainments_88112" color="#E1306C" href="https://instagram.com/cgs_entertainments_88112" />
                <SocialChip icon={<Youtube size={16} />} label="Cgs Entertainments" color="#FF0000" href="https://youtube.com" />
                <SocialChip icon={<MessageCircle size={16} />} label="WhatsApp (8019488112)" color="#25D366" href="https://wa.me/918019488112" />
              </div>
            </CardWrapper>

          </div>

          {/* ── RIGHT COLUMN: ULTRA-PREMIUM CONTACT FORM ── */}
          <CardWrapper accent="#6D28D9" padding="36px">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "#F3E8FF", color: "#6D28D9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send size={20} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "#111827", margin: 0, letterSpacing: -0.4 }}>
                Send Us A Message
              </h2>
            </div>
            <p style={{ fontSize: 13.5, color: "#6B7280", margin: "0 0 24px", fontWeight: 500 }}>
              Fill out the details below and our team will respond within 15 minutes.
            </p>

            {/* Inquiry Topic Chips */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 11.5, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 10 }}>
                Select Topic *
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {INQUIRY_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic.id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 800,
                      border: `1.5px solid ${selectedTopic === topic.id ? "#6D28D9" : "#E2E8F0"}`,
                      background: selectedTopic === topic.id ? "#F3E8FF" : "#F8FAFC",
                      color: selectedTopic === topic.id ? "#6D28D9" : "#475569",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      boxShadow: selectedTopic === topic.id ? "0 4px 14px rgba(109,40,217,0.18)" : "none",
                    }}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {isSubmitted ? (
              <div style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)", border: "2px solid #86EFAC", borderRadius: 20, padding: "36px 24px", textAlign: "center", marginTop: 12 }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#22C55E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <CheckCircle2 size={34} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "#14532D", margin: "0 0 6px" }}>
                  Message Received! 🎉
                </h3>
                <p style={{ fontSize: 14, color: "#166534", margin: "0 0 20px", fontWeight: 500 }}>
                  Thank you, <strong>{fullName}</strong>. Your ticket is routed to <strong>cgsentertainment&apos;s 01@gmail.com</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFullName("");
                    setEmail("");
                    setPhone("");
                    setMessage("");
                  }}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 12,
                    background: "#16A34A",
                    color: "#fff",
                    border: "none",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {/* Name & Phone */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-2col">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                      Full Name *
                    </label>
                    <div style={{ position: "relative" }}>
                      <User size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        type="text"
                        placeholder="Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "12px 14px 12px 40px",
                          borderRadius: 12,
                          border: "1.5px solid #E2E8F0",
                          fontSize: 14,
                          outline: "none",
                          background: "#F8FAFC",
                          color: "#0F172A",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                      Phone / WhatsApp *
                    </label>
                    <div style={{ position: "relative" }}>
                      <Phone size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        type="tel"
                        placeholder="+91 80194 88112"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "12px 14px 12px 40px",
                          borderRadius: 12,
                          border: "1.5px solid #E2E8F0",
                          fontSize: 14,
                          outline: "none",
                          background: "#F8FAFC",
                          color: "#0F172A",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                    Email Address *
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 40px",
                        borderRadius: 12,
                        border: "1.5px solid #E2E8F0",
                        fontSize: 14,
                        outline: "none",
                        background: "#F8FAFC",
                        color: "#0F172A",
                      }}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" }}>
                    Your Query / Details *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe your question or event query here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 12,
                      border: "1.5px solid #E2E8F0",
                      fontSize: 14,
                      outline: "none",
                      background: "#F8FAFC",
                      color: "#0F172A",
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* Security shield */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 12, fontWeight: 600 }}>
                  <ShieldCheck size={16} color="#22C55E" />
                  Your information is 100% confidential and protected.
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  style={{
                    padding: "16px 28px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)",
                    color: "#fff",
                    border: "none",
                    fontSize: 15,
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: "0 8px 24px rgba(109, 40, 217, 0.35)",
                    transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  className="submit-btn-hover"
                >
                  Send Message
                  <Send size={18} />
                </button>
              </form>
            )}
          </CardWrapper>

        </div>
      </div>

      {/* ── 4. QUICK HELP FAQ SECTION ── */}
      <div style={{ background: "#fff", borderTop: "1.5px solid #E2E8F0", borderBottom: "1.5px solid #E2E8F0", padding: "56px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 36px" }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#6D28D9", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              INSTANT SUPPORT
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 8px", letterSpacing: -0.5 }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: 14, color: "#64748B", margin: 0, fontWeight: 500 }}>
              Quick solutions to common participant questions.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="faq-2col">
            {QUICK_FAQS.map((faq, idx) => (
              <div
                key={idx}
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                style={{
                  background: openFaq === idx ? "#FAF5FF" : "#F8FAFC",
                  border: `1.5px solid ${openFaq === idx ? "#C4B5FD" : "#E2E8F0"}`,
                  borderRadius: 18,
                  padding: "20px 24px",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className="faq-card-hover"
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <HelpCircle size={18} color={openFaq === idx ? "#6D28D9" : "#64748B"} />
                    <h3 style={{ fontSize: 14.5, fontWeight: 800, color: openFaq === idx ? "#6D28D9" : "#0F172A", margin: 0 }}>
                      {faq.q}
                    </h3>
                  </div>
                  <ChevronRight
                    size={18}
                    color={openFaq === idx ? "#6D28D9" : "#94A3B8"}
                    style={{ transform: openFaq === idx ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.25s" }}
                  />
                </div>

                {openFaq === idx && (
                  <p style={{ fontSize: 13.5, color: "#334155", marginTop: 12, marginBottom: 0, lineHeight: 1.6, fontWeight: 500 }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link
              href="/faqs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                borderRadius: 14,
                background: "#6D28D9",
                color: "#fff",
                fontSize: 14,
                fontWeight: 900,
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(109,40,217,0.3)",
              }}
            >
              View Full FAQ Knowledge Base <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .feature-card-item:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 44px rgba(0,0,0,0.08) !important;
        }
        .card-wrapper-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 44px rgba(0,0,0,0.07) !important;
        }
        .social-chip-item:hover {
          transform: translateY(-3px) scale(1.05);
        }
        .submit-btn-hover:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 14px 36px rgba(109, 40, 217, 0.5) !important;
        }
        .wa-btn-hover:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 24px rgba(22,163,74,0.4) !important;
        }
        .faq-card-hover:hover {
          transform: translateY(-4px);
          border-color: #6D28D9 !important;
        }

        @media (max-width: 1024px) {
          .contact-3-cards { grid-template-columns: 1fr !important; }
          .contact-grid-main { grid-template-columns: 1fr !important; }
          .faq-2col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .form-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}

/* ── REUSABLE CARD WRAPPER WITH HOVER ── */
function CardWrapper({ children, accent = "#6D28D9", padding = "28px" }: { children: React.ReactNode; accent?: string; padding?: string }) {
  const [h, setH] = useState(false);

  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: "#fff",
        border: `1.5px solid ${h ? accent : "#E2E8F0"}`,
        borderRadius: 24,
        padding: padding,
        boxShadow: h ? `0 20px 44px ${accent}1A` : "0 4px 20px rgba(0,0,0,0.03)",
        transform: h ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      className="card-wrapper-item"
    >
      {children}
    </div>
  );
}

/* ── SUB-COMPONENT: Feature Card ── */
function FeatureCard({
  icon,
  title,
  value,
  desc,
  actionLabel,
  href,
  accent,
  bg,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  desc: string;
  actionLabel: string;
  href: string;
  accent: string;
  bg: string;
}) {
  const [h, setH] = useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: "#fff",
        border: `1.5px solid ${h ? accent : "#E2E8F0"}`,
        borderRadius: 22,
        padding: "24px 22px",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: h ? `0 18px 40px ${accent}22` : "0 4px 18px rgba(0,0,0,0.03)",
        transform: h ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      className="feature-card-item"
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {icon}
          </div>
          <span style={{ fontSize: 11, fontWeight: 900, color: accent, background: bg, padding: "4px 10px", borderRadius: 12 }}>
            DIRECT LINK
          </span>
        </div>

        <div style={{ fontSize: 11, fontWeight: 900, color: "#64748B", textTransform: "uppercase", letterSpacing: 0.8 }}>
          {title}
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 900, color: "#0F172A", marginTop: 3, wordBreak: "break-word" }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500, marginTop: 4 }}>
          {desc}
        </div>
      </div>

      <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", color: accent, fontSize: 13, fontWeight: 800 }}>
        <span>{actionLabel}</span>
        <ArrowRight size={16} style={{ transform: h ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />
      </div>
    </a>
  );
}

/* ── SUB-COMPONENT: Social Chip ── */
function SocialChip({ icon, label, color, href }: { icon: React.ReactNode; label: string; color: string; href: string }) {
  const [h, setH] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 14,
        background: h ? color : "#F8FAFC",
        border: `1.5px solid ${h ? color : "#E2E8F0"}`,
        color: h ? "#fff" : "#334155",
        fontSize: 12.5,
        fontWeight: 800,
        textDecoration: "none",
        transform: h ? "translateY(-3px) scale(1.04)" : "translateY(0) scale(1)",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      className="social-chip-item"
    >
      {icon}
      {label}
    </a>
  );
}
