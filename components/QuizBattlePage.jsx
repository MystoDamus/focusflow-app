import { useEffect, useMemo, useRef, useState } from "react";
import { getDefaultAIProvider } from "../services/aiGeneration";
import { getBackendClient, isBackendEnabled } from "../lib/backendClient";

function getComboRank(value) {
  if (value >= 10) return "Legendary";
  if (value >= 7) return "Rampage";
  if (value >= 5) return "Blazing";
  if (value >= 3) return "Combo";
  return null;
}

function getComboRankId(value) {
  if (value >= 10) return "legendary";
  if (value >= 7) return "rampage";
  if (value >= 5) return "blazing";
  if (value >= 3) return "combo";
  return "none";
}

function QuizBattlePage({
  pageMode = "battle",
  quizSession,
  quizQuestion,
  quizState,
  accuracy,
  onStartQuizBattle,
  onStartSpeedRun,
  onAnswerQuiz,
  onAnswerOpenQuestion,
  onUseFiftyFifty,
  onUseExtraTime,
  onUseDefend,
  onUseHeal,
  onUsePotion,
  onRestartWrongAnswerChallenge,
  onReturnToQuizLobby,
  customQuizSets,
  activeCustomSet,
  onCreateCustomQuizSet,
  onAddCustomQuizQuestion,
  onSelectCustomQuizSet,
  onUpdateCustomQuizQuestion,
  onDeleteCustomQuizQuestion,
  onDeleteCustomQuizSet,
  onDuplicateCustomQuizQuestion,
  onMoveCustomQuizQuestion,
  onReorderCustomQuizQuestions,
  onAIGenerateQuiz,
  onAIGenerateStudyPlan,
  aiBusy,
  aiQuizStatus,
  aiPlanStatus,
  aiHealthLog,
  onClearAIHealthLog,
  weakAreaCount,
  onPracticeWeakAreas,
  partyRoster,
  userDisplayName,
  userProfile,
  onUpdateUserProfile,
  soundEnabled,
  onToggleSoundEffects,
}) {
  const [openAnswer, setOpenAnswer] = useState("");
  const [newSetTitle, setNewSetTitle] = useState("");
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [draftChoices, setDraftChoices] = useState("");
  const [draftOptions, setDraftOptions] = useState([]);
  const [draftOptionInput, setDraftOptionInput] = useState("");
  const [draftType, setDraftType] = useState("mcq");
  const [draftExplanation, setDraftExplanation] = useState("");
  const [quizTab, setQuizTab] = useState("battle"); // battle | builder
  const [builderTab, setBuilderTab] = useState("create"); // create | edit | manage
  const [createStep, setCreateStep] = useState(1);
  const [editStep, setEditStep] = useState(1);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editType, setEditType] = useState("mcq");
  const [editExplanation, setEditExplanation] = useState("");
  const [editOptions, setEditOptions] = useState([]);
  const [editOptionInput, setEditOptionInput] = useState("");
  const [draggedDraftOptionIndex, setDraggedDraftOptionIndex] = useState(null);
  const [draggedEditOptionIndex, setDraggedEditOptionIndex] = useState(null);
  const [draggedQuestionId, setDraggedQuestionId] = useState(null);
  const [manageSearch, setManageSearch] = useState("");
  const [manageTypeFilter, setManageTypeFilter] = useState("all");
  const [manageSort, setManageSort] = useState("manual");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [moveTargetSetId, setMoveTargetSetId] = useState("");
  const [showWrongReview, setShowWrongReview] = useState(false);
  const [aiProvider, setAiProvider] = useState(() => getDefaultAIProvider());
  const [aiPromptText, setAiPromptText] = useState("");
  const [aiFile, setAiFile] = useState(null);
  const [aiQuestionCount, setAiQuestionCount] = useState("10");
  const [aiTitle, setAiTitle] = useState("AI Quiz Set");
  const [studyPlanPreview, setStudyPlanPreview] = useState(null);
  const [quizSource, setQuizSource] = useState("flashcards");
  const [selectedSourceSetId, setSelectedSourceSetId] = useState("");
  const [battleQuestionCount, setBattleQuestionCount] = useState("10");
  const [battleTimePerQuestion, setBattleTimePerQuestion] = useState("20");
  const [speedDuration, setSpeedDuration] = useState("60");
  const [answerFx, setAnswerFx] = useState("idle");
  const [comboCount, setComboCount] = useState(0);
  const [versusFormat, setVersusFormat] = useState("ffa");
  const [roomInput, setRoomInput] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomHostId, setRoomHostId] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerTeam, setPlayerTeam] = useState("A");
  const [lobbyChatInput, setLobbyChatInput] = useState("");
  const [lobbyChat, setLobbyChat] = useState([]);
  const [versusMatch, setVersusMatch] = useState(null);
  const [localAnswer, setLocalAnswer] = useState(null);
  const [versusStatus, setVersusStatus] = useState("idle");
  const localPlayerIdRef = useRef(`pv-${Math.random().toString(36).slice(2, 10)}`);
  const realtimeChannelRef = useRef(null);
  const fallbackChannelRef = useRef(null);
  const socialChannelRef = useRef(null);
  const [friendSearch, setFriendSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [presenceVisibility, setPresenceVisibility] = useState("public");
  const [presenceStatus, setPresenceStatus] = useState("online");
  const [socialTab, setSocialTab] = useState("online");
  const [onlineDirectory, setOnlineDirectory] = useState([]);
  const qType = quizQuestion?.type ?? "mcq";
  const competitiveStats = quizState.competitive ?? {
    currentStreak: 0,
    bestStreak: 0,
    accuracyRecord: 0,
    bestScore: 0,
  };
  const quizStatusTone = aiQuizStatus?.state === "error"
    ? "#ff8f8f"
    : aiQuizStatus?.state === "success"
      ? "#81f2a4"
      : "#ffe39a";
  const planStatusTone = aiPlanStatus?.state === "error"
    ? "#ff8f8f"
    : aiPlanStatus?.state === "success"
      ? "#81f2a4"
      : "#ffe39a";
  const quizAiLog = (aiHealthLog ?? []).filter((entry) => entry.surface === "quiz" || entry.surface === "studyPlan").slice(0, 5);
  const pressureMode = quizSession?.pressureMode ?? "steady";
  const pressureLabel = pressureMode === "hard"
    ? "Pressure: Hard"
    : pressureMode === "assist"
      ? "Pressure: Assist"
      : "Pressure: Steady";
  const pressureColor = pressureMode === "hard" ? "#ff9a7d" : pressureMode === "assist" ? "#81f2a4" : "#7ce0ff";
  const quizWeakTopics = Object.entries(quizState.weakStats?.byTopic ?? {}).sort((left, right) => right[1] - left[1]).slice(0, 3);
  const quizWeakTypes = Object.entries(quizState.weakStats?.byType ?? {}).sort((left, right) => right[1] - left[1]).slice(0, 3);
  const comboRank = getComboRank(comboCount);
  const comboRankId = getComboRankId(comboCount);
  const builderOnly = pageMode === "builder";
  const activeBuilderSetCards = activeCustomSet?.cards ?? [];
  const quizTypeCounts = activeBuilderSetCards.reduce((counts, card) => {
    const key = card.type ?? "mcq";
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
  const managedQuestions = activeBuilderSetCards.filter((card) => {
    const matchesSearch = !manageSearch.trim()
      || card.question.toLowerCase().includes(manageSearch.toLowerCase())
      || String(card.answer ?? "").toLowerCase().includes(manageSearch.toLowerCase());
    const matchesType = manageTypeFilter === "all" || (card.type ?? "mcq") === manageTypeFilter;
    return matchesSearch && matchesType;
  });
  const localPlayerId = localPlayerIdRef.current;
  const localPlayerName = userDisplayName || "Guild Cadet";
  const isRoomHost = Boolean(roomCode) && roomHostId === localPlayerId;
  const readyCount = lobbyPlayers.filter((player) => player.ready).length;
  const onlineCount = lobbyPlayers.length;
  const requiredPlayers = versusFormat === "2v2" ? 4 : versusFormat === "3v3" ? 6 : 2;
  const teamCounts = lobbyPlayers.reduce((acc, player) => {
    const team = player.team ?? "A";
    acc[team] = (acc[team] ?? 0) + 1;
    return acc;
  }, { A: 0, B: 0 });
  const allPlayersReady = lobbyPlayers.length > 0 && readyCount === lobbyPlayers.length;
  const hasExactTeamCount = versusFormat === "ffa" ? lobbyPlayers.length >= 2 : lobbyPlayers.length === requiredPlayers;
  const hasBalancedTeams = versusFormat === "ffa"
    ? true
    : teamCounts.A === requiredPlayers / 2 && teamCounts.B === requiredPlayers / 2;
  const canStartVersus = hasExactTeamCount && hasBalancedTeams && allPlayersReady;
  const requirementMessage = versusFormat === "ffa"
    ? "FFA requires at least 2 players and everyone ready."
    : `${versusFormat.toUpperCase()} requires exactly ${requiredPlayers} players with ${requiredPlayers / 2} on Team A and ${requiredPlayers / 2} on Team B, all ready.`;
  const teamScoreboard = useMemo(() => {
    if (!versusMatch?.scores) return {};
    return Object.values(versusMatch.scores).reduce((acc, entry) => {
      const team = entry.team || "Solo";
      acc[team] = (acc[team] ?? 0) + (entry.score ?? 0);
      return acc;
    }, {});
  }, [versusMatch]);
  const onlineFriends = friends.filter((friend) => friend.status === "online");
  const selectedFriends = friends.filter((friend) => selectedFriendIds.includes(friend.id));
  const acceptedInvites = pendingInvites.filter((invite) => invite.status === "accepted");
  const friendIds = new Set(friends.map((friend) => friend.id));
  const discoveredOnline = onlineDirectory.filter((entry) => (
    !friendIds.has(entry.id)
    && (!friendSearch.trim() || entry.name.toLowerCase().includes(friendSearch.toLowerCase()) || entry.friendCode.toLowerCase().includes(friendSearch.toLowerCase()))
  ));
  const friendsWithPresence = friends.map((friend) => {
    const onlineEntry = onlineDirectory.find((entry) => entry.id === friend.id);
    return {
      ...friend,
      status: onlineEntry?.status ?? "offline",
      lastSeenAt: onlineEntry?.lastSeenAt ?? friend.lastSeenAt,
    };
  });
  const visibilityHint = presenceVisibility === "public"
    ? "Everyone can see you online"
    : presenceVisibility === "friends"
      ? "Only friends can see you online"
      : "No one can see you online";
  const friendCode = userProfile?.leaderboardStats?.social?.friendCode
    || `FF-${String(userProfile?.userId ?? localPlayerId).replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase().padStart(6, "0")}`;

  function reorderList(items, startIndex, endIndex) {
    if (startIndex === null || endIndex === null || startIndex === endIndex) {
      return items;
    }

    const next = [...items];
    const [moved] = next.splice(startIndex, 1);
    next.splice(endIndex, 0, moved);
    return next;
  }

  function buildQuizPreview(mode = "create") {
    return {
      question: mode === "create" ? draftQuestion : editQuestion,
      answer: mode === "create" ? draftAnswer : editAnswer,
      type: mode === "create" ? draftType : editType,
      options: mode === "create" ? draftOptions : editOptions,
      explanation: mode === "create" ? draftExplanation : editExplanation,
    };
  }

  const quizPreview = buildQuizPreview(builderTab === "edit" ? "edit" : "create");

  useEffect(() => {
    setQuizTab(builderOnly ? "builder" : "battle");
  }, [builderOnly]);

  useEffect(() => {
    if (!selectedSourceSetId && activeCustomSet?.id) {
      setSelectedSourceSetId(activeCustomSet.id);
    }
  }, [selectedSourceSetId, activeCustomSet?.id]);

  useEffect(() => {
    if (answerFx === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setAnswerFx("idle"), 650);
    return () => window.clearTimeout(timeoutId);
  }, [answerFx]);

  useEffect(() => {
    const social = userProfile?.leaderboardStats?.social ?? {};
    if (Array.isArray(social.friends)) {
      setFriends(social.friends);
    }
    if (Array.isArray(social.requests)) {
      setPendingInvites(social.requests);
    }
    if (social.visibility) {
      setPresenceVisibility(social.visibility);
    }
    if (social.status) {
      setPresenceStatus(social.status);
    }
  }, [userProfile?.userId]);

  function persistSocialPatch(patch) {
    if (!onUpdateUserProfile || !userProfile) {
      return;
    }

    const currentStats = userProfile.leaderboardStats ?? {};
    const currentSocial = currentStats.social ?? {};
    const nextSocial = {
      ...currentSocial,
      friendCode,
      ...patch,
    };

    onUpdateUserProfile({
      leaderboardStats: {
        ...currentStats,
        social: nextSocial,
      },
    });
  }

  useEffect(() => {
    persistSocialPatch({
      friends,
      requests: pendingInvites,
      visibility: presenceVisibility,
      status: presenceStatus,
      lastSeenAt: new Date().toISOString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friends, pendingInvites, presenceVisibility, presenceStatus]);

  useEffect(() => {
    const backend = getBackendClient();
    if (!backend || !isBackendEnabled()) {
      setOnlineDirectory([]);
      return undefined;
    }

    let active = true;

    async function fetchOnlineProfiles() {
      const { data, error } = await backend
        .from("profiles")
        .select("id, display_name, leaderboard_stats, updated_at")
        .limit(200);

      if (!active || error) {
        return;
      }

      const ownId = userProfile?.userId;
      const mapped = (data ?? [])
        .map((entry) => {
          const social = entry.leaderboard_stats?.social ?? {};
          return {
            id: entry.id,
            name: entry.display_name ?? "Guild Member",
            status: social.status ?? "offline",
            visibility: social.visibility ?? "public",
            friendCode: social.friendCode ?? "",
            friends: social.friends ?? [],
            lastSeenAt: social.lastSeenAt ?? entry.updated_at,
          };
        })
        .filter((entry) => entry.id !== ownId)
        .filter((entry) => entry.status === "online")
        .filter((entry) => entry.visibility === "public" || (entry.visibility === "friends" && (entry.friends ?? []).some((friend) => friend.id === ownId)));

      setOnlineDirectory(mapped);
    }

    fetchOnlineProfiles();
    const intervalId = window.setInterval(fetchOnlineProfiles, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [userProfile?.userId]);

  function emitSocialEvent(event, payload = {}) {
    if (!socialChannelRef.current) {
      return;
    }

    socialChannelRef.current.send({
      type: "broadcast",
      event: "social-event",
      payload: {
        event,
        payload,
      },
    });
  }

  useEffect(() => {
    const backend = getBackendClient();
    if (!backend || !isBackendEnabled()) {
      return undefined;
    }

    const channel = backend.channel("focusflow-social");
    socialChannelRef.current = channel;

    channel.on("broadcast", { event: "social-event" }, ({ payload }) => {
      const socialEvent = payload?.event;
      const socialPayload = payload?.payload;
      if (!socialEvent || !socialPayload) {
        return;
      }

      if (socialEvent === "friend-request" && socialPayload.toId === userProfile?.userId) {
        setPendingInvites((current) => {
          const exists = current.some((entry) => entry.fromId === socialPayload.fromId && entry.status === "pending");
          if (exists) return current;
          return [
            {
              id: `${socialPayload.fromId}-${Date.now()}`,
              fromId: socialPayload.fromId,
              name: socialPayload.fromName,
              friendCode: socialPayload.fromCode,
              status: "pending",
            },
            ...current,
          ];
        });
      }

      if (socialEvent === "friend-accept" && socialPayload.toId === userProfile?.userId) {
        setFriends((current) => {
          const exists = current.some((entry) => entry.id === socialPayload.fromId);
          if (exists) return current;
          return [
            { id: socialPayload.fromId, name: socialPayload.fromName, friendCode: socialPayload.fromCode, status: "online" },
            ...current,
          ];
        });
      }

      if (socialEvent === "room-invite" && socialPayload.toId === userProfile?.userId) {
        setPendingInvites((current) => [
          {
            id: `room-${socialPayload.fromId}-${Date.now()}`,
            fromId: socialPayload.fromId,
            name: socialPayload.fromName,
            friendCode: socialPayload.roomCode,
            status: "pending",
            type: "room",
            roomCode: socialPayload.roomCode,
            format: socialPayload.format,
          },
          ...current,
        ]);
      }
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
      socialChannelRef.current = null;
    };
  }, [userProfile?.userId]);

  function upsertLobbyPlayer(player) {
    setLobbyPlayers((current) => {
      const next = [...current];
      const index = next.findIndex((entry) => entry.id === player.id);
      if (index >= 0) {
        next[index] = { ...next[index], ...player };
        return next;
      }
      return [...next, player];
    });
  }

  function emitVersusEvent(event, payload = {}) {
    const envelope = {
      event,
      payload,
      roomCode,
      sentAt: Date.now(),
    };

    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.send({ type: "broadcast", event: "versus-event", payload: envelope });
    }

    if (fallbackChannelRef.current) {
      fallbackChannelRef.current.postMessage(envelope);
    }
  }

  function applyMatchAnswer(current, answerPayload) {
    if (!current || current.status !== "active") {
      return current;
    }

    const questionIndex = answerPayload.index;
    const existingForQuestion = current.answersByQuestion?.[questionIndex] ?? {};
    if (existingForQuestion[answerPayload.playerId]) {
      return current;
    }

    const nextScores = {
      ...(current.scores ?? {}),
      [answerPayload.playerId]: {
        ...(current.scores?.[answerPayload.playerId] ?? {
          name: answerPayload.name,
          team: answerPayload.team,
          score: 0,
          correct: 0,
          answered: 0,
        }),
      },
    };

    nextScores[answerPayload.playerId] = {
      ...nextScores[answerPayload.playerId],
      score: (nextScores[answerPayload.playerId].score ?? 0) + (answerPayload.isCorrect ? 100 : 0),
      correct: (nextScores[answerPayload.playerId].correct ?? 0) + (answerPayload.isCorrect ? 1 : 0),
      answered: (nextScores[answerPayload.playerId].answered ?? 0) + 1,
    };

    return {
      ...current,
      scores: nextScores,
      answersByQuestion: {
        ...(current.answersByQuestion ?? {}),
        [questionIndex]: {
          ...existingForQuestion,
          [answerPayload.playerId]: answerPayload,
        },
      },
    };
  }

  function handleIncomingVersusEvent(envelope) {
    if (!envelope || envelope.roomCode !== roomCode) {
      return;
    }

    const { event, payload } = envelope;
    if (event === "player-update") {
      const isNewPlayer = !lobbyPlayers.some((entry) => entry.id === payload.id);
      upsertLobbyPlayer(payload);
      if (isNewPlayer && roomHostId === localPlayerId) {
        emitVersusEvent("room-host", { hostId: localPlayerId });
      }
      return;
    }

    if (event === "player-leave") {
      setLobbyPlayers((current) => {
        const next = current.filter((entry) => entry.id !== payload.playerId);
        if (payload.playerId === roomHostId) {
          const nextHostId = [...next].sort((left, right) => left.id.localeCompare(right.id))[0]?.id ?? null;
          setRoomHostId(nextHostId);
          if (nextHostId === localPlayerId) {
            emitVersusEvent("room-host", { hostId: nextHostId });
          }
        }
        return next;
      });
      return;
    }

    if (event === "room-host") {
      if (payload?.hostId) {
        setRoomHostId(payload.hostId);
      }
      return;
    }

    if (event === "chat") {
      setLobbyChat((current) => [payload, ...current].slice(0, 60));
      return;
    }

    if (event === "match-start") {
      setVersusMatch(payload.match);
      setLocalAnswer(null);
      setVersusStatus("in-match");
      return;
    }

    if (event === "team-balance") {
      const teamMap = payload.teamMap ?? {};
      setLobbyPlayers((current) => current.map((player) => (
        teamMap[player.id]
          ? { ...player, team: teamMap[player.id] }
          : player
      )));
      if (teamMap[localPlayerId]) {
        setPlayerTeam(teamMap[localPlayerId]);
      }
      return;
    }

    if (event === "match-answer") {
      setVersusMatch((current) => applyMatchAnswer(current, payload));
      return;
    }

    if (event === "match-next") {
      setVersusMatch((current) => {
        if (!current) return current;
        return {
          ...current,
          index: payload.nextIndex,
        };
      });
      setLocalAnswer(null);
      return;
    }

    if (event === "match-end") {
      setVersusMatch((current) => current ? { ...current, status: "finished" } : current);
      setVersusStatus("finished");
    }
  }

  useEffect(() => {
    if (!roomCode) {
      setRoomHostId(null);
      setLobbyPlayers([]);
      setLobbyChat([]);
      setVersusMatch(null);
      setVersusStatus("idle");
      return undefined;
    }

    const backend = getBackendClient();
    let active = true;

    if (backend && isBackendEnabled()) {
      const channel = backend.channel(`quiz-versus-${roomCode}`);
      realtimeChannelRef.current = channel;

      channel.on("broadcast", { event: "versus-event" }, ({ payload }) => {
        if (!active) return;
        handleIncomingVersusEvent(payload);
      });

      channel.subscribe((status) => {
        if (status === "SUBSCRIBED" && active) {
          emitVersusEvent("player-update", {
            id: localPlayerId,
            name: localPlayerName,
            ready: playerReady,
            team: playerTeam,
            online: true,
          });
        }
      });
    } else if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new window.BroadcastChannel(`quiz-versus-${roomCode}`);
      fallbackChannelRef.current = bc;
      bc.onmessage = (message) => {
        if (!active) return;
        handleIncomingVersusEvent(message.data);
      };

      emitVersusEvent("player-update", {
        id: localPlayerId,
        name: localPlayerName,
        ready: playerReady,
        team: playerTeam,
        online: true,
      });
    }

    return () => {
      active = false;
      emitVersusEvent("player-leave", { playerId: localPlayerId });
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.unsubscribe();
        realtimeChannelRef.current = null;
      }
      if (fallbackChannelRef.current) {
        fallbackChannelRef.current.close();
        fallbackChannelRef.current = null;
      }
    };
  }, [roomCode]);

  useEffect(() => {
    if (!roomCode || roomHostId !== localPlayerId) {
      return;
    }

    emitVersusEvent("room-host", { hostId: localPlayerId });
  }, [roomCode, roomHostId, localPlayerId]);

  useEffect(() => {
    if (!roomCode) return;
    emitVersusEvent("player-update", {
      id: localPlayerId,
      name: localPlayerName,
      ready: playerReady,
      team: playerTeam,
      online: true,
    });
  }, [roomCode, playerReady, playerTeam, localPlayerId, localPlayerName]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFriends((current) => current.map((friend) => {
        const roll = Math.random();
        const nextStatus = roll > 0.72 ? "online" : roll > 0.35 ? "away" : "offline";
        return {
          ...friend,
          status: nextStatus,
          lastSeen: nextStatus === "online" ? "now" : nextStatus === "away" ? "just now" : `${Math.ceil(Math.random() * 12)}m ago`,
        };
      }));
    }, 12000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!quizSession?.isActive || !quizQuestion) {
      return undefined;
    }

    function handleQuizHotkeys(event) {
      const target = event.target;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }

      const key = event.key.toLowerCase();
      const type = quizQuestion.type ?? "mcq";

      if (type === "mcq") {
        const index = Number.parseInt(key, 10) - 1;
        if (Number.isFinite(index) && index >= 0 && index < (quizQuestion.choices?.length ?? 0)) {
          const choice = quizQuestion.choices[index];
          if (!quizSession.hiddenChoices?.includes(choice)) {
            event.preventDefault();
            handleQuizChoice(choice);
            return;
          }
        }
      }

      if (type === "true-false") {
        if (key === "t") {
          event.preventDefault();
          handleQuizChoice("True");
          return;
        }
        if (key === "f") {
          event.preventDefault();
          handleQuizChoice("False");
          return;
        }
      }

      if (key === "5") {
        event.preventDefault();
        onUseFiftyFifty();
        return;
      }
      if (key === "6") {
        event.preventDefault();
        onUseExtraTime();
        return;
      }
      if (key === "7") {
        event.preventDefault();
        onUseDefend();
        return;
      }
      if (key === "8") {
        event.preventDefault();
        onUseHeal();
        return;
      }
      if (key === "9") {
        event.preventDefault();
        onUsePotion();
      }
    }

    window.addEventListener("keydown", handleQuizHotkeys);
    return () => window.removeEventListener("keydown", handleQuizHotkeys);
  }, [quizSession, quizQuestion, onUseDefend, onUseExtraTime, onUseFiftyFifty, onUseHeal, onUsePotion]);

  function resolveBattleSource() {
    if (quizSource === "custom" && selectedSourceSetId) {
      return { source: "custom", customSetId: selectedSourceSetId };
    }
    return { source: "flashcards", customSetId: null };
  }

  function runBattle(mode = "solo") {
    const { source, customSetId } = resolveBattleSource();
    onStartQuizBattle(source, customSetId, mode, {
      questionCount: Math.max(5, Math.min(20, Number.parseInt(battleQuestionCount, 10) || 10)),
      timePerQuestion: Math.max(10, Math.min(45, Number.parseInt(battleTimePerQuestion, 10) || 20)),
    });
  }

  function runSpeed() {
    const { source, customSetId } = resolveBattleSource();
    onStartSpeedRun(source, customSetId, {
      durationSeconds: Math.max(30, Math.min(180, Number.parseInt(speedDuration, 10) || 60)),
    });
  }

  function createRoom() {
    const nextCode = `QZ-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setRoomCode(nextCode);
    setRoomHostId(localPlayerId);
    setVersusStatus("lobby");
    setPlayerReady(false);
  }

  function joinRoom() {
    const sanitized = roomInput.trim().toUpperCase();
    if (!sanitized) return;
    setRoomCode(sanitized);
    setRoomHostId(null);
    setVersusStatus("lobby");
    setPlayerReady(false);
  }

  function leaveRoom() {
    setRoomCode("");
    setRoomHostId(null);
    setVersusMatch(null);
    setLobbyPlayers([]);
    setLobbyChat([]);
    setVersusStatus("idle");
    setPlayerReady(false);
  }

  function sendLobbyChat() {
    const message = lobbyChatInput.trim();
    if (!message || !roomCode) return;
    const payload = {
      id: `${localPlayerId}-${Date.now()}`,
      senderId: localPlayerId,
      senderName: localPlayerName,
      message,
      at: Date.now(),
    };
    emitVersusEvent("chat", payload);
    setLobbyChatInput("");
  }

  function buildVersusDeck() {
    const selectedSet = (customQuizSets ?? []).find((entry) => entry.id === selectedSourceSetId) ?? activeCustomSet;
    const sourceCards = selectedSet?.cards ?? [];
    const count = Math.max(5, Math.min(20, Number.parseInt(battleQuestionCount, 10) || 10));
    return sourceCards
      .filter((card) => card.question && card.answer)
      .slice(0, count)
      .map((card) => ({
        id: card.id,
        question: card.question,
        type: card.type ?? "mcq",
        answer: card.answer,
        choices: (card.type ?? "mcq") === "true-false"
          ? ["True", "False"]
          : (card.choices?.length ? card.choices : [card.answer]).slice(0, 4),
        explanation: card.explanation ?? "",
      }));
  }

  function startLiveVersusMatch() {
    if (!isRoomHost) {
      onToast?.("Only the room host can start the live match");
      return;
    }
    if (!roomCode || !canStartVersus) return;

    const questions = buildVersusDeck();
    if (!questions.length) return;

    const players = lobbyPlayers.length
      ? lobbyPlayers
      : [{ id: localPlayerId, name: localPlayerName, ready: true, team: playerTeam, online: true }];

    const scores = players.reduce((acc, player) => {
      acc[player.id] = {
        name: player.name,
        team: player.team || "A",
        score: 0,
        correct: 0,
        answered: 0,
      };
      return acc;
    }, {});

    const match = {
      roomCode,
      hostId: localPlayerId,
      format: versusFormat,
      source: quizSource,
      index: 0,
      status: "active",
      questions,
      scores,
      answersByQuestion: {},
      startedAt: Date.now(),
    };

    setVersusMatch(match);
    setVersusStatus("in-match");
    setLocalAnswer(null);
    emitVersusEvent("match-start", { match });
  }

  function autoBalanceTeams() {
    if (!isRoomHost) {
      onToast?.("Only the room host can auto-balance teams");
      return;
    }
    if (versusFormat === "ffa") return;
    const sorted = [...lobbyPlayers].sort((left, right) => left.id.localeCompare(right.id));
    const teamMap = {};
    sorted.forEach((player, index) => {
      teamMap[player.id] = index % 2 === 0 ? "A" : "B";
    });

    setLobbyPlayers((current) => current.map((player) => (
      teamMap[player.id]
        ? { ...player, team: teamMap[player.id] }
        : player
    )));

    if (teamMap[localPlayerId]) {
      setPlayerTeam(teamMap[localPlayerId]);
    }

    emitVersusEvent("team-balance", { teamMap });
  }

  function submitVersusAnswer(answerValue) {
    if (!versusMatch || versusMatch.status !== "active") return;
    const currentQuestion = versusMatch.questions?.[versusMatch.index];
    if (!currentQuestion) return;

    const existing = versusMatch.answersByQuestion?.[versusMatch.index]?.[localPlayerId];
    if (existing) return;

    const normalizedExpected = String(currentQuestion.answer ?? "").trim().toLowerCase();
    const normalizedAnswer = String(answerValue ?? "").trim().toLowerCase();
    const isCorrect = normalizedExpected === normalizedAnswer;

    const payload = {
      playerId: localPlayerId,
      name: localPlayerName,
      team: playerTeam,
      index: versusMatch.index,
      answer: answerValue,
      isCorrect,
      submittedAt: Date.now(),
    };

    setVersusMatch((current) => applyMatchAnswer(current, payload));
    setLocalAnswer(answerValue);
    emitVersusEvent("match-answer", payload);
  }

  function nextVersusQuestion() {
    if (!versusMatch || versusMatch.hostId !== localPlayerId) return;
    const nextIndex = versusMatch.index + 1;
    if (nextIndex >= versusMatch.questions.length) {
      setVersusMatch((current) => current ? { ...current, status: "finished" } : current);
      setVersusStatus("finished");
      emitVersusEvent("match-end", {});
      return;
    }

    setVersusMatch((current) => current ? { ...current, index: nextIndex } : current);
    setLocalAnswer(null);
    emitVersusEvent("match-next", { nextIndex });
  }

  function addFriend() {
    const trimmed = friendSearch.trim();
    if (!trimmed) return;

    const fromDirectory = onlineDirectory.find((entry) => (
      entry.friendCode?.toLowerCase() === trimmed.toLowerCase()
      || entry.name.toLowerCase().includes(trimmed.toLowerCase())
    ));

    if (!fromDirectory) {
      return;
    }

    const alreadyFriend = friends.some((entry) => entry.id === fromDirectory.id);
    if (alreadyFriend) {
      setFriendSearch("");
      return;
    }

    emitSocialEvent("friend-request", {
      fromId: userProfile?.userId,
      fromName: localPlayerName,
      fromCode: friendCode,
      toId: fromDirectory.id,
    });

    setFriendSearch("");
  }

  function toggleFriendSelection(friendId) {
    setSelectedFriendIds((current) => (
      current.includes(friendId)
        ? current.filter((entry) => entry !== friendId)
        : [...current, friendId]
    ));
  }

  function sendInvites() {
    if (!selectedFriends.length || !roomCode) return;
    const created = selectedFriends.map((friend) => ({
      id: `${friend.id}-${Date.now()}`,
      friendId: friend.id,
      name: friend.name,
      status: friend.status === "online" ? "accepted" : "pending",
    }));
    setPendingInvites((current) => [...created, ...current]);

    created.forEach((invite) => {
      emitSocialEvent("room-invite", {
        roomCode,
        format: versusFormat,
        fromId: userProfile?.userId,
        fromName: localPlayerName,
        toId: invite.friendId,
      });
    });
  }

  function updateInviteStatus(inviteId, status) {
    setPendingInvites((current) => {
      const next = current.map((invite) => (
        invite.id === inviteId
          ? { ...invite, status }
          : invite
      ));

      const acceptedInvite = next.find((entry) => entry.id === inviteId && status === "accepted");
      if (acceptedInvite) {
        if (acceptedInvite.type === "room" && acceptedInvite.roomCode) {
          setRoomCode(acceptedInvite.roomCode);
          setRoomInput(acceptedInvite.roomCode);
          if (acceptedInvite.format) {
            setVersusFormat(acceptedInvite.format);
          }
        }

        const alreadyFriend = friends.some((entry) => entry.id === acceptedInvite.fromId);
        if (!alreadyFriend && acceptedInvite.fromId) {
          setFriends((currentFriends) => [
            {
              id: acceptedInvite.fromId,
              name: acceptedInvite.name,
              friendCode: acceptedInvite.friendCode,
              status: "online",
            },
            ...currentFriends,
          ]);
        }

        emitSocialEvent("friend-accept", {
          fromId: userProfile?.userId,
          fromName: localPlayerName,
          fromCode: friendCode,
          toId: acceptedInvite.fromId,
        });
      }

      return next;
    });
  }

  function launchVersusFromLobby() {
    if (!isLobbyReady || !acceptedInvites.length) return;
    runBattle("versus");
  }

  function handleOpenSubmit(event) {
    event.preventDefault();
    if (!openAnswer.trim()) return;
    const isCorrect = onAnswerOpenQuestion(openAnswer.trim());
    setAnswerFx(isCorrect === true ? "correct" : isCorrect === false ? "wrong" : "idle");
    if (isCorrect === true) {
      setComboCount((prev) => prev + 1);
    } else if (isCorrect === false) {
      setComboCount(0);
    }
    setOpenAnswer("");
  }

  function handleQuizChoice(choice) {
    const isCorrect = onAnswerQuiz(choice);
    setAnswerFx(isCorrect === true ? "correct" : isCorrect === false ? "wrong" : "idle");
    if (isCorrect === true) {
      setComboCount((prev) => prev + 1);
    } else if (isCorrect === false) {
      setComboCount(0);
    }
  }

  function handleCreateSet(event) {
    event.preventDefault();
    if (!newSetTitle.trim()) return;
    onCreateCustomQuizSet(newSetTitle.trim());
    setNewSetTitle("");
  }

  function handleAddQuestion(event) {
    event.preventDefault();
    if (!draftQuestion.trim() || !draftAnswer.trim()) return;

    onAddCustomQuizQuestion({
      question: draftQuestion,
      answer: draftAnswer,
      type: draftType,
      choices: draftType === "mcq" ? draftOptions : [],
      explanation: draftExplanation,
    });
    setDraftQuestion("");
    setDraftAnswer("");
    setDraftChoices("");
    setDraftOptions([]);
    setDraftOptionInput("");
    setDraftExplanation("");
  }

  function startEditQuestion(question) {
    setQuizTab("builder");
    setBuilderTab("edit");
    setEditingQuestionId(question.id);
    setEditQuestion(question.question ?? "");
    setEditAnswer(question.answer ?? "");
    setEditType(question.type ?? "mcq");
    setEditExplanation(question.explanation ?? "");
    setEditOptions((question.choices ?? []).filter((choice) => choice !== question.answer));
    setEditOptionInput("");
  }

  function handleSaveEditedQuestion() {
    if (!editingQuestionId) return;

    onUpdateCustomQuizQuestion?.(editingQuestionId, {
      question: editQuestion,
      answer: editAnswer,
      type: editType,
      choices: editType === "mcq" ? editOptions : [],
      explanation: editExplanation,
    });
    setEditingQuestionId(null);
  }

  function toggleManagedQuestion(questionId) {
    setSelectedQuestionIds((current) => (
      current.includes(questionId)
        ? current.filter((entry) => entry !== questionId)
        : [...current, questionId]
    ));
  }

  function applyQuestionSort(sortMode) {
    const ordered = [...activeBuilderSetCards];
    if (sortMode === "question-asc") {
      ordered.sort((left, right) => left.question.localeCompare(right.question));
    } else if (sortMode === "question-desc") {
      ordered.sort((left, right) => right.question.localeCompare(left.question));
    } else if (sortMode === "type") {
      ordered.sort((left, right) => String(left.type ?? "mcq").localeCompare(String(right.type ?? "mcq")));
    }

    onReorderCustomQuizQuestions?.(ordered.map((question) => question.id));
    setManageSort(sortMode);
  }

  function duplicateSelectedQuestions() {
    selectedQuestionIds.forEach((questionId) => onDuplicateCustomQuizQuestion?.(questionId));
    setSelectedQuestionIds([]);
  }

  function deleteSelectedQuestions() {
    selectedQuestionIds.forEach((questionId) => onDeleteCustomQuizQuestion?.(questionId));
    setSelectedQuestionIds([]);
  }

  function moveSelectedQuestions() {
    if (!moveTargetSetId) return;
    selectedQuestionIds.forEach((questionId) => onMoveCustomQuizQuestion?.(questionId, moveTargetSetId));
    setSelectedQuestionIds([]);
    setMoveTargetSetId("");
  }

  async function handleAIGenerateQuiz(event) {
    event.preventDefault();
    if (!onAIGenerateQuiz) return;

    await onAIGenerateQuiz({
      provider: aiProvider,
      sourceText: aiPromptText,
      sourceFile: aiFile,
      questionCount: Math.max(4, Math.min(30, Number.parseInt(aiQuestionCount, 10) || 10)),
      title: aiTitle,
    });
  }

  async function handleAIGenerateStudyPlan(event) {
    event.preventDefault();
    if (!onAIGenerateStudyPlan) return;

    const plan = await onAIGenerateStudyPlan({
      provider: aiProvider,
      sourceText: aiPromptText,
      sourceFile: aiFile,
    });

    if (plan) {
      setStudyPlanPreview(plan);
    }
  }

  if (versusMatch?.status) {
    const currentQuestion = versusMatch.questions?.[versusMatch.index];
    const currentAnswers = versusMatch.answersByQuestion?.[versusMatch.index] ?? {};
    const allAnswered = Object.keys(currentAnswers).length >= Object.keys(versusMatch.scores ?? {}).length;

    return (
      <section className="feature-page">
        <div className="feature-header">
          <h2>Party Versus Live</h2>
          <div className="flashcard-actions">
            <span className="ghost-button">Room {versusMatch.roomCode}</span>
            <span className="ghost-button">Format {versusMatch.format.toUpperCase()}</span>
            <button type="button" className="ghost-button" onClick={leaveRoom}>Exit Room</button>
          </div>
        </div>

        <div className="feature-grid">
          <article className="panel">
            <h3>Question {versusMatch.index + 1}/{versusMatch.questions.length}</h3>
            <p className="battle-question-text">{currentQuestion?.question}</p>

            {currentQuestion?.type === "identification" ? (
              <form className="open-answer-form-battle" onSubmit={(event) => {
                event.preventDefault();
                submitVersusAnswer(openAnswer);
                setOpenAnswer("");
              }}>
                <input value={openAnswer} onChange={(event) => setOpenAnswer(event.target.value)} className="open-answer-input-battle" placeholder="Type answer" />
                <button type="submit" className="accent-button" disabled={Boolean(currentAnswers[localPlayerId])}>Submit</button>
              </form>
            ) : (
              <div className="choice-grid-battle">
                {(currentQuestion?.choices ?? []).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    className="choice-btn-battle"
                    onClick={() => submitVersusAnswer(choice)}
                    disabled={Boolean(currentAnswers[localPlayerId])}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            )}

            <p className="muted">Answered: {Object.keys(currentAnswers).length}/{Object.keys(versusMatch.scores ?? {}).length}</p>
            {versusMatch.hostId === localPlayerId && (
              <button type="button" className="accent-button" onClick={nextVersusQuestion} disabled={!allAnswered && versusMatch.status === "active"}>
                {versusMatch.index + 1 >= versusMatch.questions.length ? "Finish Match" : "Next Question"}
              </button>
            )}
          </article>

          <article className="panel">
            <h3>Live Scoreboard</h3>
            <div className="list-block">
              {Object.entries(versusMatch.scores ?? {}).sort((left, right) => right[1].score - left[1].score).map(([playerId, score]) => (
                <div key={playerId} className="list-item">
                  <strong>{score.name} {playerId === localPlayerId ? "(You)" : ""}</strong>
                  <span>{score.score} pts • {score.correct}/{score.answered} correct</span>
                </div>
              ))}
            </div>
            {versusMatch.format !== "ffa" && (
              <div className="list-block" style={{ marginTop: "10px" }}>
                {Object.entries(teamScoreboard).map(([team, score]) => (
                  <div key={team} className="list-item">
                    <strong>Team {team}</strong>
                    <span>{score} pts</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    );
  }

  // Speed Run view
  if (quizSession?.isActive && quizSession.battleMode === "speedrun" && quizQuestion) {
    return (
      <div className="quiz-speedrun-view">
        <div className="speedrun-header">
          <div className="speedrun-timer-ring">
            <span className="speedrun-timer-value">{quizSession.timeLeft}</span>
            <span className="speedrun-timer-label">sec left</span>
          </div>
          <div className="speedrun-stats">
            <div><span>Score</span><strong>{quizSession.score}</strong></div>
            <div><span>Streak</span><strong>{quizSession.streak}</strong></div>
            <div><span>Q</span><strong>{quizSession.index + 1}/{quizSession.questions.length}</strong></div>
          </div>
        </div>

        <div className="speedrun-question-area">
          <p className="speedrun-question">{quizQuestion.question}</p>
          {qType === "true-false" && (
            <div className="tf-buttons-battle">
              <button type="button" className="tf-btn-battle tf-btn--true" onClick={() => handleQuizChoice("True")}>True</button>
              <button type="button" className="tf-btn-battle tf-btn--false" onClick={() => handleQuizChoice("False")}>False</button>
            </div>
          )}
          {qType === "identification" && (
            <form className="open-answer-form-battle" onSubmit={handleOpenSubmit}>
              <input className="open-answer-input-battle" value={openAnswer} onChange={(e) => setOpenAnswer(e.target.value)} placeholder="Type your answer..." autoFocus />
              <button type="submit" className="accent-button">Submit</button>
            </form>
          )}
          {(qType === "mcq" || !qType) && (
            <div className="choice-grid-battle">
              {quizQuestion.choices.map((choice) => (
                <button key={choice} type="button" className="choice-btn-battle" onClick={() => handleQuizChoice(choice)}>
                  {choice}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render full-screen battle view when active
  if (quizSession?.isActive && quizQuestion) {
    return (
      <div className={`quiz-fullscreen-battle feedback-mode-standard rank-fx-${comboRankId} ${answerFx === "correct" ? "is-hit-correct" : answerFx === "wrong" ? "is-hit-wrong" : ""}`}>
        <div className="battle-fx-layer" aria-hidden>
          <span className="battle-fx-orb battle-fx-orb--one" />
          <span className="battle-fx-orb battle-fx-orb--two" />
          <span className="battle-fx-orb battle-fx-orb--three" />
          <span className="battle-fx-streak battle-fx-streak--one" />
          <span className="battle-fx-streak battle-fx-streak--two" />
        </div>
        {/* Battle Arena */}
        <div className="battle-arena">
          {/* Boss Side */}
          <div className="battle-side battle-side--boss">
            <div className="boss-arena">
              <div className={`boss-sprite-battle ${quizSession.bossHp <= 0 ? "boss-dead" : ""}`} style={{ fontSize: "4rem" }}>
                👹
              </div>
              <div className="boss-info">
                <h4>Boss</h4>
                <div className="arena-hp-bar">
                  <div
                    className={`arena-hp-fill ${
                      (quizSession.bossHp / quizSession.maxBossHp) > 0.5 ? "arena-hp-healthy"
                      : (quizSession.bossHp / quizSession.maxBossHp) > 0.2 ? "arena-hp-wounded"
                      : "arena-hp-critical"
                    }`}
                    style={{ width: `${(quizSession.bossHp / quizSession.maxBossHp) * 100}%` }}
                  />
                </div>
                <p className="arena-hp-text">{quizSession.bossHp}/{quizSession.maxBossHp}</p>
              </div>
            </div>
          </div>

          <div className="battle-vs-container">
            <div className="battle-vs-text">VS</div>
          </div>

          {/* Party Side */}
          <div className="battle-side battle-side--party">
            <div className="party-arena">
              <div className="party-roster-battle">
                {(partyRoster ?? []).slice(0, 3).map((member, index) => (
                  <div key={`${member.id}-${index}`} className="party-member-battle">
                    <div className="member-sprite-battle">{member.emoji ?? "⚔️"}</div>
                    <p className="member-name-battle">{member.displayName?.slice(0, 8) ?? "Member"}</p>
                  </div>
                ))}
              </div>
              <div className="party-health-battle">
                <h4>Party HP</h4>
                <div className="arena-hp-bar">
                  <div className="arena-hp-fill arena-hp-healthy" style={{ width: `${(quizSession.partyHp / quizSession.maxPartyHp) * 100}%` }} />
                </div>
                <p className="arena-hp-text">{quizSession.partyHp}/{quizSession.maxPartyHp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Question Area */}
        <div className="battle-question-container">
          <div className="battle-question-header">
            <span className="battle-progress">Q{quizSession.index + 1}/{quizSession.questions.length}</span>
            <span className={`battle-type-badge battle-type-badge--${qType}`}>
              {qType === "identification" ? "Identification" : qType === "true-false" ? "True / False" : "Multiple Choice"}
            </span>
            <span className="battle-timer">⏱️ {quizSession.timeLeft}s</span>
            <button type="button" className="ghost-button" onClick={onToggleSoundEffects}>
              SFX: {soundEnabled ? "On" : "Muted"}
            </button>
            {quizSession.battleMode !== "speedrun" && (
              <span className="battle-type-badge" style={{ borderColor: pressureColor, color: pressureColor }}>
                {pressureLabel}
              </span>
            )}
          </div>

          <h2 className="battle-question-text">{quizQuestion.question}</h2>

          <div className="battle-options-container">
            {qType === "true-false" && (
              <div className="tf-buttons-battle">
                <button type="button" className="tf-btn-battle tf-btn--true" onClick={() => handleQuizChoice("True")}>True</button>
                <button type="button" className="tf-btn-battle tf-btn--false" onClick={() => handleQuizChoice("False")}>False</button>
              </div>
            )}
            {qType === "identification" && (
              <form className="open-answer-form-battle" onSubmit={handleOpenSubmit}>
                <input className="open-answer-input-battle" value={openAnswer} onChange={(e) => setOpenAnswer(e.target.value)} placeholder="Type your answer and press Enter" autoFocus />
                <button type="submit" className="accent-button">Submit</button>
              </form>
            )}
            {(qType === "mcq" || !qType) && (
              <div className="choice-grid-battle">
                {quizQuestion.choices.map((choice) => (
                  <button key={choice} type="button" className="choice-btn-battle" onClick={() => handleQuizChoice(choice)} disabled={quizSession.hiddenChoices.includes(choice)}>
                    {quizSession.hiddenChoices.includes(choice) ? "-" : choice}
                  </button>
                ))}
              </div>
            )}
          </div>
          {answerFx !== "idle" && (
            <div className={`answer-feedback-chip ${answerFx === "correct" ? "is-correct" : "is-wrong"}`}>
              {answerFx === "correct" ? "Critical strike" : "Glancing hit"}
            </div>
          )}
          {comboCount >= 2 && (
            <p className="muted" style={{ marginTop: "4px" }}>
              Combo chain: x{comboCount}
            </p>
          )}
          {comboRank && (
            <span className={`streak-rank-badge streak-rank-badge--${comboRankId}`}>{comboRank}</span>
          )}

          {/* Explanation hint (shown in bottom bar if available but session still active) */}
          <div className="battle-bottom-bar">
            <div className="battle-powerups">
              <button type="button" className="powerup-btn" disabled={!quizSession.fiftyFifty || qType !== "mcq"} onClick={onUseFiftyFifty} title="50-50">50-50</button>
              <button type="button" className="powerup-btn" disabled={!quizSession.extraTime} onClick={onUseExtraTime} title="Extra Time">+10s</button>
              <button type="button" className="powerup-btn" onClick={onUseDefend} title="Defend">🛡️</button>
              <button type="button" className="powerup-btn" disabled={!quizSession.hasHealer} onClick={onUseHeal} title="Heal">❤️</button>
              <button type="button" className="powerup-btn" disabled={quizSession.potions <= 0} onClick={onUsePotion} title="Potion">🧪 {quizSession.potions}</button>
            </div>
            <div className="battle-stats">
              <div className="stat-item"><span>Score</span><strong>{quizSession.score}</strong></div>
              <div className="stat-item"><span>Streak</span><strong>{quizSession.streak}</strong></div>
              <div className="stat-item"><span>Combo Bonus</span><strong>+{quizSession.comboBonus ?? 0}</strong></div>
            </div>
          </div>
          <p className="muted" style={{ marginTop: "8px" }}>
            Hotkeys: 1-4 answer, T/F for true-false, 5=50-50, 6=+10s, 7=defend, 8=heal, 9=potion.
          </p>
        </div>
      </div>
    );
  }

  // After battle: show result + wrong answer review
  if (quizSession && !quizSession.isActive && quizSession.result) {
    const wrongAnswers = quizSession.wrongAnswers ?? [];
    const typeBreakdown = wrongAnswers.reduce((acc, entry) => {
      const key = entry.type ?? "mcq";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    const weakestType = Object.entries(typeBreakdown).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
    const weakLabel = weakestType === "true-false"
      ? "True / False"
      : weakestType === "identification"
        ? "Identification"
        : weakestType === "mcq"
          ? "Multiple Choice"
          : "Mixed";
    return (
      <section className="feature-page">
        <div className="feature-header">
          <h2>
            {quizSession.result === "victory" ? "⚔️ Victory!" :
             quizSession.result === "defeat" ? "💀 Defeat" :
             quizSession.result === "speedrun-done" ? "⚡ Speed Run Complete" :
             "⏱️ Time's Up"}
          </h2>
          <div className="flashcard-actions">
            <button type="button" className="accent-button" onClick={() => onStartQuizBattle("flashcards")}>Play Again</button>
            <button type="button" className="ghost-button" onClick={onReturnToQuizLobby}>Back to Quiz Battle</button>
            {wrongAnswers.length > 0 && (
              <button type="button" className="ghost-button" onClick={onRestartWrongAnswerChallenge}>Retry Mistakes</button>
            )}
            {weakAreaCount > 0 && (
              <button type="button" className="ghost-button" onClick={onPracticeWeakAreas}>Practice Weak Areas</button>
            )}
            {quizSession.battleMode === "speedrun" && (
              <button type="button" className="ghost-button" onClick={() => onStartSpeedRun("flashcards")}>Speed Run Again</button>
            )}
          </div>
        </div>
        <div className="feature-grid">
          <article className="panel">
            <h3>Results</h3>
            <div className="stat-grid">
              <div><span>Score</span><strong>{quizSession.score}</strong></div>
              <div><span>Streak</span><strong>{quizSession.streak}</strong></div>
              <div><span>Best Score</span><strong>{quizState.bestScore}</strong></div>
              <div><span>Accuracy</span><strong>{accuracy}%</strong></div>
            </div>
            {wrongAnswers.length > 0 && (
              <div className="list-block" style={{ marginTop: "14px" }}>
                <div className="list-item" style={{ display: "block" }}>
                  <strong>Weak Skill Report</strong>
                  <p className="muted" style={{ marginTop: "6px" }}>
                    Most missed: {weakLabel}.
                    {quizSession.pressureMode === "assist" ? " Assist mode triggered late in the battle." : " Pressure stayed stable or increased."}
                  </p>
                  <p className="muted" style={{ marginTop: "4px" }}>
                    Misses by type: MCQ {typeBreakdown.mcq ?? 0} • True/False {typeBreakdown["true-false"] ?? 0} • Identification {typeBreakdown.identification ?? 0}
                  </p>
                </div>
              </div>
            )}
            {!!quizWeakTopics.length && (
              <div className="list-block" style={{ marginTop: "12px" }}>
                <div className="list-item" style={{ display: "block" }}>
                  <strong>Persistent Weak Topics</strong>
                  <p className="muted" style={{ marginTop: "6px" }}>
                    {quizWeakTopics.map(([topic, count]) => `${topic} (${count})`).join(" • ")}
                  </p>
                  <p className="muted" style={{ marginTop: "4px" }}>
                    Types: {quizWeakTypes.map(([type, count]) => `${type} (${count})`).join(" • ")}
                  </p>
                </div>
              </div>
            )}
          </article>

          {wrongAnswers.length > 0 && (
            <article className="panel">
              <div className="wrong-review-header">
                <h3>Mistakes to Review ({wrongAnswers.length})</h3>
                <button type="button" className="ghost-button" onClick={() => setShowWrongReview((v) => !v)}>
                  {showWrongReview ? "Hide" : "Show"}
                </button>
              </div>
              {showWrongReview && (
                <div className="wrong-review-list">
                  {wrongAnswers.map((item, i) => (
                    <div key={i} className="wrong-review-item">
                      <p className="wrong-review-q">Q: {item.question}</p>
                      <p className="wrong-review-a">✓ {item.correctAnswer}</p>
                      {item.explanation && <p className="wrong-review-exp">💡 {item.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
            </article>
          )}
        </div>
      </section>
    );
  }

  // Default page view
  return (
    <section className="feature-page">
      <div className="feature-header">
        <h2>{builderOnly ? "Quiz Builder" : "Quiz Battle"}</h2>
        <div className="flashcard-actions">
          <button type="button" className="ghost-button" onClick={onToggleSoundEffects}>
            SFX: {soundEnabled ? "On" : "Muted"}
          </button>
          {weakAreaCount > 0 && (
            <button type="button" className="ghost-button" onClick={onPracticeWeakAreas}>
              Practice Weak Areas ({weakAreaCount})
            </button>
          )}
        </div>
      </div>

      {builderOnly && (
        <>
          <div className="builder-workspace-bar" style={{ marginBottom: "10px" }}>
            <span className="arena-stats-heading">Workspace</span>
            <div className="arena-stat-chip"><span>Active Set</span><strong>{activeCustomSet?.title ?? "—"}</strong></div>
            <div className="arena-stat-chip"><span>Questions</span><strong>{activeBuilderSetCards.length}</strong></div>
            <div className="arena-stat-chip"><span>Types</span><strong>{Object.keys(quizTypeCounts).length || 0}</strong></div>
            <div className="arena-stat-chip"><span>Selected</span><strong>{selectedQuestionIds.length}</strong></div>
            <div className="arena-stat-chip"><span>Visible</span><strong>{managedQuestions.length}</strong></div>
            {quizPreview.question && (
              <p className="muted" style={{ fontSize: "0.78rem", marginLeft: "8px" }}>
                Preview: <strong>{quizPreview.question}</strong> → {quizPreview.answer || "…"}
                {!!quizPreview.options?.length && ` (${quizPreview.options.join(" · ")})`}
              </p>
            )}
          </div>
          <div className="ai-builder-panel" style={{ marginBottom: "12px" }}>
            <div className="ai-builder-head">
              <strong>AI Quiz + Study Planner</strong>
            </div>
            <form className="ai-builder-form" onSubmit={handleAIGenerateQuiz}>
              <div className="flashcard-actions">
                <select value={aiProvider} onChange={(event) => setAiProvider(event.target.value)}>
                  <option value="auto">Auto</option>
                  <option value="gemini">Gemini</option>
                  <option value="groq">Groq</option>
                </select>
                <input type="number" min="4" max="30" value={aiQuestionCount} onChange={(event) => setAiQuestionCount(event.target.value)} placeholder="Questions" style={{ width: "90px" }} />
                <input value={aiTitle} onChange={(event) => setAiTitle(event.target.value)} placeholder="Quiz set title" style={{ flex: 1 }} />
              </div>
              <textarea rows={3} value={aiPromptText} onChange={(event) => setAiPromptText(event.target.value)} placeholder="Paste notes, chapter goals, or weak areas…" />
              <div className="ai-builder-file-row">
                <input type="file" accept=".txt,.md,.csv,.json,.pdf" onChange={(event) => setAiFile(event.target.files?.[0] ?? null)} />
                <button type="submit" className="accent-button" disabled={Boolean(aiBusy)}>{aiBusy ? "Generating…" : "Generate Quiz"}</button>
                <button type="button" className="ghost-button" onClick={handleAIGenerateStudyPlan} disabled={Boolean(aiBusy)}>Study Plan</button>
              </div>
            </form>
            {(aiQuizStatus || aiPlanStatus) && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                {aiQuizStatus && <p className="muted" style={{ color: quizStatusTone, margin: 0, fontSize: "0.78rem" }}><strong>{aiQuizStatus.badge}</strong> {aiQuizStatus.message}{aiQuizStatus.provider ? ` (${aiQuizStatus.provider})` : ""}</p>}
                {aiPlanStatus && <p className="muted" style={{ color: planStatusTone, margin: 0, fontSize: "0.78rem" }}><strong>{aiPlanStatus.badge}</strong> {aiPlanStatus.message}{aiPlanStatus.provider ? ` (${aiPlanStatus.provider})` : ""}</p>}
              </div>
            )}
            {!!quizAiLog.length && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {quizAiLog.map((entry) => (
                  <span key={entry.id} className="arena-stat-chip" style={{ fontSize: "0.72rem" }}>
                    {entry.surface === "studyPlan" ? "Plan" : "Quiz"} · {entry.badge} · {entry.provider} · {entry.latencyClass}
                  </span>
                ))}
                <button type="button" className="ghost-button" style={{ fontSize: "0.72rem", padding: "4px 8px" }} onClick={onClearAIHealthLog}>Clear</button>
              </div>
            )}
            {studyPlanPreview && (
              <div className="ai-plan-summary">
                <strong>AI Plan:</strong> {studyPlanPreview.summary ?? "No summary"}{(studyPlanPreview.priorityTopics ?? []).length > 0 && ` · Priorities: ${studyPlanPreview.priorityTopics.join(", ")}`}
              </div>
            )}
          </div>
        </>
      )}

      <div className={`feature-grid ${builderOnly ? "quiz-builder-grid" : ""}${(!builderOnly && quizTab === "battle") ? " quiz-battle-single-col" : ""}`}>
        <article className="panel">
          {(quizTab === "battle" && !builderOnly) && (
            <>
              <h3>Battle Setup</h3>
              <p className="muted">Adaptive pressure is enabled: strong recent accuracy tightens timer and raises damage; misses trigger assist mode.</p>
              {!!quizWeakTopics.length && (
                <p className="muted" style={{ marginTop: "6px" }}>
                  Current weak topics: {quizWeakTopics.map(([topic, count]) => `${topic} (${count})`).join(" • ")}
                </p>
              )}
              <div className="stack-form quiz-setup-stack" style={{ marginBottom: "14px" }}>
                <div className="flashcard-actions quiz-setup-row">
                  <select value={quizSource} onChange={(event) => setQuizSource(event.target.value)}>
                    <option value="flashcards">Source: Active Flashcard Set</option>
                    <option value="custom">Source: Custom Quiz Set</option>
                  </select>
                  <input type="number" min="5" max="20" value={battleQuestionCount} onChange={(event) => setBattleQuestionCount(event.target.value)} placeholder="Questions" style={{ width: "96px" }} />
                  <input type="number" min="10" max="45" value={battleTimePerQuestion} onChange={(event) => setBattleTimePerQuestion(event.target.value)} placeholder="Sec/Q" style={{ width: "96px" }} />
                  <input type="number" min="30" max="180" value={speedDuration} onChange={(event) => setSpeedDuration(event.target.value)} placeholder="Speed sec" style={{ width: "110px" }} />
                </div>
                {quizSource === "custom" && (
                  <select value={selectedSourceSetId} onChange={(event) => setSelectedSourceSetId(event.target.value)}>
                    <option value="">Select custom set</option>
                    {(customQuizSets ?? []).map((setEntry) => (
                      <option key={setEntry.id} value={setEntry.id}>{setEntry.title} ({setEntry.cards.length})</option>
                    ))}
                  </select>
                )}
                <div className="flashcard-actions quiz-setup-row">
                  <button type="button" className="accent-button" onClick={() => runBattle("solo")}>Start Boss Battle</button>
                  <button type="button" className="ghost-button" onClick={runSpeed}>⚡ Speed Run</button>
                </div>
              </div>

              <div className="quiz-versus-lobby">
                <div className="quiz-versus-lobby-head">
                  <div>
                    <h4>Real-Time Party Versus</h4>
                    <p className="muted">Create or join a live room and play synchronized quiz battles with real people.</p>
                  </div>
                  <div className="quiz-lobby-code">{roomCode ? `Room: ${roomCode}` : "No room joined"}</div>
                </div>

                <div className="flashcard-actions quiz-setup-row" style={{ marginBottom: "10px" }}>
                  <select value={versusFormat} onChange={(event) => setVersusFormat(event.target.value)}>
                    <option value="ffa">Free For All</option>
                    <option value="2v2">Team Battle 2v2</option>
                    <option value="3v3">Team Battle 3v3</option>
                  </select>
                  <input value={roomInput} onChange={(event) => setRoomInput(event.target.value)} placeholder="Enter room code" />
                  <button type="button" className="ghost-button" onClick={createRoom}>Create Room</button>
                  <button type="button" className="ghost-button" onClick={joinRoom}>Join Room</button>
                  {roomCode && (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          navigator.clipboard.writeText(roomCode).then(() => onToast?.("Room code copied!"));
                        }
                      }}
                      title="Copy room code to clipboard"
                    >
                      Copy Code
                    </button>
                  )}
                  {roomCode && <button type="button" className="ghost-button" onClick={leaveRoom}>Leave</button>}
                </div>

                <div className="quiz-versus-grid">
                  <div className="quiz-lobby-panel">
                    <p className="muted">Players in room: {onlineCount} • Ready: {readyCount}</p>
                    {roomCode && (
                      <p className="muted">
                        Host: {roomHostId === localPlayerId ? "You" : (lobbyPlayers.find((entry) => entry.id === roomHostId)?.name ?? "Waiting...")}
                      </p>
                    )}
                    <div className="flashcard-actions">
                      <button type="button" className={`ghost-button ${playerReady ? "is-ready" : ""}`} onClick={() => setPlayerReady((value) => !value)} disabled={!roomCode}>
                        {playerReady ? "Ready" : "Set Ready"}
                      </button>
                      {versusFormat !== "ffa" && (
                        <>
                          <select value={playerTeam} onChange={(event) => setPlayerTeam(event.target.value)} disabled={!roomCode}>
                          <option value="A">Team A</option>
                          <option value="B">Team B</option>
                        </select>
                          <button type="button" className="ghost-button" onClick={autoBalanceTeams} disabled={!roomCode || !isRoomHost || lobbyPlayers.length < 2}>
                            Auto Balance
                          </button>
                        </>
                      )}
                    </div>
                    <div className="quiz-friend-list">
                      {lobbyPlayers.map((player) => (
                        <div key={player.id} className={`quiz-friend-item ${player.id === localPlayerId ? "is-selected" : ""}`}>
                          <strong>{player.name} {player.id === localPlayerId ? "(You)" : ""}</strong>
                          <span className={`quiz-presence ${player.ready ? "quiz-presence--online" : "quiz-presence--away"}`}>
                            {player.ready ? "ready" : "not ready"}
                          </span>
                          <small>{versusFormat === "ffa" ? "Solo" : `Team ${player.team || "A"}`}</small>
                        </div>
                      ))}
                      {!lobbyPlayers.length && <p className="muted">Join a room to populate the lobby.</p>}
                    </div>
                    <button type="button" className="accent-button" onClick={startLiveVersusMatch} disabled={!roomCode || !isRoomHost || !canStartVersus}>
                      Start Live Match
                    </button>
                    <p className="muted">
                      Requirements: {requirementMessage}
                    </p>
                    {versusFormat !== "ffa" && (
                      <p className="muted">
                        Team split now: Team A {teamCounts.A} • Team B {teamCounts.B}
                      </p>
                    )}
                  </div>

                  <div className="quiz-lobby-panel">
                    <div className="fc-tabs" style={{ marginBottom: 0 }}>
                      <button type="button" className={`fc-tab ${socialTab === "online" ? "is-active" : ""}`} onClick={() => setSocialTab("online")}>Online</button>
                      <button type="button" className={`fc-tab ${socialTab === "friends" ? "is-active" : ""}`} onClick={() => setSocialTab("friends")}>Friends</button>
                      <button type="button" className={`fc-tab ${socialTab === "requests" ? "is-active" : ""}`} onClick={() => setSocialTab("requests")}>Requests</button>
                    </div>

                    <div className="flashcard-actions">
                      <select value={presenceStatus} onChange={(event) => setPresenceStatus(event.target.value)}>
                        <option value="online">Status: Online</option>
                        <option value="away">Status: Away</option>
                        <option value="offline">Status: Offline</option>
                      </select>
                      <select value={presenceVisibility} onChange={(event) => setPresenceVisibility(event.target.value)}>
                        <option value="public">Visibility: Public</option>
                        <option value="friends">Visibility: Friends only</option>
                        <option value="none">Visibility: Hidden</option>
                      </select>
                    </div>
                    <p className="muted">{visibilityHint}</p>

                    {socialTab === "online" && (
                      <>
                        <div className="inline-form">
                          <input value={friendSearch} onChange={(event) => setFriendSearch(event.target.value)} placeholder="Search online users or friend code" />
                          <button type="button" className="ghost-button" onClick={addFriend}>Send Request</button>
                        </div>
                        <div className="quiz-invite-list">
                          {discoveredOnline.map((entry) => (
                            <div key={entry.id} className="quiz-invite-item">
                              <strong>{entry.name}</strong>
                              <span className="quiz-invite-state quiz-invite-state--accepted">{entry.friendCode || "No code"}</span>
                              <p className="muted">Online now</p>
                            </div>
                          ))}
                          {!discoveredOnline.length && <p className="muted">No discoverable online users right now.</p>}
                        </div>
                      </>
                    )}

                    {socialTab === "friends" && (
                      <>
                        <div className="quiz-invite-list">
                          {friendsWithPresence.map((friend) => (
                            <button
                              key={friend.id}
                              type="button"
                              className={`quiz-friend-item ${selectedFriendIds.includes(friend.id) ? "is-selected" : ""}`}
                              onClick={() => toggleFriendSelection(friend.id)}
                            >
                              <strong>{friend.name}</strong>
                              <span className={`quiz-presence quiz-presence--${friend.status}`}>{friend.status}</span>
                              <small>{friend.friendCode || "No code"}</small>
                            </button>
                          ))}
                          {!friendsWithPresence.length && <p className="muted">No friends added yet.</p>}
                        </div>
                        <button type="button" className="ghost-button" onClick={sendInvites} disabled={!selectedFriends.length || !roomCode}>
                          Invite Selected Friends ({selectedFriends.length})
                        </button>
                      </>
                    )}

                    {socialTab === "requests" && (
                      <div className="quiz-invite-list">
                        {pendingInvites.map((invite) => (
                          <div key={invite.id} className="quiz-invite-item">
                            <strong>{invite.name || "Unknown"}</strong>
                            <span className={`quiz-invite-state quiz-invite-state--${invite.status}`}>{invite.status}</span>
                            <p className="muted">{invite.friendCode || "No friend code"}</p>
                            {invite.status === "pending" && (
                              <div className="flashcard-actions">
                                <button type="button" className="ghost-button" onClick={() => updateInviteStatus(invite.id, "accepted")}>Accept</button>
                                <button type="button" className="ghost-button" onClick={() => updateInviteStatus(invite.id, "declined")}>Decline</button>
                              </div>
                            )}
                          </div>
                        ))}
                        {!pendingInvites.length && <p className="muted">No pending requests.</p>}
                      </div>
                    )}

                    <p className="muted" style={{ marginTop: "8px" }}>Friend Code: {friendCode}</p>

                    <div className="quiz-invite-list" style={{ marginTop: "8px" }}>
                      {lobbyChat.map((entry) => (
                        <div key={entry.id} className="quiz-invite-item">
                          <strong>{entry.senderName}</strong>
                          <span className="quiz-invite-state quiz-invite-state--accepted">{new Date(entry.at).toLocaleTimeString()}</span>
                          <p className="muted">{entry.message}</p>
                        </div>
                      ))}
                      {!lobbyChat.length && <p className="muted">No lobby chat yet.</p>}
                    </div>
                    <div className="inline-form">
                      <input value={lobbyChatInput} onChange={(event) => setLobbyChatInput(event.target.value)} placeholder="Type message" disabled={!roomCode} />
                      <button type="button" className="ghost-button" onClick={sendLobbyChat} disabled={!roomCode}>Send</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {(quizTab === "builder" || builderOnly) && (
            <>
              <div className="quiz-builder-form-row">
                <div className="quiz-builder-sets-col">
                  <form className="stack-form" onSubmit={handleCreateSet} style={{ marginBottom: "8px" }}>
                    <div className="flashcard-actions">
                      <input value={newSetTitle} onChange={(event) => setNewSetTitle(event.target.value)} placeholder="New set name" style={{ flex: 1 }} />
                      <button type="submit" className="ghost-button">+ Set</button>
                    </div>
                  </form>
                  <div className="list-block">
                    {(customQuizSets ?? []).map((setEntry) => (
                      <div key={setEntry.id} className="list-item-with-action">
                        <button type="button" className={`list-item ${activeCustomSet?.id === setEntry.id ? "is-active" : ""}`} onClick={() => onSelectCustomQuizSet(setEntry.id)}>
                          <strong>{setEntry.title}</strong>
                          <span>{setEntry.cards.length} q</span>
                        </button>
                        <button type="button" className="icon-danger-btn" onClick={() => onDeleteCustomQuizSet?.(setEntry.id)}><span>Del</span></button>
                      </div>
                    ))}
                    {!(customQuizSets ?? []).length && <p className="muted">No sets yet.</p>}
                  </div>
                </div>
                <div className="quiz-builder-content-col">
                  <div className="fc-tabs" style={{ marginBottom: "10px" }}>
                    <button type="button" className={`fc-tab ${builderTab === "create" ? "is-active" : ""}`} onClick={() => { setBuilderTab("create"); setEditingQuestionId(null); }}>Create</button>
                    <button type="button" className={`fc-tab ${builderTab === "edit" ? "is-active" : ""}`} onClick={() => setBuilderTab("edit")}>Edit</button>
                    <button type="button" className={`fc-tab ${builderTab === "manage" ? "is-active" : ""}`} onClick={() => setBuilderTab("manage")}>Manage</button>
                  </div>

              {builderTab === "create" && (
                <form className="stack-form" onSubmit={handleAddQuestion}>
                  <div className="builder-stepper">
                    {[1, 2, 3].map((step) => (
                      <button key={step} type="button" className={`fc-tab ${createStep === step ? "is-active" : ""}`} onClick={() => setCreateStep(step)}>
                        {step === 1 ? "Details" : step === 2 ? "Options" : "Review"}
                      </button>
                    ))}
                  </div>
                  {createStep === 1 && (
                    <>
                      <select value={draftType} onChange={(event) => setDraftType(event.target.value)}>
                        <option value="mcq">Multiple Choice</option>
                        <option value="true-false">True / False</option>
                        <option value="identification">Identification</option>
                      </select>
                      <input value={draftQuestion} onChange={(event) => setDraftQuestion(event.target.value)} placeholder="Question" />
                      <input value={draftAnswer} onChange={(event) => setDraftAnswer(event.target.value)} placeholder="Correct answer" />
                    </>
                  )}
                  {createStep === 2 && draftType === "mcq" && (
                    <div className="builder-choices-panel">
                      <div className="inline-form">
                        <input value={draftOptionInput} onChange={(event) => setDraftOptionInput(event.target.value)} placeholder="Add option" />
                        <button type="button" className="ghost-button" onClick={() => {
                          const value = draftOptionInput.trim();
                          if (!value) return;
                          const next = [...draftOptions, value];
                          setDraftOptions(next);
                          setDraftChoices(next.join(" | "));
                          setDraftOptionInput("");
                        }}>Add Option</button>
                      </div>
                      <div className="list-block">
                        {draftOptions.map((choice, index) => (
                          <div
                            key={`${choice}-${index}`}
                            className="list-item-with-action builder-sortable-item"
                            draggable
                            onDragStart={() => setDraggedDraftOptionIndex(index)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => {
                              const next = reorderList(draftOptions, draggedDraftOptionIndex, index);
                              setDraftOptions(next);
                              setDraftChoices(next.join(" | "));
                              setDraggedDraftOptionIndex(null);
                            }}
                          >
                            <div className="list-item"><strong>Drag</strong><span>{choice}</span></div>
                            <button type="button" className="icon-danger-btn" onClick={() => {
                              const next = draftOptions.filter((_, optionIndex) => optionIndex !== index);
                              setDraftOptions(next);
                              setDraftChoices(next.join(" | "));
                            }}><span>Del</span></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {createStep === 2 && <input value={draftExplanation} onChange={(event) => setDraftExplanation(event.target.value)} placeholder="Explanation (optional)" />}
                  {createStep === 3 && (
                    <div className="builder-review-card">
                      <strong>{quizPreview.question || "Untitled question"}</strong>
                      <p className="muted">Type: {quizPreview.type}</p>
                      <p className="muted">Correct answer: {quizPreview.answer || "No answer yet"}</p>
                      {!!quizPreview.options?.length && <p className="muted">Options: {quizPreview.options.join(" • ")}</p>}
                      {!!quizPreview.explanation && <p className="muted">Explanation: {quizPreview.explanation}</p>}
                    </div>
                  )}
                  <div className="fc-edit-actions">
                    <button type="button" className="ghost-button" onClick={() => setCreateStep((current) => Math.max(1, current - 1))} disabled={createStep === 1}>Back</button>
                    {createStep < 3 ? (
                      <button type="button" className="accent-button" onClick={() => setCreateStep((current) => Math.min(3, current + 1))}>Next</button>
                    ) : (
                      <button type="submit" className="accent-button" disabled={!activeCustomSet}>Add Question</button>
                    )}
                  </div>
                </form>
              )}

              {builderTab === "edit" && (
                <div className="stack-form">
                  {!editingQuestionId && <p className="muted">Pick a question below to edit.</p>}
                  {(activeCustomSet?.cards ?? []).map((question) => (
                    <div key={question.id} className="list-item-with-action">
                      <button type="button" className="list-item" onClick={() => startEditQuestion(question)}>
                        <strong>{question.question}</strong>
                        <span>{question.type ?? "mcq"}</span>
                      </button>
                      <button type="button" className="icon-danger-btn" onClick={() => onDeleteCustomQuizQuestion?.(question.id)}><span>Del</span></button>
                    </div>
                  ))}

                  {editingQuestionId && (
                    <div className="fc-card-edit">
                      <div className="builder-stepper">
                        {[1, 2, 3].map((step) => (
                          <button key={step} type="button" className={`fc-tab ${editStep === step ? "is-active" : ""}`} onClick={() => setEditStep(step)}>
                            {step === 1 ? "Details" : step === 2 ? "Options" : "Review"}
                          </button>
                        ))}
                      </div>
                      {editStep === 1 && (
                        <>
                          <select value={editType} onChange={(event) => setEditType(event.target.value)}>
                            <option value="mcq">Multiple Choice</option>
                            <option value="true-false">True / False</option>
                            <option value="identification">Identification</option>
                          </select>
                          <input value={editQuestion} onChange={(event) => setEditQuestion(event.target.value)} placeholder="Question" />
                          <input value={editAnswer} onChange={(event) => setEditAnswer(event.target.value)} placeholder="Correct answer" />
                        </>
                      )}
                      {editStep === 2 && editType === "mcq" && (
                        <div className="builder-choices-panel">
                          <div className="inline-form">
                            <input value={editOptionInput} onChange={(event) => setEditOptionInput(event.target.value)} placeholder="Add option" />
                            <button type="button" className="ghost-button" onClick={() => {
                              const value = editOptionInput.trim();
                              if (!value) return;
                              setEditOptions((current) => [...current, value]);
                              setEditOptionInput("");
                            }}>Add Option</button>
                          </div>
                          <div className="list-block">
                            {editOptions.map((choice, index) => (
                              <div
                                key={`${choice}-${index}`}
                                className="list-item-with-action builder-sortable-item"
                                draggable
                                onDragStart={() => setDraggedEditOptionIndex(index)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => {
                                  setEditOptions((current) => reorderList(current, draggedEditOptionIndex, index));
                                  setDraggedEditOptionIndex(null);
                                }}
                              >
                                <div className="list-item"><strong>Drag</strong><span>{choice}</span></div>
                                <button type="button" className="icon-danger-btn" onClick={() => setEditOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))}><span>Del</span></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {editStep === 2 && <input value={editExplanation} onChange={(event) => setEditExplanation(event.target.value)} placeholder="Explanation (optional)" />}
                      {editStep === 3 && (
                        <div className="builder-review-card">
                          <strong>{quizPreview.question || "Untitled question"}</strong>
                          <p className="muted">Type: {quizPreview.type}</p>
                          <p className="muted">Correct answer: {quizPreview.answer || "No answer yet"}</p>
                          {!!quizPreview.options?.length && <p className="muted">Options: {quizPreview.options.join(" • ")}</p>}
                          {!!quizPreview.explanation && <p className="muted">Explanation: {quizPreview.explanation}</p>}
                        </div>
                      )}
                      <div className="fc-edit-actions">
                        <button type="button" className="ghost-button" onClick={() => setEditStep((current) => Math.max(1, current - 1))} disabled={editStep === 1}>Back</button>
                        {editStep < 3 ? (
                          <button type="button" className="accent-button" onClick={() => setEditStep((current) => Math.min(3, current + 1))}>Next</button>
                        ) : (
                          <button type="button" className="accent-button" onClick={handleSaveEditedQuestion}>Save Changes</button>
                        )}
                        <button type="button" className="ghost-button" onClick={() => setEditingQuestionId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {builderTab === "manage" && (
                <div className="stack-form">
                  <div className="flashcard-actions">
                    <input value={manageSearch} onChange={(event) => setManageSearch(event.target.value)} placeholder="Search questions" />
                    <select value={manageTypeFilter} onChange={(event) => setManageTypeFilter(event.target.value)}>
                      <option value="all">All types</option>
                      {Object.keys(quizTypeCounts).map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select value={manageSort} onChange={(event) => applyQuestionSort(event.target.value)}>
                      <option value="manual">Manual order</option>
                      <option value="question-asc">Question A-Z</option>
                      <option value="question-desc">Question Z-A</option>
                      <option value="type">Sort by type</option>
                    </select>
                  </div>
                  <div className="flashcard-actions">
                    <button type="button" className="ghost-button" onClick={() => setSelectedQuestionIds(managedQuestions.map((question) => question.id))}>Select Visible</button>
                    <button type="button" className="ghost-button" onClick={() => setSelectedQuestionIds([])}>Clear</button>
                    <button type="button" className="ghost-button" onClick={duplicateSelectedQuestions} disabled={!selectedQuestionIds.length}>Duplicate</button>
                    <button type="button" className="ghost-button" onClick={deleteSelectedQuestions} disabled={!selectedQuestionIds.length}>Delete</button>
                  </div>
                  <div className="flashcard-actions">
                    <select value={moveTargetSetId} onChange={(event) => setMoveTargetSetId(event.target.value)}>
                      <option value="">Move selected to...</option>
                      {(customQuizSets ?? []).filter((setEntry) => setEntry.id !== activeCustomSet?.id).map((setEntry) => (
                        <option key={setEntry.id} value={setEntry.id}>{setEntry.title}</option>
                      ))}
                    </select>
                    <button type="button" className="accent-button" onClick={moveSelectedQuestions} disabled={!selectedQuestionIds.length || !moveTargetSetId}>Move</button>
                  </div>
                  <div className="list-block">
                    {managedQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="list-item-with-action builder-sortable-item"
                        draggable
                        onDragStart={() => setDraggedQuestionId(question.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          const sourceIndex = activeBuilderSetCards.findIndex((entry) => entry.id === draggedQuestionId);
                          const targetIndex = activeBuilderSetCards.findIndex((entry) => entry.id === question.id);
                          const reordered = reorderList(activeBuilderSetCards.map((entry) => entry.id), sourceIndex, targetIndex);
                          onReorderCustomQuizQuestions?.(reordered);
                          setDraggedQuestionId(null);
                        }}
                      >
                        <label className="list-item" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input type="checkbox" checked={selectedQuestionIds.includes(question.id)} onChange={() => toggleManagedQuestion(question.id)} />
                          <span>{question.question}</span>
                        </label>
                        <button type="button" className="icon-btn" onClick={() => onDuplicateCustomQuizQuestion?.(question.id)}><span>Dup</span></button>
                        <button type="button" className="icon-btn" onClick={() => startEditQuestion(question)}><span>Edit</span></button>
                        <button type="button" className="icon-danger-btn" onClick={() => onDeleteCustomQuizQuestion?.(question.id)}><span>Del</span></button>
                      </div>
                    ))}
                    {!managedQuestions.length && <p className="muted">No questions match the current filters.</p>}
                  </div>
                </div>
              )}
                  <p className="muted" style={{ fontSize: "0.78rem" }}>Guided field entry. Select a set above first.</p>
                </div>
              </div>
            </>
          )}

          {(!builderOnly && quizTab === "builder") && (
          <div className="ai-builder-panel" style={{ marginTop: "12px" }}>
            <div className="ai-builder-head">
              <strong>AI Quiz + Study Planner</strong>
            </div>
            <form className="ai-builder-form" onSubmit={handleAIGenerateQuiz}>
              <div className="flashcard-actions">
                <select value={aiProvider} onChange={(event) => setAiProvider(event.target.value)}>
                  <option value="auto">Auto</option>
                  <option value="gemini">Gemini</option>
                  <option value="groq">Groq</option>
                </select>
                <input type="number" min="4" max="30" value={aiQuestionCount} onChange={(event) => setAiQuestionCount(event.target.value)} placeholder="Questions" style={{ width: "90px" }} />
                <input value={aiTitle} onChange={(event) => setAiTitle(event.target.value)} placeholder="Quiz set title" style={{ flex: 1 }} />
              </div>
              <textarea rows={3} value={aiPromptText} onChange={(event) => setAiPromptText(event.target.value)} placeholder="Paste notes, chapter goals, or weak areas…" />
              <div className="ai-builder-file-row">
                <input type="file" accept=".txt,.md,.csv,.json,.pdf" onChange={(event) => setAiFile(event.target.files?.[0] ?? null)} />
                <button type="submit" className="accent-button" disabled={Boolean(aiBusy)}>{aiBusy ? "Generating…" : "Generate Quiz"}</button>
                <button type="button" className="ghost-button" onClick={handleAIGenerateStudyPlan} disabled={Boolean(aiBusy)}>Study Plan</button>
              </div>
            </form>
            {(aiQuizStatus || aiPlanStatus) && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                {aiQuizStatus && <p className="muted" style={{ color: quizStatusTone, margin: 0, fontSize: "0.78rem" }}><strong>{aiQuizStatus.badge}</strong> {aiQuizStatus.message}{aiQuizStatus.provider ? ` (${aiQuizStatus.provider})` : ""}</p>}
                {aiPlanStatus && <p className="muted" style={{ color: planStatusTone, margin: 0, fontSize: "0.78rem" }}><strong>{aiPlanStatus.badge}</strong> {aiPlanStatus.message}{aiPlanStatus.provider ? ` (${aiPlanStatus.provider})` : ""}</p>}
              </div>
            )}
            {!!quizAiLog.length && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {quizAiLog.map((entry) => (
                  <span key={entry.id} className="arena-stat-chip" style={{ fontSize: "0.72rem" }}>
                    {entry.surface === "studyPlan" ? "Plan" : "Quiz"}: {entry.badge} · {entry.provider} · {entry.latencyClass}
                  </span>
                ))}
                <button type="button" className="ghost-button" style={{ fontSize: "0.72rem", padding: "4px 8px" }} onClick={onClearAIHealthLog}>Clear</button>
              </div>
            )}
            {studyPlanPreview && (
              <div className="ai-plan-summary">
                <strong>AI Plan:</strong> {studyPlanPreview.summary ?? "No summary"}{(studyPlanPreview.priorityTopics ?? []).length > 0 && ` · Priorities: ${studyPlanPreview.priorityTopics.join(", ")}`}
              </div>
            )}
          </div>
          )}
        </article>

        {!builderOnly && (
        <article className="panel">
          {
            <>
              <div className="arena-stats-row">
                <span className="arena-stats-heading">Arena Stats</span>
                <div className="arena-stat-chip"><span>Best Score</span><strong>{quizState.bestScore}</strong></div>
                <div className="arena-stat-chip"><span>Accuracy</span><strong>{accuracy}%</strong></div>
                <div className="arena-stat-chip"><span>Answered</span><strong>{quizState.totalAnswered}</strong></div>
                <div className="arena-stat-chip"><span>Streak</span><strong style={{ color: "#63c7ff" }}>{competitiveStats.currentStreak}</strong></div>
                <div className="arena-stat-chip"><span>Record</span><strong style={{ color: "#56d77f" }}>{competitiveStats.accuracyRecord}%</strong></div>
              </div>
            </>
          }
        </article>
        )}
      </div>
    </section>
  );
}

export default QuizBattlePage;
