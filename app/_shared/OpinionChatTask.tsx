"use client";
import { useEffect, useState, useRef } from "react";
import type { TaskDefinition } from "../_tasks/types";
import type { TaskConfig, Diagnosis, Message, ProbeTarget } from "./types";
import { writingStyles } from "./styles";
import { PhoneChat } from "./PhoneChat";
import { ResultsDashboard } from "./ResultsDashboard";
import { saveTaskSamples } from "./sampleStore";

type OpinionChatPhase = "loading-config" | "briefing" | "topic-select" | "conversation" | "probing" | "diagnosing" | "results";
type TopicOption = { id: string; label: string; tier: string; prompt: string };

interface OpinionChatTaskProps {
  task: TaskDefinition;
}

const T3_MIN_EXCHANGES_BEFORE_CEILING = 4;

export function OpinionChatTask({ task }: OpinionChatTaskProps) {
  const [phase, setPhase] = useState<OpinionChatPhase>("loading-config");
  const [config, setConfig] = useState<TaskConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [chosenTopic, setChosenTopic] = useState<string | null>(null);
  const [switchTopic, setSwitchTopic] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);
  const doneRef = useRef(false);
  const [probeTargets, setProbeTargets] = useState<ProbeTarget[]>([]);
  const [probeCount, setProbeCount] = useState(0);
  const probeDoneRef = useRef(false);

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

  const start = async (topicId: string) => {
    doneRef.current = false;
    setChosenTopic(topicId);
    // Standalone flow: stay on the chosen topic the whole time — no mid-chat switch.
    // (The switch was jarring and broke rapport on short 8-exchange conversations.)
    setSwitchTopic(null);
    setPhase("conversation");
    setProcessing(true);
    const res = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "chat", messages: [], exchangeCount: 0, chosenTopic: topicId }),
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
    const userMsg: Message = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    const nextCount = exchangeCount + 1;
    setExchangeCount(nextCount);

    if (!config) {
      setProcessing(false);
      return;
    }

    if (nextCount >= (config.meta.maxExchanges || 14)) {
      await finish(newMsgs, nextCount);
      return;
    }

    const shouldSwitch = switchTopic && nextCount >= 4 && nextCount <= 5;
    const chatRes = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "chat",
        messages: newMsgs,
        exchangeCount: nextCount,
        chosenTopic,
        switchTopic: shouldSwitch ? switchTopic : undefined,
      }),
    });
    const data = await chatRes.json();
    const updated = [...newMsgs, { role: "assistant" as const, content: data.message }];
    setMessages(updated);
    if (data.ceilingReached && nextCount >= T3_MIN_EXCHANGES_BEFORE_CEILING) {
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
      body: JSON.stringify({ action: "chat", messages: msgs, exchangeCount: count, wrapUp: true, chosenTopic }),
    });
    const data = await res.json();
    const all = [...msgs, { role: "assistant" as const, content: data.message }];
    setMessages(all);
    setProcessing(false);
    await runDiagnosis(all);
  };

  const runDiagnosis = async (finalMsgs: Message[], isProbeRound = false) => {
    setPhase("diagnosing");
    try {
      const res = await fetch(task.apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: finalMsgs,
          action: "diagnose",
          probeRound: isProbeRound,
          chosenTopicId: chosenTopic,
          switchTopicId: switchTopic,
        }),
      });
      const data = await res.json();
      if (data.diagnosis) {
        setDiagnosis(data.diagnosis);
        // Language/form analysis moved to final cross-task report — don't set per-task.
      }
      // Save candidate samples (user messages) for the pooled language report.
      if (!isProbeRound) {
        saveTaskSamples(
          task.id,
          task.label,
          finalMsgs.filter(m => m.role === "user").map(m => m.content),
        );
      }

      if (!isProbeRound && data.probeTargets && data.probeTargets.length > 0) {
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
            <button onClick={() => setPhase("topic-select")} className="sb-start-btn">
              {startButtonLabel} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
          <div className="sb-right">
            <div className="sb-right-label">Stakeholder Context</div>
            <div className="sb-right-section"><div className="sb-right-section-title">Why this task exists</div><div className="sb-right-section-body">It tests <strong>expressing</strong> and <strong>arguing</strong> — stating a view and supporting it when someone pushes back.</div></div>
            <div className="sb-right-section"><div className="sb-right-section-title">Why interactive debate</div><div className="sb-right-section-body">A live exchange draws out reasoning, rebuttal, and nuance better than a one-off opinion paragraph. Static "write your opinion" tasks often show less evidence of argument skill.</div></div>
            <div className="sb-right-section"><div className="sb-right-section-title">How ability is elicited</div><div className="sb-right-section-body">Challenge–response patterns show whether the candidate can justify, adjust, and defend a line of thought under pressure — not only state a position once.</div></div>
            <div className="sb-right-section"><div className="sb-right-section-title">How it is scored</div><div className="sb-right-section-body">The transcript is reviewed for clear evidence of those abilities:<div className="sb-verdict-row"><div className="sb-verdict"><span className="sb-verdict-tag can">Confirmed</span> demonstrated clearly under demand</div><div className="sb-verdict"><span className="sb-verdict-tag not-yet">Not demonstrated</span> not consistently evidenced</div></div></div></div>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "topic-select") {
    const options = (config as unknown as { topicOptions?: TopicOption[] })?.topicOptions ?? [];
    const familiarOptions = options.filter((t: TopicOption) => t.tier === "familiar");
    const shuffled = [...familiarOptions].sort(() => Math.random() - 0.5);
    const familiarTopics = shuffled.slice(0, 4);
    return wrap(
      <main className="topic-page">
        <div className="topic-frame animate-slide-up">
          <h2>Pick a Topic</h2>
          <p>Choose the topic you'd like to discuss. The AI will challenge your opinions!</p>
          <div className="topic-grid">
            {familiarTopics.map((t) => (
              <button key={t.id} className="topic-btn" onClick={() => start(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (phase === "conversation") {
    return wrap(
      <div className="debate-accent">
        <PhoneChat
          label="Debate Partner"
          subtitle="Task 3 · Express & Argue"
          messages={messages}
          input={input}
          setInput={setInput}
          processing={processing}
          doneRef={doneRef}
          sendFn={send}
          exchangeCount={exchangeCount}
          maxExchanges={config?.meta?.maxExchanges || 14}
          chatEndRef={chatEndRef}
          inputRef={inputRef}
          onFinishEarly={() => {
            void finish(messages, exchangeCount);
          }}
        />
      </div>
    );
  }

  if (phase === "probing") {
    return wrap(
      <div className="debate-accent">
        <PhoneChat
          label="Debate Partner"
          subtitle="Task 3 · Follow-up Questions"
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
      </div>
    );
  }

  if (phase === "diagnosing") {
    return wrap(
      <main className="diagnosing-container">
        <div className="diagnosing-inner animate-fade-up">
          <div className="spinner" style={{ margin: "0 auto" }} />
          <p>Analysing your arguments…</p>
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
          form={null}
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
