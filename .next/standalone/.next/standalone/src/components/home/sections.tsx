"use client";

import Image from "next/image";
import { Star, Zap } from "lucide-react";
import Link from "next/link";
import { testimonials, whyCorechella, corechella, CORECHELLA_THEME } from "@/lib/data";
import { formatEventDates } from "@/lib/utils";
import { FadeIn, SectionHeader } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Shield, QrCode, Globe, Calendar } from "lucide-react";

const whyIcons = [Calendar, Shield, QrCode, Globe];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-16 bg-surface/50 electric-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Corechella Stories"
          subtitle={`What rave-goers say about ${CORECHELLA_THEME}`}
          centered
          accent
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.1}>
              <div className="relative h-full overflow-hidden rounded-2xl electric-card">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric/50 to-transparent" />
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover object-top"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-muted leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5">
                    <p className="text-sm font-semibold uppercase tracking-wider text-white">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyCorechellaSection() {
  return (
    <section id="how-it-works" className="relative py-16">
      <div className="section-glow absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Why Corechella"
          subtitle="One rave. One community. Every 3–4 months."
          centered
          accent
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyCorechella.map((item, i) => {
            const Icon = whyIcons[i];
            return (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="group rounded-2xl electric-card p-6 text-center h-full">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric/15 to-violet/25 border border-electric/20 text-electric transition-all group-hover:electric-glow-sm group-hover:scale-105">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{item.description}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl electric-border p-12 text-center sm:p-16">
            <div className="absolute inset-0 bg-gradient-to-br from-violet/30 via-surface to-magenta/20" />
            <div className="absolute inset-0 electric-grid opacity-50" />
            <div className="relative">
              <Zap className="mx-auto h-8 w-8 text-electric mb-4" />
              <h2 className="font-heading text-3xl font-bold text-white sm:text-5xl">
                See You at <span className="text-electric">Corechella {corechella.edition}</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted">
                Tickets are live. Join thousands for {CORECHELLA_THEME} — {formatEventDates(corechella.date, corechella.endDate)} in Ibadan.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/tickets">
                  <Button size="lg">Get Tickets</Button>
                </Link>
                <Link href="/#gallery">
                  <Button variant="outline" size="lg">View Gallery</Button>
                </Link>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
