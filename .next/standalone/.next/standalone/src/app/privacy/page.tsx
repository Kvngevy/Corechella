import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — Corechella",
  description: "How Corechella collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <StaticPageLayout
      title="Privacy Policy"
      subtitle={`Last updated: ${new Date().getFullYear()}`}
    >
      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Information We Collect</h2>
        <p>
          When you buy tickets or create an account, we collect your name, email, phone number, and
          payment details necessary to process your order. Guest checkout collects only what is
          needed to deliver your tickets.
        </p>
      </div>

      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">How We Use Your Data</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Process ticket orders and send QR codes</li>
          <li>Manage your User Dashboard account</li>
          <li>Send event updates and important notifications</li>
          <li>Improve the Corechella experience across editions</li>
        </ul>
      </div>

      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Data Security</h2>
        <p>
          We use industry-standard encryption and secure storage. Payment information is processed
          through trusted payment providers and is not stored on our servers.
        </p>
      </div>

      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Your Rights</h2>
        <p>
          You may request access, correction, or deletion of your personal data by contacting{" "}
          <a href="mailto:privacy@corechella.com" className="text-electric hover:underline">
            privacy@corechella.com
          </a>
          .
        </p>
      </div>
    </StaticPageLayout>
  );
}
