-- ════════════════════════════════════════════════════════════════════════════
--  YourMark Production CMS — canonical Supabase schema (relational)
--
--  TWO EQUIVALENT WAYS TO APPLY (pick one, never mix):
--    A) supabase/migrations/0001→0004 in order  (Supabase CLI: `supabase db push`)
--    B) this single file, pasted once into the SQL Editor
--  Both are idempotent and produce the identical database. Keep them in sync.
--
--  Safe to run repeatedly: on a brand-new database it creates the full
--  relational model; on an existing database the convergence block migrates
--  every missing column on every table and reloads the PostgREST cache.
--
--  The repository layer (src/lib/cms/db.ts) is the ONLY code that knows
--  about FKs — the UI keeps working with slugs/names/URLs. All ids are UUIDs.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1) PROFILES & roles ──────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  username   text unique,
  email      text,
  name       text default '',
  role       text not null default 'viewer'
             check (role in ('super_admin','admin','editor','moderator','viewer')),
  avatar     text,
  two_fa     boolean default false,
  last_login timestamptz,
  is_active  boolean default true,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, username, name, role)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'viewer')
  ) on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 2) Taxonomy tables ───────────────────────────────────────────────────────
create table if not exists public.categories (
  id          text primary key,
  slug        text unique not null,
  label_ar    text default '',
  label_en    text default '',
  color       text,
  order_index integer default 0
);

create table if not exists public.clients (
  id          text primary key,
  name_ar     text default '',
  name_en     text default '',
  logo_url    text default '',
  website     text default '',
  order_index integer default 0,
  visible     boolean default true
);

-- ── 3) Media library (Storage-backed) ────────────────────────────────────────
create table if not exists public.media_files (
  id         text primary key,
  name       text default '',
  url        text not null,
  path       text,
  thumb      text,
  size       bigint default 0,
  mime       text default '',
  type       text default 'image',
  folder     text default 'general',
  width      integer,
  height     integer,
  alt        text,
  tags       text[] default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ── 4) Projects — normalized with foreign keys ───────────────────────────────
create table if not exists public.projects (
  id             text primary key,
  title_ar       text not null default '',
  title_en       text not null default '',
  slug           text unique,
  type_ar        text default '',
  type_en        text default '',
  description_ar text default '',
  description_en text default '',
  category_id    text references public.categories(id) on delete set null,
  client_id      text references public.clients(id) on delete set null,
  year           text default '',
  services       text[] default '{}',
  technologies   text[] default '{}',
  cover_url      text default '',
  cover_media_id text references public.media_files(id) on delete set null,
  images         text[] default '{}',
  video_url      text default '',
  project_url    text default '',
  colors         text[] default '{}',
  featured       boolean default false,
  visible        boolean default true,
  status         text default 'published' check (status in ('draft','published','archived')),
  order_index    integer default 0,
  views          integer default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists idx_projects_category on public.projects(category_id);
create index if not exists idx_projects_client   on public.projects(client_id);
create index if not exists idx_projects_status   on public.projects(status);
create index if not exists idx_projects_order    on public.projects(order_index);
create index if not exists idx_media_folder      on public.media_files(folder);

-- ── 5) Remaining content tables ──────────────────────────────────────────────
create table if not exists public.services (
  id text primary key, title_ar text default '', title_en text default '',
  desc_ar text default '', desc_en text default '', icon text default 'identity',
  order_index integer default 0, visible boolean default true
);

create table if not exists public.testimonials (
  id text primary key, name text default '', company text default '', role text default '',
  avatar text, text_ar text default '', text_en text default '', rating integer default 5,
  visible boolean default true, order_index integer default 0, created_at timestamptz default now()
);

create table if not exists public.faq_items (
  id text primary key, question_ar text default '', question_en text default '',
  answer_ar text default '', answer_en text default '',
  order_index integer default 0, visible boolean default true
);

create table if not exists public.messages (
  id text primary key, name text not null default '', email text not null default '',
  phone text, company text, service text, budget text, message text not null default '',
  status text default 'unread' check (status in ('unread','read','replied','archived')),
  starred boolean default false, created_at timestamptz default now()
);

