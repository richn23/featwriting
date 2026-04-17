"use client";
import { useEffect, useState } from "react";
import type { TaskDefinition } from "../_tasks/types";
import type { TaskConfig, Diagnosis, StimulusItem, Message } from "./types";
import { resizeTextareaToContent } from "./helpers";
import { writingStyles } from "./styles";
import { ResultsDashboard } from "./ResultsDashboard";
import { saveTaskSamples } from "./sampleStore";

type StimulusPhase = "loading-config" | "briefing" | "loading-stimuli" | "challenges" | "diagnosing" | "results";

interface StimulusTaskProps {
  task: TaskDefinition;
  initialLevel?: string;
}

export function StimulusTask({ task, initialLevel = "B1" }: StimulusTaskProps) {
  const [phase, setPhase] = useState<StimulusPhase>("loading-config");
  const [config, setConfig] = useState<TaskConfig | null>(null);
  const [stimuli, setStimuli] = useState<StimulusItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    fetch(task.descriptorEndpoint).then(r => r.json()).then(d => {
      setConfig(d);
      setPhase("briefing");
    });
  }, [task.descriptorEndpoint]);

  const start = async () => {
    setPhase("loading-stimuli");
    const res = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-stimuli", prevLevel: initialLevel }),
    });
    const data = await res.json();
    if (data.stimuli) {
      setStimuli(data.stimuli);
      setCurrentIdx(0);
      setResponses({});
      setPhase("challenges");
    }
  };

  const currentStimulus = stimuli[currentIdx] || null;
  const currentResponse = currentStimulus ? (responses[currentStimulus.id] || "") : "";
  const allDone = stimuli.length > 0 && stimuli.every(s => (responses[s.id] || "").trim().length > 0);

  const submit = async () => {
    if (!allDone) return;
    setPhase("diagnosing");
    const payload = stimuli.map(s => ({
      stimulusId: s.id, instruction: s.instruction, stimulus: s.stimulus, response: responses[s.id] || "",
    }));
    // Save candidate samples for the final pooled language report
    saveTaskSamples(task.id, task.label, stimuli.map(s => responses[s.id] || ""));
    try {
      const res = await fetch(task.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "diagnose", responses: payload, candidateLevel: initialLevel }),
      });
      const data = await res.json();
      if (data.diagnosis) {
        setDiagnosis(data.diagnosis);
        // Language/form analysis moved to final cross-task report — don't set per-task.
      }
      setPhase("results");
    } catch {
      setPhase("results");
    }
  };

  const S = <style dangerouslySetInnerHTML={{ __html: writingStyles }} />;
  const wrap = (children: React.ReactNode) => <div className="stakeholder-theme">{S}{children}</div>;

  if (phase === "loading-config" || !config) {
    return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /></div></main>);
  }

  if (phase === "briefing") {
    const { badge, titlePrefix, titleEmphasis, subtitle, sections, reassurance, startButtonLabel, extraBriefingClass } = task.briefing;
    return wrap(
      <main className={`split-briefing-container ${extraBriefingClass || ""}`}>
        <div className="split-briefing-inner animate-fade-up">
          <div className="sb-left">
            <div className="sb-badge">{badge}</div>
            <h1 className="sb-title">{titlePrefix} &amp; <em>{titleEmphasis}</em></h1>
            <p className="sb-subtitle">{subtitle}</p>
            {sections.map((section, i) => (
              <div key={i} className="sb-section">
                <div className="sb-section-title">{section.title}</div>
                <div className="sb-section-body">{section.body}</div>
              </div>
            ))}
            <div className="sb-reassurance">{reassurance}</div>
            <button onClick={start} className="sb-start-btn">{startButtonLabel} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
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
  }

  if (phase === "loading-stimuli") {
    return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /><p>Preparing your challenges…</p></div></main>);
  }

  if (phase === "challenges" && currentStimulus) {
    return wrap(
      <main className="challenge-page">
        <div className="challenge-header animate-fade-up">
          <h2>Challenge {currentIdx + 1} of {stimuli.length}</h2>
          <p>Read the original text, then rewrite it as instructed.</p>
          <div className="challenge-progress">{stimuli.map((_, i) => (<div key={i} className={`challenge-dot ${i === currentIdx ? "active" : (responses[stimuli[i].id] || "").trim() ? "done" : ""}`} />))}</div>
        </div>
        <div className="challenge-card">
          <div className="challenge-stimulus-area">
            <span className={`challenge-type-tag ${currentStimulus.type}`}>{currentStimulus.type === "simplify" ? "✨ Simplify" : currentStimulus.type === "formalise" ? "👔 Formalise" : currentStimulus.type === "audience" ? "👥 Audience" : "🎭 Tone"}</span>
            <div className="challenge-instruction">{currentStimulus.instruction}</div>
            <div className="challenge-stimulus-box"><div className="challenge-stimulus-label">Original text</div><div className="challenge-stimulus-text">{currentStimulus.stimulus}</div></div>
          </div>
          <div className="challenge-response-area">
            <div className="challenge-response-label">Your version</div>
            <textarea key={currentStimulus.id} className="challenge-textarea" placeholder="Write your rewritten version here…" value={currentResponse} onChange={e => setResponses(prev => ({ ...prev, [currentStimulus.id]: e.target.value }))} onInput={resizeTextareaToContent} />
          </div>
          <div className="challenge-nav">
            <button className="challenge-nav-btn secondary" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}>← Previous</button>
            {currentIdx < stimuli.length - 1 ? (
              <button className="challenge-nav-btn primary" disabled={!currentResponse.trim()} onClick={() => setCurrentIdx(i => i + 1)}>Next →</button>
            ) : (
              <button className="challenge-nav-btn primary" disabled={!allDone} onClick={submit}>Submit All →</button>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (phase === "diagnosing") {
    return wrap(<main className="diagnosing-container"><div className="diagnosing-inner animate-fade-up"><div className="spinner" style={{ margin: "0 auto" }} /><p>Analysing your transformations…</p></div></main>);
  }


  if (phase === "results") {
    const transcriptMsgs: Message[] = stimuli.flatMap(s => [
      { role: "assistant" as const, content: `[${s.label}] ${s.instruction}\n\nOriginal: "${s.stimulus}"` },
      { role: "user" as const, content: responses[s.id] || "(no response)" },
    ]);
    return wrap(
      <main className="results-page">
        <ResultsDashboard
          taskLabel={`${task.label} Results`}
          taskNum={task.taskNum}
          config={config}
          diagnosis={diagnosis}
          form={null}
          expanded={expanded}
          setExpanded={setExpanded}
          showTranscript={showTranscript}
          setShowTranscript={setShowTranscript}
          messages={transcriptMsgs}
        />
      </main>
    );
  }

  return null;
}
