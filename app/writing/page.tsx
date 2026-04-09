"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */

type Message = { role: "assistant" | "user"; content: string };

type LevelCluster = {
  level: string; label: string; gseRange: [number, number];
  macroIds: string[]; confirmThreshold: number; totalMacros: number;
  onConfirm: string; levelDescription: string;
  promptGuidance?: { topic: string; wordRange: [number, number]; example: string };
};

type AzeMacro = {
  azeId: string; claim: string; fn: string; level: string;
  microIds: string[]; probes?: string[]; signals?: string[]; notes?: string;
};

type TaskConfig = {
  meta: { taskId: string; title: string; functions: string[]; maxExchanges?: number; scaffoldingExchanges?: number; description: string };
  principles: Record<string, unknown>;
  gseMicro: unknown[];
  azeMacro: AzeMacro[];
  levelClusters: LevelCluster[];
};

type MacroResult = {
  azeId: string; claim: string; level: string; fn: string;
  result: "CONFIRMED" | "NOT_DEMONSTRATED" | "NOT_TESTED"; rationale: string; evidence: string;
  confidence?: "HIGH" | "MEDIUM" | "LOW";
};

type LevelResult = { level: string; confirmed: boolean; canCount: number; threshold: string };
type Diagnosis = { diagnosedLevel: string; levelResults: LevelResult[]; results: MacroResult[] };
type FormDimension = { dimension: string; level: string; descriptor: string; examples: string[] };
type FormAnalysis = { overallFormLevel: string; overallFormSummary: string; dimensions: FormDimension[] };
type WritingPrompt = { promptTitle: string; promptText: string; suggestedWords: [number, number]; topicSummary: string };

type Phase =
  | "loading" | "landing"
  | "t1-briefing" | "t1-conversation" | "t1-diagnosing" | "t1-results"
  | "t2-briefing" | "t2-scaffolding" | "t2-generating-prompt" | "t2-writing" | "t2-diagnosing" | "t2-results"
  | "t3-briefing" | "t3-topic-select" | "t3-conversation" | "t3-diagnosing" | "t3-results"
  | "t4-briefing" | "t4-loading-stimuli" | "t4-challenges" | "t4-diagnosing" | "t4-results"
  | "t5-briefing" | "t5-loading" | "t5-conversation" | "t5-diagnosing" | "t5-results"
  | "final-report";

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */

