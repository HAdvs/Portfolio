import {
  supabase,
  STORAGE_BUCKET,
  BACKUP_BUCKET,
} from "../supabaseClient";
import type {
  ActivityLog, AdminUser, Category, Client, ContentBlock, FaqItem, MediaFile, Message,
  Project, SeoConfig, Service, SiteSettings, Testimonial, UserRole,
} from "../../admin/types";

/* ════════════════════════════════════════════════════════════════════
   Repository layer — the SINGLE translation boundary between the app
   model (slugs / names / URLs) and the relational Supabase schema
   (category_id / client_id / cover_media_id).

   • Reads  JOIN categories & clients and hydrate app-friendly fields.
   • Writes RESOLVE slugs/names to foreign keys and never send columns
     that don't exist in the database (fixes "Could not find the
     'category' column of 'projects'").
   ════════════════════════════════════════════════════════════════════ */

const db = () => {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
};

const ts = (v: unknown) => (v as string) ?? new Date().toISOString();

/* ── Mappers: DB row → app entity ─────────────────────────────────── */
function mapProject(r: Record<string, unknown>): Project {
  const cat = r.categories as { slug?: string } | null;
  const cli = r.clients as { name_ar?: string; name_en?: string } | null;
  return {
    id: r.id as string,
    title_ar: (r.title_ar as string) ?? "", title_en: (r.title_en as string) ?? "",
    slug: (r.slug as string) ?? "", type_ar: (r.type_ar as string) ?? "", type_en: (r.type_en as string) ?? "",
    description_ar: (r.description_ar as string) ?? "", description_en: (r.description_en as string) ?? "",
    client: cli?.name_ar || cli?.name_en || "",
    year: (r.year as string) ?? "",
    category: cat?.slug ?? "",
    services: (r.services as string[]) ?? [], technologies: (r.technologies as string[]) ?? [],
    cover_url: (r.cover_url as string) ?? "",
    images: (r.images as string[]) ?? [],
    video_url: (r.video_url as string) ?? "", project_url: (r.project_url as string) ?? "",
    colors: (r.colors as string[]) ?? [],
    featured: !!r.featured, visible: r.visible !== false,
    status: (r.status as Project["status"]) ?? "published",
    order_index: (r.order_index as number) ?? 0, views: (r.views as number) ?? 0,
    category_id: (r.category_id as string) ?? null,
    client_id: (r.client_id as string) ?? null,
    cover_media_id: (r.cover_media_id as string) ?? null,
    createdAt: ts(r.created_at), updatedAt: ts(r.updated_at),
  };
}

const mapMedia = (r: Record<string, unknown>): MediaFile => ({
  id: r.id as string, name: (r.name as string) ?? "", url: (r.url as string) ?? "",
  path: (r.path as string) ?? undefined, thumb: (r.thumb as string) ?? undefined,
  size: (r.size as number) ?? 0, mime: (r.mime as string) ?? "",
  type: (r.type as MediaFile["type"]) ?? "image", folder: (r.folder as string) ?? "general",
  width: (r.width as number) ?? undefined, height: (r.height as number) ?? undefined,
  alt: (r.alt as string) ?? undefined, tags: (r.tags as string[]) ?? [], createdAt: ts(r.created_at),
});

const mapMessage = (r: Record<string, unknown>): Message => ({
  id: r.id as string, name: (r.name as string) ?? "", email: (r.email as string) ?? "",
  phone: (r.phone as string) ?? undefined, company: (r.company as string) ?? undefined,
  service: (r.service as string) ?? undefined, budget: (r.budget as string) ?? undefined,
  message: (r.message as string) ?? "", status: (r.status as Message["status"]) ?? "unread",
  starred: !!r.starred, createdAt: ts(r.created_at),
});

