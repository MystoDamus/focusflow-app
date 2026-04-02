/**
 * Theme System: Manages visual themes for different activity modes
 * Each activity mode has an auto-assigned theme but can be manually overridden
 */

export const ACTIVITY_MODES = {
  BOSS_BATTLE: "bossBattle",
  TRAVELLING: "travelling",
  GATHERING: "gathering",
  FOCUS: "focus",
};

export const THEMES = {
  // Boss Battle Theme - Dark, aggressive, combat-ready
  bossBattle: {
    id: "bossBattle",
    name: "Battle Ground",
    modeAssociation: ACTIVITY_MODES.BOSS_BATTLE,
    primaryColor: "#cc3333", // Dark red
    secondaryColor: "#1a1a1a", // Almost black
    accentColor: "#ff6b6b", // Bright red
    backgroundColor: "#0d0d0d", // Very dark
    textColor: "#ffffff",
    borderColor: "#ff6b6b",
    partyPose: "combat", // Warriors stand ready
    animationIntensity: "high",
    musicTheme: "intense-battle",
  },

  // Travelling Theme - Teal, adventure, calm exploration
  travelling: {
    id: "travelling",
    name: "Traveller's Path",
    modeAssociation: ACTIVITY_MODES.TRAVELLING,
    primaryColor: "#2dd4bf", // Teal/cyan
    secondaryColor: "#0d4d47", // Dark teal
    accentColor: "#5eead4", // Light teal
    backgroundColor: "#0f172a", // Dark navy
    textColor: "#ffffff",
    borderColor: "#2dd4bf",
    partyPose: "walking", // Characters walking/exploring
    animationIntensity: "medium",
    musicTheme: "exploration",
  },

  // Gathering Theme - Green, nature, peaceful collection
  gathering: {
    id: "gathering",
    name: "Resource Haven",
    modeAssociation: ACTIVITY_MODES.GATHERING,
    primaryColor: "#10b981", // Emerald green
    secondaryColor: "#064e3b", // Dark green
    accentColor: "#6ee7b7", // Light green
    backgroundColor: "#0f2818", // Very dark green
    textColor: "#ffffff",
    borderColor: "#10b981",
    partyPose: "collecting", // Characters gathering/farming
    animationIntensity: "low",
    musicTheme: "peaceful-ambient",
  },

  // Focus/Meditation Theme - Purple, calm, introspective
  focus: {
    id: "focus",
    name: "Meditation Sanctuary",
    modeAssociation: ACTIVITY_MODES.FOCUS,
    primaryColor: "#a78bfa", // Purple
    secondaryColor: "#3f1d5c", // Dark purple
    accentColor: "#d8b4fe", // Light purple
    backgroundColor: "#1a0f2e", // Very dark purple
    textColor: "#ffffff",
    borderColor: "#a78bfa",
    partyPose: "meditating", // Characters sitting/resting
    animationIntensity: "minimal",
    musicTheme: "meditation-ambient",
  },

  // Additional optional manual themes
  default: {
    id: "default",
    name: "Classic",
    modeAssociation: null,
    primaryColor: "#3b82f6", // Blue
    secondaryColor: "#1e3a8a", // Dark blue
    accentColor: "#60a5fa", // Light blue
    backgroundColor: "#0f172a", // Dark navy
    textColor: "#ffffff",
    borderColor: "#3b82f6",
    partyPose: "idle",
    animationIntensity: "medium",
    musicTheme: "default-ambient",
  },

  neon: {
    id: "neon",
    name: "Neon Cyberpunk",
    modeAssociation: null,
    primaryColor: "#ff006e", // Hot pink
    secondaryColor: "#0a0e27", // Almost black
    accentColor: "#8338ec", // Purple
    backgroundColor: "#0a0e27",
    textColor: "#00f5ff", // Cyan text
    borderColor: "#ff006e",
    partyPose: "idle",
    animationIntensity: "high",
    musicTheme: "cyberpunk",
  },

  forest: {
    id: "forest",
    name: "Ancient Forest",
    modeAssociation: null,
    primaryColor: "#7c5c3d", // Brown
    secondaryColor: "#1a1410", // Very dark brown
    accentColor: "#c9a76d", // Light brown
    backgroundColor: "#0d0b08",
    textColor: "#e8dcc8", // Cream
    borderColor: "#7c5c3d",
    partyPose: "idle",
    animationIntensity: "medium",
    musicTheme: "nature-ambient",
  },
};

/**
 * Get theme for a given activity mode (auto-assigned)
 */
export function getThemeForMode(modeKey) {
  const modeThemeMap = {
    [ACTIVITY_MODES.BOSS_BATTLE]: THEMES.bossBattle,
    [ACTIVITY_MODES.TRAVELLING]: THEMES.travelling,
    [ACTIVITY_MODES.GATHERING]: THEMES.gathering,
    [ACTIVITY_MODES.FOCUS]: THEMES.focus,
  };
  return modeThemeMap[modeKey] || THEMES.default;
}

/**
 * Get all available themes
 */
export function getAllThemes() {
  return Object.values(THEMES);
}

/**
 * Get theme by ID
 */
export function getThemeById(themeId) {
  return THEMES[themeId] || THEMES.default;
}

/**
 * Apply theme styles to document root
 */
export function applyThemeToDocument(theme) {
  const root = document.documentElement;

  root.style.setProperty("--theme-primary", theme.primaryColor);
  root.style.setProperty("--theme-secondary", theme.secondaryColor);
  root.style.setProperty("--theme-accent", theme.accentColor);
  root.style.setProperty("--theme-background", theme.backgroundColor);
  root.style.setProperty("--theme-text", theme.textColor);
  root.style.setProperty("--theme-border", theme.borderColor);

  // Add theme class for CSS-based styling
  document.documentElement.className = `theme-${theme.id}`;
}

/**
 * Get CSS variables object for inline styling
 */
export function getThemeCSSVariables(theme) {
  return {
    "--theme-primary": theme.primaryColor,
    "--theme-secondary": theme.secondaryColor,
    "--theme-accent": theme.accentColor,
    "--theme-background": theme.backgroundColor,
    "--theme-text": theme.textColor,
    "--theme-border": theme.borderColor,
  };
}

/**
 * Check if theme is auto-assigned to a mode
 */
export function isThemeAutoForMode(themeId, modeKey) {
  const modeTheme = getThemeForMode(modeKey);
  return modeTheme.id === themeId;
}

/**
 * Transition between themes smoothly
 */
export function transitionTheme(fromTheme, toTheme, durationMs = 300) {
  const root = document.documentElement;

  // Add transition class
  root.classList.add("theme-transitioning");
  root.style.transitionDuration = `${durationMs}ms`;

  // Apply new theme
  applyThemeToDocument(toTheme);

  // Remove transition class after completion
  setTimeout(() => {
    root.classList.remove("theme-transitioning");
  }, durationMs);
}
