import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSite } from "../lib/site";

/* ============ Animated gradient + glass fog + floating shapes ============ */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--page)" }} />

      {/* Aurora blobs */}
      <div
        className="anim-drift absolute -top-[24vh] -start-[14vw] h-[62vw] w-[62vw] rounded-full opacity-[.55] blur-[110px] dark:opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--primary) 62%, transparent), transparent 66%)",
        }}
      />
      <div
        className="anim-drift absolute -bottom-[30vh] -end-[18vw] h-[68vw] w-[68vw] rounded-full opacity-45 blur-[130px] dark:opacity-35"
        style={{
          animationDelay: "-9s",
          background:
            "radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--secondary) 70%, transparent), transparent 68%)",
        }}
      />
      <div
        className="anim-drift absolute left-1/2 top-1/3 h-[44vw] w-[44vw] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
        style={{
          animationDelay: "-17s",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 45%, transparent), transparent 70%)",
        }}
      />

      {/* Grid */}
      <div className="absolute inset-0 grid-lines opacity-70" />

      {/* Floating glass shapes */}
      <div className="anim-float absolute left-[8%] top-[22%] h-24 w-24 rounded-[28px] glass rotate-12 opacity-70" />
      <div
        className="anim-float absolute right-[10%] top-[16%] h-16 w-16 rounded-full glass opacity-60"
        style={{ animationDelay: "-2.4s" }}
      />
      <div
        className="anim-float absolute left-[16%] bottom-[16%] h-20 w-20 rounded-[24px] glass -rotate-6 opacity-50"
        style={{ animationDelay: "-4.1s" }}
      />

      {/* Film grain */}
      <div className="noise absolute inset-0 opacity-[0.035] mix-blend-overlay dark:opacity-[0.06]" />
    </div>
  );
}

/* ============ Floating particles (canvas, cheap) ============ */
export function Particles({ count = 46 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = useSite();

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = cvs.clientWidth;
      h = cvs.clientHeight;
      cvs.width = w * dpr;
      cvs.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const n = window.innerWidth < 768 ? Math.round(count * 0.5) : count;
    const parts = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.9 + 0.5,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(Math.random() * 0.34 + 0.06),
      a: Math.random() * 0.5 + 0.14,
      p: Math.random() * Math.PI * 2,
    }));

    const color = theme === "dark" ? "10,132,255" : "30,58,138";

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx + Math.sin(p.p) * 0.16;
        p.y += p.vy;
        p.p += 0.008;
        if (p.y < -12) {
          p.y = h + 12;
          p.x = Math.random() * w;
        }
        if (p.x < -12) p.x = w + 12;
        if (p.x > w + 12) p.x = -12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, theme]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
    />
  );
}

/* ============ Mouse glow + animated cursor ============ */
export function CursorLayer() {
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine);
    if (!fine) return;
    document.documentElement.classList.add("has-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let gx = mx;
    let gy = my;
    let raf = 0;

    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      const el = e.target as HTMLElement | null;
      setHover(!!el?.closest("a, button, [data-cursor='hover'], input, textarea, select"));
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      gx += (mx - gx) * 0.07;
      gy += (my - gy) * 0.07;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      if (glow.current) glow.current.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-0 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-[90px] will-change-transform"
        style={{
          marginLeft: "-310px",
          marginTop: "-310px",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--primary) 20%, transparent), transparent 62%)",
        }}
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden h-1.5 w-1.5 rounded-full will-change-transform md:block"
        style={{ marginLeft: "-3px", marginTop: "-3px", background: "var(--primary)" }}
      />
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden rounded-full transition-[width,height,margin,opacity,background] duration-300 will-change-transform md:block"
        style={{
          width: hover ? 54 : 30,
          height: hover ? 54 : 30,
          marginLeft: hover ? -27 : -15,
          marginTop: hover ? -27 : -15,
          border: "1px solid color-mix(in srgb, var(--primary) 60%, transparent)",
          background: hover ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
          backdropFilter: hover ? "blur(2px)" : "none",
        }}
      />
    </>
  );
}

/* ============ Scroll progress bar ============ */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{
        scaleX: x,
        transformOrigin: "var(--pb-origin, left)",
        background: "linear-gradient(90deg, var(--primary), var(--secondary))",
      }}
      className="fixed inset-x-0 top-0 z-[70] h-[2.5px]"
    />
  );
}

/* ============ Loading screen with logo ============ */
export function Preloader() {
  const { t, logo } = useSite();
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1500;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setPct(Math.round((1 - Math.pow(1 - p, 2)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 260);
    };
    raf = requestAnimationFrame(tick);
    document.body.style.overflow = "hidden";
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (done) document.body.style.overflow = "";
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          exit={{ opacity: 0, filter: "blur(14px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8"
          style={{ background: "var(--page)" }}
        >
          <div
            className="absolute h-[60vw] w-[60vw] rounded-full blur-[120px] anim-glow"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--primary) 30%, transparent), transparent 68%)",
            }}
          />
          <motion.div
            initial={{ scale: 0.82, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="anim-spin-slow absolute -inset-9 rounded-full border border-dashed opacity-40"
              style={{ borderColor: "color-mix(in srgb, var(--primary) 55%, transparent)" }} />
            <img
              src={logo}
              alt="YourMark"
              width={140}
              height={140}
              className="logo-3d logo-adapt anim-float h-[110px] w-[110px] object-contain sm:h-[140px] sm:w-[140px]"
            />
          </motion.div>

          <div className="relative w-56">
            <div className="h-[3px] w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--primary), var(--secondary))" }}
                animate={{ width: `${pct}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] font-medium tracking-widest txt-muted">
              <span>{t.loading}</span>
              <span className="latin tabular-nums">{pct}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============ Marquee strip ============ */
export function Marquee({ items }: { items: string[] }) {
  const row = useMemo(() => [...items, ...items], [items]);
  return (
    <div
      className="relative overflow-hidden border-y py-5"
      style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--surface) 45%, transparent)" }}
    >
      <div className="anim-marquee flex w-max items-center gap-10 whitespace-nowrap will-change-transform">
        {row.map((s, i) => (
          <span key={i} className="flex items-center gap-10 text-sm font-semibold uppercase tracking-[0.2em] txt-muted">
            {s}
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--primary)", boxShadow: "0 0 10px var(--primary)" }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