const LEVEL_LABELS: Record<string, string> = {
  PRE_A1: "Pre-A1", A1: "A1", A2: "A2", A2_PLUS: "A2+",
  B1: "B1", B1_PLUS: "B1+", B2: "B2", B2_PLUS: "B2+", C1: "C1",
};
const levelLabel = (level: string) => LEVEL_LABELS[level] ?? level;
const levelToPercent = (lvl: string): number => {
  const map: Record<string, number> = {
    "Pre-A1": 8, "A1": 18, "A2": 30, "A2+": 40, "B1": 52, "B1+": 62,
    "B2": 72, "B2+": 80, "C1": 90, "C2": 98,
  };
  return map[lvl] ?? 30;
};
const barColor = (lvl: string): string => {
  const p = levelToPercent(lvl);
  if (p < 25) return "#ef4444";
  if (p < 45) return "#f59e0b";
  if (p < 65) return "#10b981";
  if (p < 80) return "#3b82f6";
  return "#6366f1";
};
const getTime = (i: number) => {
  const d = new Date(); d.setHours(10, 0, 0, 0); d.setMinutes(d.getMinutes() + i);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const MIN_EXCHANGES = 5;
/** Task 5: must align with MIN_T5_EXCHANGES_BEFORE_WRAP in writing-task5-chat/route.ts */
const T5_MIN_EXCHANGES_BEFORE_CEILING = 6;
/** Task 3: must align with MIN_EXCHANGES_BEFORE_WRAP in writing-task3-chat/route.ts */
const T3_MIN_EXCHANGES_BEFORE_CEILING = 4;
const T1_API = "/api/writing-chat";
const T2_API = "/api/writing-task2-chat";
const T3_API = "/api/writing-task3-chat";
const T4_API = "/api/writing-task4-chat";
const T5_API = "/api/writing-task5-chat";

const FEAT_DEMO_ACCESS_KEY = "feat_demo_access";
const FEAT_DEMO_ACCESS_CODE = "04031982";

function hasDemoAccess(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(FEAT_DEMO_ACCESS_KEY) === "true";
}

/* ═══════════════════════════════════════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════════════════════════════════════ */

const styles = `
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
  --s-text:#e2e8f0; --s-text-muted:#94a3b8; --s-accent:#34d399; --s-accent-muted:rgba(52,211,153,.15);
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
.form-dim-name-new { flex:1; font-size:.8rem; font-weight:600; color:var(--s-text) }
.form-dim-desc-new { flex:2; font-size:.775rem; color:var(--s-text-muted); line-height:1.5 }
.form-dim-bar-new { flex:0 0 80px; height:4px; background:rgba(255,255,255,.06); border-radius:2px; overflow:hidden }
.form-dim-bar-fill-new { height:100%; border-radius:2px; animation:barGrow .8s ease forwards }
.form-dim-level-new { font-size:.7rem; font-weight:700; padding:2px 8px; border-radius:6px; background:rgba(56,189,248,.1); color:#38bdf8; min-width:36px; text-align:center; flex-shrink:0 }
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

/* ═══════════════════════════════════════════════════════════════════════════
   Results helpers (outside component — no React state needed)
   ═══════════════════════════════════════════════════════════════════════════ */

const TASK_META: Record<number, { functions: string[]; label: string; note: string }> = {
  1: { functions: ["Informing", "Interactional"], label: "Diagnostic Chat", note: "Short adaptive chat — evidence gathered across 6 structured stages." },
  2: { functions: ["Informing", "Narrating"], label: "Extended Writing", note: "Extended response — evidence from a single sustained piece of writing." },
  3: { functions: ["Expressing", "Arguing"], label: "Opinion Chat", note: "Debate-style chat — evidence from opinion exchange under challenge." },
  4: { functions: ["Mediating"], label: "Pragmatic Control", note: "Stimulus-response — evidence from text transformation tasks." },
  5: { functions: ["Mediating", "Informing"], label: "Compare & Advise", note: "Advisory chat — evidence from comparing and recommending options." },
};

const softenLevel = (lvl: string): string => {
  const map: Record<string, string> = {
    "Pre-A1": "Pre-A1", "A1": "A1", "A2": "A2", "A2+": "approaching B1",
    "B1": "B1", "B1+": "approaching B2", "B2": "B2", "B2+": "high B2",
    "C1": "C1", "C2": "C2",
  };
  return map[lvl] ?? lvl;
};

const levelToScore10 = (lvl: string): number => {
  const map: Record<string, number> = {
    "Pre-A1": 1, "A1": 2, "A2": 3.5, "A2+": 4.5,
    "B1": 6, "B1+": 7.5, "B2": 8.5, "B2+": 9.5, "C1": 10,
  };
  return map[lvl] ?? 0;
};

const CEFR_LEARNER_ORDER = ["Below A1", "A1", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C2"] as const;

const pickLearnerTier = <T,>(byLevel: Record<string, T>, diagnosedLevel: string, fallback: T): T => {
  const hit = byLevel[diagnosedLevel];
  if (hit !== undefined) return hit;
  const idx = CEFR_LEARNER_ORDER.findIndex(l => l === diagnosedLevel);
  if (idx >= 0) {
    const t = byLevel[CEFR_LEARNER_ORDER[idx] as string];
    if (t !== undefined) return t;
  }
  return fallback;
};

/** Task 3 learner-facing only — positive, cumulative summaries by function (not macro checklist). */
type T3LearnerCaps = { expressing: string[]; arguing: string[] };

const T3_LEARNER_CAPS_BY_LEVEL: Record<string, T3LearnerCaps> = {
  "Below A1": {
    expressing: ["share simple likes, dislikes, or preferences in writing", "answer short questions about your opinion", "use familiar words to react to a prompt"],
    arguing: ["give a one-line reason for a simple choice", "respond briefly when someone disagrees"],
  },
  A1: {
    expressing: ["state opinions on familiar topics in simple sentences", "give short reasons for what you think", "use basic phrases to agree or disagree"],
    arguing: ["answer follow-up questions about your view", "compare two simple options and say which you prefer"],
  },
  A2: {
    expressing: ["express opinions on everyday topics with short explanations", "add detail so your position is clear", "stay on topic while you develop your answer"],
    arguing: ["respond when someone questions your view", "give at least one reason or example to support a claim"],
  },
  "A2+": {
    expressing: ["express views with more than one supporting point", "use connecting language to link ideas", "adjust your tone slightly when the question changes"],
    arguing: ["engage with a counter-view in simple terms", "defend a position across a short exchange"],
  },
  B1: {
    expressing: ["express opinions clearly with reasons and examples", "maintain your position while adding detail", "acknowledge that others may see things differently"],
    arguing: ["respond to challenge without losing your main point", "support claims with brief explanations or examples"],
  },
  "B1+": {
    expressing: ["state nuanced opinions and qualify them where needed", "use varied language to explain your stance", "keep your line of argument easy to follow"],
    arguing: ["handle disagreement while refining your position", "compare your view with an alternative perspective"],
  },
  B2: {
    expressing: ["express confident opinions on abstract and concrete topics", "use precise language to sharpen your point", "hold a clear personal line across several turns"],
    arguing: ["respond to counter-arguments with reasons", "defend your view under sustained challenge", "weigh strengths and limits of your position"],
  },
  "B2+": {
    expressing: ["express clear and confident opinions on complex prompts", "use strong, precise language to make a point", "maintain a consistent personal position in debate-style exchange"],
    arguing: ["respond to counter-arguments with structured reasoning", "maintain and defend a position under challenge", "use examples to strengthen claims"],
  },
  C1: {
    expressing: ["express clear and confident opinions", "use precise language to make your point", "maintain a strong personal position", "acknowledge another side while keeping your own view"],
    arguing: ["respond to challenge and disagreement", "defend your views with reasons", "acknowledge alternative perspectives while holding your position", "develop arguments with examples and explanation"],
  },
  C2: {
    expressing: ["express nuanced, well-supported opinions with control of tone", "use precise, flexible language to sharpen and qualify your point", "sustain a clear position across a demanding exchange"],
    arguing: ["respond flexibly to challenge and refine your stance", "defend and complicate your views with layered reasoning", "integrate counter-perspectives without losing your line of argument"],
  },
};

type T1LearnerCaps = { informing: string[]; interactional: string[] };
type T2LearnerCaps = { informing: string[]; narrating: string[] };
const T1_LEARNER_CAPS_BY_LEVEL: Record<string, T1LearnerCaps> = {
  "Below A1": {
    informing: ["give very short factual answers in writing", "name simple topics or preferences", "repeat or copy familiar phrases when prompted"],
    interactional: ["respond to a greeting or simple question", "use basic signs of politeness", "signal yes/no or simple agreement"],
  },
  A1: {
    informing: ["share simple facts about yourself and everyday topics", "answer direct questions with short written replies", "list a few related points on a familiar theme"],
    interactional: ["keep a short written exchange going", "ask and answer simple follow-up questions", "show you have understood the other person's prompt"],
  },
  A2: {
    informing: ["give simple descriptions and explanations in writing", "add a second sentence to clarify what you mean", "stay relevant to the question asked"],
    interactional: ["take turns in a structured chat-style task", "react to feedback or a new angle briefly", "repair misunderstanding with simpler wording"],
  },
  "A2+": {
    informing: ["organise a short answer into two or three clear points", "use linking words to connect sentences", "adjust detail when the prompt asks for more"],
    interactional: ["maintain appropriate tone across several exchanges", "respond to hints without losing the thread", "signal when you need a moment or a repeat"],
  },
  B1: {
    informing: ["explain ideas with reasons and simple examples", "compare basic options in writing", "summarise what you think the reader needs to know"],
    interactional: ["co-operate with the flow of a guided conversation", "negotiate meaning when a word is tricky", "close your contribution politely and clearly"],
  },
  "B1+": {
    informing: ["develop a line of thought across several sentences", "highlight what matters most to your reader", "use paraphrase to avoid repetition"],
    interactional: ["respond flexibly to a change of sub-topic", "show awareness of the other speaker's goal", "keep contributions balanced in length"],
  },
  B2: {
    informing: ["present information clearly for a defined purpose", "select relevant detail and leave out noise", "structure answers so the main message comes first"],
    interactional: ["manage a demanding exchange without losing rapport", "hedge or qualify appropriately in writing", "handle mild disagreement constructively"],
  },
  "B2+": {
    informing: ["convey nuanced information with controlled emphasis", "integrate evidence from prompts or prior turns", "preview and recap to guide the reader"],
    interactional: ["sustain stance and tone under time pressure", "anticipate likely follow-ups in your wording", "show pragmatic control of register"],
  },
  C1: {
    informing: ["communicate complex information with clarity and economy", "prioritise and layer detail for different reader needs", "monitor your own message for clarity as you write"],
    interactional: ["orchestrate extended interaction with natural flow", "fine-tune tone to the interpersonal context", "recover smoothly from ambiguity or overlap"],
  },
  C2: {
    informing: ["handle subtle informational tasks with full control", "exploit stylistic range to serve the communicative goal", "integrate multiple sources of information coherently"],
    interactional: ["show full interactional ease in demanding written dialogue", "deploy idiomatic and precise pragmatic choices", "mediate between perspectives with sensitivity"],
  },
};

const T2_LEARNER_CAPS_BY_LEVEL: Record<string, T2LearnerCaps> = {
  "Below A1": {
    informing: ["write a few words or a short label about a topic", "copy or complete a simple sentence from a model"],
    narrating: ["name one event or action in order", "use present or past in a very simple way"],
  },
  A1: {
    informing: ["describe people, places, or routines in simple sentences", "give basic factual information in order"],
    narrating: ["tell a short sequence of events", "use simple time words (then, after, before)", "say how something felt or ended"],
  },
  A2: {
    informing: ["explain what happened with a clear beginning and end", "add one or two supporting details", "keep tense mostly consistent"],
    narrating: ["link events with basic connectors", "include simple background", "show attitude toward what happened"],
  },
  "A2+": {
    informing: ["select information that supports your main point", "vary sentence openings slightly", "round off with a short conclusion"],
    narrating: ["build a clearer arc (setup — event — outcome)", "use past and past progressive where appropriate"],
  },
  B1: {
    informing: ["structure a longer piece with paragraphs", "illustrate ideas with examples", "signal main vs supporting information"],
    narrating: ["sustain a story or account across several paragraphs", "use time and place references to orient the reader", "describe reactions and consequences"],
  },
  "B1+": {
    informing: ["prioritise ideas so the reader can follow easily", "integrate description with explanation", "preview what you will cover"],
    narrating: ["vary pacing and focus within the narrative", "use reported speech or summary where useful"],
  },
  B2: {
    informing: ["craft an engaging informative text for a known audience", "balance objective detail with stance where appropriate", "use cohesive devices across sections"],
    narrating: ["shape narrative for effect (highlight, foreshadow, reflect)", "control viewpoint and voice", "maintain coherence across a sustained text"],
  },
  "B2+": {
    informing: ["handle abstract and concrete content in one piece", "tighten redundancy while keeping voice", "guide the reader through non-linear information"],
    narrating: ["sustain tension or reflection in extended narration", "embed evaluation within the story"],
  },
  C1: {
    informing: ["control information density and reader guidance at will", "exploit stylistic choices for clarity and impact", "integrate examples without losing thread"],
    narrating: ["sophisticated narrative control — time, perspective, evaluation", "sustain voice and register across a long response"],
  },
  C2: {
    informing: ["write with near-native flexibility for demanding informative purposes", "exploit full range of organisational and stylistic means"],
    narrating: ["full narrative artistry with natural, idiomatic control"],
  },
};

/** Task 5 learner: mediation — positive summaries (not Informing/Mediating/Directing macro labels). */
type T5LearnerMediationCaps = { understandingComparing: string[]; givingAdvice: string[]; usingInformation: string[] };

const T5_LEARNER_MEDIATION_BY_LEVEL: Record<string, T5LearnerMediationCaps> = {
  "Below A1": {
    understandingComparing: ["notice that there are two different options to choose from", "point to something simple that distinguishes them"],
    givingAdvice: ["say which option you would pick in a few words", "respond when someone asks what you think"],
    usingInformation: ["use words or details from what you can see on the cards", "give a short reason tied to one detail"],
  },
  A1: {
    understandingComparing: ["spot basic differences between the two options (e.g. price, main feature)", "name the option that fits a simple need better"],
    givingAdvice: ["recommend one option for a clear situation", "give a one-line reason for your choice"],
    usingInformation: ["refer to at least one fact from the options when you answer", "stay with what the cards show"],
  },
  A2: {
    understandingComparing: ["compare two options in a short, clear way", "say what matters most for the person asking"],
    givingAdvice: ["choose an option and say why it helps", "match your suggestion to the situation described"],
    usingInformation: ["select details from the cards that support your view", "explain your choice in your own words"],
  },
  "A2+": {
    understandingComparing: ["contrast options with more than one point of difference", "adjust what you highlight when the question changes"],
    givingAdvice: ["give a reason that fits the situation, not only generic opinion", "signal when one option is better for one purpose and the other for another"],
    usingInformation: ["weave together two or more details from the options", "keep your advice tied to what is on the cards"],
  },
  B1: {
    understandingComparing: ["explain trade-offs between options in a structured way", "prioritise what matters for the decision"],
    givingAdvice: ["recommend clearly and back it with reasons from the options", "acknowledge when neither option is perfect"],
    usingInformation: ["synthesise information so the reader can decide", "leave out detail that does not help the decision"],
  },
  "B1+": {
    understandingComparing: ["compare across several criteria (cost, quality, fit, time)", "reframe the comparison when the situation changes"],
    givingAdvice: ["tailor advice to the person’s goals and constraints", "qualify your recommendation when risks exist"],
    usingInformation: ["filter and organise card information for the reader’s need", "anticipate what else they might need to know"],
  },
  B2: {
    understandingComparing: ["handle nuanced differences and subtle trade-offs between options", "keep the comparison fair and balanced"],
    givingAdvice: ["give persuasive, well-supported recommendations with an appropriate tone", "respond when priorities conflict"],
    usingInformation: ["integrate several pieces of evidence from the options into a clear line of advice", "present information in an order that supports the decision"],
  },
  "B2+": {
    understandingComparing: ["synthesise trade-offs at abstract and concrete levels", "reframe when new constraints appear"],
    givingAdvice: ["defend a recommendation under challenge or complication", "adapt advice when the scenario shifts"],
    usingInformation: ["foreground what matters most for the decision", "connect multiple factors from the source into a coherent recommendation"],
  },
  C1: {
    understandingComparing: ["orchestrate comparison across several dimensions", "mediate conflicting information between options"],
    givingAdvice: ["deliver nuanced, context-sensitive advice", "balance empathy with clarity"],
    usingInformation: ["control emphasis and omission for impact", "integrate stakeholder perspectives into one clear takeaway"],
  },
  C2: {
    understandingComparing: ["compare complex options with full pragmatic control", "hold multiple criteria in view at once"],
    givingAdvice: ["advise with flexibility, tact, and precision", "adjust stance smoothly as needs change"],
    usingInformation: ["mediate dense material for any stated interpersonal goal", "exploit stylistic range to build trust in your advice"],
  },
};

type LearnerCapabilitySection = { title: string; lines: string[] };

/** Task 4: transformation / pragmatic control — gated positives (B2+ → audience; C1 → full control). */
const TASK4_CEFR_ORDER = ["Below A2", "Below A1", "Pre-A1", "A1", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C2"] as const;

const task4CefrRank = (lvl: string): number => {
  const alias: Record<string, string> = { A2_PLUS: "A2+", B1_PLUS: "B1+", B2_PLUS: "B2+" };
  const key = alias[lvl] ?? lvl;
  const i = TASK4_CEFR_ORDER.indexOf(key as (typeof TASK4_CEFR_ORDER)[number]);
  if (i >= 0) return i;
  return 5;
};

const getTask4LearnerCapabilitySections = (diagnosedLevel: string): LearnerCapabilitySection[] => {
  const r = task4CefrRank(diagnosedLevel);
  const iB2 = TASK4_CEFR_ORDER.indexOf("B2");
  const iB2p = TASK4_CEFR_ORDER.indexOf("B2+");
  const iC1 = TASK4_CEFR_ORDER.indexOf("C1");
  const isB2 = r >= iB2;
  const isB2Plus = r >= iB2p;
  const isC1 = r >= iC1;

  const adjusting: string[] = [];
  const audience: string[] = [];

  if (!isB2) {
    adjusting.push("use simpler wording when you need to make a short text easier to follow");
    adjusting.push("shift how formal or informal your rewrite sounds");
    adjusting.push("keep the main idea clear when you change words or phrases");
    audience.push("notice who will read the text and tweak wording slightly for that reader");
  } else {
    adjusting.push("simplify complex sentences so they are easier to understand");
    adjusting.push("rewrite messages in a clearer, more natural way");
    adjusting.push("change tone to match the situation");
    adjusting.push("keep the main meaning when you rewrite");
    if (!isB2Plus) audience.push("shape your wording for the reader or situation named in the task");
    else {
      audience.push("adjust language for a specific reader (e.g. colleague, customer, general reader)");
      audience.push("make information more accessible for the intended audience");
    }
    if (isC1) {
      adjusting.push("bring together simplification, register shift, and precise meaning in harder reformulations");
    }
  }

  return [
    { title: "Adjusting language", lines: adjusting.slice(0, 5) },
    { title: "Adapting for audience", lines: audience.slice(0, 5) },
  ];
};

const getTask5LearnerCapabilitySections = (diagnosedLevel: string): LearnerCapabilitySection[] => {
  const fb = T5_LEARNER_MEDIATION_BY_LEVEL.B1!;
  const c = pickLearnerTier(T5_LEARNER_MEDIATION_BY_LEVEL, diagnosedLevel, fb);
  return [
    { title: "Understanding and comparing options", lines: c.understandingComparing.slice(0, 5) },
    { title: "Giving advice", lines: c.givingAdvice.slice(0, 5) },
    { title: "Using information effectively", lines: c.usingInformation.slice(0, 5) },
  ];
};

/**
 * Build "What you can do" from actual CONFIRMED diagnosis macros when available.
 * Falls back to the fixed level-based lookup tables when diagnosis has no results.
 */
const getLearnerCapabilitySections = (taskNum: number, diagnosedLevel: string, diagnosis?: Diagnosis | null): LearnerCapabilitySection[] | null => {
  if (diagnosedLevel === "—") return null;

  // ── Try actual diagnosis results first ──
  const confirmed = diagnosis?.results?.filter(r => r.result === "CONFIRMED") ?? [];
  if (confirmed.length > 0) {
    // Group confirmed macros by their function label (e.g. "Interactional", "Informing")
    const byFn = new Map<string, string[]>();
    for (const r of confirmed) {
      const fn = r.fn || "General";
      if (!byFn.has(fn)) byFn.set(fn, []);
      byFn.get(fn)!.push(r.claim);
    }
    const sections: LearnerCapabilitySection[] = [];
    for (const [fn, claims] of byFn) {
      sections.push({ title: fn, lines: claims });
    }
    if (sections.length > 0) return sections;
  }

  // ── Fallback: fixed level-based tables ──
  const fb1 = T1_LEARNER_CAPS_BY_LEVEL.B1!;
  const fb3 = T3_LEARNER_CAPS_BY_LEVEL.B1!;
  switch (taskNum) {
    case 1: {
      const c = pickLearnerTier(T1_LEARNER_CAPS_BY_LEVEL, diagnosedLevel, fb1);
      return [{ title: "Informing", lines: c.informing }, { title: "Interactional", lines: c.interactional }];
    }
    case 2: {
      const c = pickLearnerTier(T2_LEARNER_CAPS_BY_LEVEL, diagnosedLevel, T2_LEARNER_CAPS_BY_LEVEL.B1!);
      return [{ title: "Informing", lines: c.informing }, { title: "Narrating", lines: c.narrating }];
    }
    case 3: {
      const c = pickLearnerTier(T3_LEARNER_CAPS_BY_LEVEL, diagnosedLevel, fb3);
      return [{ title: "Expressing", lines: c.expressing }, { title: "Arguing", lines: c.arguing }];
    }
    case 4:
      return getTask4LearnerCapabilitySections(diagnosedLevel);
    case 5:
      return getTask5LearnerCapabilitySections(diagnosedLevel);
    default:
      return null;
  }
};

/** Learner "What to improve next" — short, developmental; not macro failure lists. */
const getLearnerImprovementHints = (form: FormAnalysis | null, taskNum: number): string[] => {
  const hints: string[] = [];
  const sorted = [...(form?.dimensions ?? [])].sort((a, b) => levelToPercent(a.level) - levelToPercent(b.level));
  const dimHint = (dim: string): string | null => {
    const d = dim.toLowerCase();
    if (d.includes("grammar")) {
      if (taskNum === 4) return "tighten grammar control in reformulated text";
      return "refine accuracy and range in more demanding sentences";
    }
    if (d.includes("vocab")) {
      if (taskNum === 4) return "widen vocabulary for paraphrase and reformulation";
      if (taskNum === 5) return "extend precision when comparing options and giving advice";
      if (taskNum === 3) return "extend precision and variety in argumentative language";
      return "build vocabulary range for clearer expression";
    }
    if (d.includes("coher") || d.includes("cohesion")) {
      if (taskNum === 2) return "improve cohesion across paragraphs and ideas";
      if (taskNum === 4) return "keep reformulated text coherent end-to-end";
      if (taskNum === 5) return "connect your advice so each step follows from the options and the situation";
      if (taskNum === 3) return "improve cohesion across longer reasoning";
      return "strengthen how ideas link in your writing";
    }
    if (d.includes("spell")) return "keep working on spelling and mechanics so ideas come through clearly";
    if (d.includes("communicative") || d.includes("effectiveness")) {
      if (taskNum === 1) return "make each reply a little fuller when the task invites it";
      if (taskNum === 4) return "make rewrites feel more natural and less stiff or translated";
      if (taskNum === 5) return "strengthen how clearly your advice lands for the reader";
      if (taskNum === 3) return "strengthen how clearly your argument lands for the reader";
      return "aim for clearer impact on the reader";
    }
    return null;
  };
  for (const x of sorted) {
    if (hints.length >= 3) break;
    if (levelToPercent(x.level) >= 75) continue;
    const h = dimHint(x.dimension);
    if (h) hints.push(h);
  }
  const defaults: Record<number, string[]> = {
    1: ["add a bit more detail when you answer open questions", "use linking words across several short turns", "re-read for missing words before sending"],
    2: ["develop ideas with clearer examples", "vary how sentences open", "check paragraph flow"],
    3: ["organise longer arguments more clearly", "use more developed examples", "strengthen cohesion across ideas"],
    4: [
      "make rewrites sound more natural and less stiff or translated",
      "hold tone steady across the whole text",
      "improve control when switching between formal and informal styles",
      "keep meaning aligned with the source when the brief demands precision",
    ],
    5: [
      "weigh trade-offs between options more explicitly when priorities conflict",
      "adapt your recommendation when the situation or need changes",
      "tie reasons to specific details from the options so your advice stays grounded",
    ],
  };
  const fill = defaults[taskNum] ?? defaults[3]!;
  for (const d of fill) {
    if (hints.length >= 3) break;
    if (!hints.includes(d)) hints.push(d);
  }
  return [...new Set(hints)].slice(0, 3);
};

/** Final report: median CEFR level from a list (excludes "—"). */
const medianCefrLevel = (levels: string[], order: string[]): string => {
  const valid = levels.filter(l => l !== "—" && order.indexOf(l) > 0);
  if (valid.length === 0) return "—";
  const sorted = [...valid].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return sorted[Math.floor((sorted.length - 1) / 2)];
};

/** e.g. T1 | T1–T3 | T1, T4, T5 */
const formatFinalReportTaskSource = (taskNums: number[]): string => {
  const u = [...new Set(taskNums)].sort((a, b) => a - b);
  if (u.length === 0) return "—";
  if (u.length === 1) return `T${u[0]}`;
  const consecutive = u.every((v, i) => i === 0 || v === u[i - 1] + 1);
  if (consecutive) return `T${u[0]}–T${u[u.length - 1]}`;
  return u.map(n => `T${n}`).join(", ");
};

const getConfirmedFnLevelForTask = (diag: Diagnosis | null, fn: string): string => {
  if (!diag?.results) return "—";
  const macros = diag.results.filter(r => r.fn === fn && r.result === "CONFIRMED");
  if (macros.length === 0) return "—";
  const lo = ["Below A1", "A1", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C2"];
  return macros.reduce((best, m) => (lo.indexOf(m.level) > lo.indexOf(best.level) ? m : best), macros[0]).level;
};

/** Aggregated improvement steps (same idea as legacy getNextSteps). */
const getNextSteps = (
  diagnoses: (Diagnosis | null)[],
  formDims: { dimension: string; level: string; descriptor: string }[]
): string[] => {
  const steps: string[] = [];
  const notDem = diagnoses.flatMap(d => d?.results?.filter(r => r.result === "NOT_DEMONSTRATED") ?? []);
  if (notDem.length > 0 && notDem[0]?.claim) {
    steps.push(`Work on: ${notDem[0].claim.toLowerCase()}`);
  }
  const weakDims = formDims.filter(d => levelToPercent(d.level) < 52);
  for (const d of weakDims.slice(0, 2)) {
    steps.push(`Improve ${d.dimension.toLowerCase()}: ${d.descriptor.toLowerCase()}`);
  }
  steps.push("Extend responses with reasons and examples");
  steps.push("Use linking words to connect ideas");
  return [...new Set(steps)].slice(0, 4);
};

const FINAL_REPORT_LEVEL_ORDER = ["—", "Below A1", "A1", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C2"];

const finalReportLevelColor = (lvl: string): string => {
  const i = FINAL_REPORT_LEVEL_ORDER.indexOf(lvl);
  if (i <= 0) return "var(--s-text-muted)";
  if (i >= 7) return "var(--s-accent)";
  if (i >= 5) return "#fbbf24";
  return "var(--s-text-muted)";
};

const FINAL_REPORT_ALL_FUNCTIONS = ["Interactional", "Informing", "Narrating", "Expressing", "Arguing", "Mediating", "Directing"] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function WritingTestPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [accessCodeError, setAccessCodeError] = useState("");

  const [t1Config, setT1Config] = useState<TaskConfig | null>(null);
  const [t1Messages, setT1Messages] = useState<Message[]>([]);
  const [t1Input, setT1Input] = useState("");
  const [t1Processing, setT1Processing] = useState(false);
  const [t1ExchangeCount, setT1ExchangeCount] = useState(0);
  const [t1Diagnosis, setT1Diagnosis] = useState<Diagnosis | null>(null);
  const [t1Form, setT1Form] = useState<FormAnalysis | null>(null);
  const [t1Expanded, setT1Expanded] = useState<Set<string>>(new Set());
  const [t1ShowTranscript, setT1ShowTranscript] = useState(false);
  const t1DoneRef = useRef(false);
  const [t1Stage, setT1Stage] = useState<number>(0);

  const [t2Config, setT2Config] = useState<TaskConfig | null>(null);
  const [t2ScaffoldMsgs, setT2ScaffoldMsgs] = useState<Message[]>([]);
  const [t2ScaffoldInput, setT2ScaffoldInput] = useState("");
  const [t2ScaffoldProcessing, setT2ScaffoldProcessing] = useState(false);
  const [t2ScaffoldCount, setT2ScaffoldCount] = useState(0);
  const t2ScaffoldDoneRef = useRef(false);
  const [t2Topic, setT2Topic] = useState<unknown | null>(null);
  const [t2Prompt, setT2Prompt] = useState<WritingPrompt | null>(null);
  const [t2WrittenText, setT2WrittenText] = useState("");
  const [t2Diagnosis, setT2Diagnosis] = useState<Diagnosis | null>(null);
  const [t2Form, setT2Form] = useState<FormAnalysis | null>(null);
  const [t2Expanded, setT2Expanded] = useState<Set<string>>(new Set());
  const [t2ShowTranscript, setT2ShowTranscript] = useState(false);
  const [t2ShowWriting, setT2ShowWriting] = useState(false);

  const [t3Config, setT3Config] = useState<TaskConfig | null>(null);
  const [t3Messages, setT3Messages] = useState<Message[]>([]);
  const [t3Input, setT3Input] = useState("");
  const [t3Processing, setT3Processing] = useState(false);
  const [t3ExchangeCount, setT3ExchangeCount] = useState(0);
  const [t3ChosenTopic, setT3ChosenTopic] = useState<string | null>(null);
  const [t3SwitchTopic, setT3SwitchTopic] = useState<string | null>(null);
  const [t3Diagnosis, setT3Diagnosis] = useState<Diagnosis | null>(null);
  const [t3Form, setT3Form] = useState<FormAnalysis | null>(null);
  const [t3Expanded, setT3Expanded] = useState<Set<string>>(new Set());
  const [t3ShowTranscript, setT3ShowTranscript] = useState(false);
  const t3DoneRef = useRef(false);
  type TopicOption = { id: string; label: string; tier: string; prompt: string };

  const [t4Config, setT4Config] = useState<TaskConfig | null>(null);
  type StimulusItem = { id: string; level: string; type: string; label: string; instruction: string; stimulus: string; targetMacroIds: string[] };
  const [t4Stimuli, setT4Stimuli] = useState<StimulusItem[]>([]);
  const [t4CurrentIdx, setT4CurrentIdx] = useState(0);
  const [t4Responses, setT4Responses] = useState<Record<string, string>>({});
  const [t4Diagnosis, setT4Diagnosis] = useState<Diagnosis | null>(null);
  const [t4Form, setT4Form] = useState<FormAnalysis | null>(null);
  const [t4Expanded, setT4Expanded] = useState<Set<string>>(new Set());
  const [t4ShowTranscript, setT4ShowTranscript] = useState(false);

  const [t5Config, setT5Config] = useState<TaskConfig | null>(null);
  type StimulusCardType = { id: string; name: string; tagline: string; rating: number; price: string; priceNote?: string; features: { icon: string; label: string; value: string }[]; highlight?: string };
  type StimulusSetType = { id: string; category: string; categoryIcon: string; cardA: StimulusCardType; cardB: StimulusCardType };
  const [t5StimulusSet, setT5StimulusSet] = useState<StimulusSetType | null>(null);
  const [t5Messages, setT5Messages] = useState<Message[]>([]);
  const [t5Input, setT5Input] = useState("");
  const [t5Processing, setT5Processing] = useState(false);
  const [t5ExchangeCount, setT5ExchangeCount] = useState(0);
  const [t5Diagnosis, setT5Diagnosis] = useState<Diagnosis | null>(null);
  const [t5Form, setT5Form] = useState<FormAnalysis | null>(null);
  const [t5Expanded, setT5Expanded] = useState<Set<string>>(new Set());
  const [t5ShowTranscript, setT5ShowTranscript] = useState(false);
  const t5DoneRef = useRef(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/writing-descriptors").then(r => r.json()),
      fetch("/api/writing-task2-descriptors").then(r => r.json()).catch(() => null),
      fetch("/api/writing-task3-descriptors").then(r => r.json()).catch(() => null),
      fetch("/api/writing-task4-descriptors").then(r => r.json()).catch(() => null),
      fetch("/api/writing-task5-descriptors").then(r => r.json()).catch(() => null),
    ]).then(([d1, d2, d3, d4, d5]) => {
      setT1Config(d1);
      if (d2) setT2Config(d2);
      if (d3) setT3Config(d3);
      if (d4) setT4Config(d4);
      if (d5) setT5Config(d5);
      setPhase("landing");
    });
  }, []);

  useEffect(() => {
    if (phase === "loading" || phase === "landing") return;
    if (!hasDemoAccess()) {
      setAccessModalOpen(false);
      setAccessCodeError("");
      setPhase("landing");
    }
  }, [phase]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [t1Messages, t1Processing, t2ScaffoldMsgs, t2ScaffoldProcessing, t3Messages, t3Processing, t5Messages, t5Processing]);

  const t1Transcript = useCallback(() =>
    t1Messages.map(m => `${m.role === "assistant" ? "AI" : "Candidate"}: ${m.content}`).join("\n"),
    [t1Messages]
  );

  const openBeginDemo = useCallback(() => {
    if (hasDemoAccess()) {
      setPhase("t1-briefing");
      return;
    }
    setAccessCodeInput("");
    setAccessCodeError("");
    setAccessModalOpen(true);
  }, []);

  const submitDemoAccess = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (accessCodeInput.trim() === FEAT_DEMO_ACCESS_CODE) {
        localStorage.setItem(FEAT_DEMO_ACCESS_KEY, "true");
        setAccessModalOpen(false);
        setAccessCodeError("");
        setAccessCodeInput("");
        setPhase("t1-briefing");
      } else {
        setAccessCodeError("Invalid access code");
      }
    },
    [accessCodeInput]
  );

  const startT1 = async () => {
    t1DoneRef.current = false; setT1Stage(0); setPhase("t1-conversation"); setT1Processing(true);
    const res = await fetch(T1_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [], exchangeCount: 0, stage: 0 }) });
    const data = await res.json();
    setT1Messages([{ role: "assistant", content: data.message }]); setT1Processing(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendT1 = async () => {
    const text = t1Input.trim();
    if (!text || t1Processing || t1DoneRef.current) return;
    setT1Input(""); setT1Processing(true);
    const userMsg: Message = { role: "user", content: text };
    const newMsgs = [...t1Messages, userMsg]; setT1Messages(newMsgs);
    const nextCount = t1ExchangeCount + 1; setT1ExchangeCount(nextCount);
    if (!t1Config) return;
    if (nextCount >= (t1Config.meta.maxExchanges || 12)) { await finishT1(newMsgs, nextCount); return; }
    const chatRes = await fetch(T1_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: newMsgs, exchangeCount: nextCount, stage: t1Stage }) });
    const data = await chatRes.json();
    if (data.stage !== undefined) setT1Stage(data.stage);
    const updated = [...newMsgs, { role: "assistant" as const, content: data.message }]; setT1Messages(updated);
    if (data.ceilingReached && nextCount >= MIN_EXCHANGES) { t1DoneRef.current = true; setT1Processing(false); await runT1Diagnosis(updated); return; }
    setT1Processing(false); setTimeout(() => inputRef.current?.focus(), 100);
  };

  const finishT1 = async (msgs: Message[], count: number) => {
    t1DoneRef.current = true;
    const res = await fetch(T1_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: msgs, exchangeCount: count, wrapUp: true, stage: t1Stage }) });
    const data = await res.json();
    const all = [...msgs, { role: "assistant" as const, content: data.message }];
    setT1Messages(all); setT1Processing(false); await runT1Diagnosis(all);
  };

  const runT1Diagnosis = async (finalMsgs: Message[]) => {
    setPhase("t1-diagnosing");
    try {
      const res = await fetch(T1_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: finalMsgs, action: "diagnose" }) });
      const data = await res.json();
      if (data.diagnosis) { setT1Diagnosis(data.diagnosis); if (data.formAnalysis) setT1Form(data.formAnalysis); }
      setPhase("t1-results");
    } catch { setPhase("t1-results"); }
  };

  const startT2Scaffolding = async () => {
    t2ScaffoldDoneRef.current = false; setPhase("t2-scaffolding"); setT2ScaffoldProcessing(true);
    const res = await fetch(T2_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "scaffold", messages: [], exchangeCount: 0, task1Transcript: t1Transcript(), task1Level: t1Diagnosis?.diagnosedLevel }) });
    const data = await res.json();
    if (data.topic) setT2Topic(data.topic);
    setT2ScaffoldMsgs([{ role: "assistant", content: data.message }]); setT2ScaffoldProcessing(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendT2Scaffold = async () => {
    const text = t2ScaffoldInput.trim();
    if (!text || t2ScaffoldProcessing || t2ScaffoldDoneRef.current) return;
    setT2ScaffoldInput(""); setT2ScaffoldProcessing(true);
    const userMsg: Message = { role: "user", content: text };
    const newMsgs = [...t2ScaffoldMsgs, userMsg]; setT2ScaffoldMsgs(newMsgs);
    const nextCount = t2ScaffoldCount + 1; setT2ScaffoldCount(nextCount);
    const res = await fetch(T2_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "scaffold", messages: newMsgs, exchangeCount: nextCount, task1Transcript: t1Transcript(), task1Level: t1Diagnosis?.diagnosedLevel }) });
    const data = await res.json();
    if (data.topic) setT2Topic(data.topic);
    const updated = [...newMsgs, { role: "assistant" as const, content: data.message }]; setT2ScaffoldMsgs(updated);
    if (data.scaffoldDone || nextCount >= 4) { t2ScaffoldDoneRef.current = true; setT2ScaffoldProcessing(false); await generateT2Prompt(updated); return; }
    setT2ScaffoldProcessing(false); setTimeout(() => inputRef.current?.focus(), 100);
  };

  const generateT2Prompt = async (scaffoldMsgs: Message[]) => {
    setPhase("t2-generating-prompt");
    try {
      const res = await fetch(T2_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate-prompt", messages: scaffoldMsgs, task1Level: t1Diagnosis?.diagnosedLevel, topic: t2Topic }) });
      const data = await res.json();
      if (data.prompt) setT2Prompt(data.prompt);
      setPhase("t2-writing"); setTimeout(() => textareaRef.current?.focus(), 200);
    } catch { setPhase("t2-writing"); }
  };

  const submitT2Writing = async () => {
    if (!t2WrittenText.trim()) return;
    setPhase("t2-diagnosing");
    try {
      const res = await fetch(T2_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "diagnose", writingResponse: t2WrittenText, scaffoldMessages: t2ScaffoldMsgs, topic: t2Topic }) });
      const data = await res.json();
      if (data.diagnosis) { setT2Diagnosis(data.diagnosis); if (data.formAnalysis) setT2Form(data.formAnalysis); }
      setPhase("t2-results");
    } catch { setPhase("t2-results"); }
  };

  const startT3 = async (topicId: string) => {
    t3DoneRef.current = false; setT3ChosenTopic(topicId);
    const prevLevel = t2Diagnosis?.diagnosedLevel || t1Diagnosis?.diagnosedLevel || "A2";
    const levelNum = levelToPercent(prevLevel);
    const switchTier = levelNum >= 72 ? "abstract" : "broader";
    const options = (t3Config as unknown as { topicOptions?: TopicOption[] })?.topicOptions ?? [];
    const switchOptions = options.filter((t: TopicOption) => t.tier === switchTier && t.id !== topicId);
    const picked = switchOptions.length > 0 ? switchOptions[Math.floor(Math.random() * switchOptions.length)] : null;
    if (picked) setT3SwitchTopic(picked.id);
    setPhase("t3-conversation"); setT3Processing(true);
    const res = await fetch(T3_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "chat", messages: [], exchangeCount: 0, chosenTopic: topicId, task1Level: t1Diagnosis?.diagnosedLevel, task2Level: t2Diagnosis?.diagnosedLevel }) });
    const data = await res.json();
    setT3Messages([{ role: "assistant", content: data.message }]); setT3Processing(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendT3 = async () => {
    const text = t3Input.trim();
    if (!text || t3Processing || t3DoneRef.current) return;
    setT3Input(""); setT3Processing(true);
    const userMsg: Message = { role: "user", content: text };
    const newMsgs = [...t3Messages, userMsg]; setT3Messages(newMsgs);
    const nextCount = t3ExchangeCount + 1; setT3ExchangeCount(nextCount);
    const maxEx = t3Config?.meta?.maxExchanges || 14;
    if (nextCount >= maxEx) { await finishT3(newMsgs, nextCount); return; }
    const shouldSwitch = t3SwitchTopic && nextCount >= 6 && nextCount <= 8;
    const chatRes = await fetch(T3_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "chat", messages: newMsgs, exchangeCount: nextCount, chosenTopic: t3ChosenTopic, switchTopic: shouldSwitch ? t3SwitchTopic : undefined, task1Level: t1Diagnosis?.diagnosedLevel, task2Level: t2Diagnosis?.diagnosedLevel }) });
    const data = await chatRes.json();
    const updated = [...newMsgs, { role: "assistant" as const, content: data.message }]; setT3Messages(updated);
    if (data.ceilingReached && nextCount >= T3_MIN_EXCHANGES_BEFORE_CEILING) { t3DoneRef.current = true; setT3Processing(false); await runT3Diagnosis(updated); return; }
    setT3Processing(false); setTimeout(() => inputRef.current?.focus(), 100);
  };

  const finishT3 = async (msgs: Message[], count: number) => {
    t3DoneRef.current = true;
    const res = await fetch(T3_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "chat", messages: msgs, exchangeCount: count, wrapUp: true, chosenTopic: t3ChosenTopic }) });
    const data = await res.json();
    const all = [...msgs, { role: "assistant" as const, content: data.message }];
    setT3Messages(all); setT3Processing(false); await runT3Diagnosis(all);
  };

  const runT3Diagnosis = async (finalMsgs: Message[]) => {
    setPhase("t3-diagnosing");
    try {
      const res = await fetch(T3_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: finalMsgs, action: "diagnose" }) });
      const data = await res.json();
      if (data.diagnosis) { setT3Diagnosis(data.diagnosis); if (data.formAnalysis) setT3Form(data.formAnalysis); }
      setPhase("t3-results");
    } catch { setPhase("t3-results"); }
  };

  const startT4 = async () => {
    setPhase("t4-loading-stimuli");
    const prevLevel = t3Diagnosis?.diagnosedLevel || t2Diagnosis?.diagnosedLevel || t1Diagnosis?.diagnosedLevel || "B1";
    const res = await fetch(T4_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "get-stimuli", prevLevel }) });
    const data = await res.json();
    if (data.stimuli) { setT4Stimuli(data.stimuli); setT4CurrentIdx(0); setT4Responses({}); setPhase("t4-challenges"); }
  };

  const t4CurrentStimulus = t4Stimuli[t4CurrentIdx] || null;
  const t4CurrentResponse = t4CurrentStimulus ? (t4Responses[t4CurrentStimulus.id] || "") : "";
  const t4AllDone = t4Stimuli.length > 0 && t4Stimuli.every(s => (t4Responses[s.id] || "").trim().length > 5);

  const submitT4 = async () => {
    if (!t4AllDone) return;
    setPhase("t4-diagnosing");
    const responses = t4Stimuli.map(s => ({ stimulusId: s.id, instruction: s.instruction, stimulus: s.stimulus, response: t4Responses[s.id] || "" }));
    try {
      const res = await fetch(T4_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "diagnose", responses }) });
      const data = await res.json();
      if (data.diagnosis) { setT4Diagnosis(data.diagnosis); if (data.formAnalysis) setT4Form(data.formAnalysis); }
      setPhase("t4-results");
    } catch { setPhase("t4-results"); }
  };

  const startT5 = async () => {
    t5DoneRef.current = false; setPhase("t5-loading");
    const prevLevel = t4Diagnosis?.diagnosedLevel || t3Diagnosis?.diagnosedLevel || t2Diagnosis?.diagnosedLevel || t1Diagnosis?.diagnosedLevel || "B1";
    const stimRes = await fetch(T5_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "get-stimulus", prevLevel }) });
    const stimData = await stimRes.json();
    if (stimData.stimulusSet) setT5StimulusSet(stimData.stimulusSet);
    const chatRes = await fetch(T5_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "chat", messages: [], exchangeCount: 0, stimulusSetId: stimData.stimulusSet?.id }) });
    const chatData = await chatRes.json();
    setT5Messages([{ role: "assistant", content: chatData.message }]); setT5ExchangeCount(0);
    setPhase("t5-conversation"); setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendT5 = async () => {
    const text = t5Input.trim();
    if (!text || t5Processing || t5DoneRef.current) return;
    setT5Input(""); setT5Processing(true);
    const userMsg: Message = { role: "user", content: text };
    const newMsgs = [...t5Messages, userMsg]; setT5Messages(newMsgs);
    const nextCount = t5ExchangeCount + 1; setT5ExchangeCount(nextCount);
    const maxEx = t5Config?.meta?.maxExchanges || 12;
    if (nextCount >= maxEx) { await finishT5(newMsgs, nextCount); return; }
    const res = await fetch(T5_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "chat", messages: newMsgs, exchangeCount: nextCount, stimulusSetId: t5StimulusSet?.id }) });
    const data = await res.json();
    const updated = [...newMsgs, { role: "assistant" as const, content: data.message }]; setT5Messages(updated);
    if (data.ceilingReached && nextCount >= T5_MIN_EXCHANGES_BEFORE_CEILING) { t5DoneRef.current = true; setT5Processing(false); await runT5Diagnosis(updated); return; }
    setT5Processing(false); setTimeout(() => inputRef.current?.focus(), 100);
  };

  const finishT5 = async (msgs: Message[], count: number) => {
    t5DoneRef.current = true;
    const res = await fetch(T5_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "chat", messages: msgs, exchangeCount: count, wrapUp: true, stimulusSetId: t5StimulusSet?.id }) });
    const data = await res.json();
    const all = [...msgs, { role: "assistant" as const, content: data.message }];
    setT5Messages(all); setT5Processing(false); await runT5Diagnosis(all);
  };

  const runT5Diagnosis = async (finalMsgs: Message[]) => {
    setPhase("t5-diagnosing");
    try {
      const res = await fetch(T5_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: finalMsgs, action: "diagnose", stimulusSetId: t5StimulusSet?.id }) });
      const data = await res.json();
      if (data.diagnosis) { setT5Diagnosis(data.diagnosis); if (data.formAnalysis) setT5Form(data.formAnalysis); }
      setPhase("t5-results");
    } catch { setPhase("t5-results"); }
  };

  const renderT5Card = (card: StimulusCardType) => (
    <div className="t5-card" key={card.id}>
      <div className="t5-card-header"><span className="t5-card-name">{card.name}</span><span className="t5-card-stars">{"★".repeat(card.rating)}{"☆".repeat(5 - card.rating)}</span></div>
      <div className="t5-card-tagline">{card.tagline}</div>
      <div className="t5-card-price">{card.price}</div>
      {card.priceNote && <div className="t5-card-price-note">{card.priceNote}</div>}
      <div className="t5-card-features">{card.features.map((f, i) => (<div className="t5-card-feature" key={i}><span className="t5-card-feature-icon">{f.icon}</span><span className="t5-card-feature-label">{f.label}</span><span>{f.value}</span></div>))}</div>
      {card.highlight && <div className="t5-card-highlight">{card.highlight}</div>}
    </div>
  );

  const resizeTextareaToContent = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  };

  const wordCount = t2WrittenText.trim().split(/\s+/).filter(w => w.length > 0).length;

  const renderResultsDashboard = (
    taskLabel: string, taskNum: number, config: TaskConfig, diagnosis: Diagnosis | null, form: FormAnalysis | null,
    expanded: Set<string>, setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>,
    showTranscript: boolean, setShowTranscript: React.Dispatch<React.SetStateAction<boolean>>,
    messages: Message[], nextAction?: () => void, nextLabel?: string,
    writtenText?: string, showWriting?: boolean, setShowWriting?: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const taskMeta = TASK_META[taskNum] ?? TASK_META[1];
    const fnLevel = diagnosis?.diagnosedLevel ?? "—";
    const formLevel = form?.overallFormLevel ?? "—";
    const score = fnLevel !== "—" ? levelToScore10(fnLevel) : null;
    const softened = fnLevel !== "—" ? softenLevel(fnLevel) : "—";
    const learnerNextSteps = getLearnerImprovementHints(form, taskNum);
    const learnerCapabilitySections = getLearnerCapabilitySections(taskNum, fnLevel, diagnosis);

    const toggleLevel = (level: string) => {
      setExpanded(prev => { const n = new Set(prev); if (n.has(level)) n.delete(level); else n.add(level); return n; });
    };

    return (
      <>
        <nav className="results-nav">
          <div className="results-nav-logo">FEAT <em>Writing Test</em></div>
          <div className="results-nav-tag">Task {taskNum} · {taskMeta.label}</div>
        </nav>

        <div className="results-hero-new animate-fade-up">
          <div className="results-hero-task">
            <div className="results-hero-eyebrow">Task {taskNum} Complete — {taskMeta.label}</div>
            <div className="results-hero-title">Your Writing <em>Profile</em></div>
            <p className="results-summary-text">
              {taskNum === 4 ? (
                <>
                  <strong style={{ color: "var(--s-text)" }}>Pragmatic control.</strong>{" "}
                  {form?.overallFormSummary ??
                    "You adapt language for different situations — simplifying, shifting tone, and keeping the main meaning clear. This task measures control of language, not creative writing from scratch."}
                </>
              ) : (
                form?.overallFormSummary ?? "Assessment complete."
              )}
            </p>
          </div>
          <div className="results-score-block">
            {score !== null && (<><div className="results-score-item"><div className="results-score-label">Score</div><div className="results-score-value num">{score.toFixed(1)}</div><div className="results-score-sub">out of 10</div></div><div className="results-score-divider" /></>)}
            <div className="results-score-item"><div className="results-score-label">Level</div><div className="results-score-value fn">{fnLevel}</div><div className="results-score-sub">{softened !== fnLevel ? softened : "CEFR"}</div></div>
            <div className="results-score-divider" />
            <div className="results-score-item"><div className="results-score-label">{taskNum === 4 ? "Language control" : "Language"}</div><div className="results-score-value form">{formLevel}</div><div className="results-score-sub">{taskNum === 4 ? "in your rewrites" : "form level"}</div></div>
          </div>
        </div>

        <div className="results-split">
          {/* LEFT — Learner */}
          <div className="results-left">
            <div className="results-section animate-fade-up" style={{ animationDelay: "100ms" }}>
              <div className="results-section-title">What you can do</div>
              {learnerCapabilitySections ? (
                <div className={`learner-can-grid${learnerCapabilitySections.length > 2 ? " learner-can-grid--multi" : ""}`}>
                  {learnerCapabilitySections.map(section => (
                    <div key={section.title} className="learner-can-group">
                      <div className="learner-can-group-title">{section.title}</div>
                      <ul className="learner-can-list">
                        {section.lines.map((line, i) => (
                          <li key={i} className="learner-can-item">{line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: ".825rem", color: "var(--s-text-muted)", lineHeight: 1.55 }}>Function level is not available yet — open the assessment detail when your teacher shares full results.</p>
              )}
            </div>

            {taskNum === 4 && learnerNextSteps.length > 0 && (
              <div className="results-section animate-fade-up" style={{ animationDelay: "200ms" }}>
                <div className="results-section-title">What to improve next</div>
                <div className="next-steps-list">
                  {learnerNextSteps.map((s, i) => <div key={i} className="next-step-item">{s}</div>)}
                </div>
              </div>
            )}

            <div className="results-section animate-fade-up" style={{ animationDelay: taskNum === 4 ? "300ms" : "200ms" }}>
              <div className="results-section-title">{taskNum === 4 ? "Language control in your rewrites" : "How you communicate"}</div>
              {form?.dimensions?.map((dim, i) => (
                <div key={dim.dimension} className="form-dim-row">
                  <div className="form-dim-name-new">{dim.dimension}</div>
                  <div className="form-dim-bar-new"><div className="form-dim-bar-fill-new" style={{ width: `${levelToPercent(dim.level)}%`, background: barColor(dim.level), animationDelay: `${i * .1}s` }} /></div>
                  <div className="form-dim-level-new">{dim.level}</div>
                  <div className="form-dim-desc-new">{dim.descriptor}</div>
                </div>
              ))}
            </div>

            {taskNum !== 4 && learnerNextSteps.length > 0 && (
              <div className="results-section animate-fade-up" style={{ animationDelay: "300ms" }}>
                <div className="results-section-title">What to improve next</div>
                <div className="next-steps-list">
                  {learnerNextSteps.map((s, i) => <div key={i} className="next-step-item">{s}</div>)}
                </div>
              </div>
            )}

            {nextAction && (
              <div className="animate-fade-up" style={{ animationDelay: "400ms", marginTop: 8 }}>
                <button onClick={nextAction} className="btn-continue-new">
                  {nextLabel ?? "Continue"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Stakeholder */}
          <div className="results-right">
            <div className="results-right-label">Assessment Detail</div>

            <div className="stk-section">
              <div className="stk-section-title">Function vs Form</div>
              <div style={{ fontSize: ".75rem", color: "var(--s-text-muted)", lineHeight: 1.65 }}>
                <strong style={{ color: "var(--s-text)" }}>Function</strong> ({fnLevel}) — what the candidate can do.<br />
                <strong style={{ color: "var(--s-text)" }}>Form</strong> ({formLevel}) — grammar, vocabulary, coherence.<br />
                {fnLevel !== formLevel ? "These differ — normal. Both inform placement." : "These align — consistent performance."}
              </div>
            </div>

            <div className="stk-section">
              <div className="stk-section-title">Functions assessed</div>
              <div style={{ fontSize: ".72rem", color: "var(--s-text-muted)", lineHeight: 1.6 }}>
                {taskMeta.functions.join(" · ")}<br />
                <span style={{ color: "#64748b", fontStyle: "italic" }}>{taskMeta.note}</span>
              </div>
            </div>

            <div className="stk-section">
              <div className="stk-section-title">Level confirmation chain</div>
              {config.levelClusters.map(cluster => {
                const lr = diagnosis?.levelResults?.find(r => r.level === cluster.level);
                const confirmed = lr?.confirmed ?? false;
                const isExp = expanded.has(cluster.level);
                const macros = cluster.macroIds.map(id => ({ macro: config.azeMacro.find(m => m.azeId === id), result: diagnosis?.results?.find(r => r.azeId === id) }));
                return (
                  <div key={cluster.level}>
                    <div className="stk-cluster-row" onClick={() => toggleLevel(cluster.level)}>
                      <span className={`stk-cluster-pill ${confirmed ? "confirmed" : "unconfirmed"}`}>{levelLabel(cluster.level)}</span>
                      <div className="stk-cluster-info"><div className="stk-cluster-status">{confirmed ? "Confirmed ✓" : "Not confirmed"}</div><div className="stk-cluster-threshold">{lr?.canCount ?? 0} / {cluster.confirmThreshold} needed</div></div>
                      <span className={`stk-chevron ${isExp ? "open" : ""}`}>▼</span>
                    </div>
                    {isExp && (
                      <div className="stk-macro-list">
                        {macros.map(({ macro, result }) => {
                          if (!macro) return null;
                          const v = result?.result ?? "NOT_TESTED";
                          const tc = v === "CONFIRMED" ? "can" : v === "NOT_DEMONSTRATED" ? "not-yet" : "not-tested";
                          const confBg = result?.confidence === "HIGH" ? "rgba(45,106,79,.15)" : result?.confidence === "MEDIUM" ? "rgba(245,158,11,.12)" : "rgba(156,163,175,.1)";
                          const confColor = result?.confidence === "HIGH" ? "var(--s-accent)" : result?.confidence === "MEDIUM" ? "#fbbf24" : "var(--s-text-muted)";
                          return (
                            <div key={macro.azeId} className="stk-macro-item">
                              <div className="stk-macro-top">
                                <span className={`stk-verdict ${tc}`}>{v === "CONFIRMED" ? "✓" : v === "NOT_DEMONSTRATED" ? "✕" : "—"}</span>
                                {result?.confidence && <span className="stk-confidence" style={{ background: confBg, color: confColor }}>{result.confidence}</span>}
                                <div style={{ flex: 1 }}>
                                  <div className="stk-macro-claim">{macro.claim}</div>
                                  <div style={{ display: "flex", justifyContent: "space-between" }}><span className="stk-fn-tag">{macro.fn}</span><span className="stk-macro-id">{macro.azeId}</span></div>
                                </div>
                              </div>
                              {result?.rationale && <p className="stk-macro-rationale">{result.rationale}</p>}
                              {result?.evidence && <p className="stk-macro-evidence">&ldquo;{result.evidence}&rdquo;</p>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {writtenText && setShowWriting && (
              <div className="stk-section">
                <button onClick={() => setShowWriting(!showWriting)} className="stk-transcript-toggle">Candidate&apos;s Writing <span className={`stk-chevron ${showWriting ? "open" : ""}`}>▼</span></button>
                {showWriting && <div className="stk-transcript-body"><p style={{ fontSize: ".75rem", lineHeight: 1.75, color: "var(--s-text-muted)", whiteSpace: "pre-wrap" }}>{writtenText}</p></div>}
              </div>
            )}

            <div className="stk-section">
              <button onClick={() => setShowTranscript(!showTranscript)} className="stk-transcript-toggle">View conversation <span className={`stk-chevron ${showTranscript ? "open" : ""}`}>▼</span></button>
              {showTranscript && (
                <div className="stk-transcript-body">
                  {messages.map((m, i) => (
                    <div key={i} className="stk-transcript-msg">
                      <span className={`stk-transcript-role ${m.role === "assistant" ? "ai" : "you"}`}>{m.role === "assistant" ? "AI" : "You"}</span>
                      <span className="stk-transcript-text">{m.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderPhoneChat = (
    label: string, subtitle: string, messages: Message[], input: string, setInput: (v: string) => void,
    processing: boolean, doneRef: React.RefObject<boolean>, sendFn: () => void,
    exchangeCount: number, maxExchanges: number, notice?: string, onFinishEarly?: () => void
  ) => {
    const progressPct = Math.min((exchangeCount / maxExchanges) * 100, 100);
    return (
      <main className="chat-page">
        <div className="phone-frame">
          <div className="phone-status-bar"><div className="phone-notch" /></div>
          <div className="chat-top-bar">
            <div className="chat-avatar">FT</div>
            <div className="chat-top-info"><h2>{label}</h2><span>{subtitle}</span></div>
            <div className="chat-top-bar-actions">
              <div className="chat-progress-wrap"><span className="chat-progress-label">Progress</span><div className="chat-progress-bar"><div className="chat-progress-fill" style={{ width: `${progressPct}%` }} /></div></div>
              {onFinishEarly && (
                <button type="button" onClick={onFinishEarly} className="finish-early-btn">
                  Finish ↵
                </button>
              )}
            </div>
          </div>
          {notice && <div className="scaffolding-notice">{notice}</div>}
          <div className="chat-body">
            {messages.map((m, i) => (<div key={i}><div className={`msg-row ${m.role}`}>{m.role === "assistant" && <div className="msg-avatar-sm">FT</div>}<div className={`msg-bubble ${m.role}`}>{m.content}</div></div><div className="msg-time">{getTime(i)}</div></div>))}
            {processing && <div className="typing-row"><div className="msg-avatar-sm">FT</div><div className="typing-bubble"><span className="dot"/><span className="dot"/><span className="dot"/></div></div>}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-area">
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFn(); } }} placeholder={doneRef.current ? "Chat complete" : processing ? "Waiting…" : "Type a message…"} disabled={processing || doneRef.current} className="chat-text-input" />
            <button onClick={sendFn} disabled={!input.trim() || processing || doneRef.current} className="chat-send-btn" style={{ background: input.trim() ? "var(--accent)" : "#d1d5db" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div className="phone-home-bar"><div className="home-indicator" /></div>
        </div>
      </main>
    );
  };

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════════════ */

  const S = <style dangerouslySetInnerHTML={{ __html: styles }} />;
  const wrap = (children: React.ReactNode) => (
    <div className="stakeholder-theme">{S}{children}</div>
  );

  if (phase === "loading" || !t1Config) return wrap(<main className="diagnosing-container"><div className="spinner" style={{ margin: "0 auto" }} /></main>);

  /* ── LANDING PAGE ──────────────────────────────────────────────────── */
  if (phase === "landing") return wrap(
    <div className="landing-page">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">FEAT <em>Writing</em></div>
        <button type="button" onClick={openBeginDemo} className="landing-nav-cta">Begin Test Demo</button>
      </nav>

      {/* Hero */}
      <section className="landing-hero animate-fade-up">
        <div className="landing-hero-eyebrow">FEAT Writing Test</div>
        <h1 className="landing-hero-title">Testing Communicative <em>Function</em>,<br/>Not Just Genre</h1>
        <p className="landing-hero-anchor">Function-based writing assessment.</p>
        <p className="landing-hero-hook">
          FEAT assesses writing through what learners actually do with language — explaining, interacting, and justifying — rather than a single fixed text type.
        </p>
        <p className="landing-hero-sub">It measures what candidates can do with language, not just whether they can follow the conventions of a particular text type.</p>
        <button type="button" onClick={openBeginDemo} className="landing-hero-btn">
          Begin Test Demo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </section>

      {/* The problem */}
      <section className="landing-section animate-fade-up" style={{ animationDelay: "100ms" }}>
        <div className="landing-section-label">The problem</div>
        <div className="landing-section-body">
          <p>Writing has changed. Most people write more today than any previous generation. They do it through messages, captions, comments, and replies — not pen and paper.</p>
          <p>Sometimes thoughtfully. Sometimes as keyboard warriors.</p>
          <p>Writing is how we manage relationships, navigate work, and take part in the world.</p>
          <p>But writing assessment has changed more slowly.</p>
          <p>Most tests still ask candidates to produce a genre: an essay, a report, a formal letter. The question becomes: can you produce the right kind of text? Format. Structure. Register. Product.</p>
          <p>This is genre-based testing. It captures important skills, but only part of what it means to communicate in writing.</p>
        </div>
      </section>

      {/* The gap */}
      <section className="landing-section animate-fade-up" style={{ animationDelay: "150ms" }}>
        <div className="landing-section-label">The gap</div>
        <div className="landing-section-body">
          <p>CEFR takes a different approach. Its descriptors are function-based: can the learner inform, express, argue, interact?</p>
          <p>But many assessments aligned to CEFR are still built around genre tasks, like a timed essay, a formal complaint, or a report on a graph.</p>
          <p>What the test claims to measure and what it actually tests don&apos;t always match.</p>
          <p className="landing-section-pull">We test the format. We don&apos;t always test the communication.</p>
          <p>A function-based writing assessment can narrow that gap.</p>
        </div>
      </section>

      {/* A different approach */}
      <section className="landing-section animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="landing-section-label">A different approach</div>
        <div className="landing-section-body">
          <p>
            FEAT starts from what learners are trying to do with language. It tests those ideas in live back-and-forth tasks, not only through a single static prompt. This is still a writing assessment. The difference is that writing is tested as interaction, not as a single static response.
          </p>
          <div className="landing-contrast">
            <p className="not">Instead of asking someone to write an essay about technology,</p>
            <p className="but">ask them to explain an idea to someone who does not understand it.</p>
          </div>
          <p>They may need to justify a view when challenged, or clarify when something is not understood.</p>
          <p>The AI does more than prompt. It responds, asks follow-ups, challenges you, and sometimes misunderstands on purpose.</p>
          <p>That makes strengths and limits in writing easier to see.</p>
          <p>Level comes from patterns of evidence across the session. You get a structured diagnosis, not one isolated task score.</p>
        </div>
      </section>

      {/* A familiar model */}
      <section className="landing-section animate-fade-up" style={{ animationDelay: "212ms" }}>
        <div className="landing-section-label">A familiar model</div>
        <div className="landing-section-body">
          <p>This approach is not new.</p>
          <p>In vocational training, people are assessed on what they can do, not just what they know. A mechanic is asked to fix an engine. A chef is asked to prepare a dish.</p>
          <p>Language can be assessed in the same way. Not by reproducing a format, but by showing how it is used in practice.</p>
        </div>
      </section>

      {/* Consistency by design */}
      <section className="landing-section animate-fade-up" style={{ animationDelay: "225ms" }}>
        <div className="landing-section-label">Consistency by design</div>
        <div className="landing-section-body">
          <p>Interactions are adaptive, but controlled.</p>
          <p>Each task follows a defined structure. The system varies prompts and challenges within set parameters to ensure comparable difficulty.</p>
          <p>Evidence is gathered across multiple tasks and mapped to CEFR descriptors. The result is not based on a single response, but on consistent patterns of behaviour.</p>
        </div>
      </section>

      {/* Designed for real assessment conditions */}
      <section className="landing-section animate-fade-up" style={{ animationDelay: "237ms" }}>
        <div className="landing-section-label">Designed for real assessment conditions</div>
        <div className="landing-section-body">
          <p>A function-based assessment introduces different challenges. These have been considered in the design.</p>
          <p>Interaction is structured to assess language, not speed. Candidates are given time to respond, and performance is evaluated across patterns of language use, not individual responses.</p>
          <p>AI interaction is adaptive, but controlled. Tasks follow defined structures, and variation is kept within set parameters to ensure comparable difficulty.</p>
          <p>The system focuses on observable behaviour. Scoring is based on what candidates demonstrate across tasks, rather than single responses or impressions.</p>
          <p>Task design balances different demands. The sequence of tasks is intended to reflect real-world writing while remaining manageable within an assessment setting.</p>
        </div>
      </section>

      {/* Split: product + how it works + what you get */}
      <div className="landing-split-section animate-fade-up" style={{ animationDelay: "250ms" }}>
        <div className="landing-split-left">
          <div className="landing-split-block-label">What this assessment does</div>
          <div className="landing-split-block-title" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.6rem", fontWeight: 400, color: "#E6EDF3", marginBottom: "16px", letterSpacing: "-.02em" }}>Assessing writing as communication, not just formatted text</div>
          <div className="landing-split-block-body">
            <p>The assessment looks at what learners are trying to do with language: informing, explaining, narrating, justifying, adjusting for audience. Evidence comes from tasks where they write in real time and respond to the system.</p>
            <p>Instead of one long answer in a single genre, you get a wider picture of how they handle different demands.</p>
            <p>That keeps the focus on function and stays close to CEFR.</p>
          </div>
        </div>
        <div className="landing-split-right">
          <div className="landing-split-block">
            <div className="landing-split-block-label">How it works</div>
            <div className="landing-split-block-title">Grounded in established frameworks</div>
            <div className="landing-split-block-body">
              <p>We start from communicative descriptors in CEFR and GSE. We group them into broader purposes (informing, explaining, justifying, interacting) and turn them into behaviours we can test through interaction.</p>
              <p>During a session, the system gathers evidence across these areas and maps performance to CEFR levels. You do not get one overall task score. You get a profile of what the learner can do.</p>
            </div>
          </div>
          <div className="landing-split-block">
            <div className="landing-split-block-label">What you get</div>
            <div className="landing-split-block-title">Two complementary outputs</div>
            <div className="landing-split-block-body">
              <p>Most writing assessments combine everything into a single score. This function-based writing assessment separates two things that are fundamentally different.</p>
            </div>
            <div className="landing-outputs">
              <div className="landing-output-item">
                <div className="landing-output-item-label fn">Function profile</div>
                <div className="landing-output-item-desc">What the learner can do: their ability across interactional, informing, arguing, and mediating functions.</div>
              </div>
              <div className="landing-output-item">
                <div className="landing-output-item-label form">Language profile</div>
                <div className="landing-output-item-desc">How effectively they do it: control of grammar, vocabulary, coherence, and register.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Design principle */}
      <div className="landing-principle animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="landing-principle-inner">
          <div className="landing-principle-label">Design principle</div>
          <div className="landing-principle-text">
            <p>Writing is assessed as communication, not just as formatted product. The aim is to see what a learner can express and achieve with language, beyond sticking to a particular genre template.</p>
            <p>The assessment is not designed to replace every form of writing assessment. Academic writing, professional genres, and extended composition remain important and need their own tools.</p>
            <p>For general English, looking at purpose and how people use language in context offers a flexible, CEFR-aligned way to diagnose ability without depending only on fixed text types.</p>
          </div>
        </div>
      </div>

      {/* Task structure */}
      <div className="landing-tasks animate-fade-up" style={{ animationDelay: "350ms" }}>
        <div className="landing-tasks-label">Test structure</div>
        <div className="landing-tasks-title">Five tasks, one session</div>
        <div className="landing-tasks-intro">The assessment strings several tasks together so we can see how candidates respond across different kinds of demand.</div>
        <div className="landing-task-grid">
          {[
            { num: "T1", cls: "t1", fn: "Interact & Inform", name: "Diagnostic Chat", desc: "Real-time text chat with an AI examiner. It adapts as you go, to probe ability and to test interactional and informing skills." },
            { num: "T2", cls: "t2", fn: "Inform & Narrate", name: "Extended Writing", desc: "A short scaffold followed by extended response. Tests clarity, sequencing, and the ability to provide detail across levels." },
            { num: "T3", cls: "t3", fn: "Express & Argue", name: "Opinion Chat", desc: "An interactive written discussion where the AI challenges, disagrees, and pushes for justification." },
            { num: "T4", cls: "t4", fn: "Rephrase & Adjust", name: "Pragmatic Control", desc: "Rewrite a text for a different audience or purpose. Tests paraphrasing, register control, and flexibility." },
            { num: "T5", cls: "t5", fn: "Compare & Advise", name: "Mediation", desc: "Evaluate two options, explain differences, recommend a choice, and adapt advice as conditions change." },
          ].map(t => (
            <div key={t.num} className="landing-task-card">
              <div className={`landing-task-num ${t.cls}`}>{t.num}</div>
              <div className="landing-task-fn">{t.fn}</div>
              <div className="landing-task-name">{t.name}</div>
              <div className="landing-task-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="landing-final-cta animate-fade-up" style={{ animationDelay: "400ms" }}>
        <h2 className="landing-final-cta-title">A more direct reflection<br/>of <em>writing ability</em></h2>
        <p className="landing-final-cta-sub">This function-based writing assessment measures what you can do with language first. It then looks at form on its own. That gives a clearer view of what learners can do and how they do it.</p>
        <button type="button" onClick={openBeginDemo} className="landing-hero-btn">
          Begin Test Demo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-logo">FEAT <em>Writing</em></div>
        <div className="landing-footer-note">Function-based writing assessment · Prototype</div>
      </footer>

      {accessModalOpen && (
        <div
          className="access-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-modal-title"
          onClick={e => {
            if (e.target === e.currentTarget) setAccessModalOpen(false);
          }}
        >
          <div className="access-modal" onClick={e => e.stopPropagation()}>
            <p id="access-modal-title" className="access-modal-msg">
              This demo is currently limited to invited reviewers.
            </p>
            <form className="access-modal-form" onSubmit={submitDemoAccess}>
              <input
                type="text"
                className="access-modal-input"
                value={accessCodeInput}
                onChange={e => {
                  setAccessCodeInput(e.target.value);
                  if (accessCodeError) setAccessCodeError("");
                }}
                autoComplete="off"
                aria-invalid={!!accessCodeError}
                aria-describedby={accessCodeError ? "access-modal-err" : undefined}
                autoFocus
              />
              {accessCodeError ? (
                <p id="access-modal-err" className="access-modal-error" role="alert">
                  {accessCodeError}
                </p>
              ) : null}
              <button type="submit" className="landing-hero-btn access-modal-submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  /* ── TASK 1: Briefing ──────────────────────────────────────────────── */
  if (phase === "t1-briefing") return wrap(
    <main className="split-briefing-container">
      <div className="split-briefing-inner animate-fade-up">
        <div className="sb-left">
          <div className="sb-badge">✍️ Writing Test · Task 1</div>
          <h1 className="sb-title">Diagnostic <em>Chat</em></h1>
          <p className="sb-subtitle">Text chat · 3–4 minutes</p>
          <div className="sb-section">
            <div className="sb-section-title">What you&apos;ll do</div>
            <div className="sb-section-body">You&apos;ll have a short text conversation with the AI examiner — similar to messaging apps like WhatsApp or iMessage.<br /><br />It starts simple (your name, where you&apos;re from) and becomes more challenging based on how you respond.</div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">How the AI will behave</div>
            <div className="sb-section-body">The AI adapts to your level.<ul><li>If you&apos;re comfortable, it will ask more challenging questions.</li><li>If something is difficult, it will adjust and support you.</li></ul><br />The aim is to create a natural interaction where you can show how you communicate in writing.</div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">How your responses are evaluated</div>
            <div className="sb-section-body">Your responses are evaluated based on what you are able to communicate.<br /><br />The system looks for clear evidence of your ability across different types of communication.</div>
          </div>
          <div className="sb-reassurance">There are no right or wrong answers — the goal is to see how you communicate.</div>
          <button onClick={startT1} className="sb-start-btn">Start Chat <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
          <button type="button" className="skip-task-btn" onClick={() => setPhase("t2-briefing")}>Skip this task →</button>
        </div>
        <div className="sb-right">
          <div className="sb-right-label">Stakeholder Context</div>
          <div className="sb-right-section"><div className="sb-right-section-title">Why this task exists</div><div className="sb-right-section-body">This task assesses written interaction and informing functions in a controlled but flexible environment. Rather than a fixed text type, it creates an adaptive conversation where communicative ability can emerge naturally.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">Why a chat format</div><div className="sb-right-section-body">Interaction introduces elements that static writing tasks cannot:<ul><li>follow-up questions</li><li>clarification</li><li>adjustment of meaning</li><li>breakdown and repair</li></ul></div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">How ability is elicited</div><div className="sb-right-section-body">The AI dynamically adjusts difficulty — moving upward when the candidate responds comfortably, stabilising or simplifying when they struggle.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">CEFR alignment</div><div className="sb-right-section-body">The task targets CEFR-aligned communicative functions — particularly interaction and informing. Evidence is collected across the exchange and mapped to CEFR descriptors.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">How it is scored</div><div className="sb-right-section-body">Performance is evaluated through observable evidence. Each descriptor is marked as:<div className="sb-verdict-row"><div className="sb-verdict"><span className="sb-verdict-tag can">Confirmed</span> demonstrated clearly under demand</div><div className="sb-verdict"><span className="sb-verdict-tag not-yet">Not Demonstrated</span> not consistently evidenced</div></div></div></div>
        </div>
      </div>
    </main>
  );

  if (phase === "t1-conversation") return wrap(renderPhoneChat("Writing Examiner", "Task 1 · Diagnostic Chat", t1Messages, t1Input, setT1Input, t1Processing, t1DoneRef, sendT1, t1ExchangeCount, t1Config.meta.maxExchanges || 12, undefined, () => { void finishT1(t1Messages, t1ExchangeCount); }));
  if (phase === "t1-diagnosing") return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /><p>Analysing function and language…</p></div></main>);
  if (phase === "t1-results") return wrap(<main className="results-page">{renderResultsDashboard("Task 1 · Diagnostic Results", 1, t1Config, t1Diagnosis, t1Form, t1Expanded, setT1Expanded, t1ShowTranscript, setT1ShowTranscript, t1Messages, () => setPhase("t2-briefing"), "Continue to Task 2 →")}</main>);

  /* ── TASK 2 ────────────────────────────────────────────────────────── */
  if (phase === "t2-briefing") return wrap(
    <main className="split-briefing-container split-briefing-task2">
      <div className="split-briefing-inner animate-fade-up">
        <div className="sb-left">
          <div className="sb-badge">✍️ Writing Test · Task 2</div>
          <h1 className="sb-title">Inform &amp; <em>Narrate</em></h1>
          <p className="sb-subtitle">Two phases · ~5 minutes</p>
          <div className="sb-section">
            <div className="sb-section-title">What you&apos;ll do</div>
            <div className="sb-section-body">This task has two parts. First, you&apos;ll have a short chat with the AI to warm up your ideas. Then you&apos;ll write a longer answer on your own.</div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">Phase 1 — Short chat</div>
            <div className="sb-section-body">The AI will ask a few quick questions to help you think. This part is <strong>not</strong> part of your result — relax, explore ideas, and don&apos;t worry about mistakes.</div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">Phase 2 — Your writing</div>
            <div className="sb-section-body">You&apos;ll get a writing prompt based on what you discussed. Take your time and write in your own words — include detail where you can.</div>
          </div>
          <div className="sb-reassurance">Only your extended writing in phase 2 is reviewed — the warm-up chat is there to help you, not to test you.</div>
          <button onClick={startT2Scaffolding} className="sb-start-btn">Start Task 2 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
          <button type="button" className="skip-task-btn" onClick={() => setPhase("t3-briefing")}>Skip this task →</button>
        </div>
        <div className="sb-right">
          <div className="sb-right-label">Stakeholder Context</div>
          <div className="sb-right-section"><div className="sb-right-section-title">Why this task exists</div><div className="sb-right-section-body">It tests whether candidates can <strong>inform</strong> and <strong>narrate</strong> in writing — giving clear information and telling a story or experience in connected text.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">Why scaffold then write</div><div className="sb-right-section-body">A short chat before writing reduces &quot;cold start&quot; noise. Candidates who plan and warm up often produce writing that better reflects their real ability than a single prompt with no preparation.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">How ability is elicited</div><div className="sb-right-section-body">The chat surfaces ideas and vocabulary; the extended response then shows whether they can sustain informing and narrating across a longer piece.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">How it is scored</div><div className="sb-right-section-body">The written response is diagnosed against the relevant abilities. Each is marked as:<div className="sb-verdict-row"><div className="sb-verdict"><span className="sb-verdict-tag can">Confirmed</span> clearly shown in the writing</div><div className="sb-verdict"><span className="sb-verdict-tag not-yet">Not demonstrated</span> not sufficiently evidenced</div></div></div></div>
        </div>
      </div>
    </main>
  );
  if (phase === "t2-scaffolding") return wrap(renderPhoneChat("Writing Examiner", "Task 2 · Phase 1: Think", t2ScaffoldMsgs, t2ScaffoldInput, setT2ScaffoldInput, t2ScaffoldProcessing, t2ScaffoldDoneRef, sendT2Scaffold, t2ScaffoldCount, 4, "⚡ Scaffolding — not assessed"));
  if (phase === "t2-generating-prompt") return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /><p>Creating your writing prompt…</p></div></main>);
  if (phase === "t2-writing") return wrap(
    <main className="writing-page"><div className="writing-frame animate-slide-up">
      <div className="writing-prompt-card">
        <div className="writing-prompt-tag">Task 2 — Writing Prompt</div>
        <h2 className="writing-prompt-title">{t2Prompt?.promptTitle ?? "Write about your experience"}</h2>
        <p className="writing-prompt-text" style={{ whiteSpace: "pre-line" }}>{t2Prompt?.promptText ?? "Write about what you discussed with the examiner."}</p>
        <div className="writing-word-guide">💡 Suggested: around {t2Prompt?.suggestedWords?.[0] ?? 80}–{t2Prompt?.suggestedWords?.[1] ?? 200} words</div>
      </div>
      <div className="writing-textarea-wrap">
        <textarea ref={textareaRef} className="writing-textarea" placeholder="Start writing here…" value={t2WrittenText} onChange={e => setT2WrittenText(e.target.value)} onInput={resizeTextareaToContent} />
        <div className="writing-footer">
          <span className="writing-word-count">{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
          <button onClick={submitT2Writing} disabled={wordCount < 10} className="writing-submit-btn">Submit Writing →</button>
        </div>
      </div>
    </div></main>
  );
  if (phase === "t2-diagnosing") return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /><p>Analysing your writing…</p></div></main>);
  if (phase === "t2-results" && t2Config) return wrap(<main className="results-page">{renderResultsDashboard("Task 2 · Inform & Narrate Results", 2, t2Config, t2Diagnosis, t2Form, t2Expanded, setT2Expanded, t2ShowTranscript, setT2ShowTranscript, t2ScaffoldMsgs, () => setPhase("t3-briefing"), "Continue to Task 3 →", t2WrittenText, t2ShowWriting, setT2ShowWriting)}</main>);

  /* ── TASK 3 ────────────────────────────────────────────────────────── */
  if (phase === "t3-briefing") return wrap(
    <main className="split-briefing-container split-briefing-task3">
      <div className="split-briefing-inner animate-fade-up">
        <div className="sb-left">
          <div className="sb-badge">💬 Writing Test · Task 3</div>
          <h1 className="sb-title">Express &amp; <em>Argue</em></h1>
          <p className="sb-subtitle">Opinion chat · 4–5 minutes</p>
          <div className="sb-section">
            <div className="sb-section-title">What you&apos;ll do</div>
            <div className="sb-section-body">You&apos;ll choose a topic you care about, then have a written back-and-forth with the AI — like a text debate.</div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">How the chat works</div>
            <div className="sb-section-body">The AI will respond to what you write. It may disagree, ask &quot;why?&quot;, or offer another side of the argument. You don&apos;t have to &quot;win&quot; — just respond honestly.</div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">What to focus on</div>
            <div className="sb-section-body">Say what you think and explain yourself when asked. Short answers are fine; the important part is that you engage with the questions.</div>
          </div>
          <div className="sb-reassurance">There are no trick questions — we want to see how you handle a real discussion in writing.</div>
          <button onClick={() => setPhase("t3-topic-select")} className="sb-start-btn">Choose a topic <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
          <button type="button" className="skip-task-btn" onClick={() => setPhase("t4-briefing")}>Skip this task →</button>
        </div>
        <div className="sb-right">
          <div className="sb-right-label">Stakeholder Context</div>
          <div className="sb-right-section"><div className="sb-right-section-title">Why this task exists</div><div className="sb-right-section-body">It tests <strong>expressing</strong> and <strong>arguing</strong> — stating a view and supporting it when someone pushes back.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">Why interactive debate</div><div className="sb-right-section-body">A live exchange draws out reasoning, rebuttal, and nuance better than a one-off opinion paragraph. Static &quot;write your opinion&quot; tasks often show less evidence of argument skill.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">How ability is elicited</div><div className="sb-right-section-body">Challenge–response patterns show whether the candidate can justify, adjust, and defend a line of thought under pressure — not only state a position once.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">How it is scored</div><div className="sb-right-section-body">The transcript is reviewed for clear evidence of those abilities:<div className="sb-verdict-row"><div className="sb-verdict"><span className="sb-verdict-tag can">Confirmed</span> demonstrated clearly under demand</div><div className="sb-verdict"><span className="sb-verdict-tag not-yet">Not demonstrated</span> not consistently evidenced</div></div></div></div>
        </div>
      </div>
    </main>
  );
  if (phase === "t3-topic-select") {
    const allTopics = [
      { id: "social-media", label: "Social Media" },
      { id: "remote-work", label: "Working from Home" },
      { id: "city-country", label: "City vs Countryside" },
      { id: "travel", label: "Travel & Holidays" },
      { id: "online-learning", label: "Online Learning" },
      { id: "climate-change", label: "Climate Change" },
      { id: "fast-fashion", label: "Fast Fashion" },
      { id: "public-transport", label: "Public Transport" },
      { id: "pets", label: "Keeping Pets" },
      { id: "screen-time", label: "Screen Time" },
      { id: "sport-schools", label: "Sport in Schools" },
      { id: "cooking-eating", label: "Cooking vs Eating Out" },
      { id: "age-driving", label: "Age & Driving" },
      { id: "uniforms", label: "School Uniforms" },
      { id: "gap-year", label: "Taking a Gap Year" },
      { id: "technology-health", label: "Technology & Health" },
      { id: "volunteering", label: "Volunteering" },
      { id: "money-happiness", label: "Money & Happiness" },
      { id: "zoos", label: "Zoos & Animal Parks" },
      { id: "tourism", label: "Tourism & Local Life" },
      { id: "advertising", label: "Advertising" },
      { id: "exams", label: "Exams & Testing" },
      { id: "sharing-economy", label: "The Sharing Economy" },
      { id: "neighbourhood", label: "Your Neighbourhood" },
    ];
    const shuffled = [...allTopics].sort(() => Math.random() - 0.5);
    const familiarTopics = shuffled.slice(0, 4);
    return wrap(<main className="topic-page"><div className="topic-frame animate-slide-up"><h2>Pick a Topic</h2><p>Choose the topic you&apos;d like to discuss. The AI will challenge your opinions!</p><div className="topic-grid">{familiarTopics.map((t) => (<button key={t.id} className="topic-btn" onClick={() => startT3(t.id)}>{t.label}</button>))}</div></div></main>);
  }
  if (phase === "t3-conversation") return wrap(<div className="debate-accent">{renderPhoneChat("Debate Partner", "Task 3 · Express & Argue", t3Messages, t3Input, setT3Input, t3Processing, t3DoneRef, sendT3, t3ExchangeCount, t3Config?.meta?.maxExchanges || 14, undefined, () => { void finishT3(t3Messages, t3ExchangeCount); })}</div>);
  if (phase === "t3-diagnosing") return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /><p>Analysing your arguments…</p></div></main>);
  if (phase === "t3-results" && t3Config) return wrap(<main className="results-page">{renderResultsDashboard("Task 3 · Express & Argue Results", 3, t3Config, t3Diagnosis, t3Form, t3Expanded, setT3Expanded, t3ShowTranscript, setT3ShowTranscript, t3Messages, () => setPhase("t4-briefing"), "Continue to Task 4 →")}</main>);

  /* ── TASK 4 ────────────────────────────────────────────────────────── */
  if (phase === "t4-briefing") return wrap(
    <main className="split-briefing-container split-briefing-task4">
      <div className="split-briefing-inner animate-fade-up">
        <div className="sb-left">
          <div className="sb-badge">🔄 Writing Test · Task 4</div>
          <h1 className="sb-title">Rephrase &amp; <em>Adjust</em></h1>
          <p className="sb-subtitle">Short texts · 4–5 minutes</p>
          <div className="sb-section">
            <div className="sb-section-title">What you&apos;ll do</div>
            <div className="sb-section-body">You&apos;ll see several short texts. Each time, you&apos;ll be asked to rewrite the text for a new purpose — for example, simpler language, a different tone, or a different reader.</div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">How to approach it</div>
            <div className="sb-section-body">Read the original carefully, read what you&apos;re asked to do, then write your version. You can move on when you&apos;re happy with each answer.</div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">What matters</div>
            <div className="sb-section-body">Focus on matching the task: the right level of formality, clarity, and fit for the situation described — not on memorising rules.</div>
          </div>
          <div className="sb-reassurance">You&apos;re not being tested on naming grammar terms — we care how well your rewritten text fits the brief.</div>
          <button onClick={startT4} className="sb-start-btn">Start challenges <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
          <button type="button" className="skip-task-btn" onClick={() => setPhase("t5-briefing")}>Skip this task →</button>
        </div>
        <div className="sb-right">
          <div className="sb-right-label">Stakeholder Context</div>
          <div className="sb-right-section"><div className="sb-right-section-title">Why this task exists</div><div className="sb-right-section-body">It targets <strong>mediating</strong> and <strong>pragmatic</strong> competence — reshaping language for purpose and audience, not only producing original text from scratch.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">Why transformation tasks</div><div className="sb-right-section-body">Rewriting for a new purpose shows register control and flexibility in a way open-ended production tasks often miss. Candidates must adjust form while preserving meaning.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">How ability is elicited</div><div className="sb-right-section-body">Each stimulus is aligned to specific macro-level claims so different items stress different aspects of mediating performance.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">How it is scored</div><div className="sb-right-section-body">Responses are judged against those claims:<div className="sb-verdict-row"><div className="sb-verdict"><span className="sb-verdict-tag can">Confirmed</span> clearly shown in the rewrite</div><div className="sb-verdict"><span className="sb-verdict-tag not-yet">Not demonstrated</span> not sufficiently evidenced</div></div></div></div>
        </div>
      </div>
    </main>
  );
  if (phase === "t4-loading-stimuli") return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /><p>Preparing your challenges…</p></div></main>);
  if (phase === "t4-challenges" && t4CurrentStimulus) return wrap(
    <main className="challenge-page">
      <div className="challenge-header animate-fade-up">
        <h2>Challenge {t4CurrentIdx + 1} of {t4Stimuli.length}</h2>
        <p>Read the original text, then rewrite it as instructed.</p>
        <div className="challenge-progress">{t4Stimuli.map((_, i) => (<div key={i} className={`challenge-dot ${i === t4CurrentIdx ? "active" : (t4Responses[t4Stimuli[i].id] || "").trim() ? "done" : ""}`} />))}</div>
      </div>
      <div className="challenge-card">
        <div className="challenge-stimulus-area">
          <span className={`challenge-type-tag ${t4CurrentStimulus.type}`}>{t4CurrentStimulus.type === "simplify" ? "✨ Simplify" : t4CurrentStimulus.type === "formalise" ? "👔 Formalise" : t4CurrentStimulus.type === "audience" ? "👥 Audience" : "🎭 Tone"}</span>
          <div className="challenge-instruction">{t4CurrentStimulus.instruction}</div>
          <div className="challenge-stimulus-box"><div className="challenge-stimulus-label">Original text</div><div className="challenge-stimulus-text">{t4CurrentStimulus.stimulus}</div></div>
        </div>
        <div className="challenge-response-area">
          <div className="challenge-response-label">Your version</div>
          <textarea key={t4CurrentStimulus.id} className="challenge-textarea" placeholder="Write your rewritten version here…" value={t4CurrentResponse} onChange={e => setT4Responses(prev => ({ ...prev, [t4CurrentStimulus.id]: e.target.value }))} onInput={resizeTextareaToContent} />
        </div>
        <div className="challenge-nav">
          <button className="challenge-nav-btn secondary" disabled={t4CurrentIdx === 0} onClick={() => setT4CurrentIdx(i => i - 1)}>← Previous</button>
          {t4CurrentIdx < t4Stimuli.length - 1 ? (
            <button className="challenge-nav-btn primary" disabled={!t4CurrentResponse.trim()} onClick={() => setT4CurrentIdx(i => i + 1)}>Next →</button>
          ) : (
            <button className="challenge-nav-btn primary" disabled={!t4AllDone} onClick={submitT4}>Submit All →</button>
          )}
        </div>
      </div>
    </main>
  );
  if (phase === "t4-diagnosing") return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /><p>Analysing your transformations…</p></div></main>);
  if (phase === "t4-results" && t4Config) {
    const t4TranscriptMsgs: Message[] = t4Stimuli.flatMap(s => [
      { role: "assistant" as const, content: `[${s.label}] ${s.instruction}\n\nOriginal: "${s.stimulus}"` },
      { role: "user" as const, content: t4Responses[s.id] || "(no response)" },
    ]);
    return wrap(<main className="results-page">{renderResultsDashboard("Task 4 · Rephrase & Adjust Results", 4, t4Config, t4Diagnosis, t4Form, t4Expanded, setT4Expanded, t4ShowTranscript, setT4ShowTranscript, t4TranscriptMsgs, () => setPhase("t5-briefing"), "Continue to Task 5 →")}</main>);
  }

  /* ── TASK 5 ────────────────────────────────────────────────────────── */
  if (phase === "t5-briefing") return wrap(
    <main className="split-briefing-container split-briefing-task5">
      <div className="split-briefing-inner animate-fade-up">
        <div className="sb-left">
          <div className="sb-badge">🔀 Writing Test · Task 5</div>
          <h1 className="sb-title">Compare &amp; <em>Advise</em></h1>
          <p className="sb-subtitle">Two options + chat · 4–5 minutes</p>
          <div className="sb-section">
            <div className="sb-section-title">What you&apos;ll do</div>
            <div className="sb-section-body">You&apos;ll see two options shown side by side (like two cards). Then you&apos;ll chat in writing about them — comparing them and suggesting which might suit someone better.</div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">How the chat works</div>
            <div className="sb-section-body">The AI will describe different people or situations and ask for your recommendation. The situation may change — you might need to rethink your advice when the details change.</div>
          </div>
          <div className="sb-section">
            <div className="sb-section-title">What to focus on</div>
            <div className="sb-section-body">Explain your thinking in plain language. Compare the options when it helps, and say why a choice fits (or doesn&apos;t fit) the person or context you&apos;re given.</div>
          </div>
          <div className="sb-reassurance">It&apos;s fine to ask for clarification in the chat if something is unclear.</div>
          <button onClick={startT5} className="sb-start-btn">See the options <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
          <button type="button" className="skip-task-btn" onClick={() => setPhase("final-report")}>Skip this task →</button>
        </div>
        <div className="sb-right">
          <div className="sb-right-label">Stakeholder Context</div>
          <div className="sb-right-section"><div className="sb-right-section-title">Why this task exists</div><div className="sb-right-section-body">It tests <strong>mediating</strong> — helping someone decide by selecting and adapting information, not only listing facts.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">Why situational advice</div><div className="sb-right-section-body">Advisory dialogue shows selective relay and adaptation: candidates must tune recommendations to goals and constraints. Static compare-and-contrast essays rarely show that flexibility.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">How ability is elicited</div><div className="sb-right-section-body">Changing scenarios probe whether advice shifts when priorities change — evidence of responsive mediation rather than a single rehearsed answer.</div></div>
          <div className="sb-right-section"><div className="sb-right-section-title">How it is scored</div><div className="sb-right-section-body">The exchange is reviewed for evidence against the mediating claims:<div className="sb-verdict-row"><div className="sb-verdict"><span className="sb-verdict-tag can">Confirmed</span> demonstrated clearly under demand</div><div className="sb-verdict"><span className="sb-verdict-tag not-yet">Not demonstrated</span> not consistently evidenced</div></div></div></div>
        </div>
      </div>
    </main>
  );
  if (phase === "t5-loading") return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /><p>Preparing your options…</p></div></main>);
  if (phase === "t5-conversation" && t5StimulusSet) return wrap(
    <div className="t5-split">
      <div className="t5-cards-bar">{renderT5Card(t5StimulusSet.cardA)}{renderT5Card(t5StimulusSet.cardB)}</div>
      <div className="t5-chat-area t5-accent">{renderPhoneChat("Adviser", "Task 5 · Compare & Advise", t5Messages, t5Input, setT5Input, t5Processing, t5DoneRef, sendT5, t5ExchangeCount, t5Config?.meta?.maxExchanges || 12, undefined, () => { void finishT5(t5Messages, t5ExchangeCount); })}</div>
    </div>
  );
  if (phase === "t5-diagnosing") return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /><p>Analysing your advice…</p></div></main>);
  if (phase === "t5-results" && t5Config) return wrap(<main className="results-page">{renderResultsDashboard("Task 5 · Compare & Advise Results", 5, t5Config, t5Diagnosis, t5Form, t5Expanded, setT5Expanded, t5ShowTranscript, setT5ShowTranscript, t5Messages, () => setPhase("final-report"), "View Full Report →")}</main>);

  /* ── FINAL REPORT ──────────────────────────────────────────────────── */
  if (phase === "final-report") {
    type FnEntry = { fn: string; task: string; level: string; taskNum: number };
    const fnEntries: FnEntry[] = [];
    const addFn = (diag: Diagnosis | null, taskLabel: string, taskNum: number, fns: string[]) => {
      if (!diag?.results) return;
      const levelOrder = ["Below A1", "A1", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C2"];
      for (const fn of fns) {
        const macros = diag.results.filter(r => r.fn === fn && r.result === "CONFIRMED");
        if (macros.length === 0) { fnEntries.push({ fn, task: taskLabel, level: "—", taskNum }); continue; }
        const highest = macros.reduce((best, m) => { const bi = levelOrder.indexOf(best.level); const mi = levelOrder.indexOf(m.level); return mi > bi ? m : best; }, macros[0]);
        fnEntries.push({ fn, task: taskLabel, level: highest.level, taskNum });
      }
    };
    addFn(t1Diagnosis, "Task 1", 1, ["Interactional", "Informing"]);
    addFn(t2Diagnosis, "Task 2", 2, ["Informing", "Narrating"]);
    addFn(t3Diagnosis, "Task 3", 3, ["Expressing", "Arguing"]);
    addFn(t4Diagnosis, "Task 4", 4, ["Mediating"]);
    addFn(t5Diagnosis, "Task 5", 5, ["Mediating", "Informing", "Directing"]);
    const levelOrder = ["—", "Below A1", "A1", "A2", "A2+", "B1", "B1+", "B2", "B2+", "C1", "C2"];
    const fnMap = new Map<string, FnEntry>();
    for (const e of fnEntries) { const existing = fnMap.get(e.fn); if (!existing || levelOrder.indexOf(e.level) > levelOrder.indexOf(existing.level)) { fnMap.set(e.fn, e); } }
    const fnSummary = Array.from(fnMap.values());
    const confirmedLevels = fnSummary.map(f => f.level).filter(l => l !== "—");
    const overallFn = medianCefrLevel(confirmedLevels, levelOrder);
    type FormEntry = { dimension: string; level: string; descriptor: string; source: string };
    const formEntries: FormEntry[] = [];
    const addForm = (form: FormAnalysis | null, src: string) => { if (!form?.dimensions) return; for (const d of form.dimensions) { formEntries.push({ dimension: d.dimension, level: d.level, descriptor: d.descriptor, source: src }); } };
    addForm(t1Form, "T1"); addForm(t2Form, "T2"); addForm(t3Form, "T3"); addForm(t4Form, "T4"); addForm(t5Form, "T5");
    const dimMap = new Map<string, FormEntry>();
    for (const e of formEntries) { const existing = dimMap.get(e.dimension); if (!existing || levelOrder.indexOf(e.level) > levelOrder.indexOf(existing.level)) { dimMap.set(e.dimension, e); } }
    const formSummary = Array.from(dimMap.values());
    const overallFormLevels = formSummary.map(f => f.level).filter(l => levelOrder.indexOf(l) > 0);
    const overallForm = medianCefrLevel(overallFormLevels, levelOrder);
    const nextSteps = getNextSteps([t1Diagnosis, t2Diagnosis, t3Diagnosis, t4Diagnosis, t5Diagnosis], formSummary.map(f => ({ dimension: f.dimension, level: f.level, descriptor: f.descriptor })));
    const taskNumsForFn = (fn: string) => [...new Set(fnEntries.filter(e => e.fn === fn).map(e => e.taskNum))].sort((a, b) => a - b);
    const finalReportTaskFns: Record<number, string[]> = {
      1: ["Interactional", "Informing"],
      2: ["Informing", "Narrating"],
      3: ["Expressing", "Arguing"],
      4: ["Mediating"],
      5: ["Mediating", "Informing", "Directing"],
    };
    const taskDiagnoses: { num: number; diag: Diagnosis | null }[] = [
      { num: 1, diag: t1Diagnosis },
      { num: 2, diag: t2Diagnosis },
      { num: 3, diag: t3Diagnosis },
      { num: 4, diag: t4Diagnosis },
      { num: 5, diag: t5Diagnosis },
    ];

    return wrap(
      <main className="report-page">
        <nav className="report-nav">
          <div className="report-nav-logo">FEAT <em>Writing Test</em></div>
          <div className="report-nav-tag">Final Report</div>
        </nav>
        <header className="final-report-hero animate-fade-up">
          <div className="final-report-hero-inner">
            <div className="final-report-hero-left">
              <div className="final-report-eyebrow">Assessment complete — 5 tasks</div>
              <h1 className="final-report-title">Your <em>Writing Profile</em></h1>
              <p className="final-report-sub">7 communicative functions tested across 5 tasks · 5 language dimensions</p>
            </div>
            <div className="final-report-hero-metrics">
              <div className="final-report-metric">
                <div className="final-report-metric-label">Overall function level</div>
                <div className="final-report-metric-value fn">{overallFn}</div>
                <div className="final-report-metric-soft">{overallFn !== "—" ? softenLevel(overallFn) : "—"}</div>
              </div>
              <div className="final-report-metric">
                <div className="final-report-metric-label">Overall form level</div>
                <div className="final-report-metric-value form">{overallForm}</div>
                <div className="final-report-metric-soft">{overallForm !== "—" ? softenLevel(overallForm) : "—"}</div>
              </div>
            </div>
          </div>
        </header>
        <div className="final-report-body">
          <div className="final-report-col-left">
            <section className="final-report-section animate-fade-up" style={{ animationDelay: "80ms" }}>
              <h2 className="final-report-section-title">What you can do — all functions</h2>
              {FINAL_REPORT_ALL_FUNCTIONS.map(fnName => {
                const row = fnMap.get(fnName);
                const lvl = row?.level ?? "—";
                const pct = lvl === "—" ? 0 : levelToPercent(lvl);
                const src = formatFinalReportTaskSource(taskNumsForFn(fnName));
                return (
                  <div className="final-report-bar-row" key={fnName}>
                    <div className="final-report-bar-name">{fnName}</div>
                    <div className="final-report-bar-src">{src}</div>
                    <div className="final-report-bar-track">
                      <div className="final-report-bar-fill" style={{ width: `${pct}%`, background: lvl === "—" ? "transparent" : barColor(lvl) }} />
                    </div>
                    <div className="final-report-bar-level">{lvl === "—" ? "—" : lvl}</div>
                  </div>
                );
              })}
            </section>
            <section className="final-report-section animate-fade-up" style={{ animationDelay: "140ms" }}>
              <h2 className="final-report-section-title">How you communicate</h2>
              {formSummary.map((dim, i) => (
                <div key={dim.dimension} className="form-dim-row">
                  <div className="form-dim-name-new">{dim.dimension}</div>
                  <div className="form-dim-bar-new">
                    <div className="form-dim-bar-fill-new" style={{ width: `${levelToPercent(dim.level)}%`, background: barColor(dim.level), animationDelay: `${i * 0.08}s` }} />
                  </div>
                  <div className="form-dim-level-new">{dim.level}</div>
                  <div className="form-dim-desc-new">{dim.descriptor}</div>
                </div>
              ))}
            </section>
            <section className="final-report-section animate-fade-up" style={{ animationDelay: "200ms" }}>
              <h2 className="final-report-section-title">What to improve next</h2>
              {nextSteps.map((s, i) => (
                <div key={i} className="final-report-improve-item">{s}</div>
              ))}
            </section>
          </div>
          <aside className="final-report-col-right animate-fade-up" style={{ animationDelay: "120ms" }}>
            <h2 className="final-report-section-title">By task</h2>
            {taskDiagnoses.map(({ num, diag }) => {
              if (!diag?.results?.length) return null;
              const meta = TASK_META[num];
              const fns = finalReportTaskFns[num] ?? meta?.functions ?? [];
              return (
                <div className="final-report-task" key={num}>
                  <div className="final-report-task-label">
                    T{num}
                    {meta?.label ? ` · ${meta.label}` : ""}
                  </div>
                  {fns.map(fn => {
                    const lvl = getConfirmedFnLevelForTask(diag, fn);
                    return (
                      <div className="final-report-task-fn" key={fn}>
                        <span className="final-report-task-fn-name">{fn}</span>
                        <span className="final-report-task-fn-lvl" style={{ color: finalReportLevelColor(lvl) }}>{lvl}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </aside>
        </div>
      </main>
    );
  }

  return wrap(<main className="diagnosing-container"><p>Something went wrong.</p></main>);
}