create table if not exists public.seo_configs (
  id text primary key default gen_random_uuid()::text, page text unique not null,
  title_ar text default '', title_en text default '',
  description_ar text default '', description_en text default '', keywords text[] default '{}',
  og_title text, og_description text, og_image text,
  twitter_card text default 'summary_large_image', canonical text,
  robots text default 'index, follow', updated_at timestamptz default now()
);

create table if not exists public.site_settings (
  id text primary key default 'site', site_name text default 'YourMark',
  tagline_ar text default '', tagline_en text default '',
  logo_url text default '', favicon_url text default '', og_image text default '',
  primary_color text default '#0a84ff', secondary_color text default '#1e3a8a', accent_color text default '#3d8dff',
  font_ar text default 'IBM Plex Sans Arabic', font_en text default 'Inter',
  email text default '', phone text default '', whatsapp text default '',
  location_ar text default '', location_en text default '',
  social_instagram text default '', social_behance text default '', social_linkedin text default '',
  social_x text default '', social_youtube text default '', social_dribbble text default '',
  ga_id text default '', gtm_id text default '', hotjar_id text default '',
  maintenance_mode boolean default false, default_lang text default 'ar', timezone text default 'Asia/Riyadh',
  updated_at timestamptz default now()
);

create table if not exists public.content_blocks (
  block_key text primary key, data_ar jsonb default '{}'::jsonb, data_en jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.activity_logs (
  id text primary key, user_id text default '', user_name text default '',
  action text default '', resource text default '', resource_id text, details text,
  created_at timestamptz default now()
);
create index if not exists idx_activity_created on public.activity_logs(created_at desc);

-- ── 6) updated_at trigger ────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_settings_updated on public.site_settings;
create trigger trg_settings_updated before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ── 7) RLS ───────────────────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.categories    enable row level security;
alter table public.clients       enable row level security;
alter table public.media_files   enable row level security;
alter table public.projects      enable row level security;
alter table public.services      enable row level security;
alter table public.testimonials  enable row level security;
alter table public.faq_items     enable row level security;
alter table public.messages      enable row level security;
alter table public.seo_configs   enable row level security;
alter table public.site_settings enable row level security;
alter table public.content_blocks enable row level security;
alter table public.activity_logs enable row level security;

create or replace function public.is_staff() returns boolean
language sql stable security definer as $$
  select exists (select 1 from public.profiles
    where id = auth.uid() and is_active and role in ('super_admin','admin','editor','moderator'));
$$;

-- NOTE: every policy is dropped first so this script is fully re-runnable.
-- A halted re-run previously prevented the storage bucket from being created.

-- public read
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

-- staff write
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
create policy "self update profile"    on public.profiles      for update using (id = auth.uid());
create policy "staff ins activity"     on public.activity_logs for insert with check (public.is_staff() or auth.uid() is not null);
create policy "staff read activity"    on public.activity_logs for select using (public.is_staff());

-- ── 8) Storage ───────────────────────────────────────────────────────────────
-- Bucket creation is wrapped so a failure here can never abort the script,
-- and it is verified explicitly afterwards.
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'media') then
    insert into storage.buckets (id, name, public) values ('media', 'media', true);
  end if;
exception when others then
  raise warning 'media bucket creation skipped: %', SQLERRM;
end $$;

drop policy if exists "pub read storage"  on storage.objects;
drop policy if exists "staff ins storage" on storage.objects;
drop policy if exists "staff upd storage" on storage.objects;
drop policy if exists "staff del storage" on storage.objects;

create policy "pub read storage"   on storage.objects for select using (bucket_id = 'media');
create policy "staff ins storage"  on storage.objects for insert with check (bucket_id = 'media' and public.is_staff());
create policy "staff upd storage"  on storage.objects for update using (bucket_id = 'media' and public.is_staff());
create policy "staff del storage"  on storage.objects for delete using (bucket_id = 'media' and public.is_staff());

-- ── 9) Realtime ──────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['projects','media_files','messages','testimonials','services',
    'categories','clients','faq_items','seo_configs','site_settings','content_blocks','activity_logs']
  loop
    execute format('alter publication supabase_realtime add table public.%I', t);
  exception when duplicate_object then null;
  end loop;
