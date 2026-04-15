"use client";
import Link from "next/link";
import { TASKS } from "./_tasks/registry";
import { writingStyles } from "./_shared/styles";

export default function WritingIndexPage() {
  const taskIds = Object.keys(TASKS).sort();

  return (
    <div className="stakeholder-theme">
      <style dangerouslySetInnerHTML={{ __html: writingStyles }} />
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <div className="sb-badge" style={{ display: "inline-block" }}>
            📝 Writing Test
          </div>
          <h1 className="sb-title" style={{ marginTop: 16 }}>
            Tasks
          </h1>
          <p className="sb-subtitle" style={{ marginTop: 8 }}>
            Pick a task to run it on its own page.
          </p>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {taskIds.map((id) => {
            const t = TASKS[id];
            return (
              <Link
                key={id}
                href={`/writing/task/${id}`}
                style={{
                  display: "block",
                  padding: "20px 24px",
                  background: "var(--glass)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 12,
                  textDecoration: "none",
                  color: "inherit",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>
                  Task {id}
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
                  {t.shortTitle}
                </div>
                <div style={{ fontSize: 14, opacity: 0.75 }}>
                  {t.briefing.subtitle}
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
