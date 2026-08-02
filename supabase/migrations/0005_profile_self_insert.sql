-- ════════════════════════════════════════════════════════════════════
-- 0005 · Allow authenticated users to create their OWN profile.
-- Required so the admin app can auto-provision a missing profile
-- (e.g. users created directly in the Supabase dashboard, where the
-- signup trigger never fired). Staff keep full control via is_staff().
-- ════════════════════════════════════════════════════════════════════

drop policy if exists "self insert profile" on public.profiles;
create policy "self insert profile" on public.profiles
  for insert with check (id = auth.uid());

do $$ begin perform pg_notify('pgrst', 'reload schema'); end $$;