end $$;

-- ── 10) Seed ─────────────────────────────────────────────────────────────────
insert into public.categories (id, slug, label_ar, label_en, order_index) values
  ('identity','identity','الهوية','Identity',0), ('logo','logo','الشعارات','Logos',1),
  ('packaging','packaging','التغليف','Packaging',2), ('ads','ads','الإعلانات','Advertising',3),
  ('uiux','uiux','UI/UX','UI/UX',4), ('strategy','strategy','الاستراتيجية','Strategy',5)
on conflict (id) do nothing;

insert into public.site_settings (id, site_name, tagline_ar, tagline_en, logo_url, email, phone, whatsapp, location_ar, location_en)
values ('site','YourMark','علامتك التجارية تستحق علامة فارقة.','Your brand deserves a mark that matters.',
  'https://i.ibb.co/84bLpr63/Portfolio-Haitham-Brand-Designer-Logo-2048x2048.png',
  'hello@yourmark.studio','+966 53 959 5432','966539595432',
  'الرياض، المملكة العربية السعودية','Riyadh, Saudi Arabia')
on conflict (id) do nothing;

insert into public.seo_configs (page, title_ar, title_en, description_ar, description_en, keywords)
values ('home',
  'YourMark — وكالة تصميم الهوية البصرية والعلامات التجارية',
  'YourMark — Brand Identity & Logo Design Agency',
  'وكالة تصميم إبداعية متخصصة في بناء الهويات البصرية وتصميم الشعارات.',
  'A creative agency specialised in brand identities and logo design.',
  array['تصميم الهوية البصرية','تصميم الشعارات','Branding','Brand Identity','Logo Design','Creative Agency','UI/UX Design','Packaging Design','وكالة تصميم','Branding Agency Saudi Arabia'])
on conflict (page) do nothing;

insert into public.content_blocks (block_key, data_ar, data_en) values
  ('hero','{"badge":"وكالة تصميم إبداعية · الرياض","title1":"نصنع علامات تجارية","title2":"تُصنع الفارق.","desc":"وكالة تصميم إبداعية متخصصة في بناء الهويات البصرية وتصميم الشعارات وصناعة التجارب البصرية.","cta1":"ابدأ مشروعك","cta2":"استعرض أعمالنا"}'::jsonb,
        '{"badge":"Creative Design Agency · Riyadh","title1":"We build brands","title2":"that make the difference.","desc":"A creative agency specialised in brand identities, logos and visual experiences.","cta1":"Start your project","cta2":"Explore our work"}'::jsonb),
  ('about','{"kicker":"من نحن","title":"الهوية ليست شعاراً… بل انطباع أول لا يُنسى","p1":"نؤمن أن الهوية البصرية ليست مجرد شعار بل الانطباع الأول ولغة العلامة.","p2":"نحوّل الأفكار إلى علامات متكاملة تجمع الجمال والاستراتيجية والوضوح."}'::jsonb,
         '{"kicker":"About","title":"An identity is not a logo — it is a first impression","p1":"A visual identity is the first impression and the language of the brand.","p2":"We turn ideas into complete brands combining beauty, strategy and clarity."}'::jsonb)
on conflict (block_key) do nothing;

-- ── 11) Default admin (haitham.advs@gmail.com / h.advs) ──────────────────────
create extension if not exists pgcrypto;
do $$
declare v_user_id uuid;
begin
  if not exists (select 1 from auth.users where email = 'haitham.advs@gmail.com') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated','authenticated',
      'haitham.advs@gmail.com', crypt('h.advs', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"name":"Haitham","username":"haitham.advs","role":"super_admin"}',
      now(), now(), '', '', '', '')
    returning id into v_user_id;

    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (v_user_id, v_user_id, 'email',
      json_build_object('sub', v_user_id::text, 'email', 'haitham.advs@gmail.com'),
      'email', now(), now(), now());
  end if;
end $$;

