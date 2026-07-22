"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { CORECHELLA_THEME } from "@/lib/data";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#tickets", label: "Tickets" },
  { href: "/#venue", label: "Venue" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 lg:px-6">
      <div
        className={cn(
          "nav-glass mx-auto max-w-7xl rounded-2xl transition-all duration-300",
          scrolled || !transparent ? "nav-glass-scrolled" : ""
        )}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
          <Link href="/" className="shrink-0">
            <span className="block font-heading text-base font-bold tracking-[0.15em] text-gold sm:text-lg">
              CORECHELLA
            </span>
            <span className="hidden font-body text-[8px] font-semibold uppercase tracking-[0.35em] text-gold/70 sm:block">
              {CORECHELLA_THEME}
            </span>
          </Link>

          <nav className="hidden items-center gap-4 rounded-full border border-white/8 bg-white/5 px-5 py-2 font-body xl:flex xl:flex-1 xl:justify-center">
            {navLinks.map((link) => {
              const isHome = link.href === "/" && pathname === "/";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:text-gold",
                    isHome ? "text-gold" : "text-white/70"
                  )}
                >
                  {link.label}
                  {isHome && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-gold" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <Link
              href="/tickets"
              className="btn-gold hidden items-center gap-2 px-4 py-2 text-[10px] lg:inline-flex"
            >
              <Ticket className="h-3.5 w-3.5" />
              Get Tickets
            </Link>

            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-colors hover:border-gold/40 xl:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-white/10 xl:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-4 sm:px-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/5 hover:text-gold"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/tickets"
                  onClick={() => setMobileOpen(false)}
                  className="btn-gold mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm"
                >
                  <Ticket className="h-4 w-4" /> Get Tickets
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
