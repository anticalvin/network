export const INTRUSION_STAGES = Object.freeze(["armed", "initializing", "cascading", "terminal-takeover", "reveal", "recovery", "complete"]);

export function createIntrusionState(previous = {}) {
  return { stage: "armed", completed: Boolean(previous.completed), cancelled: false, index: 0 };
}

export function advanceIntrusion(state) {
  if (state.cancelled || state.completed) return state;
  const index = Math.min(state.index + 1, INTRUSION_STAGES.length - 1);
  return { ...state, index, stage: INTRUSION_STAGES[index], completed: INTRUSION_STAGES[index] === "complete" };
}

export function cancelIntrusion(state) {
  return { ...state, cancelled: true, stage: "complete", completed: true };
}