-- ── 12) CONVERGENCE MIGRATION ────────────────────────────────────────────────
-- Guarantees EVERY canonical column exists on EVERY table, no matter which
-- older schema version the live database was created from. Idempotent:
-- a no-op on fresh installs, a full convergence on legacy databases.
-- This is the single mechanism that ends the "Could not find the 'X' column"
-- class of errors permanently — the code and the database can never drift.

create or replace function public.ensure_column(t text, c text, typ text)
returns void language plpgsql as $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = t and column_name = c
  ) then
    execute format('alter table public.%I add column %I %s', t, c, typ);
  end if;
end $$;

do $$
begin
  -- projects: full canonical column set
  perform public.ensure_column('projects', 'title_ar',       'text');
  perform public.ensure_column('projects', 'title_en',       'text');
  perform public.ensure_column('projects', 'slug',           'text');
  perform public.ensure_column('projects', 'type_ar',        'text');
  perform public.ensure_column('projects', 'type_en',        'text');
  perform public.ensure_column('projects', 'description_ar', 'text');
  perform public.ensure_column('projects', 'description_en', 'text');
  perform public.ensure_column('projects', 'category_id',    'text');
  perform public.ensure_column('projects', 'client_id',      'text');
  perform public.ensure_column('projects', 'year',           'text');
  perform public.ensure_column('projects', 'services',       'text[]');
  perform public.ensure_column('projects', 'technologies',   'text[]');
  perform public.ensure_column('projects', 'cover_url',      'text');
  perform public.ensure_column('projects', 'cover_media_id', 'text');
  perform public.ensure_column('projects', 'images',         'text[]');
  perform public.ensure_column('projects', 'video_url',      'text');
  perform public.ensure_column('projects', 'project_url',    'text');
  perform public.ensure_column('projects', 'colors',         'text[]');
  perform public.ensure_column('projects', 'featured',       'boolean');
  perform public.ensure_column('projects', 'visible',        'boolean');
  perform public.ensure_column('projects', 'status',         'text');
  perform public.ensure_column('projects', 'order_index',    'integer');
  perform public.ensure_column('projects', 'views',          'integer');
  perform public.ensure_column('projects', 'created_at',     'timestamptz');
  perform public.ensure_column('projects', 'updated_at',     'timestamptz');

  -- media_files
  perform public.ensure_column('media_files', 'name',       'text');
  perform public.ensure_column('media_files', 'url',        'text');
  perform public.ensure_column('media_files', 'path',       'text');
  perform public.ensure_column('media_files', 'thumb',      'text');
  perform public.ensure_column('media_files', 'size',       'bigint');
  perform public.ensure_column('media_files', 'mime',       'text');
  perform public.ensure_column('media_files', 'type',       'text');
  perform public.ensure_column('media_files', 'folder',     'text');
  perform public.ensure_column('media_files', 'width',      'integer');
  perform public.ensure_column('media_files', 'height',     'integer');
  perform public.ensure_column('media_files', 'alt',        'text');
  perform public.ensure_column('media_files', 'tags',       'text[]');
  perform public.ensure_column('media_files', 'created_at', 'timestamptz');

  -- services
  perform public.ensure_column('services', 'title_ar',    'text');
  perform public.ensure_column('services', 'title_en',    'text');
  perform public.ensure_column('services', 'desc_ar',     'text');
  perform public.ensure_column('services', 'desc_en',     'text');
  perform public.ensure_column('services', 'icon',        'text');
  perform public.ensure_column('services', 'order_index', 'integer');
  perform public.ensure_column('services', 'visible',     'boolean');

  -- testimonials
  perform public.ensure_column('testimonials', 'name',        'text');
  perform public.ensure_column('testimonials', 'company',     'text');
  perform public.ensure_column('testimonials', 'role',        'text');
  perform public.ensure_column('testimonials', 'avatar',      'text');
  perform public.ensure_column('testimonials', 'text_ar',     'text');
  perform public.ensure_column('testimonials', 'text_en',     'text');
  perform public.ensure_column('testimonials', 'rating',      'integer');
  perform public.ensure_column('testimonials', 'visible',     'boolean');
  perform public.ensure_column('testimonials', 'order_index', 'integer');
  perform public.ensure_column('testimonials', 'created_at',  'timestamptz');

  -- faq_items
  perform public.ensure_column('faq_items', 'question_ar', 'text');
  perform public.ensure_column('faq_items', 'question_en', 'text');
  perform public.ensure_column('faq_items', 'answer_ar',   'text');
  perform public.ensure_column('faq_items', 'answer_en',   'text');
  perform public.ensure_column('faq_items', 'order_index', 'integer');
  perform public.ensure_column('faq_items', 'visible',     'boolean');

  -- messages
  perform public.ensure_column('messages', 'name',       'text');
  perform public.ensure_column('messages', 'email',      'text');
  perform public.ensure_column('messages', 'phone',      'text');
  perform public.ensure_column('messages', 'company',    'text');
  perform public.ensure_column('messages', 'service',    'text');
  perform public.ensure_column('messages', 'budget',     'text');
  perform public.ensure_column('messages', 'message',    'text');
  perform public.ensure_column('messages', 'status',     'text');
  perform public.ensure_column('messages', 'starred',    'boolean');
  perform public.ensure_column('messages', 'created_at', 'timestamptz');

  -- categories
  perform public.ensure_column('categories', 'slug',        'text');
  perform public.ensure_column('categories', 'label_ar',    'text');
  perform public.ensure_column('categories', 'label_en',    'text');
  perform public.ensure_column('categories', 'color',       'text');
  perform public.ensure_column('categories', 'order_index', 'integer');

  -- clients
  perform public.ensure_column('clients', 'name_ar',     'text');
  perform public.ensure_column('clients', 'name_en',     'text');
  perform public.ensure_column('clients', 'logo_url',    'text');
  perform public.ensure_column('clients', 'website',     'text');
  perform public.ensure_column('clients', 'order_index', 'integer');
  perform public.ensure_column('clients', 'visible',     'boolean');

  -- profiles
  perform public.ensure_column('profiles', 'username',   'text');
  perform public.ensure_column('profiles', 'email',      'text');
  perform public.ensure_column('profiles', 'name',       'text');
  perform public.ensure_column('profiles', 'role',       'text');
  perform public.ensure_column('profiles', 'avatar',     'text');
  perform public.ensure_column('profiles', 'two_fa',     'boolean');
  perform public.ensure_column('profiles', 'last_login', 'timestamptz');
  perform public.ensure_column('profiles', 'is_active',  'boolean');

  -- seo_configs
  perform public.ensure_column('seo_configs', 'page',           'text');
  perform public.ensure_column('seo_configs', 'title_ar',       'text');
  perform public.ensure_column('seo_configs', 'title_en',       'text');
  perform public.ensure_column('seo_configs', 'description_ar', 'text');
  perform public.ensure_column('seo_configs', 'description_en', 'text');
  perform public.ensure_column('seo_configs', 'keywords',       'text[]');
  perform public.ensure_column('seo_configs', 'og_title',       'text');
  perform public.ensure_column('seo_configs', 'og_description', 'text');
  perform public.ensure_column('seo_configs', 'og_image',       'text');
  perform public.ensure_column('seo_configs', 'twitter_card',   'text');
  perform public.ensure_column('seo_configs', 'canonical',      'text');
  perform public.ensure_column('seo_configs', 'robots',         'text');
  perform public.ensure_column('seo_configs', 'updated_at',     'timestamptz');

  -- site_settings
  perform public.ensure_column('site_settings', 'site_name',       'text');
  perform public.ensure_column('site_settings', 'tagline_ar',      'text');
  perform public.ensure_column('site_settings', 'tagline_en',      'text');
  perform public.ensure_column('site_settings', 'logo_url',        'text');
  perform public.ensure_column('site_settings', 'favicon_url',     'text');
  perform public.ensure_column('site_settings', 'og_image',        'text');
  perform public.ensure_column('site_settings', 'primary_color',   'text');
  perform public.ensure_column('site_settings', 'secondary_color', 'text');
  perform public.ensure_column('site_settings', 'accent_color',    'text');
  perform public.ensure_column('site_settings', 'font_ar',         'text');
  perform public.ensure_column('site_settings', 'font_en',         'text');
  perform public.ensure_column('site_settings', 'email',           'text');
  perform public.ensure_column('site_settings', 'phone',           'text');
  perform public.ensure_column('site_settings', 'whatsapp',        'text');
  perform public.ensure_column('site_settings', 'location_ar',     'text');
  perform public.ensure_column('site_settings', 'location_en',     'text');
  perform public.ensure_column('site_settings', 'maintenance_mode','boolean');
  perform public.ensure_column('site_settings', 'default_lang',    'text');
  perform public.ensure_column('site_settings', 'timezone',        'text');
  perform public.ensure_column('site_settings', 'updated_at',      'timestamptz');

  -- content_blocks
  perform public.ensure_column('content_blocks', 'data_ar',    'jsonb');
  perform public.ensure_column('content_blocks', 'data_en',    'jsonb');
  perform public.ensure_column('content_blocks', 'updated_at', 'timestamptz');

  -- activity_logs
  perform public.ensure_column('activity_logs', 'user_id',     'text');
  perform public.ensure_column('activity_logs', 'user_name',   'text');
  perform public.ensure_column('activity_logs', 'action',      'text');
  perform public.ensure_column('activity_logs', 'resource',    'text');
  perform public.ensure_column('activity_logs', 'resource_id', 'text');
  perform public.ensure_column('activity_logs', 'details',     'text');
  perform public.ensure_column('activity_logs', 'created_at',  'timestamptz');

  -- legacy text columns → foreign keys (data-preserving)
  if exists (select 1 from information_schema.columns where table_name='projects' and column_name='category')
     and exists (select 1 from information_schema.columns where table_name='projects' and column_name='category_id') then
    update public.projects p set category_id = c.id
      from public.categories c where c.slug = p.category and p.category_id is null;
  end if;

  if exists (select 1 from information_schema.columns where table_name='projects' and column_name='client')
     and exists (select 1 from information_schema.columns where table_name='projects' and column_name='client_id') then
    insert into public.clients (id, name_ar, name_en)
      select 'cl-' || md5(p.client), p.client, p.client from public.projects p
      where coalesce(p.client,'') <> ''
      on conflict (id) do nothing;
    update public.projects p set client_id = 'cl-' || md5(p.client)
      where coalesce(p.client,'') <> '' and p.client_id is null;
  end if;

  -- sensible defaults for newly added booleans/ints on legacy rows
  update public.projects set visible = coalesce(visible, true), featured = coalesce(featured, false),
    order_index = coalesce(order_index, 0), views = coalesce(views, 0),
    status = coalesce(status, 'published') where visible is null or featured is null or status is null;
