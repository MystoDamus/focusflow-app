/**
 * Shop System: In-game cosmetics, skins, and customization
 * Currency: Gold (earned from activities), Premium Shards (rare drops/premium)
 */

export const SHOP_CATEGORIES = {
  CHARACTER_SKINS: "characterSkins",
  PARTY_FORMATIONS: "partyFormations",
  PETS: "pets",
  EMOTES: "emotes",
  BACKGROUND_THEMES: "backgroundThemes",
  POTIONS: "potions",
  CONSUMABLES: "consumables",
};

export const CURRENCY_TYPES = {
  GOLD: "gold", // Earned from activities
  SHARDS: "shards", // Rare, obtained from boss defeats and events
};

// Character/Party Member Skins
export const CHARACTER_SKINS = [
  {
    id: "skin_scholar_default",
    name: "Scholar (Arcane)",
    memberId: "member_scholar",
    rarity: "common",
    cost: 0,
    currency: CURRENCY_TYPES.GOLD,
    description: "The classic scholarly mage in purple robes",
    theme: "arcane",
    purchasable: true,
    ownable: false, // Starts with this
  },
  {
    id: "skin_scholar_crystal",
    name: "Crystal Sage",
    memberId: "member_scholar",
    rarity: "rare",
    cost: 800,
    currency: CURRENCY_TYPES.GOLD,
    description: "A shimmering mage made of living crystal",
    theme: "crystal",
    purchasable: true,
    ownable: false,
  },
  {
    id: "skin_scholar_shadow",
    name: "Shadow Sage",
    memberId: "member_scholar",
    rarity: "epic",
    cost: 2500,
    currency: CURRENCY_TYPES.GOLD,
    description: "A mysterious sage cloaked in shadows",
    theme: "shadow",
    purchasable: true,
    ownable: false,
  },
  {
    id: "skin_scholar_mystic",
    name: "Mystic Keeper",
    memberId: "member_scholar",
    rarity: "legendary",
    cost: 15,
    currency: CURRENCY_TYPES.SHARDS,
    description: "An ancient keeper of forgotten knowledge",
    theme: "mystic",
    purchasable: true,
    ownable: false,
  },

  // Strategist/Tank skins
  {
    id: "skin_strategist_default",
    name: "Strategist (Steel)",
    memberId: "member_strategist",
    rarity: "common",
    cost: 0,
    currency: CURRENCY_TYPES.GOLD,
    description: "The classic knight in steel armor",
    theme: "steel",
    purchasable: true,
    ownable: false,
  },
  {
    id: "skin_strategist_gold",
    name: "Golden Guardian",
    memberId: "member_strategist",
    rarity: "rare",
    cost: 1000,
    currency: CURRENCY_TYPES.GOLD,
    description: "A noble knight in gleaming gold armor",
    theme: "gold",
    purchasable: true,
    ownable: false,
  },
  {
    id: "skin_strategist_dragonscale",
    name: "Dragonscale Protector",
    memberId: "member_strategist",
    rarity: "epic",
    cost: 3000,
    currency: CURRENCY_TYPES.GOLD,
    description: "Armor forged from legendary dragonscales",
    theme: "dragon",
    purchasable: true,
    ownable: false,
  },

  // Alchemist/Healer skins
  {
    id: "skin_alchemist_default",
    name: "Alchemist (Teal)",
    memberId: "member_alchemist",
    rarity: "common",
    cost: 0,
    currency: CURRENCY_TYPES.GOLD,
    description: "The classic healer in teal robes",
    theme: "teal",
    purchasable: true,
    ownable: false,
  },
  {
    id: "skin_alchemist_grandmaster",
    name: "Grand Alchemist",
    memberId: "member_alchemist",
    rarity: "rare",
    cost: 900,
    currency: CURRENCY_TYPES.GOLD,
    description: "A master of the alchemical arts",
    theme: "golden",
    purchasable: true,
    ownable: false,
  },

  // Engineer/DPS skins
  {
    id: "skin_engineer_default",
    name: "Engineer (Default)",
    memberId: "member_engineer",
    rarity: "common",
    cost: 0,
    currency: CURRENCY_TYPES.GOLD,
    description: "The classic gadget engineer",
    theme: "tech",
    purchasable: true,
    ownable: false,
  },
  {
    id: "skin_engineer_steampunk",
    name: "Steampunk Virtuoso",
    memberId: "member_engineer",
    rarity: "epic",
    cost: 2800,
    currency: CURRENCY_TYPES.GOLD,
    description: "A technician with advanced steam-powered gear",
    theme: "steampunk",
    purchasable: true,
    ownable: false,
  },
];

