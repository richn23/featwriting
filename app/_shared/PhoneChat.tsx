"use client";

import React from "react";
import type { Message } from "./types";
import { getTime } from "./helpers";

interface PhoneChatProps {
  label: string;
  subtitle: string;
  messages: Message[];
  input: string;
  setInput: (v: string) => void;
  processing: boolean;
  doneRef: React.RefObject<boolean>;
  sendFn: () => void;
  exchangeCount: number;
  maxExchanges: number;
  notice?: string;
  onFinishEarly?: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function PhoneChat({
  label,
  subtitle,
  messages,
  input,
  setInput,
  processing,
  doneRef,
  sendFn,
  exchangeCount,
  maxExchanges,
  notice,
  onFinishEarly,
  chatEndRef,
  inputRef,
}: PhoneChatProps) {
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
}
