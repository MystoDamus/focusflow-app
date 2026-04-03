function ManaBar({ manaPercent, formatTime, timer }) {
  return (
    <article className="panel mana-bar-panel">
      <div className="mana-bar-container">
        <div className="mana-bar-header">
          <span className="eyebrow">Arcane Reserves</span>
          <strong>{formatTime(timer.secondsLeft)}</strong>
        </div>
        <div className="mana-bar-track" aria-label="Mana bar">
          <div className="mana-bar-fill" style={{ width: `${manaPercent}%` }} />
        </div>
      </div>
    </article>
  );
}

export default ManaBar;
