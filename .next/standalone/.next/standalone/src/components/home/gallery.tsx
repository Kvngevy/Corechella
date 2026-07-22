"use client";

import Image from "next/image";
import Link from "next/link";
import { corechella } from "@/lib/data";

export function GallerySection() {
  const displayImages = corechella.gallery.slice(0, 6);

  return (
    <section id="gallery" className="rave-section border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="rave-subheading text-center">Gallery</p>
        <h2 className="rave-heading mt-3 text-center">The Vibe</h2>

        <div className="mt-10 flex items-stretch gap-3 overflow-x-auto pb-4 sm:gap-4">
          {displayImages.map((src, i) => (
            <div
              key={src}
              className="relative h-40 w-52 shrink-0 overflow-hidden rounded-lg rave-card sm:h-48 sm:w-60 md:h-52 md:w-64"
            >
              <Image
                src={src}
                alt={`Corechella ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="260px"
              />
            </div>
          ))}
          <Link
            href="/#gallery"
            className="btn-outline-white flex h-40 w-36 shrink-0 items-center justify-center self-center px-4 text-center text-[10px] sm:h-48 sm:w-40"
          >
            View All Photos
          </Link>
        </div>
      </div>
    </section>
  );
}
