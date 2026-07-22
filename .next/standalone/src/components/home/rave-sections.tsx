"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Music,
  Disc3,
  Wine,
  Crown,
  Camera,
  UtensilsCrossed,
  Check,
  Plus,
  MapPin,
  Ban,
  Smile,
  Shirt,
  Shield,
  Lock,
  ArrowRight,
  Play,
} from "lucide-react";
import {
  corechella,
  VENUE,
  VENUE_AREA,
  VENUE_FULL,
  CITY,
  landingTicketTiers,
  eventSchedule,
  expectItems,
  CORECHELLA_THEME,
} from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { images } from "@/lib/images";
import { usePlatform } from "@/lib/store/platform-store";
import { HomepageEarlyBirdCard } from "@/components/tickets/ticket-tier-cards";
import { PartnerCarousel } from "@/components/home/partner-carousel";
import { TableReservationSection } from "@/components/tickets/table-reservation-section";

const iconMap = {
  music: Music,
  disc: Disc3,
  wine: Wine,
  crown: Crown,
  camera: Camera,
  utensils: UtensilsCrossed,
};

const dressRules = [
  { icon: Shirt, label: "All Black" },
  { icon: Ban, label: "No Slippers" },
  { icon: Shield, label: "No Weapons" },
  { icon: Smile, label: "Good Vibes" },
];

