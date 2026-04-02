import { Flame, WandSparkles } from "lucide-react";

function BossArenaPage({
  battle,
  activeSubject,
  season,
  petProfile,
  timer,
  onCompleteQuest,
  onToggleTimer,
}) {
  return (
    <section className="feature-page boss-arena-page">
      <div className="feature-header">
        <h2>Boss Arena</h2>
        <span>Combo x{battle.combo}</span>
      </div>
      <div className="boss-arena-grid">
        <article className="panel boss-stage">
          <div className="boss-avatar-wrap">
            <div className={`boss-avatar ${battle.pulse % 2 ? "is-hit" : ""}`}>👹</div>
            <div className="damage-pop">-{battle.damage || 0}</div>
          </div>
          <h3>{activeSubject.boss.name}</h3>
          <div className="xp-track">
            <div className="boss-fill" style={{ width: `${(activeSubject.boss.hp / activeSubject.boss.maxHp) * 100}%` }} />
          </div>
          <p>{activeSubject.boss.hp}/{activeSubject.boss.maxHp} HP</p>
          <div className="arena-actions">
            <button type="button" className="accent-button" onClick={() => onCompleteQuest(activeSubject.quests.find((quest) => !quest.completed)?.id)}>
              <WandSparkles size={16} />
              Cast Study Spell
            </button>
            <button type="button" className="ghost-button" onClick={onToggleTimer}>
              <Flame size={16} />
              {timer.isRunning ? "Pause Ritual" : "Start Ritual"}
            </button>
          </div>
        </article>
        <article className="panel">
          <div className="feature-header">
            <h3>Battle Rewards</h3>
          </div>
          <p>Boss damage is dealt by completed quests, focus-cycle milestones, and quiz streaks.</p>
          <div className="stat-grid">
            <div><span>Boss Victories</span><strong>{activeSubject.progress.bossVictories}</strong></div>
            <div><span>Season Tier</span><strong>{season.tier}</strong></div>
            <div><span>Pet Evolution</span><strong>{petProfile.evolution}</strong></div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default BossArenaPage;
