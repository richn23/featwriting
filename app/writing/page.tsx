"use client";
import Link from "next/link";
import { writingStyles } from "./_shared/styles";

/* ─── Five FEAT verticals ──────────────────────────────────── */

const SEGMENTS = [
  {
    id: "esl",
    label: "ESL",
    sub: "English Language Testing",
    href: "/writing/esl",
    bg: "rgba(52,211,153,.045)",
    accent: "#34d399",
    ready: true,
  },
  {
    id: "professional",
    label: "Professional",
    sub: "Workplace Readiness",
    href: "/writing/professional",
    bg: "rgba(251,191,36,.04)",
    accent: "#fbbf24",
    ready: true,
  },
  {
    id: "academic",
    label: "Academic",
    sub: "Formative Assessment",
    href: "/writing/academic",
    bg: "rgba(167,139,250,.04)",
    accent: "#a78bfa",
    ready: true,
  },
  {
    id: "cefr",
    label: "CEFR",
    sub: "Level-Aligned Assessment",
    href: "/writing/cefr",
    bg: "rgba(56,189,248,.04)",
    accent: "#38bdf8",
    ready: true,
  },
  {
    id: "beyond",
    label: "Beyond",
    sub: "Define Your Own",
    href: "/writing/custom",
    bg: "rgba(251,113,133,.035)",
    accent: "#fb7185",
    ready: true,
  },
];

/*
  Geometry: 5 equal wedges (72° each), rays from centre (50%,50%).
  Ray angles (clockwise from top):
    Ray 0: -90°  → hits (50%, 0%)
    Ray 1: -18°  → hits (100%, 33.75%)
    Ray 2:  54°  → hits (86.3%, 100%)
    Ray 3: 126°  → hits (13.7%, 100%)
    Ray 4: 198°  → hits (0%, 33.75%)
*/

const CLIPS = [
  "polygon(50% 50%, 50% 0%, 100% 0%, 100% 33.75%)",          // top-right
  "polygon(50% 50%, 100% 33.75%, 100% 100%, 86.3% 100%)",    // right
  "polygon(50% 50%, 86.3% 100%, 13.7% 100%)",                 // bottom
  "polygon(50% 50%, 13.7% 100%, 0% 100%, 0% 33.75%)",        // left
  "polygon(50% 50%, 0% 33.75%, 0% 0%, 50% 0%)",              // top-left
];

/* Label positions: centroid of each wedge, pushed ~32% from centre */
const LABELS: [number, number][] = [
  [68, 24],   // top-right
  [80, 60],   // right
  [50, 82],   // bottom
  [20, 60],   // left
  [32, 24],   // top-left
];

/* Dividing line angles (from centre, CSS rotation) */
const LINE_ANGLES = [-90, -18, 54, 126, 198];

const ARROW = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

/* ─── Styles ───────────────────────────────────────────────── */

