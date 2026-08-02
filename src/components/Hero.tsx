import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { useSite } from "../lib/site";
import { Particles } from "./Atmosphere";
import { Counter, Magnetic } from "./ui";

/* Intro timing: long, cinematic on first load (after preloader); instant afterwards */
let introPlayed = false;

export default function Hero() {
  const { t, isRTL, heroLogo } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const B = introPlayed ? 0.05 : 1.8;
  useEffect(() => {
    introPlayed = true;
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const yVisual = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  // 3D pointer tilt for the logo
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [16, -16]), { stiffness: 90, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-20, 20]), { stiffness: 90, damping: 18 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      px.set(e.clientX / window.innerWidth);
      py.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [px, py]);

  const words = t.hero.title1.split(" ");
  const words2 = t.hero.title2.split(" ");

  return (
    <section
      id="home"
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-20 pt-32 sm:pt-36 lg:pt-28"
    >
      <Particles count={52} />

      <motion.div
        style={{ opacity: fade }}
        className="relative mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[1.06fr_0.94fr] lg:gap-8"
      >
        {/* ---------- Copy ---------- */}
        <motion.div style={{ y: yText }} className="relative z-10 text-center lg:text-start">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: B + 0.05, duration: 0.7 }}
            className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[11.5px] font-semibold tracking-[0.16em] glass shadow-lux"
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ background: "var(--primary)" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} />
            </span>
            {t.hero.badge}
          </motion.span>

          <h1 className="mt-7 text-[clamp(2.4rem,6.6vw,5rem)] font-black leading-[1.08] tracking-tight">
            <span className="block">
              {words.map((w, i) => (
                <motion.span
                  key={`a-${i}`}
                  initial={{ opacity: 0, y: 44, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: B + 0.15 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  {w}&nbsp;
                </motion.span>
              ))}
            </span>
            <span className="block">
              {words2.map((w, i) => (
                <motion.span
                  key={`b-${i}`}
                  initial={{ opacity: 0, y: 44, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    delay: B + 0.25 + (words.length + i) * 0.08,
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="brand-grad inline-block"
                >
                  {w}&nbsp;
                </motion.span>
              ))}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: B + 0.65, duration: 0.85 }}
            className="mx-auto mt-7 max-w-xl text-[15px] leading-[1.95] txt-muted sm:text-[17px] lg:mx-0"
          >
            {t.hero.desc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: B + 0.8, duration: 0.85 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3.5 lg:justify-start"
          >
            <Magnetic>
              <a
                href="#contact"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-8 py-4 text-[15px] font-bold text-white shadow-lux"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-500 group-hover:translate-y-0"
                />
                <span className="relative z-10">{t.hero.cta1}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? "rotate-180 group-hover:-translate-x-1" : ""}`}
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </Magnetic>

            <Magnetic>
              <a
                href="#work"
                className="inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-bold glass shadow-lux transition-colors duration-300 hover:text-[var(--primary)]"
              >
                {t.hero.cta2}
              </a>
            </Magnetic>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: B + 1, duration: 0.9 }}
            className="mt-12 grid max-w-lg grid-cols-3 gap-3 lg:mx-0"
          >
            {t.hero.stats.map((s, i) => (
              <div
                key={i}
                className="rounded-[22px] px-3 py-4 text-center glass shadow-lux transition-transform duration-500 hover:-translate-y-1"
              >
                <div className="text-[clamp(1.15rem,2.6vw,1.7rem)] font-black brand-grad">
                  {/^\+?\d/.test(s.v) ? <Counter value={s.v} /> : <span className="latin">{s.v}</span>}
                </div>
                <div className="mt-1 text-[11.5px] font-medium txt-muted">{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ---------- 3D Logo Visual ---------- */}
        <motion.div
          style={{ y: yVisual }}
          className="relative z-0 mx-auto flex w-full max-w-[520px] items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: B, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: 1200 }}
            className="relative aspect-square w-full"
          >
            {/* professional lighting */}
            <div
              aria-hidden
              className="anim-glow absolute inset-[6%] rounded-full blur-[70px]"
              style={{
                background:
                  "radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--primary) 55%, transparent), transparent 68%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-[18%] rounded-full blur-[60px] opacity-60"
              style={{
                background:
                  "radial-gradient(circle at 65% 70%, color-mix(in srgb, var(--secondary) 55%, transparent), transparent 66%)",
              }}
            />

            {/* orbit rings */}
            <div
              aria-hidden
              className="anim-spin-slow absolute inset-[3%] rounded-full border border-dashed opacity-35"
              style={{ borderColor: "color-mix(in srgb, var(--primary) 60%, transparent)" }}
            />
            <div
              aria-hidden
              className="anim-spin-slow absolute inset-[14%] rounded-full border opacity-25"
              style={{
                animationDirection: "reverse",
                animationDuration: "48s",
                borderColor: "color-mix(in srgb, var(--secondary) 60%, transparent)",
              }}
            />

            {/* glass stage */}
            <div className="absolute inset-[8%] rounded-[46%] glass shadow-lux" />

            {/* orbiting dots */}
            <div className="anim-spin-slow absolute inset-[3%]" style={{ animationDuration: "22s" }}>
              <span
                className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
                style={{ background: "var(--primary)", boxShadow: "0 0 18px var(--primary)" }}
              />
              <span
                className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
                style={{ background: "var(--secondary)", boxShadow: "0 0 14px var(--secondary)" }}
              />
            </div>

            {/* THE LOGO — original artwork, undistorted, generous clear space */}
            <motion.div
              style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
              className="absolute inset-0 grid place-items-center"
            >
              <div className="anim-float" style={{ transform: "translateZ(60px)" }}>
                <img
                  src={heroLogo}
                  alt="YourMark"
                  width={2048}
                  height={2048}
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
                  className="logo-3d logo-adapt h-auto w-[min(58vw,300px)] max-w-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: B + 1.3, duration: 0.9 }}
        style={{ opacity: fade }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.28em] txt-muted"
      >
        {t.hero.scroll}
        <span className="relative flex h-9 w-[22px] justify-center rounded-full ring-line pt-2">
          <motion.span
            animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--primary)" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
