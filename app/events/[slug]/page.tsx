"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GuestsJudgesSection } from "@/components/guests/GuestsJudgesSection";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Shield,
  Star,
  CheckCircle,
  Share2,
  Heart,
  Instagram,
  Youtube,
} from "lucide-react";

/* ─── GUESTS & JUDGES DATA ─── */
const GUESTS_AND_JUDGES = [
  {
    name: "Shiamak Davar",
    role: "International Dancer",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Punit Pathak",
    role: "Choreographer",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Shakti Mohan",
    role: "Dancer",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Neeti Mohan",
    role: "Singer",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Terence Lewis",
    role: "Choreographer",
    img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
  },
];

/* ─── HOVER COMPONENT: Judge Card ─── */
function JudgeCard({ person }: { person: typeof GUESTS_AND_JUDGES[0] }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 8,
        flexShrink: 0,
        width: 120,
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: h ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 92,
          height: 92,
          borderRadius: "50%",
          overflow: "hidden",
          border: `2.5px solid ${h ? "#6D28D9" : "#E5E7EB"}`,
          boxShadow: h ? "0 8px 24px rgba(109, 40, 217, 0.25)" : "0 2px 8px rgba(0,0,0,0.06)",
          transition: "all 0.25s ease",
        }}
      >
        <Image
          src={person.img}
          alt={person.name}
          fill
          style={{ objectFit: "cover", transform: h ? "scale(1.1)" : "scale(1)", transition: "transform 0.35s ease" }}
        />
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: h ? "#6D28D9" : "#111827", transition: "color 0.2s" }}>
          {person.name}
        </div>
        <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 500, marginTop: 1 }}>
          {person.role}
        </div>
      </div>
      {/* Social Icons */}
      <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
        <div style={{ padding: 4, borderRadius: "50%", background: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Instagram size={12} color="#E1306C" />
        </div>
        <div style={{ padding: 4, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Youtube size={12} color="#FF0000" />
        </div>
      </div>
    </div>
  );
}

/* ─── HOVER COMPONENT: Highlight Card ─── */
function HighlightCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const [h, setH] = useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        background: h ? "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)" : "#FAFAFA",
        border: `1.5px solid ${h ? "#C4B5FD" : "#F3F4F6"}`,
        borderRadius: 14,
        cursor: "default",
        transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: h ? "translateY(-4px) scale(1.015)" : "translateY(0) scale(1)",
        boxShadow: h
          ? "0 12px 28px rgba(109, 40, 217, 0.12), 0 2px 8px rgba(0,0,0,0.04)"
          : "0 1px 4px rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: h ? "#EDE9FE" : "#fff",
          border: `1.5px solid ${h ? "#A78BFA" : "#E5E7EB"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.28s",
          transform: h ? "scale(1.15) rotate(-5deg)" : "scale(1) rotate(0deg)",
          boxShadow: h ? "0 4px 14px rgba(109,40,217,0.18)" : "none",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, color: h ? "#7C3AED" : "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, transition: "color 0.2s" }}>
          {label}
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: h ? "#6D28D9" : "#111827", transition: "color 0.2s" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

/* ─── HOVER COMPONENT: Sidebar White Register Button ─── */
function SidebarRegisterBtn({ href }: { href: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [h, setH] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!user) {
      router.push(`/login?redirectTo=${encodeURIComponent(href)}`);
    } else {
      router.push(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        padding: "14px 24px",
        borderRadius: 14,
        background: "#fff",
        color: "#6D28D9",
        textDecoration: "none",
        fontSize: 15,
        fontWeight: 900,
        boxShadow: h ? "0 8px 24px rgba(0,0,0,0.25)" : "0 4px 14px rgba(0,0,0,0.12)",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: h ? "translateY(-3px) scale(1.02)" : "translateY(0) scale(1)",
        cursor: "pointer",
      }}
    >
      Register Now
      <ChevronRight size={18} style={{ transform: h ? "translateX(4px)" : "translateX(0)", transition: "transform 0.2s" }} />
    </a>
  );
}

/* ─── LIVE RUNNING COUNTDOWN TIMER COMPONENT ─── */
function LiveCountdownTimer() {
  const [totalSeconds, setTotalSeconds] = useState(15 * 86400 + 8 * 3600 + 36 * 60 + 20);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  const blocks = [
    { val: pad(days), label: "Days" },
    { val: pad(hours), label: "Hours" },
    { val: pad(minutes), label: "Mins" },
    { val: pad(seconds), label: "Secs", isSecs: true },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 20 }}>
      {blocks.map((t, i) => (
        <div
          key={i}
          style={{
            background: t.isSecs ? "rgba(109,40,217,0.7)" : "rgba(15,10,40,0.5)",
            border: t.isSecs ? "1.5px solid #A78BFA" : "1px solid rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "10px 4px",
            textAlign: "center",
            boxShadow: t.isSecs ? "0 0 16px rgba(167,139,250,0.4)" : "none",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>{t.val}</div>
          <div style={{ fontSize: 10, color: t.isSecs ? "#E9D5FF" : "#C4B5FD", fontWeight: 700, marginTop: 1 }}>
            {t.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function EventDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const [evt, setEvt] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    async function loadEventDetail() {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/events?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setEvt(data.event || null);
        } else {
          setEvt(null);
        }
      } catch (err) {
        console.error("Error loading event detail:", err);
        setEvt(null);
      } finally {
        setLoading(false);
      }
    }
    loadEventDetail();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
        <Navbar />
        <div style={{ marginTop: 120, textAlign: "center", color: "#6B7280", fontWeight: 600 }}>
          Loading event details...
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
          <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 24 }}>The event you are looking for does not exist or has been removed.</p>
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
            Back to Events
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const feeDisplay = typeof evt.registrationFee === "number" ? `₹${evt.registrationFee}` : evt.registrationFee || "₹0";

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />

      {/* ── Top Header Hero Banner ── */}
      <div style={{ marginTop: 64 }}>
        <div style={{ position: "relative", width: "100%", height: 340, overflow: "hidden" }} className="det-hero">
          <Image
            src={evt.img || evt.banner_url || "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1400&q=90"}
            alt={evt.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(15,10,40,0.95) 0%, rgba(15,10,40,0.5) 50%, rgba(15,10,40,0.15) 100%)",
            }}
          />

          {/* Badge */}
          <div style={{ position: "absolute", top: 24, left: 32 }}>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                background: evt.badgeBg || "#312E81",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              {evt.badge || evt.category || "EVENT"}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ position: "absolute", top: 24, right: 32, display: "flex", gap: 10 }}>
            <button
              onClick={() => setLiked(!liked)}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: liked ? "rgba(236,72,153,0.25)" : "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.22s ease",
              }}
            >
              <Heart size={19} color={liked ? "#EC4899" : "#fff"} fill={liked ? "#EC4899" : "none"} />
            </button>
            <button
              onClick={() => alert("Share link copied to clipboard!")}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                border: "1.5px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.22s ease",
              }}
            >
              <Share2 size={19} color="#fff" />
            </button>
          </div>

          {/* Title overlay */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 32px 28px" }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: -0.5, lineHeight: 1.2 }} className="det-h1">
              {evt.title}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px" }}>
              {[
                { icon: <Calendar size={14} color="#C4B5FD" />, text: evt.date },
                { icon: <Clock size={14} color="#C4B5FD" />, text: "10:00 AM – 8:00 PM" },
                { icon: <MapPin size={14} color="#F472B6" />, text: evt.location || evt.venue },
              ].map((m, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#F3F4F6", fontWeight: 600 }}>
                  {m.icon}
                  {m.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 60px" }} className="cgs-main-container">
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <Link href="/" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>
            Home
          </Link>
          <ChevronRight size={13} color="#9CA3AF" />
          <Link href="/events" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none", fontWeight: 500 }}>
            Events
          </Link>
          <ChevronRight size={13} color="#9CA3AF" />
          <span style={{ fontSize: 13, color: "#111827", fontWeight: 700 }}>{evt.title}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }} className="det-layout">
          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* 1. GUESTS & JUDGES SECTION */}
            <GuestsJudgesSection />

            {/* 2. ABOUT THE EVENT SECTION */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", marginBottom: 12, position: "relative", display: "inline-block" }}>
                About the Event
                <span style={{ position: "absolute", bottom: -6, left: 0, width: 28, height: 3, background: "#6D28D9", borderRadius: 99 }} />
              </h2>
              <p style={{ fontSize: 14.5, color: "#4B5563", lineHeight: 1.8, margin: "16px 0 0" }}>
                {evt.description || `${evt.title} is an official national talent competition hosted by CGS Entertainments. Compete with top performers and win exciting awards and recognition.`}
              </p>
            </div>

            {/* 3. EVENT HIGHLIGHTS SECTION */}
            <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 22, padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", marginBottom: 20, position: "relative", display: "inline-block" }}>
                Event Highlights
                <span style={{ position: "absolute", bottom: -6, left: 0, width: 28, height: 3, background: "#6D28D9", borderRadius: 99 }} />
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }} className="highlights-grid">
                <HighlightCard icon={<Trophy size={20} color="#D97706" />} label="Prize Pool" value="₹50,000" />
                <HighlightCard icon={<Users size={20} color="#6D28D9" />} label="Participants" value={`${evt.participantsCount || 200}+`} />
                <HighlightCard icon={<Shield size={20} color="#2563EB" />} label="Entry Fee" value={feeDisplay} />
                <HighlightCard icon={<Star size={20} color="#EC4899" />} label="Status" value={evt.status === "registration_open" ? "Registration Open" : evt.status || "Open"} />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Sticky Purple Registration Sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: "linear-gradient(135deg, #3B0764 0%, #5B21B6 50%, #6D28D9 100%)",
                borderRadius: 24,
                padding: "28px",
                color: "#fff",
                boxShadow: "0 12px 36px rgba(109,40,217,0.3)",
                position: "sticky",
                top: 90,
              }}
              className="det-reg-card"
            >
              <h3 style={{ fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 4px" }}>
                Register for this Event
              </h3>
              <p style={{ fontSize: 13, color: "#DDD6FE", margin: "0 0 20px", fontWeight: 500 }}>
                Limited Seats! Register Now
              </p>

              <div style={{ height: 1, background: "rgba(255,255,255,0.18)", marginBottom: 20 }} />

              {/* Registration Fee */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#DDD6FE", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Registration Fee
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>{feeDisplay}</span>
                  <span style={{ fontSize: 13, color: "#DDD6FE", fontWeight: 500 }}>Per Participant</span>
                </div>
              </div>

              {/* Register Button */}
              <SidebarRegisterBtn href={`/register/${evt.id}`} />

              {/* Subtext */}
              <div style={{ textAlign: "center", fontSize: 12, color: "#F3E8FF", marginTop: 14, fontWeight: 600 }}>
                Hurry up! Registrations closing soon.
              </div>

              {/* Live Countdown Timer */}
              <LiveCountdownTimer />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 900px) {
          .det-layout { grid-template-columns: 1fr !important; }
          .det-hero { height: 260px !important; }
          .det-h1 { font-size: 24px !important; }
          .highlights-grid { grid-template-columns: 1fr !important; }
          .det-reg-card { position: static !important; }
        }
        @media (max-width: 640px) {
          .det-hero { height: 220px !important; }
          .det-h1 { font-size: 20px !important; }
        }
      `}</style>
      <Footer />
    </div>
  );
}