const hubStyles = `
.hub {
  position:relative; width:100vw; height:100vh; overflow:hidden;
  background:#0d1117;
}

/* Wedge segments */
.hub-wedge {
  position:absolute; inset:0;
  display:flex; align-items:center; justify-content:center;
  transition:background .4s ease, filter .4s ease;
  cursor:pointer; text-decoration:none; color:inherit;
}
.hub-wedge:hover {
  filter:brightness(1.4);
}

/* Dividing lines */
.hub-line {
  position:absolute; left:50%; top:50%;
  width:1px; height:60vmax;
  transform-origin:top center;
  background:rgba(255,255,255,.07);
  pointer-events:none; z-index:5;
}

/* Central circle */
.hub-centre {
  position:absolute; left:50%; top:50%;
  transform:translate(-50%,-50%);
  width:clamp(160px, 18vw, 240px); height:clamp(160px, 18vw, 240px);
  border-radius:50%;
  background:#141b24;
  border:1px solid rgba(255,255,255,.08);
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  z-index:10; text-align:center;
  box-shadow:0 0 80px rgba(0,0,0,.5);
}
.hub-centre-title {
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight:400; letter-spacing:-.03em;
  color:#e2e8f0;
}
.hub-centre-sub {
  font-size:clamp(.42rem, .7vw, .6rem);
  font-weight:600; text-transform:uppercase;
  letter-spacing:.14em; color:#64748b;
  margin-top:6px; max-width:80%;
  line-height:1.5;
}

/* Wedge labels */
.hub-label {
  position:absolute; transform:translate(-50%,-50%);
  text-align:center; pointer-events:none; z-index:6;
}
.hub-label-name {
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.1rem, 2vw, 1.6rem);
  font-weight:400; letter-spacing:-.02em;
  line-height:1.2; margin-bottom:4px;
}
.hub-label-name em { font-style:italic }
.hub-label-sub {
  font-size:clamp(.5rem, .7vw, .65rem);
  font-weight:600; text-transform:uppercase;
  letter-spacing:.1em; opacity:.7;
}
.hub-label-cta {
  display:inline-flex; align-items:center; gap:4px;
  font-size:.55rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.08em; margin-top:8px; opacity:.5;
  transition:opacity .3s;
}
.hub-wedge:hover ~ .hub-label .hub-label-cta,
.hub-label-cta { transition:opacity .3s }

.hub-label-soon {
  font-size:.5rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.1em; margin-top:8px; opacity:.35;
}

/* Brochure link */
.hub-brochure {
  position:absolute; top:18px; right:24px; z-index:20;
  display:inline-flex; align-items:center; gap:6px;
  font-size:.68rem; font-weight:600; color:#64748b;
  text-decoration:none; padding:6px 14px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:8px; transition:border-color .2s, color .2s;
  background:rgba(13,17,23,.6); backdrop-filter:blur(8px);
}
.hub-brochure:hover { border-color:rgba(255,255,255,.2); color:#94a3b8 }

/* Mobile */
@media (max-width:700px) {
  .hub { height:auto; min-height:100vh; }
  .hub-wedge {
    position:relative !important; clip-path:none !important;
    inset:auto !important; width:100%; padding:28px 24px;
    border-bottom:1px solid rgba(255,255,255,.06);
    justify-content:flex-start;
  }
  .hub-wedge:hover { filter:brightness(1.2) }
  .hub-line { display:none }
  .hub-centre {
    position:relative; transform:none;
    left:auto; top:auto; width:100%; height:auto;
    border-radius:0; padding:32px 24px;
    border-bottom:1px solid rgba(255,255,255,.06);
    box-shadow:none;
  }
  .hub-label {
    position:relative !important; transform:none !important;
    left:auto !important; top:auto !important;
    text-align:left;
  }
}
`;

/* ─── Component ────────────────────────────────────────────── */

export default function WritingHomePage() {
  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: writingStyles + hubStyles }} />
      <div className="hub">

        {/* Brochure link */}
        <a href="/FEAT_Brochure.pdf" target="_blank" rel="noopener noreferrer" className="hub-brochure">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Brochure
        </a>

        {/* Wedge segments */}
        {SEGMENTS.map((seg, i) =>
          seg.ready ? (
            <Link
              key={seg.id}
              href={seg.href}
              className="hub-wedge"
              style={{ clipPath: CLIPS[i], background: seg.bg }}
            />
          ) : (
            <div
              key={seg.id}
              className="hub-wedge"
              style={{ clipPath: CLIPS[i], background: seg.bg, cursor: "default" }}
            />
          )
        )}

        {/* Dividing lines */}
        {LINE_ANGLES.map((angle) => (
          <div
            key={angle}
            className="hub-line"
            style={{ transform: `rotate(${angle + 180}deg)` }}
          />
        ))}

        {/* Labels over each wedge */}
        {SEGMENTS.map((seg, i) => (
          <div
            key={`label-${seg.id}`}
            className="hub-label"
            style={{ left: `${LABELS[i][0]}%`, top: `${LABELS[i][1]}%` }}
          >
            <div className="hub-label-name" style={{ color: seg.accent }}>
              <em>{seg.label}</em>
            </div>
            <div className="hub-label-sub" style={{ color: seg.accent }}>
              {seg.sub}
            </div>
            {seg.ready ? (
              <div className="hub-label-cta" style={{ color: seg.accent }}>
                Explore {ARROW}
              </div>
            ) : (
              <div className="hub-label-soon">Coming soon</div>
            )}
          </div>
        ))}

        {/* Central circle */}
        <div className="hub-centre">
          <div className="hub-centre-title">FEAT</div>
          <div className="hub-centre-sub">Functional Evidence-Based Assessment Tasks</div>
        </div>
      </div>
    </div>
  );
}
