import type { Metadata } from "next";
import Link from "next/link";
import { StaticPageLayout } from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
  title: "Refund Policy — Corechella",
  description: "Corechella ticket refund policy.",
};

export default function RefundPage() {
  return (
    <StaticPageLayout
      title="Refund Policy"
      subtitle="Ticket refunds and cancellations"
    >
      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">General Policy</h2>
        <p>
          <strong className="text-white">TICKETS ARE NON-REFUNDABLE.</strong> All Corechella tickets
          are final sale. No refunds will be issued under any circumstances. Service fees are also
          non-refundable.
        </p>
      </div>

      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Event Cancellation</h2>
        <p>
          If Corechella cancels an edition, ticket holders will receive a full refund to their
          original payment method within 14 business days, or the option to use their ticket for the
          next edition.
        </p>
      </div>

      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Event Rescheduling</h2>
        <p>
          If an edition is rescheduled, your ticket remains valid for the new date. If you cannot
          attend the new date, you may request a refund within 7 days of the reschedule announcement.
        </p>
      </div>

      <p>
        Questions? Visit our{" "}
        <Link href="/faqs" className="text-electric hover:underline">
          FAQs
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="text-electric hover:underline">
          contact us
        </Link>
        .
      </p>
    </StaticPageLayout>
  );
}
