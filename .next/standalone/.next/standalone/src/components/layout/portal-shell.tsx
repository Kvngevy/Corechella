"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/lib/store/platform-store";

export interface PortalLink {
  href: string;
  label: string;
  icon: React.ElementType;
  superAdminOnly?: boolean;
  permission?: string;
}

interface PortalShellProps {
  links: PortalLink[];
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function PortalShell({ links, title, subtitle, children }: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, session } = usePlatform();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const visibleLinks = links.filter((link) => {
    if (link.superAdminOnly && session?.role !== "super_admin") return false;
    if (link.permission && session?.role === "ticket_manager") {
      return session.permissions.includes(link.permission);
    }
    return true;
  });

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const nav = (
    <nav className="space-y-1">
      {visibleLinks.map((link) => {
        const active = isActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
              active
                ? "bg-gradient-to-r from-electric/15 to-violet/15 text-electric border border-electric/20"
                : "text-muted hover:bg-white/5 hover:text-white"
            )}
          >
            <link.icon className="h-4 w-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-electric/10 bg-surface electric-grid lg:flex">
        <div className="p-6">
          <Link href="/" className="inline-flex items-center gap-2 font-heading text-xl font-bold text-white">
            <span className="text-electric">⚡</span>
            CORE<span className="text-electric">CHELLA</span>
          </Link>
          {subtitle && <p className="mt-1 text-xs text-electric/60 uppercase tracking-wider">{subtitle}</p>}
          {session && (
            <p className="mt-2 text-xs text-muted truncate">{session.email}</p>
          )}
        </div>
        <div className="flex-1 px-3">{nav}</div>
        <div className="border-t border-electric/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-electric/10 bg-surface/80 px-4 py-3 backdrop-blur-lg lg:hidden">
          <div className="min-w-0">
            <Link href="/" className="font-heading text-lg font-bold text-white">
              CORE<span className="text-electric">CHELLA</span>
            </Link>
            {title && <p className="text-xs text-muted">{title}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-electric/20 px-3 py-2 text-xs font-medium text-muted hover:bg-white/5 hover:text-white"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Log Out
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg border border-electric/20 p-2 text-white"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-electric/10 bg-surface px-4 py-4 lg:hidden overflow-hidden"
            >
              {session && (
                <p className="mb-3 text-xs text-muted truncate px-1">{session.email}</p>
              )}
              {nav}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
