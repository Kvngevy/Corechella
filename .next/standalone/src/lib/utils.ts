import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatPrice(amount: number, currency = "NGN") {
  if (amount === 0) return "FREE";
  return formatNaira(amount);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatShortDate(date: string) {
  const d = new Date(date);
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate().toString().padStart(2, "0"),
  };
}

export function formatEventDates(date: string, endDate: string) {
  const start = new Date(date);
  const end = new Date(endDate);
  if (date === endDate) {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(start);
  }
  return `${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(start)} – ${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(end)}`;
}
