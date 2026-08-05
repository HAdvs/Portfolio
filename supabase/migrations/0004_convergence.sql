-- ════════════════════════════════════════════════════════════════════
-- 0004 · Convergence — guarantee every canonical column exists on every
--        table, attach FKs safely, reload PostgREST schema cache.
--        No-op on fresh installs; full convergence on legacy databases.
-- ════════════════════════════════════════════════════════════════════

do $$
begin
  -- projects
  perform public.ensure_column('projects','title_ar','text');
  perform public.ensure_column('projects','title_en','text');
  perform public.ensure_column('projects','slug','text');
  perform public.ensure_column('projects','type_ar','text');
  perform public.ensure_column('projects','type_en','text');
  perform public.ensure_column('projects','description_ar','text');
  perform public.ensure_column('projects','description_en','text');
  perform public.ensure_column('projects','category_id','text');
  perform public.ensure_column('projects','client_id','text');
  perform public.ensure_column('projects','year','text');
  perform public.ensure_column('projects','services','text[]');
  perform public.ensure_column('projects','technologies','text[]');
  perform public.ensure_column('projects','cover_url','text');
  perform public.ensure_column('projects','cover_media_id','text');
  perform public.ensure_column('projects','images','text[]');
  perform public.ensure_column('projects','video_url','text');
  perform public.ensure_column('projects','project_url','text');
  perform public.ensure_column('projects','colors','text[]');
  perform public.ensure_column('projects','featured','boolean');
  perform public.ensure_column('projects','visible','boolean');
  perform public.ensure_column('projects','status','text');
  perform public.ensure_column('projects','order_index','integer');
  perform public.ensure_column('projects','views','integer');
  perform public.ensure_column('projects','created_at','timestamptz');
  perform public.ensure_column('projects','updated_at','timestamptz');

  -- media_files
  perform public.ensure_column('media_files','name','text');
  perform public.ensure_column('media_files','url','text');
  perform public.ensure_column('media_files','path','text');
  perform public.ensure_column('media_files','thumb','text');
  perform public.ensure_column('media_files','size','bigint');
  perform public.ensure_column('media_files','mime','text');
  perform public.ensure_column('media_files','type','text');
  perform public.ensure_column('media_files','folder','text');
  perform public.ensure_column('media_files','width','integer');
  perform public.ensure_column('media_files','height','integer');
  perform public.ensure_column('media_files','alt','text');
  perform public.ensure_column('media_files','tags','text[]');
  perform public.ensure_column('media_files','created_at','timestamptz');

  -- services
  perform public.ensure_column('services','title_ar','text');
  perform public.ensure_column('services','title_en','text');
  perform public.ensure_column('services','desc_ar','text');
  perform public.ensure_column('services','desc_en','text');
  perform public.ensure_column('services','icon','text');
  perform public.ensure_column('services','order_index','integer');
  perform public.ensure_column('services','visible','boolean');

  -- testimonials
  perform public.ensure_column('testimonials','name','text');
  perform public.ensure_column('testimonials','company','text');
  perform public.ensure_column('testimonials','role','text');
  perform public.ensure_column('testimonials','avatar','text');
  perform public.ensure_column('testimonials','text_ar','text');
  perform public.ensure_column('testimonials','text_en','text');
  perform public.ensure_column('testimonials','rating','integer');
  perform public.ensure_column('testimonials','visible','boolean');
  perform public.ensure_column('testimonials','order_index','integer');
  perform public.ensure_column('testimonials','created_at','timestamptz');

  -- faq_items
  perform public.ensure_column('faq_items','question_ar','text');
  perform public.ensure_column('faq_items','question_en','text');
  perform public.ensure_column('faq_items','answer_ar','text');
  perform public.ensure_column('faq_items','answer_en','text');
  perform public.ensure_column('faq_items','order_index','integer');
  perform public.ensure_column('faq_items','visible','boolean');

  -- messages
  perform public.ensure_column('messages','name','text');
  perform public.ensure_column('messages','email','text');
  perform public.ensure_column('messages','phone','text');
  perform public.ensure_column('messages','company','text');
  perform public.ensure_column('messages','service','text');
  perform public.ensure_column('messages','budget','text');
  perform public.ensure_column('messages','message','text');
  perform public.ensure_column('messages','status','text');
  perform public.ensure_column('messages','starred','boolean');
  perform public.ensure_column('messages','created_at','timestamptz');

  -- categories / clients
  perform public.ensure_column('categories','slug','text');
  perform public.ensure_column('categories','label_ar','text');
  perform public.ensure_column('categories','label_en','text');
  perform public.ensure_column('categories','color','text');
  perform public.ensure_column('categories','order_index','integer');
  perform public.ensure_column('clients','name_ar','text');
  perform public.ensure_column('clients','name_en','text');
  perform public.ensure_column('clients','logo_url','text');
  perform public.ensure_column('clients','website','text');
  perform public.ensure_column('clients','order_index','integer');
  perform public.ensure_column('clients','visible','boolean');

  -- profiles
  perform public.ensure_column('profiles','username','text');
  perform public.ensure_column('profiles','email','text');
  perform public.ensure_column('profiles','name','text');
  perform public.ensure_column('profiles','role','text');
  perform public.ensure_column('profiles','avatar','text');
  perform public.ensure_column('profiles','two_fa','boolean');
  perform public.ensure_column('profiles','last_login','timestamptz');
  perform public.ensure_column('profiles','is_active','boolean');

  -- seo_configs / site_settings / content_blocks / activity_logs
  perform public.ensure_column('seo_configs','page','text');
  perform public.ensure_column('seo_configs','title_ar','text');
  perform public.ensure_column('seo_configs','title_en','text');
  perform public.ensure_column('seo_configs','description_ar','text');
  perform public.ensure_column('seo_configs','description_en','text');
  perform public.ensure_column('seo_configs','keywords','text[]');
  perform public.ensure_column('seo_configs','og_title','text');
  perform public.ensure_column('seo_configs','og_description','text');
  perform public.ensure_column('seo_configs','og_image','text');
  perform public.ensure_column('seo_configs','twitter_card','text');
  perform public.ensure_column('seo_configs','canonical','text');
  perform public.ensure_column('seo_configs','robots','text');
  perform public.ensure_column('seo_configs','updated_at','timestamptz');

  perform public.ensure_column('site_settings','site_name','text');
  perform public.ensure_column('site_settings','tagline_ar','text');
  perform public.ensure_column('site_settings','tagline_en','text');
  perform public.ensure_column('site_settings','logo_url','text');
  perform public.ensure_column('site_settings','favicon_url','text');
  perform public.ensure_column('site_settings','og_image','text');
  perform public.ensure_column('site_settings','primary_color','text');
  perform public.ensure_column('site_settings','secondary_color','text');
  perform public.ensure_column('site_settings','accent_color','text');
  perform public.ensure_column('site_settings','font_ar','text');
  perform public.ensure_column('site_settings','font_en','text');
  perform public.ensure_column('site_settings','email','text');
  perform public.ensure_column('site_settings','phone','text');
  perform public.ensure_column('site_settings','whatsapp','text');
  perform public.ensure_column('site_settings','location_ar','text');
  perform public.ensure_column('site_settings','location_en','text');
  perform public.ensure_column('site_settings','maintenance_mode','boolean');
  perform public.ensure_column('site_settings','default_lang','text');
  perform public.ensure_column('site_settings','timezone','text');
  perform public.ensure_column('site_settings','updated_at','timestamptz');

  perform public.ensure_column('content_blocks','data_ar','jsonb');
  perform public.ensure_column('content_blocks','data_en','jsonb');
  perform public.ensure_column('content_blocks','updated_at','timestamptz');

  perform public.ensure_column('activity_logs','user_id','text');
  perform public.ensure_column('activity_logs','user_name','text');
  perform public.ensure_column('activity_logs','action','text');
  perform public.ensure_column('activity_logs','resource','text');
  perform public.ensure_column('activity_logs','resource_id','text');
  perform public.ensure_column('activity_logs','details','text');
  perform public.ensure_column('activity_logs','created_at','timestamptz');

  -- migrate legacy text category/client into FKs (data-preserving)
  if exists (select 1 from information_schema.columns where table_name='projects' and column_name='category') then
    update public.projects p set category_id = c.id
      from public.categories c where c.slug = p.category and p.category_id is null;
  end if;
  if exists (select 1 from information_schema.columns where table_name='projects' and column_name='client') then
    insert into public.clients (id, name_ar, name_en)
      select 'cl-' || md5(p.client), p.client, p.client from public.projects p
      where coalesce(p.client,'') <> '' on conflict (id) do nothing;
    update public.projects p set client_id = 'cl-' || md5(p.client)
      where coalesce(p.client,'') <> '' and p.client_id is null;
  end if;

  -- defaults for legacy rows
  update public.projects
     set visible   = coalesce(visible, true),
         featured  = coalesce(featured, false),
         order_index = coalesce(order_index, 0),
         views     = coalesce(views, 0),
         status    = coalesce(status, 'published')
   where visible is null or featured is null or status is null;
end $$;

-- foreign keys (safe: skipped when already present)
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
exception when others then null;
end $$;

-- ── reload PostgREST so new columns are visible immediately ──────────
do $$ begin perform pg_notify('pgrst', 'reload schema'); end $$;
do $$ begin perform pg_notify('pgrst', 'reload config'); end $$;
