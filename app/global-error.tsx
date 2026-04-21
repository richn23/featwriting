"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "48px 24px", background: "#0f172a", color: "#f1f5f9", minHeight: "100vh" }}>
        <main role="alert" style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: "#94a3b8", marginBottom: 24 }}>
            The application encountered a critical error. Please refresh and try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ padding: "12px 24px", fontSize: "1rem", background: "#34d399", color: "#0f172a", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
