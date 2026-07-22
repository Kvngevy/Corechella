import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

interface StaticPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function StaticPageLayout({ title, subtitle, children }: StaticPageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 electric-grid">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          <div className="mt-10 space-y-6 text-sm leading-relaxed text-muted">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
