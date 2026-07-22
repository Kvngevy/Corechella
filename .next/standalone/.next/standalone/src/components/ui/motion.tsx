"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({ value, suffix = "", prefix = "" }: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  centered = false,
  accent = false,
}: {
  title: string;
  subtitle?: string;
  centered?: boolean;
  accent?: boolean;
}) {
  return (
    <FadeIn className={centered ? "text-center" : ""}>
      {accent && (
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-electric mb-2">
          Corechella
        </p>
      )}
      <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-muted max-w-2xl ${centered ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </FadeIn>
  );
}
