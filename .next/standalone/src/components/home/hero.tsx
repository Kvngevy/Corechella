"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Clock, Shield, Ticket, Zap, Users, Star } from "lucide-react";
import { CountdownTimer } from "@/components/home/countdown";
import { corechella, EVENT_TIME_LINE, VENUE_FULL, CORECHELLA_THEME, CURRENT_EDITION } from "@/lib/data";
import { formatEventDates } from "@/lib/utils";
import { images } from "@/lib/images";

const sideWords = ["MUSIC", "DANCE", "VIBES", "ENERGY", "YOU"];

const features = [
  { icon: Zap, top: "Non-Stop", bottom: "Energy" },
  { icon: Users, top: "5,000+", bottom: "Ravers" },
  { icon: Shield, top: "Secure", bottom: "Environment" },
  { icon: Star, top: "Premium", bottom: "Experience" },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "X", href: "https://x.com" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <Image
          src={images.hero}
          alt=""
          fill
          priority
          quality={90}
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="hero-rave-overlay absolute inset-0" />
      </div>

      {/* Left sidebar */}
      <div className="pointer-events-none absolute bottom-32 left-4 top-32 z-10 hidden flex-col items-center justify-center gap-6 lg:flex">
        {sideWords.map((word) => (
          <span key={word} className="hero-side-text">
            {word}
          </span>
        ))}
      </div>

      {/* Right sidebar — social */}
      <div className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 flex-col gap-4 lg:flex">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="neon-icon-ring flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-bold text-white/70 transition-colors hover:text-gold"
            aria-label={s.label}
          >
            {s.label[0]}
          </a>
        ))}
      </div>

      <div className="hero-content-panel relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 pt-28 pb-8 text-center sm:px-6 lg:px-8">
        <p className="rave-eyebrow hero-text-shadow">Edition {CURRENT_EDITION} · Ibadan</p>

        <h1 className="hero-title-shadow mt-4 font-heading text-5xl font-bold uppercase leading-none tracking-wide text-white sm:text-7xl md:text-8xl lg:text-[6.5rem]">
          CORECHELLA
        </h1>
        <p className="tagline-script hero-tagline-shadow mt-3">{CORECHELLA_THEME}</p>

        <div className="hero-text-shadow mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-wider text-white sm:text-xs">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-gold" />
            {formatEventDates(corechella.date, corechella.endDate)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-gold" />
            {VENUE_FULL}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-gold" />
            {EVENT_TIME_LINE}
          </span>
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 shrink-0 text-gold" />
            No Under 18
          </span>
        </div>

        <div className="mt-10 w-full">
          <CountdownTimer targetDate={corechella.date} />
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/tickets" className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs">
            <Ticket className="h-4 w-4" />
            Get Tickets
          </Link>
        </div>
      </div>

      {/* Feature bar */}
      <div className="relative z-10 border-t border-white/10 bg-black">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
          {features.map((item) => (
            <div key={item.bottom} className="flex flex-col items-center gap-2 text-center">
              <item.icon className="h-6 w-6 text-gold" />
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-white sm:text-xs">
                <span className="text-gold">{item.top}</span>{" "}
                <span className="text-white">{item.bottom}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
