"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Sun,
  Moon,
  Waves,
  SolarPanel,
  Share2,
  RotateCcw,
  HelpCircle,
  MapPin,
  Sparkles,
  Check,
  AlertTriangle,
  Loader2,
  KeyRound,
} from "lucide-react";
import type { CesiumViewerHandle } from "./CesiumViewer";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { DEMO_HOUSE, TIME_PRESETS } from "@/lib/house-config";
import { formatHour } from "@/lib/utils";
import { buildShareUrl, parseShareParams } from "@/lib/share";
import { startTutorial } from "@/lib/tutorial";
import type { AppViewState, ViewerStatus } from "@/types";

const CesiumViewer = dynamic(() => import("./CesiumViewer"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3 text-slate-300">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
        <p className="text-sm">Preparing 3D engine…</p>
      </div>
    </div>
  ),
});

const DEFAULT_STATE: AppViewState = {
  showSolar: false,
  showPool: false,
  hour: 13,
  date: "2025-06-21",
};

export default function Dashboard() {
  const viewerRef = useRef<CesiumViewerHandle>(null);
  const [state, setState] = useState<AppViewState>(DEFAULT_STATE);
  const [status, setStatus] = useState<ViewerStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [shareCopied, setShareCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const tutorialStarted = useRef(false);

  // Hydrate from URL share params
  useEffect(() => {
    const fromUrl = parseShareParams(window.location.search, DEFAULT_STATE);
    setState(fromUrl);
    setHydrated(true);
  }, []);

  const onStatusChange = useCallback((s: ViewerStatus, message?: string) => {
    setStatus(s);
    setStatusMessage(message);
  }, []);

  const setShowSolar = (showSolar: boolean) =>
    setState((prev) => ({ ...prev, showSolar }));
  const setShowPool = (showPool: boolean) =>
    setState((prev) => ({ ...prev, showPool }));
  const setHour = (hour: number) => setState((prev) => ({ ...prev, hour }));
  const setDate = (date: string) => setState((prev) => ({ ...prev, date }));

  const handleShare = async () => {
    const url = buildShareUrl(state);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      window.history.replaceState({}, "", url);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Fallback: put in address bar
      window.prompt("Copy this link to share the view:", url);
    }
  };

  const handleResetCamera = () => {
    viewerRef.current?.resetCamera();
  };

  const runTutorial = useCallback(() => {
    startTutorial({
      onHighlightSolar: () => setShowSolar(true),
      onHighlightPool: () => setShowPool(true),
      onHighlightTime: () => setHour(7),
    });
  }, []);

  // Auto-start tutorial once when ready (first visit only)
  useEffect(() => {
    if (status !== "ready" || tutorialStarted.current) return;
    const seen = sessionStorage.getItem("solarreno-tutorial-seen");
    if (seen) return;
    tutorialStarted.current = true;
    const t = setTimeout(() => {
      runTutorial();
      sessionStorage.setItem("solarreno-tutorial-seen", "1");
    }, 1400);
    return () => clearTimeout(t);
  }, [status, runTutorial]);

  const timeLabel = useMemo(() => formatHour(state.hour), [state.hour]);

  if (!hydrated) {
    return (
      <div className="flex h-dvh items-center justify-center bg-slate-950 text-slate-300">
        <Loader2 className="h-7 w-7 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* 3D canvas */}
      <CesiumViewer
        ref={viewerRef}
        showSolar={state.showSolar}
        showPool={state.showPool}
        hour={state.hour}
        date={state.date}
        onStatusChange={onStatusChange}
      />

      {/* Top gradient + brand */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-slate-700/60 bg-slate-950/75 px-3 py-2 shadow-lg backdrop-blur-md">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-amber-400 text-slate-950 shadow-inner">
            <Sparkles className="h-4.5 w-4.5" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">
              SolarReno Previewer
            </p>
            <p className="text-[11px] text-slate-400">
              Photorealistic renovation MVP
            </p>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={runTutorial}
            data-tour-id="start-tour"
            aria-label="Start guided tour"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Tour</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetCamera}
            id="reset-camera-btn"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset Camera</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleShare}
            id="share-view-btn"
          >
            {shareCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {shareCopied ? "Copied!" : "Share View"}
            </span>
          </Button>
        </div>
      </header>

      {/* Status overlays */}
      {(status === "loading" || status === "idle") && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/90 px-5 py-3 text-sm shadow-xl">
            <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
            <span>{statusMessage ?? "Loading high-definition 3D house…"}</span>
          </div>
        </div>
      )}

      {(status === "error" || status === "missing-key") && (
        <div className="absolute inset-x-0 top-20 z-30 mx-auto max-w-lg px-4">
          <div className="rounded-2xl border border-amber-500/40 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex gap-3">
              {status === "missing-key" ? (
                <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
              )}
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-amber-100">
                  {status === "missing-key"
                    ? "Google Maps API key required"
                    : "3D tiles failed to load"}
                </p>
                <p className="leading-relaxed text-slate-300">
                  {statusMessage}
                </p>
                <ol className="list-decimal space-y-1 pl-4 text-slate-400">
                  <li>
                    Create a Google Cloud project and enable{" "}
                    <strong className="text-slate-200">Map Tiles API</strong>
                  </li>
                  <li>Enable billing (required by Google for 3D Tiles)</li>
                  <li>
                    Create an API key and set{" "}
                    <code className="rounded bg-slate-800 px-1 py-0.5 text-sky-300">
                      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    </code>{" "}
                    in{" "}
                    <code className="rounded bg-slate-800 px-1 py-0.5 text-sky-300">
                      .env.local
                    </code>
                  </li>
                  <li>
                    Restart{" "}
                    <code className="rounded bg-slate-800 px-1 py-0.5">
                      npm run dev
                    </code>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left: info card — compact header on phones, full detail on tablet+ */}
      <aside className="pointer-events-none absolute left-0 top-[4.5rem] z-20 max-h-[min(55dvh,28rem)] w-full max-w-sm overflow-y-auto p-2 sm:max-h-[min(70dvh,32rem)] sm:p-4 lg:bottom-4 lg:top-auto">
        <Card id="info-card" className="pointer-events-auto">
          <CardHeader className="p-3 sm:p-4 sm:pb-2">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-sky-400 sm:text-[11px]">
              <MapPin className="h-3.5 w-3.5" />
              Personal renovation preview
            </div>
            <CardTitle className="text-sm sm:text-base">{DEMO_HOUSE.label}</CardTitle>
            <CardDescription className="text-[11px] sm:text-xs">
              {DEMO_HOUSE.addressLine}
            </CardDescription>
          </CardHeader>
          <CardContent className="hidden space-y-3 p-3 pt-0 sm:block sm:p-4 sm:pt-2">
            <p className="text-xs leading-relaxed text-slate-300">
              {DEMO_HOUSE.description}
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                Photorealistic Google 3D model of a real home
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                Roof solar array with realistic panel layout
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                Backyard pool + deck concept placement
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                Live sun path & shadows for any time of day
              </li>
            </ul>
            <p className="rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-2 text-[11px] leading-relaxed text-slate-400">
              MVP note: single fixed demo property. V1 will support any address,
              photo-guided placement, and contractor lead gen.
            </p>
          </CardContent>
        </Card>
      </aside>

      {/* Right / bottom control panel */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-20 flex w-full max-w-md flex-col gap-2 p-2 sm:gap-3 sm:p-4">
        <Card className="pointer-events-auto">
          <CardHeader className="pb-1">
            <CardTitle>Renovation layers</CardTitle>
            <CardDescription>
              Toggle previews on the real 3D home
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              id="toggle-solar"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300">
                  <SolarPanel className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Show Solar Panels
                  </p>
                  <p className="text-[11px] text-slate-400">
                    20-module rooftop array
                  </p>
                </div>
              </div>
              <Switch
                checked={state.showSolar}
                onCheckedChange={setShowSolar}
                aria-label="Show solar panels"
              />
            </div>

            <div
              id="toggle-pool"
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300">
                  <Waves className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Show Pool</p>
                  <p className="text-[11px] text-slate-400">
                    Pool, deck & patio concept
                  </p>
                </div>
              </div>
              <Switch
                checked={state.showPool}
                onCheckedChange={setShowPool}
                aria-label="Show swimming pool"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="pointer-events-auto" id="time-of-day-controls">
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-300" />
                Time of day
              </CardTitle>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-medium tabular-nums text-amber-200">
                {timeLabel}
              </span>
            </div>
            <CardDescription>
              Move the sun — shadows update on house, panels & pool
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="h-3.5 w-3.5 text-slate-500" />
              <Slider
                id="hour-slider"
                min={5}
                max={21}
                step={0.25}
                value={state.hour}
                onChange={setHour}
                aria-label="Time of day"
              />
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            </div>

            <div className="flex flex-wrap gap-2">
              {TIME_PRESETS.map((preset) => {
                const active = Math.abs(state.hour - preset.hour) < 0.2;
                return (
                  <Button
                    key={preset.id}
                    size="sm"
                    variant={active ? "default" : "outline"}
                    onClick={() => setHour(preset.hour)}
                    title={preset.description}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label
                htmlFor="sun-date"
                className="shrink-0 text-[11px] text-slate-400"
              >
                Date
              </label>
              <input
                id="sun-date"
                type="date"
                value={state.date}
                onChange={(e) => setDate(e.target.value)}
                className="h-8 w-full rounded-lg border border-slate-600/70 bg-slate-800/80 px-2 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subtle bottom credit */}
      <div className="pointer-events-none absolute bottom-1 left-1/2 z-10 hidden -translate-x-1/2 text-[10px] text-slate-500 md:block">
        Imagery © Google · 3D via CesiumJS Photorealistic 3D Tiles
      </div>
    </div>
  );
}
