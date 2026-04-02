import { useState, useEffect, useCallback, useRef } from "react";
import {
  backendGetProfile,
  backendGetSession,
  backendOnAuthStateChange,
  backendResendVerification,
  backendSendPasswordReset,
  backendSignIn,
  backendSignOut,
  backendSignUp,
  backendUpsertProfile,
  isBackendEnabled,
} from "../lib/backendClient";
import { logSecurityEvent } from "../lib/securityEvents";

const AUTH_STORAGE_KEY = "focusflow-auth-v1";
const USERS_STORAGE_KEY = "focusflow-users-v1";
const PROFILES_STORAGE_KEY = "focusflow-profiles-v1";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i += 1) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

function loadAllUsers() {
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllUsers(users) {
  try {
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {
    // noop
  }
}

function loadCurrentUser() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user) {
  try {
    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // noop
  }
}

function loadUserProfile(userId) {
  try {
    const raw = window.localStorage.getItem(PROFILES_STORAGE_KEY);
    const profiles = raw ? JSON.parse(raw) : {};
    return profiles[userId] || null;
  } catch {
    return null;
  }
}

function saveUserProfile(userId, profile) {
  try {
    const raw = window.localStorage.getItem(PROFILES_STORAGE_KEY);
    const profiles = raw ? JSON.parse(raw) : {};
    profiles[userId] = profile;
    window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // noop
  }
}

function generateUserId() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function buildDefaultProfile({ userId, email, displayName }) {
  return {
    userId,
    displayName,
    email,
    createdAt: new Date().toISOString(),
    currency: 0,
    shards: 0,
    stats: {
      totalQuizzesCompleted: 0,
      totalBossesFought: 0,
      longestStreak: 0,
      currentStreak: 0,
      totalPlaytime: 0,
      totalXpGained: 0,
    },
    leaderboardStats: {
      globalRank: null,
      modeRanks: {
        bossBattle: null,
        travelling: null,
        gathering: null,
        focus: null,
      },
      friends: [],
    },
    currentTheme: "default",
    tutorialCompleted: false,
    tutorialSkipped: false,
    ownedItems: [],
  };
}

async function createBackendAccount(email, password, displayName) {
  if (!email || !password || !displayName) {
    return { success: false, error: "All fields are required." };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: "Invalid email format." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const { data, error } = await backendSignUp(email, password, displayName);
  if (error) {
    return { success: false, error: error.message || "Signup failed." };
  }

  const authUser = data.user;
  if (!authUser) {
    return { success: false, error: "Signup failed. Please try again." };
  }

  const pendingVerification = !data.session;

  const profile = buildDefaultProfile({
    userId: authUser.id,
    email: authUser.email ?? email,
    displayName,
  });

  // Profile is created automatically by DB trigger on auth.users insert.
  // No client-side insert needed here (would fail RLS before email verification).

  const user = pendingVerification
    ? null
    : {
        userId: authUser.id,
        email: authUser.email ?? email,
        displayName,
      };

  return { success: true, user, profile, pendingVerification };
}

async function loginBackendAccount(email, password) {
  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const { data, error } = await backendSignIn(email, password);
  if (error || !data.user) {
    return { success: false, error: error?.message || "Login failed." };
  }

  const authUser = data.user;
  if (!authUser.email_confirmed_at) {
    await backendSignOut();
    return { success: false, error: "Email not verified. Please verify your email first." };
  }

  const { data: profileRow } = await backendGetProfile(authUser.id);

  const profile = profileRow
    ? {
        userId: authUser.id,
        displayName: profileRow.display_name ?? authUser.user_metadata?.display_name ?? "Guild Cadet",
        email: profileRow.email ?? authUser.email,
        createdAt: profileRow.created_at ?? new Date().toISOString(),
        currency: profileRow.currency ?? 0,
        shards: profileRow.shards ?? 0,
        stats: profileRow.stats ?? {},
        leaderboardStats: profileRow.leaderboard_stats ?? {},
        currentTheme: profileRow.current_theme ?? "default",
        tutorialCompleted: profileRow.tutorial_completed ?? false,
        tutorialSkipped: profileRow.tutorial_skipped ?? false,
        ownedItems: profileRow.owned_items ?? [],
      }
    : buildDefaultProfile({
        userId: authUser.id,
        email: authUser.email,
        displayName: authUser.user_metadata?.display_name ?? "Guild Cadet",
      });

  const user = {
    userId: authUser.id,
    email: authUser.email,
    displayName: profile.displayName,
  };

  return { success: true, user, profile };
}

function createAccountLocal(email, password, displayName) {
  if (!email || !password || !displayName) {
    return { success: false, error: "All fields are required." };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: "Invalid email format." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  const users = loadAllUsers();
  const existingUser = Object.values(users).find((entry) => entry.email === email);
  if (existingUser) {
    return { success: false, error: "Email already registered." };
  }

  const userId = generateUserId();
  const hashedPassword = hashPassword(password);

  users[userId] = {
    userId,
    email,
    passwordHash: hashedPassword,
    displayName,
    createdAt: new Date().toISOString(),
  };

  saveAllUsers(users);

  const profile = buildDefaultProfile({ userId, email, displayName });
  saveUserProfile(userId, profile);

  const user = {
    userId,
    email,
    displayName,
  };

  saveCurrentUser(user);
  return { success: true, user, profile };
}

function loginAccountLocal(email, password) {
  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const users = loadAllUsers();
  const userRow = Object.values(users).find((entry) => entry.email === email);
  if (!userRow) {
    return { success: false, error: "Email not found." };
  }

  if (userRow.passwordHash !== hashPassword(password)) {
    return { success: false, error: "Incorrect password." };
  }

  const user = {
    userId: userRow.userId,
    email: userRow.email,
    displayName: userRow.displayName,
  };

  saveCurrentUser(user);
  return { success: true, user, profile: loadUserProfile(user.userId) };
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const authRateRef = useRef({
    login: [],
    signup: [],
    reset: [],
    resend: [],
  });

  function checkActionRate(action, limit, windowMs) {
    const now = Date.now();
    const existing = authRateRef.current[action] ?? [];
    const filtered = existing.filter((ts) => now - ts < windowMs);

    if (filtered.length >= limit) {
      authRateRef.current[action] = filtered;
      return false;
    }

    authRateRef.current[action] = [...filtered, now];
    return true;
  }

  useEffect(() => {
    let mounted = true;
    let subscription = null;

    async function restoreSession() {
      if (isBackendEnabled()) {
        const { data } = await backendGetSession();
        const sessionUser = data?.session?.user;

        if (!mounted) {
          return;
        }

        if (sessionUser) {
          const { data: profileRow } = await backendGetProfile(sessionUser.id);
          if (!mounted) {
            return;
          }

          const restoredUser = {
            userId: sessionUser.id,
            email: sessionUser.email,
            displayName: profileRow?.display_name ?? sessionUser.user_metadata?.display_name ?? "Guild Cadet",
          };

          const restoredProfile = profileRow
            ? {
                userId: sessionUser.id,
                displayName: profileRow.display_name ?? restoredUser.displayName,
                email: profileRow.email ?? sessionUser.email,
                createdAt: profileRow.created_at ?? new Date().toISOString(),
                currency: profileRow.currency ?? 0,
                shards: profileRow.shards ?? 0,
                stats: profileRow.stats ?? {},
                leaderboardStats: profileRow.leaderboard_stats ?? {},
                currentTheme: profileRow.current_theme ?? "default",
                tutorialCompleted: profileRow.tutorial_completed ?? false,
                tutorialSkipped: profileRow.tutorial_skipped ?? false,
                ownedItems: profileRow.owned_items ?? [],
              }
            : buildDefaultProfile({
                userId: sessionUser.id,
                email: sessionUser.email,
                displayName: restoredUser.displayName,
              });

          setUser(restoredUser);
          setProfile(restoredProfile);
        }

        setIsLoading(false);

        const listener = backendOnAuthStateChange((event, session) => {
          if (!mounted) {
            return;
          }

          if (event === "SIGNED_OUT") {
            setUser(null);
            setProfile(null);
            setSessionExpired(true);
            setInfo("Your session ended. Please login again.");
            logSecurityEvent({
              eventType: "auth_session_signed_out",
              severity: "info",
              message: "Session signed out",
              userId: session?.user?.id ?? null,
            });
          }

          if (event === "TOKEN_REFRESHED" && session?.user) {
            setSessionExpired(false);
          }
        });

        subscription = listener?.data?.subscription ?? null;
        return;
      }

      const currentUser = loadCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setProfile(loadUserProfile(currentUser.userId));
      }
      setIsLoading(false);
    }

    restoreSession();
    return () => {
      mounted = false;
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signup = useCallback(async (email, password, displayName) => {
    setError(null);
    setInfo("");

    if (!checkActionRate("signup", 5, 5 * 60 * 1000)) {
      setError("Too many signup attempts. Please wait a few minutes.");
      logSecurityEvent({
        eventType: "auth_signup_rate_limited",
        severity: "warning",
        message: "Signup rate limit reached",
      });
      return { success: false, error: "Rate limited" };
    }

    const result = isBackendEnabled()
      ? await createBackendAccount(email, password, displayName)
      : createAccountLocal(email, password, displayName);

    if (result.success) {
      if (result.user) {
        setUser(result.user);
        setProfile(result.profile);
      }
      if (isBackendEnabled()) {
        setInfo(result.pendingVerification
          ? "Account created. Please verify your email before logging in."
          : "Account created successfully.");
      }
      if (!isBackendEnabled()) {
        saveCurrentUser(result.user);
      }
    } else {
      setError(result.error);
      logSecurityEvent({
        eventType: "auth_signup_failed",
        severity: "warning",
        message: result.error || "Signup failed",
      });
    }

    return result;
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    setInfo("");
    setSessionExpired(false);

    if (!checkActionRate("login", 10, 10 * 60 * 1000)) {
      setError("Too many login attempts. Please try again later.");
      logSecurityEvent({
        eventType: "auth_login_rate_limited",
        severity: "warning",
        message: "Login rate limit reached",
      });
      return { success: false, error: "Rate limited" };
    }

    const result = isBackendEnabled()
      ? await loginBackendAccount(email, password)
      : loginAccountLocal(email, password);

    if (result.success) {
      setUser(result.user);
      setProfile(result.profile);
      if (!isBackendEnabled()) {
        saveCurrentUser(result.user);
      }
    } else {
      setError(result.error);
      logSecurityEvent({
        eventType: "auth_login_failed",
        severity: "warning",
        message: result.error || "Login failed",
      });
    }

    return result;
  }, []);

  const logout = useCallback(async () => {
    if (isBackendEnabled()) {
      await backendSignOut();
    }

    saveCurrentUser(null);
    setUser(null);
    setProfile(null);
    setError(null);
    setInfo("");
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    setError(null);
    setInfo("");

    if (!checkActionRate("reset", 3, 15 * 60 * 1000)) {
      setError("Too many reset requests. Please wait and try again.");
      logSecurityEvent({
        eventType: "auth_reset_rate_limited",
        severity: "warning",
        message: "Password reset rate limit reached",
      });
      return { success: false, error: "Rate limited" };
    }

    if (!email || !isValidEmail(email)) {
      setError("Enter a valid email address.");
      return { success: false, error: "Invalid email" };
    }

    if (!isBackendEnabled()) {
      setInfo("Password reset requires cloud backend mode.");
      return { success: false, error: "Backend unavailable" };
    }

    const { error: resetError } = await backendSendPasswordReset(email);
    if (resetError) {
      setError(resetError.message || "Could not send reset email.");
      logSecurityEvent({
        eventType: "auth_reset_failed",
        severity: "warning",
        message: resetError.message || "Could not send reset email",
      });
      return { success: false, error: resetError.message };
    }

    setInfo("Password reset email sent. Check your inbox.");
    return { success: true };
  }, []);

  const resendVerification = useCallback(async (email) => {
    setError(null);
    setInfo("");

    if (!checkActionRate("resend", 4, 15 * 60 * 1000)) {
      setError("Too many resend requests. Please wait and try again.");
      logSecurityEvent({
        eventType: "auth_resend_rate_limited",
        severity: "warning",
        message: "Verification resend rate limit reached",
      });
      return { success: false, error: "Rate limited" };
    }

    if (!email || !isValidEmail(email)) {
      setError("Enter a valid email address.");
      return { success: false, error: "Invalid email" };
    }

    if (!isBackendEnabled()) {
      setInfo("Verification resend requires cloud backend mode.");
      return { success: false, error: "Backend unavailable" };
    }

    const { error: resendError } = await backendResendVerification(email);
    if (resendError) {
      setError(resendError.message || "Could not resend verification.");
      logSecurityEvent({
        eventType: "auth_resend_failed",
        severity: "warning",
        message: resendError.message || "Could not resend verification",
      });
      return { success: false, error: resendError.message };
    }

    setInfo("Verification email sent again.");
    return { success: true };
  }, []);

  const updateProfile = useCallback((updater) => {
    setProfile((current) => {
      if (!current || !user?.userId) {
        return current;
      }

      const nextProfile = typeof updater === "function" ? updater(current) : { ...current, ...updater };

      if (isBackendEnabled()) {
        backendUpsertProfile({
          id: user.userId,
          email: nextProfile.email,
          display_name: nextProfile.displayName,
          currency: nextProfile.currency ?? 0,
          shards: nextProfile.shards ?? 0,
          current_theme: nextProfile.currentTheme ?? "default",
          tutorial_completed: Boolean(nextProfile.tutorialCompleted),
          tutorial_skipped: Boolean(nextProfile.tutorialSkipped),
          leaderboard_stats: nextProfile.leaderboardStats ?? {},
          stats: nextProfile.stats ?? {},
          owned_items: nextProfile.ownedItems ?? [],
          updated_at: new Date().toISOString(),
        });
      } else {
        saveUserProfile(user.userId, nextProfile);
      }

      return nextProfile;
    });
  }, [user?.userId]);

  return {
    user,
    profile,
    isLoading,
    error,
    info,
    sessionExpired,
    signup,
    login,
    logout,
    requestPasswordReset,
    resendVerification,
    updateProfile,
    isAuthenticated: !!user,
    backendEnabled: isBackendEnabled(),
  };
}
