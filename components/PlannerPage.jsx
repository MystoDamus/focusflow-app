import { Plus } from "lucide-react";

function PlannerPage({
  planner,
  plannerCompletion,
  plannerDraft,
  onSetPlannerDraft,
  onAddPlannerMission,
  onToggleMissionStatus,
}) {
  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>Study Planner</h2>
        <span>{plannerCompletion}% complete</span>
      </div>

      <div className="feature-grid">
        <article className="panel">
          <h3>Weekly Missions</h3>
          <form className="stack-form" onSubmit={onAddPlannerMission}>
            <input value={plannerDraft} onChange={(event) => onSetPlannerDraft(event.target.value)} placeholder="Add custom mission" />
            <button type="submit" className="ghost-button"><Plus size={14} />Add Mission</button>
          </form>
          <div className="list-block">
            {planner.missions.map((mission) => (
              <button
                key={mission.id}
                type="button"
                className={`list-item ${mission.status === "done" ? "is-done" : ""}`}
                onClick={() => onToggleMissionStatus(mission.id)}
              >
                <strong>{mission.title}</strong>
                <span>{mission.status}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="panel">
          <h3>Templates</h3>
          <div className="template-tags">
            {planner.templates.map((template) => (
              <span key={template} className="template-tag">{template}</span>
            ))}
          </div>
          <p className="muted">Next best action: {plannerCompletion < 50 ? "Start a focus ritual" : "Run a quiz battle"}</p>
          <p className="muted">Semester deadline: {planner.semesterDeadline}</p>
        </article>
      </div>
    </section>
  );
}

export default PlannerPage;
