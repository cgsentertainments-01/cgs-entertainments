"use client";

import React, { useState } from "react";
import { Mail, CheckCircle, Send } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [h, setH] = useState(false);
  const [btnH, setBtnH] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-container">
        <div
          onMouseEnter={() => setH(true)}
          onMouseLeave={() => setH(false)}
          className={`newsletter-card ${h ? "is-hovered" : ""}`}
        >
          {/* Content Block: Icon & Text */}
          <div className="newsletter-content-block">
            <div className="newsletter-icon-wrapper">
              <Mail size={26} color="#C4B5FD" />
            </div>
            <div className="newsletter-text-wrapper">
              <h2 className="newsletter-heading">
                Stay Updated on Upcoming Competitions
              </h2>
              <p className="newsletter-description">
                Subscribe to get instant notifications about dates, venues, registration deadlines, and exclusive early-bird discounts.
              </p>
            </div>
          </div>

          {/* Form or Success Box */}
          {submitted ? (
            <div className="newsletter-success-box">
              <CheckCircle size={20} color="#86EFAC" />
              <span>Thank you for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="newsletter-input-wrapper">
                <Mail size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="newsletter-input"
                />
              </div>

              <button
                type="submit"
                onMouseEnter={() => setBtnH(true)}
                onMouseLeave={() => setBtnH(false)}
                className={`newsletter-submit-btn ${btnH ? "btn-hovered" : ""}`}
              >
                <span>Subscribe</span>
                <Send size={16} className="btn-send-icon" />
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .newsletter-section {
          padding: 48px 0;
          background: #ffffff;
          border-top: 1px solid #F3F4F6;
          width: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }

        .newsletter-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          width: 100%;
          box-sizing: border-box;
        }

        .newsletter-card {
          background: linear-gradient(135deg, #090314 0%, #1A0A3A 50%, #311068 100%);
          border-radius: 24px;
          padding: 44px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          border: 2px solid rgba(167, 139, 250, 0.25);
          box-shadow: 0 12px 40px rgba(15, 10, 40, 0.35);
          transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .newsletter-card.is-hovered {
          border-color: #A78BFA;
          box-shadow: 0 24px 60px rgba(109, 40, 217, 0.45), 0 0 32px rgba(167, 139, 250, 0.25);
          transform: translateY(-6px) scale(1.01);
        }

        .newsletter-content-block {
          display: flex;
          align-items: center;
          gap: 20px;
          max-width: 560px;
          width: 100%;
          box-sizing: border-box;
        }

        .newsletter-icon-wrapper {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.12);
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .newsletter-card.is-hovered .newsletter-icon-wrapper {
          background: rgba(167, 139, 250, 0.25);
          border-color: #C4B5FD;
          transform: scale(1.12) rotate(-6deg);
        }

        .newsletter-text-wrapper {
          flex: 1;
          min-width: 0;
        }

        .newsletter-heading {
          font-size: 26px;
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 6px;
          letter-spacing: -0.4px;
          line-height: 1.2;
          word-wrap: break-word;
        }

        .newsletter-description {
          font-size: 13.5px;
          color: #C4B5FD;
          margin: 0;
          line-height: 1.6;
          font-weight: 500;
          word-wrap: break-word;
        }

        .newsletter-form {
          display: flex;
          gap: 12px;
          flex: 1 1 380px;
          max-width: 440px;
          width: 100%;
          box-sizing: border-box;
        }

        .newsletter-input-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border-radius: 14px;
          padding: 0 16px;
          flex: 1;
          height: 52px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          min-width: 0;
          box-sizing: border-box;
        }

        .newsletter-input {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          font-size: 14px;
          color: #111827;
          background: transparent;
          box-sizing: border-box;
        }

        .newsletter-submit-btn {
          padding: 0 26px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 20px rgba(109, 40, 217, 0.35);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .newsletter-submit-btn.btn-hovered {
          background: linear-gradient(135deg, #5B21B6 0%, #6D28D9 100%);
          box-shadow: 0 12px 32px rgba(109, 40, 217, 0.5);
          transform: translateY(-2px) scale(1.03);
        }

        .btn-send-icon {
          transition: transform 0.2s ease;
        }

        .newsletter-submit-btn.btn-hovered .btn-send-icon {
          transform: translateX(4px);
        }

        .newsletter-success-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(34, 197, 94, 0.2);
          border: 1.5px solid #22C55E;
          padding: 14px 24px;
          border-radius: 14px;
          color: #86EFAC;
          font-weight: 800;
          font-size: 14px;
          box-sizing: border-box;
          justify-content: center;
        }

        /* ── RESPONSIVE MEDIA QUERIES ── */

        /* Tablet (640px to 1024px) */
        @media (max-width: 1024px) {
          .newsletter-container {
            padding: 0 24px;
          }
          .newsletter-card {
            flex-direction: column;
            align-items: stretch;
            padding: 36px 32px;
            gap: 24px;
          }
          .newsletter-content-block {
            max-width: 100%;
          }
          .newsletter-form {
            max-width: 100%;
            flex: none;
          }
        }

        /* Mobile (< 640px) */
        @media (max-width: 639px) {
          .newsletter-section {
            padding: 24px 0;
          }
          .newsletter-container {
            padding: 0 16px;
          }
          .newsletter-card {
            padding: 28px 20px !important;
            border-radius: 24px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            transform: none !important;
          }
          .newsletter-content-block {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .newsletter-heading {
            font-size: 26px !important;
            line-height: 1.15 !important;
            margin-bottom: 8px !important;
          }
          .newsletter-description {
            font-size: 15px !important;
            line-height: 1.6 !important;
          }
          .newsletter-form {
            flex-direction: column !important;
            width: 100% !important;
            max-width: 100% !important;
            flex: none !important;
            gap: 12px !important;
          }
          .newsletter-input-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            height: 52px !important;
            flex: none !important;
            box-sizing: border-box !important;
          }
          .newsletter-submit-btn {
            width: 100% !important;
            max-width: 100% !important;
            height: 52px !important;
            margin-top: 0 !important;
            flex: none !important;
            justify-content: center !important;
            box-sizing: border-box !important;
          }
          .newsletter-success-box {
            width: 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
    </section>
  );
}
