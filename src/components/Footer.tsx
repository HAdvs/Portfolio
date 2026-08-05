import { motion, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { NAV_IDS, WHATSAPP } from "../lib/content";
import { useSite } from "../lib/site";
import { Reveal } from "./ui";

const SOCIALS = [
  {
    label: "WhatsApp",
    href: `https://wa.me/${WHATSAPP}`,
    d: "M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.3 4.8 4.9-1.3A9.9 9.9 0 1 0 12.04 2Zm5.8 14c-.25.7-1.45 1.35-2 1.4-.53.05-1.02.24-3.44-.72-2.9-1.14-4.73-4.1-4.87-4.3-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.26-.29.57-.36.76-.36l.55.01c.17.01.42-.07.65.5.24.58.81 2 .88 2.14.07.15.12.32.02.5-.1.2-.15.32-.29.49l-.44.5c-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.1.98 2.02 1.28 2.3 1.43.3.14.47.12.64-.07.17-.2.74-.86.94-1.16.19-.29.39-.24.65-.14.26.09 1.67.79 1.96.93.29.15.48.22.55.34.07.12.07.7-.18 1.4Z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/h.advs/",
    d: "M12 2.2c3.2 0 3.6 0 4.8.07 1.2.05 1.9.25 2.3.42.6.22 1 .49 1.5.98.48.48.75.9.97 1.5.17.4.37 1.1.42 2.3.06 1.2.07 1.6.07 4.8s-.01 3.6-.07 4.8c-.05 1.2-.25 1.9-.42 2.3-.22.6-.49 1-.97 1.5-.5.48-.9.75-1.5.97-.4.17-1.1.37-2.3.42-1.2.06-1.6.07-4.8.07s-3.6-.01-4.8-.07c-1.2-.05-1.9-.25-2.3-.42a4.1 4.1 0 0 1-1.5-.97 4.1 4.1 0 0 1-.98-1.5c-.17-.4-.37-1.1-.42-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.08-4.8c.05-1.2.25-1.9.42-2.3.22-.6.49-1 .98-1.5.48-.49.9-.76 1.5-.98.4-.17 1.1-.37 2.3-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8Zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4Zm6.6-10.9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  },
  {
    label: "Behance",
    href: "https://behance.net/H_Advs",
    d: "M9.3 5.6c1.5 0 2.6.3 3.3.9.7.5 1 1.3 1 2.4 0 .6-.15 1.2-.45 1.6-.3.45-.75.8-1.3 1.05.8.2 1.4.6 1.8 1.2.4.6.6 1.3.6 2.1 0 .7-.13 1.3-.4 1.8-.25.5-.6.9-1.05 1.2-.45.3-.98.5-1.6.65-.6.13-1.2.2-1.85.2H2V5.6h7.3Zm-.4 5.2c.6 0 1.05-.14 1.4-.42.36-.28.53-.7.53-1.28 0-.32-.06-.6-.18-.8a1.2 1.2 0 0 0-.47-.5 2 2 0 0 0-.7-.25 4.6 4.6 0 0 0-.83-.07H5.1v3.32h3.8Zm.2 5.5c.34 0 .66-.03.96-.1.3-.06.56-.17.78-.32.22-.16.4-.37.53-.63.13-.27.2-.6.2-1.02 0-.8-.23-1.38-.68-1.72-.45-.35-1.05-.52-1.8-.52H5.1v4.3h4ZM17 15.9c.4.4 1 .6 1.8.6.55 0 1.03-.14 1.43-.42.4-.28.65-.58.74-.9h2.2c-.35 1.1-.9 1.9-1.63 2.36-.73.47-1.62.7-2.66.7-.73 0-1.38-.11-1.96-.35a4.1 4.1 0 0 1-1.48-1 4.4 4.4 0 0 1-.93-1.55 5.9 5.9 0 0 1-.33-2c0-.7.11-1.35.34-1.95a4.5 4.5 0 0 1 2.44-2.6 4.9 4.9 0 0 1 1.92-.37c.8 0 1.5.15 2.1.46.6.32 1.1.74 1.48 1.26.39.53.66 1.13.83 1.8.17.68.23 1.38.18 2.12h-6.53c0 .8.27 1.45.66 1.84Zm3.13-5c-.32-.35-.87-.55-1.55-.55-.45 0-.82.08-1.12.23-.3.15-.53.34-.71.56-.18.22-.3.45-.37.7-.07.24-.11.46-.12.65h4.05c-.12-.75-.34-1.24-.68-1.6ZM16.1 6.3h5.05v1.4H16.1V6.3Z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/h-advs/",
    d: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.3-.03-3-1.83-3-1.84 0-2.12 1.44-2.12 2.9V21h-4V9Z",
  },
  {
    label: "X",
    href: "https://x.com/H_ADVS",
    d: "M17.5 3h3.2l-7 8 8.24 10h-6.45l-5.05-6.2L4.6 21H1.4l7.5-8.6L1 3h6.6l4.57 5.65L17.5 3Zm-1.13 16.1h1.78L7.7 4.8H5.8l10.57 14.3Z",
  },
];

export default function Footer() {
  const { t, logo, settings } = useSite();
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => scrollY.on("change", (v) => setShow(v > 700)), [scrollY]);

  /* Social links resolved live from CMS settings, with sensible fallbacks */
  const socials = SOCIALS.map((s) => {
    const fromSettings =
      s.label === "WhatsApp"
        ? settings.whatsapp
          ? `https://wa.me/${settings.whatsapp}`
          : ""
        : s.label === "Instagram"
          ? settings.social_instagram
          : s.label === "Behance"
            ? settings.social_behance
            : s.label === "LinkedIn"
              ? settings.social_linkedin
              : s.label === "X"
                ? settings.social_x
                : "";
    return { ...s, href: fromSettings || s.href };
  });

  return (
    <footer
      className="relative mt-10 overflow-hidden border-t px-5 pb-8 pt-20"
      style={{ borderColor: "var(--line)" }}
    >
      <div
        aria-hidden
        className="anim-drift absolute -bottom-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full blur-[130px] opacity-40"
        style={{ background: "color-mix(in srgb,var(--primary) 40%, transparent)" }}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <Reveal>
            <div>
              <a
                href="#home"
                aria-label="YourMark — Home"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex rounded-2xl p-2 transition-transform duration-500 hover:scale-105"
              >
                <img
                  src={logo}
                  alt="YourMark"
                  width={68}
                  height={68}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="logo-adapt h-16 w-16 object-contain"
                />
              </a>
              <p className="mt-5 max-w-xs text-[15px] font-semibold leading-relaxed">
                {t.footer.tagline}
              </p>
              <p className="mt-3 max-w-xs text-[12.5px] leading-relaxed txt-muted">
                {t.contact.info[2].v} · {t.contact.info[3].v}
              </p>
            </div>
          </Reveal>

          {/* Pages */}
          <Reveal delay={0.08}>
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.22em] txt-muted">
                {t.footer.pages}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {NAV_IDS.map((id) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="text-[13.5px] txt-muted transition-colors duration-300 hover:text-[var(--primary)]"
                    >
                      {t.nav[id]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Services */}
          <Reveal delay={0.14}>
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.22em] txt-muted">
                {t.footer.services}
              </h3>
              <ul className="mt-5 space-y-2.5">
                {t.services.items.slice(0, 8).map((s, i) => (
                  <li key={i}>
                    <a
                      href="#services"
                      className="text-[13.5px] txt-muted transition-colors duration-300 hover:text-[var(--primary)]"
                    >
                      {s.t}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Social */}
          <Reveal delay={0.2}>
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.22em] txt-muted">
                {t.footer.social}
              </h3>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="grid h-11 w-11 place-items-center rounded-2xl glass shadow-lux transition-all duration-400 hover:-translate-y-1 hover:text-[var(--primary)]"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                      <path d={s.d} />
                    </svg>
                  </a>
                ))}
              </div>
              <a
                href={`https://wa.me/${settings.whatsapp || WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="latin mt-6 inline-block text-[13.5px] font-bold transition-colors hover:text-[var(--primary)]"
              >
                {settings.phone || "+966 53 959 5432"}
              </a>
            </div>
          </Reveal>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 flex flex-col items-center justify-between gap-4 border-t pt-7 sm:flex-row"
          style={{ borderColor: "var(--line)" }}
        >
          <p className="text-[12.5px] txt-muted">
            <span className="latin">© {year}</span> · {t.footer.rights}
          </p>
          <p className="text-[12px] txt-muted">{t.footer.built}</p>
        </div>
      </div>

      {/* Back to top */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label={t.footer.top}
        title={t.footer.top}
        initial={false}
        animate={show ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.6, y: 20 }}
        transition={{ duration: 0.4 }}
        style={{ pointerEvents: show ? "auto" : "none" }}
        className="fixed bottom-6 end-6 z-50 grid h-12 w-12 place-items-center rounded-full text-white shadow-lux"
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(135deg,var(--primary),var(--secondary))" }}
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative h-4.5 w-4.5"
          style={{ height: 18, width: 18 }}
        >
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </motion.button>
    </footer>
  );
}
