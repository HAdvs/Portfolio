-- ════════════════════════════════════════════════════════════════════
-- 0001 · Tables, functions, indexes, triggers  (idempotent)
-- ════════════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique, email text, name text default '',
  role text not null default 'viewer' check (role in ('super_admin','admin','editor','moderator','viewer')),
  avatar text, two_fa boolean default false, last_login timestamptz,
  is_active boolean default true, created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, username, name, role)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'name',''),
    coalesce(new.raw_user_meta_data->>'role','viewer'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.categories (
  id text primary key, slug text unique not null,
  label_ar text default '', label_en text default '', color text, order_index integer default 0
);

create table if not exists public.clients (
  id text primary key, name_ar text default '', name_en text default '',
  logo_url text default '', website text default '',
  order_index integer default 0, visible boolean default true
);

create table if not exists public.media_files (
  id text primary key, name text default '', url text not null, path text, thumb text,
  size bigint default 0, mime text default '', type text default 'image', folder text default 'general',
  width integer, height integer, alt text, tags text[] default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id text primary key,
  title_ar text not null default '', title_en text not null default '', slug text unique,
  type_ar text default '', type_en text default '',
  description_ar text default '', description_en text default '',
  category_id text, client_id text, year text default '',
  services text[] default '{}', technologies text[] default '{}',
  cover_url text default '', cover_media_id text, images text[] default '{}',
  video_url text default '', project_url text default '', colors text[] default '{}',
  featured boolean default false, visible boolean default true,
  status text default 'published' check (status in ('draft','published','archived')),
  order_index integer default 0, views integer default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create index if not exists idx_projects_category on public.projects(category_id);
create index if not exists idx_projects_client   on public.projects(client_id);
create index if not exists idx_projects_status   on public.projects(status);
create index if not exists idx_projects_order    on public.projects(order_index);
create index if not exists idx_media_folder      on public.media_files(folder);

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

-- helpers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.touch_updated_at();
drop trigger if exists trg_settings_updated on public.site_settings;
create trigger trg_settings_updated before update on public.site_settings
  for each row execute function public.touch_updated_at();

create or replace function public.is_staff() returns boolean
language sql stable security definer as $$
  select exists (select 1 from public.profiles
    where id = auth.uid() and is_active
      and role in ('super_admin','admin','editor','moderator'));
$$;

create or replace function public.ensure_column(t text, c text, typ text)
returns void language plpgsql as $$
begin
  if not exists (select 1 from information_schema.columns
      where table_schema='public' and table_name=t and column_name=c) then
    execute format('alter table public.%I add column %I %s', t, c, typ);
  end if;
end $$;
