export const writingStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');

:root {
  --ink: #1a1a2e;
  --paper: #f0ece4;
  --accent: #2d6a4f;
  --accent-light: #d8f3dc;
  --blue: #1e3a5f;
  --blue-light: #dbeafe;
  --coral: #c44536;
  --coral-light: #fce4e1;
  --amber: #92400e;
  --amber-light: #fde68a;
  --muted: #6b7280;
  --warm: #e8e0d4;
  --separator: rgba(0,0,0,0.06);
  --glass: rgba(255,255,255,0.72);
  --glass-border: rgba(255,255,255,0.3);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 20px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 40px rgba(0,0,0,0.08);
  --shadow-xl: 0 20px 60px rgba(0,0,0,0.12);
  --chat-bg: #e5ddd5;
  --examiner-bubble: #ffffff;
  --candidate-bubble: #d9fdd3;
  --can: #2d6a4f; --can-light: #d8f3dc;
  --not-yet: #c44536; --not-yet-light: #fce4e1;
  --not-tested: #9ca3af; --not-tested-light: #f3f4f6;
  --s-bg:#1e293b; --s-bg2:#0f172a; --s-surface:rgba(30,41,59,.6); --s-surface-border:rgba(255,255,255,.06);
  --s-text:#f1f5f9; --s-text-muted:#cbd5e1; --s-accent:#34d399; --s-accent-muted:rgba(52,211,153,.15);
}
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'DM Sans',sans-serif; background:var(--s-bg); color:var(--s-text); min-height:100vh; -webkit-font-smoothing:antialiased; }

@keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
@keyframes slideUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
@keyframes typingDot { 0%,60%,100% { transform:translateY(0); opacity:.3 } 30% { transform:translateY(-4px); opacity:1 } }
@keyframes spin { to { transform:rotate(360deg) } }
@keyframes levelReveal { from { opacity:0; transform:scale(.85) } to { opacity:1; transform:scale(1) } }
@keyframes barGrow { from { width:0 } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
.animate-fade-up { opacity:0; animation:fadeUp .5s ease forwards }
.animate-slide-up { opacity:0; animation:slideUp .6s ease forwards }
.spinner { width:32px; height:32px; border:2.5px solid rgba(255,255,255,.12); border-top-color:var(--s-accent); border-radius:50%; animation:spin .8s linear infinite }

/* ── LANDING PAGE ─────────────────────────────────────────────────────── */
.landing-page { background:var(--s-bg); color:var(--s-text); }

/* Nav */
.landing-nav {
  position:sticky; top:0; z-index:100;
  display:flex; align-items:center; justify-content:space-between;
  padding:18px 48px;
  background:rgba(15,23,42,0.88);
  backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  border-bottom:1px solid rgba(255,255,255,.06);
}
.landing-nav-logo { font-family:'DM Serif Display',serif; font-size:1.1rem; color:var(--s-text); letter-spacing:-.01em }
.landing-nav-logo em { color:var(--s-accent); font-style:normal }
.landing-nav-cta {
  padding:9px 20px; font-family:'DM Sans',sans-serif; font-size:.8rem; font-weight:600;
  color:#0f172a; background:var(--s-accent); border:none; border-radius:10px;
  cursor:pointer; transition:all .2s ease; box-shadow:0 2px 8px rgba(52,211,153,.25)
}
.landing-nav-cta:hover { background:#2dd4a8; transform:translateY(-1px) }

/* Hero */
.landing-hero {
  max-width:860px; margin:0 auto;
  padding:100px 48px 80px;
  text-align:center;
}
.landing-hero-eyebrow {
  display:inline-block;
  font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.18em;
  color:var(--s-accent); background:var(--s-accent-muted);
  padding:5px 14px; border-radius:20px; margin-bottom:20px;
}
.landing-hero-anchor {
  font-size:.95rem; line-height:1.55; color:var(--s-text-muted);
  max-width:560px; margin:0 auto 14px; font-weight:500;
}
.landing-hero-hook {
  font-size:1.02rem; line-height:1.65; color:var(--s-text-muted);
  max-width:600px; margin:0 auto 22px; font-weight:500;
}
.landing-hero-title {
  font-family:'DM Serif Display',serif;
  font-size:clamp(2.4rem, 5vw, 3.6rem);
  font-weight:400; letter-spacing:-.03em; line-height:1.1;
  color:var(--s-text); margin-bottom:12px;
}
.landing-hero-title em { color:var(--s-accent); font-style:italic }
.landing-hero-sub {
  font-size:1.05rem; line-height:1.7; color:var(--s-text-muted);
  max-width:600px; margin:0 auto 36px;
}
.landing-hero-btn {
  display:inline-flex; align-items:center; gap:8px;
  padding:16px 32px; font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:600;
  color:#0f172a; background:var(--s-accent); border:none; border-radius:14px;
  cursor:pointer; transition:all .2s ease; box-shadow:0 4px 16px rgba(52,211,153,.3)
}
.landing-hero-btn:hover { background:#2dd4a8; transform:translateY(-2px); box-shadow:0 8px 24px rgba(52,211,153,.35) }

.access-modal-backdrop { position:fixed; inset:0; z-index:10000; background:rgba(15,23,42,.88); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; padding:24px; }
.access-modal { background:var(--s-bg2); border:1px solid var(--s-surface-border); border-radius:16px; padding:28px 24px; max-width:400px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,.45); }
.access-modal-msg { font-size:.9rem; line-height:1.55; color:var(--s-text-muted); margin:0 0 20px; text-align:center; }
.access-modal-form { display:flex; flex-direction:column; gap:14px; }
.access-modal-input { width:100%; padding:12px 14px; font-family:'DM Sans',sans-serif; font-size:.95rem; color:var(--s-text); background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:10px; outline:none; box-sizing:border-box; }
.access-modal-input:focus { border-color:var(--s-accent); box-shadow:0 0 0 2px rgba(52,211,153,.15); }
.access-modal-error { font-size:.8rem; color:#f87171; margin:0; text-align:center; }
.access-modal-submit { width:100%; justify-content:center; margin-top:4px; }

/* Narrative sections */
.landing-section {
  max-width:720px; margin:0 auto;
  padding:72px 48px;
  border-top:1px solid rgba(255,255,255,.06);
}
.landing-section-label {
  font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em;
  color:var(--s-accent); margin-bottom:20px;
}
.landing-section-title {
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.6rem, 3vw, 2.2rem);
  font-weight:400; letter-spacing:-.02em; line-height:1.15;
  color:#E6EDF3; margin-bottom:24px;
}
.landing-section-body { font-size:.975rem; line-height:1.8; color:var(--s-text-muted) }
.landing-section-body p + p { margin-top:16px }
.landing-section-body strong { color:var(--s-text); font-weight:600 }
.landing-section-pull { font-size:1.05rem; font-weight:600; line-height:1.55; color:var(--s-text); margin-top:16px }

/* Comparison diagram */
.landing-compare { margin:36px 0 24px; display:grid; grid-template-columns:1fr 1fr; gap:0; border:1px solid rgba(255,255,255,.08); border-radius:16px; overflow:hidden }
@media (max-width:640px) { .landing-compare { grid-template-columns:1fr } }
.landing-compare-col { padding:24px 28px }
.landing-compare-col:first-child { background:rgba(52,211,153,.04); border-right:1px solid rgba(255,255,255,.06) }
@media (max-width:640px) { .landing-compare-col:first-child { border-right:none; border-bottom:1px solid rgba(255,255,255,.06) } }
.landing-compare-col:last-child { background:rgba(255,255,255,.02) }
.landing-compare-heading { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.14em; margin-bottom:20px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,.06) }
.landing-compare-col:first-child .landing-compare-heading { color:var(--s-accent) }
.landing-compare-col:last-child .landing-compare-heading { color:var(--s-text-muted) }
.landing-compare-row { margin-bottom:16px }
.landing-compare-row:last-child { margin-bottom:0 }
.landing-compare-row-label { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--s-text-muted); margin-bottom:4px; opacity:.7 }
.landing-compare-row-value { font-size:.825rem; line-height:1.55; color:var(--s-text-muted) }
.landing-compare-col:first-child .landing-compare-row-value { color:#c8d5e0 }
.landing-compare-gap { grid-column:1 / -1; padding:16px 28px; background:rgba(52,211,153,.06); border-top:1px solid rgba(52,211,153,.15); text-align:center; font-size:.85rem; font-weight:600; color:var(--s-text); line-height:1.5 }

/* Contrast quote block */
.landing-contrast {
  margin:28px 0;
  padding:24px 28px;
  background:rgba(52,211,153,.06);
  border-left:3px solid var(--s-accent);
  border-radius:0 12px 12px 0;
}
.landing-contrast p { font-size:.925rem; line-height:1.75; color:var(--s-text-muted) }
.landing-contrast p + p { margin-top:10px }
.landing-contrast .not { color:var(--s-text-muted); text-decoration:line-through; text-decoration-color:rgba(255,255,255,.25) }
.landing-contrast .but { color:var(--s-text); font-weight:500 }

/* Split section */
.landing-split-section {
  max-width:1100px; margin:0 auto;
  padding:72px 48px;
  border-top:1px solid rgba(255,255,255,.06);
  display:grid; grid-template-columns:3fr 2fr; gap:64px;
}
@media (max-width:860px) { .landing-split-section { grid-template-columns:1fr; gap:48px } }
.landing-split-left {}
.landing-split-right { display:flex; flex-direction:column; gap:32px }
.landing-split-block {}
.landing-split-block-label {
  font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em;
  color:var(--s-text-muted); margin-bottom:10px;
}
.landing-split-block-title {
  font-family:'DM Serif Display',serif; font-size:1.3rem; font-weight:400;
  color:#E6EDF3; margin-bottom:12px; letter-spacing:-.01em;
}
.landing-split-block-body { font-size:.875rem; line-height:1.75; color:var(--s-text-muted) }
.landing-split-block-body p + p { margin-top:12px }

/* Two outputs */
.landing-outputs { display:flex; flex-direction:column; gap:12px; margin-top:20px }
.landing-output-item {
  padding:16px 18px;
  background:var(--s-surface); border:1px solid var(--s-surface-border);
  border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,.2);
}
.landing-output-item-label {
  font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em;
  margin-bottom:4px;
}
.landing-output-item-label.fn { color:var(--s-accent) }
.landing-output-item-label.form { color:#38bdf8 }
.landing-output-item-desc { font-size:.825rem; line-height:1.55; color:var(--s-text-muted) }

/* Design principle callout */
.landing-principle {
  max-width:720px; margin:0 auto;
  padding:56px 48px;
  border-top:1px solid rgba(255,255,255,.06);
}
.landing-principle-inner {
  padding:32px 36px;
  background:rgba(52,211,153,.06);
  border:1px solid rgba(52,211,153,.2);
  border-radius:18px;
}
.landing-principle-label {
  font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em;
  color:var(--s-accent); margin-bottom:14px;
}
.landing-principle-text { font-size:.925rem; line-height:1.8; color:var(--s-text-muted) }
.landing-principle-text p + p { margin-top:14px }

/* Task cards */
.landing-tasks {
  max-width:1100px; margin:0 auto;
  padding:72px 48px;
  border-top:1px solid rgba(255,255,255,.06);
}
.landing-tasks-label {
  font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em;
  color:var(--s-text-muted); margin-bottom:8px; text-align:center;
}
.landing-tasks-title {
  font-family:'DM Serif Display',serif; font-size:1.8rem; font-weight:400;
  color:var(--s-text); text-align:center; margin-bottom:10px; letter-spacing:-.02em;
}
.landing-tasks-intro {
  font-size:.9rem; color:var(--s-text-muted); text-align:center; margin-bottom:40px; line-height:1.6;
}
.landing-task-grid {
  display:grid; grid-template-columns:repeat(5,1fr); gap:14px;
}
@media (max-width:1000px) { .landing-task-grid { grid-template-columns:1fr 1fr } }
@media (max-width:600px) { .landing-task-grid { grid-template-columns:1fr } }
.landing-task-card {
  background:var(--s-surface); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  border:1px solid var(--s-surface-border); border-radius:16px;
  padding:22px 20px; box-shadow:0 2px 8px rgba(0,0,0,.2);
  transition:box-shadow .2s ease, transform .2s ease;
}
.landing-task-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.3); transform:translateY(-2px) }
.landing-task-num {
  display:inline-flex; align-items:center; justify-content:center;
  width:32px; height:32px; border-radius:9px;
  font-size:.7rem; font-weight:700; margin-bottom:14px;
}
.landing-task-num.t1 { background:rgba(52,211,153,.12); color:var(--s-accent) }
.landing-task-num.t2 { background:rgba(56,189,248,.12); color:#38bdf8 }
.landing-task-num.t3 { background:rgba(248,113,113,.12); color:#f87171 }
.landing-task-num.t4 { background:rgba(167,139,250,.12); color:#a78bfa }
.landing-task-num.t5 { background:rgba(34,211,238,.12); color:#22d3ee }
.landing-task-fn {
  font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em;
  color:var(--s-text-muted); margin-bottom:6px;
}
.landing-task-name {
  font-family:'DM Serif Display',serif; font-size:1rem; font-weight:400;
  color:var(--s-text); margin-bottom:8px; line-height:1.2;
}
.landing-task-desc { font-size:.78rem; line-height:1.6; color:var(--s-text-muted) }

/* Final CTA */
.landing-final-cta {
  border-top:1px solid rgba(255,255,255,.06);
  padding:80px 48px;
  text-align:center;
  background:radial-gradient(ellipse at 50% 100%, rgba(52,211,153,.06) 0%, transparent 60%);
}
.landing-final-cta-title {
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.8rem, 4vw, 2.6rem);
  font-weight:400; letter-spacing:-.03em; line-height:1.15;
  color:var(--s-text); margin-bottom:16px;
}
.landing-final-cta-title em { color:var(--s-accent); font-style:italic }
.landing-final-cta-sub {
  font-size:.95rem; color:var(--s-text-muted); line-height:1.7;
  max-width:540px; margin:0 auto 36px;
}
.landing-footer {
  padding:24px 48px;
  border-top:1px solid rgba(255,255,255,.06);
  display:flex; align-items:center; justify-content:space-between;
}
.landing-footer-logo { font-family:'DM Serif Display',serif; font-size:.9rem; color:var(--s-text-muted) }
.landing-footer-logo em { color:var(--s-accent); font-style:normal }
.landing-footer-note { font-size:.7rem; color:var(--s-text-muted) }

/* ── BRIEFING ─────────────────────────────────────────────────────────── */
.briefing-container { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:40px 20px; background:radial-gradient(ellipse at 20% 50%,rgba(52,211,153,.04) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(56,189,248,.03) 0%,transparent 50%),var(--s-bg) }
.briefing-card { max-width:520px; width:100%; background:var(--s-surface); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid var(--s-surface-border); border-radius:24px; padding:40px 36px; box-shadow:0 20px 60px rgba(0,0,0,.4) }
.briefing-badge { display:inline-flex; align-items:center; gap:6px; font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.14em; color:var(--s-accent); background:var(--s-accent-muted); padding:5px 12px; border-radius:20px }
.briefing-title { font-family:'DM Serif Display',serif; font-size:2rem; font-weight:400; letter-spacing:-.03em; color:var(--s-text); margin-top:16px; line-height:1.15 }
.briefing-title em { color:var(--s-accent); font-style:italic }
.briefing-sub { font-size:.85rem; color:var(--s-text-muted); margin-top:6px }
.briefing-section { margin-top:20px; padding:20px; background:rgba(255,255,255,.03); border-radius:14px; border:1px solid rgba(255,255,255,.04) }
.briefing-section + .briefing-section { margin-top:12px }
.briefing-section h3 { font-size:.75rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--s-text); margin-bottom:8px }
.briefing-section p { font-size:.875rem; line-height:1.65; color:var(--s-text-muted) }
.btn-start { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; margin-top:28px; padding:16px 24px; font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:600; color:white; background:var(--accent); border:none; border-radius:14px; cursor:pointer; transition:all .2s ease; box-shadow:0 4px 14px rgba(45,106,79,.3) }
.btn-start:hover { background:#245a42; transform:translateY(-1px); box-shadow:0 6px 20px rgba(45,106,79,.35) }

/* ── PHONE CHAT ───────────────────────────────────────────────────────── */
.chat-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px 20px; background:radial-gradient(ellipse at 50% 0%,rgba(52,211,153,.06) 0%,transparent 50%),var(--s-bg) }
.phone-frame { width:100%; max-width:420px; height:85vh; max-height:740px; background:var(--chat-bg); border-radius:36px; box-shadow:var(--shadow-xl),0 0 0 1px rgba(0,0,0,.08),inset 0 0 0 1px rgba(255,255,255,.1); display:flex; flex-direction:column; overflow:hidden }
.phone-status-bar { height:44px; background:var(--accent); display:flex; align-items:flex-end; justify-content:center; padding-bottom:4px; flex-shrink:0 }
.phone-notch { width:120px; height:28px; background:#000; border-radius:0 0 18px 18px }
.chat-top-bar { background:var(--accent); padding:10px 16px 12px; display:flex; align-items:center; gap:12px; flex-shrink:0 }
.chat-avatar { width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; font-size:.7rem; font-weight:700; color:white; flex-shrink:0 }
.chat-top-info h2 { font-size:.9rem; font-weight:600; color:white }
.chat-top-info span { font-size:.7rem; color:rgba(255,255,255,.65) }
.chat-top-bar-actions { margin-left:auto; display:flex; align-items:center; gap:8px }
.chat-top-bar-actions .chat-progress-wrap { margin-left:0 }
.chat-progress-wrap { display:flex; flex-direction:column; align-items:flex-end; gap:3px }
.chat-progress-label { font-size:.6rem; color:rgba(255,255,255,.5) }
.chat-progress-bar { width:48px; height:3px; background:rgba(255,255,255,.15); border-radius:2px; overflow:hidden }
.chat-progress-fill { height:100%; background:rgba(255,255,255,.7); border-radius:2px; transition:width .5s ease }
.finish-early-btn {
  font-size: .6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: rgba(255,255,255,.5);
  background: rgba(255,255,255,.1);
  border: none;
  border-radius: 8px;
  padding: 4px 10px;
  cursor: pointer;
  transition: all .2s ease;
  margin-left: 8px;
}
.finish-early-btn:hover {
  color: white;
  background: rgba(255,255,255,.2);
}
.chat-body { flex:1; overflow-y:auto; padding:16px 12px; display:flex; flex-direction:column; gap:3px; background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") }
.chat-body::-webkit-scrollbar { width:4px }
.chat-body::-webkit-scrollbar-thumb { background:rgba(0,0,0,.1); border-radius:2px }
.msg-row { display:flex; align-items:flex-end; gap:6px; max-width:85%; animation:fadeUp .3s ease forwards }
.msg-row.assistant { align-self:flex-start }
.msg-row.user { align-self:flex-end }
.msg-avatar-sm { width:26px; height:26px; border-radius:50%; background:var(--accent); display:flex; align-items:center; justify-content:center; font-size:.5rem; font-weight:700; color:white; flex-shrink:0 }
.msg-bubble { padding:9px 14px; font-size:.875rem; line-height:1.5; border-radius:18px; box-shadow:0 1px 2px rgba(0,0,0,.06) }
.msg-bubble.assistant { background:var(--examiner-bubble); color:var(--ink); border-bottom-left-radius:6px }
.msg-bubble.user { background:var(--candidate-bubble); color:var(--ink); border-bottom-right-radius:6px }
.msg-time { font-size:.6rem; color:rgba(0,0,0,.35); margin-top:3px; text-align:right }
.typing-row { display:flex; align-items:flex-end; gap:6px; align-self:flex-start }
.typing-bubble { background:var(--examiner-bubble); padding:12px 18px; border-radius:18px; border-bottom-left-radius:6px; display:flex; gap:4px; box-shadow:0 1px 2px rgba(0,0,0,.06) }
.typing-bubble .dot { width:7px; height:7px; background:#90a4ae; border-radius:50%; animation:typingDot 1.2s ease infinite }
.typing-bubble .dot:nth-child(2) { animation-delay:.15s }
.typing-bubble .dot:nth-child(3) { animation-delay:.3s }
.chat-input-area { padding:8px 10px; background:#f0f0f0; display:flex; align-items:center; gap:8px; flex-shrink:0; border-top:1px solid rgba(0,0,0,.06) }
.chat-text-input { flex:1; padding:10px 16px; font-family:'DM Sans',sans-serif; font-size:.875rem; background:white; border:none; border-radius:24px; outline:none; color:var(--ink) }
.chat-text-input::placeholder { color:#9ca3af }
.chat-text-input:disabled { opacity:.5; cursor:not-allowed }
.chat-send-btn { width:40px; height:40px; border-radius:50%; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s ease; flex-shrink:0; color:white }
.chat-send-btn:disabled { opacity:.5; cursor:not-allowed }
.phone-home-bar { height:24px; background:#f0f0f0; display:flex; align-items:center; justify-content:center; flex-shrink:0 }
.home-indicator { width:120px; height:4px; background:rgba(0,0,0,.15); border-radius:2px }

/* ── DIAGNOSING ───────────────────────────────────────────────────────── */
.diagnosing-container { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--s-bg) }
.diagnosing-inner { text-align:center }
.diagnosing-inner p { font-size:.9rem; color:var(--s-text-muted); margin-top:16px }

/* ── RESULTS ──────────────────────────────────────────────────────────── */
.results-page { min-height:100vh; background:radial-gradient(ellipse at 20% 10%,rgba(45,106,79,.03) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(30,58,95,.03) 0%,transparent 50%),var(--paper) }
.results-nav { position:sticky; top:0; z-index:50; padding:16px 40px; display:flex; justify-content:space-between; align-items:center; background:rgba(240,236,228,.85); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom:1px solid var(--separator) }
.results-nav-logo { font-family:'DM Serif Display',serif; font-size:1.2rem; color:var(--ink) }
.results-nav-logo em { color:var(--accent); font-style:normal }
.results-nav-tag { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--muted); background:var(--warm); padding:5px 12px; border-radius:16px }
.results-hero { padding:48px 40px 40px; max-width:1280px; margin:0 auto; display:flex; align-items:flex-end; gap:40px; border-bottom:1px solid var(--separator) }
.hero-left { flex:1 }
.hero-eyebrow { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.14em; color:var(--accent) }
.hero-title { font-family:'DM Serif Display',serif; font-size:2.2rem; font-weight:400; letter-spacing:-.03em; color:var(--ink); margin-top:8px; line-height:1.15 }
.hero-title em { color:var(--accent); font-style:italic }
.hero-subtitle { font-size:.9rem; color:var(--muted); margin-top:6px; line-height:1.5 }
.hero-levels { display:flex; gap:20px; align-items:flex-end }
.hero-level-block { text-align:center }
.hero-level-label { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); margin-bottom:6px }
.hero-level-value { font-family:'DM Serif Display',serif; font-size:3rem; font-weight:400; letter-spacing:-.04em; line-height:1; animation:levelReveal .6s ease forwards }
.hero-level-value.function-level { color:var(--accent) }
.hero-level-value.form-level { color:var(--blue) }
.hero-level-divider { width:1px; height:56px; background:var(--separator) }
.results-grid { max-width:1280px; margin:0 auto; padding:32px 40px 40px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px }
@media (max-width:1024px) { .results-grid { grid-template-columns:1fr } .results-hero { flex-direction:column; align-items:flex-start } }
.col-header { margin-bottom:20px }
.col-number { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--muted); margin-bottom:4px }
.col-title { font-family:'DM Serif Display',serif; font-size:1.25rem; font-weight:400; color:var(--ink); letter-spacing:-.02em }
.col-subtitle { font-size:.8rem; color:var(--muted); margin-top:2px }
.glass-card { background:var(--glass); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid var(--glass-border); border-radius:18px; padding:22px; box-shadow:var(--shadow-sm); margin-bottom:14px; transition:box-shadow .2s ease }
.glass-card:hover { box-shadow:var(--shadow-md) }
.glass-card-label { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); margin-bottom:10px }
.summary-stat { display:flex; align-items:baseline; gap:10px; margin-bottom:12px }
.summary-stat-value { font-family:'DM Serif Display',serif; font-size:1.8rem; font-weight:400; color:var(--accent); letter-spacing:-.03em }
.summary-stat-label { font-size:.8rem; color:var(--muted) }
.summary-text { font-size:.85rem; line-height:1.7; color:#4b5563 }
.summary-text strong { color:var(--ink) }
.next-step-box { padding:18px; background:rgba(45,106,79,.06); border-radius:12px; border-left:3px solid var(--accent) }
.next-step-box h4 { font-size:.75rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--accent); margin-bottom:6px }
.next-step-box p { font-size:.825rem; line-height:1.6; color:#4b5563 }
.cluster-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--separator); cursor:pointer }
.cluster-row:last-child { border-bottom:none }
.cluster-pill { font-family:'DM Serif Display',serif; font-size:.85rem; padding:3px 12px; border-radius:8px; min-width:48px; text-align:center }
.cluster-pill.confirmed { background:var(--can-light); color:var(--can) }
.cluster-pill.unconfirmed { background:var(--not-tested-light); color:var(--not-tested) }
.cluster-info { flex:1 }
.cluster-info-status { font-size:.8rem; font-weight:600; color:var(--ink) }
.cluster-info-threshold { font-size:.7rem; color:var(--muted) }
.cluster-chevron { font-size:.6rem; color:var(--muted); transition:transform .2s ease }
.cluster-chevron.open { transform:rotate(180deg) }
.macro-list { padding:10px 0 4px }
.macro-item { padding:10px 0; border-bottom:1px solid rgba(0,0,0,.03) }
.macro-item:last-child { border-bottom:none }
.macro-top-row { display:flex; align-items:flex-start; gap:8px }
.verdict-tag { font-size:.55rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:2px 8px; border-radius:5px; flex-shrink:0; margin-top:2px }
.verdict-tag.can { background:var(--can-light); color:var(--can) }
.verdict-tag.not-yet { background:var(--not-yet-light); color:var(--not-yet) }
.verdict-tag.not-tested { background:var(--not-tested-light); color:var(--not-tested) }
.macro-claim-text { font-size:.8rem; font-weight:500; color:var(--ink); line-height:1.4 }
.macro-meta { display:flex; justify-content:space-between; margin-top:3px }
.macro-fn-tag { font-size:.65rem; color:var(--muted) }
.macro-id-tag { font-size:.6rem; font-family:ui-monospace,'SF Mono',monospace; color:var(--muted) }
.macro-rationale { font-size:.75rem; color:#4b5563; margin-top:6px; line-height:1.5 }
.macro-evidence { font-size:.725rem; color:var(--muted); font-style:italic; margin-top:3px; line-height:1.5 }
.form-overall { text-align:center; padding:8px 0 16px; border-bottom:1px solid var(--separator); margin-bottom:16px }
.form-overall-level { font-family:'DM Serif Display',serif; font-size:2.4rem; font-weight:400; color:var(--blue); letter-spacing:-.03em }
.form-overall-summary { font-size:.825rem; color:#4b5563; line-height:1.6; margin-top:6px }
.form-dimension { padding:14px 0; border-bottom:1px solid var(--separator) }
.form-dimension:last-child { border-bottom:none }
.form-dim-header { display:flex; align-items:center; justify-content:space-between }
.form-dim-name { font-size:.8rem; font-weight:600; color:var(--ink) }
.form-dim-level { font-size:.7rem; font-weight:700; color:var(--blue); background:var(--blue-light); padding:2px 10px; border-radius:6px }
.form-dim-bar-track { height:4px; background:rgba(0,0,0,.05); border-radius:2px; margin-top:8px; overflow:hidden }
.form-dim-bar-fill { height:100%; border-radius:2px; animation:barGrow .8s ease forwards }
.form-dim-descriptor { font-size:.775rem; color:#4b5563; margin-top:8px; line-height:1.5 }
.form-dim-example { font-size:.725rem; color:var(--muted); font-style:italic; margin-top:3px; line-height:1.4 }
.transcript-section { max-width:1280px; margin:0 auto; padding:0 40px 40px }
.transcript-card { background:var(--glass); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:1px solid var(--glass-border); border-radius:18px; box-shadow:var(--shadow-sm); overflow:hidden }
.transcript-toggle { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; cursor:pointer; background:none; border:none; width:100%; font-family:'DM Sans',sans-serif }
.transcript-toggle h3 { font-size:.85rem; font-weight:600; color:var(--ink) }
.transcript-body { padding:0 22px 18px; border-top:1px solid var(--separator) }
.transcript-msg { padding:10px 0; border-bottom:1px solid var(--separator); display:flex; gap:10px; align-items:flex-start }
.transcript-msg:last-child { border-bottom:none }
.transcript-role { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; min-width:24px; padding-top:2px }
.transcript-role.ai { color:var(--accent) }
.transcript-role.you { color:var(--blue) }
.transcript-text { font-size:.8rem; line-height:1.55; color:#374151 }
.writing-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px 20px; background:radial-gradient(ellipse at 50% 30%,rgba(56,189,248,.06) 0%,transparent 50%),var(--s-bg) }
.writing-frame { width:100%; max-width:680px }
.writing-prompt-card { background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid var(--glass-border); border-radius:20px; padding:32px; box-shadow:var(--shadow-lg); margin-bottom:20px }
.writing-prompt-tag { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--blue); background:var(--blue-light); padding:4px 10px; border-radius:12px; display:inline-block; margin-bottom:12px }
.writing-prompt-title { font-family:'DM Serif Display',serif; font-size:1.5rem; font-weight:400; color:var(--ink); margin-bottom:8px }
.writing-prompt-text { font-size:.9rem; line-height:1.6; color:#4b5563 }
.writing-word-guide { display:inline-flex; align-items:center; gap:6px; font-size:.75rem; color:var(--muted); margin-top:12px; padding:6px 12px; background:rgba(0,0,0,.03); border-radius:8px }
.writing-textarea-wrap { background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid var(--glass-border); border-radius:20px; box-shadow:var(--shadow-lg); overflow:hidden }
.writing-textarea { width:100%; min-height:180px; max-height:400px; padding:28px; font-family:'DM Sans',sans-serif; font-size:.925rem; line-height:1.8; color:var(--ink); background:transparent; border:none; outline:none; resize:none; overflow-y:auto; transition:border-color .2s ease; field-sizing:content }
.writing-textarea::placeholder { color:#9ca3af }
.writing-footer { display:flex; align-items:center; justify-content:space-between; padding:12px 28px 16px; border-top:1px solid var(--separator) }
.writing-word-count { font-size:.75rem; color:var(--muted) }
.writing-submit-btn { padding:10px 24px; font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:600; color:white; background:var(--accent); border:none; border-radius:12px; cursor:pointer; transition:all .2s ease }
.writing-submit-btn:hover { background:#245a42; transform:translateY(-1px) }
.writing-submit-btn:disabled { opacity:.5; cursor:not-allowed; transform:none }
.results-continue { max-width:1280px; margin:0 auto; padding:0 40px 60px }
.btn-continue { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:18px 24px; font-family:'DM Sans',sans-serif; font-size:1rem; font-weight:600; color:white; background:var(--blue); border:none; border-radius:16px; cursor:pointer; transition:all .2s ease; box-shadow:0 4px 14px rgba(30,58,95,.3) }
.btn-continue:hover { background:#162e4a; transform:translateY(-1px) }
.scaffolding-notice { text-align:center; padding:8px; font-size:.65rem; font-weight:600; text-transform:uppercase; letter-spacing:.1em; color:var(--amber); background:var(--amber-light); flex-shrink:0 }
.stakeholder-theme .briefing-container { background:radial-gradient(ellipse at 20% 50%,rgba(52,211,153,.04) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(56,189,248,.03) 0%,transparent 50%),var(--s-bg) }
.stakeholder-theme .briefing-card { background:var(--s-surface); border-color:var(--s-surface-border); box-shadow:0 20px 60px rgba(0,0,0,.4) }
.stakeholder-theme .briefing-badge { background:var(--s-accent-muted); color:var(--s-accent) }
.stakeholder-theme .briefing-title { color:var(--s-text) }
.stakeholder-theme .briefing-title em { color:var(--s-accent) }
.stakeholder-theme .briefing-sub { color:var(--s-text-muted) }
.stakeholder-theme .briefing-section { background:rgba(255,255,255,.03); border-color:rgba(255,255,255,.04) }
.stakeholder-theme .briefing-section h3 { color:var(--s-text) }
.stakeholder-theme .briefing-section p { color:var(--s-text-muted) }
.stakeholder-theme .btn-start { background:var(--s-accent); color:#0f172a; box-shadow:0 4px 14px rgba(52,211,153,.25) }
.stakeholder-theme .btn-start:hover { background:#2dd4a8 }
.stakeholder-theme .results-page { background:radial-gradient(ellipse at 20% 10%,rgba(52,211,153,.03) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(56,189,248,.03) 0%,transparent 50%),var(--s-bg) }
.stakeholder-theme .results-nav { background:rgba(15,23,42,.85); border-bottom-color:rgba(255,255,255,.06) }
.stakeholder-theme .results-nav-logo { color:var(--s-text) }
.stakeholder-theme .results-nav-logo em { color:var(--s-accent) }
.stakeholder-theme .results-nav-tag { color:var(--s-text-muted); background:rgba(255,255,255,.06) }
.stakeholder-theme .results-hero { border-bottom-color:rgba(255,255,255,.06) }
.stakeholder-theme .hero-eyebrow { color:var(--s-accent) }
.stakeholder-theme .hero-title { color:var(--s-text) }
.stakeholder-theme .hero-title em { color:var(--s-accent) }
.stakeholder-theme .hero-subtitle { color:var(--s-text-muted) }
.stakeholder-theme .hero-level-label { color:var(--s-text-muted) }
.stakeholder-theme .hero-level-value.function-level { color:var(--s-accent) }
.stakeholder-theme .hero-level-value.form-level { color:#38bdf8 }
.stakeholder-theme .hero-level-divider { background:rgba(255,255,255,.08) }
.stakeholder-theme .col-number { color:var(--s-text-muted) }
.stakeholder-theme .col-title { color:var(--s-text) }
.stakeholder-theme .col-subtitle { color:var(--s-text-muted) }
.stakeholder-theme .glass-card { background:var(--s-surface); border-color:var(--s-surface-border); box-shadow:0 2px 8px rgba(0,0,0,.2) }
.stakeholder-theme .glass-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.3) }
.stakeholder-theme .glass-card-label { color:var(--s-text-muted) }
.stakeholder-theme .summary-stat-value { color:var(--s-accent) }
.stakeholder-theme .summary-stat-label { color:var(--s-text-muted) }
.stakeholder-theme .summary-text { color:var(--s-text-muted) }
.stakeholder-theme .summary-text strong { color:var(--s-text) }
.stakeholder-theme .cluster-row { border-bottom-color:rgba(255,255,255,.04) }
.stakeholder-theme .cluster-info-status { color:var(--s-text) }
.stakeholder-theme .cluster-info-threshold { color:var(--s-text-muted) }
.stakeholder-theme .cluster-chevron { color:var(--s-text-muted) }
.stakeholder-theme .macro-item { border-bottom-color:rgba(255,255,255,.03) }
.stakeholder-theme .macro-claim-text { color:var(--s-text) }
.stakeholder-theme .macro-fn-tag { color:var(--s-text-muted) }
.stakeholder-theme .macro-id-tag { color:var(--s-text-muted) }
.stakeholder-theme .macro-rationale { color:var(--s-text-muted) }
.stakeholder-theme .macro-evidence { color:#64748b }
.stakeholder-theme .form-overall-level { color:#38bdf8 }
.stakeholder-theme .form-overall-summary { color:var(--s-text-muted) }
.stakeholder-theme .form-dim-name { color:var(--s-text) }
.stakeholder-theme .form-dim-level { color:#38bdf8; background:rgba(56,189,248,.1) }
.stakeholder-theme .form-dim-bar-track { background:rgba(255,255,255,.05) }
.stakeholder-theme .form-dimension { border-bottom-color:rgba(255,255,255,.04) }
.stakeholder-theme .form-dim-descriptor { color:var(--s-text-muted) }
.stakeholder-theme .form-dim-example { color:#64748b }
.stakeholder-theme .transcript-card { background:var(--s-surface); border-color:var(--s-surface-border) }
.stakeholder-theme .transcript-toggle h3 { color:var(--s-text) }
.stakeholder-theme .transcript-body { border-top-color:rgba(255,255,255,.04) }
.stakeholder-theme .transcript-msg { border-bottom-color:rgba(255,255,255,.04) }
.stakeholder-theme .transcript-text { color:var(--s-text-muted) }
.stakeholder-theme .next-step-box { background:rgba(52,211,153,.06); border-left-color:var(--s-accent) }
.stakeholder-theme .next-step-box h4 { color:var(--s-accent) }
.stakeholder-theme .next-step-box p { color:var(--s-text-muted) }
.stakeholder-theme .btn-continue { background:var(--s-accent); color:#0f172a; box-shadow:0 4px 14px rgba(52,211,153,.2) }
.stakeholder-theme .btn-continue:hover { background:#2dd4a8 }
.topic-page { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px 20px; background:radial-gradient(ellipse at 50% 30%,rgba(248,113,113,.06) 0%,transparent 50%),var(--s-bg) }
.topic-frame { max-width:480px; width:100%; text-align:center }
.topic-frame h2 { font-family:'DM Serif Display',serif; font-size:1.6rem; font-weight:400; color:var(--ink); margin-bottom:6px }
.topic-frame p { font-size:.85rem; color:var(--muted); margin-bottom:24px }
.topic-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px }
.topic-btn { padding:20px 16px; background:var(--glass); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border:2px solid rgba(0,0,0,.06); border-radius:16px; font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:600; color:var(--ink); cursor:pointer; transition:all .2s ease; text-align:center }
.topic-btn:hover { border-color:var(--coral); color:var(--coral); transform:translateY(-2px); box-shadow:var(--shadow-md) }
.debate-accent .chat-top-bar { background:var(--coral) }
.debate-accent .chat-avatar { background:rgba(255,255,255,.2) }
.debate-accent .msg-avatar-sm { background:var(--coral) }
.debate-accent .chat-send-btn { background:var(--coral) !important }
.challenge-page { min-height:100vh; padding:40px 20px 80px; background:radial-gradient(ellipse at 50% 20%,rgba(167,139,250,.08) 0%,transparent 50%),var(--s-bg) }
.challenge-header { text-align:center; max-width:640px; margin:0 auto 32px }
.challenge-header h2 { font-family:'DM Serif Display',serif; font-size:1.6rem; font-weight:400; color:rgba(255,255,255,.9) }
.challenge-header p { font-size:.85rem; color:rgba(255,255,255,.55); margin-top:6px }
.challenge-progress { display:flex; gap:8px; justify-content:center; margin-top:16px }
.challenge-dot { width:10px; height:10px; border-radius:50%; background:rgba(0,0,0,.08); transition:all .3s ease }
.challenge-dot.active { background:#7c3aed; transform:scale(1.3) }
.challenge-dot.done { background:#a78bfa }
.challenge-card { max-width:640px; margin:0 auto; background:var(--glass); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid var(--glass-border); border-radius:20px; box-shadow:var(--shadow-lg); overflow:visible; animation:fadeUp .4s ease forwards }
.challenge-type-tag { display:inline-flex; align-items:center; gap:6px; font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; padding:5px 12px; border-radius:12px; margin-bottom:12px }
.challenge-type-tag.simplify { background:rgba(16,185,129,.1); color:#059669 }
.challenge-type-tag.formalise { background:rgba(59,130,246,.1); color:#2563eb }
.challenge-type-tag.audience { background:rgba(245,158,11,.1); color:#d97706 }
.challenge-type-tag.tone { background:rgba(147,51,234,.1); color:#7c3aed }
.challenge-stimulus-area { padding:28px; border-bottom:1px solid var(--separator) }
.challenge-instruction { font-size:.95rem; font-weight:600; color:var(--ink); margin-bottom:16px }
.challenge-stimulus-box { padding:16px 20px; background:rgba(0,0,0,.03); border-radius:12px; border-left:3px solid #7c3aed }
.challenge-stimulus-label { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); margin-bottom:6px }
.challenge-stimulus-text { font-size:.875rem; line-height:1.7; color:#374151; font-style:italic }
.challenge-response-area { padding:28px }
.challenge-response-label { font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); margin-bottom:8px }
.challenge-textarea { width:100%; min-height:120px; max-height:400px; padding:16px; font-family:'DM Sans',sans-serif; font-size:.9rem; line-height:1.7; color:var(--ink); background:rgba(0,0,0,.02); border:1px solid rgba(0,0,0,.06); border-radius:12px; outline:none; resize:none; overflow-y:auto; transition:border-color .2s ease; field-sizing:content }
.challenge-textarea:focus { border-color:#7c3aed }
.challenge-textarea::placeholder { color:#9ca3af }
.challenge-nav { display:flex; justify-content:space-between; padding:0 28px 28px }
.challenge-nav-btn { padding:10px 20px; font-family:'DM Sans',sans-serif; font-size:.85rem; font-weight:600; border:none; border-radius:12px; cursor:pointer; transition:all .2s ease }
.challenge-nav-btn.secondary { background:rgba(0,0,0,.05); color:var(--ink) }
.challenge-nav-btn.secondary:hover { background:rgba(0,0,0,.08) }
.challenge-nav-btn.primary { background:#7c3aed; color:white; box-shadow:0 4px 14px rgba(124,58,234,.25) }
.challenge-nav-btn.primary:hover { background:#6d28d9; transform:translateY(-1px) }
.challenge-nav-btn:disabled { opacity:.4; cursor:not-allowed; transform:none }
.t5-split { display:flex; flex-direction:column; min-height:100vh; background:var(--paper) }
.t5-cards-bar { flex-shrink:0; padding:12px 16px; display:flex; gap:12px; justify-content:center; background:rgba(255,255,255,.6); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border-bottom:1px solid var(--separator); overflow-x:auto }
.t5-card { flex:0 0 280px; padding:16px; border-radius:14px; border:1px solid rgba(0,0,0,.06); background:white; box-shadow:0 2px 8px rgba(0,0,0,.04) }
.t5-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px }
.t5-card-name { font-family:'DM Serif Display',serif; font-size:1rem; font-weight:400; color:var(--ink) }
.t5-card-stars { color:#f59e0b; font-size:.75rem; letter-spacing:1px }
.t5-card-tagline { font-size:.7rem; color:var(--muted); margin-bottom:10px; font-style:italic }
.t5-card-price { font-family:'DM Serif Display',serif; font-size:1.3rem; color:var(--ink); margin-bottom:2px }
.t5-card-price-note { font-size:.65rem; color:var(--muted); margin-bottom:10px }
.t5-card-features { display:flex; flex-direction:column; gap:5px }
.t5-card-feature { display:flex; align-items:center; gap:8px; font-size:.75rem; color:#4b5563 }
.t5-card-feature-icon { width:18px; text-align:center; flex-shrink:0 }
.t5-card-feature-label { font-weight:600; min-width:60px }
.t5-card-highlight { margin-top:10px; padding:6px 10px; background:rgba(52,211,153,.08); border-radius:8px; font-size:.7rem; font-weight:600; color:#059669; text-align:center }
.t5-chat-area { flex:1; display:flex; flex-direction:column; max-width:420px; margin:0 auto; width:100% }
@media (min-width:900px) { .t5-split { flex-direction:row } .t5-cards-bar { flex-direction:column; width:320px; border-bottom:none; border-right:1px solid var(--separator); padding:20px 16px; overflow-y:auto } .t5-card { flex:0 0 auto } .t5-chat-area { max-width:none; flex:1 } }
.t5-accent .chat-top-bar { background:#0891b2 }
.t5-accent .chat-avatar { background:rgba(255,255,255,.2) }
.t5-accent .msg-avatar-sm { background:#0891b2 }
.t5-accent .chat-send-btn { background:#0891b2 !important }
.report-page { min-height:100vh; background:radial-gradient(ellipse at 20% 10%,rgba(52,211,153,.03) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(56,189,248,.03) 0%,transparent 50%),var(--s-bg); padding:0 }
.report-nav { position:sticky; top:0; z-index:50; display:flex; align-items:center; justify-content:space-between; padding:14px 32px; background:rgba(15,23,42,.92); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom:1px solid rgba(255,255,255,.06) }
.report-nav-logo { font-family:'DM Serif Display',serif; font-size:1rem; color:var(--s-text) }
.report-nav-logo em { color:var(--s-accent); font-style:normal }
.report-nav-tag { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text-muted); background:rgba(255,255,255,.06); padding:4px 10px; border-radius:10px }
.final-report-hero { border-bottom:1px solid rgba(255,255,255,.06); padding:40px 32px 48px }
.final-report-hero-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center }
@media (max-width:900px) { .final-report-hero-inner { grid-template-columns:1fr; gap:32px } }
.final-report-hero-left { text-align:left }
.final-report-eyebrow { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em; color:var(--s-accent); margin-bottom:10px }
.final-report-title { font-family:'DM Serif Display',serif; font-size:clamp(1.85rem, 4vw, 2.75rem); font-weight:400; color:var(--s-text); letter-spacing:-.03em; line-height:1.1 }
.final-report-title em { color:var(--s-accent); font-style:italic }
.final-report-sub { font-size:.9rem; color:var(--s-text-muted); margin-top:12px; line-height:1.55; max-width:520px }
.final-report-hero-metrics { display:flex; gap:24px; flex-wrap:wrap; justify-content:flex-end }
@media (max-width:900px) { .final-report-hero-metrics { justify-content:flex-start } }
.final-report-metric { text-align:right; min-width:140px }
@media (max-width:900px) { .final-report-metric { text-align:left } }
.final-report-metric-label { font-size:.55rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text-muted); margin-bottom:6px }
.final-report-metric-value { font-family:'DM Serif Display',serif; font-size:2.25rem; font-weight:400; line-height:1 }
.final-report-metric-value.fn { color:var(--s-accent) }
.final-report-metric-value.form { color:#38bdf8 }
.final-report-metric-soft { font-size:.75rem; color:var(--s-text-muted); margin-top:6px }
.final-report-body { max-width:1200px; margin:0 auto; padding:36px 32px 64px; display:grid; grid-template-columns:60fr 40fr; gap:40px; align-items:start }
@media (max-width:960px) { .final-report-body { grid-template-columns:1fr } }
.final-report-section { margin-bottom:36px }
.final-report-section:last-child { margin-bottom:0 }
.final-report-section-title { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.14em; color:var(--s-text-muted); margin-bottom:16px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,.06) }
.final-report-bar-row { display:grid; grid-template-columns:minmax(100px, 1.1fr) 72px 1fr 44px; gap:10px; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.04) }
.final-report-bar-row:last-child { border-bottom:none }
@media (max-width:600px) { .final-report-bar-row { grid-template-columns:1fr; gap:6px } }
.final-report-bar-name { font-size:.8rem; font-weight:600; color:var(--s-text) }
.final-report-bar-src { font-size:.65rem; color:var(--s-text-muted); white-space:nowrap }
.final-report-bar-track { height:6px; background:rgba(255,255,255,.06); border-radius:3px; overflow:hidden; min-width:0 }
.final-report-bar-fill { height:100%; border-radius:3px; transition:width .5s ease }
.final-report-bar-level { font-size:.72rem; font-weight:700; text-align:right; color:var(--s-text) }
.final-report-improve-item { display:flex; align-items:flex-start; gap:10px; font-size:.825rem; color:var(--s-text-muted); line-height:1.55; margin-bottom:10px }
.final-report-improve-item::before { content:'→'; color:var(--s-accent); flex-shrink:0; font-weight:600 }
.final-report-task { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:14px; padding:16px 18px; margin-bottom:14px }
.final-report-task:last-child { margin-bottom:0 }
.final-report-task-label { font-size:.75rem; font-weight:600; color:var(--s-text); margin-bottom:10px }
.final-report-task-fn { display:flex; justify-content:space-between; align-items:baseline; gap:12px; font-size:.72rem; padding:6px 0; border-bottom:1px solid rgba(255,255,255,.04) }
.final-report-task-fn:last-child { border-bottom:none }
.final-report-task-fn-name { color:var(--s-text-muted) }
.final-report-task-fn-lvl { font-family:'DM Serif Display',serif; font-size:.85rem; font-weight:400 }

/* ── Split Briefing ──────────────────────────────────────────────────────── */
.split-briefing-container { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:32px 24px; background:radial-gradient(ellipse at 20% 50%,rgba(52,211,153,.04) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(56,189,248,.03) 0%,transparent 50%),var(--s-bg) }
.split-briefing-inner { display:grid; grid-template-columns:65fr 35fr; gap:16px; max-width:1100px; width:100%; align-items:start }
@media (max-width:860px) { .split-briefing-inner { grid-template-columns:1fr } }
.sb-left { background:var(--s-surface); border:1px solid var(--s-surface-border); border-radius:20px; padding:36px 32px; box-shadow:0 20px 60px rgba(0,0,0,.3) }
.sb-badge { display:inline-flex; align-items:center; gap:6px; font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.14em; color:var(--s-accent); background:var(--s-accent-muted); padding:5px 12px; border-radius:20px; margin-bottom:18px }
.sb-title { font-family:'DM Serif Display',serif; font-size:2.2rem; font-weight:400; letter-spacing:-.03em; line-height:1.1; color:var(--s-text); margin-bottom:6px }
.sb-title em { color:var(--s-accent); font-style:italic }
.sb-subtitle { font-size:.85rem; color:var(--s-text-muted); margin-bottom:28px }
.sb-section { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); border-radius:14px; padding:20px; margin-bottom:12px }
.sb-section-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text); margin-bottom:10px }
.sb-section-body { font-size:.875rem; line-height:1.7; color:var(--s-text-muted) }
.sb-section-body ul { margin-top:8px; padding-left:16px; display:flex; flex-direction:column; gap:4px }
.sb-reassurance { font-size:.8rem; color:var(--s-text-muted); text-align:center; margin:20px 0 24px; padding:12px 16px; border-radius:10px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05); font-style:italic }
.sb-start-btn { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; padding:18px 24px; font-family:'DM Sans',sans-serif; font-size:1rem; font-weight:600; color:#0f172a; background:var(--s-accent); border:none; border-radius:14px; cursor:pointer; transition:all .2s ease; box-shadow:0 4px 20px rgba(52,211,153,.25) }
.sb-start-btn:hover { background:#2dd4a8; transform:translateY(-1px) }
.sb-right { background:rgba(15,23,42,.7); border:1px solid rgba(255,255,255,.05); border-radius:20px; padding:28px 24px; box-shadow:0 8px 32px rgba(0,0,0,.2) }
.sb-right-label { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em; color:var(--s-text-muted); padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,.06); margin-bottom:16px }
.sb-right-section { margin-bottom:16px }
.sb-right-section:last-child { margin-bottom:0 }
.sb-right-section-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--s-accent); margin-bottom:6px }
.sb-right-section-body { font-size:.775rem; line-height:1.65; color:var(--s-text-muted) }
.sb-right-section-body ul { margin-top:6px; padding-left:14px; display:flex; flex-direction:column; gap:3px }
.sb-verdict-row { display:flex; flex-direction:column; gap:6px; margin-top:8px }
.sb-verdict { display:flex; align-items:center; gap:8px; font-size:.75rem; color:var(--s-text-muted) }
.sb-verdict-tag { font-size:.55rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:2px 8px; border-radius:5px; flex-shrink:0 }
.sb-verdict-tag.can { background:var(--can-light); color:var(--can) }
.sb-verdict-tag.not-yet { background:var(--not-yet-light); color:var(--not-yet) }

.split-briefing-task2 { --s-accent:#34d399; --s-accent-muted:rgba(52,211,153,.15) }
.split-briefing-task2 .sb-start-btn { box-shadow:0 4px 20px rgba(52,211,153,.25) }
.split-briefing-task2 .sb-start-btn:hover { background:#2dd4a8 }
.split-briefing-task3 { --s-accent:#c44536; --s-accent-muted:rgba(196,69,54,.15) }
.split-briefing-task3 .sb-start-btn { box-shadow:0 4px 20px rgba(196,69,54,.25) }
.split-briefing-task3 .sb-start-btn:hover { background:#d4655a }
.split-briefing-task4 { --s-accent:#7c3aed; --s-accent-muted:rgba(124,58,234,.15) }
.split-briefing-task4 .sb-start-btn { box-shadow:0 4px 20px rgba(124,58,234,.25) }
.split-briefing-task4 .sb-start-btn:hover { background:#8b5cf6 }
.split-briefing-task5 { --s-accent:#0891b2; --s-accent-muted:rgba(8,145,178,.15) }
.split-briefing-task5 .sb-start-btn { box-shadow:0 4px 20px rgba(8,145,178,.25) }
.split-briefing-task5 .sb-start-btn:hover { background:#06b6d4 }

.skip-task-float {
  position:fixed; bottom:24px; right:24px; z-index:9999;
  padding:10px 18px; font-family:'DM Sans',sans-serif; font-size:.75rem; font-weight:600;
  color:var(--s-text-muted); background:rgba(15,23,42,.92);
  border:1px solid rgba(255,255,255,.1); border-radius:10px;
  cursor:pointer; transition:all .2s ease;
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  box-shadow:0 4px 16px rgba(0,0,0,.3);
}
.skip-task-float:hover { color:var(--s-text); border-color:rgba(255,255,255,.2); background:rgba(15,23,42,.97) }
.skip-task-btn {
  display: block;
  text-align: center;
  margin-top: 12px;
  font-size: .75rem;
  color: var(--s-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  opacity: 0.6;
  transition: opacity .2s ease;
}
.skip-task-btn:hover { opacity: 1; }

/* ── Results: new split layout ───────────────────────────────────────────── */
.results-page { min-height:100vh; background:radial-gradient(ellipse at 20% 10%,rgba(52,211,153,.03) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(56,189,248,.03) 0%,transparent 50%),var(--s-bg) }
.results-nav { position:sticky; top:0; z-index:50; padding:14px 32px; display:flex; justify-content:space-between; align-items:center; background:rgba(15,23,42,.92); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-bottom:1px solid rgba(255,255,255,.06) }
.results-nav-logo { font-family:'DM Serif Display',serif; font-size:1.1rem; color:var(--s-text) }
.results-nav-logo em { color:var(--s-accent); font-style:normal }
.results-nav-tag { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text-muted); background:rgba(255,255,255,.06); padding:4px 10px; border-radius:10px }
.results-hero-new { padding:36px 40px 28px; border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; gap:32px; flex-wrap:wrap }
.results-hero-task { flex:1; min-width:200px }
.results-hero-eyebrow { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em; color:var(--s-accent); margin-bottom:6px }
.results-hero-title { font-family:'DM Serif Display',serif; font-size:1.8rem; font-weight:400; color:var(--s-text); letter-spacing:-.02em; line-height:1.1 }
.results-hero-title em { color:var(--s-accent); font-style:italic }
.results-score-block { display:flex; align-items:center; gap:24px; flex-shrink:0 }
.results-score-item { text-align:center }
.results-score-label { font-size:.55rem; font-weight:700; text-transform:uppercase; letter-spacing:.14em; color:var(--s-text-muted); margin-bottom:4px }
.results-score-value { font-family:'DM Serif Display',serif; font-size:2.8rem; font-weight:400; letter-spacing:-.04em; line-height:1 }
.results-score-value.fn { color:var(--s-accent) }
.results-score-value.form { color:#38bdf8 }
.results-score-value.num { color:#fbbf24; font-size:2.2rem }
.results-score-sub { font-size:.65rem; color:var(--s-text-muted); margin-top:3px }
.results-score-divider { width:1px; height:48px; background:rgba(255,255,255,.08) }
.results-summary-text { font-size:.875rem; line-height:1.7; color:var(--s-text-muted); max-width:420px; margin-top:10px }
.results-summary-text strong { color:var(--s-text) }
.results-split { display:grid; grid-template-columns:67fr 33fr; gap:0; min-height:calc(100vh - 160px) }
@media (max-width:1024px) { .results-split { grid-template-columns:1fr } }
.results-left { padding:32px 40px 48px; border-right:1px solid rgba(255,255,255,.06) }
.results-section { margin-bottom:32px }
.results-section-title { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.16em; color:var(--s-text-muted); margin-bottom:16px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,.06) }
.learner-can-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px }
.learner-can-grid--multi { grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)) }
@media (max-width:700px) { .learner-can-grid, .learner-can-grid--multi { grid-template-columns:1fr } }
.learner-can-group { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); border-radius:14px; padding:16px }
.learner-can-group-title { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-text-muted); margin-bottom:12px }
.learner-can-list { list-style:none; margin:0; padding:0 }
.learner-can-item { position:relative; padding:6px 0 6px 14px; font-size:.8rem; color:var(--s-text-muted); line-height:1.45 }
.learner-can-item::before { content:''; position:absolute; left:0; top:.85em; width:5px; height:5px; border-radius:50%; background:var(--s-accent); opacity:.85 }
.form-dim-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,.04) }
.form-dim-row:last-child { border-bottom:none }
.form-dim-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:16px 18px; margin-bottom:14px }
.form-dim-card:last-child { margin-bottom:0 }
.form-dim-card-header { display:flex; align-items:center; gap:12px }
.form-dim-name-new { flex:1; font-size:.8rem; font-weight:600; color:var(--s-text) }
.form-dim-desc-new { font-size:.775rem; color:var(--s-text-muted); line-height:1.5; margin-top:8px }
.form-dim-bar-new { flex:0 0 80px; height:4px; background:rgba(255,255,255,.06); border-radius:2px; overflow:hidden }
.form-dim-bar-fill-new { height:100%; border-radius:2px; animation:barGrow .8s ease forwards }
.form-dim-level-new { font-size:.7rem; font-weight:700; padding:2px 8px; border-radius:6px; background:rgba(56,189,248,.1); color:#38bdf8; min-width:36px; text-align:center; flex-shrink:0 }
.form-dim-meaning { font-size:.75rem; color:#94a3b8; margin-top:10px; line-height:1.5; font-style:italic }
.form-dim-evidence { font-size:.725rem; color:#64748b; margin-top:8px; line-height:1.5 }
.form-dim-evidence-label { font-weight:600; color:#94a3b8 }
.form-dim-evidence-quote { font-style:italic }
.form-dim-focus { font-size:.775rem; color:var(--s-accent); margin-top:10px; line-height:1.5; padding-top:8px; border-top:1px solid rgba(255,255,255,.04) }
.form-dim-outliers { font-size:.725rem; color:#fbbf24; margin-top:8px; line-height:1.5 }
.form-dim-outliers-label { font-weight:600 }
.form-dim-outliers-quote { font-style:italic }
.form-dim-vocab-split { display:flex; gap:16px; margin-top:10px; padding:10px 14px; background:rgba(56,189,248,.04); border:1px solid rgba(56,189,248,.1); border-radius:8px }
.form-dim-vocab-metric { flex:1 }
.form-dim-vocab-metric-label { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--s-text-muted); margin-bottom:2px }
.form-dim-vocab-metric-value { font-size:.825rem; font-weight:600; color:var(--s-text) }
.form-dim-vocab-metric-value.reaching { color:#fbbf24 }
.next-steps-list { display:flex; flex-direction:column; gap:8px }
.next-step-item { display:flex; align-items:flex-start; gap:10px; padding:10px 14px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05); border-radius:10px; font-size:.825rem; color:var(--s-text-muted); line-height:1.5 }
.next-step-item::before { content:'→'; color:var(--s-accent); font-weight:700; flex-shrink:0; margin-top:1px }
.results-right { padding:28px 28px 48px; background:rgba(15,23,42,.4) }
.results-right-label { font-size:.55rem; font-weight:700; text-transform:uppercase; letter-spacing:.18em; color:var(--s-text-muted); margin-bottom:20px; padding-bottom:10px; border-bottom:1px solid rgba(255,255,255,.06) }
.stk-section { margin-bottom:20px }
.stk-section-title { font-size:.6rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--s-accent); margin-bottom:10px }
.stk-cluster-row { display:flex; align-items:center; gap:8px; padding:7px 0; border-bottom:1px solid rgba(255,255,255,.03); cursor:pointer }
.stk-cluster-row:last-child { border-bottom:none }
.stk-cluster-pill { font-family:'DM Serif Display',serif; font-size:.75rem; padding:2px 10px; border-radius:6px; min-width:40px; text-align:center; flex-shrink:0 }
.stk-cluster-pill.confirmed { background:rgba(45,106,79,.2); color:var(--s-accent) }
.stk-cluster-pill.unconfirmed { background:rgba(156,163,175,.1); color:var(--s-text-muted) }
.stk-cluster-info { flex:1 }
.stk-cluster-status { font-size:.72rem; font-weight:600; color:var(--s-text) }
.stk-cluster-threshold { font-size:.65rem; color:var(--s-text-muted) }
.stk-chevron { font-size:.55rem; color:var(--s-text-muted); transition:transform .2s ease }
.stk-chevron.open { transform:rotate(180deg) }
.stk-macro-list { padding:6px 0 2px }
.stk-macro-item { padding:8px 0; border-bottom:1px solid rgba(255,255,255,.02) }
.stk-macro-item:last-child { border-bottom:none }
.stk-macro-top { display:flex; align-items:flex-start; gap:6px }
.stk-verdict { font-size:.5rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:2px 6px; border-radius:4px; flex-shrink:0; margin-top:2px }
.stk-verdict.can { background:rgba(45,106,79,.2); color:var(--s-accent) }
.stk-verdict.not-yet { background:rgba(196,69,54,.15); color:#f87171 }
.stk-verdict.not-tested { background:rgba(156,163,175,.1); color:var(--s-text-muted) }
.stk-confidence { font-size:.48rem; font-weight:700; text-transform:uppercase; padding:2px 5px; border-radius:3px; margin-top:2px; margin-left:2px; flex-shrink:0 }
.stk-macro-claim { font-size:.72rem; font-weight:500; color:var(--s-text); line-height:1.35 }
.stk-macro-id { font-size:.55rem; font-family:ui-monospace,'SF Mono',monospace; color:var(--s-text-muted); margin-top:1px }
.stk-macro-rationale { font-size:.68rem; color:var(--s-text-muted); margin-top:4px; line-height:1.5 }
.stk-macro-evidence { font-size:.65rem; color:#64748b; font-style:italic; margin-top:2px; line-height:1.4 }
.stk-fn-tag { font-size:.55rem; color:var(--s-text-muted); margin-top:1px }
.stk-transcript-toggle { display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding:8px 0; font-size:.72rem; font-weight:600; color:var(--s-text); background:none; border:none; width:100%; font-family:'DM Sans',sans-serif }
.stk-transcript-body { margin-top:8px }
.stk-transcript-msg { padding:6px 0; border-bottom:1px solid rgba(255,255,255,.03); display:flex; gap:8px; align-items:flex-start }
.stk-transcript-msg:last-child { border-bottom:none }
.stk-transcript-role { font-size:.55rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; min-width:20px; padding-top:1px }
.stk-transcript-role.ai { color:var(--s-accent) }
.stk-transcript-role.you { color:#38bdf8 }
.stk-transcript-text { font-size:.72rem; line-height:1.5; color:var(--s-text-muted) }
.results-continue-new { padding:24px 40px 48px }
.btn-continue-new { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:16px 24px; font-family:'DM Sans',sans-serif; font-size:.95rem; font-weight:600; color:#0f172a; background:var(--s-accent); border:none; border-radius:14px; cursor:pointer; transition:all .2s ease; box-shadow:0 4px 14px rgba(52,211,153,.2) }
.btn-continue-new:hover { background:#2dd4a8; transform:translateY(-1px) }
`;
