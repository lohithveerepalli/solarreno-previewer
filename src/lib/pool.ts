/**
 * Backyard swimming pool + deck/patio as Cesium Entity geometry.
 * Turquoise water, warm deck — clean validation look without external GLBs.
 */

import type { Viewer, Entity } from "cesium";
import { POOL_CONFIG } from "./house-config";
import { enuToLonLatHeight } from "./geo";
import type { CesiumNS } from "./solar-panels";

export function addPoolAndDeck(Cesium: CesiumNS, viewer: Viewer): Entity[] {
  const entities: Entity[] = [];
  const cfg = POOL_CONFIG;

  const water = enuToLonLatHeight(
    cfg.originEast,
    cfg.originNorth,
    cfg.heightAboveGround
  );
  // Pool shell (slightly larger / deeper dark liner)
  entities.push(
    viewer.entities.add({
      name: "Pool Shell",
      position: Cesium.Cartesian3.fromDegrees(
        water.longitude,
        water.latitude,
        water.height - cfg.waterDepth / 2
      ),
      box: {
        dimensions: new Cesium.Cartesian3(
          cfg.poolWidth + 0.25,
          cfg.poolLength + 0.25,
          cfg.waterDepth
        ),
        material: Cesium.Color.fromCssColorString(cfg.linerColor).withAlpha(0.95),
        shadows: Cesium.ShadowMode.ENABLED,
      },
    })
  );

  // Water surface volume (turquoise, semi-transparent)
  entities.push(
    viewer.entities.add({
      name: "Pool Water",
      position: Cesium.Cartesian3.fromDegrees(
        water.longitude,
        water.latitude,
        water.height - cfg.waterDepth * 0.35
      ),
      box: {
        dimensions: new Cesium.Cartesian3(
          cfg.poolWidth,
          cfg.poolLength,
          cfg.waterDepth * 0.7
        ),
        material: Cesium.Color.fromCssColorString(cfg.waterColor).withAlpha(
          cfg.waterAlpha
        ),
        shadows: Cesium.ShadowMode.CAST_ONLY,
      },
    })
  );

  // Deck ring: four planks around the pool
  const deckOuterW = cfg.poolWidth + cfg.deckMargin * 2;
  const deckOuterL = cfg.poolLength + cfg.deckMargin * 2;
  const deckH = cfg.deckThickness;
  const deckY = cfg.heightAboveGround + deckH / 2;
  const deckMat = Cesium.Color.fromCssColorString(cfg.deckColor).withAlpha(
    cfg.deckAlpha
  );

  const deckPieces: Array<{ e: number; n: number; w: number; l: number }> = [
    // North strip
    {
      e: cfg.originEast,
      n: cfg.originNorth + cfg.poolLength / 2 + cfg.deckMargin / 2,
      w: deckOuterW,
      l: cfg.deckMargin,
    },
    // South strip
    {
      e: cfg.originEast,
      n: cfg.originNorth - cfg.poolLength / 2 - cfg.deckMargin / 2,
      w: deckOuterW,
      l: cfg.deckMargin,
    },
    // East strip
    {
      e: cfg.originEast + cfg.poolWidth / 2 + cfg.deckMargin / 2,
      n: cfg.originNorth,
      w: cfg.deckMargin,
      l: cfg.poolLength,
    },
    // West strip
    {
      e: cfg.originEast - cfg.poolWidth / 2 - cfg.deckMargin / 2,
      n: cfg.originNorth,
      w: cfg.deckMargin,
      l: cfg.poolLength,
    },
  ];

  deckPieces.forEach((piece, i) => {
    const p = enuToLonLatHeight(piece.e, piece.n, deckY);
    entities.push(
      viewer.entities.add({
        name: `Pool Deck ${i + 1}`,
        position: Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, p.height),
        box: {
          dimensions: new Cesium.Cartesian3(piece.w, piece.l, deckH),
          material: deckMat,
          shadows: Cesium.ShadowMode.ENABLED,
        },
      })
    );
  });

  // Patio pad toward the house
  const patio = enuToLonLatHeight(
    cfg.originEast + cfg.patioOffsetEast,
    cfg.originNorth + cfg.patioOffsetNorth,
    deckY
  );
  entities.push(
    viewer.entities.add({
      name: "Patio",
      position: Cesium.Cartesian3.fromDegrees(
        patio.longitude,
        patio.latitude,
        patio.height
      ),
      box: {
        dimensions: new Cesium.Cartesian3(
          cfg.patioWidth,
          cfg.patioLength,
          deckH
        ),
        material: Cesium.Color.fromCssColorString(cfg.patioColor).withAlpha(0.95),
        shadows: Cesium.ShadowMode.ENABLED,
      },
    })
  );

  // Simple lounge chairs (two small boxes) for scale
  for (const side of [-1, 1]) {
    const chair = enuToLonLatHeight(
      cfg.originEast + side * (cfg.poolWidth / 2 + cfg.deckMargin * 0.55),
      cfg.originNorth + 1.2,
      deckY + 0.2
    );
    entities.push(
      viewer.entities.add({
        name: "Lounge Chair",
        position: Cesium.Cartesian3.fromDegrees(
          chair.longitude,
          chair.latitude,
          chair.height
        ),
        box: {
          dimensions: new Cesium.Cartesian3(0.7, 1.8, 0.35),
          material: Cesium.Color.fromCssColorString("#F5F0E6").withAlpha(0.95),
          shadows: Cesium.ShadowMode.ENABLED,
        },
      })
    );
  }

  return entities;
}
