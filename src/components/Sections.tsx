import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PORTFOLIO_IMAGES } from "../lib/content";
import { useSite } from "../lib/site";
import { cn } from "../utils/cn";
import { Counter, Reveal, SectionHead, Tilt } from "./ui";
import { useAdminStore } from "../admin/store/useAdminStore";
import type { Project } from "../admin/types";
import { ProjectDetailsModal } from "./ProjectDetailsModal";

/* ================= Icons ================= */
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ICONS = [
  <path key="1" d="M4 20V6a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z M14 4v5h5 M8 13h8 M8 17h5" />,
  <g key="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></g>,
  <g key="3"><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></g>,
  <g key="4"><path d="m3 11 16-7-3 16-4.5-5L3 11Z" /><path d="m11.5 15 4 4" /></g>,
  <g key="5"><path d="M12 19a7 7 0 1 1 7-7c0 1.6-1.4 2-2.5 2H15a2 2 0 0 0-1.4 3.4c.5.6.1 1.6-.8 1.6Z" /><circle cx="8" cy="10" r="1" /><circle cx="12" cy="7.5" r="1" /><circle cx="16" cy="10" r="1" /></g>,
  <g key="6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17" cy="7" r="1" /></g>,
  <g key="7"><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="9" /><path d="M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z" /></g>,
  <g key="8"><path d="M6 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1" /><path d="M7 10V4h10v6M7 15h10v5H7z" /></g>,
  <g key="9"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" /></g>,
  <g key="10"><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 7h8M8 11h5" /><circle cx="12" cy="17" r="1.6" /></g>,
  <g key="11"><rect x="2.5" y="4" width="19" height="13" rx="2.5" /><path d="M2.5 8.5h19M8 21h8" /></g>,
];

function ServiceIcon({ i }: { i: number }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...P}>
      {ICONS[i % ICONS.length]}
    </svg>
  );
}

