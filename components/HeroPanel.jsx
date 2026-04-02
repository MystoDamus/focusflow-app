import { GraduationCap } from "lucide-react";

function HeroPanel({
  subjectPresets,
  subjects,
  activeSubjectKey,
  activeSubject,
  event,
  guild,
  levelFlash,
  dailyQuote,
  dailyTip,
  onSwitchSubject,
}) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <span className="eyebrow">Guild Hall</span>
        <h1>Study Campaign Dashboard</h1>
        <p>
          Switch subject loadouts, fight subject bosses, clear revision queues,
          coordinate party goals, and keep your semester campaign moving.
        </p>
        <p className="daily-quote">"{dailyQuote}"</p>
        {dailyTip && (
          <div className="daily-tip-banner">
            <span className="daily-tip-icon">💡</span>
            <span className="daily-tip-text">{dailyTip}</span>
          </div>
        )}

        <div className="subject-loadouts">
          {subjectPresets.map((subject) => {
            const subjectState = subjects[subject.key];
            const isActive = subject.key === activeSubjectKey;

            return (
              <button
                key={subject.key}
                type="button"
                className={`subject-chip ${isActive ? "is-active" : ""}`}
                onClick={() => onSwitchSubject(subject.key)}
              >
                <span>{subjectState.pet}</span>
                <strong>{subject.name}</strong>
                <small>Lv {subjectState.progress.level}</small>
              </button>
            );
          })}
        </div>

        <div className="hero-metrics">
          <div className="hero-metric">
            <span>Daily event</span>
            <strong>{event.title}</strong>
          </div>
          <div className="hero-metric">
            <span>Guild prestige</span>
            <strong>{guild.prestigeLevel}</strong>
          </div>
          <div className="hero-metric">
            <span>Total shards</span>
            <strong>{guild.totalShards}</strong>
          </div>
        </div>
      </div>

      <div className={`level-card ${levelFlash ? "is-leveled" : ""}`}>
        <div className="level-card__header">
          <div>
            <span className="level-label">Active Loadout</span>
            <strong>{activeSubject.name}</strong>
          </div>
          <GraduationCap size={20} />
        </div>
        <div className="xp-track" aria-label="XP progress">
          <div className="xp-fill" style={{ width: `${activeSubject.progress.xp}%` }} />
        </div>
        <div className="level-card__footer">
          <span>Level {activeSubject.progress.level}</span>
          <span>{activeSubject.progress.xp}/100 XP</span>
        </div>
        <div className="level-card__stats">
          <div>
            <span>Boss wins</span>
            <strong>{activeSubject.progress.bossVictories}</strong>
          </div>
          <div>
            <span>Prestige</span>
            <strong>{activeSubject.progress.prestigeRank}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroPanel;