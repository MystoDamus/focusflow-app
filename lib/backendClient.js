import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const BACKEND_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let supabase = null;
if (BACKEND_ENABLED) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function isBackendEnabled() {
  return BACKEND_ENABLED;
}

export function getBackendClient() {
  return supabase;
}

export function backendOnAuthStateChange(callback) {
  if (!supabase) {
    return { data: { subscription: { unsubscribe() {} } } };
  }

  return supabase.auth.onAuthStateChange(callback);
}

export async function backendSignUp(email, password, displayName) {
  if (!supabase) {
    return { data: null, error: new Error("Backend is not configured") };
  }

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });
}

export async function backendSignIn(email, password) {
  if (!supabase) {
    return { data: null, error: new Error("Backend is not configured") };
  }

  return supabase.auth.signInWithPassword({ email, password });
}

export async function backendSignOut() {
  if (!supabase) {
    return { error: null };
  }

  return supabase.auth.signOut();
}

export async function backendSendPasswordReset(email) {
  if (!supabase) {
    return { data: null, error: new Error("Backend is not configured") };
  }

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
}

export async function backendResendVerification(email) {
  if (!supabase) {
    return { data: null, error: new Error("Backend is not configured") };
  }

  return supabase.auth.resend({
    type: "signup",
    email,
  });
}

export async function backendGetSession() {
  if (!supabase) {
    return { data: { session: null }, error: null };
  }

  return supabase.auth.getSession();
}

export async function backendGetProfile(userId) {
  if (!supabase) {
    return { data: null, error: new Error("Backend is not configured") };
  }

  return supabase.from("profiles").select("*").eq("id", userId).single();
}

export async function backendUpsertProfile(profile) {
  if (!supabase) {
    return { data: null, error: new Error("Backend is not configured") };
  }

  return supabase.from("profiles").upsert(profile, { onConflict: "id" }).select().single();
}

export async function backendSaveGameState(userId, payload) {
  if (!supabase) {
    return { data: null, error: new Error("Backend is not configured") };
  }

  return supabase
    .from("game_states")
    .upsert(
      {
        user_id: userId,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();
}

export async function backendLoadGameState(userId) {
  if (!supabase) {
    return { data: null, error: new Error("Backend is not configured") };
  }

  return supabase.from("game_states").select("payload, updated_at").eq("user_id", userId).single();
}

export async function backendUpsertLeaderboard(entry) {
  if (!supabase) {
    return { data: null, error: new Error("Backend is not configured") };
  }

  return supabase.from("leaderboards").upsert(entry, { onConflict: "user_id" }).select().single();
}

export async function backendFetchLeaderboard(limit = 100) {
  if (!supabase) {
    return { data: [], error: null };
  }

  return supabase
    .from("leaderboards")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);
}

export async function backendLogSecurityEvent(eventPayload) {
  if (!supabase) {
    return { data: null, error: new Error("Backend is not configured") };
  }

  const contextUserId = eventPayload.context?.userId;
  const normalizedUserId = typeof contextUserId === "string" && /^[0-9a-fA-F-]{36}$/.test(contextUserId)
    ? contextUserId
    : null;

  return supabase
    .from("security_events")
    .insert({
      user_id: normalizedUserId,
      event_type: eventPayload.eventType,
      severity: eventPayload.severity ?? "info",
      message: eventPayload.message,
      context: eventPayload.context ?? {},
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
}
