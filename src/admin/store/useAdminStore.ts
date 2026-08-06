import { useMemo } from "react";
import { create } from "zustand";
import type {
  ActivityLog, AdminUser, Backup, Category, Client, ContentBlock, DashboardStats, FaqItem,
  MediaFile, Message, Notification, Project, SeoConfig, Service,
  SiteSettings, Testimonial, UserRole,
} from "../types";
import {
  dbProjects, dbServices, dbTestimonials, dbCategories, dbFaq, dbMessages,
  dbSeo, dbSettings, dbUsers, dbActivity, dbMedia, dbBackup, dbBlocks, dbClients,
  fetchAll,
} from "../../lib/cms/db";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import { extractMessage, friendlyError } from "../../lib/cms/errors";
import { toast } from "../components/ui";

/* ════════════════════════════════════════════════════════════════════
   CMS store — in-memory working cache over Supabase.

   • NO localStorage / sessionStorage persistence of content.
   • NO seed or mock data — the database is the single source of truth.
   • Hydration happens via CmsProvider (fetchAll) after auth.
   • Every mutation updates the cache optimistically AND writes through
     to PostgreSQL; realtime subscriptions push remote changes back in.
   ════════════════════════════════════════════════════════════════════ */

/* UUID ids everywhere — valid for both `uuid` and `text` columns, so the
   app, the repository and the database share one identifier type. */
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 10)}`;
const now = () => new Date().toISOString();

/** Surface DB errors as a readable Arabic notification — never [object Object] */
const fail = (get: () => AdminStore, action: string, e: unknown) => {
  const msg = friendlyError(e, action);
  get().pushNotification({ type: "error", title: "فشلت العملية", message: msg });
  toast(msg, "error", extractMessage(e));
  console.error("[cms]", action, e, "→", extractMessage(e));
};

export type DbStatus = "unconfigured" | "offline" | "syncing" | "online" | "error";

export interface AdminStore {
  // data (DB-backed)
  projects: Project[];
  media: MediaFile[];
  messages: Message[];
  testimonials: Testimonial[];
  services: Service[];
  categories: Category[];
  faq: FaqItem[];
  seo: SeoConfig[];
  settings: SiteSettings | null;
  users: AdminUser[];
  activity: ActivityLog[];
  backups: Backup[];
  blocks: ContentBlock[];
  clients: Client[];
  analytics: DashboardStats["analytics"];

  // local-only UI state
  notifications: Notification[];
  sidebarCollapsed: boolean;
  adminTheme: "light" | "dark" | "system";
  setAdminTheme: (t: "light" | "dark" | "system") => void;
  dbStatus: DbStatus;
  lastSync: string | null;

  // hydration / realtime
  hydrate: (data: Awaited<ReturnType<typeof import("../../lib/cms/db").fetchAll>>) => void;
  setDbStatus: (s: DbStatus) => void;
  applyRemote: (table: string, type: "INSERT" | "UPDATE" | "DELETE", row: Record<string, unknown>) => void;

  // projects
  addProject: (p: Omit<Project, "id" | "createdAt" | "updatedAt" | "views">) => Project;
  updateProject: (id: string, p: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (ids: string[]) => void;
  bulkDeleteProjects: (ids: string[]) => void;
  bulkUpdateStatus: (ids: string[], status: Project["status"]) => void;

  // media
  uploadFiles: (files: File[], folder: string) => Promise<void>;
  deleteMedia: (id: string) => void;
  bulkDeleteMedia: (ids: string[]) => void;
  updateMediaMeta: (id: string, data: Partial<MediaFile>) => void;

  // messages
  updateMessageStatus: (id: string, status: Message["status"]) => void;
  toggleStarMessage: (id: string) => void;
  deleteMessage: (id: string) => void;
  bulkDeleteMessages: (ids: string[]) => void;

  // testimonials / services / categories / faq
  addTestimonial: (t: Omit<Testimonial, "id" | "createdAt">) => void;
  updateTestimonial: (id: string, t: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  addService: (s: Omit<Service, "id">) => void;
  updateService: (id: string, s: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addFaq: (f: Omit<FaqItem, "id">) => void;
  updateFaq: (id: string, f: Partial<FaqItem>) => void;
  deleteFaq: (id: string) => void;

  // content blocks / clients
  updateBlock: (key: string, lang: "ar" | "en", data: Record<string, unknown>) => void;
  addClient: (cl: Omit<Client, "id">) => void;
  updateClient: (id: string, cl: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // seo / settings
  updateSeo: (page: string, s: Partial<SeoConfig>) => void;
  updateSettings: (s: Partial<SiteSettings>) => void;

  // users
  addUser: (u: Omit<AdminUser, "id" | "createdAt">) => void;
  updateUser: (id: string, u: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
  updateUserRole: (id: string, role: UserRole) => void;

  // notifications / activity / backups / ui
  pushNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotification: (id: string) => void;
  addActivity: (a: Omit<ActivityLog, "id" | "createdAt">) => void;
  createBackup: (label: string) => Promise<void>;
  restoreBackup: (payload: import("../../lib/cms/db").BackupPayload) => Promise<void>;
  deleteBackup: (id: string) => Promise<void>;
  toggleSidebar: () => void;
  toggleAdminTheme: () => void;
  setConnected: (v: boolean) => void;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "site", site_name: "YourMark", tagline_ar: "", tagline_en: "", logo_url: "", favicon_url: "",
  og_image: "", primary_color: "#0a84ff", secondary_color: "#1e3a8a", accent_color: "#3d8dff",
  font_ar: "IBM Plex Sans Arabic", font_en: "Inter", email: "", phone: "", whatsapp: "",
  location_ar: "", location_en: "", social_instagram: "", social_behance: "", social_linkedin: "",
  social_x: "", social_youtube: "", social_dribbble: "", ga_id: "", gtm_id: "", hotjar_id: "",
  maintenance_mode: false, default_lang: "ar", timezone: "Asia/Riyadh", updatedAt: now(),
};

export const useAdminStore = create<AdminStore>()((set, get) => ({
  // ── empty until hydrated from PostgreSQL ──────────────────────────
  projects: [], media: [], messages: [], testimonials: [], services: [],
  categories: [], faq: [], seo: [], settings: null, users: [], activity: [], backups: [],
  blocks: [],
clients: [],

analytics: {
  totalVisitors: 0,
  uniqueVisitors: 0,
  pageViews: 0,
  bounceRate: 0,
  avgSession: "0:00",
  topPages: [],
  topBrowsers: [],
  topReferrers: [],
  topCities: [],
  visitsByDay: [],
  visitsByCountry: [],
  deviceBreakdown: [],
},

  notifications: [],
  sidebarCollapsed: false,
  adminTheme: "light",
  setAdminTheme: (t) => set({ adminTheme: t }),
  dbStatus: isSupabaseConfigured ? "offline" : "unconfigured",
  lastSync: null,

  // ── hydration / realtime ──────────────────────────────────────────
hydrate: (data) =>
  set({
    projects: data.projects,
    media: data.media,
    messages: data.messages,
    testimonials: data.testimonials,
    services: data.services,
    categories: data.categories,
    faq: data.faq,
    seo: data.seo,
    settings: data.settings ?? DEFAULT_SETTINGS,

    users: data.users,
    activity: data.activity,

    blocks: data.blocks ?? [],
    clients: data.clients ?? [],
backups: data.backups ?? [],
analytics: data.analytics,
    dbStatus: "online",
    lastSync: now(),
  }),
  setDbStatus: (s) => set({ dbStatus: s }),

  applyRemote: (table, type, row) => {
    const id = (row.id ?? row.block_key) as string;
    const map: Record<string, keyof AdminStore> = {
  projects: "projects",
  media_files: "media",
  messages: "messages",
  testimonials: "testimonials",
  services: "services",
  categories: "categories",
  faq_items: "faq",
  seo_configs: "seo",
  site_settings: "settings",
  profiles: "users",
  activity_logs: "activity",
  content_blocks: "blocks",
  clients: "clients",
  backup_files: "backups",
};
    const key = map[table];
    if (!key) return;
    set((s) => {
      const list = s[key] as { id?: string; block_key?: string }[];
      if (table === "site_settings") {
        return { settings: (row && Object.keys(row).length ? (row as unknown as SiteSettings) : s.settings) };
      }
      if (table === "content_blocks") {
        const bk = row.block_key as string;
        const blocks = s.blocks;
        if (type === "DELETE") return { blocks: blocks.filter((b) => b.block_key !== bk) };
        const mapped = { block_key: bk, data_ar: (row.data_ar as Record<string, unknown>) ?? {}, data_en: (row.data_en as Record<string, unknown>) ?? {}, updatedAt: now() };
        const exists = blocks.some((b) => b.block_key === bk);
        return { blocks: exists ? blocks.map((b) => (b.block_key === bk ? mapped : b)) : [...blocks, mapped] };
      }
      if (type === "DELETE") return { [key]: list.filter((x) => x.id !== id) } as Partial<AdminStore>;
      const exists = list.some((x) => x.id === id);
      const next = exists
        ? list.map((x) => (x.id === id ? ({ ...x, ...row } as typeof x) : x))
        : [...list, row as (typeof list)[number]];
      return { [key]: next } as Partial<AdminStore>;
    });
  },

  // ── projects ──────────────────────────────────────────────────────
  addProject: (p) => {
    const project: Project = { ...p, id: uid(), views: 0, createdAt: now(), updatedAt: now() };
    set((s) => ({ projects: [project, ...s.projects] }));
    if (isSupabaseConfigured) dbProjects.insert(project).catch((e) => fail(get, "إضافة مشروع", e));
    get().addActivity({ userId: "me", userName: "Admin", action: "إضافة مشروع", resource: "projects", resourceId: project.id, details: `أضاف مشروع: ${project.title_ar}` });
    return project;
  },
  updateProject: (id, p) => {
    set((s) => ({ projects: s.projects.map((pr) => (pr.id === id ? { ...pr, ...p, updatedAt: now() } : pr)) }));
    if (isSupabaseConfigured) dbProjects.update(id, p).catch((e) => fail(get, "تعديل مشروع", e));
  },
  deleteProject: (id) => {
    const project = get().projects.find((p) => p.id === id);
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    if (isSupabaseConfigured) {
      const op = project ? dbProjects.removeWithMedia(project) : dbProjects.remove(id);
      op.catch((e) => fail(get, "حذف مشروع", e));
    }
  },
  reorderProjects: (ids) => {
    set((s) => ({ projects: ids.map((id, i) => { const p = s.projects.find((pr) => pr.id === id)!; return { ...p, order_index: i }; }) }));
    if (isSupabaseConfigured) dbProjects.reorder(ids.map((id, i) => ({ id, order_index: i }))).catch((e) => fail(get, "ترتيب المشاريع", e));
  },
  bulkDeleteProjects: (ids) => {
    set((s) => ({ projects: s.projects.filter((p) => !ids.includes(p.id)) }));
    if (isSupabaseConfigured) Promise.all(ids.map((id) => dbProjects.remove(id))).catch((e) => fail(get, "حذف جماعي", e));
  },
  bulkUpdateStatus: (ids, status) => {
    set((s) => ({ projects: s.projects.map((p) => (ids.includes(p.id) ? { ...p, status } : p)) }));
    if (isSupabaseConfigured) Promise.all(ids.map((id) => dbProjects.update(id, { status }))).catch((e) => fail(get, "تحديث جماعي", e));
  },

  // ── media (Supabase Storage + DB row) ─────────────────────────────
  uploadFiles: async (files, folder) => {
    if (!isSupabaseConfigured) { fail(get, "رفع الوسائط", new Error("قاعدة البيانات غير مهيأة")); return; }
    for (const file of files) {
      try {
        // Full flow: Storage upload → media_files row → linkable id
        const { url, path, size } = await dbMedia.upload(file, folder);
        const isImg = file.type.startsWith("image/");
        const row: MediaFile = {
          id: uid(), name: file.name, url, path, size, mime: file.type,
          type: file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "pdf" : file.type === "image/svg+xml" ? "svg" : isImg ? "image" : "other",
          folder, tags: [], createdAt: now(),
        };
        await dbMedia.insert(row);
        set((s) => ({ media: [row, ...s.media] }));
      } catch (e) {
        fail(get, `رفع ${file.name}`, e);
      }
    }
    get().pushNotification({ type: "success", title: "اكتمل الرفع", message: `تم رفع ${files.length} ملف إلى التخزين السحابي` });
  },
  deleteMedia: (id) => {
    const row = get().media.find((m) => m.id === id);
    set((s) => ({ media: s.media.filter((m) => m.id !== id) }));
    if (isSupabaseConfigured && row) dbMedia.remove(row).catch((e) => fail(get, "حذف ملف", e));
  },
  bulkDeleteMedia: (ids) => {
    const rows = get().media.filter((m) => ids.includes(m.id));
    set((s) => ({ media: s.media.filter((m) => !ids.includes(m.id)) }));
    if (isSupabaseConfigured) Promise.all(rows.map((r) => dbMedia.remove(r))).catch((e) => fail(get, "حذف جماعي للملفات", e));
  },
  updateMediaMeta: (id, data) => {
    set((s) => ({ media: s.media.map((m) => (m.id === id ? { ...m, ...data } : m)) }));
  },

  // ── messages ──────────────────────────────────────────────────────
  updateMessageStatus: (id, status) => {
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, status } : m)) }));
    if (isSupabaseConfigured) dbMessages.update(id, { status }).catch((e) => fail(get, "تحديث رسالة", e));
  },
  toggleStarMessage: (id) => {
    const starred = !get().messages.find((m) => m.id === id)?.starred;
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, starred } : m)) }));
    if (isSupabaseConfigured) dbMessages.update(id, { starred }).catch((e) => fail(get, "تمييز رسالة", e));
  },
  deleteMessage: (id) => {
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) }));
    if (isSupabaseConfigured) dbMessages.remove(id).catch((e) => fail(get, "حذف رسالة", e));
  },
  bulkDeleteMessages: (ids) => {
    set((s) => ({ messages: s.messages.filter((m) => !ids.includes(m.id)) }));
    if (isSupabaseConfigured) Promise.all(ids.map((id) => dbMessages.remove(id))).catch((e) => fail(get, "حذف جماعي للرسائل", e));
  },

  // ── testimonials ──────────────────────────────────────────────────
  addTestimonial: (t) => {
    const row: Testimonial = { ...t, id: uid(), createdAt: now() };
    set((s) => ({ testimonials: [...s.testimonials, row] }));
    if (isSupabaseConfigured) dbTestimonials.insert(row).catch((e) => fail(get, "إضافة شهادة", e));
  },
  updateTestimonial: (id, t) => {
    set((s) => ({ testimonials: s.testimonials.map((x) => (x.id === id ? { ...x, ...t } : x)) }));
    if (isSupabaseConfigured) dbTestimonials.update(id, t).catch((e) => fail(get, "تعديل شهادة", e));
  },
  deleteTestimonial: (id) => {
    set((s) => ({ testimonials: s.testimonials.filter((x) => x.id !== id) }));
    if (isSupabaseConfigured) dbTestimonials.remove(id).catch((e) => fail(get, "حذف شهادة", e));
  },

  // ── services ─────────────────────────────────────────────────────
  addService: (sv) => {
    const row: Service = { ...sv, id: uid() };
    set((s) => ({ services: [...s.services, row] }));
    if (isSupabaseConfigured) dbServices.insert(row).catch((e) => fail(get, "إضافة خدمة", e));
  },
  updateService: (id, sv) => {
    set((s) => ({ services: s.services.map((x) => (x.id === id ? { ...x, ...sv } : x)) }));
    if (isSupabaseConfigured) dbServices.update(id, sv).catch((e) => fail(get, "تعديل خدمة", e));
  },
  deleteService: (id) => {
    set((s) => ({ services: s.services.filter((x) => x.id !== id) }));
    if (isSupabaseConfigured) dbServices.remove(id).catch((e) => fail(get, "حذف خدمة", e));
  },

  // ── categories ────────────────────────────────────────────────────
  addCategory: (c2) => {
    const row: Category = { ...c2, id: uid() };
    set((s) => ({ categories: [...s.categories, row] }));
    if (isSupabaseConfigured) dbCategories.insert(row).catch((e) => fail(get, "إضافة تصنيف", e));
  },
  updateCategory: (id, c2) => {
    set((s) => ({ categories: s.categories.map((x) => (x.id === id ? { ...x, ...c2 } : x)) }));
    if (isSupabaseConfigured) dbCategories.update(id, c2).catch((e) => fail(get, "تعديل تصنيف", e));
  },
  deleteCategory: (id) => {
    set((s) => ({ categories: s.categories.filter((x) => x.id !== id) }));
    if (isSupabaseConfigured) dbCategories.remove(id).catch((e) => fail(get, "حذف تصنيف", e));
  },

  // ── faq ───────────────────────────────────────────────────────────
  addFaq: (f) => {
    const row: FaqItem = { ...f, id: uid() };
    set((s) => ({ faq: [...s.faq, row] }));
    if (isSupabaseConfigured) dbFaq.insert(row).catch((e) => fail(get, "إضافة سؤال", e));
  },
  updateFaq: (id, f) => {
    set((s) => ({ faq: s.faq.map((x) => (x.id === id ? { ...x, ...f } : x)) }));
    if (isSupabaseConfigured) dbFaq.update(id, f).catch((e) => fail(get, "تعديل سؤال", e));
  },
  deleteFaq: (id) => {
    set((s) => ({ faq: s.faq.filter((x) => x.id !== id) }));
    if (isSupabaseConfigured) dbFaq.remove(id).catch((e) => fail(get, "حذف سؤال", e));
  },

  // ── content blocks / clients ──────────────────────────────────────
  updateBlock: (key, lang, data) => {
    set((s) => {
      const existing = s.blocks.find((b) => b.block_key === key);
      const merged: ContentBlock = {
        block_key: key,
        data_ar: lang === "ar" ? { ...(existing?.data_ar ?? {}), ...data } : (existing?.data_ar ?? {}),
        data_en: lang === "en" ? { ...(existing?.data_en ?? {}), ...data } : (existing?.data_en ?? {}),
        updatedAt: now(),
      };
      return { blocks: existing ? s.blocks.map((b) => (b.block_key === key ? merged : b)) : [...s.blocks, merged] };
    });
    if (isSupabaseConfigured) {
      const b = get().blocks.find((x) => x.block_key === key);
      if (b) dbBlocks.upsert(key, b.data_ar, b.data_en).catch((e) => fail(get, "حفظ المحتوى النصي", e));
    }
  },
  addClient: (cl) => {
    const row: Client = { ...cl, id: uid() };
    set((s) => ({ clients: [...s.clients, row] }));
    if (isSupabaseConfigured) dbClients.insert(row).catch((e) => fail(get, "إضافة عميل", e));
  },
  updateClient: (id, cl) => {
    set((s) => ({ clients: s.clients.map((x) => (x.id === id ? { ...x, ...cl } : x)) }));
    if (isSupabaseConfigured) dbClients.update(id, cl).catch((e) => fail(get, "تعديل عميل", e));
  },
  deleteClient: (id) => {
    set((s) => ({ clients: s.clients.filter((x) => x.id !== id) }));
    if (isSupabaseConfigured) dbClients.remove(id).catch((e) => fail(get, "حذف عميل", e));
  },

  // ── seo / settings ────────────────────────────────────────────────
  updateSeo: (page, sv) => {
    set((s) => {
      const exists = s.seo.some((x) => x.page === page);
      const next = exists ? s.seo.map((x) => (x.page === page ? { ...x, ...sv, updatedAt: now() } : x)) : [...s.seo, { ...sv, id: uid(), page, updatedAt: now() } as SeoConfig];
      return { seo: next };
    });
    if (isSupabaseConfigured) dbSeo.upsert(page, sv).catch((e) => fail(get, "حفظ SEO", e));
  },
  updateSettings: (sv) => {
    set((s) => ({ settings: { ...(s.settings ?? DEFAULT_SETTINGS), ...sv, updatedAt: now() } }));
    if (isSupabaseConfigured) dbSettings.update(sv).catch((e) => fail(get, "حفظ الإعدادات", e));
  },

  // ── users ─────────────────────────────────────────────────────────
  addUser: (u) => set((s) => ({ users: [...s.users, { ...u, id: uid(), createdAt: now() }] })),
  updateUser: (id, u) => set((s) => ({ users: s.users.map((x) => (x.id === id ? { ...x, ...u } : x)) })),
  deleteUser: (id) => {
    set((s) => ({ users: s.users.filter((x) => x.id !== id) }));
    if (isSupabaseConfigured) dbUsers.remove(id).catch((e) => fail(get, "حذف مستخدم", e));
  },
  updateUserRole: (id, role) => {
    set((s) => ({ users: s.users.map((x) => (x.id === id ? { ...x, role } : x)) }));
    if (isSupabaseConfigured) dbUsers.updateRole(id, role).catch((e) => fail(get, "تحديث صلاحية", e));
  },

  // ── notifications / activity / backups / ui ───────────────────────
  pushNotification: (n) => set((s) => ({ notifications: [{ ...n, id: uid(), read: false, createdAt: now() }, ...s.notifications].slice(0, 30) })),
  markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  clearNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  addActivity: (a) => {
    set((s) => ({ activity: [{ ...a, id: uid(), createdAt: now() }, ...s.activity].slice(0, 200) }));
    if (isSupabaseConfigured) dbActivity.insert(a).catch(() => undefined);
  },
  createBackup: async (label) => {
    if (!isSupabaseConfigured) {
      fail(get, "نسخ احتياطي", new Error("قاعدة البيانات غير مهيأة"));
      return;
    }

    try {
      const backup = await dbBackup.exportAll(label);

      set((s) => ({
        backups: [
          {
            id: backup.id,
            label,
            filename: backup.filename,
            path: backup.path,
            size: backup.size,
            type: "manual",
            version: backup.version,
            checksum: backup.checksum,
            createdAt: now(),
            url: backup.url,
          },
          ...s.backups,
        ],
      }));

      get().pushNotification({
        type: "success",
        title: "تم إنشاء نسخة احتياطية",
        message: label,
      });
    } catch (e) {
      fail(get, "نسخ احتياطي", e);
    }
  },
  restoreBackup: async (payload) => {
    if (!isSupabaseConfigured) {
      fail(get, "استعادة النسخة", new Error("قاعدة البيانات غير مهيأة"));
      return;
    }

    try {
      await dbBackup.restoreBackup(payload, { deleteExisting: true });
      const data = await fetchAll();
      get().hydrate(data);

      get().pushNotification({
        type: "success", title: "تمت الاستعادة", message: "تمت إعادة تحميل بيانات CMS من النسخة الاحتياطية.",
      });
    } catch (e) {
      fail(get, "استعادة النسخة", e);
    }
  },
  deleteBackup: async (id) => {
    if (!isSupabaseConfigured) {
      fail(get, "حذف النسخة", new Error("قاعدة البيانات غير مهيأة"));
      return;
    }

    try {
      await dbBackup.deleteBackup(id);
      set((s) => ({ backups: s.backups.filter((b) => b.id !== id) }));
      get().pushNotification({ type: "success", title: "تم حذف النسخة", message: "تم حذف النسخة بنجاح." });
    } catch (e) {
      fail(get, "حذف النسخة", e);
    }
  },
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleAdminTheme: () => set((s) => ({ adminTheme: s.adminTheme === "dark" ? "light" : "dark" })),
  setConnected: (v) => set({ dbStatus: v ? "online" : "offline" }),
}));

// ─── Computed selector (safe — stable slices + useMemo at call sites) ────────
export const selectDashboardStats = (s: AdminStore): DashboardStats => {
  const projects = s.projects ?? [];
  const messages = s.messages ?? [];
  const media = s.media ?? [];
 return {
  totalProjects: projects.length,
  publishedProjects: projects.filter((p) => p.status === "published").length,
  totalMessages: messages.length,
  unreadMessages: messages.filter((m) => m.status === "unread").length,
  totalMedia: media.length,
  storageUsed: media.reduce((acc, m) => acc + (m?.size ?? 0), 0),
  totalServices: (s.services ?? []).length,
  totalTestimonials: (s.testimonials ?? []).length,
  recentActivity: (s.activity ?? []).slice(0, 8),

  analytics: s.analytics,
};
};

export function useDashboardStats(): DashboardStats {
  const projects = useAdminStore((s) => s.projects);
  const messages = useAdminStore((s) => s.messages);
  const media = useAdminStore((s) => s.media);
  const services = useAdminStore((s) => s.services);
  const testimonials = useAdminStore((s) => s.testimonials);
  const activity = useAdminStore((s) => s.activity);
  const analytics = useAdminStore((s) => s.analytics);

  return useMemo(
    () =>
      selectDashboardStats({
        projects,
        messages,
        media,
        services,
        testimonials,
        activity,
        analytics,
      } as AdminStore),
    [
      projects,
      messages,
      media,
      services,
      testimonials,
      activity,
      analytics,
    ],
  );
}
