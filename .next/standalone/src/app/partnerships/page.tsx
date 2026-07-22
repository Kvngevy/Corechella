import type { Metadata } from "next";
import Link from "next/link";
import { StaticPageLayout } from "@/components/layout/static-page-layout";
import { CORECHELLA_THEME, CORECHELLA_ABOUT } from "@/lib/data";

export const metadata: Metadata = {
  title: "Partnerships — Corechella",
  description: "Partner with Corechella — sponsorship and brand collaboration opportunities.",
};

const partnershipTypes = [
  {
    title: "Brand Sponsorship",
    description: `Put your brand in front of thousands at Corechella — ${CORECHELLA_THEME} in Ibadan.`,
  },
  {
    title: "Food & Beverage",
    description: "Showcase your menu at the Food Village — West African flavours, global reach.",
  },
  {
    title: "Artist & Talent",
    description: "Perform on the Main Stage or Neon After Dark — reach Corechella's growing audience.",
  },
  {
    title: "Media & Content",
    description: "Co-create content, live streams, and festival coverage across editions.",
  },
];

export default function PartnershipsPage() {
  return (
    <StaticPageLayout
      title="Partnerships"
      subtitle="Collaborate with Corechella"
    >
      <p className="text-base text-white/90">
        {CORECHELLA_ABOUT} Partner with us to reach music, fashion, and creative communities across
        Ibadan.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {partnershipTypes.map((item) => (
          <div key={item.title} className="rounded-2xl electric-card p-5">
            <h3 className="font-heading text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl electric-card p-6">
        <h2 className="font-heading text-xl font-semibold text-white">Get in Touch</h2>
        <p className="mt-3">
          Email{" "}
          <a href="mailto:partners@corechella.com" className="text-electric hover:underline">
            partners@corechella.com
          </a>{" "}
          with your proposal, or use our{" "}
          <Link href="/contact" className="text-electric hover:underline">
            contact form
          </Link>
          .
        </p>
      </div>
    </StaticPageLayout>
  );
}
