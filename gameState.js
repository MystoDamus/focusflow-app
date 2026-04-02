const STORAGE_KEY = "focusflow-guild-v5";

const SUBJECT_PRESETS = [
  {
    key: "alchemy",
    name: "Alchemy",
    pet: "🐉",
    bossName: "Catalyst Hydra",
    focusMinutes: 25,
    breakMinutes: 5,
    theme: "arcane",
    examLabel: "Lab Practical",
  },
  {
    key: "chronicles",
    name: "Chronicles",
    pet: "🦉",
    bossName: "Archive Warden",
    focusMinutes: 40,
    breakMinutes: 10,
    theme: "obsidian",
    examLabel: "Essay Defense",
  },
  {
    key: "mechanics",
    name: "Mechanics",
    pet: "🦊",
    bossName: "Iron Colossus",
    focusMinutes: 50,
    breakMinutes: 10,
    theme: "ember",
    examLabel: "Problem Marathon",
  },
];

const EVENT_POOL = [
  {
    id: "double-xp",
    title: "Double XP Friday",
    detail: "Practice and explain quests gain +25% XP.",
    xpMultiplier: 1.25,
    shardMultiplier: 1,
    boostedTypes: ["practice", "explain"],
  },
  {
    id: "boss-rush",
    title: "Boss Rush",
    detail: "Boss quests deal +30 boss damage and give +4 shards.",
    xpMultiplier: 1,
    shardMultiplier: 1.2,
    boostedTypes: ["boss"],
  },
  {
    id: "recovery-day",
    title: "Recovery Day",
    detail: "Review quests refresh mana and reduce fatigue faster.",
    xpMultiplier: 1,
    shardMultiplier: 1,
    boostedTypes: ["review"],
  },
  {
    id: "steady-flame",
    title: "Steady Flame",
    detail: "First completed quest gives a streak shield if you miss tomorrow.",
    xpMultiplier: 1.1,
    shardMultiplier: 1,
    boostedTypes: ["practice", "review", "explain", "boss"],
  },
];

const SHOP_ITEMS = [
  { id: "xp-tonic", label: "XP Tonic", cost: 18, type: "boost" },
  { id: "streak-shield", label: "Streak Shield", cost: 28, type: "shield" },
  { id: "theme-obsidian", label: "Obsidian Theme", cost: 40, type: "theme", value: "obsidian" },
  { id: "theme-ember", label: "Emberforge Theme", cost: 40, type: "theme", value: "ember" },
  { id: "pet-crystal", label: "Crystal Pet Skin", cost: 55, type: "pet", value: "crystal" },
];

const PARTY_MEMBERS = [
  { name: "Rin", role: "Strategist" },
  { name: "Mako", role: "Solver" },
  { name: "Iris", role: "Explainer" },
];

const BASE_TEMPLATES = {
  alchemy: [
    { id: "flash-vials", title: "Review reaction flashcards", type: "review", difficulty: "easy" },
    { id: "formula-cauldron", title: "Solve 8 stoichiometry drills", type: "practice", difficulty: "medium" },
    { id: "teach-mixture", title: "Explain equilibrium aloud", type: "explain", difficulty: "medium" },
    { id: "boss-lab", title: "Complete a timed lab synthesis set", type: "boss", difficulty: "boss" },
  ],
  chronicles: [
    { id: "timeline", title: "Rebuild one timeline from memory", type: "review", difficulty: "easy" },
    { id: "source-compare", title: "Compare two primary sources", type: "practice", difficulty: "medium" },
    { id: "teach-era", title: "Teach one era in simple language", type: "explain", difficulty: "medium" },
    { id: "boss-essay", title: "Write a timed thesis response", type: "boss", difficulty: "boss" },
  ],
  mechanics: [
    { id: "formula-recall", title: "Do one formula recall pass", type: "review", difficulty: "easy" },
    { id: "problem-chain", title: "Solve 12 mixed mechanics problems", type: "practice", difficulty: "medium" },
    { id: "teach-force", title: "Explain force diagrams aloud", type: "explain", difficulty: "medium" },
    { id: "boss-mock", title: "Finish a timed mock mechanics set", type: "boss", difficulty: "boss" },
  ],
};

