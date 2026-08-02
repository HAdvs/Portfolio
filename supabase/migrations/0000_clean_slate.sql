-- ════════════════════════════════════════════════════════════════════
-- 0000 · CLEAN SLATE — ⚠️ DESTRUCTIVE ⚠️
--
-- Drops EVERY project-owned object so migrations 0001→0004 rebuild the
-- database from zero with no legacy conflicts. Run this ONLY when you
-- want a fresh start (it removes all CMS data).
--
-- Order matters: policies → publications → triggers → functions → tables.
-- ════════════════════════════════════════════════════════════════════

-- ── 1) Storage policies + bucket ─────────────────────────────────────
drop policy if exists "pub read storage"  on storage.objects;
drop policy if exists "staff ins storage" on storage.objects;
drop policy if exists "staff upd storage" on storage.objects;
drop policy if exists "staff del storage" on storage.objects;

do $$ begin
  delete from storage.objects where bucket_id = 'media';
  delete from storage.buckets where id = 'media';
exception when others then
  raise warning 'bucket cleanup skipped: %', SQLERRM;
end $$;

-- ── 2) Realtime publications ─────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['projects','media_files','messages','testimonials','services',
    'categories','clients','faq_items','seo_configs','site_settings','content_blocks','activity_logs']
  loop
    begin
      execute format('alter publication supabase_realtime drop table public.%I', t);
    exception when others then null; -- not published yet
    end;
  end loop;
end $$;

-- ── 3) Triggers ──────────────────────────────────────────────────────
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists trg_projects_updated  on public.projects;
drop trigger if exists trg_settings_updated  on public.site_settings;

-- ── 4) Functions ─────────────────────────────────────────────────────
drop function if exists public.handle_new_user()  cascade;
drop function if exists public.touch_updated_at() cascade;
drop function if exists public.is_staff()         cascade;
drop function if exists public.ensure_column(text, text, text) cascade;

-- ── 5) Tables (CASCADE removes dependent policies/FKs/indexes) ───────
drop table if exists public.activity_logs  cascade;
drop table if exists public.content_blocks cascade;
drop table if exists public.site_settings  cascade;
drop table if exists public.seo_configs    cascade;
drop table if exists public.messages       cascade;
drop table if exists public.faq_items      cascade;
drop table if exists public.testimonials   cascade;
drop table if exists public.services       cascade;
drop table if exists public.projects       cascade;
drop table if exists public.media_files    cascade;
drop table if exists public.clients        cascade;
drop table if exists public.categories     cascade;
drop table if exists public.profiles       cascade;

-- Database is now empty of project objects — run 0001 → 0004 next.
