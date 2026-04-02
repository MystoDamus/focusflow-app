export const CLOUD_STATE_SCHEMA_VERSION = 1;

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function makeCloudPayload(state) {
  return {
    __schemaVersion: CLOUD_STATE_SCHEMA_VERSION,
    __savedAt: new Date().toISOString(),
    state,
  };
}

export function validateAndExtractCloudState(payload) {
  if (!isObject(payload)) {
    return { valid: false, reason: "Invalid payload object", state: null };
  }

  // Backward compatibility: support legacy payload shape that stored state directly.
  if (!Object.prototype.hasOwnProperty.call(payload, "__schemaVersion") && isObject(payload.subjects)) {
    const legacy = payload;
    if (!isObject(legacy.timer) || typeof legacy.timer.secondsLeft !== "number" || typeof legacy.activeSubject !== "string") {
      return { valid: false, reason: "Corrupted legacy payload", state: null };
    }
    return { valid: true, reason: "ok", state: legacy };
  }

  const version = payload.__schemaVersion;
  if (typeof version !== "number" || version < 1) {
    return { valid: false, reason: "Unsupported schema version", state: null };
  }

  if (version > CLOUD_STATE_SCHEMA_VERSION) {
    return { valid: false, reason: "Saved state version is newer than client", state: null };
  }

  if (!isObject(payload.state)) {
    return { valid: false, reason: "Missing state content", state: null };
  }

  const state = migrateStateToCurrent(payload.state, version);

  if (!isObject(state.subjects) || typeof state.activeSubject !== "string" || !state.subjects[state.activeSubject]) {
    return { valid: false, reason: "Corrupted subject state", state: null };
  }

  if (!isObject(state.timer) || typeof state.timer.secondsLeft !== "number") {
    return { valid: false, reason: "Corrupted timer state", state: null };
  }

  return { valid: true, reason: "ok", state };
}

function migrateStateToCurrent(state, fromVersion) {
  let current = { ...state };

  // Example migration slot for future versions.
  if (fromVersion < 1) {
    current = {
      ...current,
    };
  }

  return current;
}

export function sanitizeLeaderboardEntry(entry) {
  return {
    displayName: String(entry.displayName ?? "Guild Cadet").slice(0, 40),
    level: Number.isFinite(entry.level) ? Math.max(1, Math.floor(entry.level)) : 1,
    score: Number.isFinite(entry.score) ? Math.max(0, Math.floor(entry.score)) : 0,
    totalQuizzesCompleted: Number.isFinite(entry.totalQuizzesCompleted)
      ? Math.max(0, Math.floor(entry.totalQuizzesCompleted))
      : 0,
    totalBossesFought: Number.isFinite(entry.totalBossesFought)
      ? Math.max(0, Math.floor(entry.totalBossesFought))
      : 0,
    currentStreak: Number.isFinite(entry.currentStreak) ? Math.max(0, Math.floor(entry.currentStreak)) : 0,
    modeScores: isObject(entry.modeScores) ? entry.modeScores : {},
  };
}
