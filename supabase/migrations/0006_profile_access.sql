-- ════════════════════════════════════════════════════════════════════
-- 0006 · Bulletproof profile access.
--
-- Root cause this fixes: when RLS mis-filters, a PostgREST select with
-- maybeSingle() returns data:null WITHOUT an error, so the app mistakes
-- an existing profile for "no profile". Two guarantees are added:
--   1) A self-select policy — every user can always read their own row.
--   2) A SECURITY DEFINER RPC that bypasses RLS entirely for the
--      signed-in user's own role/active state.
-- ════════════════════════════════════════════════════════════════════

-- 1) Self-read policy (idempotent)
drop policy if exists "self select profile" on public.profiles;
create policy "self select profile" on public.profiles
  for select using (id = auth.uid());

-- 2) SECURITY DEFINER function — runs as owner, immune to RLS drift
create or replace function public.get_my_profile()
returns jsonb
language sql stable security definer
set search_path = public
as $$
  select coalesce(
    (select jsonb_build_object('role', role, 'is_active', is_active)
       from public.profiles where id = auth.uid()),
    null
  );
$$;

revoke execute on function public.get_my_profile() from public;
grant  execute on function public.get_my_profile() to authenticated, anon, service_role;

do $$ begin perform pg_notify('pgrst', 'reload schema'); end $$;
do $$ begin perform pg_notify('pgrst', 'reload config'); end $$;
