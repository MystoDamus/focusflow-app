import { Zap } from "lucide-react";

function HeroPanel({
  subjectPresets,
  subjects,
  activeSubjectKey,
  activeSubject,
  event,
  guild,
  levelFlash,
  dailyQuote,
  onSwitchSubject,
}) {
  return (
    <section className="hero-bar">
      {/* Left: greeting + quote */}
      <div className="hero-bar__left">
        <div className="hero-bar__title">
          <span className="hero-bar__pet">{activeSubject.pet}</span>
          <div>
            <p className="hero-bar__eyebrow">FocusFlow Guild</p>
            <h1 className="hero-bar__heading">{activeSubject.name}</h1>
          </div>
        </div>
        {dailyQuote && (
          <p className="hero-bar__quote">"{dailyQuote}"</p>
        )}
      </div>

      {/* Center: subject switcher */}
      <div className="hero-bar__subjects">
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

      {/* Right: key stats */}
      <div className="hero-bar__stats">
        <div className={`hero-bar__xp-block ${levelFlash ? "is-leveled" : ""}`}>
          <div className="hero-bar__xp-top">
            <span>Level {activeSubject.progress.level}</span>
            <strong>{activeSubject.progress.xp}/100 XP</strong>
          </div>
          <div className="xp-track" aria-label="XP progress">
            <div className="xp-fill" style={{ width: `${activeSubject.progress.xp}%` }} />
          </div>
        </div>
        <div className="hero-bar__badges">
          <div className="hero-bar__badge">
            <Zap size={14} />
            <span>{event.title}</span>
          </div>
          <div className="hero-bar__badge">
            <span>✦ Prestige {guild.prestigeLevel}</span>
          </div>
          <div className="hero-bar__badge">
            <span>💎 {guild.totalShards} shards</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroPanel;