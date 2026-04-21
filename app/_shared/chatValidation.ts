/* ═══════════════════════════════════════════════════════════════════════════
   Chat input validation
   ───────────────────────────────────────────────────────────────────────────
   Sanitizes candidate-supplied chat payloads before they hit OpenAI or
   Supabase. Defends against oversized payloads (DoS), malformed shapes,
   and stray control characters — NOT against semantic prompt injection
   (which requires defensive prompting upstream).
   ═══════════════════════════════════════════════════════════════════════════ */

import type { Message } from "./types";

export const MAX_MESSAGES = 300;
export const MAX_MESSAGE_CHARS = 4000;
export const MAX_SHORT_STRING = 200;

export class InvalidChatInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidChatInputError";
  }
}

// Strip control characters (except \n, \r, \t) and clamp length.
export function sanitizeText(value: unknown, maxChars = MAX_MESSAGE_CHARS): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  const stripped = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return stripped.length > maxChars ? stripped.slice(0, maxChars) : stripped;
}

export function sanitizeShortString(value: unknown): string {
  return sanitizeText(value, MAX_SHORT_STRING);
}

export function validateMessages(input: unknown): Message[] {
  if (!Array.isArray(input)) {
    throw new InvalidChatInputError("messages must be an array");
  }
  if (input.length > MAX_MESSAGES) {
    throw new InvalidChatInputError(`messages exceeds max of ${MAX_MESSAGES}`);
  }

  const clean: Message[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const m = raw as { role?: unknown; content?: unknown; stage?: unknown };
    const role = m.role === "assistant" || m.role === "user" ? m.role : null;
    if (!role) continue;
    const content = sanitizeText(m.content);
    const msg: Message = { role, content };
    if (typeof m.stage === "number" && Number.isFinite(m.stage)) {
      msg.stage = m.stage;
    }
    clean.push(msg);
  }
  return clean;
}

export function clampInt(value: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : fallback;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}
