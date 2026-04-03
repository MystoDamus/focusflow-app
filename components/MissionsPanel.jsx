import { Plus } from "lucide-react";

function MissionsPanel({
  planner,
  plannerCompletion,
  plannerDraft,
  onSetPlannerDraft,
  onAddPlannerMission,
  onToggleMissionStatus,
  onDeletePlannerMission,
}) {
  return (
    <article className="panel missions-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Study Goals</span>
          <h2>Weekly Missions</h2>
        </div>
        <div className="mission-stats">
          <span>{plannerCompletion}% complete</span>
        </div>
      </div>

      <form className="stack-form" onSubmit={onAddPlannerMission} style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input 
            value={plannerDraft} 
            onChange={(event) => onSetPlannerDraft(event.target.value)} 
            placeholder="Add new mission..." 
            style={{ flex: 1 }}
          />
          <button type="submit" className="ghost-button" title="Add mission">
            <Plus size={16} />
          </button>
        </div>
      </form>

      <div className="list-block" style={{ maxHeight: "280px", overflowY: "auto" }}>
        {planner.missions && planner.missions.length > 0 ? (
          planner.missions.map((mission) => (
            <div key={mission.id} className="list-item-with-action" style={{ padding: "8px 0", borderBottom: "1px solid rgba(214, 176, 92, 0.1)" }}>
              <button
                type="button"
                className={`list-item ${mission.status === "done" ? "is-done" : ""}`}
                onClick={() => onToggleMissionStatus(mission.id)}
                style={{ flex: 1, textAlign: "left" }}
              >
                <strong>{mission.title}</strong>
                <span className="muted">{mission.status}</span>
              </button>
              <button
                type="button"
                className="ghost-button icon-btn"
                onClick={() => onDeletePlannerMission(mission.id)}
                title="Delete mission"
                style={{ padding: "4px 8px" }}
              >
                ×
              </button>
            </div>
          ))
        ) : (
          <p className="muted" style={{ padding: "12px", textAlign: "center" }}>No missions yet. Add one to get started.</p>
        )}
      </div>

      {!planner.missions || planner.missions.length === 0 ? null : (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(214, 176, 92, 0.1)" }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${plannerCompletion}%` }} />
          </div>
          <span className="muted" style={{ fontSize: "12px" }}>{plannerCompletion}% complete</span>
        </div>
      )}
    </article>
  );
}

export default MissionsPanel;
