/* ═══════════════════════════════════════════════════════════════════════════
   Server-side structured logger
   ───────────────────────────────────────────────────────────────────────────
   Thin wrapper over console so we have a single choke point to swap in
   Sentry / Datadog / Axiom later without touching every route. Call-site
   shape stays the same: logServerError("writing-chat", err, { action }).
   ═══════════════════════════════════════════════════════════════════════════ */

type LogContext = Record<string, string | number | boolean | null | undefined>;

function serializeError(err: unknown): Record<string, string> {
  if (err instanceof Error) {
    const out: Record<string, string> = { name: err.name, message: err.message };
    if (err.stack) out.stack = err.stack;
    return out;
  }
  return { message: String(err) };
}

export function logServerError(scope: string, err: unknown, context?: LogContext): void {
  const payload = {
    level: "error",
    scope,
    ...context,
    error: serializeError(err),
    timestamp: new Date().toISOString(),
  };
  // Structured single-line JSON is easy to pipe into any log shipper.
  console.error(JSON.stringify(payload));
}

export function logServerInfo(scope: string, message: string, context?: LogContext): void {
  console.log(JSON.stringify({
    level: "info",
    scope,
    message,
    ...context,
    timestamp: new Date().toISOString(),
  }));
}
