import type { Metadata } from "next";
import Link from "next/link";
import { StaticPageLayout } from "@/components/layout/static-page-layout";
import { corechella, pastEditions, CORECHELLA_THEME, CORECHELLA_ABOUT } from "@/lib/data";
import { formatEventDates } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Press — Corechella",
  description: "Media resources and press contact for Corechella.",
};

function formatAttendance(edition: typeof pastEditions[number]) {
  return `${edition.attendance.toLocaleString()}${edition.attendanceSuffix ?? ""} attendees`;
}

export default function PressPage() {
  return (
    <StaticPageLayout
      title="Press"
      subtitle="Media resources for Corechella"
    >
      <p className="text-base text-white/90">
        {CORECHELLA_ABOUT} Four editions deep, hosted in Ibadan every 3–4 months.
      </p>

      <div className="rounded-2xl electric-card p-6 space-y-4">
        <h2 className="font-heading text-xl font-semibold text-white">Quick Facts</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>Location: {corechella.venue}, {corechella.city}, Nigeria</li>
          <li>
            Current edition: {corechella.title} (Edition 4) —{" "}
            {formatEventDates(corechella.date, corechella.endDate)}
          </li>
          <li>Edition 1 ({pastEditions[0].date}): {pastEditions[0].location} · {formatAttendance(pastEditions[0])}</li>
          <li>Edition 2 ({pastEditions[1].date}): {pastEditions[1].location} · {formatAttendance(pastEditions[1])}</li>
          <li>Edition 3 ({pastEditions[2].date}): {pastEditions[2].location} · {formatAttendance(pastEditions[2])}</li>
          <li>
            Edition 4 ({formatEventDates(corechella.date, corechella.endDate)}): {corechella.venue},{" "}
            {corechella.city} · current edition
          </li>
          <li>Organizer: {corechella.organizer}</li>
        </ul>
      </div>

      <div className="rounded-2xl electric-card p-6 space-y-3">
        <h2 className="font-heading text-xl font-semibold text-white">Media Inquiries</h2>
        <p>
          For press kits, interviews, and partnership coverage, reach out to our team.
        </p>
        <Link href="/contact" className="text-electric hover:underline">
          Contact us →
        </Link>
      </div>
    </StaticPageLayout>
  );
}
