import Link from "next/link";

const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "X", href: "https://x.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <Link href="/" className="font-heading text-lg font-bold uppercase tracking-[0.15em] text-gold">
          CORECHELLA
        </Link>

        <p className="font-body text-xs text-muted">
          &copy; {new Date().getFullYear()} Corechella. All Rights Reserved.
        </p>

        <div className="flex items-center gap-5">
          <Link
            href="/privacy"
            className="text-[10px] font-semibold uppercase tracking-widest text-muted transition-colors hover:text-gold"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-[10px] font-semibold uppercase tracking-widest text-muted transition-colors hover:text-gold"
          >
            Terms &amp; Conditions
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-4 pb-6 sm:px-6 lg:px-8">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-muted transition-colors hover:border-gold hover:text-gold"
            aria-label={s.label}
          >
            {s.label[0]}
          </a>
        ))}
      </div>

      <div className="border-t border-white/5 py-3 text-center">
        <a
          href="https://zavex.ng"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted transition-colors hover:text-gold"
        >
          Powered by <span className="font-semibold text-gold">ZAVEX</span>
        </a>
      </div>
    </footer>
  );
}
