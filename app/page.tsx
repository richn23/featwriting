"use client";
import Link from "next/link";

/* ─── Five FEAT verticals ──────────────────────────────────── */

/*
  Layout order (clockwise from top-right):
  [0] top-right  = ESL
  [1] mid-right  = Academic
  [2] bottom     = Beyond
  [3] mid-left   = Professional
  [4] top-left   = CEFR
*/

const SEGMENTS = [
  {
    id: "esl",
    label: "ESL",
    sub: "English Language Testing",
    href: "/esl",
    bg: "rgba(74,222,128,.30)",
    accent: "#4ADE80",
    ready: true,
  },
  {
    id: "academic",
    label: "Academic",
    sub: "Rethinking Academic Assessment",
    href: "/academic",
    bg: "rgba(192,132,252,.28)",
    accent: "#C084FC",
    ready: true,
  },
  {
    id: "beyond",
    label: "Beyond",
    sub: "Define Your Own",
    href: "/custom",
    bg: "rgba(244,114,182,.28)",
    accent: "#F472B6",
    ready: true,
  },
  {
    id: "professional",
    label: "Professional",
    sub: "Workplace Readiness",
    href: "/professional",
    bg: "rgba(250,204,21,.22)",
    accent: "#FACC15",
    ready: true,
  },
  {
    id: "cefr",
    label: "CEFR",
    sub: "Diagnostic & Placement",
    href: "/cefr",
    bg: "rgba(34,211,238,.28)",
    accent: "#22D3EE",
    ready: true,
  },
];

/*
  Geometry: 5 equal wedges (72° each), rays from centre (50%,50%).
  Ray angles (clockwise from top):
    Ray 0: -90°  → (50%, 0%)         top centre
    Ray 1: -18°  → (100%, 33.75%)    right upper
    Ray 2:  54°  → (86.3%, 100%)     bottom right
    Ray 3: 126°  → (13.7%, 100%)     bottom left
    Ray 4: 198°  → (0%, 33.75%)      left upper
*/

const CLIPS = [
  "polygon(50% 50%, 50% 0%, 100% 0%, 100% 33.75%)",
  "polygon(50% 50%, 100% 33.75%, 100% 100%, 86.3% 100%)",
  "polygon(50% 50%, 86.3% 100%, 13.7% 100%)",
  "polygon(50% 50%, 13.7% 100%, 0% 100%, 0% 33.75%)",
  "polygon(50% 50%, 0% 33.75%, 0% 0%, 50% 0%)",
];

/* Label positions: centroid of each wedge, nudged for visual centering */
const LABELS: [number, number][] = [
  [74, 24],   // top-right: ESL
  [78, 64],   // mid-right: Academic
  [50, 80],   // bottom: Beyond
  [22, 64],   // mid-left: Professional
  [26, 24],   // top-left: CEFR
];

const ARROW = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

/* ─── Styles ───────────────────────────────────────────────── */

