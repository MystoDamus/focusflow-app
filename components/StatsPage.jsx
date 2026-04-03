import { useMemo, useState } from "react";
import { Award, TrendingUp, BarChart3 } from "lucide-react";

const ACHIEVEMENTS = [
  { id: "first-quest", icon: "⚔️", label: "First Blood", desc: "Complete your first quest" },
  { id: "quest-10", icon: "🗡️", label: "Quest Runner", desc: "Complete 10 quests total" },
  { id: "quest-50", icon: "📚", label: "Dedicated Scholar", desc: "Complete 50 quests total" },
  { id: "boss-1", icon: "💀", label: "Boss Slayer", desc: "Defeat your first boss" },
  { id: "boss-5", icon: "👑", label: "Dragon Bane", desc: "Defeat 5 bosses total" },
  { id: "level-5", icon: "⭐", label: "Apprentice", desc: "Reach Level 5 in any subject" },
  { id: "level-10", icon: "🌟", label: "Expert", desc: "Reach Level 10 in any subject" },
  { id: "streak-3", icon: "🔥", label: "On Fire", desc: "Maintain a 3-day study streak" },
  { id: "streak-7", icon: "🏆", label: "Week Warrior", desc: "Maintain a 7-day study streak" },
  { id: "quiz-ace", icon: "🎯", label: "Quiz Ace", desc: "Score 1000+ in a Quiz Battle" },
  { id: "flashcard-20", icon: "🃏", label: "Memory Mage", desc: "Create 20+ flashcards" },
  { id: "prestige-1", icon: "✨", label: "Prestige I", desc: "Earn your first prestige rank" },
  { id: "shards-100", icon: "💎", label: "Shard Collector", desc: "Accumulate 100 shards" },
  { id: "focus-10", icon: "🧘", label: "Deep Focus", desc: "Complete 10 focus cycles" },
  { id: "pet-companion", icon: "🐾", label: "Pet Tamer", desc: "Evolve your pet to Companion" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function buildHeatmap(sessionHistory) {
  const map = {};
  sessionHistory.forEach((s) => {
    const key = s.date?.slice(0, 10);
    if (key) map[key] = (map[key] ?? 0) + 1;
  });

  const today = new Date();
  const cells = [];
  const start = new Date(today);
  start.setDate(start.getDate() - 111);

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

function StatsPage({ achievements, subjects, quiz, flashcards, streak, state, sessionHistory = [] }) {
  const [activeTab, setActiveTab] = useState("achievements");

  const unlocked = achievements?.unlocked ?? [];
  const unlockedCount = unlocked.length;

  const heatmap = useMemo(() => buildHeatmap(sessionHistory), [sessionHistory]);

  const streakDays = useMemo(() => {
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

  const allSubjects = Object.values(subjects ?? {});
  const maxLevel = Math.max(...allSubjects.map((s) => s.progress?.level ?? 0), 0);
  const totalQuests = allSubjects.reduce((s, sub) => s + (sub.progress?.questsCleared ?? 0), 0);
  const totalBosses = allSubjects.reduce((s, sub) => s + (sub.progress?.bossVictories ?? 0), 0);
  const totalFocus = allSubjects.reduce((s, sub) => s + (sub.progress?.focusCycles ?? 0), 0);
  const totalShards = allSubjects.reduce((s, sub) => s + (sub.progress?.shards ?? 0), 0);
  const totalPrestige = allSubjects.reduce((s, sub) => s + (sub.progress?.prestigeRank ?? 0), 0);

  const totalCards = flashcards?.sets?.reduce((a, s) => a + (s.cards?.length ?? 0), 0) ?? 0;
  const masteredCards = flashcards?.sets?.reduce((a, s) => a + (s.cards?.filter((c) => (c.strength ?? 0) >= 3).length ?? 0), 0) ?? 0;

  const quizBestScore = quiz?.bestScore ?? 0;
  const quizAccuracy = quiz?.accuracy ?? 0;
  const quizSessions = quiz?.session?.index ?? 0;

  return (
    <section className="feature-page stats-page">
      <div className="feature-header">
        <h2>📊 Stats & Achievements</h2>
        <p className="muted">Your complete study profile</p>
      </div>

      {/* Tabs */}
      <div className="fc-tabs" style={{ marginBottom: "20px" }}>
        <button
          type="button"
          className={`fc-tab ${activeTab === "achievements" ? "is-active" : ""}`}
          onClick={() => setActiveTab("achievements")}
        >
          <Award size={16} />
          Achievements
        </button>
        <button
          type="button"
          className={`fc-tab ${activeTab === "progress" ? "is-active" : ""}`}
          onClick={() => setActiveTab("progress")}
        >
          <TrendingUp size={16} />
          Progress
        </button>
        <button
          type="button"
          className={`fc-tab ${activeTab === "analytics" ? "is-active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          <BarChart3 size={16} />
          Analytics
        </button>
      </div>

      {/* Achievements Tab */}
      {activeTab === "achievements" && (
        <>
          <div className="achievement-progress-bar" style={{ marginBottom: "20px" }}>
            <div
              className="achievement-progress-fill"
              style={{ width: `${Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%` }}
            />
          </div>

          <div className="achievement-grid">
            {ACHIEVEMENTS.map((a) => {
              const isUnlocked = unlocked.includes(a.id);
              return (
                <div key={a.id} className={`achievement-card ${isUnlocked ? "is-unlocked" : "is-locked"}`}>
                  <div className="achievement-icon">{a.icon}</div>
                  <div className="achievement-body">
                    <strong>{a.label}</strong>
                    <span>{a.desc}</span>
                  </div>
                  {isUnlocked && <div className="achievement-check">✓</div>}
                </div>
              );
            })}
          </div>

          <div className="feature-grid" style={{ marginTop: "20px" }}>
            <article className="panel">
              <h3>Campaign Stats</h3>
              <div className="stat-grid">
                <div><span>Total Quests</span><strong>{totalQuests}</strong></div>
                <div><span>Bosses Slain</span><strong>{totalBosses}</strong></div>
                <div><span>Focus Cycles</span><strong>{totalFocus}</strong></div>
                <div><span>Shards Earned</span><strong>{totalShards}</strong></div>
                <div><span>Max Level</span><strong>{maxLevel}</strong></div>
                <div><span>Prestige Total</span><strong>{totalPrestige}</strong></div>
              </div>
            </article>
            <article className="panel">
              <h3>Study Overview</h3>
              <div className="stat-grid">
                <div><span>Flashcards</span><strong>{totalCards}</strong></div>
                <div><span>Mastered</span><strong>{masteredCards}</strong></div>
                <div><span>Quiz Best</span><strong>{quizBestScore}</strong></div>
                <div><span>Accuracy</span><strong>{quizAccuracy}%</strong></div>
                <div><span>Current Streak</span><strong>{streakDays}d</strong></div>
                <div><span>Longest Streak</span><strong>{streak?.longest ?? 0}d</strong></div>
              </div>
            </article>
          </div>
        </>
      )}

      {/* Progress Tab */}
      {activeTab === "progress" && (
        <>
          <div className="fc-stats-grid" style={{ marginBottom: "24px" }}>
            <div className="stat-card"><span>Current Streak</span><strong>{streakDays}d</strong></div>
            <div className="stat-card"><span>Study Sessions</span><strong>{totalSessions}</strong></div>
            <div className="stat-card"><span>Total Time</span><strong>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</strong></div>
            <div className="stat-card"><span>Cards Mastered</span><strong>{masteredCards}/{totalCards}</strong></div>
            <div className="stat-card"><span>Quests Done</span><strong>{totalQuests}</strong></div>
            <div className="stat-card"><span>Average Daily</span><strong>{totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0}m</strong></div>
          </div>

          <article className="panel" style={{ marginBottom: "20px" }}>
            <h3>Activity Heatmap (last 16 weeks)</h3>
            {sessionHistory.length === 0 && <p className="muted">No sessions recorded yet. Complete a Pomodoro timer to see data here.</p>}
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginTop: 10 }}>
              {heatmap.map((cell) => (
                <HeatmapCell key={cell.date} count={cell.count} date={cell.date} />
              ))}
            </div>
          </article>

          <article className="panel">
            <h3>Subject Breakdown</h3>
            <div className="stat-grid">
              {allSubjects.map((subj) => (
                <div key={subj.key}>
                  <span>{subj.name}</span>
                  <strong>Lvl {subj.progress?.level ?? 1}</strong>
                  <span style={{ fontSize: "12px", opacity: 0.6 }}>
                    {subj.progress?.questsCleared ?? 0} quests
                  </span>
                </div>
              ))}
            </div>
          </article>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <>
          <div className="fc-stats-grid" style={{ marginBottom: "24px" }}>
            <div className="stat-card"><span>Quiz Sessions</span><strong>{quizSessions}</strong></div>
            <div className="stat-card"><span>Best Quiz</span><strong>{quizBestScore}</strong></div>
            <div className="stat-card"><span>Accuracy Rate</span><strong>{quizAccuracy}%</strong></div>
            <div className="stat-card"><span>Total Focus Time</span><strong>{Math.floor(totalMinutes / 60)}h</strong></div>
            <div className="stat-card"><span>Boss Victories</span><strong>{totalBosses}</strong></div>
            <div className="stat-card"><span>Consecutive Days</span><strong>{streakDays}d</strong></div>
          </div>

          <div className="feature-grid">
            <article className="panel">
              <h3>Quiz Performance</h3>
              <div className="stat-grid">
                <div><span>Best Score</span><strong>{quizBestScore}</strong></div>
                <div><span>Win Accuracy</span><strong>{quizAccuracy}%</strong></div>
                <div><span>Total Sessions</span><strong>{quizSessions}</strong></div>
                <div><span>Boss Battles Won</span><strong>{totalBosses}</strong></div>
              </div>
            </article>
            <article className="panel">
              <h3>Study Metrics</h3>
              <div className="stat-grid">
                <div><span>Total Study Time</span><strong>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</strong></div>
                <div><span>Average Session</span><strong>{totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0}m</strong></div>
                <div><span>Shard Balance</span><strong>{totalShards}</strong></div>
                <div><span>Prestige Rank</span><strong>{totalPrestige}</strong></div>
              </div>
            </article>
          </div>
        </>
      )}
    </section>
  );
}

export { ACHIEVEMENTS };
export default StatsPage;
