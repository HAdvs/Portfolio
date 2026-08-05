-- ════════════════════════════════════════════════════════════════════
-- 0003 · Storage bucket + policies, Realtime publications, seed data,
--        default admin user  (idempotent)
-- ════════════════════════════════════════════════════════════════════

-- ── Storage ──────────────────────────────────────────────────────────
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

-- ── Realtime ─────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['projects','media_files','messages','testimonials','services',
    'categories','clients','faq_items','seo_configs','site_settings','content_blocks','activity_logs']
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- ── Seed ─────────────────────────────────────────────────────────────
insert into public.categories (id, slug, label_ar, label_en, order_index) values
  ('identity','identity','الهوية','Identity',0), ('logo','logo','الشعارات','Logos',1),
  ('packaging','packaging','التغليف','Packaging',2), ('ads','ads','الإعلانات','Advertising',3),
  ('uiux','uiux','UI/UX','UI/UX',4), ('strategy','strategy','الاستراتيجية','Strategy',5)
on conflict (id) do nothing;

insert into public.site_settings (id, site_name, tagline_ar, tagline_en, logo_url, email, phone, whatsapp, location_ar, location_en)
values ('site','YourMark','علامتك التجارية تستحق علامة فارقة.','Your brand deserves a mark that matters.',
  'https://i.ibb.co/84bLpr63/Portfolio-Haitham-Brand-Designer-Logo-2048x2048.png',
  'yourmark.brand@gmail.com','+966 53 959 5432','966539595432',
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

-- ── Default admin: haitham.advs@gmail.com / h.advs ───────────────────
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