const mapTestimonial = (r: Record<string, unknown>): Testimonial => ({
  id: r.id as string, name: (r.name as string) ?? "", company: (r.company as string) ?? "",
  role: (r.role as string) ?? "", avatar: (r.avatar as string) ?? undefined,
  text_ar: (r.text_ar as string) ?? "", text_en: (r.text_en as string) ?? "",
  rating: (r.rating as number) ?? 5, visible: r.visible !== false,
  order_index: (r.order_index as number) ?? 0, createdAt: ts(r.created_at),
});

const mapService = (r: Record<string, unknown>): Service => ({
  id: r.id as string, title_ar: (r.title_ar as string) ?? "", title_en: (r.title_en as string) ?? "",
  desc_ar: (r.desc_ar as string) ?? "", desc_en: (r.desc_en as string) ?? "",
  icon: (r.icon as string) ?? "identity", order_index: (r.order_index as number) ?? 0, visible: r.visible !== false,
});

const mapCategory = (r: Record<string, unknown>): Category => ({
  id: r.id as string, slug: (r.slug as string) ?? "", label_ar: (r.label_ar as string) ?? "",
  label_en: (r.label_en as string) ?? "", color: (r.color as string) ?? undefined, order_index: (r.order_index as number) ?? 0,
});

const mapFaq = (r: Record<string, unknown>): FaqItem => ({
  id: r.id as string, question_ar: (r.question_ar as string) ?? "", question_en: (r.question_en as string) ?? "",
  answer_ar: (r.answer_ar as string) ?? "", answer_en: (r.answer_en as string) ?? "",
  order_index: (r.order_index as number) ?? 0, visible: r.visible !== false,
});

const mapSeo = (r: Record<string, unknown>): SeoConfig => ({
  id: r.id as string, page: (r.page as string) ?? "home", title_ar: (r.title_ar as string) ?? "",
  title_en: (r.title_en as string) ?? "", description_ar: (r.description_ar as string) ?? "",
  description_en: (r.description_en as string) ?? "", keywords: (r.keywords as string[]) ?? [],
  og_title: (r.og_title as string) ?? undefined, og_description: (r.og_description as string) ?? undefined,
  og_image: (r.og_image as string) ?? undefined,
  twitter_card: (r.twitter_card as SeoConfig["twitter_card"]) ?? "summary_large_image",
  canonical: (r.canonical as string) ?? undefined, robots: (r.robots as string) ?? "index, follow",
  updatedAt: ts(r.updated_at),
});

const mapSettings = (r: Record<string, unknown>): SiteSettings => ({
  id: (r.id as string) ?? "site", site_name: (r.site_name as string) ?? "YourMark",
  tagline_ar: (r.tagline_ar as string) ?? "", tagline_en: (r.tagline_en as string) ?? "",
  logo_url: (r.logo_url as string) ?? "", favicon_url: (r.favicon_url as string) ?? "",
  og_image: (r.og_image as string) ?? "", primary_color: (r.primary_color as string) ?? "#0a84ff",
  secondary_color: (r.secondary_color as string) ?? "#1e3a8a", accent_color: (r.accent_color as string) ?? "#3d8dff",
  font_ar: (r.font_ar as string) ?? "IBM Plex Sans Arabic", font_en: (r.font_en as string) ?? "Inter",
  email: (r.email as string) ?? "", phone: (r.phone as string) ?? "", whatsapp: (r.whatsapp as string) ?? "",
  location_ar: (r.location_ar as string) ?? "", location_en: (r.location_en as string) ?? "",
  social_instagram: (r.social_instagram as string) ?? "", social_behance: (r.social_behance as string) ?? "",
  social_linkedin: (r.social_linkedin as string) ?? "", social_x: (r.social_x as string) ?? "",
  social_youtube: (r.social_youtube as string) ?? "", social_dribbble: (r.social_dribbble as string) ?? "",
  ga_id: (r.ga_id as string) ?? "", gtm_id: (r.gtm_id as string) ?? "", hotjar_id: (r.hotjar_id as string) ?? "",
  maintenance_mode: !!r.maintenance_mode, default_lang: (r.default_lang as "ar" | "en") ?? "ar",
  timezone: (r.timezone as string) ?? "Asia/Riyadh", updatedAt: ts(r.updated_at),
});

