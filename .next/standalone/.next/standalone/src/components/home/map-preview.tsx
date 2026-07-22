"use client";

import Image from "next/image";
import { MapPin, Navigation } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { corechella } from "@/lib/data";
import { images } from "@/lib/images";

export function VenueSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-electric mb-2">Location</p>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Find <span className="text-electric">Corechella</span>
          </h2>
          <p className="mt-2 text-muted">Same home every edition — Ibadan, Nigeria</p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            <div className="relative overflow-hidden rounded-2xl electric-border lg:col-span-3 aspect-[16/10] min-h-[280px]">
              <Image
                src={images.ibadan.cocoaHouse}
                alt="Cocoa House, Ibadan"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-electric">Ibadan Landmarks</p>
                <p className="mt-1 font-heading text-xl font-bold text-white">Cocoa House</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className="relative flex-1 overflow-hidden rounded-2xl electric-border min-h-[160px]">
                <Image
                  src={images.ibadan.city}
                  alt="Historic Ibadan architecture"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>

              <div className="rounded-2xl electric-card p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-electric/10 border border-electric/30">
                    <MapPin className="h-5 w-5 text-electric" />
                  </div>
                  <div>
                    <p className="font-heading text-lg font-bold text-white">{corechella.venue}</p>
                    <p className="text-sm text-electric">{corechella.city}, Nigeria</p>
                    <p className="mt-2 text-sm text-muted">
                      Corechella returns to Liberty Stadium every 3–4 months — Ibadan&apos;s iconic rave ground.
                    </p>
                    <button className="mt-3 inline-flex items-center gap-2 text-sm text-electric hover:underline">
                      <Navigation className="h-4 w-4" /> Get Directions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
