/**
 * Local ENU ↔ WGS84 helpers for placing demo geometry near the house anchor.
 * Uses a simple equirectangular approximation (accurate enough for ~50 m offsets).
 */

import { DEMO_HOUSE } from "./house-config";

const METERS_PER_DEG_LAT = 111_320;

function metersPerDegLon(lat: number) {
  return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
}

/** Convert local ENU meters (east, north, up) to lon/lat/height. */
export function enuToLonLatHeight(
  east: number,
  north: number,
  up: number,
  origin = DEMO_HOUSE
): { longitude: number; latitude: number; height: number } {
  const dLat = north / METERS_PER_DEG_LAT;
  const dLon = east / metersPerDegLon(origin.latitude);
  return {
    longitude: origin.longitude + dLon,
    latitude: origin.latitude + dLat,
    height: origin.groundHeight + up,
  };
}

/** Build a local ENU → ECEF rotation matrix basis as heading/pitch for Cesium entities. */
export function roofOrientation(
  azimuthDegrees: number,
  pitchDegrees: number
): { heading: number; pitch: number; roll: number } {
  // Cesium entity orientation: heading from north, pitch of the entity local +Z
  // For a flat panel on a pitched roof: heading = azimuth of the downslope direction,
  // pitch = -roofPitch so the panel face tilts toward the sky correctly.
  const heading = (azimuthDegrees * Math.PI) / 180;
  const pitch = (-pitchDegrees * Math.PI) / 180;
  const roll = 0;
  return { heading, pitch, roll };
}
