"use client";
import Link from "next/link";
import { writingStyles } from "../_shared/styles";

const accent = "#34d399";

const TASK_CARDS = [
  { id: "read-discuss", name: "Read and Discuss", desc: "Read a text, then discuss what you understood. Answer follow-up questions, reflect on the content, and engage with the material beyond simple retrieval." },
  { id: "grammar-justify", name: "Grammar Justification", desc: "Answer the grammar question, then justify your choice. Use deductive reasoning. Explain why the alternatives are wrong." },
  { id: "vocab-context", name: "Vocabulary in Context", desc: "Use target language in context, adapt it for different situations, and explain your choices. Recognition is not enough." },
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

/* Beyond section */
.vl-beyond { max-width:560px; margin:0 auto 48px; padding:0 24px }
.vl-beyond-title { font-family:'DM Serif Display',serif; font-size:clamp(1.2rem,2vw,1.5rem); font-weight:400; color:var(--s-text); margin-bottom:16px; text-align:center }
.vl-beyond-cols { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px }
@media (max-width:600px) { .vl-beyond-cols { grid-template-columns:1fr } }
.vl-beyond-col-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; margin-bottom:8px; opacity:.6 }
.vl-beyond-col-list { list-style:none; padding:0; margin:0 }
.vl-beyond-col-list li { font-size:.78rem; color:var(--s-text-muted); line-height:1.7; padding:3px 0 3px 16px; position:relative }
.vl-beyond-col-list li::before { content:''; position:absolute; left:0; top:11px; width:6px; height:6px; border-radius:50%; border:1.5px solid; opacity:.4 }
.vl-beyond-close { font-size:.85rem; color:var(--s-text); font-weight:500; text-align:center }

/* What if section */
.vl-whatif { max-width:560px; margin:0 auto 48px; padding:0 24px }
.vl-whatif-title { font-family:'DM Serif Display',serif; font-size:clamp(1.2rem,2vw,1.5rem); font-weight:400; color:var(--s-text); margin-bottom:20px; text-align:center }
.vl-whatif-item { padding:16px 20px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:10px; margin-bottom:10px }
.vl-whatif-old { font-size:.75rem; color:var(--s-text-muted); line-height:1.6; margin-bottom:8px }
.vl-whatif-new { font-size:.78rem; font-weight:600; line-height:1.6 }

/* Use cases */
.vl-usecases { max-width:640px; margin:0 auto 48px; padding:0 24px }
.vl-usecases-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text-muted); margin-bottom:16px; text-align:center }
.vl-usecase { padding:16px 20px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.05); border-radius:10px; margin-bottom:10px }
.vl-usecase-name { font-size:.78rem; font-weight:600; color:var(--s-text); margin-bottom:4px }
.vl-usecase-desc { font-size:.75rem; color:var(--s-text-muted); line-height:1.6 }

/* Task cards */
.vl-tasks { max-width:640px; margin:0 auto 48px; padding:0 24px }
.vl-tasks-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text-muted); margin-bottom:16px; text-align:center }
.vl-task-card { display:block; padding:20px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06); border-radius:12px; color:inherit; margin-bottom:10px; opacity:.5 }
.vl-task-card-name { font-size:.85rem; font-weight:600; margin-bottom:4px }
.vl-task-card-desc { font-size:.78rem; color:var(--s-text-muted); line-height:1.6 }
.vl-task-card-soon { display:inline-flex; align-items:center; gap:5px; font-size:.5rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-top:10px; opacity:.5 }

