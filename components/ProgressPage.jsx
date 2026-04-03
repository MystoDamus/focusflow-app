import { useMemo } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// Build a heatmap of study sessions per day (last 16 weeks)
function buildHeatmap(sessionHistory) {
  const map = {};
  sessionHistory.forEach((s) => {
    const key = s.date?.slice(0, 10);
    if (key) map[key] = (map[key] ?? 0) + 1;
  });

  const today = new Date();
  const cells = [];
  const start = new Date(today);
  start.setDate(start.getDate() - 111); // ~16 weeks back

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, count: map[key] ?? 0, dow: d.getDay() });
  }
  return cells;
}

function HeatmapCell({ count, date }) {
  const intensity = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : 3;
  const colors = ["rgba(255,255,255,0.05)", "rgba(255,211,108,0.3)", "rgba(255,211,108,0.6)", "rgba(255,211,108,0.95)"];
  return (
    <div
      title={`${date}: ${count} session${count !== 1 ? "s" : ""}`}
      style={{
        width: 14,
        height: 14,
        borderRadius: 3,
        background: colors[intensity],
        flexShrink: 0,
      }}
    />
  );
}

function ProgressPage({ state, sessionHistory = [] }) {
  const heatmap = useMemo(() => buildHeatmap(sessionHistory), [sessionHistory]);

  // Streak calc
  const streak = useMemo(() => {
    const days = new Set(sessionHistory.map((s) => s.date?.slice(0, 10)));
    let count = 0;
    const d = new Date();
    while (days.has(d.toISOString().slice(0, 10))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [sessionHistory]);

  const totalSessions = sessionHistory.length;
  const totalMinutes = sessionHistory.reduce((acc, s) => acc + (s.duration ?? 0), 0);

  // Subject breakdown from quests
  const quests = state?.quests ?? [];
  const subjectMap = {};
  quests.forEach((q) => {
    const subj = q.subject || q.category || "Other";
    if (!subjectMap[subj]) subjectMap[subj] = { done: 0, total: 0 };
    subjectMap[subj].total++;
    if (q.completed) subjectMap[subj].done++;
  });

  // Flashcard mastery
  const flashSets = state?.flashcardSets ?? [];
  const totalCards = flashSets.reduce((a, s) => a + s.cards.length, 0);
  const masteredCards = flashSets.reduce((a, s) => a + s.cards.filter((c) => (c.strength ?? 0) >= 3).length, 0);

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>📊 Progress</h2>
      </div>

      {/* Summary stats */}
      <div className="fc-stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card"><span>Current Streak</span><strong>{streak}d</strong></div>
        <div className="stat-card"><span>Study Sessions</span><strong>{totalSessions}</strong></div>
        <div className="stat-card"><span>Total Time</span><strong>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</strong></div>
        <div className="stat-card"><span>Quests Done</span><strong>{quests.filter((q) => q.completed).length}/{quests.length}</strong></div>
        <div className="stat-card"><span>Cards Mastered</span><strong>{masteredCards}/{totalCards}</strong></div>
        <div className="stat-card"><span>Flashcard Sets</span><strong>{flashSets.length}</strong></div>
      </div>

      <div className="feature-grid">
        {/* Heatmap */}
        <article className="panel" style={{ gridColumn: "1 / -1" }}>
          <h3>Activity Heatmap (last 16 weeks)</h3>
          {sessionHistory.length === 0 && <p className="muted">No sessions recorded yet. Complete a Pomodoro timer to see data here.</p>}
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 10 }}>
            {heatmap.map((cell) => (
              <HeatmapCell key={cell.date} count={cell.count} date={cell.date} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: ".72rem", color: "var(--muted)" }}>
            <span>Less</span>
            {["rgba(255,255,255,0.05)","rgba(255,211,108,0.3)","rgba(255,211,108,0.6)","rgba(255,211,108,0.95)"].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
            ))}
            <span>More</span>
          </div>
        </article>

        {/* Subject breakdown */}
        <article className="panel">
          <h3>Subject Breakdown</h3>
          {Object.keys(subjectMap).length === 0 && <p className="muted">No subjects detected from quests.</p>}
          {Object.entries(subjectMap).map(([subj, data]) => {
            const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
            return (
              <div key={subj} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", marginBottom: 4 }}>
                  <span>{subj}</span>
                  <span className="muted">{data.done}/{data.total} ({pct}%)</span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: "var(--accent,#ffd36c)", transition: "width .4s" }} />
                </div>
              </div>
            );
          })}
        </article>

        {/* Session History */}
        <article className="panel">
          <h3>Recent Sessions</h3>
          {sessionHistory.length === 0 && <p className="muted">No session history yet.</p>}
          <div style={{ display: "grid", gap: 8 }}>
            {[...sessionHistory].reverse().slice(0, 20).map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: ".85rem", padding: "6px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8 }}>
                <span>{s.date ? new Date(s.date).toLocaleDateString() : "—"} {s.subject ? `· ${s.subject}` : ""}</span>
                <span className="muted">{s.duration ?? 0}m</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default ProgressPage;
