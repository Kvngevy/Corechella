import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AboutPageContent } from "@/components/about/about-page-content";
import { CORECHELLA_THEME, CORECHELLA_ABOUT } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Corechella",
  description: CORECHELLA_ABOUT,
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="rave-page">
        <AboutPageContent />
      </main>
      <Footer />
    </>
  );
}
