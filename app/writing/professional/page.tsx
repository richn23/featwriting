"use client";
import Link from "next/link";
import { writingStyles } from "../_shared/styles";
import { SCENARIO_TASK_LIST } from "../_shared/scenario-tasks-data";

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

const accent = "#fbbf24";

const pageStyles = `
.vl { min-height:100vh; background:var(--s-bg); color:var(--s-text) }
.vl-nav { display:flex; align-items:center; justify-content:space-between; padding:18px 36px; border-bottom:1px solid rgba(255,255,255,.06) }
.vl-nav-logo { font-family:'DM Serif Display',serif; font-size:1.1rem; color:var(--s-text); text-decoration:none }
.vl-nav-logo em { font-style:italic }
.vl-hero { max-width:640px; margin:0 auto; padding:80px 24px 60px; text-align:center }
.vl-eyebrow { font-size:.55rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em; margin-bottom:16px }
.vl-title { font-family:'DM Serif Display',serif; font-size:clamp(2rem,4vw,2.8rem); font-weight:400; letter-spacing:-.03em; line-height:1.15; color:var(--s-text); margin-bottom:16px }
.vl-title em { font-style:italic }
.vl-sub { font-size:.92rem; color:var(--s-text-muted); line-height:1.75; margin-bottom:40px }
.vl-points { max-width:560px; margin:0 auto 48px; text-align:left }
.vl-point { display:flex; gap:16px; margin-bottom:24px }
.vl-point-num { font-family:'DM Serif Display',serif; font-size:1.4rem; font-weight:400; flex-shrink:0; min-width:32px }
.vl-point-body { font-size:.85rem; color:var(--s-text-muted); line-height:1.7 }
.vl-point-body strong { color:var(--s-text); font-weight:600 }

/* Task grid */
.vl-tasks { max-width:720px; margin:0 auto 48px; padding:0 24px }
.vl-tasks-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text-muted); margin-bottom:16px; text-align:center }
.vl-tasks-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px }
.vl-task-card { display:block; padding:20px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06); border-radius:12px; text-decoration:none; color:inherit; transition:border-color .2s, background .2s }
.vl-task-card:hover { border-color:rgba(255,255,255,.15); background:rgba(255,255,255,.035) }
.vl-task-card-name { font-size:.82rem; font-weight:600; color:var(--s-text); margin-bottom:4px }
.vl-task-card-dims { font-size:.6rem; color:var(--s-text-muted); line-height:1.5 }

.vl-cta { text-align:center; padding:0 24px 80px }
.vl-back { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; color:var(--s-text-muted); text-decoration:none; margin-top:16px; transition:color .2s }
.vl-back:hover { color:var(--s-text) }
.vl-footer { padding:20px 36px; border-top:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; font-size:.7rem; color:#475569 }
.vl-footer-logo { font-family:'DM Serif Display',serif; font-size:.85rem; color:#475569 }
.vl-footer-logo em { font-style:italic }
`;

export default function ProfessionalPage() {
  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: writingStyles + pageStyles }} />
      <div className="vl">
        <nav className="vl-nav">
          <Link href="/writing" className="vl-nav-logo">FEAT <em style={{ color: accent }}>Professional</em></Link>
        </nav>

        <div className="vl-hero animate-fade-up">
          <div className="vl-eyebrow" style={{ color: accent }}>Workplace Readiness Assessment</div>
          <h1 className="vl-title">Not what they <em style={{ color: accent }}>know.</em><br />What they <em style={{ color: accent }}>do.</em></h1>
          <p className="vl-sub">
            Decision-making under pressure, applied training, AI literacy, information handling, and structured reasoning. Five interactive scenarios that test professional judgment — not knowledge recall. Each one scored against transparent performance criteria.
          </p>
        </div>

        <div className="vl-points animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>01</div>
            <div className="vl-point-body">
              <strong>Evolving scenarios.</strong> Conditions change mid-task. New information arrives. The candidate has to adapt — not just pick the right answer from a static list.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>02</div>
            <div className="vl-point-body">
              <strong>Justify everything.</strong> Every decision requires a justification. The system doesn&apos;t just check what you chose — it checks whether your reasoning holds up.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>03</div>
            <div className="vl-point-body">
              <strong>Transparent criteria.</strong> Scoring dimensions are shown upfront. No hidden rubric. Candidates know exactly what competence looks like before they begin.
            </div>
          </div>
        </div>

        <div className="vl-tasks animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="vl-tasks-title">Five workplace readiness tasks</div>
          <div className="vl-tasks-grid">
            {SCENARIO_TASK_LIST.map(t => (
              <Link key={t.id} href={`/writing/beyond/${t.id}`} className="vl-task-card">
                <div className="vl-task-card-name" style={{ color: accent }}>{t.shortTitle}</div>
                <div className="vl-task-card-dims">{t.scoringDimensions.map(d => d.name).join(" · ")}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="vl-cta animate-fade-up" style={{ animationDelay: "160ms" }}>
          <Link href="/writing" className="vl-back">← Back to FEAT</Link>
        </div>

        <footer className="vl-footer">
          <div className="vl-footer-logo">FEAT <em style={{ color: accent }}>Professional</em></div>
          <div>Workplace Readiness Assessment</div>
        </footer>
      </div>
    </div>
  );
}
