import type { AppViewState } from "@/types";

/** Encode current dashboard state into shareable URL query params. */
export function buildShareUrl(state: AppViewState, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const url = new URL(base);
  url.searchParams.set("solar", state.showSolar ? "1" : "0");
  url.searchParams.set("pool", state.showPool ? "1" : "0");
  url.searchParams.set("hour", state.hour.toFixed(2));
  url.searchParams.set("date", state.date);
  return url.toString();
}

/** Parse initial state from the browser URL (if present). */
export function parseShareParams(
  search: string,
  defaults: AppViewState
): AppViewState {
  const params = new URLSearchParams(search);
  const solar = params.get("solar");
  const pool = params.get("pool");
  const hour = params.get("hour");
  const date = params.get("date");

  return {
    showSolar: solar === null ? defaults.showSolar : solar === "1" || solar === "true",
    showPool: pool === null ? defaults.showPool : pool === "1" || pool === "true",
    hour:
      hour !== null && !Number.isNaN(Number(hour))
        ? Math.min(24, Math.max(0, Number(hour)))
        : defaults.hour,
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : defaults.date,
  };
}
