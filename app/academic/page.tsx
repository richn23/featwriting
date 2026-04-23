"use client";
import Link from "next/link";

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

const DOWNLOAD = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

const accent = "#a78bfa";

// The five FEAT Academic tasks, in the construct's intended cognitive order.
const TASKS = [
  {
    id: "data-literacy",
    name: "Data Literacy",
    emphasis: "Evaluating evidence",
    desc: "A conclusion is drawn from a chart. Can you spot what the evidence actually supports, what it doesn't, and why?",
    href: "/beyond/data-literacy",
  },
  {
    id: "argument",
    name: "Argument Evaluation",
    emphasis: "Evaluating arguments",
    desc: "An argument is presented. You assess its reasoning — what holds up, what doesn't, and why.",
    href: "/beyond/argument",
  },
  {
    id: "weighing-alternatives",
    name: "Weighing Alternatives",
    emphasis: "Comparing perspectives",
    desc: "Two academics take opposing positions. You compare their reasoning, weigh the trade-offs, and reach a judgement you can defend.",
    href: "/beyond/weighing-alternatives",
    isNew: true,
  },
  {
    id: "interpretation-evaluation",
    name: "Interpretation & Evaluation",
    emphasis: "Comprehension + evaluation",
    desc: "An unfamiliar academic framework is put in front of you. Explain it precisely in your own words — then evaluate its assumptions and limits.",
    href: "/beyond/interpretation-evaluation",
    isNew: true,
  },
  {
    id: "justified-judgement",
    name: "Justified Judgement",
    emphasis: "Forming and defending a position",
    desc: "An open academic question. Take a position. Anticipate the strongest objection. Defend your view against it.",
    href: "/beyond/justified-judgement",
    isNew: true,
  },
];

const DIMENSIONS = [
  {
    name: "Task Achievement",
    role: "Evidence Validity",
    body: "Does the response engage meaningfully with the task as posed? A valid response addresses the question directly. Failure here means no usable evidence has been produced.",
  },
  {
    name: "Content Quality",
    role: "Depth of Evidence",
    body: "The substance of the response once the task has been engaged with — relevance, development of ideas, meaningful contribution.",
  },
  {
    name: "Argumentation",
    role: "Structure of Evidence",
    body: "Are ideas organised into a coherent line of reasoning — identifiable claims, supporting reasoning, logical progression?",
  },
  {
    name: "Critical Thinking",
    role: "Evaluation of Evidence",
    body: "The sophistication of the reasoning — evaluating claims, comparing alternative perspectives, reaching and justifying a conclusion.",
  },
];

const LEVELS = [
  { name: "Not Yet Competent", body: "Treats the prompt as an opinion question. Single perspective, no weighing of alternatives. Not yet ready for university-level study." },
  { name: "Competent", body: "Engages with the actual question. Reasoned argument with some support, and acknowledges at least one alternative. Can cope with undergraduate demands, potentially with support." },
  { name: "Merit", body: "Engages precisely. Clear argument with connected reasoning, genuinely considers counter-arguments. Ready for mainstream university study." },
  { name: "Distinction", body: "Reframes the question itself. Sophisticated argument that anticipates objections and draws fine distinctions. Strong candidate for selective institutions." },
];

