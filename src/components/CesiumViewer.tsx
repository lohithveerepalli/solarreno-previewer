"use client";

/**
 * CesiumJS viewer with Google Photorealistic 3D Tiles, solar/pool entities,
 * sun lighting, and camera controls. Loaded client-side only (no SSR).
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import type { Viewer, Entity, Cesium3DTileset } from "cesium";
import {
  DEMO_HOUSE,
  DEFAULT_CAMERA,
} from "@/lib/house-config";
import { addSolarPanelArray, setEntitiesVisible } from "@/lib/solar-panels";
import { addPoolAndDeck } from "@/lib/pool";
import { applySunTime, configureLightingAndShadows } from "@/lib/sun";
import type { ViewerStatus } from "@/types";

export interface CesiumViewerHandle {
  resetCamera: () => void;
  flyToHouse: () => void;
}

interface CesiumViewerProps {
  showSolar: boolean;
  showPool: boolean;
  hour: number;
  date: string;
  onStatusChange?: (status: ViewerStatus, message?: string) => void;
}

const CesiumViewer = forwardRef<CesiumViewerHandle, CesiumViewerProps>(
  function CesiumViewer(
    { showSolar, showPool, hour, date, onStatusChange },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Viewer | null>(null);
    const tilesetRef = useRef<Cesium3DTileset | null>(null);
    const solarRef = useRef<Entity[]>([]);
    const poolRef = useRef<Entity[]>([]);
    const cesiumRef = useRef<typeof import("cesium") | null>(null);
    const readyRef = useRef(false);

    // Expose camera controls to parent
    useImperativeHandle(ref, () => ({
      resetCamera: () => flyToDemoHouse(true),
      flyToHouse: () => flyToDemoHouse(true),
    }));

    function flyToDemoHouse(animate: boolean) {
      const viewer = viewerRef.current;
      const Cesium = cesiumRef.current;
      if (!viewer || !Cesium) return;

      const destination = Cesium.Cartesian3.fromDegrees(
        DEMO_HOUSE.longitude +
          DEFAULT_CAMERA.offsetEast / (111_320 * Math.cos((DEMO_HOUSE.latitude * Math.PI) / 180)),
        DEMO_HOUSE.latitude + DEFAULT_CAMERA.offsetNorth / 111_320,
        DEMO_HOUSE.groundHeight + DEFAULT_CAMERA.offsetUp
      );

      const orientation = {
        heading: Cesium.Math.toRadians(DEFAULT_CAMERA.headingDegrees),
        pitch: Cesium.Math.toRadians(DEFAULT_CAMERA.pitchDegrees),
        roll: 0,
      };

      if (animate) {
        viewer.camera.flyTo({
          destination,
          orientation,
          duration: DEFAULT_CAMERA.durationSeconds,
        });
      } else {
        viewer.camera.setView({ destination, orientation });
      }
    }

    // Initialize viewer once
    useEffect(() => {
      let destroyed = false;
      let resizeObserver: ResizeObserver | null = null;

      async function init() {
        if (!containerRef.current) return;

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          onStatusChange?.(
            "missing-key",
            "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Add it to .env.local to load Photorealistic 3D Tiles."
          );
          return;
        }

        onStatusChange?.("loading", "Loading high-definition 3D tiles…");

        // Point Cesium at copied static assets
        (window as unknown as { CESIUM_BASE_URL: string }).CESIUM_BASE_URL =
          "/cesium/";

        const Cesium = await import("cesium");
        // CSS is imported globally in the app entry
        cesiumRef.current = Cesium;

        if (destroyed || !containerRef.current) return;

        // Google Photorealistic 3D Tiles require a Maps Platform key with Map Tiles API
        Cesium.GoogleMaps.defaultApiKey = apiKey;

        const viewer = new Cesium.Viewer(containerRef.current, {
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          selectionIndicator: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          infoBox: false,
          // Hide imagery globe; Photorealistic tiles provide the world
          baseLayer: false,
          terrain: undefined,
          skyBox: false,
          // Keep atmosphere for nice horizon/sun
          skyAtmosphere: new Cesium.SkyAtmosphere(),
          requestRenderMode: false,
          maximumRenderTimeChange: Infinity,
          msaaSamples: 4,
        });

        // Clean chrome
        const credit = viewer.cesiumWidget.creditContainer as HTMLElement;
        if (credit) credit.style.display = "none";

        viewer.scene.backgroundColor = Cesium.Color.fromCssColorString("#0B1220");
        viewer.scene.fog.enabled = true;
        viewer.scene.globe.show = false;
        viewer.scene.globe.depthTestAgainstTerrain = false;

        // High-quality rendering
        viewer.scene.postProcessStages.fxaa.enabled = true;
        if (viewer.scene.highDynamicRange !== undefined) {
          viewer.scene.highDynamicRange = true;
        }

        configureLightingAndShadows(Cesium, viewer);
        applySunTime(Cesium, viewer, hour, date);

        viewerRef.current = viewer;

        // Responsive canvas
        resizeObserver = new ResizeObserver(() => {
          viewer.resize();
        });
        resizeObserver.observe(containerRef.current);

        // Initial camera near the house (before tiles fully load)
        flyToDemoHouse(false);

        try {
          const tileset = await Cesium.createGooglePhotorealistic3DTileset({
            // Prefer Google's default maximum screen-space error for quality
          });

          if (destroyed) {
            tileset.destroy();
            return;
          }

          viewer.scene.primitives.add(tileset);
          tileset.shadows = Cesium.ShadowMode.ENABLED;
          tilesetRef.current = tileset;

          // Build renovation geometry
          solarRef.current = addSolarPanelArray(Cesium, viewer);
          poolRef.current = addPoolAndDeck(Cesium, viewer);
          setEntitiesVisible(solarRef.current, showSolar);
          setEntitiesVisible(poolRef.current, showPool);

          // Fly in for a polished first impression
          flyToDemoHouse(true);

          readyRef.current = true;
          onStatusChange?.("ready");
        } catch (err) {
          console.error("Failed to load Google Photorealistic 3D Tiles", err);
          const message =
            err instanceof Error
              ? err.message
              : "Unknown error loading 3D tiles.";
          onStatusChange?.(
            "error",
            `Could not load Google Photorealistic 3D Tiles. ${message} Check that Map Tiles API is enabled, billing is active, and your API key is valid.`
          );

          // Still place entities so UI remains usable for local demos without tiles
          solarRef.current = addSolarPanelArray(Cesium, viewer);
          poolRef.current = addPoolAndDeck(Cesium, viewer);
          setEntitiesVisible(solarRef.current, showSolar);
          setEntitiesVisible(poolRef.current, showPool);
          flyToDemoHouse(true);
        }
      }

      init();

      return () => {
        destroyed = true;
        resizeObserver?.disconnect();
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.destroy();
        }
        viewerRef.current = null;
        tilesetRef.current = null;
        solarRef.current = [];
        poolRef.current = [];
        readyRef.current = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- init once on mount
    }, []);

    // Toggle solar visibility
    useEffect(() => {
      if (solarRef.current.length) {
        setEntitiesVisible(solarRef.current, showSolar);
      }
    }, [showSolar]);

    // Toggle pool visibility
    useEffect(() => {
      if (poolRef.current.length) {
        setEntitiesVisible(poolRef.current, showPool);
      }
    }, [showPool]);

    // Update sun position
    useEffect(() => {
      const viewer = viewerRef.current;
      const Cesium = cesiumRef.current;
      if (!viewer || !Cesium) return;
      applySunTime(Cesium, viewer, hour, date);
    }, [hour, date]);

    return (
      <div
        id="tour-canvas-host"
        ref={containerRef}
        className="absolute inset-0 h-full w-full"
        aria-label="3D house preview canvas"
      />
    );
  }
);

export default CesiumViewer;
