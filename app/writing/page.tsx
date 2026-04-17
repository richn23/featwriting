"use client";
import Link from "next/link";
import { writingStyles } from "./_shared/styles";

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

const homeStyles = `
/* ─── Home split screen ─── */
.home-page {
  min-height:100vh; display:flex; flex-direction:column;
  background:var(--s-bg); color:var(--s-text);
}
.home-nav {
  display:flex; align-items:center; justify-content:space-between;
  padding:18px 36px; border-bottom:1px solid rgba(255,255,255,.06);
}
.home-nav-logo {
  font-family:'DM Serif Display',serif; font-size:1.2rem; color:var(--s-text);
  letter-spacing:-.02em;
}
.home-nav-logo em { font-style:italic; color:var(--s-accent) }
.home-nav-flyer {
  display:inline-flex; align-items:center; gap:6px;
  font-size:.72rem; font-weight:600; color:var(--s-text-muted);
  text-decoration:none; padding:6px 14px; border:1px solid rgba(255,255,255,.1);
  border-radius:8px; transition:border-color .2s, color .2s;
}
.home-nav-flyer:hover { border-color:var(--s-accent); color:var(--s-accent) }

.home-split {
  flex:1; display:grid; grid-template-columns:1fr 1fr;
  min-height:0;
}
@media (max-width:768px) {
  .home-split { grid-template-columns:1fr; }
}

.home-panel {
  display:flex; flex-direction:column; justify-content:center; align-items:center;
  padding:60px 48px; text-align:center; position:relative;
  transition:background .3s;
}
.home-panel:hover { background:rgba(255,255,255,.015) }
.home-panel-left {
  border-right:1px solid rgba(255,255,255,.06);
}

.home-panel-eyebrow {
  font-size:.6rem; font-weight:700; text-transform:uppercase;
  letter-spacing:.14em; margin-bottom:16px;
}
.home-panel-title {
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.6rem, 3vw, 2.2rem);
  font-weight:400; letter-spacing:-.02em; line-height:1.2;
  color:var(--s-text); margin-bottom:20px;
}
.home-panel-title em { font-style:italic }
.home-panel-body {
  font-size:.88rem; line-height:1.75; color:var(--s-text-muted);
  max-width:400px; margin-bottom:32px;
}
.home-panel-btn {
  display:inline-flex; align-items:center; gap:8px;
  padding:13px 32px; border:none; border-radius:10px;
  font-size:.85rem; font-weight:600; text-decoration:none;
  cursor:pointer; transition:opacity .2s;
}
.home-panel-btn:hover { opacity:.88 }

.home-panel-tasks {
  display:flex; gap:6px; flex-wrap:wrap; justify-content:center;
  margin-top:20px; max-width:400px;
}
.home-panel-task-chip {
  font-size:.6rem; font-weight:600; padding:4px 10px;
  border-radius:20px; text-transform:uppercase; letter-spacing:.06em;
  border:1px solid rgba(255,255,255,.08); color:var(--s-text-muted);
}

.home-footer {
  padding:16px 36px; border-top:1px solid rgba(255,255,255,.06);
  display:flex; align-items:center; justify-content:space-between;
  font-size:.7rem; color:#475569;
}
.home-footer-logo { font-family:'DM Serif Display',serif; font-size:.85rem; color:#475569 }
.home-footer-logo em { font-style:italic }
`;

export default function WritingHomePage() {
  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: writingStyles + homeStyles }} />
      <div className="home-page">
        <nav className="home-nav">
          <div className="home-nav-logo">FEAT</div>
          <a href="/FEAT_Brochure.pdf" target="_blank" rel="noopener noreferrer" className="home-nav-flyer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            View brochure
          </a>
        </nav>

        <div className="home-split">
          {/* LEFT — CEFR Writing Assessment */}
          <div className="home-panel home-panel-left animate-fade-up">
            <div className="home-panel-eyebrow" style={{ color: "var(--s-accent)" }}>CEFR-aligned language assessment</div>
            <h1 className="home-panel-title"><em style={{ color: "var(--s-accent)" }}>FEAT</em> Writing</h1>
            <p className="home-panel-body">
              A function-based writing test built on CEFR and GSE. Five interactive tasks that assess what learners can do with language — not just how accurately they write. Live AI interaction, evidence-based scoring, dual profiles for function and form.
            </p>
            <Link href="/writing/cefr" className="home-panel-btn" style={{ background: "var(--s-accent)", color: "#0d1117" }}>
              Learn more {ARROW}
            </Link>
            <div className="home-panel-tasks">
              <span className="home-panel-task-chip">Diagnostic Chat</span>
              <span className="home-panel-task-chip">Extended Writing</span>
              <span className="home-panel-task-chip">Opinion Chat</span>
              <span className="home-panel-task-chip">Pragmatic Control</span>
              <span className="home-panel-task-chip">Mediation</span>
            </div>
          </div>

          {/* RIGHT — Beyond CEFR */}
          <div className="home-panel animate-fade-up" style={{ animationDelay: "80ms" }}>
            <div className="home-panel-eyebrow" style={{ color: "#fbbf24" }}>Workplace readiness assessment</div>
            <h1 className="home-panel-title"><em style={{ color: "#fbbf24" }}>FEAT</em> Beyond</h1>
            <p className="home-panel-body">
              The same engine — applied beyond language. Decision-making under pressure, applied CPD, AI literacy, information triage, and structured reasoning. Interactive scenarios scored against transparent performance criteria. No CEFR dependency.
            </p>
            <Link href="/writing/beyond" className="home-panel-btn" style={{ background: "#fbbf24", color: "#0d1117" }}>
              Learn more {ARROW}
            </Link>
            <div className="home-panel-tasks">
              <span className="home-panel-task-chip">Operational Judgment</span>
              <span className="home-panel-task-chip">Applied CPD</span>
              <span className="home-panel-task-chip">AI Use &amp; Policy</span>
              <span className="home-panel-task-chip">Info Prioritisation</span>
              <span className="home-panel-task-chip">Argument Evaluation</span>
            </div>
          </div>
        </div>

        <footer className="home-footer">
          <div className="home-footer-logo">FEAT <em>Prototype</em></div>
          <div>Functional Evidence-based Assessment Tasks</div>
        </footer>
      </div>
    </div>
  );
}
