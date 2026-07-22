"use client";

import Image from "next/image";
import { Music, Sparkles, Moon, Palette, UtensilsCrossed, Heart } from "lucide-react";
import { experiences } from "@/lib/data";
import { FadeIn } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  music: Music,
  palette: Palette,
  utensils: UtensilsCrossed,
  moon: Moon,
  sparkles: Sparkles,
  heart: Heart,
};

export function ExperiencesSection() {
  return (
    <section className="relative py-24 electric-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-electric mb-2">The Experience</p>
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            What Awaits at <span className="text-electric">Corechella</span>
          </h2>
          <p className="mt-2 text-muted">Music, culture, fashion, and creative communities — all in one immersive night.</p>
        </FadeIn>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((exp, i) => {
            const Icon = iconMap[exp.icon] || Music;
            return (
              <FadeIn key={exp.name} delay={i * 0.05}>
                <div
                  className={cn(
                    "group overflow-hidden rounded-2xl electric-card",
                    "hover:shadow-[0_0_40px_rgba(0,240,255,0.12)]"
                  )}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={exp.image}
                      alt={exp.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-electric/15 border border-electric/30 text-electric backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-sm font-semibold text-white">{exp.name}</span>
                    <p className="mt-1 text-xs text-muted leading-relaxed">{exp.description}</p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
