"use client";

import Image from "next/image";
import { pastEditions } from "@/lib/data";
import { FadeIn, SectionHeader } from "@/components/ui/motion";

export function PastEditionsSection() {
  return (
    <section id="past-editions" className="py-16 bg-surface/40 electric-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Past Editions"
          subtitle="Corechella grows every edition — here's where we've been"
          accent
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
          {pastEditions.map((edition, i) => (
            <FadeIn key={`${edition.year}-${edition.edition}`} delay={i * 0.1}>
              <div className="group overflow-hidden rounded-2xl electric-card">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={edition.image}
                    alt={`Corechella Edition ${edition.edition}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 448px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-electric/80">
                      Edition {edition.edition}
                    </p>
                    <p className="font-heading text-3xl font-bold text-white">Corechella</p>
                    <p className="text-electric font-bold text-xl">{edition.date}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-electric">{edition.location}</p>
                  <p className="mt-1 text-xs text-muted">{edition.highlight}</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {edition.attendance.toLocaleString()}{edition.attendanceSuffix ?? ""} attendees
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
