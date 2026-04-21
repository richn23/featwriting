"use client";
import Link from "next/link";
import { SCENARIO_TASK_LIST } from "../_shared/scenario-tasks-data";

const ARROW = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

const CARD_ICONS: Record<string, string> = {
  ojt: "\u2696",
  cpd: "\u2605",
  "ai-policy": "\u2699",
  "info-priority": "\u25C6",
  argument: "\u2692",
};

export default function BeyondLandingPage() {
  return (
    <div className="stakeholder-theme">
      <div className="landing-page">
        <nav className="landing-nav">
          <div className="landing-nav-logo"><Link href="/" style={{ color: "inherit", textDecoration: "none" }}>FEAT</Link> <em style={{ color: "#fbbf24" }}>Beyond</em></div>
        </nav>

        <section className="landing-hero animate-fade-up">
          <div className="landing-hero-eyebrow" style={{ color: "#fbbf24" }}>Workplace Readiness Assessment</div>
          <h1 className="landing-hero-title">Not just <em style={{ color: "#fbbf24" }}>language.</em></h1>
          <p className="landing-hero-anchor">The same engine, applied to decision-making, critical thinking, and professional judgment.</p>
          <p className="landing-hero-hook">
            FEAT tests what people can do, not what they know. These five tasks go beyond CEFR: operational judgment, applied training, AI literacy, information handling, and structured reasoning. Each one is interactive, evidence-based, and scored against transparent criteria.
          </p>
        </section>

        <div className="landing-beyond animate-fade-up" style={{ animationDelay: "100ms", borderTop: "none", paddingTop: 0 }}>
          <div className="landing-beyond-grid">
            {SCENARIO_TASK_LIST.map(t => (
              <Link key={t.id} href={`/beyond/${t.id}`} className="landing-beyond-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="landing-beyond-card-icon">{CARD_ICONS[t.id] ?? "●"}</div>
                <div className="landing-beyond-card-title">{t.shortTitle}</div>
                <div className="landing-beyond-card-body" style={{ fontSize: ".78rem" }}>
                  {t.screens[0].kind === "briefing" ? t.screens[0].subtitle : "Interactive scenario task."}
                </div>
                <div className="landing-beyond-card-tag" style={{ marginTop: 12 }}>
                  {t.scoringDimensions.map(d => d.name).join(" · ")}
                </div>
                <div className="landing-beyond-card-cta">Try demo {ARROW}</div>
              </Link>
            ))}
          </div>
          <div className="landing-beyond-footer">
            Together, these form a <em>Workplace Readiness Assessment</em>: decision-making, pedagogical thinking, critical AI use, operational judgment, and structured reasoning. All built on the same engine.
          </div>
        </div>

        <div className="landing-final-cta animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h2 className="landing-final-cta-title"><em style={{ color: "#fbbf24" }}>Functional Evidence-based</em><br />Assessment Tasks</h2>
          <p className="landing-final-cta-sub">Beyond language. Beyond multiple choice. Evidence of what people can actually do.</p>
          <Link href="/" className="landing-hero-btn" style={{ background: "#fbbf24", color: "#0d1117" }}>Back to FEAT home {ARROW}</Link>
        </div>

        <footer className="landing-footer">
          <div className="landing-footer-logo">FEAT <em style={{ color: "#fbbf24" }}>Beyond</em></div>
          <div className="landing-footer-note">Workplace Readiness Assessment Tasks · Prototype</div>
        </footer>
      </div>
    </div>
  );
}
