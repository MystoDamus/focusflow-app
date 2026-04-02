/**
 * Party System: Manages party member progression, roles, and affinity
 * Each party member levels independently based on activity type they participate in
 */

// Party member base data
export const PARTY_ROLES = {
  TANK: "Tank",
  HEALER: "Healer",
  DPS: "DPS",
  MAGE: "Mage",
  SUPPORT: "Support",
};

export const PARTY_MEMBERS_BASE = [
  {
    id: "member_scholar",
    name: "Rin",
    role: PARTY_ROLES.MAGE,
    class: "Scholar",
    description: "A wise mage proficient in arcane arts",
    baseHp: 45,
    baseAtk: 18,
    baseDef: 10,
    baseSpd: 16,
  },
  {
    id: "member_strategist",
    name: "Mako",
    role: PARTY_ROLES.TANK,
    class: "Strategist",
    description: "A tactical warrior with a sturdy shield",
    baseHp: 80,
    baseAtk: 14,
    baseDef: 22,
    baseSpd: 12,
  },
  {
    id: "member_alchemist",
    name: "Iris",
    role: PARTY_ROLES.HEALER,
    class: "Alchemist",
    description: "A skilled healer and potion master",
    baseHp: 50,
    baseAtk: 12,
    baseDef: 14,
    baseSpd: 14,
  },
  {
    id: "member_engineer",
    name: "Kex",
    role: PARTY_ROLES.DPS,
    class: "Engineer",
    description: "A gadget expert with precise aim",
    baseHp: 55,
    baseAtk: 24,
    baseDef: 12,
    baseSpd: 18,
  },
];

/**
 * Activity affinity - which roles benefit most from each activity
 */
export const ACTIVITY_AFFINITY = {
  bossBattle: {
    [PARTY_ROLES.TANK]: 1.5, // Tanks love boss battles
    [PARTY_ROLES.DPS]: 1.4,
    [PARTY_ROLES.HEALER]: 1.2,
    [PARTY_ROLES.MAGE]: 1.1,
    [PARTY_ROLES.SUPPORT]: 1.0,
  },
  travelling: {
    [PARTY_ROLES.MAGE]: 1.5, // Mages excel at travelling
    [PARTY_ROLES.SUPPORT]: 1.3,
    [PARTY_ROLES.DPS]: 1.1,
    [PARTY_ROLES.TANK]: 1.0,
    [PARTY_ROLES.HEALER]: 1.2,
  },
  gathering: {
    [PARTY_ROLES.SUPPORT]: 1.4, // Support finds resources easily
    [PARTY_ROLES.HEALER]: 1.2,
    [PARTY_ROLES.MAGE]: 1.1,
    [PARTY_ROLES.TANK]: 1.0,
    [PARTY_ROLES.DPS]: 0.9,
  },
  focus: {
    [PARTY_ROLES.MAGE]: 1.3, // Mages meditate well
    [PARTY_ROLES.HEALER]: 1.3,
    [PARTY_ROLES.SUPPORT]: 1.2,
    [PARTY_ROLES.DPS]: 1.0,
    [PARTY_ROLES.TANK]: 1.1,
  },
};

/**
 * Create initial party member with base stats
 */
export function createPartyMember(baseData) {
  return {
    ...baseData,
    level: 1,
    xp: 0,
    totalXp: 0,
    currentHp: baseData.baseHp,
    maxHp: baseData.baseHp,
    // Stats after leveling
    hp: baseData.baseHp,
    atk: baseData.baseAtk,
    def: baseData.baseDef,
    spd: baseData.baseSpd,
    // Cosmetics
    skin: "default",
    skinColor: "default",
    personalityTrait: "Focused",
    isActive: true,
    activityStats: {
      bossBattlesParticipated: 0,
      travellingSessionsCompleted: 0,
      gatheringSessionsCompleted: 0,
      focusSessionsCompleted: 0,
    },
  };
}

/**
 * Apply XP to party member and handle level-ups
 */
export function applyPartyMemberXp(member, xpGained, activityType = "bossBattle") {
  const affinity = ACTIVITY_AFFINITY[activityType]?.[member.role] || 1.0;
  const adjustedXp = Math.round(xpGained * affinity);

  let nextLevel = member.level;
  let nextXp = member.xp + adjustedXp;
  let nextTotalXp = member.totalXp + adjustedXp;

  // Level up threshold is 100 XP per level
  while (nextXp >= 100) {
    nextXp -= 100;
    nextLevel += 1;
  }

  // Calculate stat growth per level (scales with level)
  const statGrowth = nextLevel - member.level;
  const hpGrowth = Math.floor(5 * statGrowth + (member.baseHp * statGrowth) / 20);
  const atkGrowth = Math.floor(2 * statGrowth + (member.baseAtk * statGrowth) / 25);
  const defGrowth = Math.floor(1.5 * statGrowth + (member.baseDef * statGrowth) / 30);
  const spdGrowth = Math.floor(1 * statGrowth + (member.baseSpd * statGrowth) / 35);

  return {
    ...member,
    level: nextLevel,
    xp: nextXp,
    totalXp: nextTotalXp,
    hp: member.hp + hpGrowth,
    atk: member.atk + atkGrowth,
    def: member.def + defGrowth,
    spd: member.spd + spdGrowth,
    maxHp: member.maxHp + hpGrowth,
    currentHp: Math.min(member.currentHp + hpGrowth, member.maxHp + hpGrowth),
    leveledUp: nextLevel > member.level,
  };
}

/**
 * Create initial party (all 4 members at level 1)
 */
export function createInitialParty() {
  return PARTY_MEMBERS_BASE.map((baseData) => createPartyMember(baseData));
}

/**
 * Update party member activity stats
 */
export function updatePartyMemberActivity(member, activityType) {
  const key = {
    bossBattle: "bossBattlesParticipated",
    travelling: "travellingSessionsCompleted",
    gathering: "gatheringSessionsCompleted",
    focus: "focusSessionsCompleted",
  }[activityType];

  if (!key) return member;

  return {
    ...member,
    activityStats: {
      ...member.activityStats,
      [key]: member.activityStats[key] + 1,
    },
  };
}

/**
 * Heal party member back to max HP
 */
export function healPartyMember(member, amount = null) {
  const healAmount = amount !== null ? amount : member.maxHp;
  return {
    ...member,
    currentHp: Math.min(member.currentHp + healAmount, member.maxHp),
  };
}

/**
 * Damage party member
 */
export function damagePartyMember(member, damage) {
  return {
    ...member,
    currentHp: Math.max(0, member.currentHp - damage),
  };
}

/**
 * Get party average level
 */
export function getPartyAverageLevel(party) {
  if (!party || party.length === 0) return 1;
  const total = party.reduce((sum, member) => sum + member.level, 0);
  return Math.floor(total / party.length);
}

/**
 * Get party formation string (e.g., "Mako (Tank), Rin (Mage), Iris (Healer), Kex (DPS)")
 */
export function getPartyFormation(party) {
  return party.map((m) => `${m.name} (${m.role})`).join(", ");
}

/**
 * Calculate party battle power (used for difficulty scaling)
 */
export function getPartyBattlePower(party) {
  if (!party || party.length === 0) return 0;
  return party.reduce((sum, member) => {
    const statTotal = member.hp + member.atk + member.def + member.spd;
    return sum + statTotal + member.level * 10;
  }, 0);
}

/**
 * Get party composition summary
 */
export function getPartyComposition(party) {
  const roles = {};
  party.forEach((member) => {
    roles[member.role] = (roles[member.role] || 0) + 1;
  });
  return roles;
}