const mapUser = (r: Record<string, unknown>): AdminUser => ({
  id: r.id as string, username: (r.username as string) ?? "", email: (r.email as string) ?? "",
  name: (r.name as string) ?? "", role: (r.role as UserRole) ?? "viewer", avatar: (r.avatar as string) ?? undefined,
  twoFA: !!r.two_fa, lastLogin: (r.last_login as string) ?? undefined,
  createdAt: ts(r.created_at), isActive: r.is_active !== false,
});

const mapActivity = (r: Record<string, unknown>): ActivityLog => ({
  id: r.id as string, userId: (r.user_id as string) ?? "", userName: (r.user_name as string) ?? "",
  action: (r.action as string) ?? "", resource: (r.resource as string) ?? "",
  resourceId: (r.resource_id as string) ?? undefined, details: (r.details as string) ?? undefined,
  createdAt: ts(r.created_at),
});

const mapBlock = (r: Record<string, unknown>): ContentBlock => ({
  block_key: r.block_key as string,
  data_ar: (r.data_ar as Record<string, unknown>) ?? {},
  data_en: (r.data_en as Record<string, unknown>) ?? {},
  updatedAt: ts(r.updated_at),
});

const mapClient = (r: Record<string, unknown>): Client => ({
  id: r.id as string, name_ar: (r.name_ar as string) ?? "", name_en: (r.name_en as string) ?? "",
  logo_url: (r.logo_url as string) ?? "", website: (r.website as string) ?? undefined,
  order_index: (r.order_index as number) ?? 0, visible: r.visible !== false,
});

/* ── FK resolvers: slug/name → UUID id (creating the row when needed) ─
   All generated ids are UUIDs so they are valid whether the target
   column is `uuid` or `text` — no mixed identifier types anywhere. */
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 10)}`;

async function resolveCategoryId(slug: string | undefined): Promise<string | null> {
  if (!slug) return null;
  const s = db();
  const { data } = await s.from("categories").select("id").eq("slug", slug).maybeSingle();
  if (data?.id) return data.id as string;
  const id = newId();
  const { error } = await s.from("categories").insert({ id, slug, label_ar: slug, label_en: slug });
  if (error) {
    // slug may already exist under another id (unique constraint) — reuse it
    const retry = await s.from("categories").select("id").eq("slug", slug).maybeSingle();
    if (retry.data?.id) return retry.data.id as string;
    throw error;
  }
  return id;
}

async function resolveClientId(name: string | undefined): Promise<string | null> {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const s = db();
  const { data } = await s.from("clients").select("id").or(`name_ar.eq.${trimmed},name_en.eq.${trimmed}`).maybeSingle();
  if (data?.id) return data.id as string;
  const id = newId();
  await s.from("clients").insert({ id, name_ar: trimmed, name_en: trimmed });
  return id;
}

/* ── Fetch everything (single hydration pass) ─────────────────────── */
export async function fetchAll() {
  const s = db();
  const [projects, media, messages, testimonials, services, categories, faq, seo, settings, users, activity, blocks, clients] =
    await Promise.all([
      s.from("projects")
.select(`
  *,
  categories!projects_category_id_fkey(slug),
  clients!projects_client_id_fkey(name_ar, name_en)
