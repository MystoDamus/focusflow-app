/**
 * Leaderboard System: Tracks global rankings, mode-specific rankings, and friend rankings
 */

export const LEADERBOARD_TYPES = {
  GLOBAL: "global",
  MODE_SPECIFIC: "modeSpecific",
  FRIENDS: "friends",
  WEEKLY: "weekly",
  SEASONAL: "seasonal",
};

/**
 * Leaderboard entry structure
 */
export function createLeaderboardEntry(userId, userProfile, stats) {
  return {
    userId,
    displayName: userProfile.displayName,
    rank: 0, // Calculated when sorting
    level: stats.partyAverageLevel || 1,
    totalXp: stats.totalXpGained || 0,
    totalQuizzesCompleted: stats.totalQuizzesCompleted || 0,
    totalBossesFought: stats.totalBossesFought || 0,
    currentStreak: stats.currentStreak || 0,
    longestStreak: stats.longestStreak || 0,
    totalPlaytime: stats.totalPlaytime || 0,
    score: calculateLeaderboardScore(stats),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate overall leaderboard score
 * Weighted combination of multiple stats
 */
export function calculateLeaderboardScore(stats) {
  const baseScore = 0;
  const xpScore = (stats.totalXpGained || 0) * 0.5;
  const bossScore = (stats.totalBossesFought || 0) * 100;
  const quizScore = (stats.totalQuizzesCompleted || 0) * 75;
  const streakScore = (stats.currentStreak || 0) * 50;
  const levelScore = (stats.partyAverageLevel || 1) * 200;

  return Math.floor(baseScore + xpScore + bossScore + quizScore + streakScore + levelScore);
}

/**
 * Sort and rank leaderboard entries
 */
export function rankLeaderboardEntries(entries) {
  // Sort by score descending
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  // Assign ranks
  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Mode-specific leaderboard score calculation
 */
export function calculateModeScore(modeStats) {
  const { sessionsCompleted = 0, totalDamageDealt = 0, accuracy = 0, timeSpent = 0 } = modeStats;

  const sessionScore = sessionsCompleted * 50;
  const damageScore = totalDamageDealt * 2;
  const accuracyScore = accuracy * 1000;
  const timeScore = timeSpent / 60; // Convert seconds to minutes

  return Math.floor(sessionScore + damageScore + accuracyScore + timeScore);
}

/**
 * Get global leaderboard (top 100)
 */
export function getGlobalLeaderboard(allEntries, limit = 100) {
  return rankLeaderboardEntries(allEntries).slice(0, limit);
}

/**
 * Get mode-specific leaderboard
 */
export function getModeLeaderboard(modeId, allEntries, limit = 50) {
  const modeEntries = allEntries
    .map((entry) => ({
      ...entry,
      score: entry.modeScores?.[modeId] || 0,
    }))
    .filter((entry) => entry.score > 0);

  return rankLeaderboardEntries(modeEntries).slice(0, limit);
}

/**
 * Get friends leaderboard
 */
export function getFriendsLeaderboard(userId, friendIds, allUserStats) {
  const friendsData = friendIds
    .map((friendId) => allUserStats[friendId])
    .filter((data) => data !== undefined);

  const currentUserData = allUserStats[userId];
  const allData = [currentUserData, ...friendsData];

  return rankLeaderboardEntries(allData);
}

/**
 * Get player rank in leaderboard
 */
export function getPlayerRank(userId, leaderboardEntries) {
  const ranked = rankLeaderboardEntries(leaderboardEntries);
  const entry = ranked.find((e) => e.userId === userId);
  return entry?.rank || null;
}

/**
 * Get nearby players (e.g., top 3 above and below)
 */
export function getNearbyPlayers(userId, allEntries, radius = 3) {
  const ranked = rankLeaderboardEntries(allEntries);
  const playerIndex = ranked.findIndex((e) => e.userId === userId);

  if (playerIndex === -1) return [];

  const start = Math.max(0, playerIndex - radius);
  const end = Math.min(ranked.length, playerIndex + radius + 1);

  return ranked.slice(start, end);
}

/**
 * Calculate weekly leaderboard (reset every Sunday)
 */
export function getWeeklyLeaderboard(allEntries) {
  const now = new Date();
  const daysToSunday = (now.getDay() + 6) % 7; // 0 = Monday
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - daysToSunday);
  lastSunday.setHours(0, 0, 0, 0);

  // Filter entries updated after last Sunday
  const weeklyEntries = allEntries.filter((entry) => new Date(entry.updatedAt) >= lastSunday);

  return rankLeaderboardEntries(weeklyEntries);
}

/**
 * Calculate seasonal leaderboard (reset monthly)
 */
export function getSeasonalLeaderboard(allEntries) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const seasonalEntries = allEntries.filter((entry) => new Date(entry.updatedAt) >= firstDayOfMonth);

  return rankLeaderboardEntries(seasonalEntries);
}

/**
 * Get leaderboard by type
 */
export function getLeaderboardByType(type, userId, allEntries, friendIds = [], modeId = null) {
  switch (type) {
    case LEADERBOARD_TYPES.GLOBAL:
      return getGlobalLeaderboard(allEntries);
    case LEADERBOARD_TYPES.MODE_SPECIFIC:
      return getModeLeaderboard(modeId, allEntries);
    case LEADERBOARD_TYPES.FRIENDS:
      return getFriendsLeaderboard(userId, friendIds, allEntries);
    case LEADERBOARD_TYPES.WEEKLY:
      return getWeeklyLeaderboard(allEntries);
    case LEADERBOARD_TYPES.SEASONAL:
      return getSeasonalLeaderboard(allEntries);
    default:
      return getGlobalLeaderboard(allEntries);
  }
}

/**
 * Format rank display (e.g., "1st", "2nd", "3rd", "4th")
 */
export function formatRank(rank) {
  if (rank % 100 >= 11 && rank % 100 <= 13) {
    return `${rank}th`;
  }
  switch (rank % 10) {
    case 1:
      return `${rank}st`;
    case 2:
      return `${rank}nd`;
    case 3:
      return `${rank}rd`;
    default:
      return `${rank}th`;
  }
}

/**
 * Get rank badge/color by percentile
 */
export function getRankBadge(rank, totalPlayers) {
  const percentile = (rank / totalPlayers) * 100;

  if (percentile <= 1) return { label: "🏆 Legend", color: "#ffd700" };
  if (percentile <= 5) return { label: "👑 Mythic", color: "#ff69b4" };
  if (percentile <= 10) return { label: "💎 Legendary", color: "#ff4500" };
  if (percentile <= 25) return { label: "⭐ Epic", color: "#9370db" };
  if (percentile <= 50) return { label: "🌟 Rare", color: "#3b82f6" };
  return { label: "📈 Rising", color: "#10b981" };
}