const DIFFICULTY_VALUES = {
  easy: { xp: 16, bossDamage: 8, shards: 2 },
  medium: { xp: 26, bossDamage: 16, shards: 4 },
  boss: { xp: 42, bossDamage: 34, shards: 8 },
};

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  ambientEnabled: false,
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  ambientMode: "library",
  notificationsEnabled: false,
};

const DEFAULT_GUILD = {
  prestigeLevel: 0,
  totalShards: 0,
  revivalTokens: 0,
};

const MAX_TIMER_RECOVERY_SECONDS = 8 * 60 * 60;

function loadState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDayKey(dayKey) {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function diffDayKeys(laterDayKey, earlierDayKey) {
  return Math.round((parseDayKey(laterDayKey) - parseDayKey(earlierDayKey)) / (24 * 60 * 60 * 1000));
}

function hashString(input) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash) + 1;
}

function seededRandom(seed) {
  let value = seed;

  return () => {
    value += 0x6d2b79f5;
    let temp = value;
    temp = Math.imul(temp ^ (temp >>> 15), temp | 1);
    temp ^= temp + Math.imul(temp ^ (temp >>> 7), temp | 61);
    return ((temp ^ (temp >>> 14)) >>> 0) / 4294967296;
  };
}

const BOSS_TYPES = ["shadow", "golem", "dragon", "specter", "titan"];

function getBossType(name, prestige) {
  return BOSS_TYPES[(hashString(name) + prestige) % BOSS_TYPES.length];
}

function getDailyEvent(dayKey) {
  return EVENT_POOL[hashString(dayKey) % EVENT_POOL.length];
}

function makeBoss(subject, prestigeRank = 0) {
  const bonus = prestigeRank * 30;
  return {
    name: subject.bossName,
    hp: 120 + bonus,
    maxHp: 120 + bonus,
    phase: 1 + prestigeRank,
    type: getBossType(subject.bossName, prestigeRank),
  };
}

function applyXp(progress, xpGained) {
  const total = progress.xp + xpGained;
  const levelGain = Math.floor(total / 100);

  return {
    ...progress,
    xp: total % 100,
    level: progress.level + levelGain,
    totalXp: progress.totalXp + xpGained,
    leveledUp: levelGain > 0,
  };
}

function applyPetXp(pet, gained) {
  let nextXp = pet.xp + gained;
  let nextLevel = pet.level;

  while (nextXp >= 100) {
    nextXp -= 100;
    nextLevel += 1;
  }

  let evolution = pet.evolution;
  if (nextLevel >= 15) {
    evolution = "Guardian";
  } else if (nextLevel >= 7) {
    evolution = "Companion";
  }

  return {
    ...pet,
    xp: nextXp,
    level: nextLevel,
    evolution,
  };
}

function buildQuest(template, dayKey, index, event, custom = false) {
  const values = DIFFICULTY_VALUES[template.difficulty];
  const eventBoost = event.boostedTypes.includes(template.type) ? event.xpMultiplier : 1;

  return {
    id: `${dayKey}-${template.id}-${index}`,
    title: template.title,
    type: template.type,
    difficulty: template.difficulty,
    xpReward: Math.round(values.xp * eventBoost),
    shardsReward: Math.round(values.shards * event.shardMultiplier),
    bossDamage: values.bossDamage + (event.id === "boss-rush" && template.type === "boss" ? 30 : 0),
    completed: false,
    custom,
    requiresId: null,
  };
}

function generateDailyQuests(subjectKey, customTemplates, dayKey, event) {
  const random = seededRandom(hashString(`${subjectKey}-${dayKey}`));
  const base = [...BASE_TEMPLATES[subjectKey], ...customTemplates];
  const chosen = [];

  while (chosen.length < Math.min(5, base.length)) {
    const candidate = base[Math.floor(random() * base.length)];
    if (!chosen.find((entry) => entry.id === candidate.id)) {
      chosen.push(candidate);
    }
  }

  const quests = chosen.map((template, index) => buildQuest(template, dayKey, index, event, Boolean(template.custom)));

  const practiceQuest = quests.find((quest) => quest.type === "practice");
  const explainQuest = quests.find((quest) => quest.type === "explain");
  if (practiceQuest && explainQuest) {
    explainQuest.requiresId = practiceQuest.id;
    explainQuest.xpReward += 8;
  }

  return quests;
}