`)
      .order("order_index"),
      s.from("media_files").select("*").order("created_at", { ascending: false }),
      s.from("messages").select("*").order("created_at", { ascending: false }),
      s.from("testimonials").select("*").order("order_index"),
      s.from("services").select("*").order("order_index"),
      s.from("categories").select("*").order("order_index"),
      s.from("faq_items").select("*").order("order_index"),
      s.from("seo_configs").select("*"),
      s.from("site_settings").select("*").limit(1).maybeSingle(),
      s.from("profiles").select("*").order("created_at"),
      s.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200),
      s.from("content_blocks").select("*"),
      s.from("clients").select("*").order("order_index"),
    ]);

  const fatal = [projects, media, messages, testimonials, services, categories, faq, seo].find((r) => r.error);
  if (fatal?.error) throw fatal.error;

  return {
    projects: (projects.data ?? []).map(mapProject),
    media: (media.data ?? []).map(mapMedia),
    messages: (messages.data ?? []).map(mapMessage),
    testimonials: (testimonials.data ?? []).map(mapTestimonial),
    services: (services.data ?? []).map(mapService),
    categories: (categories.data ?? []).map(mapCategory),
    faq: (faq.data ?? []).map(mapFaq),
    seo: (seo.data ?? []).map(mapSeo),
    settings: settings.data ? mapSettings(settings.data) : null,
    users: (users.data ?? []).map(mapUser),
    activity: (activity.data ?? []).map(mapActivity),
    blocks: (blocks.data ?? []).map(mapBlock),
    clients: (clients.data ?? []).map(mapClient),
  };
}

/* ── Projects CRUD (FK-aware) ─────────────────────────────────────── */
/** App model → DB row. Only real columns; never `category`/`client` text. */
function projectCore(p: Partial<Project>) {
  return {
    title_ar: p.title_ar, title_en: p.title_en, slug: p.slug || null,
    type_ar: p.type_ar, type_en: p.type_en,
    description_ar: p.description_ar, description_en: p.description_en,
    year: p.year, services: p.services, technologies: p.technologies,
    cover_url: p.cover_url, images: p.images,
    video_url: p.video_url, project_url: p.project_url, colors: p.colors,
    featured: p.featured, visible: p.visible, status: p.status,
    order_index: p.order_index, views: p.views,
  };
}

export const dbProjects = {
  async insert(p: Project) {
    const [category_id, client_id] = await Promise.all([
      resolveCategoryId(p.category), resolveClientId(p.client),
    ]);
    const { error } = await db().from("projects").insert({
      id: p.id, ...projectCore(p), category_id, client_id,
      cover_media_id: p.cover_media_id ?? null,
      created_at: p.createdAt, updated_at: p.updatedAt,
    });
    if (error) throw error;
  },

  async update(id: string, p: Partial<Project>) {
    const [category_id, client_id] = await Promise.all([
      p.category !== undefined ? resolveCategoryId(p.category) : Promise.resolve(undefined),
      p.client !== undefined ? resolveClientId(p.client) : Promise.resolve(undefined),
    ]);
    // PATCH semantics: only send fields that were actually provided, so a
    // partial update can never null-out unrelated columns (e.g. the slug).
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const defined = <K extends keyof Project>(k: K) => p[k] !== undefined;
    if (defined("title_ar")) row.title_ar = p.title_ar;
    if (defined("title_en")) row.title_en = p.title_en;
    if (defined("slug")) row.slug = p.slug || null;
    if (defined("type_ar")) row.type_ar = p.type_ar;
    if (defined("type_en")) row.type_en = p.type_en;
    if (defined("description_ar")) row.description_ar = p.description_ar;
    if (defined("description_en")) row.description_en = p.description_en;
    if (defined("year")) row.year = p.year;
    if (defined("services")) row.services = p.services;
    if (defined("technologies")) row.technologies = p.technologies;
    if (defined("cover_url")) row.cover_url = p.cover_url;
    if (defined("images")) row.images = p.images;
    if (defined("video_url")) row.video_url = p.video_url;
    if (defined("project_url")) row.project_url = p.project_url;
    if (defined("colors")) row.colors = p.colors;
    if (defined("featured")) row.featured = p.featured;
    if (defined("visible")) row.visible = p.visible;
    if (defined("status")) row.status = p.status;
    if (defined("order_index")) row.order_index = p.order_index;
    if (defined("views")) row.views = p.views;
    if (category_id !== undefined) row.category_id = category_id;
    if (client_id !== undefined) row.client_id = client_id;
    if (defined("cover_media_id")) row.cover_media_id = p.cover_media_id;
    const { error } = await db().from("projects").update(row).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string) {
    const { error } = await db().from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  /** Delete the project and clean up its media (no orphans): removes the
      media_files rows + Storage objects for cover/gallery URLs that belong
      to our bucket and are not referenced by any other project. Best-effort. */
  async removeWithMedia(project: Project) {
    const s = db();
    const { error } = await s.from("projects").delete().eq("id", project.id);
    if (error) throw error;

    const urls = [project.cover_url, ...(project.images ?? [])].filter(
      (u): u is string => !!u && u.includes(`/${STORAGE_BUCKET}/`),
    );
    for (const url of urls) {
      try {
        const stillUsed = await s.from("projects")
          .select("id").or(`cover_url.eq.${url},images.cs.{${url}}`).limit(1);
        if (stillUsed.data && stillUsed.data.length > 0) continue;
        const path = url.split(`${STORAGE_BUCKET}/`)[1];
        await s.from("media_files").delete().eq("url", url);
        if (path) await s.storage.from(STORAGE_BUCKET).remove([path]).then(() => undefined);
      } catch {
        /* orphan cleanup must never block deletion */
      }
    }
  },

  async reorder(updates: { id: string; order_index: number }[]) {
    await Promise.all(
      updates.map((u) => db().from("projects").update({ order_index: u.order_index }).eq("id", u.id)),
    );
  },
};

/* ── Generic table helpers ────────────────────────────────────────── */
function tableOps<T extends { id: string }>(table: string, toRow: (e: Partial<T>) => Record<string, unknown>) {
  return {
    async insert(e: T) {
      const { error } = await db().from(table).insert({ id: e.id, ...toRow(e) });
      if (error) throw error;
    },
    async update(id: string, e: Partial<T>) {
      const { error } = await db().from(table).update(toRow(e)).eq("id", id);
      if (error) throw error;
    },
    async remove(id: string) {
      const { error } = await db().from(table).delete().eq("id", id);
      if (error) throw error;
    },
  };
}

export const dbServices = tableOps<Service>("services", (x) => ({
  title_ar: x.title_ar, title_en: x.title_en, desc_ar: x.desc_ar, desc_en: x.desc_en,
  icon: x.icon, order_index: x.order_index, visible: x.visible,
}));

export const dbTestimonials = tableOps<Testimonial>("testimonials", (x) => ({
  name: x.name, company: x.company, role: x.role, avatar: x.avatar, text_ar: x.text_ar, text_en: x.text_en,
  rating: x.rating, visible: x.visible, order_index: x.order_index,
}));

export const dbCategories = tableOps<Category>("categories", (x) => ({
  slug: x.slug, label_ar: x.label_ar, label_en: x.label_en, color: x.color, order_index: x.order_index,
}));

export const dbFaq = tableOps<FaqItem>("faq_items", (x) => ({
  question_ar: x.question_ar, question_en: x.question_en, answer_ar: x.answer_ar, answer_en: x.answer_en,
  order_index: x.order_index, visible: x.visible,
}));

export const dbMessages = {
  ...tableOps<Message>("messages", (m) => ({
    name: m.name, email: m.email, phone: m.phone, company: m.company, service: m.service,
    budget: m.budget, message: m.message, status: m.status, starred: m.starred,
  })),
  async submit(m: Omit<Message, "id" | "status" | "starred" | "createdAt">) {
    const { error } = await db().from("messages").insert({ ...m, status: "unread", starred: false });
    if (error) throw error;
  },
};

export const dbSeo = {
  async upsert(page: string, data: Partial<SeoConfig>) {
    const { error } = await db()
      .from("seo_configs")
      .upsert({ page, ...data, updated_at: new Date().toISOString() }, { onConflict: "page" });
    if (error) throw error;
  },
};

export const dbSettings = {
  async update(data: Partial<SiteSettings>) {
    const { error } = await db()
      .from("site_settings")
      .upsert({ id: "site", ...data, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (error) throw error;
  },
};

export const dbUsers = {
  async updateRole(id: string, role: UserRole) {
    const { error } = await db().from("profiles").update({ role }).eq("id", id);
    if (error) throw error;
  },
  async setActive(id: string, isActive: boolean) {
    const { error } = await db().from("profiles").update({ is_active: isActive }).eq("id", id);
    if (error) throw error;
  },
  async remove(id: string) {
    const { error } = await db().from("profiles").delete().eq("id", id);
    if (error) throw error;
  },
};

export const dbActivity = {
  async insert(a: Omit<ActivityLog, "id" | "createdAt">) {
    await db().from("activity_logs").insert({
      user_id: a.userId, user_name: a.userName, action: a.action,
      resource: a.resource, resource_id: a.resourceId, details: a.details,
    }).then(({ error }) => { if (error) console.warn("[activity]", error.message); });
  },
};

/* ── Media: Storage → media_files row → linkable id ───────────────── */
const ALLOWED_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
  "pdf",
  "mp4",
  "webm",
  "json",
]);
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

/** Validate before touching Storage — extension, size and declared type. */
function validateUpload(file: File) {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXT.has(ext))
    throw new Error(`امتداد .${ext || "?"} غير مسموح — المسموح: ${[...ALLOWED_EXT].join(", ")}`);
  if (file.size > MAX_UPLOAD_BYTES)
    throw new Error(`حجم الملف ${(file.size / 1048576).toFixed(1)}MB يتجاوز الحد (15MB)`);
  if (file.size === 0) throw new Error("الملف فارغ");
}

export const dbMedia = {
  /** 1) Validate. 2) Upload to Storage. 3) Return public URL + path. */
  async upload(
  file: File,
  folder: string,
  bucket: string = STORAGE_BUCKET
): Promise<{ url: string; path: string; size: number }> {
    
    validateUpload(file);
    const s = db();
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await s.storage.from(bucket).upload(path, file, {
      cacheControl: "31536000", upsert: false, contentType: file.type,
    });
    if (error) throw error;
    const { data } = s.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl, path, size: file.size };
  },

  /** 3) Insert the media_files row so the asset gets a real, linkable id. */
  async insert(m: MediaFile) {
    const { error } = await db().from("media_files").insert({
      id: m.id, name: m.name, url: m.url, path: m.path ?? null, thumb: m.thumb,
      size: m.size, mime: m.mime, type: m.type, folder: m.folder,
      width: m.width, height: m.height, alt: m.alt, tags: m.tags,
    });
    if (error) throw error;
  },

  async update(id: string, m: Partial<MediaFile>) {
    const { error } = await db().from("media_files")
      .update({ name: m.name, alt: m.alt, tags: m.tags, folder: m.folder })
      .eq("id", id);
    if (error) throw error;
  },

  async remove(row: MediaFile) {
    const s = db();
    await s.from("media_files").delete().eq("id", row.id);
    const path = row.path ?? row.url.split(`${STORAGE_BUCKET}/`)[1];
    if (path) await s.storage.from(STORAGE_BUCKET).remove([path]).then(() => undefined);
  },
};

export const dbBlocks = {
  async upsert(key: string, data_ar: Record<string, unknown>, data_en: Record<string, unknown>) {
    const { error } = await db()
      .from("content_blocks")
      .upsert({ block_key: key, data_ar, data_en, updated_at: new Date().toISOString() }, { onConflict: "block_key" });
    if (error) throw error;
  },
};

export const dbClients = tableOps<Client>("clients", (x) => ({
  name_ar: x.name_ar, name_en: x.name_en, logo_url: x.logo_url,
  website: x.website, order_index: x.order_index, visible: x.visible,
}));

export const dbBackup = {
  async exportAll(label: string): Promise<{ url: string; size: number }> {
    const data = await fetchAll();
    const blob = new Blob([JSON.stringify({ label, exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const file = new File([blob], `backup-${Date.now()}.json`, { type: "application/json" });
    return dbMedia.upload(
  file,
  "database",
  BACKUP_BUCKET
);
  },
};
