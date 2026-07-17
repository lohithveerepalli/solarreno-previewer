# SolarReno Previewer

**Photorealistic 3D renovation previews on a real home.**

SolarReno Previewer is an MVP that lets a homeowner (or product validator) see **high-definition solar panels** and a **backyard swimming pool** placed accurately on Google’s **Photorealistic 3D Tiles** model of a real suburban house — with **live sun positioning and shadows**.

This repository is a single-house demo built to validate the core experience before multi-address and lead-gen productization.

---

## Screenshots

> Replace these placeholders with real captures after running the app with a valid API key.

| First load (house + atmosphere) | Solar panels on | Pool + golden hour |
| --- | --- | --- |
| ![House](docs/screenshots/house.png) | ![Solar](docs/screenshots/solar.png) | ![Pool](docs/screenshots/pool.png) |

---

## What this MVP demonstrates

1. **One fixed California suburban home** (Mountain View area) with excellent Photorealistic 3D coverage  
2. **Toggleable solar array** — multi-panel rooftop layout with realistic tilt and dark PV styling  
3. **Toggleable pool + deck/patio** — turquoise water and warm deck geometry in the backyard  
4. **HD 3D experience** via CesiumJS + Google Photorealistic 3D Tiles  
5. **Time-of-day sun simulation** with shadow casting (slider + Golden Hour / Midday / Evening presets)  
6. **Clean dashboard UI** — toggles, camera reset, shareable view URL, info card  
7. **Guided product tour** (driver.js) walking through the homeowner story  

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) + TypeScript |
| 3D | CesiumJS + Google Photorealistic 3D Tiles |
| Styling | Tailwind CSS + shadcn-style UI primitives |
| Tour | driver.js |
| Icons | lucide-react |

---

## Quick start

### 1. Clone & install

```bash
git clone https://github.com/lohithveerepalli/solarreno-previewer.git
cd solarreno-previewer
npm install
```

`postinstall` copies Cesium Workers / Assets / Widgets into `public/cesium/`.

### 2. Get a Google Cloud API key (required for HD tiles)

Google Photorealistic 3D Tiles are served through the **Map Tiles API**. You need a Google Cloud project with billing enabled.

1. Open [Google Cloud Console](https://console.cloud.google.com/)  
2. Create or select a project  
3. **Enable billing** (Map Tiles / Photorealistic 3D Tiles require it)  
4. **APIs & Services → Library** → search for **Map Tiles API** → **Enable**  
5. **APIs & Services → Credentials → Create credentials → API key**  
6. (Recommended) Restrict the key to **Map Tiles API** and your HTTP referrers (`localhost:3000/*`, production domain)  
7. Copy the key into a local env file (never commit it):

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production build

```bash
npm run build
npm start
```

---

## How it works (high level)

### Photorealistic house

On load, the client-only Cesium viewer sets:

```ts
Cesium.GoogleMaps.defaultApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const tileset = await Cesium.createGooglePhotorealistic3DTileset();
viewer.scene.primitives.add(tileset);
```

The globe imagery layer is hidden so the photorealistic mesh is the primary world. Camera flies to a hard-coded house in **Mountain View, CA** (`src/lib/house-config.ts`).

### Solar panels & pool

MVP models use **high-quality Cesium Entity geometry** (boxes + materials) rather than external GLBs:

- **Solar** — grid of dark-blue modules on a pitched roof plane (ENU offsets + heading/pitch)  
- **Pool** — liner + turquoise water volume, deck strips, patio pad, lounge chairs for scale  

Placement is defined in local **East-North-Up meters** relative to the house anchor so it is easy to retune.

### Sun & shadows

- Viewer uses `Cesium.SunLight`, globe lighting, and shadow maps  
- The time-of-day slider writes a `JulianDate` into `viewer.clock.currentTime` for the demo date (default: summer solstice in Pacific time)  
- Cesium updates the sun direction → atmosphere and shadows move across house, panels, and pool  

### Share view

**Share View** copies a URL with query params (`solar`, `pool`, `hour`, `date`) so a homeowner can reopen the same configuration.

---

## Project structure

```
src/
  app/                 # Next.js App Router (layout, page, globals)
  components/
    CesiumViewer.tsx   # 3D engine + tiles + entities
    Dashboard.tsx      # Full-screen product UI
    ui/                # Button, Switch, Slider, Card
  lib/
    house-config.ts    # Fixed house + placement constants
    solar-panels.ts    # Roof array builder
    pool.ts            # Pool + deck builder
    sun.ts             # Lighting / time mapping
    tutorial.ts        # driver.js tour
    share.ts           # URL encode/decode
    geo.ts             # ENU helpers
public/cesium/         # Cesium static assets (generated on install)
scripts/copy-cesium.mjs
```

---

## Known limitations (MVP)

- **Single fixed house** — not multi-address or multi-user  
- **Approximate placement** — solar/pool offsets are tuned visually; not surveyed or auto-fitted to roof mesh  
- **Geometry models** — procedural Cesium boxes, not scanned construction drawings or GLB product catalogs  
- **Timezone** — sun time uses a fixed PDT offset for the demo day (not a full IANA timezone library)  
- **API cost** — Google Map Tiles usage is billable; monitor quotas in Cloud Console  
- **Browser performance** — Photorealistic tiles are GPU-heavy; best on desktop / recent tablets  
- **No auth / persistence** — share links are client query strings only  

---

## Roadmap (V1+)

- [ ] Multi-address search (any US home with 3D coverage)  
- [ ] Auto roof plane detection / height sampling from tiles  
- [ ] User photo upload for style / material matching  
- [ ] GLB catalogs for real solar products and pool kits  
- [ ] Energy / shade analysis report export (PDF)  
- [ ] Contractor marketplace & lead generation  
- [ ] Saved projects + homeowner accounts  
- [ ] Mobile-first AR “hold up to your house” mode  

---

## Error handling

If the API key is missing or Map Tiles fail, the UI shows a friendly banner with exact setup steps (enable Map Tiles API, billing, `.env.local`, restart dev server). No keys are hard-coded.

---

## Credits

- **[CesiumJS](https://cesium.com/platform/cesiumjs/)** — open-source 3D geospatial engine  
- **[Google Photorealistic 3D Tiles](https://developers.google.com/maps/documentation/tile/3d-tiles)** / Map Tiles API — real-world HD mesh  
- **[Next.js](https://nextjs.org/)** — React application framework  
- **[Tailwind CSS](https://tailwindcss.com/)** — utility styling  
- **[driver.js](https://driverjs.com/)** — product tour  
- **[lucide](https://lucide.dev/)** — icons  

Imagery and 3D tile content remain subject to Google’s terms of service.

---

## License

MIT — see [LICENSE](LICENSE) (if present) or use freely for evaluation. Google Maps Platform usage is governed by Google’s terms and billing.

---

## What you need to see the high-definition version

The UI and renovation overlays work for development, but the **photorealistic house** only appears when Google 3D Tiles load successfully. Exact steps:

1. **Get a Google Cloud API key** with **Map Tiles API** enabled and **billing** active  
2. **Add it to `.env.local`**:

   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```

3. **Run**:

   ```bash
   npm install
   npm run dev
   ```

4. Open **http://localhost:3000** — the Mountain View demo home should stream in HD; toggle solar & pool, then drag the sun slider to see shadows.

Without a key, the app shows clear on-screen instructions instead of failing silently.
