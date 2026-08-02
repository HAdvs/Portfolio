import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent as RMouseEvent,
} from "react";
import { cn } from "../utils/cn";

/* ---------------- Reveal on scroll ---------------- */
export function Reveal({
  children,
  delay = 0,
  y = 34,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-90px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Magnetic button ---------------- */
export function Magnetic({
  children,
  className,
  strength = 0.32,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: RMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- 3D Tilt card ---------------- */
export function Tilt({
  children,
  className,
  max = 9,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const srx = useSpring(my, { stiffness: 160, damping: 20 });
  const sry = useSpring(mx, { stiffness: 160, damping: 20 });
  const rotateX = useTransform(srx, [0, 1], [max, -max]);
  const rotateY = useTransform(sry, [0, 1], [-max, max]);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const onMove = (e: RMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set(px);
    my.set(py);
    setPos({ x: px * 100, y: py * 100 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={cn("group relative [transform-style:preserve-3d]", className)}
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 62%)`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

/* ---------------- Animated counter ---------------- */
export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const num = parseFloat(value.replace(/[^\d.]/g, "")) || 0;
  const prefix = value.startsWith("+") ? "+" : "";
  const suffix = value.replace(/[+\d.,]/g, "");
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1500;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(num * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, num]);

  return (
    <span ref={ref} className={cn("latin tabular-nums", className)}>
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

/* ---------------- Section heading ---------------- */
export function SectionHead({
  kicker,
  title,
  sub,
  center = true,
}: {
  kicker: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
      <Reveal>
        <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] glass shadow-lux">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--primary)", boxShadow: "0 0 12px var(--primary)" }}
          />
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-6 text-[clamp(1.9rem,4.4vw,3.4rem)] font-extrabold leading-[1.18] tracking-tight">
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-base leading-relaxed txt-muted sm:text-lg">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------------- Brand logo (image only, never text) ---------------- */
export function BrandLogo({
  src,
  size = 44,
  className,
  priority = false,
  alt = "YourMark",
}: {
  src: string;
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={cn("logo-adapt block h-auto w-auto object-contain select-none", className)}
      style={{ width: size, height: size }}
    />
  );
}
