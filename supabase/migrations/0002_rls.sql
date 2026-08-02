-- ════════════════════════════════════════════════════════════════════
-- 0002 · Row Level Security  (idempotent: drop → create)
-- ════════════════════════════════════════════════════════════════════

alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.clients        enable row level security;
alter table public.media_files    enable row level security;
alter table public.projects       enable row level security;
alter table public.services       enable row level security;
alter table public.testimonials   enable row level security;
alter table public.faq_items      enable row level security;
alter table public.messages       enable row level security;
alter table public.seo_configs    enable row level security;
alter table public.site_settings  enable row level security;
alter table public.content_blocks enable row level security;
alter table public.activity_logs  enable row level security;

-- ── public read ──────────────────────────────────────────────────────
drop policy if exists "pub read categories"   on public.categories;
drop policy if exists "pub read clients"      on public.clients;
drop policy if exists "pub read media"        on public.media_files;
drop policy if exists "pub read projects"     on public.projects;
drop policy if exists "pub read services"     on public.services;
drop policy if exists "pub read testimonials" on public.testimonials;
drop policy if exists "pub read faq"          on public.faq_items;
drop policy if exists "pub read seo"          on public.seo_configs;
drop policy if exists "pub read settings"     on public.site_settings;
drop policy if exists "pub read blocks"       on public.content_blocks;
drop policy if exists "pub read profiles"     on public.profiles;
drop policy if exists "pub insert messages"   on public.messages;

create policy "pub read categories"   on public.categories    for select using (true);
create policy "pub read clients"      on public.clients       for select using (visible);
create policy "pub read media"        on public.media_files   for select using (true);
create policy "pub read projects"     on public.projects      for select using (visible and status = 'published');
create policy "pub read services"     on public.services      for select using (visible);
create policy "pub read testimonials" on public.testimonials  for select using (visible);
create policy "pub read faq"          on public.faq_items     for select using (visible);
create policy "pub read seo"          on public.seo_configs   for select using (true);
create policy "pub read settings"     on public.site_settings for select using (true);
create policy "pub read blocks"       on public.content_blocks for select using (true);
create policy "pub read profiles"     on public.profiles      for select using (true);
create policy "pub insert messages"   on public.messages      for insert with check (true);

-- ── staff write ──────────────────────────────────────────────────────
drop policy if exists "staff all categories"   on public.categories;
drop policy if exists "staff all clients"      on public.clients;
drop policy if exists "staff all media"        on public.media_files;
drop policy if exists "staff all projects"     on public.projects;
drop policy if exists "staff all services"     on public.services;
drop policy if exists "staff all testimonials" on public.testimonials;
drop policy if exists "staff all faq"          on public.faq_items;
drop policy if exists "staff upd messages"     on public.messages;
drop policy if exists "staff del messages"     on public.messages;
drop policy if exists "staff all seo"          on public.seo_configs;
drop policy if exists "staff all settings"     on public.site_settings;
drop policy if exists "staff all blocks"       on public.content_blocks;
drop policy if exists "staff all profiles"     on public.profiles;
drop policy if exists "self insert profile"    on public.profiles;
drop policy if exists "self update profile"    on public.profiles;
drop policy if exists "staff ins activity"     on public.activity_logs;
drop policy if exists "staff read activity"    on public.activity_logs;

create policy "staff all categories"   on public.categories    for all using (public.is_staff()) with check (public.is_staff());
create policy "staff all clients"      on public.clients       for all using (public.is_staff()) with check (public.is_staff());
create policy "staff all media"        on public.media_files   for all using (public.is_staff()) with check (public.is_staff());
create policy "staff all projects"     on public.projects      for all using (public.is_staff()) with check (public.is_staff());
create policy "staff all services"     on public.services      for all using (public.is_staff()) with check (public.is_staff());
create policy "staff all testimonials" on public.testimonials  for all using (public.is_staff()) with check (public.is_staff());
create policy "staff all faq"          on public.faq_items     for all using (public.is_staff()) with check (public.is_staff());
create policy "staff upd messages"     on public.messages      for update using (public.is_staff());
create policy "staff del messages"     on public.messages      for delete using (public.is_staff());
create policy "staff all seo"          on public.seo_configs   for all using (public.is_staff()) with check (public.is_staff());
create policy "staff all settings"     on public.site_settings for all using (public.is_staff()) with check (public.is_staff());
create policy "staff all blocks"       on public.content_blocks for all using (public.is_staff()) with check (public.is_staff());
create policy "staff all profiles"     on public.profiles      for all using (public.is_staff()) with check (public.is_staff());
create policy "self insert profile"    on public.profiles      for insert with check (id = auth.uid());
create policy "self update profile"    on public.profiles      for update using (id = auth.uid());
create policy "staff ins activity"     on public.activity_logs for insert with check (public.is_staff() or auth.uid() is not null);
create policy "staff read activity"    on public.activity_logs for select using (public.is_staff());
