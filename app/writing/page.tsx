"use client";
import Link from "next/link";
import { writingStyles } from "./_shared/styles";

/* ─── Five FEAT verticals ──────────────────────────────────── */

const VERTICALS = [
  {
    id: "esl",
    name: "ESL",
    color: "#34d399",
    tagline: "English language testing",
    body: "Functional assessment of what learners can do with English — not just accuracy. Interactive tasks, AI-driven evidence collection, dual profiles for function and form.",
    href: "/writing/cefr",
    chips: ["Diagnostic Chat", "Extended Writing", "Opinion Chat", "Pragmatic Control", "Mediation"],
    ready: true,
  },
  {
    id: "cefr",
    name: "CEFR",
    color: "#38bdf8",
    tagline: "CEFR-aligned assessment",
    body: "Tasks mapped to CEFR levels and GSE descriptors. Evidence scored against can-do statements. Reports show where learners sit — and what to teach next.",
    href: "/writing/cefr",
    chips: ["A1–C2", "GSE aligned", "Can-do statements", "Level placement"],
    ready: true,
  },
  {
    id: "professional",
    name: "Professional",
    color: "#fbbf24",
    tagline: "Workplace readiness",
    body: "Decision-making under pressure, applied CPD, AI literacy, information handling, and structured reasoning. Interactive scenarios scored against transparent criteria.",
    href: "/writing/beyond",
    chips: ["Operational Judgment", "Applied CPD", "AI Policy", "Info Triage", "Argument Evaluation"],
    ready: true,
  },
  {
    id: "academic",
    name: "Academic",
    color: "#a78bfa",
    tagline: "Formative assessment & progress testing",
    body: "Check whether learners can apply what they have been taught — not just recall it. Functions tied to course objectives, tested through structured dialogue.",
    href: "#",
    chips: ["Learning checks", "Progress testing", "Application not recall"],
    ready: false,
  },
  {
    id: "beyond",
    name: "Beyond",
    color: "#fb7185",
    tagline: "Define your own",
    body: "The same engine — applied to anything. Define the function, set the criteria, collect the evidence. Medical communication, compliance, onboarding, any domain.",
    href: "#",
    chips: ["Custom criteria", "Any domain", "Your context"],
    ready: false,
  },
];

/* ─── Positions for the radial layout (angle from top, in degrees) ─── */
const ANGLES = [270, 342, 54, 126, 198]; // top, top-right, bottom-right, bottom-left, top-left

const ARROW = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

/* ─── Styles ───────────────────────────────────────────────── */

const hubStyles = `
/* ─── Hub page ─── */
.hub-page {
  min-height:100vh; display:flex; flex-direction:column;
  background:var(--s-bg); color:var(--s-text); overflow-x:hidden;
}

/* Nav */
.hub-nav {
  display:flex; align-items:center; justify-content:space-between;
  padding:18px 36px; border-bottom:1px solid rgba(255,255,255,.06);
  position:relative; z-index:10;
}
.hub-nav-logo {
  font-family:'DM Serif Display',serif; font-size:1.15rem; color:var(--s-text);
  letter-spacing:-.02em;
}
.hub-nav-flyer {
  display:inline-flex; align-items:center; gap:6px;
  font-size:.72rem; font-weight:600; color:var(--s-text-muted);
  text-decoration:none; padding:6px 14px; border:1px solid rgba(255,255,255,.1);
  border-radius:8px; transition:border-color .2s, color .2s;
}
.hub-nav-flyer:hover { border-color:var(--s-accent); color:var(--s-accent) }

/* Hero centre */
.hub-hero {
  text-align:center; padding:60px 24px 20px; position:relative; z-index:5;
}
.hub-hero-eyebrow {
  font-size:.55rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.18em; color:var(--s-text-muted); margin-bottom:16px;
}
.hub-hero-title {
  font-family:'DM Serif Display',serif;
  font-size:clamp(2.4rem, 5vw, 3.6rem);
  font-weight:400; letter-spacing:-.03em; line-height:1.1;
  color:var(--s-text); margin-bottom:12px;
}
.hub-hero-title em { font-style:italic; color:var(--s-accent) }
.hub-hero-sub {
  font-size:.92rem; color:var(--s-text-muted); line-height:1.7;
  max-width:520px; margin:0 auto;
}

/* Radial hub — desktop */
.hub-radial {
  position:relative; width:100%; max-width:960px;
  height:620px; margin:0 auto; flex-shrink:0;
}
.hub-centre-dot {
  position:absolute; left:50%; top:50%;
  transform:translate(-50%,-50%);
  width:80px; height:80px; border-radius:50%;
  background:radial-gradient(circle, rgba(52,211,153,.08) 0%, transparent 70%);
  display:flex; align-items:center; justify-content:center;
  font-family:'DM Serif Display',serif; font-size:1.3rem;
  color:var(--s-text); letter-spacing:-.02em; z-index:4;
}

/* Connector lines */
.hub-line {
  position:absolute; left:50%; top:50%;
  width:1px; height:180px;
  transform-origin:top center;
  background:linear-gradient(to bottom, rgba(255,255,255,.08), transparent);
  z-index:1;
}

/* Segment cards */
.hub-seg {
  position:absolute; width:240px;
  transform:translate(-50%,-50%);
  text-align:center; text-decoration:none; color:inherit;
  z-index:3; transition:transform .3s ease;
}
.hub-seg:hover { transform:translate(-50%,-50%) scale(1.04) }
.hub-seg-inner {
  background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07);
  border-radius:16px; padding:24px 20px 20px; transition:border-color .3s, background .3s;
}
.hub-seg:hover .hub-seg-inner { border-color:rgba(255,255,255,.15); background:rgba(255,255,255,.035) }
.hub-seg-dot {
  width:10px; height:10px; border-radius:50%; margin:0 auto 12px;
}
.hub-seg-name {
  font-family:'DM Serif Display',serif; font-size:1.15rem;
  font-weight:400; letter-spacing:-.02em; margin-bottom:4px;
}
.hub-seg-tagline {
  font-size:.65rem; font-weight:600; text-transform:uppercase;
  letter-spacing:.08em; margin-bottom:10px;
}
.hub-seg-body {
  font-size:.75rem; color:var(--s-text-muted); line-height:1.6;
  margin-bottom:14px;
}
.hub-seg-chips {
  display:flex; gap:4px; flex-wrap:wrap; justify-content:center;
  margin-bottom:14px;
}
.hub-seg-chip {
  font-size:.5rem; font-weight:600; padding:2px 8px;
  border-radius:20px; text-transform:uppercase; letter-spacing:.04em;
  border:1px solid rgba(255,255,255,.07); color:var(--s-text-muted);
}
.hub-seg-cta {
  display:inline-flex; align-items:center; gap:6px;
  font-size:.72rem; font-weight:600; padding:8px 20px;
  border-radius:8px; transition:opacity .2s;
}
.hub-seg-cta:hover { opacity:.88 }
.hub-seg-coming {
  font-size:.6rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.1em; padding:6px 16px;
  border:1px dashed rgba(255,255,255,.12); border-radius:8px;
  color:var(--s-text-muted);
}

/* Mobile: stack vertically */
@media (max-width:840px) {
  .hub-radial {
    height:auto; display:flex; flex-direction:column;
    align-items:center; gap:16px; padding:20px 16px 40px;
  }
  .hub-seg {
    position:static !important; transform:none !important;
    width:100%; max-width:400px;
  }
  .hub-seg:hover { transform:scale(1.02) !important }
  .hub-centre-dot { display:none }
  .hub-line { display:none }
}

/* Footer */
.hub-footer {
  padding:20px 36px; border-top:1px solid rgba(255,255,255,.06);
  display:flex; align-items:center; justify-content:space-between;
  font-size:.7rem; color:#475569; margin-top:auto;
}
.hub-footer-logo { font-family:'DM Serif Display',serif; font-size:.85rem; color:#475569 }
.hub-footer-logo em { font-style:italic }
`;

