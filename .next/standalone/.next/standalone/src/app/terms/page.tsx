import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
  title: "Terms of Service — Corechella",
  description: "Terms and conditions for using Corechella and attending our events.",
};

export default function TermsPage() {
  return (
    <StaticPageLayout
      title="Terms of Service"
      subtitle={`Last updated: ${new Date().getFullYear()}`}
    >
      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Acceptance of Terms</h2>
        <p>
          By purchasing tickets or using corechella.com, you agree to these Terms of Service. If you
          do not agree, please do not use our platform or attend our events.
        </p>
      </div>

      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Tickets & Entry</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Tickets are valid only for the edition and tier purchased</li>
          <li>QR codes are required for entry — one scan per ticket</li>
          <li>Tickets are non-refundable and non-transferable</li>
          <li>Corechella reserves the right to refuse entry for safety or policy violations</li>
        </ul>
      </div>

      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Conduct at Events</h2>
        <p>
          Attendees must follow venue rules and staff instructions. Harassment, illegal activity, or
          behaviour that endangers others may result in removal without refund.
        </p>
      </div>

      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Limitation of Liability</h2>
        <p>
          Corechella is not liable for circumstances beyond our control, including weather,
          government restrictions, or force majeure events. See our Refund Policy for cancellation
          details.
        </p>
      </div>
    </StaticPageLayout>
  );
}
