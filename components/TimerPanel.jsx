import { Pause, Play, RefreshCcw, WandSparkles } from "lucide-react";

function TimerPanel({
  timer,
  manaPercent,
  activeSubject,
  party,
  partyContribution,
  partyPercent,
  goalPercent,
  goalLabel,
  goalSessions,
  formatTime,
  onToggleTimer,
  onResetTimer,
  onSaveGoal,
  onSetGoalLabel,
  onSetGoalSessions,
  semesterDeadline,
  onSetTimerPreset,
}) {
    const PRESETS = [
      { label: "25m", focus: 25, brk: 5 },
      { label: "45m", focus: 45, brk: 10 },
      { label: "90m", focus: 90, brk: 15 },
    ];

    const daysRemaining = semesterDeadline
      ? Math.max(0, Math.ceil((new Date(semesterDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
      : null;

  return (
    <article className="panel timer-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Mana Bar</span>
          <h2>Focus ritual</h2>
        </div>
        <div className={`mode-pill mode-pill--${timer.mode}`}>
          <WandSparkles size={14} />
          <span>{timer.mode === "focus" ? "Focus phase" : "Break phase"}</span>
        </div>
      </div>

      <div className="timer-presets" role="group" aria-label="Timer presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`preset-btn ${activeSubject.focusMinutes === p.focus && activeSubject.breakMinutes === p.brk ? "is-active" : ""}`}
            onClick={() => onSetTimerPreset(p.focus, p.brk)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mana-card">
        <div className="mana-card__topline">
          <span>Arcane reserves</span>
          <strong>{formatTime(timer.secondsLeft)}</strong>
        </div>
        <div className="mana-track" aria-label="Mana bar">
          <div className="mana-fill" style={{ width: `${manaPercent}%` }} />
        </div>
        <p>
          Focus {activeSubject.focusMinutes} / Break {activeSubject.breakMinutes} minutes
        </p>
      </div>

      <div className="timer-actions">
        <button type="button" className="accent-button" onClick={onToggleTimer}>
          {timer.isRunning ? <Pause size={16} /> : <Play size={16} />}
          {timer.isRunning ? "Pause" : "Start"}
        </button>
        <button type="button" className="ghost-button" onClick={onResetTimer}>
          <RefreshCcw size={16} />
          Reset
        </button>
      </div>

      <div className="timer-stats">
        <div>
          <span>Cycles</span>
          <strong>{activeSubject.progress.focusCycles}</strong>
        </div>
        <div>
          <span>Tonics</span>
          <strong>{activeSubject.progress.xpTonics}</strong>
        </div>
        <div>
          <span>Shield</span>
          <strong>{activeSubject.progress.streakShield}</strong>
        </div>
      </div>

      <div className="party-card">
        <div className="heatmap-card__header">
          <span className="eyebrow">Party Board</span>
          <span>{partyContribution}/{party.weeklyTarget}</span>
        </div>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${partyPercent}%` }} />
        </div>
        <div className="party-list">
          {party.members.map((member) => (
            <div key={member.name} className="party-item">
              <div>
                <strong>{member.name}</strong>
                <span>{member.role}</span>
              </div>
              <span>{member.quests} quests</span>
            </div>
          ))}
        </div>
      </div>

      <div className="goal-card">
        <div className="heatmap-card__header">
          <span className="eyebrow">Semester Goal</span>
          <span>{activeSubject.semesterGoal.label || "No goal set"}</span>
        </div>
        <div className="goal-timeline">
          <div className="goal-timeline-track">
            <div className="goal-timeline-fill" style={{ width: `${goalPercent}%` }} />
            {[25, 50, 75].map((mark) => (
              <div
                key={mark}
                className={`goal-milestone ${goalPercent >= mark ? "is-reached" : ""}`}
                style={{ left: `${mark}%` }}
              >
                <span className="goal-milestone-label">{mark}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="goal-timeline-footer">
          <span>{activeSubject.semesterGoal.completedSessions}/{activeSubject.semesterGoal.targetSessions} sessions · {goalPercent}%</span>
          {daysRemaining !== null && (
            <span className={daysRemaining < 14 ? "warning-text" : "muted-text"}>
              {daysRemaining}d left
            </span>
          )}
        </div>
        <form className="goal-form" onSubmit={onSaveGoal}>
          <input type="text" placeholder="Goal name" value={goalLabel} onChange={(event) => onSetGoalLabel(event.target.value)} />
          <input type="number" min="1" value={goalSessions} onChange={(event) => onSetGoalSessions(Number(event.target.value))} />
          <button type="submit" className="ghost-button">Save</button>
        </form>
      </div>
    </article>
  );
}

export default TimerPanel;