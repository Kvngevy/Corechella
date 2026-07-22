"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatShortDate, cn } from "@/lib/utils";
import type { CorechellaEvent } from "@/lib/data";

interface EventCardProps {
  event: CorechellaEvent;
  variant?: "default" | "horizontal";
  className?: string;
}

export function EventCard({ event, variant = "default", className }: EventCardProps) {
  const { month, day } = formatShortDate(event.date);

  if (variant === "horizontal") {
    return (
      <motion.div whileHover={{ y: -3 }} className={cn("group", className)}>
        <Link href="/tickets" className="flex gap-4 rounded-2xl electric-card p-4 overflow-hidden">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl">
            <Image src={event.image} alt={event.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
            <Badge variant="date" className="absolute left-2 top-2 text-[10px] px-2 py-0.5">
              {month} {day}
            </Badge>
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <h3 className="font-heading text-lg font-semibold text-white group-hover:text-electric transition-colors">
              {event.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <MapPin className="h-3 w-3 text-electric/70" /> {event.location}
            </p>
            <p className="mt-2 text-sm font-bold text-electric">
              From {formatPrice(event.price)}
            </p>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.35 }} className={cn("group", className)}>
      <Link href="/tickets">
        <div className="overflow-hidden rounded-2xl electric-card">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src={event.image} alt={event.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent opacity-80" />
            <Badge variant="date" className="absolute left-3 top-3">{month} {day}</Badge>
            <Badge variant="gold" className="absolute left-3 top-12 text-[9px]">Annual</Badge>
          </div>
          <div className="p-4 border-t border-electric/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet">Corechella · Edition {event.edition}</p>
            <h3 className="mt-1 font-heading text-lg font-semibold text-white group-hover:text-electric transition-colors">
              {event.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <Calendar className="h-3 w-3 shrink-0 text-electric/60" /> {month} {day} · {event.venue}
            </p>
            <p className="mt-3 text-sm font-bold">
              From <span className="text-electric">{formatPrice(event.price)}</span>
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