const hubStyles = `
.hub {
  position:relative; width:100vw; height:100vh; overflow:hidden;
  background:#0a0e14;
}

/* Wedge segments */
.hub-wedge {
  position:absolute; inset:0;
  display:flex; align-items:center; justify-content:center;
  transition:filter .35s ease;
  cursor:pointer; text-decoration:none; color:inherit;
}
.hub-wedge:hover {
  filter:brightness(1.5) saturate(1.2);
}

/* Central circle */
.hub-centre {
  position:absolute; left:50%; top:50%;
  transform:translate(-50%,-50%);
  width:clamp(170px, 18vw, 250px); height:clamp(170px, 18vw, 250px);
  border-radius:50%;
  background:radial-gradient(circle at center, #141b24 0%, #0f1520 100%);
  border:1.5px solid rgba(255,255,255,.15);
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  z-index:10; text-align:center;
  box-shadow:
    0 0 60px rgba(0,0,0,.6),
    0 0 120px rgba(0,0,0,.3),
    inset 0 0 40px rgba(255,255,255,.02);
}
.hub-centre-title {
  font-family:'DM Serif Display',serif;
  font-size:clamp(2rem, 3.8vw, 3rem);
  font-weight:400; letter-spacing:-.03em;
  color:#f1f5f9;
}
.hub-centre-sub {
  font-size:clamp(.48rem, .75vw, .65rem);
  font-weight:600; text-transform:uppercase;
  letter-spacing:.14em; color:#94a3b8;
  margin-top:8px; max-width:85%;
  line-height:1.5;
}

/* Wedge labels */
.hub-label {
  position:absolute; transform:translate(-50%,-50%);
  text-align:center; pointer-events:none; z-index:6;
}
.hub-label-name {
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.2rem, 2.2vw, 1.8rem);
  font-weight:400; letter-spacing:-.02em;
  line-height:1.2; margin-bottom:6px;
}
.hub-label-name em { font-style:italic }
.hub-label-sub {
  font-size:clamp(.52rem, .72vw, .68rem);
  font-weight:700; text-transform:uppercase;
  letter-spacing:.12em;
}
.hub-label-cta {
  display:inline-flex; align-items:center; gap:6px;
  font-size:.6rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.08em; margin-top:12px;
  padding:5px 14px;
  border-radius:20px;
  border:1.5px solid currentColor;
  opacity:1;
  transition:opacity .3s, background .3s;
}

.hub-label-soon {
  font-size:.5rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.1em; margin-top:8px; opacity:.35;
}

/* Brochure link */
.hub-brochure {
  position:absolute; top:18px; right:24px; z-index:20;
  display:inline-flex; align-items:center; gap:6px;
  font-size:.6rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.08em;
  color:rgba(255,255,255,.7);
  text-decoration:none; padding:5px 14px;
  border:1.5px solid rgba(255,255,255,.25);
  border-radius:20px;
  transition:border-color .2s, color .2s, background .2s;
  background:transparent;
}
.hub-brochure:hover { border-color:rgba(255,255,255,.5); color:#fff; background:rgba(255,255,255,.05) }

/* Mobile card list (replaces wedge layout) */
.hub-mobile-list {
  display:none;
}

/* Mobile */
@media (max-width:700px) {
  .hub { height:auto; min-height:100vh; display:flex; flex-direction:column; }
  .hub-wedge { display:none !important; }
  .hub-label { display:none !important; }
  .hub-centre {
    position:relative; transform:none;
    left:auto; top:auto; width:100%; height:auto;
    border-radius:0; padding:40px 24px 32px;
    border-bottom:1px solid rgba(255,255,255,.06);
    box-shadow:none; order:-1;
    background:radial-gradient(circle at center, #141b24 0%, #0f1520 100%);
  }
  .hub-centre-title { font-size:2.2rem; }
  .hub-centre-sub { font-size:.7rem; margin-top:6px; }
  .hub-brochure {
    position:relative; top:auto; right:auto;
    margin:16px 24px 0; align-self:flex-end;
  }
  .hub-mobile-list {
    display:flex; flex-direction:column; flex:1;
  }
  .hub-mobile-card {
    display:flex; align-items:center; justify-content:space-between;
    padding:22px 24px;
    text-decoration:none; color:inherit;
    border-bottom:1px solid rgba(255,255,255,.06);
    transition:filter .2s;
  }
  .hub-mobile-card:hover { filter:brightness(1.3); }
  .hub-mobile-card-info { display:flex; flex-direction:column; gap:4px; }
  .hub-mobile-card-name {
    font-family:'DM Serif Display',serif;
    font-size:1.3rem; font-weight:400; font-style:italic;
    line-height:1.2;
  }
  .hub-mobile-card-sub {
    font-size:.6rem; font-weight:700; text-transform:uppercase;
    letter-spacing:.1em; opacity:.7;
  }
  .hub-mobile-card-arrow {
    opacity:.5; transition:opacity .2s;
  }
  .hub-mobile-card:hover .hub-mobile-card-arrow { opacity:1; }
}
`;

/* ─── Component ────────────────────────────────────────────── */

export default function WritingHomePage() {
  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: hubStyles }} />
      <div className="hub">

        {/* Brochure link */}
        <a href="/FEAT_Brochure.pdf" target="_blank" rel="noopener noreferrer" className="hub-brochure">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Brochure
        </a>

        {/* Wedge segments (no radiating lines, colour zones do the work) */}
        {SEGMENTS.map((seg, i) =>
          seg.ready ? (
            <Link
              key={seg.id}
              href={seg.href}
              className="hub-wedge"
              aria-label={`${seg.label}: ${seg.sub}`}
              style={{ clipPath: CLIPS[i], background: seg.bg }}
            />
          ) : (
            <div
              key={seg.id}
              className="hub-wedge"
              aria-hidden="true"
              style={{ clipPath: CLIPS[i], background: seg.bg, cursor: "default" }}
            />
          )
        )}

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
              <div className="hub-label-cta" style={{ color: seg.accent, borderColor: seg.accent }}>
                Explore {ARROW}
              </div>
            ) : (
              <div className="hub-label-soon">Coming soon</div>
            )}
          </div>
        ))}

        {/* Mobile card list (hidden on desktop, shown on mobile) */}
        <div className="hub-mobile-list">
          {[SEGMENTS[4], SEGMENTS[0], SEGMENTS[1], SEGMENTS[3], SEGMENTS[2]].map((seg) => (
            <Link
              key={`m-${seg.id}`}
              href={seg.href}
              className="hub-mobile-card"
              style={{ background: seg.bg }}
            >
              <div className="hub-mobile-card-info">
                <div className="hub-mobile-card-name" style={{ color: seg.accent }}>{seg.label}</div>
                <div className="hub-mobile-card-sub" style={{ color: seg.accent }}>{seg.sub}</div>
              </div>
              <div className="hub-mobile-card-arrow" style={{ color: seg.accent }}>{ARROW}</div>
            </Link>
          ))}
        </div>

        {/* Central circle */}
        <div className="hub-centre">
          <div className="hub-centre-title">FEAT</div>
          <div className="hub-centre-sub">Functional Evidence-Based<br />Assessment Tasks</div>
        </div>
      </div>
    </div>
  );
}
