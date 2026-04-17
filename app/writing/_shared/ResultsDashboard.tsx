"use client";

import React from "react";
import type { Message, TaskConfig, Diagnosis, FormAnalysis } from "./types";
import { TASK_META, levelToScore10, softenLevel, levelToPercent, barColor } from "./helpers";
import { getLearnerCapabilitySections, getLearnerImprovementHints } from "./learnerCaps";
import { levelLabel } from "./helpers";

interface ResultsDashboardProps {
  taskLabel: string;
  taskNum: number;
  config: TaskConfig;
  diagnosis: Diagnosis | null;
  form: FormAnalysis | null;
  messages: Message[];
  expanded: Set<string>;
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>;
  showTranscript: boolean;
  setShowTranscript: React.Dispatch<React.SetStateAction<boolean>>;
  showWriting?: boolean;
  setShowWriting?: React.Dispatch<React.SetStateAction<boolean>>;
  writtenText?: string;
  nextAction?: () => void;
  nextLabel?: string;
}

export function ResultsDashboard({
  taskLabel,
  taskNum,
  config,
  diagnosis,
  form,
  messages,
  expanded,
  setExpanded,
  showTranscript,
  setShowTranscript,
  showWriting,
  setShowWriting,
  writtenText,
  nextAction,
  nextLabel,
}: ResultsDashboardProps) {
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
          {form && (<>
          <div className="results-score-divider" />
          <div className="results-score-item"><div className="results-score-label">{taskNum === 4 ? "Language control" : "Language"}</div><div className="results-score-value form">{formLevel}</div><div className="results-score-sub">{taskNum === 4 ? "in your rewrites" : "form level"}</div></div>
          </>)}
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

          {form && form.dimensions && form.dimensions.length > 0 && (
          <div className="results-section animate-fade-up" style={{ animationDelay: taskNum === 4 ? "300ms" : "200ms" }}>
            <div className="results-section-title">{taskNum === 4 ? "Language control in your rewrites" : "How you communicate"}</div>
            {form?.dimensions?.map((dim, i) => (
              <div key={dim.dimension} className="form-dim-card">
                <div className="form-dim-card-header">
                  <div className="form-dim-name-new">{dim.dimension}</div>
                  <div className="form-dim-bar-new"><div className="form-dim-bar-fill-new" style={{ width: `${levelToPercent(dim.level)}%`, background: barColor(dim.level), animationDelay: `${i * .1}s` }} /></div>
                  <div className="form-dim-level-new">{dim.level}</div>
                </div>
                {dim.levelMeaning && (
                  <div className="form-dim-meaning">{dim.level} means: {dim.levelMeaning}</div>
                )}
                <div className="form-dim-desc-new">{dim.descriptor}</div>
                {dim.examples && dim.examples.length > 0 && (
                  <div className="form-dim-evidence">
                    <span className="form-dim-evidence-label">Evidence: </span>
                    {dim.examples.map((ex, j) => (
                      <span key={j} className="form-dim-evidence-quote">&ldquo;{ex}&rdquo;{j < dim.examples.length - 1 ? " · " : ""}</span>
                    ))}
                  </div>
                )}
                {dim.outliers && dim.outliers.length > 0 && (
                  <div className="form-dim-outliers">
                    <span className="form-dim-outliers-label">Reaching above your level: </span>
                    {dim.outliers.map((ol, j) => (
                      <span key={j} className="form-dim-outliers-quote">&ldquo;{ol}&rdquo;{j < dim.outliers!.length - 1 ? " · " : ""}</span>
                    ))}
                  </div>
                )}
                {dim.dimension === "Vocabulary Range" && dim.vocabRange && dim.vocabRange !== dim.level && (
                  <div className="form-dim-vocab-split">
                    <div className="form-dim-vocab-metric">
                      <div className="form-dim-vocab-metric-label">Range (highest demonstrated)</div>
                      <div className={`form-dim-vocab-metric-value${dim.vocabRange !== dim.level ? " reaching" : ""}`}>{dim.vocabRange}</div>
                    </div>
                    <div className="form-dim-vocab-metric">
                      <div className="form-dim-vocab-metric-label">Consistency</div>
                      <div className="form-dim-vocab-metric-value">{dim.vocabConsistency === "consistent" ? "Sustained throughout" : dim.vocabConsistency === "occasional" ? "Appears 2–3 times" : "Isolated moments"}</div>
                    </div>
                  </div>
                )}
                {dim.strengthNote && (
                  <div className="form-dim-strength">What went well: {dim.strengthNote}</div>
                )}
                {dim.focusNext && (
                  <div className="form-dim-focus">Next time, focus on: {dim.focusNext}</div>
                )}
              </div>
            ))}
          </div>

          )}

          <div className="results-section animate-fade-up" style={{ animationDelay: "350ms" }}>
            <div className="results-section-title">Overall language report</div>
            <p style={{ fontSize: ".8rem", color: "var(--s-text-muted)", lineHeight: 1.55, marginBottom: 10 }}>
              Language ability (grammar, vocabulary, coherence) is now analysed across all tasks together once you&apos;ve finished.
            </p>
            <a href="/writing/report" className="btn-continue-new" style={{ textDecoration: "none", display: "inline-flex" }}>
              See overall language report
            </a>
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
}
