import { useEffect, useState } from "react";
import { Pause, Play, RefreshCcw, WandSparkles, Maximize2, Settings } from "lucide-react";

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
  onMaximizeTimer,
  onSetCustomTimer,
}) {
    const [showCustom, setShowCustom] = useState(false);
  const [customFocus, setCustomFocus] = useState(String(activeSubject.focusMinutes));
  const [customBreak, setCustomBreak] = useState(String(activeSubject.breakMinutes));

    const PRESETS = [
      { label: "25m", focus: 25, brk: 5 },
      { label: "45m", focus: 45, brk: 10 },
      { label: "90m", focus: 90, brk: 15 },
    ];

    useEffect(() => {
      if (!showCustom) {
        return;
      }

      setCustomFocus(String(activeSubject.focusMinutes));
      setCustomBreak(String(activeSubject.breakMinutes));
    }, [activeSubject.focusMinutes, activeSubject.breakMinutes, showCustom]);

    const getTimerError = (value, max, label) => {
      const raw = String(value ?? "").trim();
      if (!raw) {
        return `${label} is required.`;
      }

      const parsed = Number.parseInt(raw, 10);
      if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
        return `${label} must be a number.`;
      }

      if (parsed <= 0) {
        return `${label} must be greater than 0.`;
      }

      if (parsed > max) {
        return `${label} must be ${max} or less.`;
      }

      return "";
    };

    const focusError = getTimerError(customFocus, 180, "Focus");
    const breakError = getTimerError(customBreak, 60, "Break");
    const focusValue = Number.parseInt(customFocus, 10);
    const breakValue = Number.parseInt(customBreak, 10);
    const isFocusValid = !focusError;
    const isBreakValid = !breakError;
    const isCustomValid = !focusError && !breakError;

    const handleCustomSubmit = () => {
      if (isCustomValid) {
        onSetCustomTimer(focusValue, breakValue);
        setShowCustom(false);
      }
    };

  return (
    <article className="panel timer-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Mana Bar</span>
          <h2>Focus ritual</h2>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            className="icon-button"
            onClick={onMaximizeTimer}
            title="Maximize timer"
            aria-label="Maximize timer"
          >
            <Maximize2 size={16} />
          </button>
          <div className={`mode-pill mode-pill--${timer.mode}`}>
            <WandSparkles size={14} />
            <span>{timer.mode === "focus" ? "Focus phase" : "Break phase"}</span>
          </div>
        </div>
      </div>

      <div className="mana-card">
        <div className="mana-card__topline">
          <span className="eyebrow">Arcane Reserves</span>
        </div>
        <div className="mana-track" aria-label="Mana bar">
          <div className="mana-track-fill" style={{ width: `${manaPercent}%` }} />
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
        <button
          type="button"
          className="preset-btn ghost-button"
          onClick={() => setShowCustom(!showCustom)}
          title="Custom timer"
        >
          <Settings size={14} />
          <span style={{ marginLeft: "6px" }}>Custom</span>
        </button>
      </div>

      {showCustom && (
        <div style={{ 
          marginBottom: "12px", 
          padding: "12px", 
          backgroundColor: "rgba(99, 199, 255, 0.1)",
          borderRadius: "8px"
        }}>
          <div style={{ display: "flex", gap: "8px" }}>      
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", opacity: 0.7 }}>Focus (min)</label>
              <input
                type="number"
                min="1"
                max="180"
                value={customFocus}
                onChange={(e) => setCustomFocus(e.target.value)}
                aria-invalid={!isFocusValid}
                aria-describedby={!isFocusValid ? "custom-focus-error" : undefined}
                style={{
                  width: "100%",
                  padding: "6px",
                  backgroundColor: "rgba(11, 7, 20, 0.8)",
                  border: `1px solid ${isFocusValid ? "rgba(214, 176, 92, 0.25)" : "rgba(255, 120, 120, 0.8)"}`,
                  color: "#f7ecd0",
                  borderRadius: "4px",
                  marginTop: "4px"
                }}
              />
              {!isFocusValid && (
                <p id="custom-focus-error" style={{ margin: "6px 0 0", fontSize: "12px", color: "#ff9b9b" }}>
                  {focusError}
                </p>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: "12px", opacity: 0.7 }}>Break (min)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={customBreak}
                onChange={(e) => setCustomBreak(e.target.value)}
                aria-invalid={!isBreakValid}
                aria-describedby={!isBreakValid ? "custom-break-error" : undefined}
                style={{
                  width: "100%",
                  padding: "6px",
                  backgroundColor: "rgba(11, 7, 20, 0.8)",
                  border: `1px solid ${isBreakValid ? "rgba(214, 176, 92, 0.25)" : "rgba(255, 120, 120, 0.8)"}`,
                  color: "#f7ecd0",
                  borderRadius: "4px",
                  marginTop: "4px"
                }}
              />
              {!isBreakValid && (
                <p id="custom-break-error" style={{ margin: "6px 0 0", fontSize: "12px", color: "#ff9b9b" }}>
                  {breakError}
                </p>
              )}
            </div>
            <button
              type="button"
              className="accent-button"
              onClick={handleCustomSubmit}
              disabled={!isCustomValid}
              style={{ alignSelf: "flex-end" }}
            >
              Set
            </button>
          </div>
        </div>
      )}


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
          {semesterDeadline && (
            <span className={Math.max(0, Math.ceil((new Date(semesterDeadline) - new Date()) / (1000 * 60 * 60 * 24))) < 14 ? "warning-text" : "muted-text"}>
              {Math.max(0, Math.ceil((new Date(semesterDeadline) - new Date()) / (1000 * 60 * 60 * 24)))}d left
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