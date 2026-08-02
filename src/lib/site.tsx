import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { content, LOGO, LOGO_HERO, type Lang } from "./content";
import { useAdminStore } from "../admin/store/useAdminStore";
import type { Client, SiteSettings, SeoConfig } from "../admin/types";

type Theme = "light" | "dark";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (typeof content)["ar"];
  isRTL: boolean;
  /** Brand logo URL — live from CMS settings, falls back to the original asset */
  logo: string;
  /** Dedicated hero visual — swaps automatically if the admin uploads a custom logo */
  heroLogo: string;
  settings: SiteSettings;
  seoHome: SeoConfig | undefined;
  /** Clients / brands — live from the database */
  clients: Client[];
};



const SiteCtx = createContext<Ctx | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return (v as T) ?? fallback;
  } catch {
    return fallback;
  }
};

const SITE_URL = "https://yourmark.studio";

/* Module-level fallbacks — stable identity across renders. Using an inline
   `?? {}` / `?? []` would hand Zustand a brand-new reference every render,
   which in v5 can trigger a getSnapshot / update-depth loop. */
const FALLBACK_SETTINGS = {} as SiteSettings;
const FALLBACK_SEO: SeoConfig[] = [];

function setMetaTag(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

export function SiteProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => read<Theme>("ym-theme", "light"));
  const [lang, setLangState] = useState<Lang>(() => read<Lang>("ym-lang", "ar"));

  /* Defensive selectors: persisted state from an older schema must never
     crash the app — always fall back to sane defaults. */
  const settings = useAdminStore((s) => s.settings) ?? FALLBACK_SETTINGS;
  const seo = useAdminStore((s) => s.seo) ?? FALLBACK_SEO;
  const blocks = useAdminStore((s) => s.blocks);
  const clients = useAdminStore((s) => s.clients);
  const seoHome = useMemo(
    () => (Array.isArray(seo) ? seo.find((x) => x.page === "home") : undefined),
    [seo],
  );

  /* Live cross-device sync is handled by Supabase Realtime inside
     CmsProvider — no localStorage content, no storage events needed. */

  /* Theme */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#050505" : "#ffffff");
    try {
      localStorage.setItem("ym-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  /* Language + direction */
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = content[lang].dir;
    try {
      localStorage.setItem("ym-lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  /* Brand colors from CMS → CSS custom properties (re-themes the whole site instantly) */
  useEffect(() => {
    const root = document.documentElement;
    if (settings.primary_color) root.style.setProperty("--primary", settings.primary_color);
    if (settings.secondary_color) root.style.setProperty("--secondary", settings.secondary_color);
    if (settings.accent_color) root.style.setProperty("--primary-soft", settings.accent_color);
  }, [settings.primary_color, settings.secondary_color, settings.accent_color]);

  /* Dynamic SEO meta — reflects CMS settings & per-language content */
  useEffect(() => {
    const isAr = lang === "ar";
    const title =
      (isAr ? seoHome?.title_ar : seoHome?.title_en) ||
      (isAr
        ? "YourMark — وكالة تصميم الهوية البصرية والعلامات التجارية"
        : "YourMark — Brand Identity & Logo Design Agency");
    const desc =
      (isAr ? seoHome?.description_ar : seoHome?.description_en) ||
      (isAr
        ? "وكالة تصميم إبداعية متخصصة في بناء الهويات البصرية وتصميم الشعارات وصناعة التجارب البصرية."
        : "A creative agency specialised in brand identities, logo design and visual experiences.");

    document.title = title;
    setMetaTag("name", "description", desc);
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", desc);
    setMetaTag("property", "og:locale", isAr ? "ar_SA" : "en_US");
    setMetaTag("property", "og:url", `${SITE_URL}/`);
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", desc);
    if (settings.og_image) {
      setMetaTag("property", "og:image", settings.og_image);
      setMetaTag("name", "twitter:image", settings.og_image);
    }
    if (seoHome?.keywords?.length) {
      setMetaTag("name", "keywords", seoHome.keywords.join(", "));
    }

    /* canonical */
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = seoHome?.canonical || `${SITE_URL}/`;

    /* favicon from CMS */
    if (settings.favicon_url) {
      let icon = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (icon) icon.href = settings.favicon_url;
    }
  }, [lang, seoHome, settings.og_image, settings.favicon_url]);

  const toggleTheme = useCallback(() => setTheme((p) => (p === "dark" ? "light" : "dark")), []);
  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggleLang = useCallback(() => setLangState((p) => (p === "ar" ? "en" : "ar")), []);

  /* Hero / About / CTA copy is edited in the CMS (content_blocks table) and
     deep-merged over the bundled dictionary; everything else (projects,
     services, settings, SEO…) comes straight from the DB store. */
  const t = useMemo(() => {
    const base = JSON.parse(JSON.stringify(content[lang])) as (typeof content)["ar"];
    const pick = (key: string) => {
      const b = blocks.find((x) => x.block_key === key);
      return (lang === "ar" ? b?.data_ar : b?.data_en) as Record<string, unknown> | undefined;
    };
    const hero = pick("hero");
    const about = pick("about");
    const cta = pick("cta");
    if (hero) Object.assign(base.hero, hero);
    if (about) Object.assign(base.about, about);
    if (cta) Object.assign(base.cta, cta);
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, blocks]);

  const logo = settings.logo_url || LOGO;
  const heroLogo =
    settings.logo_url && settings.logo_url !== LOGO ? settings.logo_url : LOGO_HERO;

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      toggleLang,
      theme,
      toggleTheme,
      t,
      isRTL: lang === "ar",
      logo,
      heroLogo,
      settings,
      seoHome,
      clients,
    }),
    [lang, theme, t, setLang, toggleLang, toggleTheme, logo, heroLogo, settings, seoHome, clients],
  );

  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteCtx);
  if (!ctx) throw new Error("useSite must be inside SiteProvider");
  return ctx;
}
