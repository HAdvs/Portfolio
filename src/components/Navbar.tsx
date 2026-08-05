import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { NAV_IDS } from "../lib/content";
import { useSite } from "../lib/site";
import { cn } from "../utils/cn";
import { Magnetic } from "./ui";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[18px] w-[18px]" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-[18px] w-[18px]" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export default function Navbar() {
  const { t, theme, toggleTheme, lang, setLang, isRTL, logo } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    NAV_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 96, behavior: "smooth" });
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[60] px-3 pt-3 sm:px-5 sm:pt-4">
        <motion.nav
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.7, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[26px] px-3 py-2.5 transition-all duration-500 sm:px-4",
            scrolled ? "glass-strong shadow-lux" : "border border-transparent",
          )}
        >
          {/* Logo — brand identity, image only, clickable → home. Clear space preserved */}
          <a
            href="#home"
            aria-label="YourMark — Home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group relative flex shrink-0 items-center rounded-2xl p-2 transition-transform duration-500 hover:scale-[1.04]"
          >
            <span
              aria-hidden
              className="absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: "color-mix(in srgb, var(--primary) 26%, transparent)" }}
            />
            <img
              src={logo}
              alt="YourMark"
              width={48}
              height={48}
              fetchPriority="high"
              decoding="async"
              draggable={false}
              className="logo-adapt relative h-11 w-11 object-contain sm:h-[52px] sm:w-[120px]"
            />
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV_IDS.map((id) => (
              <li key={id}>
                <button
                  onClick={() => go(id)}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors duration-300",
                    active === id ? "text-[var(--primary)]" : "txt-muted hover:text-[var(--txt)]",
                  )}
                >
                  {active === id && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{ background: "color-mix(in srgb, var(--primary) 12%, transparent)" }}
                    />
                  )}
                  {t.nav[id]}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {/* Language switch */}
            <div
              className="relative flex items-center rounded-full p-0.5 text-xs font-semibold ring-line"
              style={{ background: "color-mix(in srgb, var(--surface) 55%, transparent)" }}
            >
              {(["ar", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 transition-colors duration-300",
                    lang === l ? "text-white" : "txt-muted",
                  )}
                >
                  {lang === l && (
                    <motion.span
                      layoutId="lang-pill"
                      transition={{ type: "spring", stiffness: 340, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
                      }}
                    />
                  )}
                  <span className="latin">{l === "ar" ? "ع" : "EN"}</span>
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? t.themeLight : t.themeDark}
              title={theme === "dark" ? t.themeLight : t.themeDark}
              className="grid h-9 w-9 place-items-center rounded-full ring-line transition-all duration-300 hover:scale-105"
              style={{ background: "color-mix(in srgb, var(--surface) 55%, transparent)" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.32 }}
                  className="grid place-items-center"
                >
                  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* CTA */}
            <Magnetic className="hidden sm:block">
              <button
                onClick={() => go("contact")}
                className="relative overflow-hidden rounded-full px-5 py-2.5 text-[13px] font-bold text-white shadow-lux transition-transform duration-300"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
              >
                <span className="relative z-10">{t.hero.cta1}</span>
              </button>
            </Magnetic>

            {/* Burger */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={t.menu}
              aria-expanded={open}
              className="grid h-9 w-9 place-items-center rounded-full ring-line lg:hidden"
              style={{ background: "color-mix(in srgb, var(--surface) 55%, transparent)" }}
            >
              <div className="flex flex-col items-center gap-[5px]">
                <motion.span
                  animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="block h-[1.6px] w-[18px] rounded-full bg-current"
                />
                <motion.span
                  animate={open ? { opacity: 0 } : { opacity: 1 }}
                  className="block h-[1.6px] w-[18px] rounded-full bg-current"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: -6.6 } : { rotate: 0, y: 0 }}
                  className="block h-[1.6px] w-[18px] rounded-full bg-current"
                />
              </div>
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[59] lg:hidden"
          >
            <div
              className="absolute inset-0 backdrop-blur-2xl"
              style={{ background: "color-mix(in srgb, var(--page) 82%, transparent)" }}
              onClick={() => setOpen(false)}
            />
            <motion.ul
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-4 top-28 space-y-1 rounded-[28px] p-4 glass shadow-lux"
            >
              {NAV_IDS.map((id, i) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.045 }}
                >
                  <button
                    onClick={() => go(id)}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-start text-base font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]"
                  >
                    <span>{t.nav[id]}</span>
                    <span className="latin text-xs txt-muted">0{i + 1}</span>
                  </button>
                </motion.li>
              ))}
              <li className="pt-2">
                <button
                  onClick={() => go("contact")}
                  className="w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-lux"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--secondary))" }}
                >
                  {t.hero.cta1}
                </button>
              </li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