function buildInitialSubject(subject, dayKey, event) {
  return {
    key: subject.key,
    name: subject.name,
    pet: subject.pet,
    theme: subject.theme,
    focusMinutes: subject.focusMinutes,
    breakMinutes: subject.breakMinutes,
    examLabel: subject.examLabel,
    progress: {
      level: 1,
      xp: 0,
      totalXp: 0,
      questsCleared: 0,
      focusCycles: 0,
      bossVictories: 0,
      prestigeRank: 0,
      shards: 0,
      streakShield: 0,
      xpTonics: 0,
      petSkin: "base",
      ownedThemes: [subject.theme],
    },
    boss: makeBoss(subject, 0),
    quests: generateDailyQuests(subject.key, [], dayKey, event),
    customTemplates: [],
    revisionDeck: [],
    journal: [],
    semesterGoal: {
      label: subject.examLabel,
      targetSessions: 24,
      completedSessions: 0,
      examDate: "2026-06-15",
    },
    history: [],
  };
}

function buildPartyBoard(dayKey) {
  const random = seededRandom(hashString(`party-${dayKey}`));
  const members = PARTY_MEMBERS.map((member) => ({
    ...member,
    quests: 2 + Math.floor(random() * 5),
    mood: random() > 0.5 ? "Focused" : "Resting",
  }));

  return {
    weeklyTarget: 36,
    members,
  };
}

function getTimerDuration(subject, mode) {
  return (mode === "focus" ? subject.focusMinutes : subject.breakMinutes) * 60;
}

function resolveCompletedTimerPhase(subject, subjectPreset, mode) {
  const nextSubject = {
    ...subject,
    progress: {
      ...subject.progress,
    },
    semesterGoal: {
      ...subject.semesterGoal,
    },
    boss: {
      ...subject.boss,
    },
  };

  let bossDefeated = false;
  const defeatedBossName = subject.boss.name;

  if (mode === "focus") {
    nextSubject.progress.focusCycles += 1;
    nextSubject.semesterGoal.completedSessions += 1;
    nextSubject.boss.hp = Math.max(0, nextSubject.boss.hp - 10);
  }

  if (mode === "break") {
    nextSubject.progress.xpTonics += 1;
  }

  if (nextSubject.boss.hp === 0) {
    bossDefeated = true;
    nextSubject.progress.bossVictories += 1;
    nextSubject.progress.shards += 12;
    nextSubject.boss = makeBoss(subjectPreset, nextSubject.progress.prestigeRank);
  }

  return {
    subject: nextSubject,
    bossDefeated,
    defeatedBossName,
  };
}

function advanceRunningTimer(state, elapsedSeconds) {
  if (!state.timer.isRunning || !state.timer.lastTickAt || elapsedSeconds <= 0) {
    return { state, recoveredSeconds: 0 };
  }

  const safeElapsed = Math.min(elapsedSeconds, MAX_TIMER_RECOVERY_SECONDS);
  let remaining = safeElapsed;
  const nextState = {
    ...state,
    timer: {
      ...state.timer,
    },
    subjects: {
      ...state.subjects,
    },
  };
  let transitions = 0;

  while (remaining >= nextState.timer.secondsLeft && transitions < 128) {
    remaining -= nextState.timer.secondsLeft;
    const activeSubject = nextState.subjects[nextState.activeSubject];
    const subjectPreset = SUBJECT_PRESETS.find((entry) => entry.key === nextState.activeSubject) ?? SUBJECT_PRESETS[0];
    const phaseResult = resolveCompletedTimerPhase(activeSubject, subjectPreset, nextState.timer.mode);
    const nextMode = nextState.timer.mode === "focus" ? "break" : "focus";

    nextState.subjects[nextState.activeSubject] = phaseResult.subject;
    nextState.timer = {
      ...nextState.timer,
      mode: nextMode,
      secondsLeft: getTimerDuration(phaseResult.subject, nextMode),
      lastTickAt: Date.now(),
    };
    transitions += 1;
  }

  nextState.timer = {
    ...nextState.timer,
    secondsLeft: Math.max(1, nextState.timer.secondsLeft - remaining),
    lastTickAt: Date.now(),
  };

  return {
    state: nextState,
    recoveredSeconds: safeElapsed,
  };
}

