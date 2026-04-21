"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { FormAnalysis } from "../_shared/types";
import { getAllTaskSamples, clearTaskSamples, type TaskSample } from "../_shared/sampleStore";
import { levelToPercent, barColor } from "../_shared/helpers";

type ReportPhase = "loading" | "empty" | "analysing" | "done" | "error";

export default function WritingReportPage() {
  const [phase, setPhase] = useState<ReportPhase>("loading");
  const [tasks, setTasks] = useState<TaskSample[]>([]);
  const [form, setForm] = useState<FormAnalysis | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const stored = getAllTaskSamples();
    setTasks(stored);
    if (stored.length === 0) {
      setPhase("empty");
      return;
    }
    runAnalysis(stored);
  }, []);

  const runAnalysis = async (stored: TaskSample[]) => {
    setPhase("analysing");
    try {
      const res = await fetch("/api/writing-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: stored }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data?.error ?? "Could not generate the language report.");
        setPhase("error");
        return;
      }
      const data = await res.json();
      setForm(data.formAnalysis ?? null);
      if (data?.meta?.wordCount) setWordCount(data.meta.wordCount);
      setPhase("done");
    } catch {
      setErrorMsg("Network error while generating the report.");
      setPhase("error");
    }
  };

  const resetAll = () => {
    clearTaskSamples();
    setTasks([]);
    setForm(null);
    setPhase("empty");
  };

  const wrap = (children: React.ReactNode) => <div className="stakeholder-theme">{children}</div>;

  if (phase === "loading" || phase === "analysing") {
    return wrap(
      <main className="diagnosing-container">
        <div className="diagnosing-inner animate-fade-up">
          <div className="spinner" style={{ margin: "0 auto" }} />
          <p>{phase === "analysing" ? "Analysing your language across all tasks…" : "Loading…"}</p>
        </div>
      </main>
    );
  }

  if (phase === "empty") {
    return wrap(
      <main className="results-page">
        <nav className="results-nav">
          <div className="results-nav-logo">FEAT <em>Writing Test</em></div>
          <div className="results-nav-tag">Final Language Report</div>
        </nav>
        <div className="results-hero-new animate-fade-up" style={{ textAlign: "center" }}>
          <div className="results-hero-task">
            <div className="results-hero-eyebrow">No samples yet</div>
            <div className="results-hero-title">Complete some <em>tasks</em> first</div>
            <p className="results-summary-text">
              The final language report pools the writing you produced across tasks 1–5.
              Finish one or more tasks, then come back here.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
              <Link href="/writing" className="btn-continue-new">Back to tasks</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "error") {
    return wrap(
      <main className="results-page">
        <nav className="results-nav">
          <div className="results-nav-logo">FEAT <em>Writing Test</em></div>
          <div className="results-nav-tag">Final Language Report</div>
        </nav>
        <div className="results-hero-new animate-fade-up">
          <div className="results-hero-task">
            <div className="results-hero-eyebrow">Something went wrong</div>
            <div className="results-hero-title">Couldn&apos;t build <em>your report</em></div>
            <p className="results-summary-text">{errorMsg}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={() => runAnalysis(tasks)} className="btn-continue-new">Try again</button>
              <Link href="/writing" className="btn-continue-new" style={{ background: "#64748b" }}>Back to tasks</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // phase === "done"
  const level = form?.overallFormLevel ?? "—";
  const dims = form?.dimensions ?? [];

  return wrap(
    <main className="results-page">
      <nav className="results-nav">
        <div className="results-nav-logo">FEAT <em>Writing Test</em></div>
        <div className="results-nav-tag">Final Language Report</div>
      </nav>

      <div className="results-hero-new animate-fade-up">
        <div className="results-hero-task">
          <div className="results-hero-eyebrow">
            Pooled across {tasks.length} task{tasks.length === 1 ? "" : "s"}
            {wordCount > 0 ? ` · ~${wordCount} words analysed` : ""}
          </div>
          <div className="results-hero-title">Your Overall <em>Language</em></div>
          <p className="results-summary-text">
            {form?.overallFormSummary ?? "Language assessment complete."}
          </p>
        </div>
        <div className="results-score-block">
          <div className="results-score-item">
            <div className="results-score-label">Overall language level</div>
            <div className="results-score-value form">{level}</div>
            <div className="results-score-sub">across all samples</div>
          </div>
        </div>
      </div>

      <div className="results-split">
        <div className="results-left">
          {dims.length > 0 && (
            <div className="results-section animate-fade-up" style={{ animationDelay: "100ms" }}>
              <div className="results-section-title">How you communicate</div>
              {dims.map((dim, i) => (
                <div key={dim.dimension} className="form-dim-card">
                  <div className="form-dim-card-header">
                    <div className="form-dim-name-new">{dim.dimension}</div>
                    <div className="form-dim-bar-new">
                      <div className="form-dim-bar-fill-new" style={{ width: `${levelToPercent(dim.level)}%`, background: barColor(dim.level), animationDelay: `${i * .1}s` }} />
                    </div>
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

          <div className="results-section animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="results-section-title">Tasks included</div>
            <ul className="learner-can-list">
              {tasks.map((t) => (
                <li key={t.taskId} className="learner-can-item">
                  <strong>{t.taskLabel}</strong> — {t.samples.length} sample{t.samples.length === 1 ? "" : "s"}
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "300ms", marginTop: 16, display: "flex", gap: 12 }}>
            <Link href="/writing" className="btn-continue-new">Back to tasks</Link>
            <button onClick={resetAll} className="btn-continue-new" style={{ background: "#64748b" }}>
              Clear samples & restart
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
