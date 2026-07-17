/**
 * Copies Cesium static assets into public/cesium so the browser can load
 * Workers, Assets, Widgets, and ThirdParty at runtime (CESIUM_BASE_URL).
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cesiumBuild = join(root, "node_modules", "cesium", "Build", "Cesium");
const dest = join(root, "public", "cesium");

const folders = ["Workers", "ThirdParty", "Assets", "Widgets"];

if (!existsSync(cesiumBuild)) {
  console.warn("[copy-cesium] Cesium build not found — skip (run npm install first).");
  process.exit(0);
}

mkdirSync(dest, { recursive: true });

for (const folder of folders) {
  const from = join(cesiumBuild, folder);
  const to = join(dest, folder);
  if (!existsSync(from)) {
    console.warn(`[copy-cesium] Missing ${folder}, skipping.`);
    continue;
  }
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`[copy-cesium] Copied ${folder}`);
}

console.log("[copy-cesium] Done.");
