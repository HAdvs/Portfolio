import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/* ════════════════════════════════════════════════════════════════════
   Supabase client — the single production data gateway.

   Credentials come exclusively from environment variables:
     VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
   The PostgreSQL database + Storage + Auth are the source of truth;
   there is no mock layer and no local content fallback.
   ════════════════════════════════════════════════════════════════════ */

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const SUPABASE_URL = env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured: boolean =
  /^https:\/\/[a-z0-9.-]+\.supabase\.co$/i.test(SUPABASE_URL) &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes("placeholder");

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "ym-supabase-session",
      },
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;

export const STORAGE_BUCKET = "media";
export const BACKUP_BUCKET = "backups";
