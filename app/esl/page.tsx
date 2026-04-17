"use client";
import Link from "next/link";
import { writingStyles } from "../_shared/styles";

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);

const accent = "#34d399";

const pageStyles = `
.vl { min-height:100vh; background:var(--s-bg); color:var(--s-text) }
.vl-nav { display:flex; align-items:center; justify-content:space-between; padding:18px 36px; border-bottom:1px solid rgba(255,255,255,.06) }
.vl-nav-logo { font-family:'DM Serif Display',serif; font-size:1.1rem; color:var(--s-text); text-decoration:none }
.vl-nav-logo em { font-style:italic }
.vl-nav-cta { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; padding:6px 16px; border-radius:20px; text-decoration:none; border:1.5px solid currentColor; background:transparent; transition:background .2s, opacity .2s }
.vl-nav-cta:hover { background:rgba(255,255,255,.06) }
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
.vl-cta { text-align:center; padding:0 24px 80px }
.vl-cta-btn { display:inline-flex; align-items:center; gap:8px; padding:8px 24px; border-radius:20px; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; text-decoration:none; border:1.5px solid currentColor; background:transparent; transition:background .2s }
.vl-cta-btn:hover { background:rgba(255,255,255,.06) }
.vl-back { display:inline-flex; align-items:center; gap:6px; font-size:.65rem; font-weight:600; color:var(--s-text-muted); text-decoration:none; margin-top:20px; padding:4px 12px; border:1px solid rgba(255,255,255,.1); border-radius:16px; transition:border-color .2s, color .2s }
.vl-back:hover { color:var(--s-text); border-color:rgba(255,255,255,.2) }
.vl-footer { padding:20px 36px; border-top:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; font-size:.7rem; color:#475569 }
.vl-footer-logo { font-family:'DM Serif Display',serif; font-size:.85rem; color:#475569 }
.vl-footer-logo em { font-style:italic }
`;

export default function ESLPage() {
  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: writingStyles + pageStyles }} />
      <div className="vl">
        <nav className="vl-nav">
          <Link href="/" className="vl-nav-logo">FEAT <em style={{ color: accent }}>ESL</em></Link>
          <Link href="/task/01" className="vl-nav-cta" style={{ color: accent }}>Try demo {ARROW}</Link>
        </nav>

        <div className="vl-hero animate-fade-up">
          <div className="vl-eyebrow" style={{ color: accent }}>English Language Testing</div>
          <h1 className="vl-title">What can your learners <em style={{ color: accent }}>do</em> with English?</h1>
          <p className="vl-sub">
            Most English tests measure accuracy: grammar, vocabulary, format. FEAT ESL measures function. Can your learner inform, explain, argue, advise? Five interactive tasks collect evidence of what they can actually do with the language, not just how correctly they write.
          </p>
        </div>

        <div className="vl-points animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>01</div>
            <div className="vl-point-body">
              <strong>Live AI interaction.</strong> No static prompts. The AI examiner adapts in real time, probing, challenging, and following up based on what the learner writes. This produces richer evidence than a timed essay ever could.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>02</div>
            <div className="vl-point-body">
              <strong>Function, not format.</strong> Tasks are built around communicative functions: interact, inform, argue, rephrase, mediate. The question is never "write an essay." It is "can you do this thing with language?"
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>03</div>
            <div className="vl-point-body">
              <strong>Dual profiles.</strong> Every candidate gets two scores: a function profile (what they can do) and a form profile (how accurately they do it). Jagged profiles are expected, not hidden. You see both.
            </div>
          </div>
        </div>

        <div className="vl-cta animate-fade-up" style={{ animationDelay: "160ms" }}>
          <Link href="/task/01" className="vl-cta-btn" style={{ color: accent }}>
            Try demo {ARROW}
          </Link>
          <br />
          <Link href="/" className="vl-back">← Back to FEAT</Link>
        </div>

        <footer className="vl-footer">
          <div className="vl-footer-logo">FEAT <em style={{ color: accent }}>ESL</em></div>
          <div>English Language Testing</div>
        </footer>
      </div>
    </div>
  );
}
