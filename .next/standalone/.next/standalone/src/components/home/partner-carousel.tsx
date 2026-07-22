"use client";

import Image from "next/image";
import { partnerLogos, CORECHELLA_THEME } from "@/lib/data";

export function PartnerCarousel() {
  const track = [...partnerLogos, ...partnerLogos];

  return (
    <section className="rave-section border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="rave-heading">Our Partners</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
            The brands powering Corechella&apos;s {CORECHELLA_THEME.toLowerCase()} experience
          </p>
        </div>

        <div className="marquee mt-14">
          <div className="marquee-track items-end gap-0 py-2">
            {track.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="partner-marquee-item group mx-10 flex w-28 shrink-0 flex-col items-center gap-4 sm:mx-14 sm:w-32"
              >
                <div className="flex h-14 w-full items-center justify-center sm:h-16">
                  <Image
                    src={partner.src}
                    alt={partner.name}
                    width={128}
                    height={64}
                    loading="lazy"
                    className="max-h-full w-auto max-w-full object-contain opacity-90 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                </div>
                <p className="font-body text-[9px] font-semibold uppercase tracking-[0.22em] text-white/35 transition-colors duration-300 group-hover:text-gold/90 sm:text-[10px]">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
