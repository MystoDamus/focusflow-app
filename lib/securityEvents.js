import { backendLogSecurityEvent, isBackendEnabled } from "./backendClient";

const SECURITY_EVENTS_STORAGE_KEY = "focusflow-security-events-v1";
const MAX_LOCAL_EVENTS = 120;

function readLocalEvents() {
  try {
    const raw = window.localStorage.getItem(SECURITY_EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalEvents(events) {
  try {
    window.localStorage.setItem(SECURITY_EVENTS_STORAGE_KEY, JSON.stringify(events.slice(0, MAX_LOCAL_EVENTS)));
  } catch {
    // noop
  }
}

export function logSecurityEvent({
  eventType,
  severity = "info",
  message,
  context = {},
  userId = null,
}) {
  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventType,
    severity,
    message,
    context,
    userId,
    createdAt: new Date().toISOString(),
  };

  const local = readLocalEvents();
  writeLocalEvents([event, ...local]);

  if (isBackendEnabled()) {
    backendLogSecurityEvent({
      eventType,
      severity,
      message,
      context: {
        ...context,
        userId,
      },
    }).catch(() => {
      // Keep local-only log as fallback.
    });
  }

  return event;
}

export function getLocalSecurityEvents() {
  return readLocalEvents();
}