const pageStyles = `
.vl { min-height:100vh; background:var(--s-bg); color:var(--s-text) }
.vl-nav { display:flex; align-items:center; justify-content:space-between; padding:18px 36px; border-bottom:1px solid rgba(255,255,255,.06) }
.vl-nav-logo { font-family:'DM Serif Display',serif; font-size:1.1rem; color:var(--s-text); text-decoration:none }
.vl-nav-logo em { font-style:italic }
.vl-nav-cta { display:inline-flex; align-items:center; gap:6px; font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:${accent}; text-decoration:none; padding:6px 14px; border:1px solid ${accent}; border-radius:18px; transition:background .2s, color .2s }
.vl-nav-cta:hover { background:${accent}; color:#0b1220 }

.vl-hero { max-width:680px; margin:0 auto; padding:80px 24px 40px; text-align:center }
.vl-eyebrow { font-size:.55rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em; margin-bottom:16px }
.vl-title { font-family:'DM Serif Display',serif; font-size:clamp(2rem,4vw,2.8rem); font-weight:400; letter-spacing:-.03em; line-height:1.15; color:var(--s-text); margin-bottom:16px }
.vl-title em { font-style:italic }
.vl-sub { font-size:.95rem; color:var(--s-text-muted); line-height:1.75; margin-bottom:8px }
.vl-sub-strong { font-size:1rem; color:var(--s-text); line-height:1.6; margin-bottom:24px; font-weight:500 }

.vl-twist { max-width:560px; margin:0 auto 48px; padding:22px 28px; background:rgba(167,139,250,.06); border-left:3px solid ${accent}; border-radius:4px }
.vl-twist-head { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:${accent}; margin-bottom:8px }
.vl-twist-body { font-size:.92rem; color:var(--s-text); line-height:1.7 }
.vl-twist-body strong { color:${accent}; font-weight:600 }

.vl-section { max-width:720px; margin:0 auto 56px; padding:0 24px }
.vl-section-eyebrow { font-size:.55rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em; color:${accent}; margin-bottom:12px; text-align:center }
.vl-section-title { font-family:'DM Serif Display',serif; font-size:clamp(1.4rem,2.4vw,1.7rem); font-weight:400; color:var(--s-text); margin-bottom:10px; text-align:center }
.vl-section-title em { font-style:italic }
.vl-section-intro { font-size:.9rem; color:var(--s-text-muted); line-height:1.7; text-align:center; max-width:560px; margin:0 auto 28px }

.vl-dim { padding:16px 20px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:10px; margin-bottom:10px }
.vl-dim-head { display:flex; flex-wrap:wrap; align-items:baseline; gap:10px; margin-bottom:6px }
.vl-dim-name { font-size:.82rem; font-weight:600; color:${accent}; letter-spacing:.02em }
.vl-dim-role { font-size:.6rem; font-weight:600; text-transform:uppercase; letter-spacing:.1em; color:var(--s-text-muted); padding:3px 8px; border:1px solid rgba(167,139,250,.3); border-radius:10px }
.vl-dim-body { font-size:.85rem; color:var(--s-text-muted); line-height:1.65 }

.vl-stage-panel { margin:20px 0 8px; padding:16px 20px; background:rgba(167,139,250,.06); border-left:3px solid ${accent}; border-radius:4px; font-size:.82rem; color:var(--s-text-muted); line-height:1.65 }
.vl-stage-panel strong { color:${accent}; font-weight:600 }
.vl-stage-panel p { margin:0 }
.vl-stage-panel p + p { margin-top:8px }

.vl-summary-strip { margin:28px 0 0; padding:16px 20px; border-top:1px solid rgba(167,139,250,.3); border-bottom:1px solid rgba(167,139,250,.3); text-align:center; font-size:.82rem; color:var(--s-text); display:flex; flex-wrap:wrap; gap:16px; justify-content:center; align-items:center }
.vl-summary-strip strong { color:${accent}; font-weight:600 }
.vl-summary-dot { opacity:.3; color:${accent} }

.vl-level { padding:14px 18px; background:rgba(255,255,255,.02); border-left:3px solid ${accent}; border-radius:4px; margin-bottom:10px }
.vl-level-name { font-family:'DM Serif Display',serif; font-size:1rem; font-weight:400; color:var(--s-text); margin-bottom:4px }
.vl-level-body { font-size:.85rem; color:var(--s-text-muted); line-height:1.6 }
.vl-level-footnote { margin-top:14px; padding:10px 14px; border-top:1px dashed rgba(255,255,255,.08); font-size:.78rem; color:var(--s-text-muted); line-height:1.6 }
.vl-level-footnote strong { color:var(--s-text); font-weight:600 }

.vl-pdf-callout { max-width:720px; margin:0 auto 56px; padding:24px 28px; background:rgba(167,139,250,.04); border:1px solid rgba(167,139,250,.22); border-radius:14px; display:flex; align-items:center; gap:20px }
.vl-pdf-icon { flex-shrink:0; width:44px; height:44px; border-radius:10px; background:rgba(167,139,250,.15); color:${accent}; display:flex; align-items:center; justify-content:center }
.vl-pdf-copy { flex:1 }
.vl-pdf-title { font-family:'DM Serif Display',serif; font-size:1.1rem; font-weight:400; color:var(--s-text); margin-bottom:4px }
.vl-pdf-desc { font-size:.82rem; color:var(--s-text-muted); line-height:1.6 }
.vl-pdf-btn { flex-shrink:0; display:inline-flex; align-items:center; gap:8px; padding:10px 18px; font-size:.8rem; font-weight:600; color:#0b1220; background:${accent}; border:none; border-radius:8px; text-decoration:none; transition:transform .15s, box-shadow .15s }
.vl-pdf-btn:hover { transform:translateY(-1px); box-shadow:0 6px 18px rgba(167,139,250,.3) }
@media (max-width: 600px) { .vl-pdf-callout { flex-direction:column; text-align:center } }

.vl-usecases { max-width:720px; margin:0 auto 56px; padding:0 24px }
.vl-usecases-grid { display:grid; grid-template-columns:1fr; gap:12px }
@media (min-width: 720px) { .vl-usecases-grid { grid-template-columns:1fr 1fr } }
.vl-usecase { padding:18px 20px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:10px }
.vl-usecase-name { font-size:.8rem; font-weight:600; color:var(--s-text); margin-bottom:4px }
.vl-usecase-desc { font-size:.78rem; color:var(--s-text-muted); line-height:1.6 }

.vl-tasks { max-width:720px; margin:0 auto 56px; padding:0 24px }
.vl-tasks-intro { font-size:.88rem; color:var(--s-text-muted); line-height:1.7; text-align:center; max-width:560px; margin:0 auto 28px }
.vl-task-card { display:block; padding:22px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06); border-radius:12px; text-decoration:none; color:inherit; transition:border-color .2s, background .2s; margin-bottom:12px }
.vl-task-card:hover { border-color:rgba(255,255,255,.15); background:rgba(255,255,255,.035) }
.vl-task-card-head { display:flex; align-items:center; gap:10px; margin-bottom:6px }
.vl-task-card-name { font-size:.92rem; font-weight:600; color:${accent} }
.vl-task-card-emphasis { font-size:.65rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--s-text-muted); padding:3px 8px; background:rgba(255,255,255,.04); border-radius:10px }
.vl-task-card-desc { font-size:.85rem; color:var(--s-text-muted); line-height:1.6; margin-bottom:10px }
.vl-task-card-cta { display:inline-flex; align-items:center; gap:5px; font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; opacity:.6; transition:opacity .2s; color:${accent} }
.vl-task-card:hover .vl-task-card-cta { opacity:1 }
.vl-task-new-badge { font-size:.5rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:2px 8px; border-radius:10px; background:rgba(167,139,250,.15); color:${accent} }

.vl-cta { text-align:center; padding:0 24px 80px }
.vl-back { display:inline-flex; align-items:center; gap:6px; font-size:.65rem; font-weight:600; color:var(--s-text-muted); text-decoration:none; padding:6px 14px; border:1px solid rgba(255,255,255,.1); border-radius:16px; transition:border-color .2s, color .2s }
.vl-back:hover { color:var(--s-text); border-color:rgba(255,255,255,.2) }

.vl-footer { padding:20px 36px; border-top:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; font-size:.7rem; color:#475569 }
.vl-footer-logo { font-family:'DM Serif Display',serif; font-size:.85rem; color:#475569 }
.vl-footer-logo em { font-style:italic }
`;

