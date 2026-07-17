/**
 * Procedural solar panel array as Cesium Entity boxes.
 * Clean dark-blue modules with a subtle frame — professional enough for MVP validation.
 */

import type { Viewer, Entity } from "cesium";
import { SOLAR_CONFIG } from "./house-config";
import { enuToLonLatHeight } from "./geo";

export type CesiumNS = typeof import("cesium");

/**
 * Place a grid of solar panels on the roof plane defined in SOLAR_CONFIG.
 * Returns the created entities so the caller can show/hide or remove them.
 */
export function addSolarPanelArray(
  Cesium: CesiumNS,
  viewer: Viewer
): Entity[] {
  const entities: Entity[] = [];
  const {
    originEast,
    originNorth,
    heightAboveGround,
    pitchDegrees,
    azimuthDegrees,
    panelWidth,
    panelLength,
    panelThickness,
    columns,
    rows,
    gap,
    color,
    frameColor,
    alpha,
  } = SOLAR_CONFIG;

  const panelColor = Cesium.Color.fromCssColorString(color).withAlpha(alpha);
  const edgeColor = Cesium.Color.fromCssColorString(frameColor).withAlpha(0.95);

  // Unit vectors in the roof plane (east/north/up local frame of the house)
  const az = (azimuthDegrees * Math.PI) / 180;
  const pitch = (pitchDegrees * Math.PI) / 180;

  // Downslope direction on ground (azimuth): direction panels face toward sun ideally south
  const downslopeE = Math.sin(az);
  const downslopeN = Math.cos(az);
  // Across-slope (eave) direction
  const acrossE = Math.cos(az);
  const acrossN = -Math.sin(az);

  const cellW = panelWidth + gap;
  const cellL = panelLength + gap;
  const totalW = columns * cellW - gap;
  const totalL = rows * cellL - gap;

  // Heading so panel long axis runs across the eave (standard residential layout)
  const heading = az + Math.PI / 2;
  const hpr = new Cesium.HeadingPitchRoll(heading, -pitch, 0);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      // Local roof-plane coordinates relative to array center
      const u = (c + 0.5) * cellW - totalW / 2; // across eave
      const v = (r + 0.5) * cellL - totalL / 2; // up the pitch

      const east = originEast + acrossE * u + downslopeE * v * Math.cos(pitch);
      const north = originNorth + acrossN * u + downslopeN * v * Math.cos(pitch);
      // Climb up the roof as we move upslope
      const up = heightAboveGround + v * Math.sin(pitch);

      const { longitude, latitude, height } = enuToLonLatHeight(east, north, up);
      const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
      const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

      // Main glass/PV body
      const panel = viewer.entities.add({
        name: `Solar Panel ${r + 1}-${c + 1}`,
        position,
        orientation,
        box: {
          dimensions: new Cesium.Cartesian3(
            panelWidth,
            panelLength,
            panelThickness
          ),
          material: panelColor,
          outline: true,
          outlineColor: edgeColor,
          shadows: Cesium.ShadowMode.ENABLED,
        },
      });
      entities.push(panel);

      // Thin brighter strip at top edge to suggest bus bars / frame highlight
      const highlightOffset = panelLength * 0.42;
      const hEast = east + downslopeE * highlightOffset * Math.cos(pitch) * 0.15;
      const hNorth = north + downslopeN * highlightOffset * Math.cos(pitch) * 0.15;
      const hUp = up + panelThickness * 0.6;
      const hPos = enuToLonLatHeight(hEast, hNorth, hUp);
      // Skip extra entities for cleanliness — single box is enough for MVP
      void hPos;
    }
  }

  // Small inverter box near the array corner (visual detail)
  const inv = enuToLonLatHeight(
    originEast + acrossE * (totalW / 2 + 0.4),
    originNorth + acrossN * (totalW / 2 + 0.4),
    heightAboveGround - 0.8
  );
  const invPos = Cesium.Cartesian3.fromDegrees(
    inv.longitude,
    inv.latitude,
    inv.height
  );
  entities.push(
    viewer.entities.add({
      name: "Solar Inverter",
      position: invPos,
      box: {
        dimensions: new Cesium.Cartesian3(0.45, 0.55, 0.7),
        material: Cesium.Color.fromCssColorString("#2d2d2d"),
        outline: true,
        outlineColor: Cesium.Color.GRAY,
        shadows: Cesium.ShadowMode.ENABLED,
      },
    })
  );

  return entities;
}

export function setEntitiesVisible(entities: Entity[], show: boolean) {
  for (const e of entities) {
    e.show = show;
  }
}
