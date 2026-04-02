import { useEffect, useMemo, useRef, useState } from "react";
import {
  backendFetchLeaderboard,
  backendLoadGameState,
  backendSaveGameState,
  backendUpsertLeaderboard,
  isBackendEnabled,
} from "../lib/backendClient";
import { logSecurityEvent } from "../lib/securityEvents";
import { makeCloudPayload, sanitizeLeaderboardEntry, validateAndExtractCloudState } from "../lib/stateGuard";

export default function useCloudSync({ user, state, buildLeaderboardEntry, onRemoteStateLoaded }) {
  const [remoteLeaderboard, setRemoteLeaderboard] = useState([]);
  const [syncStatus, setSyncStatus] = useState(isBackendEnabled() ? "idle" : "local-only");
  const [syncError, setSyncError] = useState("");
  const loadedUserRef = useRef(null);
  const saveTimerRef = useRef(null);
  const [queuedOffline, setQueuedOffline] = useState(false);

  const backendReady = useMemo(() => isBackendEnabled() && !!user?.userId, [user?.userId]);

  useEffect(() => {
    if (!backendReady) {
      setSyncStatus(isBackendEnabled() ? "auth-required" : "local-only");
      return;
    }

    let cancelled = false;

    async function loadOnce() {
      if (loadedUserRef.current === user.userId) {
        return;
      }

      setSyncStatus("loading");
      setSyncError("");
      const { data, error } = await backendLoadGameState(user.userId);
      if (cancelled) {
        return;
      }

      if (!error && data?.payload) {
        const parsed = validateAndExtractCloudState(data.payload);
        if (parsed.valid) {
          onRemoteStateLoaded(parsed.state);
        } else {
          setSyncStatus("degraded");
          setSyncError(`Cloud save rejected: ${parsed.reason}`);
          logSecurityEvent({
            eventType: "cloud_payload_rejected",
            severity: "warning",
            message: `Cloud payload rejected: ${parsed.reason}`,
            context: { reason: parsed.reason },
            userId: user?.userId ?? null,
          });
        }
      }

      loadedUserRef.current = user.userId;
      setSyncStatus(error ? "degraded" : "synced");
      setSyncError(error ? (error.message || "Could not load cloud save") : "");
    }

    loadOnce();

    return () => {
      cancelled = true;
    };
  }, [backendReady, onRemoteStateLoaded, user?.userId]);

  useEffect(() => {
    if (!backendReady || loadedUserRef.current !== user.userId) {
      return;
    }

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(async () => {
      if (!navigator.onLine) {
        setSyncStatus("offline-queued");
        setQueuedOffline(true);
        return;
      }

      setSyncStatus("saving");
      setSyncError("");
      const payload = makeCloudPayload(state);
      const { error } = await backendSaveGameState(user.userId, payload);
      setSyncStatus(error ? "degraded" : "synced");
      setSyncError(error ? (error.message || "Cloud save failed") : "");
      if (error) {
        logSecurityEvent({
          eventType: "cloud_save_failed",
          severity: "warning",
          message: error.message || "Cloud save failed",
          context: {},
          userId: user?.userId ?? null,
        });
      }
      if (!error) {
        setQueuedOffline(false);
      }
    }, 900);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [backendReady, state, user?.userId]);

  useEffect(() => {
    if (!backendReady) {
      return;
    }

    const entry = sanitizeLeaderboardEntry(buildLeaderboardEntry());
    backendUpsertLeaderboard({
      user_id: user.userId,
      display_name: entry.displayName,
      level: entry.level,
      score: entry.score,
      total_quizzes_completed: entry.totalQuizzesCompleted,
      total_bosses_fought: entry.totalBossesFought,
      current_streak: entry.currentStreak,
      mode_scores: entry.modeScores ?? {},
      updated_at: new Date().toISOString(),
    }).catch(() => {
      setSyncStatus("degraded");
      setSyncError("Leaderboard sync failed");
      logSecurityEvent({
        eventType: "leaderboard_sync_failed",
        severity: "warning",
        message: "Leaderboard sync failed",
        context: {},
        userId: user?.userId ?? null,
      });
    });
  }, [backendReady, buildLeaderboardEntry, user?.userId]);

  useEffect(() => {
    if (!backendReady) {
      return;
    }

    let cancelled = false;

    async function pullLeaderboard() {
      if (!navigator.onLine) {
        return;
      }

      const { data, error } = await backendFetchLeaderboard(100);
      if (error) {
        setSyncStatus("degraded");
        setSyncError(error.message || "Leaderboard fetch failed");
        logSecurityEvent({
          eventType: "leaderboard_fetch_failed",
          severity: "warning",
          message: error.message || "Leaderboard fetch failed",
          context: {},
          userId: user?.userId ?? null,
        });
      }
      if (!cancelled) {
        setRemoteLeaderboard((data ?? []).map((entry) => ({
          userId: entry.user_id,
          displayName: entry.display_name,
          level: entry.level,
          score: entry.score,
          totalQuizzesCompleted: entry.total_quizzes_completed,
          totalBossesFought: entry.total_bosses_fought,
          currentStreak: entry.current_streak,
          modeScores: entry.mode_scores ?? {},
        })));
      }
    }

    pullLeaderboard();
    const interval = window.setInterval(pullLeaderboard, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [backendReady]);

  function retrySync() {
    loadedUserRef.current = null;
    setSyncStatus("idle");
    setSyncError("");
  }

  useEffect(() => {
    if (!backendReady) {
      return;
    }

    async function handleOnline() {
      if (!queuedOffline || !user?.userId) {
        return;
      }

      setSyncStatus("saving");
      const payload = makeCloudPayload(state);
      const { error } = await backendSaveGameState(user.userId, payload);
      setSyncStatus(error ? "degraded" : "synced");
      setSyncError(error ? (error.message || "Cloud save failed") : "");
      if (error) {
        logSecurityEvent({
          eventType: "cloud_save_retry_failed",
          severity: "warning",
          message: error.message || "Cloud save retry failed",
          context: {},
          userId: user?.userId ?? null,
        });
      }
      if (!error) {
        setQueuedOffline(false);
      }
    }

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [backendReady, queuedOffline, state, user?.userId]);

  return {
    remoteLeaderboard,
    syncStatus,
    syncError,
    retrySync,
    queuedOffline,
    backendReady,
  };
}