.vl-cta { text-align:center; padding:0 24px 80px }
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
        </nav>

        <div className="vl-hero animate-fade-up">
          <div className="vl-eyebrow" style={{ color: accent }}>English Language Testing</div>
          <h1 className="vl-title">Static tests. <em style={{ color: accent }}>Interactive</em> learners.</h1>
          <p className="vl-sub">
            Language testing is still static. Read the text, answer the questions, complete the sentence, pick A, B, C, or D. In class, teachers push interaction, discussion, reasoning. But the resources force learners back into static practice. FEAT ESL closes that gap. Interactive tasks that test what learners can do with language, not just what they remember.
          </p>
        </div>

        <div className="vl-points animate-fade-up" style={{ animationDelay: "80ms" }}>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>01</div>
            <div className="vl-point-body">
              <strong>Beyond comprehension questions.</strong> A learner reads a text, then discusses what they understood, answers follow-up questions, reflects on the content. Not just retrieval. Interaction with the material.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>02</div>
            <div className="vl-point-body">
              <strong>Reasoning, not just accuracy.</strong> Answer the grammar question, then justify your choice. Use deductive reasoning. Explain why the other options are wrong. This is how teachers teach. Now the practice matches.
            </div>
          </div>
          <div className="vl-point">
            <div className="vl-point-num" style={{ color: accent }}>03</div>
            <div className="vl-point-body">
              <strong>Higher-order thinking.</strong> Language learning is not just vocabulary and grammar drills. It is analysis, evaluation, synthesis. FEAT ESL targets these skills through tasks that require learners to think, not just complete.
            </div>
          </div>
        </div>

        <div className="vl-beyond animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="vl-beyond-title">Beyond <em style={{ color: accent }}>static practice</em></div>
          <div className="vl-beyond-cols">
            <div>
              <div className="vl-beyond-col-title">Traditional ESL resources</div>
              <ul className="vl-beyond-col-list">
                <li style={{ borderColor: "#64748b" }}>Read and answer</li>
                <li style={{ borderColor: "#64748b" }}>Gap fill, MCQ, true/false</li>
                <li style={{ borderColor: "#64748b" }}>One correct answer</li>
                <li style={{ borderColor: "#64748b" }}>No follow-up, no reasoning</li>
              </ul>
            </div>
            <div>
              <div className="vl-beyond-col-title" style={{ color: accent }}>FEAT ESL</div>
              <ul className="vl-beyond-col-list">
                <li style={{ borderColor: accent }}>Read, discuss, reflect</li>
                <li style={{ borderColor: accent }}>Justify, reason, explain</li>
                <li style={{ borderColor: accent }}>Multiple valid approaches</li>
                <li style={{ borderColor: accent }}>Adaptive follow-up built in</li>
              </ul>
            </div>
          </div>
          <div className="vl-beyond-close"><em style={{ color: accent }}>Practice that matches how we actually teach.</em></div>
        </div>

        <div className="vl-whatif animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="vl-whatif-title">What <em style={{ color: accent }}>if</em></div>
          <div className="vl-whatif-item">
            <div className="vl-whatif-old">Reading comprehension: read the text, answer five questions, move on.</div>
            <div className="vl-whatif-new" style={{ color: accent }}>What if the learner discussed what they understood, answered questions, and reflected on the text, not just the information?</div>
          </div>
          <div className="vl-whatif-item">
            <div className="vl-whatif-old">Grammar practice: choose the correct option. No explanation needed.</div>
            <div className="vl-whatif-new" style={{ color: accent }}>What if they justified their choice using deductive reasoning?</div>
          </div>
          <div className="vl-whatif-item">
            <div className="vl-whatif-old">Vocabulary: matching and gap fill. Recognition, not use.</div>
            <div className="vl-whatif-new" style={{ color: accent }}>What if they used the language in context, adapted it, and explained their choices?</div>
          </div>
        </div>

        <div className="vl-usecases animate-fade-up" style={{ animationDelay: "140ms" }}>
          <div className="vl-usecases-title">What this enables</div>
          <div className="vl-usecase">
            <div className="vl-usecase-name" style={{ color: accent }}>Interactive homework</div>
            <div className="vl-usecase-desc">Practice that requires thinking, not just completion. Learners engage with material the way they would in class.</div>
          </div>
          <div className="vl-usecase">
            <div className="vl-usecase-name" style={{ color: accent }}>Skills beyond language</div>
            <div className="vl-usecase-desc">Target higher-order thinking through language tasks. Analysis, evaluation, and reasoning built into the practice.</div>
          </div>
          <div className="vl-usecase">
            <div className="vl-usecase-name" style={{ color: accent }}>Classroom-aligned resources</div>
            <div className="vl-usecase-desc">Teachers push interaction. Now the resources do too. Practice that reinforces what happens in the classroom, not what a textbook defaults to.</div>
          </div>
        </div>

        <div className="vl-tasks animate-fade-up" style={{ animationDelay: "160ms" }}>
          <div className="vl-tasks-title">Task structure</div>
          {TASK_CARDS.map(t => (
            <div key={t.id} className="vl-task-card">
              <div className="vl-task-card-name" style={{ color: accent }}>{t.name}</div>
              <div className="vl-task-card-desc">{t.desc}</div>
              <div className="vl-task-card-soon">Coming soon</div>
            </div>
          ))}
        </div>

        <div className="vl-cta animate-fade-up" style={{ animationDelay: "200ms" }}>
          <Link href="/" className="vl-back">&larr; Back to FEAT</Link>
        </div>

        <footer className="vl-footer">
          <div className="vl-footer-logo">FEAT <em style={{ color: accent }}>ESL</em></div>
          <div>English Language Testing</div>
        </footer>
      </div>
    </div>
  );
}
