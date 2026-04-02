function AnalyticsPage({
  season,
  accuracy,
  quiz,
  petProfile,
  activeSubject,
  flashcardSets,
  streak,
}) {
  const totalCards = flashcardSets.reduce((sum, setEntry) => sum + setEntry.cards.length, 0);
  const masteryFocus = Math.min(100, activeSubject.progress.focusCycles * 4);
  const masteryRecall = Math.min(100, totalCards * 5);
  const masteryCombat = Math.min(100, activeSubject.progress.bossVictories * 15);

  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>Performance Analytics</h2>
        <span>Season tier {season.tier}</span>
      </div>

      <div className="feature-grid">
        <article className="panel">
          <h3>Mastery Radar</h3>
          <div className="stat-grid">
            <div><span>Focus</span><strong>{masteryFocus}%</strong></div>
            <div><span>Recall</span><strong>{masteryRecall}%</strong></div>
            <div><span>Boss</span><strong>{masteryCombat}%</strong></div>
          </div>
        </article>

        <article className="panel">
          <h3>Study Metrics</h3>
          <div className="stat-grid">
            <div><span>Quiz Accuracy</span><strong>{accuracy}%</strong></div>
            <div><span>Best Quiz Score</span><strong>{quiz.bestScore}</strong></div>
            <div><span>Pet Level</span><strong>{petProfile.level}</strong></div>
            <div><span>Quest Clears</span><strong>{activeSubject.progress.questsCleared}</strong></div>
            <div><span>Streak</span><strong>{streak.current}d</strong></div>
            <div><span>Longest</span><strong>{streak.longest}d</strong></div>
          </div>
        </article>

        <article className="panel">
          <h3>Session History</h3>
          <div className="list-block">
            {activeSubject.history.slice(0, 8).map((entry) => (
              <div key={entry.id} className="list-item">
                <strong>{entry.title}</strong>
                <span>{entry.dayKey}</span>
              </div>
            ))}
            {!activeSubject.history.length ? <p className="muted">No sessions yet.</p> : null}
          </div>
        </article>
      </div>
    </section>
  );
}

export default AnalyticsPage;