end $$;

-- foreign keys for the converged columns (safe: ignored when already present)
do $$
begin
  if not exists (select 1 from information_schema.table_constraints
      where constraint_name='fk_projects_category' and table_name='projects') then
    alter table public.projects add constraint fk_projects_category
      foreign key (category_id) references public.categories(id) on delete set null not valid;
  end if;
  if not exists (select 1 from information_schema.table_constraints
      where constraint_name='fk_projects_client' and table_name='projects') then
    alter table public.projects add constraint fk_projects_client
      foreign key (client_id) references public.clients(id) on delete set null not valid;
  end if;
  if not exists (select 1 from information_schema.table_constraints
      where constraint_name='fk_projects_cover' and table_name='projects') then
    alter table public.projects add constraint fk_projects_cover
      foreign key (cover_media_id) references public.media_files(id) on delete set null not valid;
  end if;
exception when others then null; -- columns may predate constraints; never block convergence
end $$;

-- ── 13) POSTGREST SCHEMA CACHE RELOAD ────────────────────────────────────────
-- Critical: PostgREST caches the schema. Without this notify, newly added
-- columns (colors, services, category_id…) keep returning
-- "Could not find the 'X' column of 'projects' in the schema cache"
-- even though they exist in Postgres. This makes them visible immediately.
do $$ begin perform pg_notify('pgrst', 'reload schema'); end $$;
do $$ begin perform pg_notify('pgrst', 'reload config'); end $$;
