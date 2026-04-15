"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import type { TaskDefinition } from "../_tasks/types";
import type { TaskConfig, Diagnosis, Message, WritingPrompt } from "./types";
import { writingStyles } from "./styles";
import { resizeTextareaToContent } from "./helpers";
import { PhoneChat } from "./PhoneChat";
import { ResultsDashboard } from "./ResultsDashboard";
import { saveTaskSamples } from "./sampleStore";

type ExtendedWritePhase = "loading-config" | "briefing" | "scaffolding" | "generating-prompt" | "writing" | "diagnosing" | "results";

interface ExtendedWriteTaskProps {
  task: TaskDefinition;
}

export function ExtendedWriteTask({ task }: ExtendedWriteTaskProps) {
  const [phase, setPhase] = useState<ExtendedWritePhase>("loading-config");
  const [config, setConfig] = useState<TaskConfig | null>(null);
  const [scaffoldMsgs, setScaffoldMsgs] = useState<Message[]>([]);
  const [scaffoldInput, setScaffoldInput] = useState("");
  const [scaffoldProcessing, setScaffoldProcessing] = useState(false);
  const [scaffoldCount, setScaffoldCount] = useState(0);
  const scaffoldDoneRef = useRef(false);
  const [topic, setTopic] = useState<unknown | null>(null);
  const [prompt, setPrompt] = useState<WritingPrompt | null>(null);
  const [writtenText, setWrittenText] = useState("");
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);
  const [showWriting, setShowWriting] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    fetch(task.descriptorEndpoint)
      .then(r => r.json())
      .then(d => {
        setConfig(d);
        setPhase("briefing");
      });
  }, [task.descriptorEndpoint]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scaffoldMsgs, scaffoldProcessing]);

  const wordCount = writtenText.trim().split(/\s+/).filter(w => w.length > 0).length;

  const start = async () => {
    scaffoldDoneRef.current = false;
    setPhase("scaffolding");
    setScaffoldProcessing(true);
    const res = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "scaffold", messages: [], exchangeCount: 0 }),
    });
    const data = await res.json();
    if (data.topic) setTopic(data.topic);
    setScaffoldMsgs([{ role: "assistant", content: data.message }]);
    setScaffoldProcessing(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendScaffold = async () => {
    const text = scaffoldInput.trim();
    if (!text || scaffoldProcessing || scaffoldDoneRef.current) return;
    setScaffoldInput("");
    setScaffoldProcessing(true);
    const userMsg: Message = { role: "user", content: text };
    const newMsgs = [...scaffoldMsgs, userMsg];
    setScaffoldMsgs(newMsgs);
    const nextCount = scaffoldCount + 1;
    setScaffoldCount(nextCount);
    const res = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "scaffold", messages: newMsgs, exchangeCount: nextCount, topic }),
    });
    const data = await res.json();
    if (data.topic) setTopic(data.topic);
    const updated = [...newMsgs, { role: "assistant" as const, content: data.message }];
    setScaffoldMsgs(updated);
    if (data.scaffoldDone || nextCount >= 4) {
      scaffoldDoneRef.current = true;
      setScaffoldProcessing(false);
      await generatePrompt(updated);
      return;
    }
    setScaffoldProcessing(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const generatePrompt = async (scaffoldMsgs: Message[]) => {
    setPhase("generating-prompt");
    try {
      const res = await fetch(task.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-prompt", messages: scaffoldMsgs, topic }),
      });
      const data = await res.json();
      if (data.prompt) setPrompt(data.prompt);
      setPhase("writing");
      setTimeout(() => textareaRef.current?.focus(), 200);
    } catch {
      setPhase("writing");
    }
  };

  const submitWriting = async () => {
    if (!writtenText.trim()) return;
    setPhase("diagnosing");
    // Save the extended writing sample for the pooled final report.
    saveTaskSamples(task.id, task.label, [writtenText]);
    try {
      const res = await fetch(task.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "diagnose", writingResponse: writtenText, scaffoldMessages: scaffoldMsgs, topic }),
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
    return wrap(
      <main className="diagnosing-container">
        <div className="diagnosing-inner animate-fade-up">
          <div className="spinner" style={{ margin: "0 auto" }} />
        </div>
      </main>
    );
  }

  if (phase === "briefing") {
    const { badge, titlePrefix, titleEmphasis, subtitle, sections, reassurance, startButtonLabel, extraBriefingClass } = task.briefing;
    return wrap(
      <main className={`split-briefing-container ${extraBriefingClass || ""}`}>
        <div className="split-briefing-inner animate-fade-up">
          <div className="sb-left">
            <div className="sb-badge">{badge}</div>
            <h1 className="sb-title">{titlePrefix} <em>{titleEmphasis}</em></h1>
            <p className="sb-subtitle">{subtitle}</p>
            {sections.map((section, i) => (
              <div key={i} className="sb-section">
                <div className="sb-section-title">{section.title}</div>
                <div className="sb-section-body">{section.body}</div>
              </div>
            ))}
            <div className="sb-reassurance">{reassurance}</div>
            <button onClick={start} className="sb-start-btn">
              {startButtonLabel} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
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
  }

  if (phase === "scaffolding") {
    return wrap(
      <PhoneChat
        label="Writing Examiner"
        subtitle="Task 2 · Phase 1: Think"
        messages={scaffoldMsgs}
        input={scaffoldInput}
        setInput={setScaffoldInput}
        processing={scaffoldProcessing}
        doneRef={scaffoldDoneRef}
        sendFn={sendScaffold}
        exchangeCount={scaffoldCount}
        maxExchanges={4}
        notice="⚡ Scaffolding — not assessed"
        chatEndRef={chatEndRef}
        inputRef={inputRef}
      />
    );
  }

  if (phase === "generating-prompt") {
    return wrap(
      <main className="diagnosing-container">
        <div className="diagnosing-inner animate-fade-up">
          <div className="spinner" style={{ margin: "0 auto" }} />
          <p>Creating your writing prompt…</p>
        </div>
      </main>
    );
  }

  if (phase === "writing") {
    return wrap(
      <main className="writing-page">
        <div className="writing-frame animate-slide-up">
          <div className="writing-prompt-card">
            <div className="writing-prompt-tag">Task 2 — Writing Prompt</div>
            <h2 className="writing-prompt-title">{prompt?.promptTitle ?? "Write about your experience"}</h2>
            <p className="writing-prompt-text" style={{ whiteSpace: "pre-line" }}>{prompt?.promptText ?? "Write about what you discussed with the examiner."}</p>
            <div className="writing-word-guide">💡 Suggested: around {prompt?.suggestedWords?.[0] ?? 80}–{prompt?.suggestedWords?.[1] ?? 200} words</div>
          </div>
          <div className="writing-textarea-wrap">
            <textarea
              ref={textareaRef}
              className="writing-textarea"
              placeholder="Start writing here…"
              value={writtenText}
              onChange={e => setWrittenText(e.target.value)}
              onInput={resizeTextareaToContent}
            />
            <div className="writing-footer">
              <span className="writing-word-count">{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
              <button onClick={submitWriting} disabled={wordCount < 10} className="writing-submit-btn">Submit Writing →</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "diagnosing") {
    return wrap(
      <main className="diagnosing-container">
        <div className="diagnosing-inner animate-fade-up">
          <div className="spinner" style={{ margin: "0 auto" }} />
          <p>Analysing your writing…</p>
        </div>
      </main>
    );
  }

  if (phase === "results" && config) {
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
          showWriting={showWriting}
          setShowWriting={setShowWriting}
          messages={scaffoldMsgs}
          writtenText={writtenText}
        />
      </main>
    );
  }

  return null;
}
