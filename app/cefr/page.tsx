"use client";
import Link from "next/link";
import { writingStyles } from "../_shared/styles";

const TASK_CARDS = [
  { id: "01", num: "T1", cls: "t1", fn: "Interact & Inform", name: "Diagnostic Chat",    desc: "Live text chat with an AI examiner. It adapts in real time, probing ability and testing how the candidate interacts and informs." },
  { id: "02", num: "T2", cls: "t2", fn: "Inform & Narrate", name: "Extended Writing",   desc: "Scaffolded prompt followed by extended response. Tests clarity, sequencing, and the ability to develop detail." },
  { id: "03", num: "T3", cls: "t3", fn: "Express & Argue",  name: "Opinion Chat",       desc: "Interactive discussion where the AI challenges, disagrees, and pushes for justification. Can you hold your position?" },
  { id: "04", num: "T4", cls: "t4", fn: "Rephrase & Adjust", name: "Pragmatic Control", desc: "Rewrite a text for a different audience or purpose. Tests paraphrasing, register control, and linguistic flexibility." },
  { id: "05", num: "T5", cls: "t5", fn: "Compare & Advise",  name: "Mediation",         desc: "Evaluate options, explain differences, recommend a choice, and adapt advice when conditions change." },
];

const ARROW = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

const accent = "#38bdf8";

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

/* Beyond section */
.vl-beyond { max-width:560px; margin:0 auto 48px; padding:0 24px }
.vl-beyond-title { font-family:'DM Serif Display',serif; font-size:clamp(1.2rem,2vw,1.5rem); font-weight:400; color:var(--s-text); margin-bottom:16px; text-align:center }
.vl-beyond-intro { font-size:.85rem; color:var(--s-text-muted); line-height:1.7; margin-bottom:20px; text-align:center }
.vl-beyond-cols { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px }
@media (max-width:600px) { .vl-beyond-cols { grid-template-columns:1fr } }
.vl-beyond-col-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; margin-bottom:8px; opacity:.6 }
.vl-beyond-col-list { list-style:none; padding:0; margin:0 }
.vl-beyond-col-list li { font-size:.78rem; color:var(--s-text-muted); line-height:1.7; padding:3px 0 3px 16px; position:relative }
.vl-beyond-col-list li::before { content:''; position:absolute; left:0; top:11px; width:6px; height:6px; border-radius:50%; border:1.5px solid; opacity:.4 }
.vl-beyond-close { font-size:.85rem; color:var(--s-text); font-weight:500; text-align:center }

/* Use cases */
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
.vl-task-card-top { display:flex; align-items:center; gap:10px; margin-bottom:6px }
.vl-task-card-num { font-family:'DM Serif Display',serif; font-size:.9rem; font-weight:400; opacity:.5 }
.vl-task-card-fn { font-size:.55rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; opacity:.6 }
.vl-task-card-name { font-size:.85rem; font-weight:600; margin-bottom:4px }
.vl-task-card-desc { font-size:.78rem; color:var(--s-text-muted); line-height:1.6 }
.vl-task-card-cta { display:inline-flex; align-items:center; gap:5px; font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-top:10px; opacity:.5; transition:opacity .2s }
.vl-task-card:hover .vl-task-card-cta { opacity:1 }

