"use client";
import { useEffect, useState, useRef } from "react";
import type { TaskDefinition } from "../_tasks/types";
import type { TaskConfig, Diagnosis, Message, ProbeTarget } from "./types";
import { writingStyles } from "./styles";
import { PhoneChat } from "./PhoneChat";
import { ResultsDashboard } from "./ResultsDashboard";
import { saveTaskSamples } from "./sampleStore";

type AdvisoryChatPhase = "loading-config" | "briefing" | "loading-stimulus" | "conversation" | "probing" | "diagnosing" | "results";

type StimulusCardType = { id: string; name: string; tagline: string; rating: number; price: string; priceNote?: string; features: { icon: string; label: string; value: string }[]; highlight?: string };
type StimulusSetType = { id: string; category: string; categoryIcon: string; cardA: StimulusCardType; cardB: StimulusCardType };

interface AdvisoryChatTaskProps {
  task: TaskDefinition;
}

const MIN_EXCHANGES_BEFORE_CEILING = 6;

export function AdvisoryChatTask({ task }: AdvisoryChatTaskProps) {
  const [phase, setPhase] = useState<AdvisoryChatPhase>("loading-config");
  const [config, setConfig] = useState<TaskConfig | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [stimulusSet, setStimulusSet] = useState<StimulusSetType | null>(null);
  const [probeTargets, setProbeTargets] = useState<ProbeTarget[]>([]);
  const [probeCount, setProbeCount] = useState(0);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showTranscript, setShowTranscript] = useState(false);
  const doneRef = useRef(false);
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

  const start = async () => {
    doneRef.current = false;
    setPhase("loading-stimulus");
    const prevLevel = diagnosis?.diagnosedLevel || "B1";
    const stimRes = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-stimulus", prevLevel }),
    });
    const stimData = await stimRes.json();
    if (stimData.stimulusSet) setStimulusSet(stimData.stimulusSet);
    const chatRes = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "chat", messages: [], exchangeCount: 0, stimulusSetId: stimData.stimulusSet?.id, prevLevel }),
    });
    const chatData = await chatRes.json();
    setMessages([{ role: "assistant", content: chatData.message }]);
    setExchangeCount(0);
    setPhase("conversation");
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
    const maxEx = config?.meta?.maxExchanges || 12;
    if (nextCount >= maxEx) {
      await finish(newMsgs, nextCount);
      return;
    }
    const prevLevel = diagnosis?.diagnosedLevel || "B1";
    const res = await fetch(task.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "chat", messages: newMsgs, exchangeCount: nextCount, stimulusSetId: stimulusSet?.id, prevLevel }),
    });
    const data = await res.json();
    const updated = [...newMsgs, { role: "assistant" as const, content: data.message }];
    setMessages(updated);
    if (data.ceilingReached && nextCount >= MIN_EXCHANGES_BEFORE_CEILING) {
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
      body: JSON.stringify({ action: "chat", messages: msgs, exchangeCount: count, wrapUp: true, stimulusSetId: stimulusSet?.id }),
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
        body: JSON.stringify({ messages: finalMsgs, action: "diagnose", stimulusSetId: stimulusSet?.id, probeRound: isProbeRound }),
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
          body: JSON.stringify({ action: "probe", messages: finalMsgs, probeTargets: data.probeTargets, probeExchangeCount: 0 }),
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
      body: JSON.stringify({ action: "probe", messages: newMsgs, probeTargets, probeExchangeCount: nextProbeCount }),
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

  const renderCard = (card: StimulusCardType) => (
    <div className="t5-card" key={card.id}>
      <div className="t5-card-header"><span className="t5-card-name">{card.name}</span><span className="t5-card-stars">{"★".repeat(card.rating)}{"☆".repeat(5 - card.rating)}</span></div>
      <div className="t5-card-tagline">{card.tagline}</div>
      <div className="t5-card-price">{card.price}</div>
      {card.priceNote && <div className="t5-card-price-note">{card.priceNote}</div>}
      <div className="t5-card-features">{card.features.map((f, i) => (<div className="t5-card-feature" key={i}><span className="t5-card-feature-icon">{f.icon}</span><span className="t5-card-feature-label">{f.label}</span><span>{f.value}</span></div>))}</div>
      {card.highlight && <div className="t5-card-highlight">{card.highlight}</div>}
    </div>
  );

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
            <div className="sb-right-section"><div className="sb-right-section-title">Why this task exists</div><div className="sb-right-section-body">It tests <strong>mediating</strong> — helping someone decide by selecting and adapting information, not only listing facts.</div></div>
            <div className="sb-right-section"><div className="sb-right-section-title">Why situational advice</div><div className="sb-right-section-body">Advisory dialogue shows selective relay and adaptation: candidates must tune recommendations to goals and constraints. Static compare-and-contrast essays rarely show that flexibility.</div></div>
            <div className="sb-right-section"><div className="sb-right-section-title">How ability is elicited</div><div className="sb-right-section-body">Changing scenarios probe whether advice shifts when priorities change — evidence of responsive mediation rather than a single rehearsed answer.</div></div>
            <div className="sb-right-section"><div className="sb-right-section-title">How it is scored</div><div className="sb-right-section-body">The exchange is reviewed for evidence against the mediating claims:<div className="sb-verdict-row"><div className="sb-verdict"><span className="sb-verdict-tag can">Confirmed</span> demonstrated clearly under demand</div><div className="sb-verdict"><span className="sb-verdict-tag not-yet">Not demonstrated</span> not consistently evidenced</div></div></div></div>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "loading-stimulus") {
    return wrap(
      <main className="diagnosing-container">
        <div className="diagnosing-inner animate-fade-up">
          <div className="spinner" style={{ margin: "0 auto" }} />
          <p>Preparing your options…</p>
        </div>
      </main>
    );
  }

  if (phase === "conversation" && stimulusSet) {
    return wrap(
      <div className="t5-split">
        <div className="t5-cards-bar">{renderCard(stimulusSet.cardA)}{renderCard(stimulusSet.cardB)}</div>
        <div className="t5-chat-area t5-accent">
          <PhoneChat
            label="Adviser"
            subtitle="Task 5 · Compare & Advise"
            messages={messages}
            input={input}
            setInput={setInput}
            processing={processing}
            doneRef={doneRef}
            sendFn={send}
            exchangeCount={exchangeCount}
            maxExchanges={config?.meta?.maxExchanges || 12}
            chatEndRef={chatEndRef}
            inputRef={inputRef}
            onFinishEarly={() => {
              void finish(messages, exchangeCount);
            }}
          />
        </div>
      </div>
    );
  }

  if (phase === "probing" && stimulusSet) {
    return wrap(
      <div className="t5-split">
        <div className="t5-cards-bar">{renderCard(stimulusSet.cardA)}{renderCard(stimulusSet.cardB)}</div>
        <div className="t5-chat-area t5-accent">
          <PhoneChat
            label="Adviser"
            subtitle="Task 5 · Follow-up Questions"
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
      </div>
    );
  }

  if (phase === "diagnosing") {
    return wrap(
      <main className="diagnosing-container">
        <div className="diagnosing-inner animate-fade-up">
          <div className="spinner" style={{ margin: "0 auto" }} />
          <p>Analysing your advice…</p>
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
          messages={messages}
        />
      </main>
    );
  }

  return null;
}
