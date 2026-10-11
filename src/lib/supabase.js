import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

async function ensureAnonymousUser() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (session?.user) return session.user;

  const {
    data: { user: anonymousUser },
    error: signInError,
  } = await supabase.auth.signInAnonymously();

  if (signInError) throw signInError;
  return anonymousUser;
}

function createJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = crypto.getRandomValues(new Uint32Array(6));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export async function createSharedSplit(state) {
  if (!supabase) throw new Error("Supabase is not configured.");

  await ensureAnonymousUser();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const joinCode = createJoinCode();
    const { data, error } = await supabase.rpc("create_shared_split", {
      p_join_code: joinCode,
      p_state: state,
    });

    if (!error) return data;

    if (error.code !== "23505") throw error;
  }

  throw new Error("Unable to create a unique join code. Please try again.");
}

export async function joinSharedSplit(joinCode) {
  if (!supabase) throw new Error("Supabase is not configured.");

  await ensureAnonymousUser();
  const { data, error } = await supabase.rpc("join_shared_split", {
    p_join_code: joinCode.trim().toUpperCase(),
  });

  if (error) throw error;
  return data;
}
