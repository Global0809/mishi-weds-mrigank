# A Royal Baraat — 3D Web Experience

An interactive 3D scene: a grand royal Hindu wedding procession (baraat) set in a
golden-hour forest valley. Built with **Three.js** + **Vite**. Runs in any modern
browser, desktop or mobile.

## What's in the scene
- A white-marble **mandap** with carved pillars, a tiered gold dome, kalash finial and a sacred fire, nestled in the forest across a reflecting lake.
- The **groom on a decorated white horse**, the **bride** at the mandap, and one richly adorned **elephant**.
- **10 royal attendants** carrying chhatris (parasols), garlands, lamps, a flag, and musical instruments (dhol, shehnai, turhi, morchhal).
- A wide **burgundy-and-gold ceremonial carpet** path, toran gates, floral arches, lamp-pillars, brass diyas, hanging marigold/jasmine garlands, warm lanterns.
- Cinematic golden-hour light, volumetric god-rays, gentle fog, and floating flower petals — over the preserved natural landscape (trees, mountains, lake, birds, butterflies).

## Run it locally
```bash
npm install
npm run dev        # opens a live dev server (default http://localhost:5173)
```

## Share it with people — 3 options

### 1. One file you can email / send (simplest)
```bash
npm run build:single
```
Produces **`dist-single/index.html`** — a single self-contained file (~600 KB) with
everything (including Three.js) inlined. Send that one file; the recipient just
double-clicks it to open in their browser. No internet or install required.

### 2. Host it as a website (best experience — a shareable link)
```bash
npm run build      # outputs the dist/ folder
```
Drag the **`dist/`** folder onto [app.netlify.com/drop](https://app.netlify.com/drop)
(or deploy to Vercel / GitHub Pages / any static host). You get a public URL you can
share with anyone.

### 3. Preview a production build locally
```bash
npm run preview          # serves dist/
npm run preview:single   # serves dist-single/
```

## Controls
- **Drag** to look around · **Scroll / pinch** to zoom.
- An automatic cinematic fly-in plays on load, then a gentle idle sway; grab the scene any time to take over.

## Project layout
```
index.html            page shell + title / loading overlay
src/main.js           scene assembly: landscape, atmosphere, asset placement, camera
src/wedding/          the baraat assets (each a self-contained module)
  shared.js           the royal color palette
  mandap.js  arches.js  horseGroom.js  bride.js  elephant.js
  attendants.js  decor.js  ground.js  atmosphere.js
vite.config.js        normal + single-file build config
```

## Performance / mobile
Low-poly stylized assets, instanced foliage & petals, a tight light budget, and
automatic mobile tuning (reduced pixel ratio, shadow resolution, grass and petal
counts) keep it light enough to render smoothly on phones.