function hydrateState(saved) {
  const today = getDayKey();
  const event = getDailyEvent(today);

  if (!saved) {
    const subjects = SUBJECT_PRESETS.reduce((accumulator, subject) => {
      accumulator[subject.key] = buildInitialSubject(subject, today, event);
      return accumulator;
    }, {});

    return {
      activeSubject: SUBJECT_PRESETS[0].key,
      dayKey: today,
      event,
      timer: {
        mode: "focus",
        secondsLeft: SUBJECT_PRESETS[0].focusMinutes * 60,
        isRunning: false,
        lastTickAt: null,
      },
      party: buildPartyBoard(today),
      settings: { ...DEFAULT_SETTINGS },
      guild: { ...DEFAULT_GUILD },
      subjects,
      recoveredSeconds: 0,
    };
  }

  const activeSubjectKey = SUBJECT_PRESETS.some((entry) => entry.key === saved.activeSubject)
    ? saved.activeSubject
    : SUBJECT_PRESETS[0].key;

  const nextState = {
    ...saved,
    activeSubject: activeSubjectKey,
    event,
    dayKey: today,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(saved.settings ?? {}),
    },
    guild: {
      ...DEFAULT_GUILD,
      ...(saved.guild ?? {}),
    },
    party: saved.party ?? buildPartyBoard(today),
    timer: {
      mode: "focus",
      secondsLeft: ((SUBJECT_PRESETS.find((entry) => entry.key === activeSubjectKey)?.focusMinutes) ?? SUBJECT_PRESETS[0].focusMinutes) * 60,
      isRunning: false,
      lastTickAt: null,
      ...(saved.timer ?? {}),
    },
    subjects: {},
    recoveredSeconds: 0,
  };

  SUBJECT_PRESETS.forEach((subject) => {
    const fallback = buildInitialSubject(subject, today, event);
    const current = saved.subjects?.[subject.key];
    nextState.subjects[subject.key] = {
      ...fallback,
      ...(current ?? {}),
      progress: {
        ...fallback.progress,
        ...(current?.progress ?? {}),
      },
      semesterGoal: {
        ...fallback.semesterGoal,
        ...(current?.semesterGoal ?? {}),
      },
      boss: {
        ...fallback.boss,
        ...(current?.boss ?? {}),
      },
      customTemplates: current?.customTemplates ?? fallback.customTemplates,
      quests: current?.quests ?? fallback.quests,
      revisionDeck: current?.revisionDeck ?? fallback.revisionDeck,
      journal: current?.journal ?? fallback.journal,
      history: current?.history ?? fallback.history,
    };
  });

  if (saved.dayKey !== today) {
    nextState.party = buildPartyBoard(today);

    SUBJECT_PRESETS.forEach((subject) => {
      const current = nextState.subjects[subject.key];
      const streakGap = current.journal[0] ? diffDayKeys(today, current.journal[0].dayKey) : 0;

      if (streakGap > 1 && current.progress.streakShield > 0) {
        current.progress.streakShield -= 1;
      }

      current.quests = generateDailyQuests(subject.key, current.customTemplates ?? [], today, event);
    });
  }

  const recovered = advanceRunningTimer(
    nextState,
    nextState.timer.isRunning && nextState.timer.lastTickAt
      ? Math.floor((Date.now() - nextState.timer.lastTickAt) / 1000)
      : 0,
  );

  return {
    ...recovered.state,
    recoveredSeconds: recovered.recoveredSeconds,
  };
}

