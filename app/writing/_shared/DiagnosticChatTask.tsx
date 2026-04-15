"use client";
import { useEffect, useState, useRef } from "react";
import type { TaskDefinition } from "../_tasks/types";
import type { TaskConfig, Diagnosis, FormAnalysis, Message, ProbeTarget, ElicitationTarget } from "./types";
import { writingStyles } from "./styles";
import { PhoneChat } from "./PhoneChat";
import { ResultsDashboard } from "./ResultsDashboard";

type DiagnosticChatPhase = "loading-config" | "briefing" | "conversation" | "probing" | "eliciting" | "diagnosing" | "results";

interface DiagnosticChatTaskProps {
  task: TaskDefinition;
}

const MIN_EXCHANGES = 5;

export function DiagnosticChatTask({ task }: DiagnosticChatTaskProps) {
  const [phase, setPhase] = useState<DiagnosticChatPhase>("loading-config");
  const [config, setConfig] = useState<TaskConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [form, setForm] = useState<FormAnalysis | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);
  const doneRef = useRef(false);
  const [stage, setStage] = useState<number>(0);
  const [candidateName, setCandidateName] = useState("");
  const [struggleCount, setStruggleCount] = useState(0);
  const [stageExchangeCount, setStageExchangeCount] = useState(0);
  const [probeTargets, setProbeTargets] = useState<ProbeTarget[]>([]);
  const [probeCount, setProbeCount] = useState(0);
  const probeDoneRef = useRef(false);
  const [elicitTargets, setElicitTargets] = useState<ElicitationTarget[]>([]);
  const [elicitCount, setElicitCount] = useState(0);
  const elicitDoneRef = useRef(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
  }, [messages, processing]);

  const start = async () => {
    doneRef.current = false;
    setStage(0);
    setStruggleCount(0);
    setStageExchangeCount(0);
    setPhase("conversation");
    setProcessing(true);
    const res = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [], exchangeCount: 0, stage: 0, struggleCount: 0, stageExchangeCount: 0 }),
    });
    const data = await res.json();
    setMessages([{ role: "assistant", content: data.message }]);
    setProcessing(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || processing || doneRef.current) return;
    setInput("");
    setProcessing(true);
    const userMsg: Message = { role: "user", content: text, stage };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    const nextCount = exchangeCount + 1;
    setExchangeCount(nextCount);

    // Capture name from first user response (IDENTITY stage)
    if (exchangeCount === 0 && !candidateName) {
      const words = text.trim().split(/\s+/);
      const name =
        words.length <= 3
          ? text.trim().replace(/[.!,]$/g, "")
          : words.filter(w => /^[A-Z]/.test(w)).slice(0, 2).join(" ") || words[0];
      if (name) setCandidateName(name);
    }

    if (!config) {
      setProcessing(false);
      return;
    }

    if (nextCount >= (config.meta.maxExchanges || 12)) {
      await finish(newMsgs, nextCount);
      return;
    }

    const chatRes = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: newMsgs,
        exchangeCount: nextCount,
        stage,
        struggleCount,
        stageExchangeCount,
      }),
    });
    const data = await chatRes.json();
    if (data.stage !== undefined) setStage(data.stage);
    if (data.struggleCount !== undefined) setStruggleCount(data.struggleCount);
    if (data.stageExchangeCount !== undefined) setStageExchangeCount(data.stageExchangeCount);
    const updated = [...newMsgs, { role: "assistant" as const, content: data.message, stage: data.stage }];
    setMessages(updated);
    if (data.ceilingReached && nextCount >= MIN_EXCHANGES) {
      doneRef.current = true;
      setProcessing(false);
      await runDiagnosis(updated);
      return;
    }
    setProcessing(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const finish = async (msgs: Message[], count: number) => {
    doneRef.current = true;
    const res = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: msgs,
        exchangeCount: count,
        wrapUp: true,
        stage,
        struggleCount,
        stageExchangeCount,
      }),
    });
    const data = await res.json();
    const all = [...msgs, { role: "assistant" as const, content: data.message }];
    setMessages(all);
    setProcessing(false);
    await runDiagnosis(all);
  };

  const runDiagnosis = async (finalMsgs: Message[], isProbeRound = false, isElicitRound = false) => {
    setPhase("diagnosing");
    try {
      const res = await fetch(task.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: finalMsgs,
          action: "diagnose",
          probeRound: isProbeRound,
          elicitationRound: isElicitRound,
        }),
      });
      const data = await res.json();
      if (data.diagnosis) {
        setDiagnosis(data.diagnosis);
        if (data.formAnalysis) setForm(data.formAnalysis);
      }

      // Check if probing is needed (only on first diagnosis, not after probe/elicit)
      if (!isProbeRound && !isElicitRound && data.probeTargets && data.probeTargets.length > 0) {
        setProbeTargets(data.probeTargets);
        setProbeCount(0);
        probeDoneRef.current = false;
        setPhase("probing");
        const probeRes = await fetch(task.apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "probe",
            messages: finalMsgs,
            probeTargets: data.probeTargets,
            probeExchangeCount: 0,
          }),
        });
        const probeData = await probeRes.json();
        setMessages([...finalMsgs, { role: "assistant", content: probeData.message }]);
        setProcessing(false);
        setTimeout(() => inputRef.current?.focus(), 100);
        return;
      }

      // Check if elicitation is needed (after probe round or when no probes, but not after elicitation)
      if (!isElicitRound && data.elicitationTargets && data.elicitationTargets.length > 0) {
        setElicitTargets(data.elicitationTargets);
        setElicitCount(0);
        elicitDoneRef.current = false;
        setPhase("eliciting");
        const elicitRes = await fetch(task.apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "elicit",
            messages: finalMsgs,
            elicitationTargets: data.elicitationTargets,
            elicitationExchangeCount: 0,
          }),
        });
        const elicitData = await elicitRes.json();
        setMessages([...finalMsgs, { role: "assistant", content: elicitData.message }]);
        setProcessing(false);
        setTimeout(() => inputRef.current?.focus(), 100);
        return;
      }

      setPhase("results");
    } catch {
      setPhase("results");
    }
  };

  const sendProbe = async () => {
    const text = input.trim();
    if (!text || processing || probeDoneRef.current) return;
    setInput("");
    setProcessing(true);
    const userMsg: Message = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    const nextProbeCount = probeCount + 1;
    setProbeCount(nextProbeCount);

    const res = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "probe",
        messages: newMsgs,
        probeTargets,
        probeExchangeCount: nextProbeCount,
      }),
    });
    const data = await res.json();
    const updated = [...newMsgs, { role: "assistant" as const, content: data.message }];
    setMessages(updated);

    if (data.probeDone) {
      probeDoneRef.current = true;
      setProcessing(false);
      await runDiagnosis(updated, true);
      return;
    }
    setProcessing(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendElicit = async () => {
    const text = input.trim();
    if (!text || processing || elicitDoneRef.current) return;
    setInput("");
    setProcessing(true);
    const userMsg: Message = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    const nextElicitCount = elicitCount + 1;
    setElicitCount(nextElicitCount);

    const res = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "elicit",
        messages: newMsgs,
        elicitationTargets: elicitTargets,
        elicitationExchangeCount: nextElicitCount,
      }),
    });
    const data = await res.json();
    const updated = [...newMsgs, { role: "assistant" as const, content: data.message }];
    setMessages(updated);

    if (data.elicitDone) {
      elicitDoneRef.current = true;
      setProcessing(false);
      await runDiagnosis(updated, false, true);
      return;
    }
    setProcessing(false);
    setTimeout(() => inputRef.current?.focus(), 100);
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
            <div className="sb-right-section"><div className="sb-right-section-title">Why this task exists</div><div className="sb-right-section-body">This task assesses written interaction and informing functions in a controlled but flexible environment. Rather than a fixed text type, it creates an adaptive conversation where communicative ability can emerge naturally.</div></div>
            <div className="sb-right-section"><div className="sb-right-section-title">Why a chat format</div><div className="sb-right-section-body">Interaction introduces elements that static writing tasks cannot:<ul><li>follow-up questions</li><li>clarification</li><li>adjustment of meaning</li><li>breakdown and repair</li></ul></div></div>
            <div className="sb-right-section"><div className="sb-right-section-title">How ability is elicited</div><div className="sb-right-section-body">The AI dynamically adjusts difficulty — moving upward when the candidate responds comfortably, stabilising or simplifying when they struggle.</div></div>
            <div className="sb-right-section"><div className="sb-right-section-title">CEFR alignment</div><div className="sb-right-section-body">The task targets CEFR-aligned communicative functions — particularly interaction and informing. Evidence is collected across the exchange and mapped to CEFR descriptors.</div></div>
            <div className="sb-right-section"><div className="sb-right-section-title">How it is scored</div><div className="sb-right-section-body">Performance is evaluated through observable evidence. Each descriptor is marked as:<div className="sb-verdict-row"><div className="sb-verdict"><span className="sb-verdict-tag can">Confirmed</span> demonstrated clearly under demand</div><div className="sb-verdict"><span className="sb-verdict-tag not-yet">Not Demonstrated</span> not consistently evidenced</div></div></div></div>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "conversation") {
    return wrap(
      <PhoneChat
        label="Writing Examiner"
        subtitle="Task 1 · Diagnostic Chat"
        messages={messages}
        input={input}
        setInput={setInput}
        processing={processing}
        doneRef={doneRef}
        sendFn={send}
        exchangeCount={exchangeCount}
        maxExchanges={config?.meta.maxExchanges || 12}
        chatEndRef={chatEndRef}
        inputRef={inputRef}
        onFinishEarly={() => {
          void finish(messages, exchangeCount);
        }}
      />
    );
  }

  if (phase === "probing") {
    return wrap(
      <PhoneChat
        label="Writing Examiner"
        subtitle="Task 1 · Follow-up Questions"
        messages={messages}
        input={input}
        setInput={setInput}
        processing={processing}
        doneRef={probeDoneRef}
        sendFn={sendProbe}
        exchangeCount={probeCount}
        maxExchanges={3}
        chatEndRef={chatEndRef}
        inputRef={inputRef}
      />
    );
  }

  if (phase === "eliciting") {
    return wrap(
      <PhoneChat
        label="Writing Examiner"
        subtitle="Task 1 · A Few More Questions"
        messages={messages}
        input={input}
        setInput={setInput}
        processing={processing}
        doneRef={elicitDoneRef}
        sendFn={sendElicit}
        exchangeCount={elicitCount}
        maxExchanges={3}
        chatEndRef={chatEndRef}
        inputRef={inputRef}
      />
    );
  }

  if (phase === "diagnosing") {
    return wrap(
      <main className="diagnosing-container">
        <div className="diagnosing-inner animate-fade-up">
          <div className="spinner" style={{ margin: "0 auto" }} />
          <p>Analysing function and language…</p>
        </div>
      </main>
    );
  }

  if (phase === "results") {
    return wrap(
      <main className="results-page">
        <ResultsDashboard
          taskLabel={`${task.label} Results`}
          taskNum={task.taskNum}
          config={config}
          diagnosis={diagnosis}
          form={form}
          expanded={expanded}
          setExpanded={setExpanded}
          showTranscript={showTranscript}
          setShowTranscript={setShowTranscript}
          messages={messages}
        />
      </main>
    );
  }

  return null;
}