export default function AcademicPage() {
  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <div className="vl">
        <nav className="vl-nav">
          <Link href="/" className="vl-nav-logo">FEAT <em style={{ color: accent }}>Academic</em></Link>
          <a href="/FEAT_Academic_Construct.pdf" target="_blank" rel="noopener noreferrer" className="vl-nav-cta" aria-label="Download Construct Definition PDF">
            {DOWNLOAD} Construct PDF
          </a>
        </nav>

        <div className="vl-hero animate-fade-up">
          <div className="vl-eyebrow" style={{ color: accent }}>Pre-sessional &amp; Admissions Assessment</div>
          <h1 className="vl-title">Measures <em style={{ color: accent }}>how you think</em>,<br />not what you&apos;ve read.</h1>
          <p className="vl-sub-strong">
            FEAT Academic checks whether a candidate is ready to engage with academic reasoning at university level.
          </p>
          <p className="vl-sub">
            A supplement — or alternative — to language-based entry tests like IELTS for decisions that hinge on academic readiness rather than general language proficiency. Every task is self-contained, so topic knowledge gives no advantage. Reasoning is the variable being measured.
          </p>
        </div>

        <div className="vl-twist animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="vl-twist-head">The twist</div>
          <div className="vl-twist-body">
            Where IELTS and similar tests reward candidates who happen to know the topic, FEAT Academic strips that advantage out. <strong>Every task contains everything needed to respond.</strong> A student who hasn&apos;t encountered the material before is on equal footing with one who has.
          </div>
        </div>

        <section className="vl-section animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="vl-section-eyebrow">Section 6 · Conceptual Layer</div>
          <h2 className="vl-section-title">Evidence <em>Model</em></h2>
          <p className="vl-section-intro">
            The four dimensions are not levels or grades. They are <strong>evidence signals</strong> — each points to a different aspect of the response, and together they inform the final judgement.
          </p>
          {DIMENSIONS.map(d => (
            <div key={d.name} className="vl-dim">
              <div className="vl-dim-head">
                <div className="vl-dim-name">{d.name}</div>
                <div className="vl-dim-role">{d.role}</div>
              </div>
              <div className="vl-dim-body">{d.body}</div>
            </div>
          ))}
          <div className="vl-stage-panel">
            <p><strong>Stage 1 — Validation.</strong> Task Achievement determines whether the response provides valid evidence at all. If it does not, the remaining dimensions are not evaluated.</p>
            <p><strong>Stage 2 — Quality evaluation.</strong> If the evidence is valid, Content Quality, Argumentation, and Critical Thinking are evaluated together to judge its depth, structure, and sophistication.</p>
          </div>
          <div className="vl-summary-strip">
            <span><strong>Dimensions ≠ Levels</strong></span>
            <span className="vl-summary-dot">·</span>
            <span><strong>Dimensions = Evidence signals</strong></span>
            <span className="vl-summary-dot">·</span>
            <span><strong>Outcome = Judgement based on evidence</strong></span>
          </div>
        </section>

        <section className="vl-section animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="vl-section-eyebrow">Section 7 · Operational Layer</div>
          <h2 className="vl-section-title">Outcome <em>Determination</em></h2>
          <p className="vl-section-intro">
            Each dimension is graded on the four-tier FEAT scale. The overall level is then derived through transparent decision rules — a validity gate first, then quality evaluation across the remaining dimensions. Full rules live in the <a href="/FEAT_Academic_Construct.pdf" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline" }}>Construct PDF</a>.
          </p>
          {LEVELS.map(l => (
            <div key={l.name} className="vl-level">
              <div className="vl-level-name">{l.name}</div>
              <div className="vl-level-body">{l.body}</div>
            </div>
          ))}
          <div className="vl-level-footnote">
            <strong>Insufficient Evidence</strong> is an off-scale outcome, not a level. A response that refuses, misreads, or is too short to evaluate is flagged for reviewer attention rather than scored as Not Yet Competent.
          </div>
        </section>

        <div className="vl-pdf-callout animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="vl-pdf-icon" aria-hidden="true">{DOWNLOAD}</div>
          <div className="vl-pdf-copy">
            <div className="vl-pdf-title">Construct Definition Document</div>
            <div className="vl-pdf-desc">The full specification — dimensions, levels, scoring rules, validity model, and task design principles. Draft v0.5.</div>
          </div>
          <a href="/FEAT_Academic_Construct.pdf" target="_blank" rel="noopener noreferrer" className="vl-pdf-btn">Download PDF {ARROW}</a>
        </div>

        <div className="vl-usecases animate-fade-up" style={{ animationDelay: "140ms" }}>
          <div className="vl-section-eyebrow">What it&apos;s for</div>
          <h2 className="vl-section-title" style={{ marginBottom: 24 }}>Use <em>cases</em></h2>
          <div className="vl-usecases-grid">
            <div className="vl-usecase">
              <div className="vl-usecase-name" style={{ color: accent }}>University admissions</div>
              <div className="vl-usecase-desc">Evidence of reasoning capability — not just reading comprehension — for pathway and direct-entry decisions.</div>
            </div>
            <div className="vl-usecase">
              <div className="vl-usecase-name" style={{ color: accent }}>Pre-sessional placement</div>
              <div className="vl-usecase-desc">Entry and exit gates for pre-sessional programmes. Is the candidate ready for university-level reasoning?</div>
            </div>
            <div className="vl-usecase">
              <div className="vl-usecase-name" style={{ color: accent }}>Foundation progression</div>
              <div className="vl-usecase-desc">Point-of-decision assessment for foundation students moving into year-one study.</div>
            </div>
            <div className="vl-usecase">
              <div className="vl-usecase-name" style={{ color: accent }}>Pathway certification</div>
              <div className="vl-usecase-desc">Credential for partner institutions placing students into degree programmes.</div>
            </div>
          </div>
        </div>

        <div className="vl-tasks animate-fade-up" style={{ animationDelay: "160ms" }}>
          <div className="vl-section-eyebrow">Five tasks</div>
          <h2 className="vl-section-title" style={{ marginBottom: 12 }}>The <em>assessment</em></h2>
          <p className="vl-tasks-intro">
            Five tasks moving from receptive evaluation through comparison and interpretation to productive judgement — a natural cognitive ladder from reading critically to writing with authority.
          </p>
          {TASKS.map(t => (
            <Link key={t.id} href={t.href} className="vl-task-card">
              <div className="vl-task-card-head">
                <div className="vl-task-card-name">{t.name}</div>
                <div className="vl-task-card-emphasis">{t.emphasis}</div>
                {t.isNew && <span className="vl-task-new-badge">New</span>}
              </div>
              <div className="vl-task-card-desc">{t.desc}</div>
              <div className="vl-task-card-cta">Try demo {ARROW}</div>
            </Link>
          ))}
        </div>

        <div className="vl-cta animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Link href="/" className="vl-back">← Back to FEAT</Link>
        </div>

        <footer className="vl-footer">
          <div className="vl-footer-logo">FEAT <em style={{ color: accent }}>Academic</em></div>
          <div>Rethinking Academic Assessment</div>
        </footer>
      </div>
    </div>
  );
}
