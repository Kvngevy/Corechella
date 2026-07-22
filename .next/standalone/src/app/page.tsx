import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero";
import { GallerySection } from "@/components/home/gallery";
import {
  AboutSection,
  ExperienceSection,
  TicketPricingSection,
  DressCodeVenueSection,
  PartnersSection,
  FaqSection,
  ReadyCtaSection,
} from "@/components/home/rave-sections";

export default function HomePage() {
  return (
    <>
      <Navbar transparent />
      <main className="rave-page">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <TicketPricingSection />
        <DressCodeVenueSection />
        <GallerySection />
        <PartnersSection />
        <FaqSection />
        <ReadyCtaSection />
      </main>
      <Footer />
    </>
  );
}
