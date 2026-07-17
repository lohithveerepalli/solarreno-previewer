"use client";

import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  id,
  className,
  "aria-label": ariaLabel,
}: SliderProps) {
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        "solar-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-sky-500",
        className
      )}
    />
  );
}
