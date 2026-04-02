/**
 * Activity Modes System
 * Defines the 4 main activity types and their mechanics
 */

export const MODES = {
  BOSS_BATTLE: "bossBattle",
  TRAVELLING: "travelling",
  GATHERING: "gathering",
  FOCUS: "focus",
};

/**
 * Boss Battle Mode - Fight enemies with quiz questions/tasks
 * Correct answer = damage enemy, Wrong = take damage
 */
export const BossBattleMode = {
  id: MODES.BOSS_BATTLE,
  name: "Boss Battle",
  description: "Face off against powerful foes through challenging tasks",
  icon: "⚔️",
  rewardType: "xp_gold",
  mechanics: {
    hasHealth: true,
    hasDefend: true,
    hasHeal: true,
    hasAttack: true,
    partyParticipation: "full", // All party members fight
    questionType: "mcq_true_false_identification",
  },
  rewards: {
    baseXp: 30,
    baseGold: 25,
    bonusPerLevel: 2,
    shards: 0,
  },
};

/**
 * Travelling Mode - Study flashcards while exploring
 * Longer engagement, medium XP, story progression
 */
export const TravellingMode = {
  id: MODES.TRAVELLING,
  name: "Travelling",
  description: "Venture through lands while studying your deck of knowledge",
  icon: "🧭",
  rewardType: "xp_progression",
  mechanics: {
    hasHealth: false, // No combat in travelling
    hasDefend: false,
    hasHeal: false,
    hasAttack: false,
    partyParticipation: "explorers", // Only explorer-type roles benefit
    questionType: "flashcard",
  },
  rewards: {
    baseXp: 20,
    baseGold: 10,
    storyProgression: 1,
    shards: 0,
  },
};

/**
 * Gathering Mode - Collect resources passively/actively
 * High gold reward, low XP, idle/active gameplay
 */
export const GatheringMode = {
  id: MODES.GATHERING,
  name: "Gathering Supplies",
  description: "Harvest resources and gather supplies for survival",
  icon: "🌾",
  rewardType: "gold_resources",
  mechanics: {
    hasHealth: false,
    hasDefend: false,
    hasHeal: false,
    hasAttack: false,
    partyParticipation: "gatherers", // Support roles excel
    questionType: "timed_collection", // Time-based collection mini-game
  },
  rewards: {
    baseXp: 10,
    baseGold: 50,
    resources: {
      wood: 5,
      stone: 3,
      herbs: 2,
    },
    shards: 0,
  },
};

/**
 * Focus/Meditation Mode - Rest and meditate with focus exercises
 * No XP reward, stamina recovery, party heals
 */
export const FocusMode = {
  id: MODES.FOCUS,
  name: "Focus Ritual",
  description: "Meditate and rest to recover and strengthen bonds",
  icon: "🧘",
  rewardType: "recovery",
  mechanics: {
    hasHealth: false,
    hasDefend: false,
    hasHeal: false,
    hasAttack: false,
    partyParticipation: "resting", // All recover
    questionType: "breathing_exercise",
  },
  rewards: {
    baseXp: 5,
    baseGold: 5,
    staminaRecovery: 100,
    partyHealPercent: 50, // Heal 50% of party max HP
    shards: 0,
  },
};

/**
 * Get mode details by ID
 */
export function getMode(modeId) {
  const modes = {
    [MODES.BOSS_BATTLE]: BossBattleMode,
    [MODES.TRAVELLING]: TravellingMode,
    [MODES.GATHERING]: GatheringMode,
    [MODES.FOCUS]: FocusMode,
  };
  return modes[modeId] || null;
}

/**
 * Get all available modes
 */
export function getAllModes() {
  return [BossBattleMode, TravellingMode, GatheringMode, FocusMode];
}

/**
 * Create active session for a mode
 */
export function createModeSession(modeId, partyId, difficulty = "normal") {
  const mode = getMode(modeId);
  if (!mode) return null;

  return {
    id: `session_${modeId}_${Date.now()}`,
    modeId,
    partyId,
    difficulty, // normal, hard, expert
    startedAt: new Date().toISOString(),
    completedAt: null,
    duration: 0, // In seconds
    progress: 0, // 0-100%
    isActive: true,
    questionIndex: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    xpEarned: 0,
    goldEarned: 0,
    partyStats: {
      totalDamageTaken: 0,
      totalDamageDealt: 0,
      healingUsed: 0,
      defensesUsed: 0,
    },
    results: null, // Populated on completion
  };
}

/**
 * Calculate rewards based on performance
 */
export function calculateModeRewards(session, mode) {
  const accuracy = session.totalQuestions > 0 ? session.correctAnswers / session.totalQuestions : 0;
  const performanceBonus = accuracy > 0.8 ? 1.25 : accuracy > 0.6 ? 1.1 : 1.0;

  let xp = Math.round(mode.rewards.baseXp * performanceBonus);
  let gold = Math.round(mode.rewards.baseGold * performanceBonus);

  // Bonus for perfect or no mistakes
  if (session.wrongAnswers === 0 && session.totalQuestions > 0) {
    xp = Math.round(xp * 1.5);
    gold = Math.round(gold * 1.5);
  }

  return {
    xp,
    gold,
    bonus: performanceBonus,
    accuracy,
  };
}

/**
 * Get mode-specific animation
 */
export function getModeAnimation(modeId) {
  const animations = {
    [MODES.BOSS_BATTLE]: {
      partyPose: "combat",
      background: "battle-arena",
      transitionEffect: "explode-in",
    },
    [MODES.TRAVELLING]: {
      partyPose: "walking",
      background: "road-path",
      transitionEffect: "fade-in",
    },
    [MODES.GATHERING]: {
      partyPose: "collecting",
      background: "forest-clearing",
      transitionEffect: "grow-in",
    },
    [MODES.FOCUS]: {
      partyPose: "meditating",
      background: "sanctuary",
      transitionEffect: "breathe-in",
    },
  };
  return animations[modeId] || animations[MODES.BOSS_BATTLE];
}