/* ================= About ================= */
export function About() {
  const { t, logo, clients, lang } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section id="about" className="relative px-5 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHead kicker={t.about.kicker} title={t.about.title} center={false} />
            <Reveal delay={0.2}>
              <p className="mt-8 text-[15.5px] leading-[2.05] txt-muted sm:text-[17px]">{t.about.p1}</p>
            </Reveal>
            <Reveal delay={0.28}>
              <p className="mt-4 text-[15.5px] leading-[2.05] txt-muted sm:text-[17px]">{t.about.p2}</p>
            </Reveal>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {t.about.pillars.map((p, i) => (
                <Reveal key={i} delay={0.32 + i * 0.09}>
                  <div className="h-full rounded-[24px] p-5 glass shadow-lux transition-transform duration-500 hover:-translate-y-1.5">
                    <span
                      className="mb-3 grid h-9 w-9 place-items-center rounded-xl text-[13px] font-black text-white"
                      style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))" }}
                    >
                      <span className="latin">0{i + 1}</span>
                    </span>
                    <h3 className="text-[15px] font-bold">{p.t}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed txt-muted">{p.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Visual panel */}
          <Reveal delay={0.15}>
            <motion.div style={{ y }} className="relative">
              <div className="relative overflow-hidden rounded-[40px] p-10 glass shadow-lux sm:p-14">
                <div
                  aria-hidden
                  className="anim-glow absolute -top-24 -end-24 h-64 w-64 rounded-full blur-[80px]"
                  style={{ background: "color-mix(in srgb, var(--primary) 45%, transparent)" }}
                />
                <div className="relative grid place-items-center">
                  <div
                    aria-hidden
                    className="anim-spin-slow absolute h-56 w-56 rounded-full border border-dashed opacity-40"
                    style={{ borderColor: "color-mix(in srgb,var(--primary) 55%, transparent)" }}
                  />
                  <img
                     src="https://i.ibb.co/WYnXtBW/HAITHAM.png"
                    alt="YourMark"
                    width={300}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="logo-3d logo-adapt anim-float relative h-[140px] w-[140px] object-contain sm:h-[170px] sm:w-[170px]"
                  />
                </div>

                <div className="relative mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {t.about.numbers.map((n, i) => (
                    <div key={i} className="text-center">
                      <div className="text-[clamp(1.3rem,3vw,2rem)] font-black brand-grad">
                        <Counter value={n.v} />
                      </div>
                      <div className="mt-1 text-[11px] txt-muted">{n.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>

        {/* Clients / brands — live from the database */}
        {clients.length > 0 && (
          <Reveal delay={0.2}>
            <div className="mt-16">
              <p className="mb-6 text-center text-[11px] font-bold uppercase tracking-[0.28em] txt-muted">
                {lang === "ar" ? "علامات وثقت بنا" : "Brands that trusted us"}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {clients.map((cl, i) => (
                  <motion.a
                    key={cl.id}
                    href={cl.website || "#work"}
                    onClick={(e) => !cl.website && e.preventDefault()}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex items-center gap-2.5 rounded-2xl px-5 py-3 glass shadow-lux transition-all duration-300 hover:-translate-y-1"
                  >
                    {cl.logo_url ? (
                      <img src={cl.logo_url} alt={lang === "ar" ? cl.name_ar : cl.name_en} className="h-7 w-7 object-contain" loading="lazy" />
                    ) : (
                      <span
                        className="grid h-7 w-7 place-items-center rounded-xl text-[12px] font-black text-white"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                      >
                        {(lang === "ar" ? cl.name_ar : cl.name_en).charAt(0)}
                      </span>
                    )}
                    <span className="text-[13px] font-bold transition-colors group-hover:text-[var(--primary)]">
                      {lang === "ar" ? cl.name_ar : cl.name_en}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ================= Services ================= */
export function Services() {
  const { t, lang } = useSite();
  const storeServices = useAdminStore((s) => s.services);

  /* Live CMS services take priority; bundled copy is the fallback */
  const live = (storeServices || []).filter((s) => s.visible !== false);
  const items =
    live.length > 0
      ? live.map((s) => ({
          t: lang === "en" ? s.title_en || s.title_ar : s.title_ar || s.title_en,
          d: lang === "en" ? s.desc_en || s.desc_ar : s.desc_ar || s.desc_en,
        }))
      : t.services.items;

  return (
    <section id="services" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead kicker={t.services.kicker} title={t.services.title} sub={t.services.sub} />

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, i) => (
            <Reveal key={i} delay={(i % 3) * 0.08} y={40}>
              <Tilt className="h-full">
                <article
                  className="tilt-card relative h-full overflow-hidden rounded-[28px] p-7 glass shadow-lux transition-[border-color,transform] duration-500 hover:-translate-y-2"
                  style={{ borderColor: "var(--card-brd)" }}
                >
                  {/* glow border on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      boxShadow:
                        "inset 0 0 0 1px color-mix(in srgb, var(--primary) 45%, transparent), 0 24px 60px -30px color-mix(in srgb, var(--primary) 70%, transparent)",
                    }}
                  />
                  <div
                    className="relative mb-5 grid h-12 w-12 place-items-center rounded-2xl transition-all duration-500 group-hover:scale-110"
                    style={{
                      background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                      color: "var(--primary)",
                      boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--primary) 24%, transparent)",
                    }}
                  >
                    <ServiceIcon i={i} />
                  </div>
                  <h3 className="relative text-[16.5px] font-bold leading-snug">{s.t}</h3>
                  <p className="relative mt-2.5 text-[13.5px] leading-[1.9] txt-muted">{s.d}</p>
                  <span className="latin absolute end-6 top-6 text-[11px] font-bold opacity-25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </article>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= Portfolio ================= */
export function Work() {
  const { t, isRTL, lang } = useSite();
  const [filter, setFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const closeModal = useCallback(() => setSelectedProject(null), []);

const storeProjects = useAdminStore((s) => s.projects);

useEffect(() => {
  console.log("=== CMS Projects ===");
  console.log("Count:", storeProjects.length);
  console.table(storeProjects);
}, [storeProjects]);
  
  // Filter visible projects only from store
  const visibleProjects = useMemo(() => {
    return (storeProjects || []).filter(
      (p) => p.visible !== false && (p.status === "published" || !p.status)
    );
  }, [storeProjects]);

  const shown = useMemo(() => {
    if (filter === "all") return visibleProjects;
    return visibleProjects.filter((p) => p.category === filter);
  }, [filter, visibleProjects]);

  const handleCardClick = (p: Project) => {
    setSelectedProject(p);
  };

  return (
    <section id="work" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead kicker={t.work.kicker} title={t.work.title} sub={t.work.sub} />

        {/* Filters */}
        <Reveal delay={0.18}>
          <div className="no-scrollbar mt-12 flex justify-start gap-2 overflow-x-auto pb-2 sm:justify-center">
            {t.work.filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "relative shrink-0 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-colors duration-300 cursor-pointer",
                  filter === f.id ? "text-white" : "txt-muted glass hover:text-[var(--primary)]",
                )}
              >
                {filter === f.id && (
                  <motion.span
                    layoutId="work-filter"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    className="absolute inset-0 -z-10 rounded-full shadow-lux"
                    style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))" }}
                  />
                )}
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Grid */}
        <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => {
              const displayTitle = lang === "en" ? (p.title_en || p.title_ar) : (p.title_ar || p.title_en);
              const displayType = lang === "en" ? (p.type_en || p.type_ar) : (p.type_ar || p.type_en);
              const coverImg = p.cover_url || (p.images && p.images[0]) || PORTFOLIO_IMAGES[0];

              return (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94, y: 26 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.6, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => handleCardClick(p)}
                  className={cn(
                    "group relative overflow-hidden rounded-[30px] glass shadow-lux cursor-pointer",
                    i === 0 && shown.length > 4 && "sm:col-span-2 sm:row-span-1",
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={coverImg}
                      alt={displayTitle}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.09]"
                    />
                    {/* glass overlay */}
                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 backdrop-blur-[2px] transition-opacity duration-500 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(p);
                        }}
                        className="mb-8 inline-flex translate-y-4 items-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold text-white shadow-lux transition-transform duration-500 group-hover:translate-y-0 cursor-pointer"
                        style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))" }}
                      >
                        {t.work.view}
                        <svg viewBox="0 0 24 24" className={cn("h-4 w-4", isRTL && "rotate-180")} {...P} strokeWidth={2.2}>
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </button>
                    </div>
                    <span className="latin absolute end-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md" style={{ background: "rgba(0,0,0,.42)" }}>
                      {p.year || "2025"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 p-5">
                    <div>
                      <h3 className="text-[16px] font-bold">{displayTitle}</h3>
                      <p className="mt-0.5 text-[12.5px] txt-muted">{displayType}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(p);
                      }}
                      aria-label={t.work.view}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-500 group-hover:scale-110 cursor-pointer"
                      style={{
                        background: "color-mix(in srgb, var(--primary) 12%, transparent)",
                        color: "var(--primary)",
                      }}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" {...P} strokeWidth={2}>
                        <path d="M7 17 17 7M9 7h8v8" />
                      </svg>
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Details Modal */}
      <ProjectDetailsModal project={selectedProject} onClose={closeModal} />
    </section>
  );
}

/* ================= Process ================= */
export function Process() {
  const { t } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 78%", "end 55%"] });
  const [open, setOpen] = useState(0);

  return (
    <section id="process" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHead kicker={t.process.kicker} title={t.process.title} sub={t.process.sub} />

        <div ref={ref} className="relative mt-16">
          {/* rail */}
          <div
            className="absolute bottom-0 top-0 start-[26px] w-px sm:start-1/2"
            style={{ background: "var(--line)" }}
          />
          <motion.div
            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
            className="absolute bottom-0 top-0 start-[26px] w-px sm:start-1/2"
          >
            <div
              className="h-full w-px"
              style={{ background: "linear-gradient(180deg,var(--primary),var(--secondary))" }}
            />
          </motion.div>

          <div className="space-y-5">
            {t.process.steps.map((s, i) => {
              const right = i % 2 === 1;
              return (
                <Reveal key={i} delay={0.04 * i}>
                  <div
                    className={cn(
                      "relative flex items-stretch gap-6 ps-16 sm:ps-0",
                      right ? "sm:flex-row" : "sm:flex-row-reverse",
                    )}
                  >
                    {/* node */}
                    <span
                      className="absolute start-[14px] top-6 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full sm:start-1/2 sm:-translate-x-1/2 rtl:sm:translate-x-1/2"
                      style={{
                        background: "var(--page)",
                        boxShadow: "0 0 0 1px color-mix(in srgb,var(--primary) 55%, transparent)",
                      }}
                    >
                      <motion.span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: "var(--primary)", boxShadow: "0 0 14px var(--primary)" }}
                        animate={{ scale: open === i ? [1, 1.35, 1] : 1 }}
                        transition={{ duration: 1.6, repeat: open === i ? Infinity : 0 }}
                      />
                    </span>

                    <div className="hidden flex-1 sm:block" />
                    <button
                      onMouseEnter={() => setOpen(i)}
                      onFocus={() => setOpen(i)}
                      onClick={() => setOpen(i)}
                      className={cn(
                        "flex-1 rounded-[26px] p-6 text-start glass shadow-lux transition-all duration-500 hover:-translate-y-1",
                        open === i && "ring-1",
                      )}
                      style={
                        open === i
                          ? { boxShadow: "0 24px 60px -34px color-mix(in srgb,var(--primary) 80%, transparent)" }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="latin grid h-8 w-8 shrink-0 place-items-center rounded-xl text-[12px] font-black text-white"
                          style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-[16px] font-bold">{s.t}</h3>
                      </div>
                      <p className="mt-3 text-[13.5px] leading-[1.95] txt-muted">{s.d}</p>
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
