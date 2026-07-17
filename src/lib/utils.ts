import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (shadcn-style). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format hour (0–24 float) as 12h clock string, e.g. "6:30 AM". */
export function formatHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60) % 60;
  const period = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/** Clamp a number into [min, max]. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