.vl-cta { text-align:center; padding:0 24px 80px }
.vl-back { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; color:var(--s-text-muted); text-decoration:none; margin-top:16px; transition:color .2s }
.vl-back:hover { color:var(--s-text) }
.vl-footer { padding:20px 36px; border-top:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; font-size:.7rem; color:#475569 }
.vl-footer-logo { font-family:'DM Serif Display',serif; font-size:.85rem; color:#475569 }
.vl-footer-logo em { font-style:italic }
`;

export default function CefrLandingPage() {
  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: writingStyles + pageStyles }} />
      <div className="vl">
        <nav className="vl-nav">
          <Link href="/" className="vl-nav-logo">FEAT <em style={{ color: accent }}>CEFR</em></Link>
          <Link href="/task/01" style={{ fontSize: ".68rem", fontWeight: 600, color: accent, textDecoration: "none", padding: "6px 14px", border: `1px solid rgba(56,189,248,.2)`, borderRadius: 8, transition: "border-color .2s" }}>Begin Test Demo</Link>
        </nav>

        <div className="vl-hero animate-fade-up">
          <div className="vl-eyebrow" style={{ color: accent }}>Progress &amp; Placement Assessment</div>
          <h1 className="vl-title">Not just your <em style={{ color: accent }}>level.</em><br />Your <em style={{ color: accent }}>trajectory.</em></h1>
          <p className="vl-sub">
            CEFR levels give a broad picture of ability. But they don&apos;t show how learning is progressing, or which objectives are actually secure. FEAT measures both. It tracks what has been learned, what can be applied, and where gaps remain. Over time, and at the point of entry. Progress testing, objective tracking, and accurate placement, all based on demonstrated performance, not single scores.
          </p>
        </div>

        <div className="vl-points animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>01</div>
            <div className="vl-point-body">
              <strong>Progress testing.</strong> Has learning actually transferred? Assessment is aligned to recent learning objectives. The system checks whether learners can apply what was taught, not just recognise it.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>02</div>
            <div className="vl-point-body">
              <strong>Objective-level tracking.</strong> What is secure, and what is not yet stable? Performance is mapped to specific learning objectives. You see exactly where competence is confirmed and where it breaks down.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>03</div>
            <div className="vl-point-body">
              <strong>Placement testing.</strong> Where should the learner start? Initial assessment identifies the highest level where performance is consistent, not just occasional success. Placement reflects demonstrated ability, not test-taking strategy.
            </div>
          </div>
        </div>

        <div className="vl-beyond animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="vl-beyond-title">Beyond <em style={{ color: accent }}>one-off testing</em></div>
          <div className="vl-beyond-cols">
            <div>
              <div className="vl-beyond-col-title">Traditional tests</div>
              <ul className="vl-beyond-col-list">
                <li style={{ borderColor: "#64748b" }}>Give a single score</li>
                <li style={{ borderColor: "#64748b" }}>Focus on isolated items</li>
                <li style={{ borderColor: "#64748b" }}>Reward short-term recall</li>
              </ul>
            </div>
            <div>
              <div className="vl-beyond-col-title" style={{ color: accent }}>FEAT</div>
              <ul className="vl-beyond-col-list">
                <li style={{ borderColor: accent }}>Builds a performance profile over time</li>
                <li style={{ borderColor: accent }}>Confirms consistency, not one-off success</li>
                <li style={{ borderColor: accent }}>Measures application against real objectives</li>
              </ul>
            </div>
          </div>
          <div className="vl-beyond-close"><em style={{ color: accent }}>If it hasn&apos;t transferred, it hasn&apos;t been learned.</em></div>
        </div>

        <div className="vl-usecases animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="vl-usecases-title">What this enables</div>
          <div className="vl-usecase">
            <div className="vl-usecase-name" style={{ color: accent }}>Mid-course checks</div>
            <div className="vl-usecase-desc">Are learners actually progressing, or just completing content?</div>
          </div>
          <div className="vl-usecase">
            <div className="vl-usecase-name" style={{ color: accent }}>Accurate placement</div>
            <div className="vl-usecase-desc">Start at the right level based on performance, not guesswork.</div>
          </div>
          <div className="vl-usecase">
            <div className="vl-usecase-name" style={{ color: accent }}>Objective-level reporting</div>
            <div className="vl-usecase-desc">Identify exactly what needs reinforcement, objective by objective.</div>
          </div>
        </div>

        <div className="vl-tasks animate-fade-up" style={{ animationDelay: "160ms" }}>
          <div className="vl-tasks-title">Demo task structure</div>
          {TASK_CARDS.map(t => (
            <Link key={t.num} href={`/writing/task/${t.id}`} className="vl-task-card">
              <div className="vl-task-card-top">
                <div className="vl-task-card-num" style={{ color: accent }}>{t.num}</div>
                <div className="vl-task-card-fn" style={{ color: accent }}>{t.fn}</div>
              </div>
              <div className="vl-task-card-name" style={{ color: "#e2e8f0" }}>{t.name}</div>
              <div className="vl-task-card-desc">{t.desc}</div>
              <div className="vl-task-card-cta" style={{ color: accent }}>Try demo {ARROW}</div>
            </Link>
          ))}
        </div>

        <div className="vl-cta animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Link href="/" className="vl-back">← Back to FEAT</Link>
        </div>

        <footer className="vl-footer">
          <div className="vl-footer-logo">FEAT <em style={{ color: accent }}>CEFR</em></div>
          <div>Progress &amp; Placement Assessment</div>
        </footer>
      </div>
    </div>
  );
}
