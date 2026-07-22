"use client";

import { Search, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EventSearchBarProps {
  className?: string;
  floating?: boolean;
}

export function EventSearchBar({ className, floating = false }: EventSearchBarProps) {
  return (
    <div
      className={cn(
        "rounded-2xl glass-electric p-4 sm:p-5",
        floating && "electric-glow",
        className
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-electric" />
          <Input
            placeholder="Search events, artists, venues..."
            className="pl-10"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:gap-3">
          <div className="relative sm:w-44">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-electric/70" />
            <Input placeholder="All Dates" className="pl-10" />
          </div>
          <div className="relative sm:w-44">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-electric/70" />
            <Input placeholder="All Locations" className="pl-10" />
          </div>
          <Button className="whitespace-nowrap lg:px-8">Search Events</Button>
        </div>
      </div>
    </div>
  );
}
