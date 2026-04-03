import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import Confetti from "./components/Confetti";
import SidebarNav from "./components/SidebarNav";
import useAudio from "./hooks/useAudio";
import { useAuth } from "./hooks/useAuth";
import useCloudSync from "./hooks/useCloudSync";
import useFlashcards from "./hooks/useFlashcards";
import useSound from "./hooks/useSound";
import usePlanner from "./hooks/usePlanner";
import useQuiz from "./hooks/useQuiz";
import { createInitialParty, getPartyAverageLevel } from "./partySystem";
import { getThemeForMode, getThemeById, getThemeCSSVariables } from "./themeSystem";

const AnalyticsPage = lazy(() => import("./components/AnalyticsPage"));
const AchievementsPage = lazy(() => import("./components/AchievementsPage"));
const CustomizationPage = lazy(() => import("./components/CustomizationPage"));
const DashboardView = lazy(() => import("./components/DashboardView"));
const FlashcardsPage = lazy(() => import("./components/FlashcardsPage"));
const FullscreenTimer = lazy(() => import("./components/FullscreenTimer"));
const PartyViewer = lazy(() => import("./components/PartyViewer"));
const PlannerPage = lazy(() => import("./components/PlannerPage"));
const PracticeTestPage = lazy(() => import("./components/PracticeTestPage"));
const ProgressPage = lazy(() => import("./components/ProgressPage"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const QuizBattlePage = lazy(() => import("./components/QuizBattlePage"));
const ShopUI = lazy(() => import("./components/ShopUI"));
const TutorialOverlay = lazy(() => import("./components/TutorialOverlay"));
import {
  DIFFICULTY_VALUES,
  SHOP_ITEMS,
  STORAGE_KEY,
  SUBJECT_PRESETS,
  applyPetXp,
  applyXp,
  buildInitialState,
  formatTime,
  generateDailyQuests,
  getActiveTheme,
  getDayKey,
  getDailyQuote,
  getDailyTip,
  getPartyContribution,
  getReviewUrgency,
  getTimerDuration,
  hydrateState,
  isConsecutiveDay,
  makeBoss,
  parseDayKey,
  resolveCompletedTimerPhase,
} from "./gameState";

const AVATAR_CLASSES = ["Scholar", "Strategist", "Alchemist", "Engineer"];
const HAIR_STYLES = ["Short", "Braided", "Wavy", "Spiked"];
const OUTFIT_STYLES = ["Arcane Robe", "Guild Armor", "Field Coat", "Neo Uniform"];
const PET_SPECIES = ["Dragonling", "Owlet", "Fox Sprite", "Rune Cat"];
const PET_COLORS = ["Amber", "Azure", "Emerald", "Crimson"];
const PET_AURAS = ["Stars", "Flame", "Rain", "Mist"];

const CPU_LEADERBOARD = [
  { userId: "cpu-1", displayName: "AstralRook", level: 22, score: 11420, totalQuizzesCompleted: 188, totalBossesFought: 74, currentStreak: 19 },
  { userId: "cpu-2", displayName: "EchoSage", level: 18, score: 9730, totalQuizzesCompleted: 140, totalBossesFought: 61, currentStreak: 11 },
  { userId: "cpu-3", displayName: "AtlasBloom", level: 14, score: 8110, totalQuizzesCompleted: 119, totalBossesFought: 45, currentStreak: 9 },
];

function maybeNotify(settings, title, body) {
  if (typeof window === "undefined" || !settings.notificationsEnabled) {
    return;
  }

  if (!("Notification" in window)) {
    return;
  }

  if (window.Notification.permission === "granted") {
    new window.Notification(title, { body });
  }
}

function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve("unsupported");
  }

  return window.Notification.requestPermission();
}

function ensureExpandedState(baseState) {
  const defaultSidebarCollapsed =
    baseState.ui?.sidebarCollapsed
    ?? (typeof window !== "undefined" ? window.innerWidth < 1220 : false);

  return {
    ...baseState,
    ui: {
      activeView: "dashboard",
      sidebarCollapsed: defaultSidebarCollapsed,
      ...(baseState.ui ?? {}),
    },
    profile: {
      name: "Guild Cadet",
      className: AVATAR_CLASSES[0],
      hair: HAIR_STYLES[0],
      outfit: OUTFIT_STYLES[0],
      accent: "Gold",
      ...(baseState.profile ?? {}),
    },
    petProfile: {
      species: PET_SPECIES[0],
      color: PET_COLORS[0],
      aura: PET_AURAS[0],
      level: 1,
      xp: 0,
      evolution: "Hatchling",
      ...(baseState.petProfile ?? {}),
    },
    flashcards: {
      sets: [],
      activeSetId: null,
      session: null,
      ...(baseState.flashcards ?? {}),
    },
    quiz: {
      session: null,
      bestScore: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      ...(baseState.quiz ?? {}),
    },
    planner: {
      missions: [
        { id: "mission-focus", title: "Complete 3 focus cycles", status: "todo", type: "focus" },
        { id: "mission-recall", title: "Review 10 flashcards", status: "todo", type: "flashcards" },
      ],
      templates: ["Revision Sprint", "Flashcard Drill", "Mock Quiz", "Pomodoro Chain"],
      semesterDeadline: "2026-06-15",
      ...(baseState.planner ?? {}),
    },
    battle: {
      pulse: 0,
      damage: 0,
      combo: 0,
      ...(baseState.battle ?? {}),
    },
    season: {
      title: "Season of Arcane Recall",
      tier: 1,
      xp: 0,
      ...(baseState.season ?? {}),
    },
    achievements: {
      unlocked: [],
      ...(baseState.achievements ?? {}),
    },
    streak: {
      current: 0,
      longest: 0,
      lastActiveDay: null,
      ...(baseState.streak ?? {}),
    },
    notes: {
      alchemy: "",
      chronicles: "",
      mechanics: "",
      ...(baseState.notes ?? {}),
    },
    calendar: {
      examDates: [],
      ...(baseState.calendar ?? {}),
    },
    notesData: {
      items: [],
      ...(baseState.notesData ?? {}),
    },
    partyRoster: baseState.partyRoster ?? createInitialParty(),
    gameModes: {
      activeMode: baseState.gameModes?.activeMode ?? "bossBattle",
      useManualTheme: baseState.gameModes?.useManualTheme ?? false,
      manualThemeId: baseState.gameModes?.manualThemeId ?? "default",
      ...(baseState.gameModes ?? {}),
    },
  };
}

