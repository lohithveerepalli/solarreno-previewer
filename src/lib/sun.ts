/**
 * Time-of-day → Cesium JulianDate for realistic sun position & shadows.
 * Cesium's SunLight + scene clock drive atmospheric lighting automatically.
 */

import type { Viewer, JulianDate } from "cesium";
import { DEMO_HOUSE } from "./house-config";
import type { CesiumNS } from "./solar-panels";

/** Build a JulianDate for the demo house timezone day + decimal hour. */
export function julianDateForLocalHour(
  Cesium: CesiumNS,
  hour: number,
  dateISO?: string
): JulianDate {
  const { year, month, day } =
    parseDateISO(dateISO) ?? DEMO_HOUSE.defaultDate;

  // Interpret hour in America/Los_Angeles as UTC-7 (PDT) for summer demo day.
  // Good enough for MVP shadow validation; not a full TZ library.
  const utcOffsetHours = -7;
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const utcHour = h - utcOffsetHours;
  const jsDate = new Date(Date.UTC(year, month - 1, day, utcHour, m, 0));
  return Cesium.JulianDate.fromDate(jsDate);
}

function parseDateISO(dateISO?: string) {
  if (!dateISO) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  if (!m) return null;
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
  };
}

/** Apply sun time to the viewer clock (drives SunLight & shadows). */
export function applySunTime(
  Cesium: CesiumNS,
  viewer: Viewer,
  hour: number,
  dateISO?: string
) {
  const time = julianDateForLocalHour(Cesium, hour, dateISO);
  viewer.clock.currentTime = time;
  viewer.clock.shouldAnimate = false;
  // Ensure lighting stays on
  viewer.scene.globe.enableLighting = true;
  if (viewer.scene.light) {
    // SunLight follows clock; nothing else required
  }
}

/** Enable high-quality lighting + shadows on the viewer. */
export function configureLightingAndShadows(Cesium: CesiumNS, viewer: Viewer) {
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.dynamicAtmosphereLighting = true;
  viewer.scene.globe.atmosphereLightIntensity = 10.0;

  viewer.shadows = true;
  viewer.terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY;

  const shadowMap = viewer.shadowMap;
  shadowMap.darkness = 0.35;
  shadowMap.maximumDistance = 400.0;
  shadowMap.size = 2048;
  shadowMap.softShadows = true;
  shadowMap.normalOffset = true;

  // Use the real sun as the light source
  viewer.scene.light = new Cesium.SunLight();
  viewer.scene.globe.depthTestAgainstTerrain = false;
}
