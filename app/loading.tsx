export default function Loading() {
  return (
    <main className="diagnosing-container" aria-busy="true" aria-live="polite">
      <div className="diagnosing-inner animate-fade-up">
        <div className="spinner" style={{ margin: "0 auto" }} />
        <span className="visually-hidden">Loading…</span>
      </div>
    </main>
  );
}