export function AboutSection() {
  return (
    <section id="about" className="rave-section bg-black">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div>
          <p className="rave-subheading">About Corechella</p>
          <h2 className="rave-heading mt-3">
            More Than An Event.
            <br />
            <span className="text-primary">It&apos;s A Movement.</span>
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
            {corechella.description}
          </p>
          <Link
            href="/about"
            className="btn-outline-white mt-8 inline-flex items-center gap-2 px-6 py-3 text-xs"
          >
            Learn More
            <ArrowRight className="h-4 w-4 text-gold" />
          </Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl rave-card">
          <Image
            src={images.banner}
            alt="Corechella crowd"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="tagline-script text-center text-2xl sm:text-3xl">
              {CORECHELLA_THEME}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ExperienceSection() {
  return (
    <section id="experience" className="rave-section border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* What to Expect — left */}
          <div>
            <p className="rave-subheading">What To Expect</p>
            <h2 className="rave-heading mt-3">The Experience</h2>
            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
              {expectItems.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];
                return (
                  <div
                    key={item.label}
                    className="rave-card-purple flex aspect-square flex-col items-center justify-center gap-2 p-3 text-center sm:gap-3 sm:p-4"
                  >
                    <Icon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                    <p className="font-body text-[8px] font-bold uppercase leading-tight tracking-wider text-white/90 sm:text-[9px]">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Schedule — right */}
          <div>
            <p className="rave-subheading">Event Schedule</p>
            <h2 className="rave-heading mt-3">Timeline</h2>
            <div className="relative mt-8">
              <div className="absolute bottom-4 left-3 top-4 w-px bg-gradient-to-b from-primary/20 via-primary to-primary/20" />
              <ul className="space-y-6">
                {eventSchedule.map((item) => (
                  <li key={item.time} className="relative flex gap-5 pl-8">
                    <span className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-black text-[9px] font-bold text-gold">
                      •
                    </span>
                    <div>
                      <p className="font-body text-xs font-bold uppercase tracking-wider text-gold">{item.time}</p>
                      <p className="mt-0.5 font-heading text-sm font-bold uppercase text-white">{item.label}</p>
                      <p className="mt-0.5 font-body text-xs text-muted">{item.subtitle}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TicketPricingSection() {
  const { earlyBird } = usePlatform();

  return (
    <section id="tickets" className="rave-section border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="rave-subheading text-center">Choose Your Experience</p>
        <h2 className="rave-heading mt-3 text-center">Ticket Pricing</h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <HomepageEarlyBirdCard stats={earlyBird} />

          {landingTicketTiers
            .filter((ticket) => ticket.id !== "eb")
            .map((ticket) => {
              const isPopular = "popular" in ticket && ticket.popular;

              return (
                <div
                  key={ticket.id}
                  className={isPopular ? "rave-card-gold relative flex flex-col p-6" : "rave-card-purple relative flex flex-col p-6"}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-4 py-1 text-[9px] font-bold uppercase tracking-wider text-black">
                      Most Popular
                    </span>
                  )}

                  <h3 className="font-heading text-lg font-bold uppercase text-white">
                    {ticket.name}
                  </h3>
                  <p className="mt-2 font-body text-3xl font-bold text-gold">
                    {formatPrice(ticket.price)}
                  </p>

                  <ul className="mt-5 flex-1 space-y-2">
                    {ticket.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs text-muted">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/tickets"
                    className={`mt-6 block w-full py-3 text-center text-[10px] font-bold uppercase tracking-wider ${
                      isPopular ? "btn-gold" : "btn-purple"
                    }`}
                  >
                    Purchase Ticket
                  </Link>
                </div>
              );
            })}
        </div>

        <TableReservationSection />

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted">
          <Lock className="h-3.5 w-3.5 text-gold" />
          Secure your spot. Tickets are limited.
        </p>
      </div>
    </section>
  );
}

export function DressCodeVenueSection() {
  return (
    <section id="venue" className="rave-section border-t border-white/5 bg-black">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:px-8">
        {/* Dress Code card */}
        <div className="relative min-h-[420px] overflow-hidden rounded-xl rave-card">
          <Image
            src={images.authSignup}
            alt="Dress code"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
            <p className="rave-subheading">Dress Code</p>
            <h2 className="mt-2 font-heading text-2xl font-bold uppercase leading-tight text-white sm:text-3xl">
              Dress to Express.
              <br />
              All Black. All Vibes.
            </h2>
            <div className="mt-8 grid grid-cols-4 gap-3">
              {dressRules.map((rule) => (
                <div key={rule.label} className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/40 text-gold sm:h-14 sm:w-14">
                    <rule.icon className="h-5 w-5" />
                  </div>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-white sm:text-[9px]">
                    {rule.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Venue card */}
        <div className="relative min-h-[420px] overflow-hidden rounded-xl rave-card">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] via-[#12082a] to-black" />
          <div className="absolute inset-0 opacity-30">
            <div className="electric-grid h-full w-full" />
          </div>
          <MapPin className="absolute left-1/2 top-1/3 h-10 w-10 -translate-x-1/2 text-primary" />

          <div className="relative flex h-full flex-col p-6 sm:p-8">
            <p className="rave-subheading">The Venue</p>
            <h2 className="mt-2 font-heading text-2xl font-bold uppercase text-white sm:text-3xl">
              {VENUE_AREA}, {CITY}
            </h2>
            <p className="mt-1 text-sm text-muted">{VENUE_FULL}</p>

            <div className="relative mt-auto aspect-video w-full overflow-hidden rounded-lg border border-white/10">
              <Image
                src={images.ibadan.mapoHall}
                alt={VENUE}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(VENUE_FULL)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold transition-opacity hover:opacity-80"
            >
              Get Directions
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PartnersSection() {
  return <PartnerCarousel />;
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = corechella.faqs.slice(0, 5);

  return (
    <section id="faq" className="rave-section border-t border-white/5 bg-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="rave-subheading text-center">FAQ</p>
        <h2 className="rave-heading mt-3 text-center">Got Questions?</h2>

        <div className="mt-10 space-y-2">
          {faqs.map((faq, i) => (
            <div key={faq.question} className="rave-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-body text-sm font-medium text-white">{faq.question}</span>
                <Plus
                  className={`h-5 w-5 shrink-0 text-gold transition-transform ${open === i ? "rotate-45" : ""}`}
                />
              </button>
              {open === i && (
                <div className="border-t border-white/10 px-5 pb-4 pt-2 text-sm leading-relaxed text-muted">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/faqs" className="btn-outline-white inline-flex px-6 py-3 text-xs">
            View All FAQs
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ReadyCtaSection() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src={images.hero}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-primary/50 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/70" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:py-20 lg:px-8">
        <div className="max-w-lg text-center md:text-left">
          <h2 className="font-heading text-3xl font-bold uppercase text-white sm:text-4xl lg:text-5xl">
            Ready For The Summer?
          </h2>
          <p className="font-body text-sm text-white/75">
            Don&apos;t miss {CORECHELLA_THEME}. Secure your ticket now.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/tickets" className="btn-gold inline-flex items-center gap-2 px-8 py-4 text-xs">
            Get Your Ticket Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#gallery"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition-colors hover:border-gold"
            aria-label="Watch trailer"
          >
            <Play className="h-4 w-4 fill-white" />
          </a>
        </div>
      </div>
    </section>
  );
}
