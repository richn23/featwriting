"use client";
import Link from "next/link";
import { writingStyles } from "../_shared/styles";

const TASK_CARDS = [
  { id: "01", num: "T1", cls: "t1", fn: "Interact & Inform", name: "Diagnostic Chat",    desc: "Live text chat with an AI examiner. It adapts in real time — probing ability, testing how the candidate interacts and informs." },
  { id: "02", num: "T2", cls: "t2", fn: "Inform & Narrate", name: "Extended Writing",   desc: "Scaffolded prompt followed by extended response. Tests clarity, sequencing, and the ability to develop detail." },
  { id: "03", num: "T3", cls: "t3", fn: "Express & Argue",  name: "Opinion Chat",       desc: "Interactive discussion where the AI challenges, disagrees, and pushes for justification. Can you hold your position?" },
  { id: "04", num: "T4", cls: "t4", fn: "Rephrase & Adjust", name: "Pragmatic Control", desc: "Rewrite a text for a different audience or purpose. Tests paraphrasing, register control, and linguistic flexibility." },
  { id: "05", num: "T5", cls: "t5", fn: "Compare & Advise",  name: "Mediation",         desc: "Evaluate options, explain differences, recommend a choice, and adapt advice when conditions change." },
];

const ARROW = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

export default function CefrLandingPage() {
  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: writingStyles }} />
      <div className="landing-page">
        <nav className="landing-nav">
          <div className="landing-nav-logo"><Link href="/writing" style={{ color: "inherit", textDecoration: "none" }}>FEAT</Link> <em>Writing</em></div>
          <Link href="/writing/task/01" className="landing-nav-cta">Begin Test Demo</Link>
        </nav>

        <section className="landing-hero animate-fade-up">
          <div className="landing-hero-eyebrow">FEAT Writing Test</div>
          <h1 className="landing-hero-title">Function First.<br /><em>Form Second.</em></h1>
          <p className="landing-hero-anchor">A function-based writing assessment platform.</p>
          <p className="landing-hero-hook">
            A mechanic is assessed by fixing an engine. A chef by preparing a dish. FEAT assesses writing the same way — through what learners actually do with language, not whether they can produce the right kind of text.
          </p>
          <p className="landing-hero-hook" style={{ fontSize: ".9rem", color: "var(--s-text-muted)", opacity: 0.8, marginTop: "-8px" }}>
            It tests communicative function, not genre.
          </p>
          <Link href="/writing/task/01" className="landing-hero-btn">Begin Test Demo {ARROW}</Link>
        </section>

        <section className="landing-section animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="landing-section-label">The problem</div>
          <div className="landing-section-body">
            <p>Most writing tests ask candidates to produce a genre: an essay, a report, a formal letter. Can you produce the right kind of text? Format. Structure. Register. Grammar. Vocabulary. They measure the language you use.</p>
            <p>This captures important skills, but only part of what it means to communicate in writing.</p>
            <p>CEFR descriptors are function-based: can the learner inform, express, argue, interact? But many CEFR-aligned assessments are still built around genre tasks.</p>
            <p>Consider the extremes. A learner can have poor grammar and still make a point clearly. Another can write near-perfect sentences that communicate nothing useful. The language you use and what you can do with language are related — but they are not the same thing.</p>
            <p>We know jagged profiles exist. The strong communicator who makes errors in every sentence. The weak communicator with perfect accuracy. Real learners don&apos;t sit neatly on one side of a line — and an assessment that collapses everything into a single score will always struggle to show you which one you&apos;re dealing with. On a traditional test, they often look the same.</p>
            <p className="landing-section-pull">We test the format. We don&apos;t always test the communication.</p>
            <div className="landing-compare">
              <div className="landing-compare-col">
                <div className="landing-compare-heading">What CEFR says</div>
                <div className="landing-compare-row"><div className="landing-compare-row-label">What is measured</div><div className="landing-compare-row-value">Communicative function — can the learner inform, narrate, argue?</div></div>
                <div className="landing-compare-row"><div className="landing-compare-row-label">The question being asked</div><div className="landing-compare-row-value">What do you need to do? Explain, persuade, clarify, respond.</div></div>
                <div className="landing-compare-row"><div className="landing-compare-row-label">Language</div><div className="landing-compare-row-value">A separate dimension — how well does the language serve the purpose?</div></div>
                <div className="landing-compare-row"><div className="landing-compare-row-label">Scoring basis</div><div className="landing-compare-row-value">Evidence of function — did the communication work?</div></div>
              </div>
              <div className="landing-compare-col">
                <div className="landing-compare-heading">What most assessments do</div>
                <div className="landing-compare-row"><div className="landing-compare-row-label">What is measured</div><div className="landing-compare-row-value">Genre and language accuracy — right text type, correct language use.</div></div>
                <div className="landing-compare-row"><div className="landing-compare-row-label">The question being asked</div><div className="landing-compare-row-value">What should it look like? Essay, report, formal letter, email.</div></div>
                <div className="landing-compare-row"><div className="landing-compare-row-label">Language</div><div className="landing-compare-row-value">Grammar, vocabulary, punctuation — how accurate is the language?</div></div>
                <div className="landing-compare-row"><div className="landing-compare-row-label">Scoring basis</div><div className="landing-compare-row-value">Task achievement is considered, but language correctness drives the level.</div></div>
              </div>
              <div className="landing-compare-gap">Most assessments ask: how accurate is the language? FEAT asks: did the communication work?</div>
            </div>
          </div>
        </section>

        <section className="landing-section animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="landing-section-label">The approach</div>
          <div className="landing-section-body">
            <p>FEAT starts from what the learner is trying to do with language. Not a single static prompt — live, back-and-forth tasks that demand real communication.</p>
            <div className="landing-contrast">
              <p className="not">Instead of: write an essay about technology,</p>
              <p className="but">FEAT asks: explain an idea to someone who doesn&apos;t understand it.</p>
            </div>
            <p>The candidate may need to justify a view when challenged. Clarify when misunderstood. Adapt when the situation shifts. The AI responds, follows up, pushes back, and sometimes misunderstands on purpose — because real communication requires all of that.</p>
            <p>Level comes from patterns of evidence across the full session. Not one task. Not one score. A profile.</p>
          </div>
        </section>

        <section className="landing-section animate-fade-up" style={{ animationDelay: "250ms" }}>
          <div className="landing-section-label">How it&apos;s controlled</div>
          <div className="landing-section-body">
            <p>Every task follows a defined structure. The system varies prompts and challenges within set parameters — so each session is different, but difficulty remains comparable.</p>
            <p>Evidence is gathered across multiple tasks and mapped directly to CEFR and GSE descriptors. Scoring is based on what candidates demonstrate — not single responses, not impressions, not a holistic guess. Confirmed evidence or nothing.</p>
          </div>
        </section>

        <div className="landing-split-section animate-fade-up" style={{ animationDelay: "300ms" }}>
          <div className="landing-split-left">
            <div className="landing-split-block-label">What you get</div>
            <div className="landing-split-block-title" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", fontWeight: 400, color: "#E6EDF3", marginBottom: "16px", letterSpacing: "-.02em" }}>Two outputs, not one score</div>
            <div className="landing-split-block-body"><p>Most assessments collapse everything into a single number. FEAT separates two things that are fundamentally different — because they are.</p></div>
            <div className="landing-outputs">
              <div className="landing-output-item">
                <div className="landing-output-item-label fn">Function profile</div>
                <div className="landing-output-item-desc">What the learner can do — their ability to interact, inform, argue, narrate, mediate, and direct. Each function scored independently.</div>
              </div>
              <div className="landing-output-item">
                <div className="landing-output-item-label form">Language profile</div>
                <div className="landing-output-item-desc">How well they do it — grammar control, vocabulary range, discourse management, and mechanics. With evidence, plain-English explanation, and specific advice for improvement.</div>
              </div>
            </div>
          </div>
          <div className="landing-split-right">
            <div className="landing-split-block">
              <div className="landing-split-block-label">How it works</div>
              <div className="landing-split-block-title">Grounded in established frameworks</div>
              <div className="landing-split-block-body">
                <p>FEAT starts from communicative descriptors in CEFR and GSE. It groups them into broader purposes — informing, arguing, mediating, interacting — and turns them into behaviours that can be tested through live interaction.</p>
                <p>During a session, the system gathers evidence across these areas and maps performance to CEFR levels. You don&apos;t get one overall score. You get a profile of what the learner can and cannot do.</p>
              </div>
            </div>
            <div className="landing-split-block">
              <div className="landing-split-block-label">Scope</div>
              <div className="landing-split-block-title">What this does and doesn&apos;t replace</div>
              <div className="landing-split-block-body">
                <p>Academic writing, professional genres, and extended composition remain important. They need their own tools.</p>
                <p>For general English, testing purpose and communication in context offers a flexible, CEFR-aligned way to diagnose ability — without depending on fixed text types alone.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-tasks animate-fade-up" style={{ animationDelay: "350ms" }}>
          <div className="landing-tasks-label">Test structure</div>
          <div className="landing-tasks-title">Five tasks, one session</div>
          <div className="landing-tasks-intro">Each task tests different communicative demands. Together, they build a complete picture of what the learner can do. Click a card to start that task.</div>
          <div className="landing-task-grid">
            {TASK_CARDS.map(t => (
              <Link key={t.num} href={`/writing/task/${t.id}`} className="landing-task-card" style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}>
                <div className={`landing-task-num ${t.cls}`}>{t.num}</div>
                <div className="landing-task-fn">{t.fn}</div>
                <div className="landing-task-name">{t.name}</div>
                <div className="landing-task-desc">{t.desc}</div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 28, textAlign: "center" }}>
            <Link href="/writing/report" style={{ fontSize: 14, color: "var(--s-text-muted)", textDecoration: "underline" }}>
              View overall language report (after completing tasks)
            </Link>
          </div>
        </div>

        <div className="landing-final-cta animate-fade-up" style={{ animationDelay: "400ms" }}>
          <h2 className="landing-final-cta-title"><em>Functional Evidence-based</em><br />Assessment Tasks</h2>
          <p className="landing-final-cta-sub">The name says what it does.</p>
          <Link href="/writing/task/01" className="landing-hero-btn">Begin Test Demo {ARROW}</Link>
        </div>

        <footer className="landing-footer">
          <div className="landing-footer-logo">FEAT <em>Writing</em></div>
          <div className="landing-footer-note">Functional Evidence-based Assessment Tasks · Prototype</div>
        </footer>
      </div>
    </div>
  );
}
