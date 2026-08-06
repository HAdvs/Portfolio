import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "./lib/cms/tracker";
import {
  Background,
  CursorLayer,
  Marquee,
  Preloader,
  ScrollProgress,
} from "./components/Atmosphere";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import { About, Process, Services, Work } from "./components/Sections";
import { Cta, Faq, Voices, Why } from "./components/Sections2";
import { SiteProvider, useSite } from "./lib/site";

/* Elegant sweeping veil on language switch — a real page transition */
function TransitionVeil() {
  const { lang, isRTL, logo } = useSite();
  const first = useRef(true);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setActive(true);
    const id = setTimeout(() => setActive(false), 720);
    return () => clearTimeout(id);
  }, [lang]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="veil"
          initial={{ clipPath: isRTL ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0 0 0)" }}
          exit={{ clipPath: isRTL ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)" }}
          transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
          className="pointer-events-none fixed inset-0 z-[150] grid place-items-center"
          style={{ background: "var(--page)" }}
        >
          <img
            src={logo}
            alt=""
            aria-hidden
            width={96}
            height={96}
            className="logo-adapt anim-float h-20 w-20 object-contain opacity-90"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MarqueeStrip() {
  const { t } = useSite();
  return <Marquee items={t.marquee} />;
}
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}
function Site() {
  const { lang } = useSite();

  return (
    <>
      <AnalyticsTracker />
      <Background />
      <CursorLayer />
      <ScrollProgress />
      <Preloader />
      <TransitionVeil />
      <Navbar />

      {/* Content re-mounts on language change with a soft reveal (no layout collapse) */}
      <motion.main
        key={lang}
        initial={{ opacity: 0, filter: "blur(7px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <Hero />
        <MarqueeStrip />
        <About />
        <Services />
        <Work />
        <Process />
        <Why />
        <Voices />
        <Faq />
        <Cta />
        <Contact />
      </motion.main>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <Site />
    </SiteProvider>
  );
}
