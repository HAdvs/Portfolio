import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AVATARS } from "../lib/content";
import { useSite } from "../lib/site";
import { useAdminStore } from "../admin/store/useAdminStore";
import { cn } from "../utils/cn";
import { Magnetic, Reveal, SectionHead, Tilt } from "./ui";

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const WHY_ICONS = [
  <g key="a"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m9 12 2 2 4-4" /></g>,
  <g key="b"><circle cx="12" cy="8" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></g>,
  <g key="c"><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 1 3.5 10.9c-.4.3-.5.7-.5 1.1H9c0-.4-.1-.8-.5-1.1A6 6 0 0 1 12 3Z" /></g>,
  <g key="d"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></g>,
  <g key="e"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /><circle cx="12" cy="12" r="3" /></g>,
  <g key="f"><path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8 6.6 19.7l1.2-6.1L3.3 9.4l6.1-.8L12 3Z" /></g>,
];

/* ================= Why ================= */
export function Why() {
  const { t } = useSite();
  return (
    <section id="why" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHead kicker={t.why.kicker} title={t.why.title} sub={t.why.sub} />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.why.items.map((w, i) => (
            <Reveal key={i} delay={(i % 3) * 0.08}>
              <Tilt max={7} className="h-full">
                <div className="tilt-card relative h-full overflow-hidden rounded-[28px] p-7 glass shadow-lux transition-transform duration-500 hover:-translate-y-2">
                  <div
                    aria-hidden
                    className="absolute -end-14 -top-14 h-36 w-36 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                    style={{ background: "color-mix(in srgb,var(--primary) 40%, transparent)" }}
                  />
                  <div
                    className="relative mb-5 grid h-12 w-12 place-items-center rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, color-mix(in srgb,var(--primary) 18%, transparent), transparent)",
                      color: "var(--primary)",
                      boxShadow: "inset 0 0 0 1px color-mix(in srgb,var(--primary) 26%, transparent)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" {...S}>
                      {WHY_ICONS[i % WHY_ICONS.length]}
                    </svg>
                  </div>
                  <h3 className="relative text-[16.5px] font-bold">{w.t}</h3>
                  <p className="relative mt-2.5 text-[13.5px] leading-[1.95] txt-muted">{w.d}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= Testimonials ================= */
export function Voices() {
  const { t, isRTL, lang } = useSite();
  const storeVoices = useAdminStore((s) => s.testimonials);

  /* Live CMS testimonials take priority; bundled copy is the fallback */
  const live = (storeVoices || [])
    .filter((x) => x.visible !== false)
    .sort((a, b) => a.order_index - b.order_index);
  const items: { name: string; company: string; text: string; rate: number; avatar?: string }[] =
    live.length > 0
      ? live.map((x) => ({
          name: x.name,
          company: x.company,
          text: lang === "en" ? x.text_en || x.text_ar : x.text_ar || x.text_en,
          rate: x.rating,
          avatar: x.avatar,
        }))
      : t.voices.items;

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % items.length), 5200);
    return () => clearInterval(id);
  }, [paused, items.length]);

  const go = (d: number) => setIdx((p) => (p + d + items.length) % items.length);
  const cur = items[idx];

  return (
    <section id="voices" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHead kicker={t.voices.kicker} title={t.voices.title} sub={t.voices.sub} />

        <Reveal delay={0.15}>
          <div
            className="relative mt-14"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative overflow-hidden rounded-[36px] p-8 glass shadow-lux sm:p-12">
              <div
                aria-hidden
                className="anim-glow absolute -start-20 -top-20 h-64 w-64 rounded-full blur-[90px]"
                style={{ background: "color-mix(in srgb,var(--primary) 34%, transparent)" }}
              />
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="absolute end-8 top-8 h-14 w-14 opacity-[0.09]"
                fill="currentColor"
              >
                <path d="M7.5 6C5 6 3 8 3 10.5S5 15 7.5 15c.3 0 .6 0 .9-.1C7.8 16.7 6.2 18 4.5 18v2c4 0 7.5-3.7 7.5-8.5C12 8 10 6 7.5 6Zm9 0C14 6 12 8 12 10.5S14 15 16.5 15c.3 0 .6 0 .9-.1-.6 1.8-2.2 3.1-3.9 3.1v2c4 0 7.5-3.7 7.5-8.5C21 8 19 6 16.5 6Z" />
              </svg>

              <div className="relative min-h-[240px] sm:min-h-[210px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex gap-1" aria-label={`${cur.rate}/5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill={i < cur.rate ? "var(--primary)" : "none"}
                          stroke="var(--primary)"
                          strokeWidth="1.4"
                        >
                          <path d="m12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8 6.6 19.7l1.2-6.1L3.3 9.4l6.1-.8L12 3Z" />
                        </svg>
                      ))}
                    </div>

                    <p className="mt-6 text-[16px] font-medium leading-[2.05] sm:text-[19px]">
                      “{cur.text}”
                    </p>

                    <div className="mt-8 flex items-center gap-4">
                      <img
                        src={cur.avatar || AVATARS[idx % AVATARS.length]}
                        alt={cur.name}
                        width={52}
                        height={52}
                        loading="lazy"
                        decoding="async"
                        className="h-13 w-13 rounded-full object-cover"
                        style={{
                          height: 52,
                          width: 52,
                          boxShadow: "0 0 0 2px color-mix(in srgb,var(--primary) 55%, transparent)",
                        }}
                      />
                      <div>
                        <div className="text-[15px] font-bold">{cur.name}</div>
                        <div className="text-[12.5px] txt-muted">{cur.company}</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* controls */}
            <div className="mt-7 flex items-center justify-center gap-4">
              <button
                onClick={() => go(-1)}
                aria-label="Previous"
                className="grid h-11 w-11 place-items-center rounded-full glass shadow-lux transition-transform hover:scale-110"
              >
                <svg viewBox="0 0 24 24" className={cn("h-4 w-4", isRTL && "rotate-180")} {...S} strokeWidth={2}>
                  <path d="M15 6 9 12l6 6" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`Slide ${i + 1}`}
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: i === idx ? 30 : 8,
                      background:
                        i === idx
                          ? "linear-gradient(90deg,var(--primary),var(--secondary))"
                          : "var(--line)",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => go(1)}
                aria-label="Next"
                className="grid h-11 w-11 place-items-center rounded-full glass shadow-lux transition-transform hover:scale-110"
              >
                <svg viewBox="0 0 24 24" className={cn("h-4 w-4", isRTL && "rotate-180")} {...S} strokeWidth={2}>
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= FAQ ================= */
export function Faq() {
  const { t, lang } = useSite();
  const storeFaq = useAdminStore((s) => s.faq);

  /* Live CMS FAQs take priority; bundled copy is the fallback */
  const live = (storeFaq || [])
    .filter((x) => x.visible !== false)
    .sort((a, b) => a.order_index - b.order_index);
  const items =
    live.length > 0
      ? live.map((x) => ({
          q: lang === "en" ? x.question_en || x.question_ar : x.question_ar || x.question_en,
          a: lang === "en" ? x.answer_en || x.answer_ar : x.answer_ar || x.answer_en,
        }))
      : t.faq.items;

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHead kicker={t.faq.kicker} title={t.faq.title} sub={t.faq.sub} />

        <div className="mt-14 space-y-3">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 0.05}>
                <div
                  className="overflow-hidden rounded-[24px] glass shadow-lux transition-all duration-500"
                  style={
                    isOpen
                      ? { boxShadow: "0 26px 60px -34px color-mix(in srgb,var(--primary) 75%, transparent)" }
                      : undefined
                  }
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start"
                  >
                    <span className="text-[15px] font-bold leading-snug sm:text-[16px]">{f.q}</span>
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-500"
                      style={{
                        background: isOpen
                          ? "linear-gradient(135deg,var(--primary),var(--secondary))"
                          : "color-mix(in srgb,var(--primary) 10%, transparent)",
                        color: isOpen ? "#fff" : "var(--primary)",
                        transform: isOpen ? "rotate(135deg)" : "none",
                      }}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" {...S} strokeWidth={2}>
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="px-6 pb-6 text-[13.5px] leading-[2.05] txt-muted sm:text-[14.5px]">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================= CTA ================= */
export function Cta() {
  const { t, isRTL } = useSite();
  return (
    <section className="relative px-5 py-20 sm:py-28">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[44px] px-6 py-20 text-center glass shadow-lux sm:px-14 sm:py-28">
          <div
            aria-hidden
            className="anim-drift absolute -bottom-32 -start-24 h-80 w-80 rounded-full blur-[110px]"
            style={{ background: "color-mix(in srgb,var(--secondary) 55%, transparent)" }}
          />
          <div
            aria-hidden
            className="anim-drift absolute -end-24 -top-32 h-80 w-80 rounded-full blur-[110px]"
            style={{ animationDelay: "-8s", background: "color-mix(in srgb,var(--primary) 50%, transparent)" }}
          />
          <div aria-hidden className="absolute inset-0 grid-lines opacity-60" />

          <h2 className="relative mx-auto max-w-3xl text-[clamp(1.9rem,5vw,3.6rem)] font-black leading-[1.22] tracking-tight">
            {t.cta.title}
          </h2>
          <p className="relative mx-auto mt-6 max-w-xl text-[15px] leading-relaxed txt-muted sm:text-[17px]">
            {t.cta.sub}
          </p>
          <div className="relative mt-10 flex justify-center">
            <Magnetic strength={0.4}>
              <a
                href="#contact"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-10 py-5 text-[15px] font-bold text-white shadow-lux sm:text-[16px]"
                style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))" }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-0"
                />
                <span className="relative z-10">{t.cta.btn}</span>
                <svg viewBox="0 0 24 24" className={cn("relative z-10 h-4.5 w-4.5", isRTL && "rotate-180")} {...S} strokeWidth={2.2}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