function buildInitialState() {
  return hydrateState(loadState());
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getReviewUrgency(dayKey, dueDay) {
  const difference = diffDayKeys(dayKey, dueDay);
  if (difference >= 0) return "due";
  if (difference === -1) return "next";
  return "later";
}

function getActiveTheme(subject, settings) {
  if (settings.highContrast) {
    return subject.theme;
  }

  return subject.progress.ownedThemes.includes(subject.theme)
    ? subject.theme
    : subject.progress.ownedThemes[0] ?? subject.theme;
}

function getPartyContribution(party) {
  return party.members.reduce((sum, member) => sum + member.quests, 0);
}

const DAILY_QUOTES = [
  "The expert in anything was once a beginner.",
  "Focus is the art of knowing what to ignore.",
  "Small daily improvements lead to stunning results.",
  "You don't have to be great to start, but you have to start to be great.",
  "A little progress each day adds up to big results.",
  "The beautiful thing about learning is nobody can take it away from you.",
  "An investment in knowledge pays the best interest.",
  "Comfort is the enemy of achievement.",
  "Don't count the days, make the days count.",
  "Discipline is choosing between what you want now and what you want most.",
  "The more that you read, the more things you will know.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Great things never come from comfort zones.",
  "Do something today that your future self will thank you for.",
  "Work hard in silence; let success be the noise.",
  "Push yourself because no one else is going to do it for you.",
  "Dream it. Wish it. Do it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Don't stop when you're tired. Stop when you're done.",
  "Little things make big days.",
];

function getDailyQuote(dayKey) {
  return DAILY_QUOTES[hashString(dayKey) % DAILY_QUOTES.length];
}

const DAILY_TIPS = [
  "Spaced repetition is 3× more effective than re-reading the same material.",
  "Test yourself instead of rereading — retrieval practice beats passive study.",
  "The Pomodoro method creates urgency that boosts single-task focus.",
  "Explaining topics aloud reveals gaps that silent reading hides.",
  "Interleave subjects — mixing topics strengthens long-term retention.",
  "Summarise in your own words, not verbatim from the source.",
  "Studying at the same time daily trains your brain's focus circuit.",
  "Desirable difficulty is productive — struggle strengthens memory traces.",
  "Sleep on new material — consolidation happens during deep sleep.",
  "Anchor abstract concepts to vivid concrete examples you know well.",
  "First review should happen within 24 hours of initial learning.",
  "Avoid multitasking — single-task focus triples learning efficiency.",
  "Link new information to something you already know extremely well.",
  "Short daily sessions beat marathon cramming sessions every time.",
  "Teach it to someone else; if you can't explain it, you don't know it.",
  "Exercise before studying — it floods your brain with neurotrophic factors.",
  "Make learning meaningful — attach personal significance to each topic.",
  "Review active recall cards before sleep to consolidate them overnight.",
  "Break complex topics into the smallest possible pieces before reassembling.",
  "The 2-minute rule: confusion dissolves once you just start for 2 minutes.",
  "Distributed practice over multiple days beats single massed sessions.",
  "Forgetting is not failure — the struggle to recall strengthens memory.",
];

function getDailyTip(dayKey) {
  return DAILY_TIPS[(hashString(dayKey) + 7) % DAILY_TIPS.length];
}

function isConsecutiveDay(earlierDayKey, laterDayKey) {
  if (!earlierDayKey || !laterDayKey) return false;
  return diffDayKeys(laterDayKey, earlierDayKey) === 1;
}

export {
  DIFFICULTY_VALUES,
  SHOP_ITEMS,
  STORAGE_KEY,
  SUBJECT_PRESETS,
  applyPetXp,
  applyXp,
  buildInitialState,
  getDailyQuote,
  getDailyTip,
  isConsecutiveDay,
  formatTime,
  generateDailyQuests,
  getActiveTheme,
  getDayKey,
  getPartyContribution,
  getReviewUrgency,
  getTimerDuration,
  hydrateState,
  makeBoss,
  parseDayKey,
  resolveCompletedTimerPhase,
};
