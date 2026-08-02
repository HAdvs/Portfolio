// ─── Core Domain Types ──────────────────────────────────────────────────────

export type UserRole = "super_admin" | "admin" | "editor" | "viewer";

export type Permission =
  | "projects:read" | "projects:write" | "projects:delete"
  | "media:read"    | "media:write"    | "media:delete"
  | "content:read"  | "content:write"
  | "settings:read" | "settings:write"
  | "users:read"    | "users:write"    | "users:delete"
  | "messages:read" | "messages:delete"
  | "seo:read"      | "seo:write"
  | "analytics:read";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "projects:read","projects:write","projects:delete",
    "media:read","media:write","media:delete",
    "content:read","content:write",
    "settings:read","settings:write",
    "users:read","users:write","users:delete",
    "messages:read","messages:delete",
    "seo:read","seo:write",
    "analytics:read",
  ],
  admin: [
    "projects:read","projects:write","projects:delete",
    "media:read","media:write","media:delete",
    "content:read","content:write",
    "settings:read","settings:write",
    "messages:read","messages:delete",
    "seo:read","seo:write",
    "analytics:read",
  ],
  editor: [
    "projects:read","projects:write",
    "media:read","media:write",
    "content:read","content:write",
    "messages:read",
    "seo:read","seo:write",
    "analytics:read",
  ],
  viewer: [
    "projects:read","media:read","content:read",
    "settings:read","messages:read","seo:read","analytics:read",
  ],
};

// ─── User ───────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  twoFA: boolean;
  lastLogin?: string;
  createdAt: string;
  isActive: boolean;
}

// ─── Project ────────────────────────────────────────────────────────────────
export type ProjectStatus = "draft" | "published" | "archived";

export interface Project {
  id: string;
  title_ar: string;
  title_en: string;
  slug: string;
  type_ar: string;
  type_en: string;
  description_ar: string;
  description_en: string;
  client: string;
  year: string;
  category: string;
  services: string[];
  technologies: string[];
  cover_url: string;
  /* ── Relational FKs (resolved by the repository layer) ─────────────
     The app works with `category` (slug) / `client` (name) / `cover_url`;
     db.ts translates them to these foreign keys at the Supabase boundary. */
  category_id?: string | null;
  client_id?: string | null;
  cover_media_id?: string | null;
  images: string[];
  video_url?: string;
  project_url?: string;
  colors: string[];
  featured: boolean;
  visible: boolean;
  status: ProjectStatus;
  order_index: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Media ──────────────────────────────────────────────────────────────────
export type MediaType = "image" | "video" | "pdf" | "svg" | "other";

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  path?: string;
  thumb?: string;
  size: number;
  mime: string;
  type: MediaType;
  folder: string;
  width?: number;
  height?: number;
  alt?: string;
  tags: string[];
  createdAt: string;
}

// ─── Message / Contact ──────────────────────────────────────────────────────
export type MessageStatus = "unread" | "read" | "replied" | "archived";

export interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  status: MessageStatus;
  starred: boolean;
  createdAt: string;
}

// ─── Testimonial ────────────────────────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  avatar?: string;
  text_ar: string;
  text_en: string;
  rating: number;
  visible: boolean;
  order_index: number;
  createdAt: string;
}

// ─── Service ────────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
  icon: string;
  order_index: number;
  visible: boolean;
}

// ─── FAQ ────────────────────────────────────────────────────────────────────
export interface FaqItem {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  order_index: number;
  visible: boolean;
}

// ─── Category ───────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  slug: string;
  label_ar: string;
  label_en: string;
  color?: string;
  order_index: number;
}

// ─── SEO ────────────────────────────────────────────────────────────────────
export interface SeoConfig {
  id: string;
  page: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  keywords: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_card: "summary" | "summary_large_image";
  canonical?: string;
  robots: string;
  updatedAt: string;
}

// ─── Site Settings ──────────────────────────────────────────────────────────
export interface SiteSettings {
  id: string;
  site_name: string;
  tagline_ar: string;
  tagline_en: string;
  logo_url: string;
  favicon_url: string;
  og_image: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_ar: string;
  font_en: string;
  email: string;
  phone: string;
  whatsapp: string;
  location_ar: string;
  location_en: string;
  social_instagram: string;
  social_behance: string;
  social_linkedin: string;
  social_x: string;
  social_youtube: string;
  social_dribbble: string;
  ga_id: string;
  gtm_id: string;
  hotjar_id: string;
  maintenance_mode: boolean;
  default_lang: "ar" | "en";
  timezone: string;
  updatedAt: string;
}

// ─── Activity Log ────────────────────────────────────────────────────────────
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ip?: string;
  createdAt: string;
}

// ─── Analytics ──────────────────────────────────────────────────────────────
export interface AnalyticsData {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  bounceRate: number;
  avgSession: string;
  topPages: { page: string; views: number }[];
  visitsByDay: { date: string; visits: number }[];
  visitsByCountry: { country: string; visits: number; flag: string }[];
  deviceBreakdown: { device: string; pct: number }[];
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export interface DashboardStats {
  totalProjects: number;
  publishedProjects: number;
  totalMessages: number;
  unreadMessages: number;
  totalMedia: number;
  storageUsed: number;
  totalServices: number;
  totalTestimonials: number;
  recentActivity: ActivityLog[];
  analytics: AnalyticsData;
}

// ─── Backup ──────────────────────────────────────────────────────────────────
export interface Backup {
  id: string;
  label: string;
  size: number;
  type: "auto" | "manual";
  createdAt: string;
  url?: string;
}

// ─── Client / brand ──────────────────────────────────────────────────────────
export interface Client {
  id: string;
  name_ar: string;
  name_en: string;
  logo_url: string;
  website?: string;
  order_index: number;
  visible: boolean;
}

// ─── Bilingual text block (Hero / About / CTA) ───────────────────────────────
export interface ContentBlock {
  block_key: string;
  data_ar: Record<string, unknown>;
  data_en: Record<string, unknown>;
  updatedAt: string;
}

// ─── Notification ────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
