"use client";
import Link from "next/link";
import { writingStyles } from "../_shared/styles";

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

const accent = "#a78bfa";

const DEMO_TASKS = [
  {
    id: "data-literacy",
    name: "Data Literacy",
    desc: "A misleading chart is presented as fact. Can you spot the problems, separate correlation from causation, and explain what the data actually shows?",
    dims: "Problem Detection · Causal Reasoning · Data Reinterpretation · Communication",
    href: "/writing/beyond/data-literacy",
    isNew: true,
  },
  {
    id: "explain-simply",
    name: "Explain Simply",
    desc: "Take a complex concept and explain it to someone with no background. Adapt when they're confused. The Feynman test — if you can't explain it simply, you don't understand it.",
    dims: "Core Accuracy · Jargon Removal · Analogy Quality · Adaptation",
    href: "/writing/beyond/explain-simply",
    isNew: true,
  },
  {
    id: "cpd",
    name: "Applied CPD",
    desc: "Can the learner apply training to a real classroom problem? Diagnose, strategise, prioritise under constraints.",
    dims: "Problem Diagnosis · Strategy Practicality · Decision Quality",
    href: "/writing/beyond/cpd",
    isNew: false,
  },
  {
    id: "argument",
    name: "Argument Evaluation",
    desc: "Break down two arguments, judge their quality, identify weaknesses, select evidence, construct a position.",
    dims: "Claim Identification · Evaluation Quality · Argument Construction",
    href: "/writing/beyond/argument",
    isNew: false,
  },
  {
    id: "ai-policy",
    name: "AI Output Evaluation",
    desc: "Evaluate AI-generated content against quality standards and organisational policy. Adapt it for real use.",
    dims: "Risk Detection · Policy Alignment · Adaptation Quality",
    href: "/writing/beyond/ai-policy",
    isNew: false,
  },
];

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

/* Use case cards */
.vl-usecases { max-width:640px; margin:0 auto 48px; padding:0 24px }
.vl-usecases-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text-muted); margin-bottom:16px; text-align:center }
.vl-usecase { padding:16px 20px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:10px; margin-bottom:10px }
.vl-usecase-name { font-size:.78rem; font-weight:600; color:var(--s-text); margin-bottom:4px }
.vl-usecase-desc { font-size:.75rem; color:var(--s-text-muted); line-height:1.6 }

