"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
}

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const target = new Date(targetDate + "T16:00:00");
  const [time, setTime] = useState(getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-3 sm:gap-4">
      {units.map((unit) => (
        <div
          key={unit.label}
          className="min-w-[72px] rounded-lg border border-gold/50 bg-black/55 px-4 py-3 text-center backdrop-blur-md sm:min-w-[88px] sm:px-5 sm:py-4"
        >
          <p className="font-body text-2xl font-bold text-white sm:text-3xl">
            {String(unit.value).padStart(2, "0")}
          </p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold sm:text-[10px]">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  );
}
