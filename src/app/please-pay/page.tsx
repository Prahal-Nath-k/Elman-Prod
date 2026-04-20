import type { Metadata } from "next";
import { Lock, Zap, Shield, BarChart3, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Subscription Required — Elman ERP",
  description: "Your subscription has expired. Please renew to continue using Elman ERP.",
};

const features = [
  {
    icon: BarChart3,
    label: "Production Pipeline",
    desc: "Real-time job tracking across all manufacturing stages",
  },
  {
    icon: Zap,
    label: "Division Dashboards",
    desc: "Dedicated views for Mechanical & Electrical divisions",
  },
  {
    icon: Shield,
    label: "Secure Access Control",
    desc: "Role-based permissions and audit trails",
  },
];

export default function PleasePay() {
  return (
    <div className="please-pay-root">
      {/* Ambient background blobs */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />

      <main className="please-pay-card">
        {/* Lock icon */}
        <div className="lock-wrapper" aria-hidden="true">
          <div className="lock-ring lock-ring-outer" />
          <div className="lock-ring lock-ring-inner" />
          <div className="lock-icon-circle">
            <Lock size={32} strokeWidth={1.8} />
          </div>
        </div>

        {/* Heading */}
        <div className="please-pay-heading">
          <h1>Access Suspended</h1>
          <p className="please-pay-sub">
            Your Elman&nbsp;ERP subscription has expired or is inactive.
            Please renew your plan to restore full access to the production
            pipeline.
          </p>
        </div>

        {/* What you're missing */}
        <div className="features-grid" role="list" aria-label="Included features">
          {features.map(({ icon: Icon, label, desc }) => (
            <div className="feature-item" role="listitem" key={label}>
              <div className="feature-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.7} />
              </div>
              <div>
                <p className="feature-label">{label}</p>
                <p className="feature-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="please-pay-actions">
          <a
            id="renew-btn"
            href="mailto:billing@elmangroup.com?subject=ERP%20Subscription%20Renewal"
            className="btn-primary"
          >
            <Mail size={16} strokeWidth={2} />
            Contact Billing
          </a>
          <p className="please-pay-note">
            Already renewed?&nbsp;
            <a href="mailto:support@elmangroup.com" className="inline-link">
              Contact support
            </a>
            &nbsp;to activate your account.
          </p>
        </div>
      </main>

      <style>{`
        /* ── Reset / root ── */
        .please-pay-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          background: #080b12;
          font-family: var(--font-geist-sans, 'Inter', sans-serif);
        }

        /* ── Ambient blobs ── */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.35;
          animation: drift 18s ease-in-out infinite alternate;
        }
        .blob-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, #6366f1 0%, transparent 70%);
          top: -180px; left: -160px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #f43f5e 0%, transparent 70%);
          bottom: -140px; right: -120px;
          animation-delay: -6s;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #0ea5e9 0%, transparent 70%);
          top: 50%; left: 55%;
          animation-delay: -12s;
        }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.06); }
        }

        /* ── Card ── */
        .please-pay-card {
          position: relative;
          z-index: 10;
          max-width: 480px;
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 2.5rem 2rem;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 0 0 1px rgba(99,102,241,0.12),
                      0 32px 64px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          text-align: center;
          animation: slideUp 0.55s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Lock icon rings ── */
        .lock-wrapper {
          position: relative;
          width: 80px; height: 80px;
          display: flex; align-items: center; justify-content: center;
        }
        .lock-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(99,102,241,0.3);
          animation: pulseRing 3s ease-in-out infinite;
        }
        .lock-ring-outer {
          inset: -16px;
          animation-delay: 0s;
        }
        .lock-ring-inner {
          inset: -8px;
          border-color: rgba(99,102,241,0.2);
          animation-delay: 0.5s;
        }
        @keyframes pulseRing {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        .lock-icon-circle {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          box-shadow: 0 0 32px rgba(99,102,241,0.5);
          position: relative;
          z-index: 1;
        }

        /* ── Heading ── */
        .please-pay-heading h1 {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 0.6rem;
        }
        .please-pay-sub {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.65;
          margin: 0;
        }

        /* ── Features ── */
        .features-grid {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 0.9rem 1rem;
          text-align: left;
          transition: background 0.2s;
        }
        .feature-item:hover {
          background: rgba(255,255,255,0.055);
        }
        .feature-icon {
          flex-shrink: 0;
          width: 36px; height: 36px;
          border-radius: 9px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #818cf8;
        }
        .feature-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #cbd5e1;
          margin: 0 0 0.15rem;
        }
        .feature-desc {
          font-size: 0.78rem;
          color: #475569;
          margin: 0;
        }

        /* ── Actions ── */
        .please-pay-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          justify-content: center;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
          transition: filter 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          filter: brightness(1.12);
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(99,102,241,0.55);
        }
        .btn-primary:active {
          transform: translateY(0);
          filter: brightness(0.96);
        }
        .please-pay-note {
          font-size: 0.8rem;
          color: #475569;
          margin: 0;
        }
        .inline-link {
          color: #818cf8;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s;
        }
        .inline-link:hover { color: #a5b4fc; }
      `}</style>
    </div>
  );
}