/* ─── Component ────────────────────────────────────────────── */

export default function WritingHomePage() {
  const RADIUS = 250;

  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: writingStyles + hubStyles }} />
      <div className="hub-page">
        <nav className="hub-nav">
          <div className="hub-nav-logo">FEAT</div>
          <a href="/FEAT_Brochure.pdf" target="_blank" rel="noopener noreferrer" className="hub-nav-flyer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            View brochure
          </a>
        </nav>

        <div className="hub-hero animate-fade-up">
          <div className="hub-hero-eyebrow">Functional Evidence-Based Assessment Tasks</div>
          <h1 className="hub-hero-title"><em>FEAT</em></h1>
          <p className="hub-hero-sub">
            Define the function. Set the criteria. Collect the evidence. One engine — applied to any context where performance matters more than accuracy.
          </p>
        </div>

        <div className="hub-radial">
          {/* Centre dot */}
          <div className="hub-centre-dot">FEAT</div>

          {/* Connector lines */}
          {VERTICALS.map((v, i) => (
            <div
              key={`line-${v.id}`}
              className="hub-line"
              style={{ transform: `rotate(${ANGLES[i] + 180}deg)` }}
            />
          ))}

          {/* Segment cards */}
          {VERTICALS.map((v, i) => {
            const angle = ANGLES[i];
            const rad = (angle * Math.PI) / 180;
            const x = 50 + (RADIUS / 960) * 100 * Math.cos(rad);
            const y = 50 + (RADIUS / 620) * 100 * Math.sin(rad);
            const segStyle = {
              left: `${x}%`,
              top: `${y}%`,
              animationDelay: `${i * 80 + 100}ms`,
            };
            const inner = (
              <div className="hub-seg-inner">
                <div className="hub-seg-dot" style={{ background: v.color }} />
                <div className="hub-seg-name" style={{ color: v.color }}>
                  FEAT <em>{v.name}</em>
                </div>
                <div className="hub-seg-tagline" style={{ color: v.color }}>{v.tagline}</div>
                <div className="hub-seg-body">{v.body}</div>
                <div className="hub-seg-chips">
                  {v.chips.map(c => (
                    <span key={c} className="hub-seg-chip">{c}</span>
                  ))}
                </div>
                {v.ready ? (
                  <span className="hub-seg-cta" style={{ background: v.color, color: "#0d1117" }}>
                    Explore {ARROW}
                  </span>
                ) : (
                  <span className="hub-seg-coming">Coming soon</span>
                )}
              </div>
            );

            return v.ready ? (
              <Link key={v.id} href={v.href} className="hub-seg animate-fade-up" style={segStyle}>
                {inner}
              </Link>
            ) : (
              <div key={v.id} className="hub-seg animate-fade-up" style={segStyle}>
                {inner}
              </div>
            );
          })}
        </div>

        <footer className="hub-footer">
          <div className="hub-footer-logo">FEAT <em>Prototype</em></div>
          <div>Evidence first. Scores second.</div>
        </footer>
      </div>
    </div>
  );
}
