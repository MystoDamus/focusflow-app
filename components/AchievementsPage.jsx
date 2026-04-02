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

function AchievementsPage({ achievements, subjects, quiz, flashcards, streak }) {
  const unlocked = achievements?.unlocked ?? [];
  const totalCards = flashcards.sets.reduce((s, set) => s + set.cards.length, 0);
  const allSubjects = Object.values(subjects);
  const maxLevel = Math.max(...allSubjects.map((s) => s.progress.level));
  const totalQuests = allSubjects.reduce((s, sub) => s + sub.progress.questsCleared, 0);
  const totalBosses = allSubjects.reduce((s, sub) => s + sub.progress.bossVictories, 0);
  const totalFocus = allSubjects.reduce((s, sub) => s + sub.progress.focusCycles, 0);
  const totalShards = allSubjects.reduce((s, sub) => s + sub.progress.shards, 0);
  const totalPrestige = allSubjects.reduce((s, sub) => s + sub.progress.prestigeRank, 0);

  const unlockedCount = unlocked.length;

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>Achievements</h2>
        <span className="eyebrow">{unlockedCount}/{ACHIEVEMENTS.length} unlocked</span>
      </div>

      <div className="achievement-progress-bar">
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

      <div className="feature-grid" style={{ marginTop: "14px" }}>
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
          <h3>Study Streak</h3>
          <div className="streak-display">
            <div className="streak-flame">{streak.current >= 7 ? "🔥" : streak.current >= 3 ? "✨" : "💧"}</div>
            <div>
              <div className="streak-count">{streak.current} day{streak.current !== 1 ? "s" : ""}</div>
              <span className="muted">Longest: {streak.longest} days</span>
            </div>
          </div>
          <div className="stat-grid" style={{ marginTop: "10px" }}>
            <div><span>Quiz Best</span><strong>{quiz.bestScore}</strong></div>
            <div><span>Flashcards</span><strong>{totalCards}</strong></div>
          </div>
        </article>
      </div>
    </section>
  );
}

export { ACHIEVEMENTS };
export default AchievementsPage;