// Pets/Companions
export const PETS = [
  {
    id: "pet_starter",
    name: "Glowing Orb",
    rarity: "common",
    cost: 0,
    currency: CURRENCY_TYPES.GOLD,
    description: "Your starting companion, a magical floating orb",
    icon: "🔮",
    purchasable: true,
    ownable: false,
  },
  {
    id: "pet_phoenix",
    name: "Phoenix",
    rarity: "epic",
    cost: 3500,
    currency: CURRENCY_TYPES.GOLD,
    description: "A majestic bird that grants bonus XP",
    icon: "🔥",
    bonus: { xp: 0.1 }, // 10% bonus XP
    purchasable: true,
    ownable: false,
  },
  {
    id: "pet_dragon",
    name: "Dragon",
    rarity: "legendary",
    cost: 20,
    currency: CURRENCY_TYPES.SHARDS,
    description: "The most powerful companion, grants all stat bonuses",
    icon: "🐉",
    bonus: { xp: 0.15, gold: 0.15, defense: 5 },
    purchasable: true,
    ownable: false,
  },
];

// Potions and Consumables
export const CONSUMABLES = [
  {
    id: "potion_health_small",
    name: "Minor Health Potion",
    rarity: "common",
    cost: 50,
    currency: CURRENCY_TYPES.GOLD,
    description: "Restores 25% party health",
    effect: { healPercent: 25 },
    quantity: 0, // Player inventory tracking
    maxStack: 99,
  },
  {
    id: "potion_health_large",
    name: "Major Health Potion",
    rarity: "rare",
    cost: 150,
    currency: CURRENCY_TYPES.GOLD,
    description: "Restores 75% party health",
    effect: { healPercent: 75 },
    quantity: 0,
    maxStack: 50,
  },
  {
    id: "potion_xp_boost",
    name: "XP Elixir",
    rarity: "epic",
    cost: 300,
    currency: CURRENCY_TYPES.GOLD,
    description: "Grants 50% XP bonus for next session",
    effect: { xpMultiplier: 1.5, duration: "nextSession" },
    quantity: 0,
    maxStack: 20,
  },
  {
    id: "potion_invincibility",
    name: "Guardian's Blessing",
    rarity: "legendary",
    cost: 25,
    currency: CURRENCY_TYPES.SHARDS,
    description: "Party takes 50% reduced damage for one battle",
    effect: { damageReduction: 0.5, duration: "nextBattle" },
    quantity: 0,
    maxStack: 10,
  },
];

/**
 * Get all shop items in a category
 */
export function getShopItemsByCategory(category) {
  const items = {
    [SHOP_CATEGORIES.CHARACTER_SKINS]: CHARACTER_SKINS,
    [SHOP_CATEGORIES.PETS]: PETS,
    [SHOP_CATEGORIES.CONSUMABLES]: CONSUMABLES,
  };
  return items[category] || [];
}

/**
 * Get item by ID
 */
export function getShopItem(itemId) {
  const allItems = [...CHARACTER_SKINS, ...PETS, ...CONSUMABLES];
  return allItems.find((item) => item.id === itemId);
}

/**
 * Check if player can afford item
 */
export function canAffordItem(item, playerGold, playerShards) {
  if (item.currency === CURRENCY_TYPES.GOLD) {
    return playerGold >= item.cost;
  } else if (item.currency === CURRENCY_TYPES.SHARDS) {
    return playerShards >= item.cost;
  }
  return false;
}

/**
 * Purchase item
 */
export function purchaseItem(item, playerProfile) {
  if (!canAffordItem(item, playerProfile.currency, playerProfile.shards)) {
    return { success: false, error: "Insufficient currency" };
  }

  const updatedProfile = { ...playerProfile };

  if (item.currency === CURRENCY_TYPES.GOLD) {
    updatedProfile.currency -= item.cost;
  } else if (item.currency === CURRENCY_TYPES.SHARDS) {
    updatedProfile.shards -= item.cost;
  }

  // Track owned items
  if (!updatedProfile.ownedItems) {
    updatedProfile.ownedItems = [];
  }

  if (!updatedProfile.ownedItems.includes(item.id)) {
    updatedProfile.ownedItems.push(item.id);
  }

  return {
    success: true,
    updatedProfile,
    message: `Purchased ${item.name}!`,
  };
}

/**
 * Apply equipped skin to party member
 */
export function equipSkin(partyMember, skinId) {
  const skin = CHARACTER_SKINS.find((s) => s.id === skinId);
  if (!skin || skin.memberId !== partyMember.id) {
    return partyMember;
  }

  return {
    ...partyMember,
    skin: skinId,
    skinName: skin.name,
  };
}

/**
 * Get cosmetic details for display
 */
export function getCosmeticDetails(itemId) {
  const item = getShopItem(itemId);
  if (!item) return null;

  return {
    id: item.id,
    name: item.name,
    description: item.description,
    rarity: item.rarity,
    costDisplay: `${item.cost} ${item.currency === CURRENCY_TYPES.GOLD ? "Gold" : "Shards"}`,
  };
}
