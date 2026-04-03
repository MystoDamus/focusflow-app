import { useState } from "react";

export default function usePlanner(state, setState) {
  const [plannerDraft, setPlannerDraft] = useState("");

  const completedMissions = state.planner.missions.filter((mission) => mission.status === "done").length;
  const plannerCompletion = state.planner.missions.length
    ? Math.round((completedMissions / state.planner.missions.length) * 100)
    : 0;

  function addPlannerMission(event) {
    event.preventDefault();
    if (!plannerDraft.trim()) {
      return;
    }

    const mission = {
      id: `mission-${Date.now()}`,
      title: plannerDraft.trim(),
      status: "todo",
      type: "custom",
    };

    setState((current) => ({
      ...current,
      planner: {
        ...current.planner,
        missions: [mission, ...current.planner.missions],
      },
    }));

    setPlannerDraft("");
  }

  function toggleMissionStatus(missionId) {
    setState((current) => ({
      ...current,
      planner: {
        ...current.planner,
        missions: current.planner.missions.map((mission) =>
          mission.id === missionId
            ? { ...mission, status: mission.status === "done" ? "todo" : "done" }
            : mission,
        ),
      },
    }));
  }

  function deletePlannerMission(missionId) {
    setState((current) => ({
      ...current,
      planner: {
        ...current.planner,
        missions: current.planner.missions.filter((mission) => mission.id !== missionId),
      },
    }));
  }

  return { plannerDraft, setPlannerDraft, plannerCompletion, addPlannerMission, toggleMissionStatus, deletePlannerMission };
}
