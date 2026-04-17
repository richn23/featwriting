"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import type { ScenarioTaskDef, Screen } from "./scenario-types";
import { writingStyles } from "./styles";

// ─── Word counter ──────────────────────────────────────────────
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Component ─────────────────────────────────────────────────

interface Props { task: ScenarioTaskDef }

type Answer = {
  screenIndex: number;
  choice?: string;
  selections?: string[];
  text?: string;
  ranking?: string[];
};

export function ScenarioTask({ task }: Props) {
  const [screenIdx, setScreenIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentChoice, setCurrentChoice] = useState<string>("");
  const [currentSelections, setCurrentSelections] = useState<Set<string>>(new Set());
  const [currentText, setCurrentText] = useState("");
  const [currentJustification, setCurrentJustification] = useState("");
  const [currentRanking, setCurrentRanking] = useState<string[]>([]);
  const [phase, setPhase] = useState<"active" | "results">("active");
  const dragItem = useRef<number | null>(null);

  const screen = task.screens[screenIdx];
  const isLast = screenIdx === task.screens.length - 1;

  const saveAnswer = (extra?: Partial<Answer>) => {
    const a: Answer = { screenIndex: screenIdx, ...extra };
    if (currentChoice) a.choice = currentChoice;
    if (currentSelections.size > 0) a.selections = [...currentSelections];
    if (currentText) a.text = currentText;
    if (currentJustification) a.text = (a.text ? a.text + "\n---\n" : "") + currentJustification;
    if (currentRanking.length > 0) a.ranking = currentRanking;
    setAnswers(prev => [...prev, a]);
  };

  const next = () => {
    if (screen.kind !== "briefing" && screen.kind !== "scenario" && screen.kind !== "update") {
      saveAnswer();
    }
    if (isLast) {
      if (screen.kind !== "briefing" && screen.kind !== "scenario" && screen.kind !== "update") {
        saveAnswer();
      }
      setPhase("results");
      return;
    }
    setCurrentChoice("");
    setCurrentSelections(new Set());
    setCurrentText("");
    setCurrentJustification("");
    setCurrentRanking([]);
    setScreenIdx(screenIdx + 1);
  };

  const canProceed = (): boolean => {
    if (!screen) return false;
    switch (screen.kind) {
      case "briefing":
      case "scenario":
      case "update":
        return true;
      case "choice":
        return !!currentChoice && (!screen.requireJustification || currentJustification.trim().length > 5);
      case "multi-select": {
        const min = screen.minSelect ?? 1;
        return currentSelections.size >= min && (!screen.requireJustification || currentJustification.trim().length > 5);
      }
      case "short-text":
        return currentText.trim().length > 5 && wordCount(currentText) <= screen.maxWords;
      case "rank":
        return currentRanking.length === screen.items.length && (!screen.requireJustification || currentJustification.trim().length > 5);
      case "evidence-select":
        return !!currentChoice && (!screen.requireJustification || currentJustification.trim().length > 5);
      default:
        return true;
    }
  };

  const accent = task.accentColor;
  const S = <style dangerouslySetInnerHTML={{ __html: writingStyles + scenarioStyles(accent) }} />;
  const wrap = (children: React.ReactNode) => <div className="stakeholder-theme">{S}{children}</div>;

  // ─── RESULTS ──────────────────────────────────────────────────
  if (phase === "results") {
    return wrap(
      <main className="sc-results-page">
        <nav className="results-nav">
          <div className="results-nav-logo">FEAT <em>Writing Test</em></div>
          <div className="results-nav-tag" style={{ color: accent }}>{task.shortTitle}</div>
        </nav>
        <div className="sc-results-hero animate-fade-up">
          <div className="sc-results-badge" style={{ color: accent }}>Task Complete</div>
          <h1 className="sc-results-title">{task.shortTitle} <em>Results</em></h1>
          <p className="sc-results-sub">Here&apos;s how your responses map to the scoring criteria.</p>
        </div>
        <div className="sc-results-grid animate-fade-up" style={{ animationDelay: "100ms" }}>
          {task.scoringDimensions.map((dim, i) => (
            <div key={dim.name} className="sc-results-dim" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="sc-results-dim-name" style={{ color: accent }}>{dim.name}</div>
              <div className="sc-results-dim-desc">{dim.description}</div>
            </div>
          ))}
        </div>
        <div className="sc-results-answers animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="sc-results-answers-title">Your responses</div>
          {answers.map((a, i) => {
            const s = task.screens[a.screenIndex];
            const label = "label" in s ? (s as { label: string }).label : `Screen ${a.screenIndex + 1}`;
            return (
              <div key={i} className="sc-results-answer">
                <div className="sc-results-answer-label">{label}</div>
                {a.choice && <div className="sc-results-answer-val">Selected: {getOptionText(s, a.choice)}</div>}
                {a.selections && <div className="sc-results-answer-val">Selected: {a.selections.map(id => getOptionText(s, id)).join(", ")}</div>}
                {a.ranking && <div className="sc-results-answer-val">Ranked: {a.ranking.map((id, j) => `${j + 1}. ${getRankText(s, id)}`).join(" → ")}</div>}
                {a.text && <div className="sc-results-answer-text">{a.text}</div>}
              </div>
            );
          })}
        </div>
        <div className="animate-fade-up" style={{ animationDelay: "300ms", textAlign: "center", marginTop: 28 }}>
          <Link href="/writing" className="btn-continue-new">Back to FEAT</Link>
        </div>
      </main>
    );
  }

  // ─── BRIEFING ─────────────────────────────────────────────────
  if (screen.kind === "briefing") {
    return wrap(
      <main className="split-briefing-container">
        <div className="split-briefing-inner animate-fade-up">
          <div className="sb-left">
            <div className="sb-badge" style={{ background: accent + "18", color: accent }}>{screen.badge}</div>
            <h1 className="sb-title">{screen.title} <em style={{ color: accent }}>{screen.titleEmphasis}</em></h1>
            <p className="sb-subtitle">{screen.subtitle}</p>
            <div className="sb-section">
              <div className="sb-section-title">Objective</div>
              <div className="sb-section-body">{screen.objective}</div>
            </div>
            <div className="sb-section">
              <div className="sb-section-title">Performance criteria</div>
              <div className="sb-section-body">
                {screen.criteria.map((c, i) => (
                  <div key={i} className="sc-criterion">
                    <span className="sc-criterion-check" style={{ color: accent }}>✓</span> {c}
                  </div>
                ))}
              </div>
            </div>
            <div className="sb-reassurance">Your responses are scored against these criteria. Take your time.</div>
            <button onClick={next} className="sb-start-btn" style={{ background: accent }}>
              Begin task <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
          <div className="sb-right">
            <div className="sb-right-label">Stakeholder Context</div>
            {screen.stakeholder.map((s, i) => (
              <div key={i} className="sb-right-section">
                <div className="sb-right-section-title">{s.title}</div>
                <div className="sb-right-section-body">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ─── ACTIVE SCREENS ───────────────────────────────────────────
  const progress = ((screenIdx) / (task.screens.length - 1)) * 100;

  return wrap(
    <main className="sc-task-page">
      <nav className="sc-task-nav">
        <div className="sc-task-nav-logo">FEAT <em>Writing Test</em></div>
        <div className="sc-task-nav-info">
          <span style={{ color: accent }}>{task.shortTitle}</span>
          <span className="sc-task-nav-step">{"label" in screen ? (screen as { label: string }).label : ""}</span>
        </div>
      </nav>
      <div className="sc-progress-bar"><div className="sc-progress-fill" style={{ width: `${progress}%`, background: accent }} /></div>

      <div className="sc-screen animate-fade-up" key={screenIdx}>
        {renderScreen(screen, {
          accent,
          currentChoice, setCurrentChoice,
          currentSelections, setCurrentSelections,
          currentText, setCurrentText,
          currentJustification, setCurrentJustification,
          currentRanking, setCurrentRanking,
          dragItem,
        })}

        <div className="sc-actions">
          <button onClick={next} disabled={!canProceed()} className="sc-next-btn" style={{ background: canProceed() ? accent : "#334155" }}>
            {isLast ? "See results" : "Continue"} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </main>
  );
}


// ─── Screen renderers ──────────────────────────────────────────

interface ScreenCtx {
  accent: string;
  currentChoice: string;
  setCurrentChoice: (v: string) => void;
  currentSelections: Set<string>;
  setCurrentSelections: (v: Set<string>) => void;
  currentText: string;
  setCurrentText: (v: string) => void;
  currentJustification: string;
  setCurrentJustification: (v: string) => void;
  currentRanking: string[];
  setCurrentRanking: (v: string[]) => void;
  dragItem: React.MutableRefObject<number | null>;
}

function renderScreen(screen: Screen, ctx: ScreenCtx) {
  switch (screen.kind) {
    case "scenario":
    case "update":
      return (
        <div className="sc-card">
          <div className="sc-card-label" style={{ color: ctx.accent }}>{screen.label}</div>
          <h2 className="sc-card-title">{screen.title}</h2>
          <div className="sc-card-body">{screen.body.split("\n").map((line, i) => <p key={i}>{line || "\u00A0"}</p>)}</div>
          {screen.note && <div className="sc-card-note">{screen.note}</div>}
        </div>
      );

    case "choice":
    case "evidence-select":
      return (
        <div className="sc-card">
          <div className="sc-card-label" style={{ color: ctx.accent }}>{screen.label}</div>
          <h2 className="sc-card-question">{screen.question}</h2>
          <div className="sc-options">
            {screen.options.map(opt => (
              <button
                key={opt.id}
                className={`sc-option ${ctx.currentChoice === opt.id ? "selected" : ""}`}
                style={ctx.currentChoice === opt.id ? { borderColor: ctx.accent, background: ctx.accent + "12" } : {}}
                onClick={() => ctx.setCurrentChoice(opt.id)}
              >
                <span className="sc-option-letter" style={ctx.currentChoice === opt.id ? { background: ctx.accent, color: "#0d1117" } : {}}>{opt.id.toUpperCase()}</span>
                {opt.text}
              </button>
            ))}
          </div>
          {screen.requireJustification && (
            <div className="sc-justify">
              <div className="sc-justify-label">{("justificationPrompt" in screen && screen.justificationPrompt) || "Explain your reasoning."}</div>
              <textarea
                className="sc-textarea"
                value={ctx.currentJustification}
                onChange={e => ctx.setCurrentJustification(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Your reasoning…"
              />
              {"justificationMax" in screen && screen.justificationMax && (
                <div className="sc-word-count">{wordCount(ctx.currentJustification)} / {screen.justificationMax} words</div>
              )}
            </div>
          )}
        </div>
      );

    case "multi-select":
      return (
        <div className="sc-card">
          <div className="sc-card-label" style={{ color: ctx.accent }}>{screen.label}</div>
          <h2 className="sc-card-question">{screen.question}</h2>
          <div className="sc-options">
            {screen.options.map(opt => {
              const selected = ctx.currentSelections.has(opt.id);
              return (
                <button
                  key={opt.id}
                  className={`sc-option ${selected ? "selected" : ""}`}
                  style={selected ? { borderColor: ctx.accent, background: ctx.accent + "12" } : {}}
                  onClick={() => {
                    const next = new Set(ctx.currentSelections);
                    if (next.has(opt.id)) next.delete(opt.id);
                    else if (!screen.maxSelect || next.size < screen.maxSelect) next.add(opt.id);
                    ctx.setCurrentSelections(next);
                  }}
                >
                  <span className="sc-option-check" style={selected ? { background: ctx.accent, color: "#0d1117" } : {}}>
                    {selected ? "✓" : ""}
                  </span>
                  {opt.text}
                </button>
              );
            })}
          </div>
          {screen.minSelect && screen.maxSelect && (
            <div className="sc-select-hint">Select {screen.minSelect}–{screen.maxSelect}</div>
          )}
          {screen.requireJustification && (
            <div className="sc-justify">
              <div className="sc-justify-label">{screen.justificationPrompt || "Explain."}</div>
              <textarea
                className="sc-textarea"
                value={ctx.currentJustification}
                onChange={e => ctx.setCurrentJustification(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Your reasoning…"
              />
            </div>
          )}
        </div>
      );

    case "short-text":
      return (
        <div className="sc-card">
          <div className="sc-card-label" style={{ color: ctx.accent }}>{screen.label}</div>
          <h2 className="sc-card-question">{screen.question}</h2>
          {screen.constraints && screen.constraints.length > 0 && (
            <div className="sc-constraints">
              {screen.constraints.map((c, i) => (
                <div key={i} className="sc-constraint"><span className="sc-constraint-dot" style={{ background: ctx.accent }} />{c}</div>
              ))}
            </div>
          )}
          <textarea
            className="sc-textarea sc-textarea-lg"
            value={ctx.currentText}
            onChange={e => ctx.setCurrentText(e.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Write here…"
          />
          <div className="sc-word-count" style={wordCount(ctx.currentText) > screen.maxWords ? { color: "#ef4444" } : {}}>
            {wordCount(ctx.currentText)} / {screen.maxWords} words
          </div>
        </div>
      );

    case "rank": {
      // Initialise ranking if empty
      if (ctx.currentRanking.length === 0 && screen.items.length > 0) {
        ctx.setCurrentRanking(screen.items.map(it => it.id));
      }
      const items = ctx.currentRanking.length > 0
        ? ctx.currentRanking.map(id => screen.items.find(it => it.id === id)!).filter(Boolean)
        : screen.items;

      const moveItem = (fromIdx: number, toIdx: number) => {
        const arr = [...ctx.currentRanking];
        const [removed] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, removed);
        ctx.setCurrentRanking(arr);
      };

      return (
        <div className="sc-card">
          <div className="sc-card-label" style={{ color: ctx.accent }}>{screen.label}</div>
          <h2 className="sc-card-question">{screen.question}</h2>
          <div className="sc-rank-hint">Drag to reorder, or use the arrows.</div>
          <div className="sc-rank-list">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="sc-rank-item"
                draggable
                onDragStart={() => { ctx.dragItem.current = i; }}
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (ctx.dragItem.current !== null && ctx.dragItem.current !== i) moveItem(ctx.dragItem.current, i); ctx.dragItem.current = null; }}
              >
                <span className="sc-rank-num" style={{ background: ctx.accent + "20", color: ctx.accent }}>{i + 1}</span>
                <span className="sc-rank-text">{item.text}</span>
                <span className="sc-rank-arrows">
                  <button disabled={i === 0} onClick={() => moveItem(i, i - 1)} className="sc-rank-arrow">▲</button>
                  <button disabled={i === items.length - 1} onClick={() => moveItem(i, i + 1)} className="sc-rank-arrow">▼</button>
                </span>
              </div>
            ))}
          </div>
          {screen.requireJustification && (
            <div className="sc-justify">
              <div className="sc-justify-label">{screen.justificationPrompt || "Explain."}</div>
              <textarea
                className="sc-textarea"
                value={ctx.currentJustification}
                onChange={e => ctx.setCurrentJustification(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Your reasoning…"
              />
            </div>
          )}
        </div>
      );
    }

    default:
      return <div className="sc-card"><p>Unknown screen type</p></div>;
  }
}

// ─── Helpers ───────────────────────────────────────────────────

function getOptionText(screen: Screen, id: string): string {
  if ("options" in screen) {
    const opt = (screen as { options: { id: string; text: string }[] }).options.find(o => o.id === id);
    return opt?.text ?? id;
  }
  return id;
}
function getRankText(screen: Screen, id: string): string {
  if ("items" in screen) {
    const item = (screen as { items: { id: string; text: string }[] }).items.find(it => it.id === id);
    return item?.text ?? id;
  }
  return id;
}


// ─── Scenario-specific CSS ─────────────────────────────────────

function scenarioStyles(accent: string): string {
  return `
/* Scenario task page */
.sc-task-page { min-height:100vh; background:var(--s-bg); padding-bottom:80px }
.sc-task-nav { display:flex; align-items:center; justify-content:space-between; padding:16px 32px; border-bottom:1px solid rgba(255,255,255,.06) }
.sc-task-nav-logo { font-family:'DM Serif Display',serif; font-size:1rem; color:var(--s-text) }
.sc-task-nav-logo em { color:var(--s-accent); font-style:italic }
.sc-task-nav-info { display:flex; gap:12px; align-items:center; font-size:.75rem; font-weight:600 }
.sc-task-nav-step { color:var(--s-text-muted); text-transform:uppercase; letter-spacing:.08em; font-size:.65rem }
.sc-progress-bar { height:3px; background:rgba(255,255,255,.06); position:relative }
.sc-progress-fill { height:100%; border-radius:2px; transition:width .4s ease }

/* Screen card */
.sc-screen { max-width:680px; margin:40px auto; padding:0 24px }
.sc-card { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06); border-radius:16px; padding:36px 32px }
.sc-card-label { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; margin-bottom:12px }
.sc-card-title { font-family:'DM Serif Display',serif; font-size:1.4rem; font-weight:400; color:var(--s-text); margin-bottom:20px; letter-spacing:-.02em; line-height:1.3 }
.sc-card-question { font-size:1.05rem; font-weight:600; color:var(--s-text); margin-bottom:20px; line-height:1.5 }
.sc-card-body { font-size:.85rem; line-height:1.75; color:var(--s-text-muted) }
.sc-card-body p { margin-bottom:8px }
.sc-card-note { font-size:.78rem; font-style:italic; color:#64748b; margin-top:16px; padding-top:12px; border-top:1px solid rgba(255,255,255,.04) }

/* Options (choice / multi-select) */
.sc-options { display:flex; flex-direction:column; gap:10px; margin-bottom:16px }
.sc-option { display:flex; align-items:center; gap:14px; padding:14px 18px; border:1px solid rgba(255,255,255,.08); border-radius:10px; background:transparent; color:var(--s-text-muted); font-size:.85rem; line-height:1.5; cursor:pointer; text-align:left; transition:border-color .2s, background .2s }
.sc-option:hover { border-color:rgba(255,255,255,.15) }
.sc-option.selected { color:var(--s-text) }
.sc-option-letter { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; font-size:.7rem; font-weight:700; background:rgba(255,255,255,.06); color:var(--s-text-muted); flex-shrink:0; transition:background .2s, color .2s }
.sc-option-check { display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:6px; font-size:.7rem; font-weight:700; background:rgba(255,255,255,.06); color:transparent; flex-shrink:0; transition:background .2s, color .2s; border:1px solid rgba(255,255,255,.1) }
.sc-select-hint { font-size:.7rem; color:var(--s-text-muted); margin-bottom:12px }

/* Justification */
.sc-justify { margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,.04) }
.sc-justify-label { font-size:.78rem; font-weight:600; color:var(--s-text-muted); margin-bottom:8px }
.sc-textarea { width:100%; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:14px 16px; font-size:.85rem; color:var(--s-text); line-height:1.6; resize:vertical; font-family:inherit }
.sc-textarea:focus { outline:none; border-color:${accent}40 }
.sc-textarea-lg { min-height:120px }
.sc-word-count { font-size:.65rem; color:var(--s-text-muted); margin-top:6px; text-align:right }

/* Constraints */
.sc-constraints { display:flex; flex-direction:column; gap:6px; margin-bottom:18px; padding:14px 18px; background:rgba(255,255,255,.02); border-radius:10px; border:1px solid rgba(255,255,255,.04) }
.sc-constraint { display:flex; align-items:center; gap:10px; font-size:.78rem; color:var(--s-text-muted); line-height:1.5 }
.sc-constraint-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0 }

/* Ranking */
.sc-rank-hint { font-size:.72rem; color:var(--s-text-muted); margin-bottom:12px }
.sc-rank-list { display:flex; flex-direction:column; gap:8px; margin-bottom:16px }
.sc-rank-item { display:flex; align-items:center; gap:12px; padding:12px 16px; border:1px solid rgba(255,255,255,.08); border-radius:10px; cursor:grab; transition:border-color .2s }
.sc-rank-item:hover { border-color:rgba(255,255,255,.15) }
.sc-rank-num { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:8px; font-size:.7rem; font-weight:700; flex-shrink:0 }
.sc-rank-text { flex:1; font-size:.83rem; color:var(--s-text-muted); line-height:1.5 }
.sc-rank-arrows { display:flex; flex-direction:column; gap:2px }
.sc-rank-arrow { background:none; border:none; color:var(--s-text-muted); cursor:pointer; font-size:.6rem; padding:2px 6px; opacity:.5; transition:opacity .2s }
.sc-rank-arrow:hover:not(:disabled) { opacity:1 }
.sc-rank-arrow:disabled { opacity:.15; cursor:default }

/* Actions */
.sc-actions { display:flex; justify-content:flex-end; margin-top:24px }
.sc-next-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 28px; border:none; border-radius:10px; font-size:.85rem; font-weight:600; color:#0d1117; cursor:pointer; transition:opacity .2s }
.sc-next-btn:disabled { opacity:.4; cursor:default }
.sc-next-btn:not(:disabled):hover { opacity:.9 }

/* Briefing criteria */
.sc-criterion { display:flex; align-items:flex-start; gap:8px; font-size:.82rem; line-height:1.6; color:var(--s-text-muted); margin-bottom:4px }
.sc-criterion-check { font-weight:700; flex-shrink:0 }

/* Results */
.sc-results-page { min-height:100vh; background:var(--s-bg); padding:0 24px 80px }
.sc-results-hero { text-align:center; padding:48px 0 32px }
.sc-results-badge { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.14em; margin-bottom:12px }
.sc-results-title { font-family:'DM Serif Display',serif; font-size:clamp(1.6rem,3.5vw,2.2rem); font-weight:400; color:var(--s-text); letter-spacing:-.02em; line-height:1.2 }
.sc-results-title em { color:${accent}; font-style:italic }
.sc-results-sub { font-size:.88rem; color:var(--s-text-muted); margin-top:12px; line-height:1.6 }
.sc-results-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; max-width:800px; margin:0 auto 36px }
.sc-results-dim { padding:20px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06); border-radius:12px }
.sc-results-dim-name { font-size:.78rem; font-weight:700; margin-bottom:6px }
.sc-results-dim-desc { font-size:.75rem; color:var(--s-text-muted); line-height:1.55 }
.sc-results-answers { max-width:700px; margin:0 auto }
.sc-results-answers-title { font-size:.85rem; font-weight:700; color:var(--s-text); margin-bottom:16px; text-transform:uppercase; letter-spacing:.08em }
.sc-results-answer { padding:16px 20px; background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.04); border-radius:10px; margin-bottom:10px }
.sc-results-answer-label { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:${accent}; margin-bottom:6px }
.sc-results-answer-val { font-size:.8rem; color:var(--s-text-muted); line-height:1.55; margin-bottom:4px }
.sc-results-answer-text { font-size:.8rem; color:var(--s-text); line-height:1.65; white-space:pre-wrap; padding-top:6px; border-top:1px solid rgba(255,255,255,.04); margin-top:6px }
`;
}
