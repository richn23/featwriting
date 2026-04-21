"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="diagnosing-container" role="alert">
      <div className="diagnosing-inner animate-fade-up" style={{ maxWidth: 520, textAlign: "center" }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", marginBottom: 12 }}>
          Something went wrong
        </h1>
        <p style={{ color: "var(--muted, #6b7280)", marginBottom: 24 }}>
          The test hit an unexpected error. You can try again, or return to the home page and start over.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={reset} className="btn-continue-new" style={{ width: "auto" }}>
            Try again
          </button>
          <Link href="/" className="btn-continue-new" style={{ width: "auto", background: "transparent", border: "1px solid var(--s-accent)" }}>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
