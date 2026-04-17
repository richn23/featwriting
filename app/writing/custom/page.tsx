"use client";
import Link from "next/link";
import { writingStyles } from "../_shared/styles";

const accent = "#fb7185";

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

/* Domain examples */
.vl-domains { max-width:640px; margin:0 auto 48px; padding:0 24px }
.vl-domains-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text-muted); margin-bottom:16px; text-align:center }
.vl-domains-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px }
.vl-domain { padding:16px 18px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:10px; text-align:center }
.vl-domain-name { font-size:.78rem; font-weight:600; margin-bottom:4px }
.vl-domain-fn { font-size:.65rem; color:var(--s-text-muted); line-height:1.5 }

.vl-coming { text-align:center; padding:24px; font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--s-text-muted); border:1px dashed rgba(255,255,255,.1); border-radius:10px; max-width:300px; margin:0 auto 48px }
.vl-cta { text-align:center; padding:0 24px 80px }
.vl-back { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; color:var(--s-text-muted); text-decoration:none; margin-top:16px; transition:color .2s }
.vl-back:hover { color:var(--s-text) }
.vl-footer { padding:20px 36px; border-top:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; font-size:.7rem; color:#475569 }
.vl-footer-logo { font-family:'DM Serif Display',serif; font-size:.85rem; color:#475569 }
.vl-footer-logo em { font-style:italic }
`;

export default function CustomPage() {
  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: writingStyles + pageStyles }} />
      <div className="vl">
        <nav className="vl-nav">
          <Link href="/writing" className="vl-nav-logo">FEAT <em style={{ color: accent }}>Beyond</em></Link>
        </nav>

        <div className="vl-hero animate-fade-up">
          <div className="vl-eyebrow" style={{ color: accent }}>Define Your Own</div>
          <h1 className="vl-title">Your context.<br />Your <em style={{ color: accent }}>criteria.</em></h1>
          <p className="vl-sub">
            FEAT is an engine, not a test. You define the function — what competence looks like in your context. You set the criteria. The system collects the evidence through structured interaction and scores it against your standards. Any domain. Any skill. Any context where performance matters more than accuracy.
          </p>
        </div>

        <div className="vl-points animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>01</div>
            <div className="vl-point-body">
              <strong>Define the function.</strong> A learning objective. A job requirement. An academic skill. A compliance standard. Whatever performance looks like in your context — that becomes the assessment target.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>02</div>
            <div className="vl-point-body">
              <strong>Set the criteria.</strong> What does competent look like? What does not yet competent look like? Your subject matter experts set the threshold — the system applies it consistently.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>03</div>
            <div className="vl-point-body">
              <strong>Collect the evidence.</strong> The AI examiner probes, follows up, and challenges until a confidence threshold is reached. Competent or not confirmed. No guessing. No partial credit. Evidence.
            </div>
          </div>
        </div>

        <div className="vl-domains animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="vl-domains-title">Example domains</div>
          <div className="vl-domains-grid">
            <div className="vl-domain">
              <div className="vl-domain-name" style={{ color: accent }}>Medical Communication</div>
              <div className="vl-domain-fn">Can the clinician explain a diagnosis clearly to a patient?</div>
            </div>
            <div className="vl-domain">
              <div className="vl-domain-name" style={{ color: accent }}>Compliance Training</div>
              <div className="vl-domain-fn">Can the employee apply the policy in a realistic scenario?</div>
            </div>
            <div className="vl-domain">
              <div className="vl-domain-name" style={{ color: accent }}>Onboarding Checks</div>
              <div className="vl-domain-fn">Can the new hire handle a customer situation using what they were taught?</div>
            </div>
            <div className="vl-domain">
              <div className="vl-domain-name" style={{ color: accent }}>Safety Certification</div>
              <div className="vl-domain-fn">Can the operator make the right call under time pressure?</div>
            </div>
            <div className="vl-domain">
              <div className="vl-domain-name" style={{ color: accent }}>Teacher Training</div>
              <div className="vl-domain-fn">Can the trainee apply pedagogical principles to a real classroom problem?</div>
            </div>
            <div className="vl-domain">
              <div className="vl-domain-name" style={{ color: accent }}>Legal Reasoning</div>
              <div className="vl-domain-fn">Can the candidate apply case law to a new set of facts?</div>
            </div>
          </div>
        </div>

        <div className="vl-coming animate-fade-up" style={{ animationDelay: "160ms" }}>
          Custom domain builder coming soon
        </div>

        <div className="vl-cta animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Link href="/writing" className="vl-back">← Back to FEAT</Link>
        </div>

        <footer className="vl-footer">
          <div className="vl-footer-logo">FEAT <em style={{ color: accent }}>Beyond</em></div>
          <div>Define Your Own Assessment</div>
        </footer>
      </div>
    </div>
  );
}
