"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { EMPH } from "@/components/motion/primitives";
import { SITE } from "@/lib/site";
import ActionLink from "@/components/site/ActionLink";

const LINKS = [
  { href: "/projects", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Hide on scroll down, show on scroll up.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 120 && y > prev);
  });

  // middleware.ts only lets tailnet requests reach /api/admin/*, so a 200 means "show Admin".
  useEffect(() => {
    fetch("/api/admin/whoami").then((r) => setIsAdmin(r.ok), () => {});
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const links = isAdmin ? [...LINKS, { href: "/admin", label: "Admin" }] : LINKS;
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-steel via-ember to-brass"
        style={{ scaleX: scrollYProgress }}
      />
      <motion.header
        className="fixed inset-x-0 top-0 z-40"
        animate={{ y: hidden && !open ? "-110%" : "0%" }}
        transition={{ duration: 0.35, ease: EMPH }}
      >
        <div className="shell mt-3">
          <nav className="flex items-center justify-between rounded-full border border-line bg-bg/70 py-2 pr-2 pl-6 backdrop-blur-xl">
            <Link href="/" className="font-display text-[1.65rem] leading-none tracking-[0.03em]">
              Josue Garcia<span className="text-ember">.</span>
            </Link>
            <ul className="hidden items-center gap-1 sm:flex">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`relative rounded-full px-5 py-2 text-base transition-colors duration-150 ${active(l.href) ? "text-ink" : "text-muted hover:text-ink"}`}
                  >
                    {active(l.href) && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-white/8"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <ActionLink href={`mailto:${SITE.email}`} icon="mail" size="sm" className="ml-2">Contact</ActionLink>
              </li>
            </ul>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line sm:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 block h-px w-4 bg-ink transition-transform duration-300 ease-std ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 block h-px w-4 bg-ink transition-transform duration-300 ease-std ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col justify-center bg-bg/95 px-6 backdrop-blur-xl sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <ul className="space-y-2">
              {[{ href: "/", label: "Home" }, ...links].map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, ease: EMPH, delay: 0.05 + i * 0.06 }}
                  >
                    <Link href={l.href} onClick={() => setOpen(false)} className={`h-display block text-5xl ${active(l.href) ? "text-ember-soft" : ""}`}>
                      {l.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
