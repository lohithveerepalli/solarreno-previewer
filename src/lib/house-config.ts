/**
 * Fixed demo house — Mountain View, CA (Silicon Valley suburb).
 *
 * Chosen for excellent Google Photorealistic 3D Tiles coverage and a clear
 * residential roof + backyard geometry suitable for solar + pool validation.
 *
 * Offsets below are in local East-North-Up meters relative to the house
 * anchor. Tweak these if panels/pool need visual fine-tuning on the tiles.
 */

export const DEMO_HOUSE = {
  id: "mv-demo-home",
  label: "Demo Home — Mountain View, CA",
  description:
    "A real California suburban home rendered with Google Photorealistic 3D Tiles. Toggle solar panels on the roof and a backyard pool to preview renovations with realistic sun & shadows.",
  addressLine: "Residential neighborhood · Mountain View, CA",
  /** WGS84 latitude */
  latitude: 37.386051,
  /** WGS84 longitude */
  longitude: -122.083855,
  /** Approximate ground elevation (meters, ellipsoid) for initial placement */
  groundHeight: 32,
  /** Approximate eave / roof base height above ground */
  roofBaseHeight: 6.2,
  /** Local timezone used for sun simulation labels */
  timeZone: "America/Los_Angeles",
  /** Default calendar day for sun position (summer solstice-ish for strong shadows) */
  defaultDate: { year: 2025, month: 6, day: 21 },
} as const;

/**
 * Camera starting position: elevated aerial looking at house + backyard.
 * heading/pitch/roll in radians (converted at runtime).
 */
export const DEFAULT_CAMERA = {
  /** Offset from house center: east, north, up (meters) */
  offsetEast: -28,
  offsetNorth: -42,
  offsetUp: 38,
  headingDegrees: 35,
  pitchDegrees: -28,
  durationSeconds: 2.2,
} as const;

/** Solar array layout on the main roof plane. */
export const SOLAR_CONFIG = {
  /** Center of the array relative to house anchor (ENU meters) */
  originEast: 1.2,
  originNorth: 0.4,
  /** Height of panel bottoms above groundHeight */
  heightAboveGround: 7.4,
  /** Roof pitch (degrees) — typical CA asphalt shingle roof */
  pitchDegrees: 22,
  /** Azimuth of the roof plane normal projected to ground (0 = north, 90 = east). South-facing ≈ 180 */
  azimuthDegrees: 185,
  /** Individual panel size (meters) — approx residential module */
  panelWidth: 1.05,
  panelLength: 1.75,
  panelThickness: 0.05,
  /** Grid: columns (along eave) × rows (up the pitch) */
  columns: 5,
  rows: 4,
  /** Gap between panels (meters) */
  gap: 0.08,
  /** Dark photovoltaic blue */
  color: "#0B1F3A",
  frameColor: "#1a1a1a",
  /** Slight specular for glass look */
  alpha: 0.96,
} as const;

/** Backyard swimming pool + simple deck/patio. */
export const POOL_CONFIG = {
  originEast: 6.5,
  originNorth: -14,
  heightAboveGround: 0.05,
  /** Interior water surface size */
  poolLength: 9.0,
  poolWidth: 4.5,
  waterDepth: 1.4,
  waterColor: "#2EC4B6",
  waterAlpha: 0.78,
  linerColor: "#1A6B7A",
  /** Deck ring around pool */
  deckMargin: 1.6,
  deckThickness: 0.12,
  deckColor: "#C4A484",
  deckAlpha: 0.95,
  /** Small patio pad adjacent to house side of pool */
  patioLength: 5.5,
  patioWidth: 3.2,
  patioOffsetEast: 0,
  patioOffsetNorth: 4.2,
  patioColor: "#B8A48A",
} as const;

/** Time-of-day presets (hour as decimal, 0–24). */
export const TIME_PRESETS = [
  { id: "golden", label: "Golden Hour", hour: 7.0, description: "Warm morning light" },
  { id: "midday", label: "Midday", hour: 13.0, description: "Harsh overhead sun" },
  { id: "evening", label: "Evening", hour: 18.5, description: "Long soft shadows" },
] as const;

export type TimePresetId = (typeof TIME_PRESETS)[number]["id"];