function App() {
  const initialRef = useRef(null);
  if (!initialRef.current) {
    initialRef.current = ensureExpandedState(buildInitialState());
  }

  const [state, setState] = useState(initialRef.current);
  const [newQuestTitle, setNewQuestTitle] = useState("");
  const [newQuestDifficulty, setNewQuestDifficulty] = useState("medium");
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateType, setNewTemplateType] = useState("practice");
  const [newTemplateDifficulty, setNewTemplateDifficulty] = useState("medium");
  const [reflectionText, setReflectionText] = useState("");
  const [goalLabel, setGoalLabel] = useState("");
  const [goalSessions, setGoalSessions] = useState(24);
  const [petCelebrating, setPetCelebrating] = useState(false);
  const [levelFlash, setLevelFlash] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rewardToast, setRewardToast] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFullscreenTimer, setShowFullscreenTimer] = useState(false);
  const {
    user,
    profile: accountProfile,
    isAuthenticated,
    isLoading,
    error: authError,
    info: authInfo,
    sessionExpired,
    login,
    signup,
    logout,
    requestPasswordReset,
    resendVerification,
    updateProfile,
    backendEnabled,
  } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  const petTimeoutRef = useRef(null);
  const levelTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const importFileRef = useRef(null);
  const previousBossHpRef = useRef(null);
  const confettiTimeoutRef = useRef(null);
  const hasHealer = state.partyRoster.some((member) => member.role === "Healer");

  const { toggleAmbientAudio } = useAudio(state.settings, updateSetting, showToast);
  const {
    activeSet,
    flashSession,
    newSetTitle,
    newCardQuestion,
    newCardAnswer,
    newCardChoices,
    editingCardId,
    studyFilter,
    setNewSetTitle,
    setNewCardQuestion,
    setNewCardAnswer,
    setNewCardChoices,
    setEditingCardId,
    setStudyFilter,
    addFlashcardSet,
    addFlashcardCard,
    deleteFlashcardCard,
    deleteFlashcardSet,
    updateFlashcardCard,
    startFlashcardSession,
    startFlashcardSessionFiltered,
    importCardsFromText,
    answerFlashcard,
    answerOpenFlashcard,
    rateFlashcard,
    nextFlashcard,
  } = useFlashcards(state, setState, showToast);
  const {
    quizSession,
    quizQuestion,
    accuracy,
    startQuizBattle,
    startSpeedRun,
    answerQuiz,
    answerOpenQuestion,
    useFiftyFifty,
    useExtraTime,
    customQuizSets,
    activeCustomSet,
    createCustomQuizSet,
    addCustomQuizQuestion,
    selectCustomQuizSet,
    useDefend,
    useHeal,
    usePotion,
  } =
    useQuiz(state, setState, activeSet, showToast, hasHealer);
  const { playSound } = useSound(state.settings);
  const { plannerDraft, setPlannerDraft, plannerCompletion, addPlannerMission, toggleMissionStatus, deletePlannerMission } =
    usePlanner(state, setState);

  const activeSubject = state.subjects[state.activeSubject];
  const currentTheme = getActiveTheme(activeSubject, state.settings);
  const timerDuration = state.timer.mode === "focus"
    ? activeSubject.focusMinutes * 60
    : activeSubject.breakMinutes * 60;
  const manaPercent = Math.max(0, (state.timer.secondsLeft / timerDuration) * 100);
  const revisionQueue = activeSubject.revisionDeck.filter((card) => getReviewUrgency(state.dayKey, card.dueDay) !== "later");
  const partyContribution = getPartyContribution(state.party) + activeSubject.progress.questsCleared;
  const journalPrompt = state.timer.mode === "recovery"
    ? "What clicked during that focus cycle?"
    : "What is your next move?";
  const prestigeEligible = activeSubject.progress.level >= 10;
  const journalPreview = activeSubject.journal.slice(0, 4);
  const goalPercent = Math.min(
    100,
    Math.round((activeSubject.semesterGoal.completedSessions / activeSubject.semesterGoal.targetSessions) * 100),
  );
  const partyPercent = Math.min(100, Math.round((partyContribution / state.party.weeklyTarget) * 100));
  const prestigeThemeChoices = activeSubject.progress.ownedThemes;
  const dailyQuote = getDailyQuote(state.dayKey);
  const dailyTip = getDailyTip(state.dayKey);
  const derivedMode = state.ui.activeView === "flashcards"
    ? "travelling"
    : state.ui.activeView === "quiz"
      ? "bossBattle"
      : state.timer.mode === "focus"
        ? "focus"
        : "gathering";
  const activeMode = derivedMode;
  const modeTheme = state.gameModes?.useManualTheme
    ? getThemeById(state.gameModes?.manualThemeId ?? "default")
    : getThemeForMode(activeMode);
  const themeVars = getThemeCSSVariables(modeTheme);
  const consumables = [
    { id: "potion_health_small", name: "Minor Potion" },
    { id: "potion_health_large", name: "Major Potion" },
  ];

  const buildCurrentLeaderboardEntry = useCallback(() => ({
    displayName: accountProfile?.displayName ?? "Guild Cadet",
    level: getPartyAverageLevel(state.partyRoster),
    score: (state.quiz.bestScore ?? 0) + (activeSubject.progress.totalXp ?? 0) + state.streak.current * 120,
    totalQuizzesCompleted: state.quiz.totalAnswered,
    totalBossesFought: activeSubject.progress.bossVictories,
    currentStreak: state.streak.current,
    modeScores: {
      bossBattle: state.quiz.bestScore,
      travelling: Math.floor((state.flashcards.sets.length || 0) * 250),
      gathering: accountProfile?.currency ?? 0,
      focus: activeSubject.progress.focusCycles * 80,
    },
  }), [
    accountProfile?.currency,
    accountProfile?.displayName,
    activeSubject.progress.bossVictories,
    activeSubject.progress.focusCycles,
    activeSubject.progress.totalXp,
    state.flashcards.sets.length,
    state.partyRoster,
    state.quiz.bestScore,
    state.quiz.totalAnswered,
    state.streak.current,
  ]);

  const { remoteLeaderboard, syncStatus, syncError, retrySync, queuedOffline } = useCloudSync({
    user,
    state,
    buildLeaderboardEntry: buildCurrentLeaderboardEntry,
    onRemoteStateLoaded: (remoteState) => {
      setState(ensureExpandedState(hydrateState(remoteState)));
    },
  });

  useEffect(() => {
    if (!accountProfile) {
      return;
    }

    if (!accountProfile.tutorialCompleted && !accountProfile.tutorialSkipped) {
      setShowTutorial(true);
    }
  }, [accountProfile]);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.recoveredSeconds) {
      return;
    }

    showToast(`Recovered ${Math.floor(state.recoveredSeconds / 60)}m of timer progress`);
    setState((current) => ({
      ...current,
      recoveredSeconds: 0,
    }));
  }, [state.recoveredSeconds]);

  useEffect(() => {
    const previous = previousBossHpRef.current;
    if (previous !== null && activeSubject.boss.hp < previous) {
      setState((current) => ({
        ...current,
        battle: {
          ...current.battle,
          pulse: current.battle.pulse + 1,
          damage: previous - activeSubject.boss.hp,
          combo: current.battle.combo + 1,
        },
      }));
    }
    if (previous !== null && activeSubject.boss.hp > previous) {
      setState((current) => ({
        ...current,
        battle: {
          ...current.battle,
          combo: 0,
        },
      }));
    }
    previousBossHpRef.current = activeSubject.boss.hp;
  }, [activeSubject.boss.hp]);

  useEffect(() => {
    setState((current) => unlockAchievements(current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.subjects, state.flashcards.sets, state.quiz.bestScore, state.petProfile.level, state.streak.current]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        toggleTimer();
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        resetTimer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  useEffect(() => {
    if (!state.timer.isRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setState((current) => {
        if (current.timer.secondsLeft > 1) {
          return {
            ...current,
            timer: {
              ...current.timer,
              secondsLeft: current.timer.secondsLeft - 1,
              lastTickAt: Date.now(),
            },
          };
        }

        const subject = current.subjects[current.activeSubject];
        const subjectPreset = SUBJECT_PRESETS.find((entry) => entry.key === current.activeSubject) ?? SUBJECT_PRESETS[0];
        const phaseResult = resolveCompletedTimerPhase(subject, subjectPreset, current.timer.mode);
        const nextMode = current.timer.mode === "focus" ? "break" : "focus";
        const nextSeconds = getTimerDuration(phaseResult.subject, nextMode);

        if (phaseResult.bossDefeated) {
          maybeNotify(current.settings, "Boss Defeated", `${phaseResult.subject.name} cleared ${phaseResult.defeatedBossName}.`);
        }

        maybeNotify(
          current.settings,
          "FocusFlow",
          nextMode === "focus" ? "Focus phase started." : "Break phase started.",
        );

        return {
          ...current,
          subjects: {
            ...current.subjects,
            [current.activeSubject]: phaseResult.subject,
          },
          timer: {
            ...current.timer,
            mode: nextMode,
            secondsLeft: nextSeconds,
            lastTickAt: Date.now(),
          },
          petProfile: applyPetXp(current.petProfile, current.timer.mode === "focus" ? 8 : 3),
          season: {
            ...current.season,
            xp: current.season.xp + 5,
            tier: 1 + Math.floor((current.season.xp + 5) / 150),
          },
          sessionHistory: current.timer.mode === "focus"
            ? [
                ...(current.sessionHistory ?? []),
                {
                  date: new Date().toISOString(),
                  duration: Math.round(getTimerDuration(subject, "focus") / 60),
                  subject: subject?.name ?? current.activeSubject,
                },
              ].slice(-300)
            : (current.sessionHistory ?? []),
        };
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [state.timer.isRunning, state.activeSubject]);

  useEffect(() => {
    return () => {
      [petTimeoutRef, levelTimeoutRef, toastTimeoutRef, confettiTimeoutRef].forEach((timeoutRef) => {
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
      });
    };
  }, []);

  function showToast(message) {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setRewardToast(message);
    toastTimeoutRef.current = window.setTimeout(() => setRewardToast(""), 1700);
  }

  function bouncePet() {
    if (petTimeoutRef.current) {
      window.clearTimeout(petTimeoutRef.current);
    }

    setPetCelebrating(true);
    petTimeoutRef.current = window.setTimeout(() => setPetCelebrating(false), state.settings.reducedMotion ? 180 : 700);
  }

  function flashLevel() {
    if (levelTimeoutRef.current) {
      window.clearTimeout(levelTimeoutRef.current);
    }

    setLevelFlash(true);
    levelTimeoutRef.current = window.setTimeout(() => setLevelFlash(false), 1200);
  }

  function triggerConfetti() {
    if (confettiTimeoutRef.current) {
      window.clearTimeout(confettiTimeoutRef.current);
    }

    setShowConfetti(true);
    confettiTimeoutRef.current = window.setTimeout(() => setShowConfetti(false), 1900);
  }

  function unlockAchievements(current) {
    const unlocked = new Set(current.achievements?.unlocked ?? []);
    const subjects = Object.values(current.subjects);
    const totalQuests = subjects.reduce((sum, subject) => sum + subject.progress.questsCleared, 0);
    const totalBosses = subjects.reduce((sum, subject) => sum + subject.progress.bossVictories, 0);
    const maxLevel = Math.max(...subjects.map((subject) => subject.progress.level));
    const totalShards = subjects.reduce((sum, subject) => sum + subject.progress.shards, 0);
    const totalFocus = subjects.reduce((sum, subject) => sum + subject.progress.focusCycles, 0);
    const totalPrestige = subjects.reduce((sum, subject) => sum + subject.progress.prestigeRank, 0);
    const totalCards = current.flashcards.sets.reduce((sum, setEntry) => sum + setEntry.cards.length, 0);

    if (totalQuests >= 1) unlocked.add("first-quest");
    if (totalQuests >= 10) unlocked.add("quest-10");
    if (totalQuests >= 50) unlocked.add("quest-50");
    if (totalBosses >= 1) unlocked.add("boss-1");
    if (totalBosses >= 5) unlocked.add("boss-5");
    if (maxLevel >= 5) unlocked.add("level-5");
    if (maxLevel >= 10) unlocked.add("level-10");
    if (current.streak.current >= 3) unlocked.add("streak-3");
    if (current.streak.current >= 7) unlocked.add("streak-7");
    if (current.quiz.bestScore >= 1000) unlocked.add("quiz-ace");
    if (totalCards >= 20) unlocked.add("flashcard-20");
    if (totalPrestige >= 1) unlocked.add("prestige-1");
    if (totalShards >= 100) unlocked.add("shards-100");
    if (totalFocus >= 10) unlocked.add("focus-10");
    if (current.petProfile.level >= 5) unlocked.add("pet-companion");

    const nextUnlocked = Array.from(unlocked);
    const previousUnlocked = current.achievements?.unlocked ?? [];
    const newlyUnlocked = nextUnlocked.filter((id) => !previousUnlocked.includes(id));

    if (!newlyUnlocked.length) {
      return current;
    }

    playSound("achievement");
    showToast(`Achievement unlocked: ${newlyUnlocked.length}`);

    return {
      ...current,
      achievements: {
        ...current.achievements,
        unlocked: nextUnlocked,
      },
    };
  }

  function toggleTimer() {
    setState((current) => ({
      ...current,
      timer: {
        ...current.timer,
        isRunning: !current.timer.isRunning,
        lastTickAt: Date.now(),
      },
    }));
  }

  function resetTimer() {
    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      return {
        ...current,
        timer: {
          mode: "focus",
          secondsLeft: subject.focusMinutes * 60,
          isRunning: false,
          lastTickAt: null,
        },
      };
    });
  }

  function switchSubject(subjectKey) {
    setState((current) => {
      const subject = current.subjects[subjectKey];
      return {
        ...current,
        activeSubject: subjectKey,
        timer: {
          mode: "focus",
          secondsLeft: subject.focusMinutes * 60,
          isRunning: false,
          lastTickAt: null,
        },
      };
    });
  }

  function completeQuest(questId) {
    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      const targetQuest = subject.quests.find((quest) => quest.id === questId);
      if (!targetQuest) {
        return current;
      }

      if (targetQuest.completed) {
        showToast("Quest marked as not done");
        return {
          ...current,
          subjects: {
            ...current.subjects,
            [current.activeSubject]: {
              ...subject,
              quests: subject.quests.map((quest) =>
                quest.id === questId ? { ...quest, completed: false } : quest,
              ),
            },
          },
        };
      }

      if (targetQuest.rewardClaimed) {
        showToast("Quest re-completed");
        return {
          ...current,
          subjects: {
            ...current.subjects,
            [current.activeSubject]: {
              ...subject,
              quests: subject.quests.map((quest) =>
                quest.id === questId ? { ...quest, completed: true } : quest,
              ),
            },
          },
        };
      }

      if (targetQuest.requiresId) {
        const prerequisite = subject.quests.find((quest) => quest.id === targetQuest.requiresId);
        if (prerequisite && !prerequisite.completed) {
          showToast("Finish the linked quest first");
          return current;
        }
      }

      const xpMultiplier = current.event.boostedTypes.includes(targetQuest.type) ? current.event.xpMultiplier : 1;
      const tonicBoost = subject.progress.xpTonics > 0 ? 1.2 : 1;
      const xpGained = Math.round(targetQuest.xpReward * xpMultiplier * tonicBoost);
      const nextProgress = applyXp(subject.progress, xpGained);
      const nextBossHp = Math.max(0, subject.boss.hp - targetQuest.bossDamage);
      const nextJournalEntry = {
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: targetQuest.title,
        note: `Looted ${targetQuest.title} for ${xpGained} XP.`,
        dayKey: current.dayKey,
      };

      const nextSubject = {
        ...subject,
        quests: subject.quests.map((quest) =>
          quest.id === questId ? { ...quest, completed: true, rewardClaimed: true } : quest,
        ),
        progress: {
          ...nextProgress,
          questsCleared: nextProgress.questsCleared + 1,
          shards: nextProgress.shards + targetQuest.shardsReward,
          xpTonics: Math.max(0, nextProgress.xpTonics - 1),
        },
        boss: {
          ...subject.boss,
          hp: nextBossHp,
        },
        revisionDeck: [
          {
            id: `${questId}-review`,
            title: targetQuest.title,
            dueDay: getDayKey(new Date(parseDayKey(current.dayKey).getTime() + 2 * 24 * 60 * 60 * 1000)),
            strength: 1,
          },
          ...subject.revisionDeck,
        ].slice(0, 24),
        journal: [nextJournalEntry, ...subject.journal].slice(0, 18),
        history: [nextJournalEntry, ...subject.history].slice(0, 30),
      };

      if (nextSubject.progress.leveledUp) {
        flashLevel();
      }

      if (nextBossHp === 0) {
        nextSubject.progress = {
          ...nextSubject.progress,
          bossVictories: nextSubject.progress.bossVictories + 1,
          shards: nextSubject.progress.shards + 12,
        };
        nextSubject.boss = makeBoss(
          SUBJECT_PRESETS.find((entry) => entry.key === current.activeSubject),
          nextSubject.progress.prestigeRank,
        );
        maybeNotify(current.settings, "Boss Defeated", `${subject.boss.name} has been defeated.`);
      }

      const nextGuild = {
        ...current.guild,
        totalShards: current.guild.totalShards + targetQuest.shardsReward,
      };

      const streakState = current.streak ?? { current: 0, longest: 0, lastActiveDay: null };
      const alreadyCountedToday = streakState.lastActiveDay === current.dayKey;
      const nextStreakCurrent = alreadyCountedToday
        ? streakState.current
        : isConsecutiveDay(streakState.lastActiveDay, current.dayKey)
          ? streakState.current + 1
          : 1;

      const streak = {
        current: nextStreakCurrent,
        longest: Math.max(streakState.longest, nextStreakCurrent),
        lastActiveDay: current.dayKey,
      };

      bouncePet();
      playSound(nextBossHp === 0 ? "boss-defeat" : "boss-hit");
      if (nextSubject.progress.leveledUp) {
        playSound("levelup");
        triggerConfetti();
      }
      if (nextBossHp === 0) {
        triggerConfetti();
      }
      showToast(`+${xpGained} XP / +${targetQuest.shardsReward} shards`);

      const nextState = {
        ...current,
        guild: nextGuild,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: nextSubject,
        },
        streak,
        petProfile: applyPetXp(current.petProfile, 12),
        season: {
          ...current.season,
          xp: current.season.xp + 12,
          tier: 1 + Math.floor((current.season.xp + 12) / 150),
        },
      };

      return unlockAchievements(nextState);
    });
  }

  function resolveRevision(cardId) {
    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            revisionDeck: subject.revisionDeck
              .map((card) =>
                card.id === cardId
                  ? {
                      ...card,
                      strength: card.strength + 1,
                      dueDay: getDayKey(new Date(parseDayKey(current.dayKey).getTime() + (card.strength + 2) * 24 * 60 * 60 * 1000)),
                    }
                  : card,
              )
              .filter((card) => card.id !== cardId || card.strength < 3),
          },
        },
      };
    });

    showToast("Revision logged");
  }

  function addReflection(event) {
    event.preventDefault();
    if (!reflectionText.trim()) {
      return;
    }

    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            journal: [
              {
                id: `${Date.now()}-reflection`,
                title: "Reflection",
                note: reflectionText.trim(),
                dayKey: current.dayKey,
              },
              ...subject.journal,
            ].slice(0, 18),
          },
        },
      };
    });

    setReflectionText("");
    showToast("Reflection saved");
  }

  function deleteReflection(entryId) {
    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            journal: subject.journal.filter((entry) => entry.id !== entryId),
          },
        },
      };
    });
  }

  function deleteQuest(questId) {
    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            quests: subject.quests.filter((quest) => quest.id !== questId),
          },
        },
      };
    });
  }

  function addTemplate(event) {
    event.preventDefault();
    if (!newTemplateTitle.trim()) {
      return;
    }

  // â”€â”€ Formulas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function addFormulaSheet(id, title) {
    setState((c) => ({ ...c, formulas: [...(c.formulas ?? []), { id, title, sections: [] }] }));
  }
  function deleteFormulaSheet(sheetId) {
    setState((c) => ({ ...c, formulas: (c.formulas ?? []).filter((s) => s.id !== sheetId) }));
  }
  function addFormulaSection(sheetId, sectionId, title) {
    setState((c) => ({
      ...c,
      formulas: (c.formulas ?? []).map((s) =>
        s.id === sheetId ? { ...s, sections: [...s.sections, { id: sectionId, title, items: [] }] } : s,
      ),
    }));
  }
  function deleteFormulaSection(sheetId, sectionId) {
    setState((c) => ({
      ...c,
      formulas: (c.formulas ?? []).map((s) =>
        s.id === sheetId ? { ...s, sections: s.sections.filter((sec) => sec.id !== sectionId) } : s,
      ),
    }));
  }
  function addFormulaItem(sheetId, sectionId, itemId, text) {
    setState((c) => ({
      ...c,
      formulas: (c.formulas ?? []).map((s) =>
        s.id === sheetId
          ? { ...s, sections: s.sections.map((sec) => sec.id === sectionId ? { ...sec, items: [...sec.items, { id: itemId, text }] } : sec) }
          : s,
      ),
    }));
  }
  function deleteFormulaItem(sheetId, sectionId, itemId) {
    setState((c) => ({
      ...c,
      formulas: (c.formulas ?? []).map((s) =>
        s.id === sheetId
          ? { ...s, sections: s.sections.map((sec) => sec.id === sectionId ? { ...sec, items: sec.items.filter((item) => item.id !== itemId) } : sec) }
          : s,
      ),
    }));
  }
  function updateFormulaItem(sheetId, sectionId, itemId, text) {
    setState((c) => ({
      ...c,
      formulas: (c.formulas ?? []).map((s) =>
        s.id === sheetId
          ? { ...s, sections: s.sections.map((sec) => sec.id === sectionId ? { ...sec, items: sec.items.map((item) => item.id === itemId ? { ...item, text } : item) } : sec) }
          : s,
      ),
    }));
  }

  // â”€â”€ Outlines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  function addOutline(id, title) {
    setState((c) => ({ ...c, outlines: [...(c.outlines ?? []), { id, title, nodes: [] }] }));
  }
  function deleteOutline(outlineId) {
    setState((c) => ({ ...c, outlines: (c.outlines ?? []).filter((o) => o.id !== outlineId) }));
  }
  function addOutlineNode(outlineId, afterId) {
    setState((c) => {
      const outline = (c.outlines ?? []).find((o) => o.id === outlineId);
      if (!outline) return c;
      const newNode = { id: `node-${Date.now()}`, text: "", depth: 0 };
      let nodes;
      if (!afterId) {
        nodes = [...outline.nodes, newNode];
      } else {
        const idx = outline.nodes.findIndex((n) => n.id === afterId);
        const depth = idx >= 0 ? (outline.nodes[idx].depth ?? 0) : 0;
        nodes = [...outline.nodes.slice(0, idx + 1), { ...newNode, depth }, ...outline.nodes.slice(idx + 1)];
      }
      return { ...c, outlines: (c.outlines ?? []).map((o) => (o.id === outlineId ? { ...o, nodes } : o)) };
    });
  }
  function deleteOutlineNode(outlineId, nodeId) {
    setState((c) => ({
      ...c,
      outlines: (c.outlines ?? []).map((o) => o.id === outlineId ? { ...o, nodes: o.nodes.filter((n) => n.id !== nodeId) } : o),
    }));
  }
  function updateOutlineNode(outlineId, nodeId, text) {
    setState((c) => ({
      ...c,
      outlines: (c.outlines ?? []).map((o) => o.id === outlineId ? { ...o, nodes: o.nodes.map((n) => n.id === nodeId ? { ...n, text } : n) } : o),
    }));
  }
  function indentOutlineNode(outlineId, nodeId) {
    setState((c) => ({
      ...c,
      outlines: (c.outlines ?? []).map((o) => o.id === outlineId ? { ...o, nodes: o.nodes.map((n) => n.id === nodeId ? { ...n, depth: Math.min((n.depth ?? 0) + 1, 4) } : n) } : o),
    }));
  }
  function dedentOutlineNode(outlineId, nodeId) {
    setState((c) => ({
      ...c,
      outlines: (c.outlines ?? []).map((o) => o.id === outlineId ? { ...o, nodes: o.nodes.map((n) => n.id === nodeId ? { ...n, depth: Math.max((n.depth ?? 0) - 1, 0) } : n) } : o),
    }));
  }
    const template = {
      id: `${state.activeSubject}-custom-${Date.now()}`,
      title: newTemplateTitle.trim(),
      type: newTemplateType,
      difficulty: newTemplateDifficulty,
      custom: true,
    };

    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            customTemplates: [...subject.customTemplates, template].slice(-8),
          },
        },
      };
    });

    setNewTemplateTitle("");
    showToast("Quest template forged");
  }

  function addCustomQuest(event) {
    event.preventDefault();
    if (!newQuestTitle.trim()) {
      return;
    }

    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      const eventBoost = current.event.boostedTypes.includes("practice") ? current.event.xpMultiplier : 1;
      const values = DIFFICULTY_VALUES[newQuestDifficulty];
      const customQuest = {
        id: `${current.dayKey}-manual-${Date.now()}`,
        title: newQuestTitle.trim(),
        type: "practice",
        difficulty: newQuestDifficulty,
        xpReward: Math.round(values.xp * eventBoost),
        shardsReward: values.shards,
        bossDamage: values.bossDamage,
        completed: false,
        custom: true,
        requiresId: null,
      };

      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            quests: [...subject.quests, customQuest],
          },
        },
      };
    });

    setNewQuestTitle("");
  }

  function regenerateQuests() {
    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            quests: generateDailyQuests(current.activeSubject, subject.customTemplates, current.dayKey, current.event),
          },
        },
      };
    });

    showToast("Daily quests reshuffled");
  }

  function buyShopItem(item) {
    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      if (subject.progress.shards < item.cost) {
        showToast("Not enough shards");
        return current;
      }

      const nextProgress = {
        ...subject.progress,
        shards: subject.progress.shards - item.cost,
      };

      if (item.type === "boost") {
        nextProgress.xpTonics += 1;
      }

      if (item.type === "shield") {
        nextProgress.streakShield += 1;
      }

      if (item.type === "theme" && !nextProgress.ownedThemes.includes(item.value)) {
        nextProgress.ownedThemes = [...nextProgress.ownedThemes, item.value];
      }

      if (item.type === "pet") {
        nextProgress.petSkin = item.value;
      }

      showToast(`Bought ${item.label}`);
      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            progress: nextProgress,
          },
        },
      };
    });
  }

  function applyPrestige() {
    if (!prestigeEligible) {
      return;
    }

    setState((current) => {
      const subjectPreset = SUBJECT_PRESETS.find((entry) => entry.key === current.activeSubject);
      const subject = current.subjects[current.activeSubject];
      const nextPrestige = subject.progress.prestigeRank + 1;

      showToast(`Prestige +1 for ${subject.name}`);
      return {
        ...current,
        guild: {
          ...current.guild,
          prestigeLevel: current.guild.prestigeLevel + 1,
          revivalTokens: current.guild.revivalTokens + 1,
        },
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            progress: {
              ...subject.progress,
              level: 1,
              xp: 0,
              prestigeRank: nextPrestige,
              shards: subject.progress.shards + 30,
            },
            boss: makeBoss(subjectPreset, nextPrestige),
          },
        },
      };
    });
  }

  function saveGoal(event) {
    event.preventDefault();
    if (!goalLabel) {
      return;
    }

    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            semesterGoal: {
              ...subject.semesterGoal,
              label: String(goalLabel),
              targetSessions: Number(goalSessions),
            },
          },
        },
      };
    });

    showToast("Semester goal updated");
  }

  function updateSetting(key, value) {
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [key]: value,
      },
    }));
  }

  async function toggleNotifications(enabled) {
    if (!enabled) {
      updateSetting("notificationsEnabled", false);
      return;
    }

    const permission = await requestNotificationPermission();
    updateSetting("notificationsEnabled", permission === "granted");
    showToast(permission === "granted" ? "Notifications enabled" : "Notifications blocked");
  }

  function changeTheme(theme) {
    if (!prestigeThemeChoices.includes(theme)) {
      return;
    }

    setState((current) => ({
      ...current,
      subjects: {
        ...current.subjects,
        [current.activeSubject]: {
          ...current.subjects[current.activeSubject],
          theme,
        },
      },
    }));
  }

  function exportBackup() {
    if (typeof window === "undefined") {
      return;
    }

    const exportableState = {
      ...state,
      recoveredSeconds: 0,
    };
    const blob = new Blob([JSON.stringify(exportableState, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `focusflow-backup-${state.dayKey}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    showToast("Backup exported");
  }

  async function importBackup(eventOrData) {
    try {
      let parsed;
      
      if (eventOrData && eventOrData.target && eventOrData.target.files) {
        // File input event
        const file = eventOrData.target.files[0];
        if (!file) return;
        parsed = JSON.parse(await file.text());
        eventOrData.target.value = "";
      } else {
        // Direct data (from ProfilePage)
        parsed = eventOrData;
      }
      
      setState(ensureExpandedState(hydrateState(parsed)));
      showToast("Backup imported");
    } catch {
      showToast("Import failed");
    }
  }

  function updateAvatarField(field, value) {
    setState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        [field]: value,
      },
    }));
  }

  function updatePetField(field, value) {
    setState((current) => ({
      ...current,
      petProfile: {
        ...current.petProfile,
        [field]: value,
      },
    }));
  }

  function setTimerPreset(focusMinutes, breakMinutes) {
    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            focusMinutes,
            breakMinutes,
          },
        },
        timer: {
          ...current.timer,
          mode: "focus",
          secondsLeft: focusMinutes * 60,
          isRunning: false,
          lastTickAt: null,
        },
      };
    });
    showToast(`Timer preset ${focusMinutes}/${breakMinutes} applied`);
  }

  function setCustomTimer(focusMinutes, breakMinutes) {
    setState((current) => {
      const subject = current.subjects[current.activeSubject];
      return {
        ...current,
        subjects: {
          ...current.subjects,
          [current.activeSubject]: {
            ...subject,
            focusMinutes,
            breakMinutes,
          },
        },
        timer: {
          ...current.timer,
          mode: "focus",
          secondsLeft: focusMinutes * 60,
          isRunning: false,
          lastTickAt: null,
        },
      };
    });
    showToast(`Custom timer ${focusMinutes}m/${breakMinutes}m set`);
  }

  function maximizeTimer() {
    setShowFullscreenTimer(!showFullscreenTimer);
  }

  function updateUserProfile(updates) {
    if (updateProfile) {
      updateProfile(updates);
    }
    showToast("Profile updated");
  }

  function updateNote(value) {
    setState((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [current.activeSubject]: value,
      },
    }));
  }

  function addExam(exam) {
    setState((current) => ({
      ...current,
      calendar: {
        ...current.calendar,
        examDates: [exam, ...(current.calendar?.examDates ?? [])],
      },
    }));
    showToast("Exam date added");
  }

  function removeExam(date, label) {
    setState((current) => ({
      ...current,
      calendar: {
        ...current.calendar,
        examDates: (current.calendar?.examDates ?? []).filter((entry) => !(entry.date === date && entry.label === label)),
      },
    }));
  }

  function addNoteItem(note) {
    setState((current) => ({
      ...current,
      notesData: {
        ...current.notesData,
        items: [note, ...(current.notesData?.items ?? [])],
      },
    }));
  }

  function updateNoteItem(noteId, updates) {
    setState((current) => ({
      ...current,
      notesData: {
        ...current.notesData,
        items: (current.notesData?.items ?? []).map((item) =>
          item.id === noteId ? { ...item, ...updates } : item,
        ),
      },
    }));
  }

  function deleteNoteItem(noteId) {
    setState((current) => ({
      ...current,
      notesData: {
        ...current.notesData,
        items: (current.notesData?.items ?? []).filter((item) => item.id !== noteId),
      },
    }));
  }

  function togglePinNote(noteId) {
    setState((current) => ({
      ...current,
      notesData: {
        ...current.notesData,
        items: (current.notesData?.items ?? []).map((item) =>
          item.id === noteId ? { ...item, pinned: !item.pinned } : item,
        ),
      },
    }));
  }

  function toggleTagNote(noteId, tag) {
    setState((current) => ({
      ...current,
      notesData: {
        ...current.notesData,
        items: (current.notesData?.items ?? []).map((item) => {
          if (item.id !== noteId) {
            return item;
          }

          const tags = item.tags ?? [];
          return {
            ...item,
            tags: tags.includes(tag) ? tags.filter((entry) => entry !== tag) : [...tags, tag],
          };
        }),
      },
    }));
  }

  function exportCards() {
    if (typeof window === "undefined" || !activeSet) {
      showToast("Select a set to export");
      return;
    }

    const escapeCsv = (value) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
    const rows = ["question,answer,choices"];
    activeSet.cards.forEach((card) => {
      rows.push([
        escapeCsv(card.question),
        escapeCsv(card.answer),
        escapeCsv((card.choices ?? []).join("|")),
      ].join(","));
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeSet.title.replace(/\s+/g, "-").toLowerCase()}-flashcards.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async function importCards(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const rows = lines[0]?.toLowerCase().includes("question,") ? lines.slice(1) : lines;
      const cards = rows
        .map((line, idx) => {
          const parts = line.split(",");
          const question = parts[0]?.replaceAll(/^"|"$/g, "")?.trim();
          const answer = parts[1]?.replaceAll(/^"|"$/g, "")?.trim();
          const choicesRaw = parts.slice(2).join(",").replaceAll(/^"|"$/g, "").trim();
          if (!question || !answer) {
            return null;
          }
          const choices = choicesRaw ? choicesRaw.split("|").map((entry) => entry.trim()).filter(Boolean) : [];
          return {
            id: `card-import-${Date.now()}-${idx}`,
            question,
            answer,
            choices: choices.length ? [answer, ...choices].slice(0, 4) : [answer],
            type: choices.length ? "mcq" : "basic",
            strength: 1,
            dueDay: state.dayKey,
          };
        })
        .filter(Boolean);

      if (!cards.length) {
        showToast("No valid cards found");
        return;
      }

      setState((current) => {
        const setId = current.flashcards.activeSetId ?? `set-import-${Date.now()}`;
        const existing = current.flashcards.sets.find((setEntry) => setEntry.id === setId);
        const nextSet = existing
          ? {
              ...existing,
              cards: [...cards, ...existing.cards],
            }
          : {
              id: setId,
              title: file.name.replace(/\.csv$/i, "") || "Imported Set",
              subjectKey: current.activeSubject,
              cards,
            };

        return {
          ...current,
          flashcards: {
            ...current.flashcards,
            activeSetId: setId,
            sets: existing
              ? current.flashcards.sets.map((setEntry) => (setEntry.id === setId ? nextSet : setEntry))
              : [nextSet, ...current.flashcards.sets],
          },
        };
      });

      showToast(`Imported ${cards.length} cards`);
      playSound("achievement");
    } catch {
      showToast("Import failed");
    } finally {
      event.target.value = "";
    }
  }

  function setActiveView(viewId) {
    setState((current) => ({
      ...current,
      ui: {
        ...current.ui,
        activeView: viewId,
      },
    }));
  }

  function toggleSidebar() {
    setState((current) => ({
      ...current,
      ui: {
        ...current.ui,
        sidebarCollapsed: !current.ui.sidebarCollapsed,
      },
    }));
  }

  function updatePartyRoster(nextRoster) {
    setState((current) => ({
      ...current,
      partyRoster: nextRoster,
    }));
  }

  function handleTutorialComplete() {
    setShowTutorial(false);
    if (!accountProfile) {
      return;
    }

    updateProfile({
      tutorialCompleted: true,
      tutorialSkipped: false,
    });
  }

  function handleTutorialSkip() {
    setShowTutorial(false);
    if (!accountProfile) {
      return;
    }

    updateProfile({
      tutorialCompleted: false,
      tutorialSkipped: true,
    });
  }

  function handleProfileThemePick(themeId) {
    setState((current) => ({
      ...current,
      gameModes: {
        ...current.gameModes,
        useManualTheme: true,
        manualThemeId: themeId,
      },
    }));

    if (accountProfile) {
      updateProfile({ currentTheme: themeId });
    }
  }

  function useAutomaticTheme() {
    setState((current) => ({
      ...current,
      gameModes: {
        ...current.gameModes,
        useManualTheme: false,
      },
    }));
  }

  function handleShopPurchase(nextProfile) {
    if (accountProfile) {
      updateProfile(nextProfile);
    }
  }

  function renderDashboard() {
    const playerEntry = {
      userId: accountProfile?.userId ?? "local-user",
      ...buildCurrentLeaderboardEntry(),
    };
    const combined = remoteLeaderboard.length
      ? [playerEntry, ...remoteLeaderboard.filter((entry) => entry.userId !== playerEntry.userId)]
      : [playerEntry, ...CPU_LEADERBOARD];
    const leaderboardPreview = [...combined]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 5);

    return (
      <DashboardView
        subjectPresets={SUBJECT_PRESETS}
        state={state}
        activeSubject={activeSubject}
        levelFlash={levelFlash}
        onSwitchSubject={switchSubject}
        rewardToast={rewardToast}
        newQuestTitle={newQuestTitle}
        newQuestDifficulty={newQuestDifficulty}
        newTemplateTitle={newTemplateTitle}
        newTemplateType={newTemplateType}
        newTemplateDifficulty={newTemplateDifficulty}
        revisionQueue={revisionQueue}
        onCompleteQuest={completeQuest}
        onDeleteQuest={deleteQuest}
        onSetNewQuestTitle={setNewQuestTitle}
        onSetNewQuestDifficulty={setNewQuestDifficulty}
        onAddCustomQuest={addCustomQuest}
        onRegenerateQuests={regenerateQuests}
        onToggleAmbientAudio={toggleAmbientAudio}
        onResolveRevision={resolveRevision}
        getReviewUrgency={getReviewUrgency}
        onSetNewTemplateTitle={setNewTemplateTitle}
        onSetNewTemplateType={setNewTemplateType}
        onSetNewTemplateDifficulty={setNewTemplateDifficulty}
        onAddTemplate={addTemplate}
        manaPercent={manaPercent}
        partyContribution={partyContribution}
        partyPercent={partyPercent}
        goalPercent={goalPercent}
        goalLabel={goalLabel}
        goalSessions={goalSessions}
        formatTime={formatTime}
        semesterDeadline={state.planner.semesterDeadline}
        onSetTimerPreset={setTimerPreset}
        onSetCustomTimer={setCustomTimer}
        onMaximizeTimer={maximizeTimer}
        onToggleTimer={toggleTimer}
        onResetTimer={resetTimer}
        onSaveGoal={saveGoal}
        onSetGoalLabel={setGoalLabel}
        onSetGoalSessions={setGoalSessions}
        petCelebrating={petCelebrating}
        showSettings={showSettings}
        currentTheme={currentTheme}
        prestigeThemeChoices={prestigeThemeChoices}
        streak={state.streak}
        dailyQuote={dailyQuote}
        dailyTip={dailyTip}
        importFileRef={importFileRef}
        journalPreview={journalPreview}
        journalPrompt={journalPrompt}
        reflectionText={reflectionText}
        prestigeEligible={prestigeEligible}
        onToggleSound={() => updateSetting("soundEnabled", !state.settings.soundEnabled)}
        onToggleSettings={() => setShowSettings((value) => !value)}
        onUpdateSetting={updateSetting}
        onToggleNotifications={toggleNotifications}
        onUpdateNote={updateNote}
        onChangeTheme={changeTheme}
        onExportBackup={exportBackup}
        onImportBackup={importBackup}
        battle={state.battle}
        onSetReflectionText={setReflectionText}
        onAddReflection={addReflection}
        onDeleteReflection={deleteReflection}
        onApplyPrestige={applyPrestige}
        partyRoster={state.partyRoster}
        leaderboardPreview={leaderboardPreview}
        examDates={state.calendar?.examDates ?? []}
        notesItems={state.notesData?.items ?? []}
        onOpenFlashcards={() => setActiveView("flashcards")}
        onOpenQuiz={() => setActiveView("quiz")}
        userProfile={accountProfile}
        leaderboardData={combined}
        calendar={state.calendar}
        subjects={state.subjects}
        dayKey={state.dayKey}
        onAddExam={addExam}
        onRemoveExam={removeExam}
        notesData={state.notesData}
        activeSubjectKey={state.activeSubject}
        onAddNote={addNoteItem}
        onDeleteNote={deleteNoteItem}
        onUpdateNoteItem={updateNoteItem}
        onTogglePin={togglePinNote}
        onToggleTag={toggleTagNote}
      />
    );
  }

  function renderParty() {
    return <PartyViewer party={state.partyRoster} />;
  }

  function renderShop() {
    if (!accountProfile) {
      return null;
    }

    return <ShopUI userProfile={accountProfile} onPurchase={handleShopPurchase} />;
  }

  function renderAchievements() {
    return (
      <AchievementsPage
        achievements={state.achievements}
        subjects={state.subjects}
        quiz={state.quiz}
        flashcards={state.flashcards}
        streak={state.streak}
      />
    );
  }

  function renderFlashcards() {
    return (
      <FlashcardsPage
        state={state}
        activeSet={activeSet}
        flashSession={flashSession}
        newSetTitle={newSetTitle}
        newCardQuestion={newCardQuestion}
        newCardAnswer={newCardAnswer}
        newCardChoices={newCardChoices}
        editingCardId={editingCardId}
        studyFilter={studyFilter}
        onSetNewSetTitle={setNewSetTitle}
        onSetNewCardQuestion={setNewCardQuestion}
        onSetNewCardAnswer={setNewCardAnswer}
        onSetNewCardChoices={setNewCardChoices}
        onSetEditingCardId={setEditingCardId}
        onSetStudyFilter={setStudyFilter}
        onAddFlashcardSet={addFlashcardSet}
        onSelectSet={(setId) => setState((current) => ({ ...current, flashcards: { ...current.flashcards, activeSetId: setId } }))}
        onDeleteSet={deleteFlashcardSet}
        onAddFlashcardCard={addFlashcardCard}
        onDeleteCard={deleteFlashcardCard}
        onUpdateCard={updateFlashcardCard}
        onStartFlashcardSession={startFlashcardSession}
        onStartFiltered={startFlashcardSessionFiltered}
        onAnswerFlashcard={answerFlashcard}
        onAnswerOpenFlashcard={answerOpenFlashcard}
        onRateFlashcard={rateFlashcard}
        onNextFlashcard={nextFlashcard}
        onImportCards={importCards}
        onExportCards={exportCards}
        onImportFromText={importCardsFromText}
      />
    );
  }

  function renderQuiz() {
    return (
      <QuizBattlePage
        quizSession={quizSession}
        quizQuestion={quizQuestion}
        quizState={state.quiz}
        accuracy={accuracy}
        onStartQuizBattle={startQuizBattle}
        onStartSpeedRun={startSpeedRun}
        onAnswerQuiz={answerQuiz}
        onAnswerOpenQuestion={answerOpenQuestion}
        onUseFiftyFifty={useFiftyFifty}
        onUseExtraTime={useExtraTime}
        onUseDefend={useDefend}
        onUseHeal={useHeal}
        onUsePotion={usePotion}
        customQuizSets={customQuizSets}
        activeCustomSet={activeCustomSet}
        onCreateCustomQuizSet={createCustomQuizSet}
        onAddCustomQuizQuestion={addCustomQuizQuestion}
        onSelectCustomQuizSet={selectCustomQuizSet}
        partyRoster={state.partyRoster}
      />
    );
  }

  function renderCustomization() {
    return (
      <CustomizationPage
        profile={state.profile}
        petProfile={state.petProfile}
        avatarClasses={AVATAR_CLASSES}
        hairStyles={HAIR_STYLES}
        outfitStyles={OUTFIT_STYLES}
        petSpecies={PET_SPECIES}
        petColors={PET_COLORS}
        petAuras={PET_AURAS}
        onUpdateAvatarField={updateAvatarField}
        onUpdatePetField={updatePetField}
      />
    );
  }

  function renderAnalytics() {
    return (
      <AnalyticsPage
        season={state.season}
        accuracy={accuracy}
        quiz={state.quiz}
        petProfile={state.petProfile}
        activeSubject={activeSubject}
        flashcardSets={state.flashcards.sets}
        streak={state.streak}
      />
    );
  }

  function renderPracticeTest() {
    return (
      <PracticeTestPage
        flashcardSets={state.flashcards.sets}
        dayKey={state.dayKey}
      />
    );
  }

  function renderProgress() {
    return (
      <ProgressPage
        state={state}
        subjects={state.subjects}
        flashcardSets={state.flashcards.sets}
        quizState={state.quiz}
        streak={state.streak}
        sessionHistory={state.sessionHistory ?? []}
      />
    );
  }

  function renderPlanner() {
    return (
      <PlannerPage
        planner={state.planner}
        plannerCompletion={plannerCompletion}
        plannerDraft={plannerDraft}
        onSetPlannerDraft={setPlannerDraft}
        onAddPlannerMission={addPlannerMission}
        onToggleMissionStatus={toggleMissionStatus}
        onDeletePlannerMission={deletePlannerMission}
      />
    );
  }

  function renderProfile() {
    return (
      <ProfilePage
        userProfile={accountProfile}
        onUpdateProfile={updateUserProfile}
        onLogout={logout}
        onExportBackup={exportBackup}
        onImportBackup={importBackup}
        importFileRef={importFileRef}
        subjects={state.subjects}
        state={state}
      />
    );
  }

  // eslint-disable-next-line no-unreachable
  function renderActiveView() {
    if (state.ui.activeView === "profile") {
      return renderProfile();
    }

    if (state.ui.activeView === "party") {
      return renderParty();
    }

    if (state.ui.activeView === "shop") {
      return renderShop();
    }

    if (state.ui.activeView === "achievements") {
      return renderAchievements();
    }

    if (state.ui.activeView === "flashcards") {
      return renderFlashcards();
    }

    if (state.ui.activeView === "quiz") {
      return renderQuiz();
    }

    if (state.ui.activeView === "customize") {
      return renderCustomization();
    }

    if (state.ui.activeView === "analytics") {
      return renderAnalytics();
    }

    if (state.ui.activeView === "practicetest") {
      return renderPracticeTest();
    }

    if (state.ui.activeView === "progress") {
      return renderProgress();
    }

    if (state.ui.activeView === "planner") {
      return renderPlanner();
    }

    return renderDashboard();
  }

  if (isLoading) {
    return <div className="app-shell"><main className="dashboard-shell"><div className="panel">Loading...</div></main></div>;
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLogin={login}
        onSignup={signup}
        onRequestPasswordReset={requestPasswordReset}
        onResendVerification={resendVerification}
        error={authError}
        info={authInfo}
        backendEnabled={backendEnabled}
      />
    );
  }

  return (
    <div className={`app-shell ${state.ui.sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <SidebarNav
        activeView={state.ui.activeView}
        seasonTitle={state.season.title}
        onSetActiveView={setActiveView}
        collapsed={Boolean(state.ui.sidebarCollapsed)}
        onToggleCollapse={toggleSidebar}
        currentTheme={currentTheme}
        onPickTheme={handleProfileThemePick}
        onAutoTheme={useAutomaticTheme}
        onLogout={logout}
        syncStatus={syncStatus}
        backendEnabled={backendEnabled}
        onRetrySync={retrySync}
      />

      <main
        className={`dashboard-shell feature-shell theme-${currentTheme} ${state.settings.highContrast ? "a11y-high-contrast" : ""} ${state.settings.largeText ? "a11y-large-text" : ""} ${state.settings.reducedMotion ? "a11y-reduced-motion" : ""}`}
        style={{ "--anim-scale": state.settings.reducedMotion ? 0.2 : 1, ...themeVars }}
      >
        <Confetti active={showConfetti} />
        {showFullscreenTimer ? (
          <Suspense fallback={null}>
            <FullscreenTimer
              timer={state.timer}
              manaPercent={manaPercent}
              formatTime={formatTime}
              onToggleTimer={toggleTimer}
              onResetTimer={resetTimer}
              onClose={maximizeTimer}
              activeSubject={activeSubject}
            />
          </Suspense>
        ) : null}
        {rewardToast ? <div className="global-toast">{rewardToast}</div> : null}
        {!isOnline ? <div className="global-toast">You are offline. Changes will sync when connection returns.</div> : null}
        {queuedOffline ? <div className="global-toast">Cloud save queued. It will upload automatically once online.</div> : null}
        {sessionExpired ? <div className="global-toast">Session expired. Please login again.</div> : null}
        {backendEnabled && syncError ? <div className="global-toast">Cloud issue: {syncError}</div> : null}
        <Suspense fallback={<section className="panel">Loading section...</section>}>
          {renderActiveView()}
        </Suspense>
        {showTutorial ? (
          <Suspense fallback={null}>
            <TutorialOverlay
              party={state.partyRoster}
              onComplete={handleTutorialComplete}
              onSkip={handleTutorialSkip}
            />
          </Suspense>
        ) : null}
      </main>
    </div>
  );
}

export default App;
