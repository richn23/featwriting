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
  const exchangesNow = Math.min(exchangeCount, maxExchanges);

  return (
    <main className="chat-page">
      <div className="phone-frame">
        <div className="phone-status-bar" aria-hidden="true"><div className="phone-notch" /></div>
        <div className="chat-top-bar">
          <div className="chat-avatar" aria-hidden="true">FT</div>
          <div className="chat-top-info"><h2>{label}</h2><span>{subtitle}</span></div>
          <div className="chat-top-bar-actions">
            <div className="chat-progress-wrap">
              <span className="chat-progress-label" id="chat-progress-label">Progress</span>
              <div
                className="chat-progress-bar"
                role="progressbar"
                aria-labelledby="chat-progress-label"
                aria-valuenow={exchangesNow}
                aria-valuemin={0}
                aria-valuemax={maxExchanges}
                aria-valuetext={`${exchangesNow} of ${maxExchanges} exchanges`}
              >
                <div className="chat-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            {onFinishEarly && (
              <button type="button" onClick={onFinishEarly} className="finish-early-btn">
                Finish ↵
              </button>
            )}
          </div>
        </div>
        {notice && <div className="scaffolding-notice" role="status">{notice}</div>}
        <div className="chat-body" role="log" aria-label="Conversation transcript" aria-live="polite" aria-relevant="additions">
          {messages.map((m, i) => (
            <div key={i}>
              <div className={`msg-row ${m.role}`}>
                {m.role === "assistant" && <div className="msg-avatar-sm" aria-hidden="true">FT</div>}
                <div className={`msg-bubble ${m.role}`}>
                  <span className="visually-hidden">{m.role === "assistant" ? "Tutor said: " : "You said: "}</span>
                  {m.content}
                </div>
              </div>
              <div className="msg-time" aria-hidden="true">{getTime(i)}</div>
            </div>
          ))}
          {processing && (
            <div className="typing-row" role="status" aria-label="Tutor is typing">
              <div className="msg-avatar-sm" aria-hidden="true">FT</div>
              <div className="typing-bubble" aria-hidden="true">
                <span className="dot"/><span className="dot"/><span className="dot"/>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="chat-input-area">
          <label htmlFor="chat-message-input" className="visually-hidden">Type your message</label>
          <input
            id="chat-message-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFn(); } }}
            placeholder={doneRef.current ? "Chat complete" : processing ? "Waiting…" : "Type a message…"}
            disabled={processing || doneRef.current}
            maxLength={4000}
            className="chat-text-input"
          />
          <button
            type="button"
            onClick={sendFn}
            disabled={!input.trim() || processing || doneRef.current}
            aria-label="Send message"
            className="chat-send-btn"
          >
            <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div className="phone-home-bar" aria-hidden="true"><div className="home-indicator" /></div>
      </div>
    </main>
  );
}