/* Task cards */
.vl-tasks { max-width:640px; margin:0 auto 48px; padding:0 24px }
.vl-tasks-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text-muted); margin-bottom:16px; text-align:center }
.vl-task-card { display:block; padding:20px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06); border-radius:12px; text-decoration:none; color:inherit; transition:border-color .2s, background .2s; margin-bottom:10px }
.vl-task-card:hover { border-color:rgba(255,255,255,.15); background:rgba(255,255,255,.035) }
.vl-task-card-name { font-size:.85rem; font-weight:600; margin-bottom:4px }
.vl-task-card-desc { font-size:.78rem; color:var(--s-text-muted); line-height:1.6; margin-bottom:6px }
.vl-task-card-dims { font-size:.6rem; color:var(--s-text-muted); opacity:.7 }
.vl-task-card-cta { display:inline-flex; align-items:center; gap:5px; font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-top:8px; opacity:.6; transition:opacity .2s }
.vl-task-card:hover .vl-task-card-cta { opacity:1 }
.vl-task-new-badge { font-size:.5rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:2px 8px; border-radius:10px; background:rgba(167,139,250,.15); color:#a78bfa }
.vl-cta { text-align:center; padding:0 24px 80px }
.vl-back { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; color:var(--s-text-muted); text-decoration:none; margin-top:16px; transition:color .2s }
.vl-back:hover { color:var(--s-text) }
.vl-footer { padding:20px 36px; border-top:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; font-size:.7rem; color:#475569 }
.vl-footer-logo { font-family:'DM Serif Display',serif; font-size:.85rem; color:#475569 }
.vl-footer-logo em { font-style:italic }
`;

export default function AcademicPage() {
  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: writingStyles + pageStyles }} />
      <div className="vl">
        <nav className="vl-nav">
          <Link href="/writing" className="vl-nav-logo">FEAT <em style={{ color: accent }}>Academic</em></Link>
        </nav>

        <div className="vl-hero animate-fade-up">
          <div className="vl-eyebrow" style={{ color: accent }}>Formative Assessment &amp; Progress Testing</div>
          <h1 className="vl-title">Can they <em style={{ color: accent }}>apply</em> it?<br />Not just <em style={{ color: accent }}>recall</em> it.</h1>
          <p className="vl-sub">
            Most progress tests measure memory. A learner can score well and still be unable to use what they know in context. FEAT Academic tests application — functions tied to course objectives, checked through structured dialogue. Competent or not yet competent, per objective.
          </p>
        </div>

        <div className="vl-points animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>01</div>
            <div className="vl-point-body">
              <strong>Functions from your syllabus.</strong> You define what competence looks like for each learning objective. The system builds checks around those functions — not generic test questions.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>02</div>
            <div className="vl-point-body">
              <strong>AI probes application.</strong> The examiner asks follow-up questions, pushes for examples, and tests whether the learner can use knowledge — not just repeat it. Dialogue continues until a confidence threshold is reached.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>03</div>
            <div className="vl-point-body">
              <strong>A profile, not a grade.</strong> The output is a functional profile: which objectives are confirmed, which are not yet evidenced, and where the gaps are. Per learner. Per objective. Across time.
            </div>
          </div>
        </div>

        <div className="vl-usecases animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="vl-usecases-title">Example use cases</div>
          <div className="vl-usecase">
            <div className="vl-usecase-name" style={{ color: accent }}>Mid-course progress checks</div>
            <div className="vl-usecase-desc">Can the learner apply what was taught in weeks 1–4? Not a written test — a structured conversation that probes understanding.</div>
          </div>
          <div className="vl-usecase">
            <div className="vl-usecase-name" style={{ color: accent }}>Pre-assessment readiness</div>
            <div className="vl-usecase-desc">Before a high-stakes exam, check which objectives the learner has actually internalised. Identify gaps while there is still time.</div>
          </div>
          <div className="vl-usecase">
            <div className="vl-usecase-name" style={{ color: accent }}>Training transfer verification</div>
            <div className="vl-usecase-desc">After a workshop or CPD session, verify that participants can apply the content — not just summarise it.</div>
          </div>
          <div className="vl-usecase">
            <div className="vl-usecase-name" style={{ color: accent }}>Cross-subject application</div>
            <div className="vl-usecase-desc">Works for any subject where the objective is application: science, maths, business, health. Define the function, set the criteria.</div>
          </div>
        </div>

        <div className="vl-tasks animate-fade-up" style={{ animationDelay: "160ms" }}>
          <div className="vl-tasks-title">Try the demo tasks</div>
          {DEMO_TASKS.map(t => (
            <Link key={t.id} href={t.href} className="vl-task-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div className="vl-task-card-name" style={{ color: accent, marginBottom: 0 }}>{t.name}</div>
                {t.isNew && <span className="vl-task-new-badge">New</span>}
              </div>
              <div className="vl-task-card-desc">{t.desc}</div>
              <div className="vl-task-card-dims">{t.dims}</div>
              <div className="vl-task-card-cta" style={{ color: accent }}>Try demo {ARROW}</div>
            </Link>
          ))}
        </div>

        <div className="vl-cta animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Link href="/writing" className="vl-back">← Back to FEAT</Link>
        </div>

        <footer className="vl-footer">
          <div className="vl-footer-logo">FEAT <em style={{ color: accent }}>Academic</em></div>
          <div>Formative Assessment &amp; Progress Testing</div>
        </footer>
      </div>
    </div>
  );
}
