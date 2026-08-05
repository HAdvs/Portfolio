import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../admin/types";
import { useSite } from "../lib/site";
import { cn } from "../utils/cn";

/* ──────────────────────────────────────────────────────────────────────────
   Project Details Modal — Liquid Glass, portal-based.

   Why a portal?  <motion.main> on the public site keeps `filter: blur(0px)`
   applied after its intro animation.  Any non-none `filter` (or transform)
   on an ancestor creates a CSS *containing block*, which silently re-scopes
   `position: fixed` children to that ancestor instead of the viewport —
   the exact reason the backdrop appeared while the dialog never did.
   Rendering into document.body escapes every ancestor context for good.
────────────────────────────────────────────────────────────────────────── */

interface Props {
  project: Project | null;
  onClose: () => void;
}

/* Convert common share URLs into a clean embeddable player src */
function toEmbedSrc(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  if (/player\.vimeo\.com/.test(url)) return url;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

const clipCopy = (text: string) => {
  try {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  } catch {
    return Promise.resolve();
  }
};

export function ProjectDetailsModal({ project, onClose }: Props) {
  const { t, lang, isRTL } = useSite();
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const lightboxRef = useRef(false);
  lightboxRef.current = lightbox;

  /* Reset internal state whenever a different project opens */
  useEffect(() => {
    setActiveIdx(0);
    setLightbox(false);
    setCopied(null);
  }, [project?.id]);

  /* Scroll lock + global keyboard controls (Escape / arrows) */
  useEffect(() => {
    if (!project) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (lightboxRef.current) setLightbox(false);
        else onClose();
      }
      if (lightboxRef.current && e.key === "ArrowRight") {
        setActiveIdx((i) => (i - 1 + galleryLenRef.current) % galleryLenRef.current);
      }
      if (lightboxRef.current && e.key === "ArrowLeft") {
        setActiveIdx((i) => (i + 1) % galleryLenRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, onClose]);

  /* ── Localised fields with graceful fallbacks ─────────────────────────── */
  const isAr = lang === "ar";
  const pick = (ar?: string, en?: string) => (isAr ? ar || en || "" : en || ar || "");

  const title = pick(project?.title_ar, project?.title_en) || (isAr ? "مشروع" : "Project");
  const subtitle = pick(project?.type_ar, project?.type_en);
  const description = pick(project?.description_ar, project?.description_en);
  const client = project?.client || "";
  const year = project?.year || "";
  const services = (project?.services || []).filter(Boolean);
  const techs = (project?.technologies || []).filter(Boolean);
  const colors = (project?.colors || []).filter(Boolean);
  const categoryLabel =
    t.work.filters.find((f) => f.id === project?.category)?.label || project?.category || "";
  const liveUrl = project?.project_url || "";
  const embedSrc = toEmbedSrc(project?.video_url || "");

  const gallery = Array.from(
    new Set(
      [project?.cover_url, ...(project?.images || [])].filter(
        (u): u is string => typeof u === "string" && u.length > 0,
      ),
    ),
  );
  const galleryLenRef = useRef(gallery.length);
  galleryLenRef.current = Math.max(gallery.length, 1);

  const currentImage = gallery[activeIdx] || gallery[0] || "";

  const copyColor = (hex: string) => {
    clipCopy(hex).then(() => {
      setCopied(hex);
      window.setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1600);
    });
  };

  const closeLightbox = useCallback(() => setLightbox(false), []);

  /* ── Render through a portal to escape ancestor filter/transform traps ── */
  const node = (
    <>
      <AnimatePresence>
        {project && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Frosted backdrop — click anywhere outside the dialog to close */}
            <motion.button
              type="button"
              aria-label={isAr ? "إغلاق" : "Close"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32 }}
              onClick={onClose}
              className="absolute inset-0 cursor-pointer bg-black/75 backdrop-blur-xl backdrop-saturate-150"
            />

            {/* Ambient brand glow */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-[130px]"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in srgb, var(--primary) 60%, transparent), transparent 70%)",
              }}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 26, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, y: 18, filter: "blur(8px)" }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong shadow-lux relative z-10 flex max-h-[88vh] w-[min(94vw,900px)] flex-col overflow-hidden rounded-[26px] border sm:rounded-[34px]"
              style={{
                borderColor: "var(--card-brd)",
                background: "color-mix(in srgb, var(--surface) 92%, transparent)",
              }}
            >
              {/* Floating top bar */}
              <div className="pointer-events-none absolute inset-x-4 top-4 z-30 flex items-start justify-between">
                <div className="pointer-events-auto flex flex-wrap items-center gap-2">
                  {project?.featured && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lux backdrop-blur-md"
                      style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))" }}
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      {isAr ? "مشروع مميز" : "Featured"}
                    </span>
                  )}
                  {categoryLabel && (
                    <span className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider glass shadow-lux backdrop-blur-md">
                      {categoryLabel}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label={isAr ? "إغلاق النافذة" : "Close dialog"}
                  className="glass shadow-lux pointer-events-auto grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--txt)] transition-all duration-300 hover:scale-110 hover:text-[var(--primary)]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable body */}
              <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto p-5 sm:p-8 md:p-10">
                {/* Hero media / video */}
                <div className="glass shadow-lux relative overflow-hidden rounded-[22px] sm:rounded-[28px]">
                  {embedSrc ? (
                    <div className="aspect-video w-full bg-black/40">
                      <iframe
                        src={embedSrc}
                        title={title}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : currentImage ? (
                    <button
                      type="button"
                      onClick={() => gallery.length > 0 && setLightbox(true)}
                      className="group relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden sm:aspect-[16/9]"
                      aria-label={isAr ? "عرض الصورة بحجم كامل" : "View full size"}
                    >
                      <motion.img
                        key={currentImage}
                        initial={{ opacity: 0.4, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        src={currentImage}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="pointer-events-none absolute bottom-4 end-4 inline-flex items-center gap-2 rounded-full bg-black/45 px-3.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                        {isAr ? "معاينة كاملة" : "Full preview"}
                      </span>
                    </button>
                  ) : (
                    <div className="grid aspect-[16/9] w-full place-items-center text-sm txt-muted" style={{ background: "color-mix(in srgb, var(--primary) 8%, transparent)" }}>
                      {isAr ? "لا توجد صورة متاحة" : "No image available"}
                    </div>
                  )}

                  {year && (
                    <span className="latin absolute end-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                      {year}
                    </span>
                  )}
                </div>

                {/* Gallery thumbnails */}
                {gallery.length > 1 && (
                  <div className="no-scrollbar -mx-1 flex items-center gap-3 overflow-x-auto px-1 pb-1">
                    {gallery.map((url, i) => (
                      <button
                        key={url + i}
                        type="button"
                        onClick={() => setActiveIdx(i)}
                        aria-label={`${isAr ? "صورة" : "Image"} ${i + 1}`}
                        className={cn(
                          "glass relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 sm:h-20 sm:w-32",
                          i === activeIdx
                            ? "scale-105 shadow-lux ring-2 ring-[var(--primary)]"
                            : "opacity-55 hover:opacity-100",
                        )}
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Title */}
                <div>
                  <h2 className="text-[clamp(1.5rem,4vw,2.4rem)] font-extrabold leading-tight tracking-tight">
                    {title}
                  </h2>
                  {subtitle && <p className="brand-grad mt-2 text-sm font-bold sm:text-base">{subtitle}</p>}
                </div>

                {/* Spec cards */}
                {(client || year || categoryLabel) && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {client && (
                      <div className="glass shadow-lux rounded-2xl p-4">
                        <span className="mb-1 block text-[10.5px] font-bold uppercase tracking-[0.18em] txt-muted">
                          {isAr ? "العميل" : "Client"}
                        </span>
                        <span className="block truncate text-sm font-bold">{client}</span>
                      </div>
                    )}
                    {year && (
                      <div className="glass shadow-lux rounded-2xl p-4">
                        <span className="mb-1 block text-[10.5px] font-bold uppercase tracking-[0.18em] txt-muted">
                          {isAr ? "السنة" : "Year"}
                        </span>
                        <span className="latin block text-sm font-bold">{year}</span>
                      </div>
                    )}
                    {categoryLabel && (
                      <div className="glass shadow-lux col-span-2 rounded-2xl p-4 sm:col-span-1">
                        <span className="mb-1 block text-[10.5px] font-bold uppercase tracking-[0.18em] txt-muted">
                          {isAr ? "التصنيف" : "Category"}
                        </span>
                        <span className="block text-sm font-bold uppercase tracking-wider">{categoryLabel}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {description && (
                  <div>
                    <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.22em] txt-muted">
                      {isAr ? "عن المشروع" : "Overview"}
                    </h3>
                    <p className="text-[14px] leading-[2.05] txt-muted sm:text-[15px]">{description}</p>
                  </div>
                )}

                {/* Services & technologies */}
                {(services.length > 0 || techs.length > 0) && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {services.length > 0 && (
                      <div>
                        <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.22em] txt-muted">
                          {isAr ? "الخدمات المقدمة" : "Services"}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {services.map((s, i) => (
                            <span key={i} className="glass shadow-lux rounded-full px-3.5 py-1.5 text-xs font-semibold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {techs.length > 0 && (
                      <div>
                        <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.22em] txt-muted">
                          {isAr ? "الأدوات والتقنيات" : "Tools & Tech"}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {techs.map((s, i) => (
                            <span key={i} className="latin glass shadow-lux rounded-full px-3.5 py-1.5 text-xs font-semibold text-[var(--primary)]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Palette */}
                {colors.length > 0 && (
                  <div>
                    <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.22em] txt-muted">
                      {isAr ? "لوحة الألوان" : "Palette"}
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {colors.map((hex, i) => (
                        <button
                          key={hex + i}
                          type="button"
                          onClick={() => copyColor(hex)}
                          title={isAr ? "نسخ الكود" : "Copy hex"}
                          className="glass shadow-lux flex cursor-pointer items-center gap-2 rounded-2xl py-2 pe-3.5 ps-2 transition-transform duration-300 hover:scale-105"
                        >
                          <span
                            className="h-6 w-6 rounded-xl"
                            style={{ background: hex, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.25)" }}
                          />
                          <span className="latin font-mono text-[11px] font-bold uppercase">
                            {copied === hex ? (isAr ? "تم النسخ" : "Copied") : hex}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6" style={{ borderColor: "var(--line)" }}>
                  {liveUrl ? (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold text-white shadow-lux transition-transform duration-300 hover:scale-[1.04]"
                      style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))" }}
                    >
                      {isAr ? "زيارة المشروع" : "Visit project"}
                      <svg viewBox="0 0 24 24" className={cn("h-4 w-4", isRTL && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </a>
                  ) : (
                    <span />
                  )}
                  <a
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      onClose();
                      const el = document.getElementById("contact");
                      if (el) window.scrollTo({ top: el.offsetTop - 96, behavior: "smooth" });
                    }}
                    className="glass shadow-lux inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold transition-colors duration-300 hover:text-[var(--primary)]"
                  >
                    {isAr ? "اطلب مشروعاً مماثلاً" : "Start a similar project"}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-screen lightbox */}
      <AnimatePresence>
        {project && lightbox && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md"
            style={{ background: "rgba(0,0,0,0.92)" }}
            onClick={closeLightbox}
          >
            <motion.img
              key={currentImage}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              src={currentImage}
              alt={title}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[84vh] max-w-[92vw] rounded-2xl object-contain shadow-lux"
            />

            {/* Counter */}
            {gallery.length > 1 && (
              <span className="latin absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                {activeIdx + 1} / {gallery.length}
              </span>
            )}

            {/* Prev / Next */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length);
                  }}
                  className="absolute start-4 top-1/2 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25"
                >
                  <svg viewBox="0 0 24 24" className={cn("h-5 w-5", isRTL && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m15 6-6 6 6 6" /></svg>
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx((i) => (i + 1) % gallery.length);
                  }}
                  className="absolute end-4 top-1/2 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25"
                >
                  <svg viewBox="0 0 24 24" className={cn("h-5 w-5", isRTL && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m9 6 6 6-6 6" /></svg>
                </button>
              </>
            )}

            {/* Close lightbox */}
            <button
              type="button"
              aria-label={isAr ? "إغلاق المعاينة" : "Close preview"}
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="absolute end-4 top-4 grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return createPortal(node, document.body);
}
