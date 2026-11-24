"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "motion/react";
import { EMPH } from "@/components/motion/primitives";

/**
 * Floating "back to top" button, lower right; appears once the reader is a screen down.
 * The ring around it fills with scroll progress, so on long pages it also says how far in you are.
 */
export default function ToTop() {
  const [show, setShow] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
          aria-label="Back to top"
          title="Back to top"
          className="to-top"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.4, ease: EMPH }}
        >
          <svg className="to-top-ring" viewBox="0 0 64 64" aria-hidden>
            <circle cx="32" cy="32" r="30" className="to-top-track" />
            <motion.circle cx="32" cy="32" r="30" className="to-top-fill" style={{ pathLength: scrollYProgress }} />
          </svg>
          <span className="to-top-face">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
            </svg>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
