import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Calendar, MapPin } from "lucide-react";
import {
  corechella,
  pastEditions,
  eventStats,
  whyCorechella,
  aboutContent,
  experiences,
  testimonials,
  CURRENT_EDITION,
  VENUE_FULL,
  CITY,
  CORECHELLA_THEME,
} from "@/lib/data";
import { images } from "@/lib/images";
import { formatEventDates } from "@/lib/utils";

export function AboutPageContent() {
  return (
    <>
      {/* Hero */}
      <section className="rave-section bg-black pt-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div>
            <p className="rave-subheading">About Corechella</p>
            <h1 className="rave-heading mt-3">
              More Than An Event.
              <br />
              <span className="text-primary">It&apos;s A Movement.</span>
            </h1>
            <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">
              {corechella.description}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Edition {CURRENT_EDITION} · {CORECHELLA_THEME} · {VENUE_FULL}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl rave-card">
            <Image
              src={images.banner}
              alt="Corechella crowd"
              fill
              className="object-cover"
              priority
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

      {/* Stats */}
      <section className="border-y border-white/10 bg-black py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
          {eventStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-3xl font-bold text-gold sm:text-4xl">
                {stat.value.toLocaleString()}
                {stat.suffix}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted sm:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="rave-section border-t border-white/5 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="rave-subheading text-center">What We Stand For</p>
          <h2 className="rave-heading mt-3 text-center">Mission &amp; Vision</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rave-card-gold p-6 sm:p-8">
              <p className="rave-subheading">Our Mission</p>
              <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">
                {aboutContent.mission}
              </p>
            </div>
            <div className="rave-card-purple p-6 sm:p-8">
              <p className="rave-subheading">Our Vision</p>
              <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">
                {aboutContent.vision}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="rave-section border-t border-white/5 bg-black">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div>
            <p className="rave-subheading">Our Story</p>
            <h2 className="rave-heading mt-3">From Ibadan To The World</h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
              {aboutContent.story.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl rave-card sm:aspect-[4/5]">
            <Image
              src={images.pastEdition1}
              alt="Corechella Edition 1"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="rave-subheading">Since Edition 1</p>
              <p className="mt-1 font-heading text-xl font-bold text-white">
                {VENUE_FULL}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Edition History */}
      <section className="rave-section border-t border-white/5 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="rave-subheading text-center">The Journey</p>
          <h2 className="rave-heading mt-3 text-center">Edition History</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pastEditions.map((edition) => (
              <div key={edition.edition} className="rave-card overflow-hidden">
                <div className="relative aspect-video">
                  <Image
                    src={edition.image}
                    alt={`Corechella Edition ${edition.edition}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="rave-subheading">Edition {edition.edition}</p>
                  <h3 className="mt-1 font-heading text-xl font-bold text-white">
                    Corechella {edition.year}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 text-xs text-muted">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-gold" />
                    {edition.date}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />
                    {edition.location}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                    <Users className="h-3.5 w-3.5 shrink-0 text-gold" />
                    {edition.attendance.toLocaleString()}{edition.attendanceSuffix ?? ""} attendees
                  </p>
                  <p className="mt-3 text-sm text-white/80">{edition.highlight}</p>
                </div>
              </div>
            ))}

            <div className="rave-card-gold overflow-hidden">
              <div className="relative aspect-video">
                <Image
                  src={images.banner}
                  alt={corechella.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[9px] font-bold uppercase text-black">
                  Current
                </span>
              </div>
              <div className="p-5">
                <p className="rave-subheading">Edition {CURRENT_EDITION}</p>
                <h3 className="mt-1 font-heading text-xl font-bold text-white">{corechella.title}</h3>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <Calendar className="h-3.5 w-3.5 text-gold" />
                  {formatEventDates(corechella.date, corechella.endDate)}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                  {VENUE_FULL}
                </p>
                <Link href="/tickets" className="btn-gold mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-[10px]">
                  Get Tickets
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Experience */}
      <section className="rave-section border-t border-white/5 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="rave-subheading text-center">What Awaits You</p>
          <h2 className="rave-heading mt-3 text-center">The Corechella Experience</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp) => (
              <div key={exp.name} className="rave-card-purple overflow-hidden">
                <div className="relative aspect-[16/10]">
                  <Image src={exp.image} alt={exp.name} fill className="object-cover" sizes="400px" />
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-white">{exp.name}</h3>
                  <p className="mt-2 text-sm text-muted">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Corechella */}
      <section className="rave-section border-t border-white/5 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="rave-subheading text-center">Why Join Us</p>
          <h2 className="rave-heading mt-3 text-center">Why Corechella</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {whyCorechella.map((item) => (
              <div key={item.title} className="rave-card p-6">
                <h3 className="font-heading text-lg font-bold text-gold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="rave-section border-t border-white/5 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="rave-subheading text-center">Our Values</p>
          <h2 className="rave-heading mt-3 text-center">What We Believe</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aboutContent.values.map((value) => (
              <div key={value.title} className="rave-card p-5 text-center">
                <h3 className="font-heading text-base font-bold text-white">{value.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="rave-section border-t border-white/5 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="rave-subheading text-center">Community Voices</p>
          <h2 className="rave-heading mt-3 text-center">What Ravers Say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rave-card overflow-hidden">
                <div className="relative aspect-[3/4] w-full">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover object-top" sizes="400px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                </div>
                <div className="p-6">
                  <p className="text-sm italic leading-relaxed text-white/85">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5">
                    <p className="text-sm font-semibold uppercase tracking-wider text-white">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/5">
        <Image src={images.hero} alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-primary/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/80" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold uppercase text-white sm:text-4xl lg:text-5xl">
            Ready For The Summer?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/75">
            Join thousands of ravers at {corechella.title}. Tickets are live — secure your spot before they&apos;re gone.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/tickets" className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 text-xs">
              Get Your Ticket
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn-outline-white inline-flex px-8 py-3.5 text-xs">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
