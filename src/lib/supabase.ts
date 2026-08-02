/* Backwards-compatible re-export — the canonical client lives in
   supabaseClient.ts. All new code should import from there. */
export {
  supabase,
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  STORAGE_BUCKET,
} from "./supabaseClient";
