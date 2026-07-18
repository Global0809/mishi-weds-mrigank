# Mishi weds Mrigank — full source bundle

An interactive 3D royal Hindu wedding **baraat** scene. **Three.js + Vite**, plain
JavaScript (no TypeScript, no framework). Runs in any modern browser, desktop or
mobile. Ships as a single self-contained HTML file.

## For the assistant modifying this
- Stack: three.js r0.169 (ES modules via CDN-free npm install), bundled by Vite 5.
- Entry: `index.html` -> `src/main.js`. `main.js` assembles the whole scene:
  terrain, lake/rivers, trees, the raised "ceremonial terrace", the baraat
  procession, atmosphere, camera, and a procedural WebAudio soundscape.
- `src/wedding/*.js` are self-contained procedural asset modules. Each exports
  builder function(s). Static builders return a `THREE.Group`; animated ones
  return `{ group: THREE.Group, update(t, dt) }`. They share `shared.js` (the
  `PAL` color palette). Assets are authored at the origin, resting on the ground,
  facing +Z; `main.js` positions/orients them.
- Ground/placement: `getTerrainHeight(x,z)` in main.js returns terrain height and
  already includes the raised ceremonial terrace (flattens the carpet corridor +
  mandap/bride area, fades before the lake). The `LAYOUT` object near the top of
  main.js holds all positions (mandap, bride, groom-on-horse, elephant, dancers,
  guests, musicians, path points, camera).
- Camera: OrbitControls + WASD/arrows free-roam + an idle cinematic auto-orbit.
- No external assets at runtime (no model/texture/audio files) — everything is
  procedural or an in-code CanvasTexture, so it survives in the single-file build.

## Run / build
```bash
npm install
npm run dev            # live dev server at http://localhost:5173
npm run build          # -> dist/ (hostable)
npm run build:single   # -> dist-single/index.html (ONE self-contained file)
```
GitHub repo: https://github.com/Global0809/mishi-weds-mrigank
Live: https://global0809.github.io/mishi-weds-mrigank/

---

Below is every source file, in full. File paths are relative to the project root.



## `README.md`

```markdown
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

```


## `package.json`

```json
{
  "name": "sunset-world",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:single": "cross-env SINGLE=1 vite build",
    "preview": "vite preview",
    "preview:single": "cross-env SINGLE=1 vite preview"
  },
  "dependencies": {
    "three": "^0.169.0"
  },
  "devDependencies": {
    "cross-env": "^10.1.0",
    "vite": "^5.4.0",
    "vite-plugin-singlefile": "^2.3.3"
  }
}

```


## `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Two build modes:
//   npm run build         -> normal dist/ (hostable: GitHub Pages, Netlify, etc.)
//   npm run build:single  -> dist-single/index.html, one self-contained file to send to people
const single = process.env.SINGLE === '1';

export default defineConfig({
  base: './',
  plugins: single ? [viteSingleFile()] : [],
  build: {
    outDir: single ? 'dist-single' : 'dist',
    emptyOutDir: true,
    ...(single
      ? { assetsInlineLimit: 100000000, cssCodeSplit: false, chunkSizeWarningLimit: 100000 }
      : {}),
  },
});

```


## `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#1a0a1e" />
    <title>Mishi weds Mrigank</title>
    <style>
      :root {
        --gold: #e9c46a;
        --gold-bright: #ffd97a;
        --burgundy: #4a0e18;
        --ink: #1a0a12;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0512; }
      #root { position: fixed; inset: 0; }
      canvas { display: block; }

      /* Fonts: system serif fallback keeps it self-contained (no external fetch) */
      .serif { font-family: "Cormorant Garamond", "Georgia", "Times New Roman", serif; }

      /* ---- Loading veil ---- */
      #loading {
        position: fixed; inset: 0; z-index: 30;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 22px;
        background: radial-gradient(ellipse at 50% 60%, #2a1020 0%, #14060f 70%, #0a0512 100%);
        transition: opacity 1.1s ease;
      }
      #loading.hidden { opacity: 0; pointer-events: none; }
      .diya-ring {
        width: 58px; height: 58px; border-radius: 50%;
        border: 2px solid rgba(233,196,106,0.18);
        border-top-color: var(--gold-bright);
        animation: spin 1.1s linear infinite;
        box-shadow: 0 0 24px rgba(255,180,90,0.25);
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      #loading .msg {
        color: var(--gold); letter-spacing: 3px; font-size: 15px;
        text-transform: uppercase; opacity: 0.85;
      }

      /* ---- Title card ---- */
      #titlecard {
        position: fixed; left: 0; right: 0; top: 8%; z-index: 20;
        display: flex; flex-direction: column; align-items: center; text-align: center;
        pointer-events: none; padding: 0 20px;
        transition: opacity 1.6s ease, transform 1.6s ease;
      }
      #titlecard.gone { opacity: 0; transform: translateY(-14px); }
      #titlecard .om { color: var(--gold-bright); font-size: 22px; letter-spacing: 6px; opacity: 0.9;
        text-shadow: 0 0 18px rgba(255,190,90,0.5); }
      #titlecard h1 {
        color: #fff6e6; font-weight: 500; font-size: clamp(34px, 7vw, 74px);
        letter-spacing: 2px; line-height: 1.05; margin: 6px 0 4px;
        text-shadow: 0 2px 30px rgba(0,0,0,0.55), 0 0 40px rgba(255,180,90,0.28);
      }
      #titlecard .rule {
        display: flex; align-items: center; gap: 12px; margin: 6px 0; opacity: 0.9;
      }
      #titlecard .rule span { height: 1px; width: min(90px, 22vw);
        background: linear-gradient(90deg, transparent, var(--gold), transparent); }
      #titlecard .rule b { color: var(--gold); font-size: 16px; font-weight: 400; }
      #titlecard .sub { color: var(--gold); font-size: clamp(14px, 2.6vw, 19px);
        letter-spacing: 4px; text-transform: uppercase; opacity: 0.82; }

      /* ---- Hint ---- */
      #hint {
        position: fixed; left: 0; right: 0; bottom: 22px; z-index: 20; text-align: center;
        color: rgba(255,235,205,0.7); font-size: 13px; letter-spacing: 2px;
        text-transform: uppercase; pointer-events: none;
        transition: opacity 1s ease;
      }
      #hint.gone { opacity: 0; }

      /* ---- Vignette for cinematic framing ---- */
      #vignette {
        position: fixed; inset: 0; z-index: 10; pointer-events: none;
        box-shadow: inset 0 0 220px 40px rgba(20,4,10,0.55);
        background: radial-gradient(ellipse at 50% 42%, transparent 55%, rgba(20,4,12,0.35) 100%);
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <div id="vignette"></div>

    <div id="titlecard" class="serif">
      <div class="om">॥ शुभ विवाह ॥</div>
      <h1>Mishi <span style="font-size:0.6em; opacity:0.85; font-style:italic;">weds</span> Mrigank</h1>
      <div class="rule"><span></span><b>&#10022;</b><span></span></div>
      <div class="sub">A Royal Baraat</div>
    </div>

    <div id="hint" class="serif">Drag to orbit &middot; Scroll to zoom &middot; <b>W A S D</b> / arrows to fly &middot; Right-drag to pan</div>

    <button id="soundBtn" title="Toggle sound"
      style="position:fixed; top:16px; right:16px; z-index:25; width:44px; height:44px;
             border-radius:50%; border:1px solid rgba(233,196,106,0.5);
             background:rgba(26,10,18,0.55); color:#e9c46a; font-size:20px; cursor:pointer;
             backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); line-height:1;">🔇</button>

    <div id="loading" class="serif">
      <div class="diya-ring"></div>
      <div class="msg">Lighting the diyas&hellip;</div>
    </div>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>

```


## `src/main.js`

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

import { PAL } from './wedding/shared.js';
import { createMandap } from './wedding/mandap.js';
import { createToranGate, createFloralArch, createCarvedPillar } from './wedding/arches.js';
import { createHorseGroom } from './wedding/horseGroom.js';
import { createBride } from './wedding/bride.js';
import { createElephant } from './wedding/elephant.js';
import { createAttendant } from './wedding/attendants.js';
import { createDancer } from './wedding/dancers.js';
import { createGuest } from './wedding/guests.js';
import { createDiya, createLantern, createHangingGarland, createKalash, createPetalTray } from './wedding/decor.js';
import { createCeremonialPath, createRangoli } from './wedding/ground.js';
import { createPetalSystem, createVolumetricRays, ATMOSPHERE_PARAMS } from './wedding/atmosphere.js';
import { createPlaneBanner, createSwan, createMoneyFountain, createFirework, createTeamGroomBanner } from './wedding/extras.js';

// =====================================================================
//  Scene director's layout (from the planning pass)
// =====================================================================
const COUPLE = { bride: 'Mishi', groom: 'Mrigank' };
const LAYOUT = {
  mandap: { pos: [-2, -34], faceToward: [-2, 40] },
  bride: { pos: [-2, -28], faceToward: [2, 6] },
  horseGroom: { pos: [24, 14], faceToward: [23, -8] },
  // Elephant directly BEHIND the groom on the red carpet, facing the same way
  elephant: { pos: [24, 27], faceToward: [24, 8] },
  path: {
    points: [[14, 44], [20, 34], [24, 22], [25, 8], [23, -8], [16, -20], [6, -27], [-2, -29]],
    width: 7,
  },
  toranGates: [
    { pos: [24, 35], faceToward: [24, 20] },
    { pos: [24.5, 6], faceToward: [24, -8] },
    { pos: [10, -25], faceToward: [-2, -29] },
  ],
  attendants: [
    { item: 'chhatri', pos: [20.5, 14], faceToward: [23, -8] }, // flank the groom
    { item: 'chhatri', pos: [28, 14], faceToward: [23, -8] },
    { item: 'dhol', pos: [22, -15], faceToward: [0, -30] }, // musicians lead in front
    { item: 'shehnai', pos: [25, -16], faceToward: [0, -30] },
    { item: 'turhi', pos: [28, -15], faceToward: [0, -30] },
    { item: 'flag', pos: [20, 27], faceToward: [24, 12] }, // flank the elephant
    { item: 'morchhal', pos: [28, 27], faceToward: [24, 12] },
    { item: 'lamp', pos: [3, -25], faceToward: [-2, -30] }, // greeters at the mandap
    { item: 'garland', pos: [-7, -25], faceToward: [-2, -30] },
    { item: 'lamp', pos: [5, -23], faceToward: [-2, -30] },
  ],
  petalArea: { cx: 16, cz: 0, radius: 32 },
  // Default framing features the PEOPLE, with the path leading back to the mandap + bride.
  camera: { introFrom: [58, 44, 72], introTo: [46, 15, 34], target: [17, 3.5, 4], introDurationSec: 7 },
  // Coordinated dance floor: tidy rows flanking the carpet, facing the groom.
  dancers: [
    { variant: 'armsUpM', pos: [20, 7] },
    { variant: 'bhangraM', pos: [29, 7] },
    { variant: 'spinF', pos: [20, 0] },
    { variant: 'jumpM', pos: [29, 0] },
    { variant: 'clapM', pos: [20, -7] },
    { variant: 'thumkaF', pos: [29, -7] },
  ],
  // Two female dancers flanking the bride so she is not isolated
  brideDancers: [
    { variant: 'spinF', pos: [-5.5, -27.5], faceToward: [-5.5, 6] },
    { variant: 'thumkaF', pos: [1.5, -27.5], faceToward: [1.5, 6] },
  ],
  // A few guests lining the near carpet edge, facing the procession
  guests: [
    { variant: 'cheering', pos: [18, 30], faceToward: [24, 26] },
    { variant: 'namaste', pos: [30, 10], faceToward: [25, 8] },
    { variant: 'clapping', pos: [16, -14], faceToward: [21, -18] },
  ],
  // Two musicians playing right beside the groom
  groomMusicians: [
    { item: 'shehnai', pos: [21, 18], faceToward: [23, -8] },
    { item: 'dhol', pos: [27, 18], faceToward: [23, -8] },
  ],
  moneyThrower: { pos: [29, 13], faceToward: [24, 14] },
  fireworkGuy: { pos: [20, 13], faceToward: [24, 14] },
  swans: [{ pos: [-4, -2], phase: 0 }, { pos: [3, 3], phase: 2.1 }],
};

// Light perf tuning for phones (fewer heavy features, same look)
const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Collected per-frame updaters from animated assets
const updaters = [];

// =====================================================================
//  Renderer / scene / camera
// =====================================================================
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(ATMOSPHERE_PARAMS.fogColor, IS_MOBILE ? 0.0052 : 0.006);

const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(...LAYOUT.camera.introFrom);

const renderer = new THREE.WebGLRenderer({ antialias: !IS_MOBILE });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
const root = document.getElementById('root') ?? document.body;
root.appendChild(renderer.domElement);

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.58, // strength — glow on gold/flames without washing the scene
  0.6, // radius
  0.72 // threshold — only genuinely bright things bloom
);
composer.addPass(bloomPass);

let fxaaPass = null;
if (!IS_MOBILE) {
  fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
  composer.addPass(fxaaPass);
}
composer.addPass(new OutputPass());

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.08;
controls.minDistance = 6;
controls.maxDistance = 135;
controls.target.set(...LAYOUT.camera.target);
controls.enabled = false; // released after the intro fly-in

// =====================================================================
//  Sunset sky (kept from the original world)
// =====================================================================
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 1024; skyCanvas.height = 1024;
const skyCtx = skyCanvas.getContext('2d');
const grad = skyCtx.createLinearGradient(0, 0, 0, 1024);
grad.addColorStop(0, '#0a0520');
grad.addColorStop(0.15, '#1a0a3a');
grad.addColorStop(0.3, '#4a1555');
grad.addColorStop(0.42, '#8b2252');
grad.addColorStop(0.52, '#d4553a');
grad.addColorStop(0.6, '#e87730');
grad.addColorStop(0.68, '#f09838');
grad.addColorStop(0.76, '#f5be5a');
grad.addColorStop(0.85, '#fad48e');
grad.addColorStop(0.92, '#ffe8c0');
grad.addColorStop(1, '#fff0d6');
skyCtx.fillStyle = grad;
skyCtx.fillRect(0, 0, 1024, 1024);
const sunGlowGrad = skyCtx.createRadialGradient(512, 620, 0, 512, 620, 250);
sunGlowGrad.addColorStop(0, 'rgba(255,240,200,0.5)');
sunGlowGrad.addColorStop(0.3, 'rgba(255,180,80,0.3)');
sunGlowGrad.addColorStop(0.7, 'rgba(255,100,50,0.1)');
sunGlowGrad.addColorStop(1, 'rgba(255,80,30,0)');
skyCtx.fillStyle = sunGlowGrad;
skyCtx.fillRect(0, 0, 1024, 1024);
const skyTexture = new THREE.CanvasTexture(skyCanvas);
skyTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = skyTexture;
scene.environment = skyTexture;

// =====================================================================
//  Lighting — warm golden hour (base rig + tuned atmosphere accents)
// =====================================================================
const ambientLight = new THREE.AmbientLight(ATMOSPHERE_PARAMS.ambient.color, ATMOSPHERE_PARAMS.ambient.intensity);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(ATMOSPHERE_PARAMS.keyLight.color, ATMOSPHERE_PARAMS.keyLight.intensity);
sunLight.position.set(-50, 22, -40);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(IS_MOBILE ? 1024 : 2048, IS_MOBILE ? 1024 : 2048);
sunLight.shadow.camera.left = -70;
sunLight.shadow.camera.right = 70;
sunLight.shadow.camera.top = 70;
sunLight.shadow.camera.bottom = -70;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 170;
sunLight.shadow.bias = -0.001;
sunLight.shadow.normalBias = 0.02;
scene.add(sunLight);

const warmFill = new THREE.DirectionalLight(0xff9955, 0.45);
warmFill.position.set(30, 10, 20);
scene.add(warmFill);

const rimLight = new THREE.DirectionalLight(0xff5522, 0.5);
rimLight.position.set(-40, 6, -30);
scene.add(rimLight);

const hemiLight = new THREE.HemisphereLight(ATMOSPHERE_PARAMS.hemi.sky, ATMOSPHERE_PARAMS.hemi.ground, ATMOSPHERE_PARAMS.hemi.intensity);
scene.add(hemiLight);

// =====================================================================
//  Sun sphere with glow (kept)
// =====================================================================
const sunGroup = new THREE.Group();
const sun = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffe5a0 }));
sunGroup.add(sun);
for (let i = 0; i < 3; i++) {
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(7 + i * 3, 32, 32),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.08, 0.9, 0.6 - i * 0.1),
      transparent: true, opacity: 0.15 - i * 0.04, side: THREE.BackSide,
    })
  );
  sunGroup.add(glow);
}
const SUN_POS = new THREE.Vector3(-55, 12, -80);
sunGroup.position.copy(SUN_POS);
scene.add(sunGroup);

// =====================================================================
//  Terrain helpers (kept) + placement helpers
// =====================================================================
function baseTerrain(x, z) {
  let h = 0;
  h += Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4;
  h += Math.sin(x * 0.1 + 1) * Math.cos(z * 0.08) * 2;
  h += Math.sin(x * 0.02) * Math.sin(z * 0.03) * 6;
  h += Math.cos(x * 0.15) * Math.sin(z * 0.12) * 1.5;
  h += Math.sin(x * 0.07 + 2) * Math.cos(z * 0.06 - 1) * 1.5;
  const distSq = x * x + z * z;
  if (distSq < 400) h *= 0.3 * (distSq / 400);
  return h;
}
// Raised ceremonial terrace. Instead of just ADDING height (which keeps the
// bumps, so humps still poke above the carpet), it FLATTENS the carpet corridor
// and the mandap/bride area up to (carpet-centerline base height + LIFT). That
// removes the side-humps so no land ever sits above the carpet. Fades out before
// the lake and blends smoothly into the valley.
function getTerrainHeight(x, z) {
  const b = baseTerrain(x, z);
  const near = nearestOnPath(x, z);
  const corridor = 1 - smoothstep(PATH_HALF + 7, PATH_HALF + 17, near.d);
  const dm = Math.hypot(x - LAYOUT.mandap.pos[0], z - (LAYOUT.bride.pos[1] - 3));
  const disc = 1 - smoothstep(11, 22, dm);
  const f = Math.max(corridor, disc) * smoothstep(15, 20.5, Math.hypot(x, z));
  if (f <= 0) return b;
  const LIFT = 2.4;
  const target = baseTerrain(near.cx, near.cz) + LIFT; // flat level for this stretch
  return b + (target - b) * f; // lift/flatten toward the terrace, blend at the edges
}

function faceAngle(px, pz, tx, tz) { return Math.atan2(tx - px, tz - pz); }

// Extra lift so people/props clearly stand ON TOP of the undulating ground
// instead of being visually swallowed by terrain crowns from low angles.
const CHAR_LIFT = 0.28;

// Facing helper for [x,z] + faceToward[x,z]. Static props seat on the highest
// ground under their small footprint (never sink into a bump).
function place(group, spec, opts = {}) {
  const x = spec.pos[0], z = spec.pos[1];
  const y = (opts.y !== undefined) ? opts.y : sampleMaxHeight(x, z, 0.7);
  group.position.set(x, y, z);
  if (spec.faceToward) group.rotation.y = faceAngle(x, z, spec.faceToward[0], spec.faceToward[1]);
  scene.add(group);
  return group;
}
// Accepts either a THREE.Object3D (static) or { group, update } (animated).
// Animated assets are wrapped in a grounded/oriented parent so an asset's own
// update() (which may bob/sway its group.position) can never un-ground it.
function mount(asset, spec, opts = {}) {
  if (asset.isObject3D) {
    place(asset, spec, opts);
    return asset;
  }
  const wrap = new THREE.Group();
  const x = spec.pos[0], z = spec.pos[1];
  wrap.position.set(x, opts.y !== undefined ? opts.y : sampleMaxHeight(x, z, 1.0) + CHAR_LIFT, z);
  if (spec.faceToward) wrap.rotation.y = faceAngle(x, z, spec.faceToward[0], spec.faceToward[1]);
  wrap.add(asset.group);
  scene.add(wrap);
  if (typeof asset.update === 'function') updaters.push(asset.update);
  return wrap;
}

function sampleMaxHeight(cx, cz, r) {
  let m = getTerrainHeight(cx, cz);
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    m = Math.max(m, getTerrainHeight(cx + Math.cos(ang) * r, cz + Math.sin(ang) * r));
  }
  return m;
}
function sampleMinHeight(cx, cz, r) {
  let m = getTerrainHeight(cx, cz);
  for (let a = 0; a < 8; a++) {
    const ang = (a / 8) * Math.PI * 2;
    m = Math.min(m, getTerrainHeight(cx + Math.cos(ang) * r, cz + Math.sin(ang) * r));
  }
  return m;
}

// ---- keep-clear tests so landscape never overgrows the procession ----
const PATH_PTS = LAYOUT.path.points;
const PATH_HALF = LAYOUT.path.width / 2;
function distToSeg(x, z, a, b) {
  const ax = a[0], az = a[1], bx = b[0], bz = b[1];
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz || 1e-6;
  let t = ((x - ax) * dx + (z - az) * dz) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = ax + t * dx, pz = az + t * dz;
  return Math.hypot(x - px, z - pz);
}
function distToPath(x, z) {
  let best = Infinity;
  for (let i = 0; i < PATH_PTS.length - 1; i++) best = Math.min(best, distToSeg(x, z, PATH_PTS[i], PATH_PTS[i + 1]));
  return best;
}

// ---- Raised ceremonial terrace ------------------------------------------
// Lifts the actual GROUND along the carpet corridor and around the mandap+bride
// so the whole procession stands on elevated, clearly-visible ground (fixes the
// "everyone looks half underground" problem) — added into getTerrainHeight so
// the terrain mesh, carpet and every character rise together. Fades out before
// the lake so we never raise ground up through the water.
function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
// Nearest point on the carpet centerline — used to flatten the terrace across
// its width to a single per-stretch height (kills side-humps above the carpet).
function nearestOnPath(x, z) {
  let best = Infinity, cx = PATH_PTS[0][0], cz = PATH_PTS[0][1];
  for (let i = 0; i < PATH_PTS.length - 1; i++) {
    const a = PATH_PTS[i], b = PATH_PTS[i + 1];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const len2 = dx * dx + dz * dz || 1e-6;
    let t = ((x - a[0]) * dx + (z - a[1]) * dz) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a[0] + t * dx, pz = a[1] + t * dz;
    const d = Math.hypot(x - px, z - pz);
    if (d < best) { best = d; cx = px; cz = pz; }
  }
  return { d: best, cx, cz };
}
// Lamp pillars evenly flanking the carpet edges (tidy, and on the raised terrace)
const LAMP_POS = (() => {
  const pts = LAYOUT.path.points;
  const off = LAYOUT.path.width / 2 + 1.7;
  const out = [];
  for (let i = 1; i < pts.length - 1; i += 2) { // every other bend, both sides
    const prev = pts[i - 1], next = pts[i + 1], p = pts[i];
    let tx = next[0] - prev[0], tz = next[1] - prev[1];
    const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    const px = -tz, pz = tx;
    out.push([p[0] + px * off, p[1] + pz * off]);
    out.push([p[0] - px * off, p[1] - pz * off]);
  }
  return out;
})();

const CLEAR = [
  { x: LAYOUT.mandap.pos[0], z: LAYOUT.mandap.pos[1], r: 11 },
  { x: LAYOUT.bride.pos[0], z: LAYOUT.bride.pos[1], r: 3 },
  { x: LAYOUT.horseGroom.pos[0], z: LAYOUT.horseGroom.pos[1], r: 6.5 },
  { x: LAYOUT.elephant.pos[0], z: LAYOUT.elephant.pos[1], r: 7.5 },
  ...LAYOUT.toranGates.map((g) => ({ x: g.pos[0], z: g.pos[1], r: 4.5 })),
  ...LAMP_POS.map((p) => ({ x: p[0], z: p[1], r: 1.8 })),
  ...LAYOUT.attendants.map((a) => ({ x: a.pos[0], z: a.pos[1], r: 2.2 })),
  ...LAYOUT.dancers.map((d) => ({ x: d.pos[0], z: d.pos[1], r: 2 })),
  ...LAYOUT.brideDancers.map((d) => ({ x: d.pos[0], z: d.pos[1], r: 2 })),
  ...LAYOUT.guests.map((g) => ({ x: g.pos[0], z: g.pos[1], r: 2 })),
  { x: LAYOUT.moneyThrower.pos[0], z: LAYOUT.moneyThrower.pos[1], r: 2 },
  { x: LAYOUT.fireworkGuy.pos[0], z: LAYOUT.fireworkGuy.pos[1], r: 2 },
  { x: 24, z: -2, r: 13 }, // keep the whole dance floor + carpet clear of trees
];
function nearAsset(x, z) {
  for (const c of CLEAR) { const dx = x - c.x, dz = z - c.z; if (dx * dx + dz * dz < c.r * c.r) return true; }
  return false;
}
function blocked(x, z, pathMargin = 1.5) { return distToPath(x, z) < PATH_HALF + pathMargin || nearAsset(x, z); }

// =====================================================================
//  Rivers / lake (kept — the lake is the sacred reflecting pool)
// =====================================================================
function getRiverPoint(t) {
  const x = -20 + t * 25 + Math.sin(t * 4) * 8 + Math.cos(t * 2.5) * 5;
  const z = -70 + t * 75 + Math.sin(t * 3) * 6;
  return new THREE.Vector2(x, z);
}
function getRiverPoint2(t) {
  const x = 30 - t * 28 + Math.sin(t * 3.5 + 1) * 7;
  const z = -65 + t * 68 + Math.cos(t * 2.8 + 2) * 5;
  return new THREE.Vector2(x, z);
}
function isNearRiver(px, pz, threshold = 3.5) {
  for (let t = 0; t <= 1; t += 0.01) {
    const rp = getRiverPoint(t);
    if ((px - rp.x) ** 2 + (pz - rp.y) ** 2 < threshold * threshold) return true;
    const rp2 = getRiverPoint2(t);
    if ((px - rp2.x) ** 2 + (pz - rp2.y) ** 2 < threshold * threshold) return true;
  }
  return false;
}

function createTerrain() {
  const geo = new THREE.PlaneGeometry(200, 200, 200, 200);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    let h = getTerrainHeight(x, y);
    let riverDepth = 0;
    for (let t = 0; t <= 1; t += 0.005) {
      const rp = getRiverPoint(t);
      const dist = Math.hypot(x - rp.x, y - rp.y);
      const width = 2.0 + Math.sin(t * 6) * 0.5;
      if (dist < width) riverDepth = Math.max(riverDepth, (1 - dist / width) * 2.5);
      const rp2 = getRiverPoint2(t);
      const dist2 = Math.hypot(x - rp2.x, y - rp2.y);
      const width2 = 1.6 + Math.sin(t * 5 + 1) * 0.4;
      if (dist2 < width2) riverDepth = Math.max(riverDepth, (1 - dist2 / width2) * 2.2);
    }
    h -= riverDepth;
    pos.setZ(i, h);
    const col = new THREE.Color();
    if (riverDepth > 0.5) col.setHSL(0.08, 0.3, 0.25);
    else if (h < -1) col.setHSL(0.28, 0.5, 0.22);
    else if (h < 2) col.setHSL(0.3, 0.55, 0.28 + Math.random() * 0.04);
    else if (h < 5) col.setHSL(0.25, 0.45, 0.3 + Math.random() * 0.03);
    else col.setHSL(0.22, 0.35, 0.32 + Math.random() * 0.03);
    colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.rotateX(-Math.PI / 2);
  const terrain = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.92, metalness: 0.0, envMapIntensity: 0.3,
  }));
  terrain.receiveShadow = true;
  scene.add(terrain);
}
createTerrain();

function createRiverStream(getPoint, segments, widthBase, widthVar) {
  const points = [];
  for (let t = 0; t <= 1; t += 1 / segments) points.push(getPoint(t));
  const vertices = [], indices = [], uvs = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const t = i / (points.length - 1);
    let dir;
    if (i < points.length - 1) { const n = points[i + 1]; dir = new THREE.Vector2(n.x - p.x, n.y - p.y).normalize(); }
    else { const pr = points[i - 1]; dir = new THREE.Vector2(p.x - pr.x, p.y - pr.y).normalize(); }
    const perp = new THREE.Vector2(-dir.y, dir.x);
    const w = widthBase + Math.sin(t * 6) * widthVar;
    const waterH = Math.min(
      getTerrainHeight(p.x + perp.x * w, p.y + perp.y * w),
      getTerrainHeight(p.x - perp.x * w, p.y - perp.y * w),
      getTerrainHeight(p.x, p.y)
    ) + 0.15;
    vertices.push(p.x + perp.x * w, waterH, p.y + perp.y * w, p.x - perp.x * w, waterH, p.y - perp.y * w);
    uvs.push(0, t * 8, 1, t * 8);
    if (i < points.length - 1) { const vi = i * 2; indices.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0x1a6080, roughness: 0.05, metalness: 0.7, transparent: true, opacity: 0.7,
    envMapIntensity: 1.5, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  }));
  scene.add(mesh);
  return mesh;
}
createRiverStream(getRiverPoint, 80, 2.0, 0.5);
createRiverStream(getRiverPoint2, 80, 1.5, 0.4);

// Lake + reflective ring. polygonOffset pushes the flat water under the sloped
// shore so the terrain reads as a clean bank instead of z-fighting at the rim.
const water = new THREE.Mesh(new THREE.CircleGeometry(15.5, 72), new THREE.MeshStandardMaterial({
  color: 0x1a6888, roughness: 0.02, metalness: 0.8, transparent: true, opacity: 0.82, envMapIntensity: 2.0,
  polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
}));
water.rotation.x = -Math.PI / 2;
water.position.set(0, 0.32, 0);
scene.add(water);
// darker shelf ring blends the shoreline
const lakeEdge = new THREE.Mesh(new THREE.RingGeometry(14.5, 17.5, 72), new THREE.MeshStandardMaterial({
  color: 0x0d4455, roughness: 0.2, metalness: 0.4, transparent: true, opacity: 0.5,
  polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
}));
lakeEdge.rotation.x = -Math.PI / 2;
lakeEdge.position.set(0, 0.26, 0);
scene.add(lakeEdge);

// Golden sun-strip reflection on the lake, aimed toward the mandap
const sunReflection = new THREE.Mesh(new THREE.PlaneGeometry(5, 22), new THREE.MeshBasicMaterial({
  color: 0xffcc66, transparent: true, opacity: 0.22, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
}));
sunReflection.rotation.x = -Math.PI / 2;
sunReflection.position.set(-3, 0.26, -6);
scene.add(sunReflection);

// =====================================================================
//  Vegetation (kept) — now skips the ceremonial path & asset footprints
// =====================================================================
function createConifer(x, z, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.35 * scale, 3.5 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x4a2e12, roughness: 0.95 })
  );
  trunk.position.y = 1.75 * scale; trunk.castShadow = true; group.add(trunk);
  const leafColors = [0x1d5422, 0x2a6b2e, 0x1a4d20, 0x286630];
  for (let i = 0; i < 4; i++) {
    const leafGeo = new THREE.ConeGeometry((2.5 - i * 0.5) * scale, (2.2 - i * 0.3) * scale, 7 + Math.floor(Math.random() * 3));
    const lp = leafGeo.attributes.position;
    for (let j = 0; j < lp.count; j++) {
      lp.setX(j, lp.getX(j) + (Math.random() - 0.5) * 0.2 * scale);
      lp.setZ(j, lp.getZ(j) + (Math.random() - 0.5) * 0.2 * scale);
    }
    leafGeo.computeVertexNormals();
    const leaf = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ color: leafColors[i % 4], roughness: 0.85 }));
    leaf.position.y = (3.2 + i * 1.1) * scale; leaf.rotation.y = Math.random() * Math.PI; leaf.castShadow = true;
    group.add(leaf);
  }
  group.position.set(x, getTerrainHeight(x, z), z);
  return group;
}
for (let i = 0; i < 80; i++) {
  const x = (Math.random() - 0.5) * 130, z = (Math.random() - 0.5) * 130;
  if (x * x + z * z < 350) continue;
  if (isNearRiver(x, z, 4) || blocked(x, z, 11)) continue;
  scene.add(createConifer(x, z, 0.6 + Math.random() * 0.9));
}

function createDeciduous(x, z, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.25 * scale, 4 * scale, 6),
    new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 })
  );
  trunk.position.y = 2 * scale; trunk.castShadow = true; group.add(trunk);
  const canopyGeo = new THREE.IcosahedronGeometry(2.2 * scale, 2);
  const cp = canopyGeo.attributes.position;
  for (let j = 0; j < cp.count; j++) {
    cp.setX(j, cp.getX(j) + (Math.random() - 0.5) * 0.4 * scale);
    cp.setY(j, cp.getY(j) + (Math.random() - 0.5) * 0.3 * scale);
    cp.setZ(j, cp.getZ(j) + (Math.random() - 0.5) * 0.4 * scale);
  }
  canopyGeo.computeVertexNormals();
  const canopy = new THREE.Mesh(canopyGeo, new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.25 + Math.random() * 0.1, 0.5, 0.25 + Math.random() * 0.1), roughness: 0.85,
  }));
  canopy.position.y = 4.5 * scale; canopy.castShadow = true; group.add(canopy);
  group.position.set(x, getTerrainHeight(x, z), z);
  return group;
}
for (let i = 0; i < 30; i++) {
  const x = (Math.random() - 0.5) * 110, z = (Math.random() - 0.5) * 110;
  if (x * x + z * z < 350) continue;
  if (isNearRiver(x, z, 4) || blocked(x, z, 11)) continue;
  scene.add(createDeciduous(x, z, 0.5 + Math.random() * 0.7));
}

function createRock(x, z, s) {
  const geo = new THREE.DodecahedronGeometry(s, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * s * 0.35);
    pos.setY(i, pos.getY(i) * (0.5 + Math.random() * 0.3) + (Math.random() - 0.5) * s * 0.2);
    pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * s * 0.35);
  }
  geo.computeVertexNormals();
  const shade = 0.35 + Math.random() * 0.2;
  const rock = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: new THREE.Color(shade, shade * 0.95, shade * 0.9), roughness: 0.95, metalness: 0.02,
  }));
  rock.position.set(x, getTerrainHeight(x, z) + s * 0.2, z);
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * 0.5);
  rock.castShadow = true;
  scene.add(rock);
}
for (let t = 0; t < 1; t += 0.05) {
  if (Math.random() > 0.6) continue;
  const rp = getRiverPoint(t);
  const off = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 2);
  const rx = rp.x + off, rz = rp.y + (Math.random() - 0.5) * 2;
  if (blocked(rx, rz, 1)) continue;
  createRock(rx, rz, 0.4 + Math.random() * 0.8);
}
for (let i = 0; i < 26; i++) {
  const x = (Math.random() - 0.5) * 100, z = (Math.random() - 0.5) * 100;
  if (x * x + z * z < 250) continue;
  if (isNearRiver(x, z, 3) || blocked(x, z, 1)) continue;
  createRock(x, z, 0.4 + Math.random() * 1.2);
}

// Wildflowers (kept, warmer palette, off the path)
const flowerGeo = new THREE.SphereGeometry(0.12, 5, 5);
const flowerColors = [PAL.marigold, PAL.rose, 0xffdd44, PAL.saffron, PAL.jasmine, 0xff4466, 0xffaa22];
flowerColors.forEach((col) => {
  const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.5, emissive: col, emissiveIntensity: 0.06 });
  const per = 44;
  const inst = new THREE.InstancedMesh(flowerGeo, mat, per);
  const dummy = new THREE.Object3D();
  let idx = 0;
  for (let i = 0; i < per; i++) {
    const x = (Math.random() - 0.5) * 90, z = (Math.random() - 0.5) * 90;
    if (x * x + z * z < 250) continue;
    if (isNearRiver(x, z, 3) || blocked(x, z, 0.5)) continue;
    dummy.position.set(x, getTerrainHeight(x, z) + 0.25, z);
    dummy.scale.setScalar(0.5 + Math.random() * 0.8);
    dummy.updateMatrix();
    inst.setMatrixAt(idx++, dummy.matrix);
  }
  inst.count = idx;
  scene.add(inst);
});

// Grass tufts (kept, reduced, off the path)
const grassGeo = new THREE.PlaneGeometry(0.15, 0.6);
grassGeo.translate(0, 0.3, 0);
const grassCount = IS_MOBILE ? 500 : 850;
const grass = new THREE.InstancedMesh(grassGeo, new THREE.MeshStandardMaterial({
  color: 0x3a7a2e, roughness: 0.9, side: THREE.DoubleSide, alphaTest: 0.5,
}), grassCount);
const gd = new THREE.Object3D();
let gi = 0;
for (let i = 0; i < grassCount; i++) {
  const x = (Math.random() - 0.5) * 100, z = (Math.random() - 0.5) * 100;
  if (x * x + z * z < 300) continue;
  if (isNearRiver(x, z, 2.5) || blocked(x, z, 0.5)) continue;
  gd.position.set(x, getTerrainHeight(x, z), z);
  gd.rotation.y = Math.random() * Math.PI * 2;
  gd.scale.set(0.8 + Math.random() * 0.6, 0.6 + Math.random() * 1.0, 1);
  gd.updateMatrix();
  grass.setMatrixAt(gi++, gd.matrix);
}
grass.count = gi;
scene.add(grass);

// =====================================================================
//  Mountains / clouds / birds / butterflies (kept)
// =====================================================================
function createMountain(x, z, height, width) {
  const group = new THREE.Group();
  const geo = new THREE.ConeGeometry(width, height, 8);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * width * 0.18);
    pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * width * 0.18);
    if (pos.getY(i) < height * 0.3) pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * height * 0.08);
  }
  geo.computeVertexNormals();
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const nH = (pos.getY(i) + height / 2) / height;
    const col = new THREE.Color();
    if (nH > 0.8) col.setHSL(0, 0, 0.85 + Math.random() * 0.1);
    else if (nH > 0.6) col.lerpColors(new THREE.Color(0x556b6e), new THREE.Color(0xddeeff), (nH - 0.6) / 0.2);
    else col.setHSL(0.28, 0.3, 0.25 + nH * 0.15);
    colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const mtn = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true }));
  mtn.position.set(x, height / 2 - 5, z); mtn.castShadow = true; group.add(mtn);
  for (let i = 0; i < 2; i++) {
    const rGeo = new THREE.ConeGeometry(width * (0.5 + Math.random() * 0.3), height * (0.5 + Math.random() * 0.3), 6);
    const ridge = new THREE.Mesh(rGeo, new THREE.MeshStandardMaterial({ color: 0x4a5a5e, roughness: 0.95, flatShading: true }));
    ridge.position.set(x + (Math.random() - 0.5) * width * 0.8, height * (0.2 + Math.random() * 0.15) - 5, z + (Math.random() - 0.5) * width * 0.3);
    group.add(ridge);
  }
  scene.add(group);
}
createMountain(-55, -75, 45, 22); createMountain(-28, -85, 55, 28); createMountain(5, -90, 50, 25);
createMountain(35, -80, 42, 20); createMountain(60, -75, 48, 23); createMountain(-70, -80, 35, 18);
createMountain(80, -70, 38, 19);

function createCloud(x, y, z) {
  const group = new THREE.Group();
  const col = new THREE.Color().setHSL(0.07, 0.4, 0.75 + Math.random() * 0.2);
  const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 1, transparent: true, opacity: 0.75, emissive: 0xff6633, emissiveIntensity: 0.15 });
  for (let i = 0; i < 5 + Math.floor(Math.random() * 5); i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1.5 + Math.random() * 3, 10, 8), mat);
    puff.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 4);
    puff.scale.y = 0.5 + Math.random() * 0.2; group.add(puff);
  }
  group.position.set(x, y, z);
  return group;
}
const clouds = [];
for (let i = 0; i < 6; i++) {
  const c = createCloud((Math.random() - 0.5) * 180, 24 + Math.random() * 18, -40 + (Math.random() - 0.5) * 80);
  scene.add(c); clouds.push(c);
}

const birds = [];
for (let i = 0; i < 5; i++) {
  const bird = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
  const wL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.15), mat); wL.position.x = -0.6; bird.add(wL);
  const wR = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.15), mat); wR.position.x = 0.6; bird.add(wR);
  bird.position.set(-40 + Math.random() * 30, 30 + Math.random() * 14, -50 + Math.random() * 30);
  bird.userData = { phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.5, baseX: bird.position.x };
  scene.add(bird); birds.push(bird);
}

const butterflies = [];
for (let i = 0; i < 6; i++) {
  const group = new THREE.Group();
  const wingCol = [PAL.marigold, 0xffdd44, PAL.rose, 0x00bcd4, PAL.gold][Math.floor(Math.random() * 5)];
  const mat = new THREE.MeshStandardMaterial({ color: wingCol, side: THREE.DoubleSide, roughness: 0.3, emissive: wingCol, emissiveIntensity: 0.12 });
  const wL = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), mat); wL.position.x = -0.25; group.add(wL);
  const wR = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), mat); wR.position.x = 0.25; group.add(wR);
  group.position.set(6 + (Math.random() - 0.5) * 40, 3 + Math.random() * 5, -6 + (Math.random() - 0.5) * 40);
  group.userData = { baseY: group.position.y, phase: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() };
  scene.add(group); butterflies.push(group);
}

// =====================================================================
//  ================  ROYAL BARAAT LAYER  ================
// =====================================================================

// --- Ceremonial pathway (world-space geometry, added at origin) -------
const path = createCeremonialPath({ points: LAYOUT.path.points, width: LAYOUT.path.width, getHeight: getTerrainHeight });
scene.add(path);

// Rangoli medallions at the mandap entrance and the procession start
const rangoliEntrance = createRangoli(3.2);
rangoliEntrance.position.set(-2, getTerrainHeight(-2, -30) + 0.02, -30);
scene.add(rangoliEntrance);
const rangoliStart = createRangoli(2.4);
rangoliStart.position.set(14, getTerrainHeight(14, 44) + 0.02, 44);
scene.add(rangoliStart);

// --- Mandap (with a stone foundation pad so it seats cleanly) ---------
const MANDAP = LAYOUT.mandap;
const mandapBaseY = sampleMaxHeight(MANDAP.pos[0], MANDAP.pos[1], 3.7);
// Tall enough to always bury into the slope, so the plinth never floats
const pad = new THREE.Mesh(
  new THREE.CylinderGeometry(5.1, 5.6, 12, 40),
  new THREE.MeshStandardMaterial({ color: PAL.cream, roughness: 0.9, metalness: 0.02 })
);
pad.position.set(MANDAP.pos[0], mandapBaseY + 0.04 - 6, MANDAP.pos[1]);
pad.receiveShadow = true;
scene.add(pad);
mount(createMandap(), MANDAP, { y: mandapBaseY });

// Hero glow inside the mandap (the sacred fire) + processional warm light
const mandapLight = new THREE.PointLight(0xff7b2e, IS_MOBILE ? 2.0 : 2.6, 28, 2.0);
mandapLight.position.set(MANDAP.pos[0], mandapBaseY + 2.2, MANDAP.pos[1]);
scene.add(mandapLight);
const processionLight = new THREE.PointLight(0xffb04a, 1.3, 20, 2.0);
processionLight.position.set(LAYOUT.horseGroom.pos[0], getTerrainHeight(LAYOUT.horseGroom.pos[0], LAYOUT.horseGroom.pos[1]) + 3, LAYOUT.horseGroom.pos[1]);
scene.add(processionLight);

// --- Toran gates over the path ---------------------------------------
LAYOUT.toranGates.forEach((g) => mount(createToranGate(), g));

// --- Lamp pillars lining the path ------------------------------------
LAMP_POS.forEach((p) => mount(createCarvedPillar(), { pos: p }, { y: getTerrainHeight(p[0], p[1]) }));

// A couple of free-standing floral arches framing the mandap approach
mount(createFloralArch(), { pos: [3, -27], faceToward: [-2, -31] });
mount(createFloralArch(), { pos: [-7, -27], faceToward: [-2, -31] });

// --- The couple, the mount, the elephant (standing on the raised carpet) ---
const CARPET_LIFT = 0.32; // matches the carpet's terrain lift
const hgY = sampleMaxHeight(LAYOUT.horseGroom.pos[0], LAYOUT.horseGroom.pos[1], 1.4) + CARPET_LIFT;
mount(createHorseGroom(), LAYOUT.horseGroom, { y: hgY });
mount(createBride(), LAYOUT.bride);

// Elephant directly behind the groom, carrying a "TEAM GROOM" banner in its trunk
const elY = sampleMaxHeight(LAYOUT.elephant.pos[0], LAYOUT.elephant.pos[1], 2.2) + CARPET_LIFT;
mount(createElephant(), LAYOUT.elephant, { y: elY });
{
  const ex = LAYOUT.elephant.pos[0], ez = LAYOUT.elephant.pos[1];
  const banner = createTeamGroomBanner('TEAM GROOM');
  const w = new THREE.Group();
  w.position.set(ex, elY + 2.3, ez - 3.4); // held forward off the trunk, toward the groom/camera
  w.add(banner.group);
  scene.add(w);
  updaters.push(banner.update);
}

// --- Attendants (each with a ceremonial item) ------------------------
LAYOUT.attendants.forEach((a, i) => mount(createAttendant({ item: a.item, phase: i * 0.7 }), a));

// Two musicians playing right beside the groom
LAYOUT.groomMusicians.forEach((m, i) => mount(createAttendant({ item: m.item, phase: 3 + i }), m));

// --- Coordinated dancers (two rows facing the groom) -----------------
LAYOUT.dancers.forEach((d, i) =>
  mount(createDancer({ variant: d.variant, phase: i * 0.8 }), { pos: d.pos, faceToward: LAYOUT.horseGroom.pos })
);
// Two female dancers flanking the bride so she is not isolated
LAYOUT.brideDancers.forEach((d, i) => mount(createDancer({ variant: d.variant, phase: 1 + i }), d));

// --- Guests / onlookers lining the procession ------------------------
LAYOUT.guests.forEach((g, i) => mount(createGuest({ variant: g.variant, phase: i * 1.1 }), g));

// --- Money thrower (paise udana) beside the groom --------------------
mount(createGuest({ variant: 'cheering', phase: 0.5 }), LAYOUT.moneyThrower);
{
  const [mx, mz] = LAYOUT.moneyThrower.pos;
  const my = sampleMaxHeight(mx, mz, 1.0) + CHAR_LIFT;
  const money = createMoneyFountain({ origin: [mx - 1.4, my + 1.8, mz + 0.7], ground: my + 0.05, count: IS_MOBILE ? 22 : 36 });
  scene.add(money.group);
  updaters.push(money.update);
}

// --- Firework launcher near the groom --------------------------------
mount(createGuest({ variant: 'cheering', phase: 2.3 }), LAYOUT.fireworkGuy);
{
  const [fx, fz] = LAYOUT.fireworkGuy.pos;
  const fy = sampleMaxHeight(fx, fz, 1.0) + CHAR_LIFT;
  const fw = createFirework({ origin: [fx - 0.4, fy + 1.6, fz], rise: 13 });
  scene.add(fw.group);
  updaters.push(fw.update);
}

// --- Small decor near the mandap: kalash, diyas, lanterns, garland ----
const cx = MANDAP.pos[0], cz = MANDAP.pos[1];
const entranceY = getTerrainHeight(cx, -30);

// Two auspicious kalash flanking the entrance
mount(createKalash(), { pos: [cx - 3.4, -30.4] });
mount(createKalash(), { pos: [cx + 3.4, -30.4] });

// Diyas along the entrance step + around the rangoli
for (let i = 0; i < 9; i++) {
  const dx = cx - 4 + i * 1.0;
  mount(createDiya(), { pos: [dx, -29.6] });
}
for (let i = 0; i < 6; i++) {
  const ang = (i / 6) * Math.PI * 2;
  mount(createDiya(), { pos: [cx + Math.cos(ang) * 3.0, -30 + Math.sin(ang) * 3.0] });
}

// Petal trays near the bride / entrance
mount(createPetalTray(), { pos: [cx - 1.6, -29] });
mount(createPetalTray(), { pos: [cx + 1.6, -29] });
mount(createPetalTray(), { pos: [cx, -27.6] });

// Hanging lanterns: two at the mandap entrance, one beneath each toran apex
const lanternSpots = [
  { pos: [cx - 2.6, -30.2], y: entranceY + 3.1 },
  { pos: [cx + 2.6, -30.2], y: entranceY + 3.1 },
  ...LAYOUT.toranGates.map((g) => ({ pos: g.pos, y: getTerrainHeight(g.pos[0], g.pos[1]) + 3.6 })),
];
lanternSpots.forEach((s) => mount(createLantern(), { pos: s.pos }, { y: s.y }));

// A marigold+jasmine garland swagged across the mandap entrance
const garland = createHangingGarland(5.2, 'mixed');
garland.position.set(cx, entranceY + 3.0, -30.2);
scene.add(garland);

// --- Atmosphere: floating petals + volumetric god-rays ----------------
mount(createPetalSystem({
  area: LAYOUT.petalArea,
  top: mandapBaseY + 16,
  getHeight: getTerrainHeight,
}), { pos: [0, 0] }, { y: 0 });

const rays = createVolumetricRays({ origin: [SUN_POS.x, SUN_POS.y, SUN_POS.z], color: PAL.flame, count: IS_MOBILE ? 6 : 8 });
scene.add(rays.group);
if (rays.update) updaters.push(rays.update);

// --- Two white swans floating on the pond ----------------------------
LAYOUT.swans.forEach((s) => {
  const swan = createSwan(s.phase);
  const w = new THREE.Group();
  w.position.set(s.pos[0], 0.34, s.pos[1]); // float at the water surface
  w.add(swan.group);
  scene.add(w);
  updaters.push(swan.update);
});

// --- Aerial banner plane circling the whole world --------------------
const plane = createPlaneBanner(COUPLE.bride + ' weds ' + COUPLE.groom, { radius: 55, height: 30, speed: 0.085 });
scene.add(plane.group);
updaters.push(plane.update);

// =====================================================================
//  Camera intro fly-in + UI reveal
// =====================================================================
const camFrom = new THREE.Vector3(...LAYOUT.camera.introFrom);
const camTo = new THREE.Vector3(...LAYOUT.camera.introTo);
const camTarget = new THREE.Vector3(...LAYOUT.camera.target);
const INTRO_DUR = LAYOUT.camera.introDurationSec;
let introDone = false;
let firstFrame = true;

// Full 360° orbit — explore from any angle. Pan enabled, tilt from overhead to
// just above the ground (never under it).
controls.enablePan = true;
controls.screenSpacePanning = false;
controls.minPolarAngle = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.minDistance = 6;
controls.maxDistance = 150;
controls.autoRotateSpeed = 0.35;
// Idle-cinematic: after a few still seconds, a slow orbit resumes; any input stops it.
let interacting = false;
let idleTimer = 0;
const IDLE_DELAY = 4.0;

// --- Free roam ---------------------------------------------------------
// WASD / arrows fly through the world. This moves the camera AND the orbit
// pivot together, so you're never stuck circling one fixed point in the middle.
const keys = Object.create(null);
const ROAM_CODES = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Space', 'ShiftLeft', 'ShiftRight',
]);
window.addEventListener('keydown', (e) => {
  if (!ROAM_CODES.has(e.code)) return;
  keys[e.code] = true;
  if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
});
window.addEventListener('keyup', (e) => { if (ROAM_CODES.has(e.code)) keys[e.code] = false; });

const _fwd = new THREE.Vector3(), _right = new THREE.Vector3(), _move = new THREE.Vector3();
function updateRoam(dt) {
  _fwd.subVectors(controls.target, camera.position);
  _fwd.y = 0;
  if (_fwd.lengthSq() < 1e-6) return;
  _fwd.normalize();
  _right.set(-_fwd.z, 0, _fwd.x); // forward × up
  _move.set(0, 0, 0);
  if (keys['KeyW'] || keys['ArrowUp']) _move.add(_fwd);
  if (keys['KeyS'] || keys['ArrowDown']) _move.sub(_fwd);
  if (keys['KeyD'] || keys['ArrowRight']) _move.add(_right);
  if (keys['KeyA'] || keys['ArrowLeft']) _move.sub(_right);
  if (keys['KeyE'] || keys['Space']) _move.y += 1;
  if (keys['KeyQ']) _move.y -= 1;
  if (_move.lengthSq() === 0) return;
  const speed = (keys['ShiftLeft'] || keys['ShiftRight']) ? 34 : 13;
  _move.normalize().multiplyScalar(speed * dt);
  camera.position.add(_move);
  controls.target.add(_move);
  // never sink through the ground
  const floor = getTerrainHeight(camera.position.x, camera.position.z) + 1.5;
  if (camera.position.y < floor) {
    const d = floor - camera.position.y;
    camera.position.y += d;
    controls.target.y += d;
  }
  controls.autoRotate = false;
  idleTimer = 0;
  if (elTitle) elTitle.classList.add('gone');
}

const elLoading = document.getElementById('loading');
const elTitle = document.getElementById('titlecard');
const elHint = document.getElementById('hint');

controls.addEventListener('start', () => {
  interacting = true;
  controls.autoRotate = false;
  if (elTitle) elTitle.classList.add('gone');
  if (elHint) elHint.classList.add('gone');
});
controls.addEventListener('end', () => { interacting = false; idleTimer = 0; });

// =====================================================================
//  Ambient soundscape — fully synthesized (no external audio files)
// =====================================================================
let audioStarted = false;
let audioMuted = false;
let masterGain = null;
const AMBIENT_VOL = 0.16;
function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = audioMuted ? 0 : AMBIENT_VOL;
    masterGain.connect(ctx.destination);
    // warm tanpura-like drone: root + fifth + octave, gently detuned
    const base = 110;
    [base, base * 1.5, base * 2].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? 'sine' : 'triangle';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.2 / (i + 1);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08 + i * 0.03;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 2.5;
      lfo.connect(lfoG); lfoG.connect(o.detune);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 720;
      o.connect(g); g.connect(lp); lp.connect(masterGain);
      o.start(); lfo.start();
    });
    // soft airy shimmer (a gentle wind/crowd bed)
    const n = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
    const noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 0.6;
    const ng = ctx.createGain(); ng.gain.value = 0.045;
    noise.connect(bp); bp.connect(ng); ng.connect(masterGain);
    noise.start();

    // ---- Shehnai melody + tabla rhythm (procedural, raga-flavoured) ----
    const musicGain = ctx.createGain();
    musicGain.gain.value = 1.0;
    musicGain.connect(masterGain);
    const shehnai = (time, freq, dur) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, time);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.07, time + 0.1);
      g.gain.setValueAtTime(0.07, time + dur - 0.14);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass'; bp2.frequency.value = freq * 2.6; bp2.Q.value = 5;
      const vib = ctx.createOscillator(); vib.frequency.value = 5.5;
      const vibG = ctx.createGain(); vibG.gain.value = freq * 0.012;
      vib.connect(vibG); vibG.connect(o.frequency);
      o.connect(bp2); bp2.connect(g); g.connect(musicGain);
      o.start(time); vib.start(time); o.stop(time + dur + 0.05); vib.stop(time + dur + 0.05);
    };
    const tabla = (time, freq, dur, gain) => {
      const o = ctx.createOscillator();
      o.frequency.setValueAtTime(freq * 1.8, time);
      o.frequency.exponentialRampToValueAtTime(freq, time + 0.05);
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      o.connect(g); g.connect(musicGain);
      o.start(time); o.stop(time + dur + 0.02);
    };
    const BPM = 78, beat = 60 / BPM, bar = beat * 4;
    const phrase = [261.63, 293.66, 329.63, 349.23, 392.0, 349.23, 329.63, 293.66, 261.63, 293.66, 329.63, 392.0];
    let melodyIdx = 0;
    let barTime = ctx.currentTime + 0.3;
    const scheduleBar = () => {
      const t0 = barTime;
      tabla(t0, 150, 0.22, 0.15); tabla(t0 + beat, 210, 0.16, 0.10);
      tabla(t0 + 1.5 * beat, 150, 0.18, 0.09); tabla(t0 + 2 * beat, 150, 0.22, 0.14);
      tabla(t0 + 3 * beat, 210, 0.16, 0.10); tabla(t0 + 3.5 * beat, 260, 0.14, 0.08);
      shehnai(t0, phrase[melodyIdx % phrase.length], beat * 2); melodyIdx++;
      shehnai(t0 + beat * 2, phrase[melodyIdx % phrase.length], beat * 2); melodyIdx++;
      barTime += bar;
    };
    scheduleBar(); scheduleBar();
    setInterval(() => {
      if (ctx.state !== 'running') return;
      while (barTime < ctx.currentTime + 2.5) scheduleBar();
    }, 600);
  } catch (e) { /* audio unavailable — stay silent */ }
}
function setSoundIcon() {
  const b = document.getElementById('soundBtn');
  if (b) b.textContent = !audioStarted || audioMuted ? '🔇' : '🔊';
}
function toggleMute() {
  audioMuted = !audioMuted;
  if (masterGain) masterGain.gain.value = audioMuted ? 0 : AMBIENT_VOL;
  setSoundIcon();
}
// browsers require a user gesture before audio can play
['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
  window.addEventListener(ev, () => { startAudio(); setSoundIcon(); }, { once: true })
);
const soundBtn = document.getElementById('soundBtn');
if (soundBtn) soundBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!audioStarted) startAudio(); else toggleMute();
  setSoundIcon();
});

// =====================================================================
//  Animation loop
// =====================================================================
const clock = new THREE.Clock();
let prevT = 0;

function animate() {
  const t = clock.getElapsedTime();
  const dt = Math.min(t - prevT, 0.05);
  prevT = t;

  // Ambient world motion (kept)
  water.material.color.setHSL(0.52, 0.55, 0.3 + Math.sin(t * 0.3) * 0.03);
  sunReflection.material.opacity = 0.16 + Math.sin(t * 2) * 0.07;
  sunReflection.scale.x = 1 + Math.sin(t * 1.5) * 0.2;
  clouds.forEach((c, i) => {
    c.position.x += 0.006 * (i % 2 === 0 ? 1 : 0.7);
    if (c.position.x > 100) c.position.x = -100;
    c.position.y += Math.sin(t * 0.3 + i) * 0.002;
  });
  butterflies.forEach((b) => {
    const d = b.userData;
    b.position.x += Math.sin(t * d.speed + d.phase) * 0.02;
    b.position.z += Math.cos(t * d.speed + d.phase) * 0.02;
    b.position.y = d.baseY + Math.sin(t * 2 + d.phase) * 0.5;
    b.rotation.y = t * d.speed;
    const f = Math.sin(t * 12 + d.phase) * 0.6;
    b.children[0].rotation.y = f; b.children[1].rotation.y = -f;
  });
  birds.forEach((bird) => {
    const bd = bird.userData;
    bird.position.x = bd.baseX + t * bd.speed * 2;
    bird.position.y += Math.sin(t * 1.5 + bd.phase) * 0.005;
    if (bird.position.x > 60) bird.position.x = bd.baseX = -60;
    const wf = Math.sin(t * 4 + bd.phase) * 0.4;
    bird.children[0].rotation.z = wf; bird.children[1].rotation.z = -wf;
  });

  // Firelight flicker on the hero lights
  mandapLight.intensity = (IS_MOBILE ? 2.0 : 2.6) + Math.sin(t * 9) * 0.25 + Math.sin(t * 23) * 0.12;

  // Baraat asset updaters
  for (let i = 0; i < updaters.length; i++) updaters[i](t, dt);

  // Camera intro then hand off to orbit controls
  if (!introDone) {
    const p = Math.min(t / INTRO_DUR, 1);
    const e = p * p * (3 - 2 * p);
    camera.position.lerpVectors(camFrom, camTo, e);
    camera.lookAt(camTarget);
    if (p >= 1) {
      introDone = true;
      controls.enabled = true;
      idleTimer = 0;
    }
  } else {
    updateRoam(dt);
    if (!interacting) {
      idleTimer += dt;
      if (idleTimer > IDLE_DELAY) controls.autoRotate = true;
    }
    controls.update();
  }

  composer.render();

  if (firstFrame) {
    firstFrame = false;
    if (elLoading) elLoading.classList.add('hidden');
    // Let the title breathe, then fade it out
    setTimeout(() => { if (elTitle) elTitle.classList.add('gone'); }, (INTRO_DUR + 2) * 1000);
    setTimeout(() => { if (elHint) elHint.classList.add('gone'); }, 12000);
  }
}
renderer.setAnimationLoop(animate);

// =====================================================================
//  Resize
// =====================================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  if (fxaaPass) fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
});

```


## `src/wedding/shared.js`

```javascript
// Shared royal color palette for the baraat scene.
// White, royal gold, deep burgundy dominant; marigold + jasmine florals; saffron accents.
export const PAL = {
  white: 0xfaf3e0,
  ivory: 0xfff8ec,
  cream: 0xf3e5c8,
  gold: 0xd4af37,
  goldBright: 0xffd45c,
  brass: 0xc08a2d,
  bronze: 0x8a5a1e,
  burgundy: 0x5e1220,
  burgundyDeep: 0x3a0a12,
  crimson: 0x8c1c2b,
  maroon: 0x4a0e18,
  marigold: 0xff8c1a,
  marigoldDeep: 0xe86a08,
  jasmine: 0xfff6e8,
  saffron: 0xff7518,
  rose: 0xd94f6a,
  leaf: 0x2f6a2a,
  skin: 0xc98a5e,
  skinDark: 0xa66a3e,
  flame: 0xffb347,
  emberGlow: 0xff7b2e,
};

```


## `src/wedding/mandap.js`

```javascript
// mandap.js — the ceremonial centerpiece of the baraat scene.
// A raised marble plinth, six carved white-and-gold pillars, a tiered
// scalloped dome with a cloth valance and marigold/jasmine garlands, a
// golden kalash finial, and a small glowing agni fire vedi at center.
// Static asset. ~8 tall, ~7 wide footprint, open on the +Z (front) side.
// Triangle budget < 5000.
import * as THREE from "three";
import { PAL } from "./shared.js";

export function createMandap() {
  const root = new THREE.Group();

  // ---- shared materials (reused across all repeated parts) -------------
  const marble = new THREE.MeshStandardMaterial({
    color: PAL.white, roughness: 0.62, metalness: 0.05,
  });
  const marbleWarm = new THREE.MeshStandardMaterial({
    color: PAL.ivory, roughness: 0.55, metalness: 0.06,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: PAL.gold, metalness: 0.9, roughness: 0.32,
    emissive: PAL.brass, emissiveIntensity: 0.22,
  });
  const goldBright = new THREE.MeshStandardMaterial({
    color: PAL.goldBright, metalness: 0.85, roughness: 0.28,
    emissive: PAL.goldBright, emissiveIntensity: 0.9,
  });
  const burgundy = new THREE.MeshStandardMaterial({
    color: PAL.burgundy, roughness: 0.82, metalness: 0.04,
  });
  const cloth = new THREE.MeshStandardMaterial({
    color: PAL.cream, roughness: 0.8, metalness: 0.02,
  });
  const marigold = new THREE.MeshStandardMaterial({
    color: PAL.marigold, roughness: 0.6, metalness: 0.0,
    emissive: PAL.marigoldDeep, emissiveIntensity: 0.28,
  });
  const jasmine = new THREE.MeshStandardMaterial({
    color: PAL.jasmine, roughness: 0.7, metalness: 0.0,
    emissive: PAL.jasmine, emissiveIntensity: 0.15,
  });
  const leaf = new THREE.MeshStandardMaterial({
    color: PAL.leaf, roughness: 0.8, metalness: 0.0,
  });
  const woodDark = new THREE.MeshStandardMaterial({
    color: PAL.bronze, roughness: 0.85, metalness: 0.1,
  });
  const ember = new THREE.MeshStandardMaterial({
    color: PAL.emberGlow, emissive: PAL.emberGlow, emissiveIntensity: 2.0,
    roughness: 0.5,
  });
  const flameMid = new THREE.MeshStandardMaterial({
    color: PAL.saffron, emissive: PAL.marigold, emissiveIntensity: 2.4,
    roughness: 0.4,
  });
  const flameCore = new THREE.MeshStandardMaterial({
    color: PAL.goldBright, emissive: PAL.goldBright, emissiveIntensity: 3.0,
    roughness: 0.35,
  });
  const bowlDark = new THREE.MeshStandardMaterial({
    color: PAL.burgundyDeep, roughness: 0.9, metalness: 0.05,
  });

  const add = (geo, mat, x, y, z, parent = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // ====================================================================
  // 1. TIERED MARBLE PLINTH  (square, grand, low steps)
  // ====================================================================
  const PLINTH_TOP = 0.52;
  add(new THREE.BoxGeometry(7.2, 0.18, 7.2), marble, 0, 0.09, 0);
  add(new THREE.BoxGeometry(6.5, 0.18, 6.5), marbleWarm, 0, 0.27, 0);
  add(new THREE.BoxGeometry(5.9, 0.16, 5.9), marble, 0, 0.44, 0);
  // thin gold inlay border on the top surface
  add(new THREE.BoxGeometry(5.94, 0.03, 5.94), gold, 0, PLINTH_TOP + 0.005, 0);
  add(new THREE.BoxGeometry(5.4, 0.035, 5.4), marble, 0, PLINTH_TOP + 0.01, 0);
  // welcoming front step on the +Z open side
  add(new THREE.BoxGeometry(3.4, 0.16, 0.7), marbleWarm, 0, 0.08, 4.05);

  // ====================================================================
  // 2. CARVED PILLARS  (6, hexagon; front +Z bay left open)
  // ====================================================================
  const PILLAR_R = 3.15;
  const angles = [0, 60, 120, 180, 240, 300].map((d) => (d * Math.PI) / 180);
  // reusable pillar part geometries
  const gBase = new THREE.BoxGeometry(0.72, 0.34, 0.72);
  const gBaseDisc = new THREE.CylinderGeometry(0.36, 0.4, 0.12, 8);
  const gShaft = new THREE.CylinderGeometry(0.24, 0.28, 2.6, 10);
  const gBand = new THREE.CylinderGeometry(0.29, 0.29, 0.08, 8);
  const gNeck = new THREE.CylinderGeometry(0.27, 0.24, 0.12, 8);
  const gBell = new THREE.CylinderGeometry(0.46, 0.26, 0.36, 8); // flared capital
  const gLotus = new THREE.CylinderGeometry(0.58, 0.46, 0.16, 8);
  const gAbacus = new THREE.BoxGeometry(0.6, 0.18, 0.6);

  const pillarTops = [];
  for (const a of angles) {
    const px = Math.cos(a) * PILLAR_R;
    const pz = Math.sin(a) * PILLAR_R;
    const p = new THREE.Group();
    p.position.set(px, PLINTH_TOP, pz);
    p.rotation.y = -a; // square parts face the centre
    add(gBase, marble, 0, 0.17, 0, p);
    add(gBaseDisc, gold, 0, 0.4, 0, p);
    add(gShaft, marble, 0, 1.76, 0, p);        // 0.46 -> 3.06
    add(gBand, gold, 0, 1.15, 0, p);
    add(gBand, gold, 0, 2.25, 0, p);
    add(gNeck, gold, 0, 3.12, 0, p);
    add(gBell, marbleWarm, 0, 3.36, 0, p);     // 3.18 -> 3.54
    add(gLotus, gold, 0, 3.62, 0, p);
    add(gAbacus, marble, 0, 3.79, 0, p);
    root.add(p);
    pillarTops.push(new THREE.Vector3(px, PLINTH_TOP + 3.88, pz));
  }

  // ====================================================================
  // 3. ARCHITRAVE + TIERED DOMED CANOPY
  // ====================================================================
  // hexagonal roof slab spanning the pillar tops
  add(new THREE.CylinderGeometry(3.95, 3.95, 0.5, 6), marble, 0, 4.5, 0);
  add(new THREE.CylinderGeometry(4.02, 4.02, 0.14, 6), gold, 0, 4.28, 0); // gold edge
  // two drum tiers stepping inward
  add(new THREE.CylinderGeometry(3.3, 3.7, 0.45, 12), marbleWarm, 0, 4.98, 0);
  add(new THREE.CylinderGeometry(3.35, 3.35, 0.06, 12), gold, 0, 5.22, 0);
  add(new THREE.CylinderGeometry(2.5, 3.2, 0.42, 12), marble, 0, 5.41, 0);

  // lotus-petal cusp ring at the dome base (scalloped silhouette)
  const gCusp = new THREE.ConeGeometry(0.24, 0.5, 6);
  const CUSP_N = 12, cuspR = 2.45;
  for (let i = 0; i < CUSP_N; i++) {
    const a = (i / CUSP_N) * Math.PI * 2;
    add(gCusp, gold, Math.cos(a) * cuspR, 5.72, Math.sin(a) * cuspR);
  }

  // the dome (top half-sphere)
  add(
    new THREE.SphereGeometry(1.95, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    marbleWarm, 0, 5.62, 0
  );
  // gold meridian ribs on the dome
  const gRib = new THREE.BoxGeometry(0.06, 1.95, 0.14);
  const RIB_N = 8;
  for (let i = 0; i < RIB_N; i++) {
    const a = (i / RIB_N) * Math.PI * 2;
    const rib = add(gRib, gold, 0, 0, 0);
    rib.position.set(Math.cos(a) * 1.02, 6.55, Math.sin(a) * 1.02);
    rib.rotation.y = -a;
    rib.rotation.z = 0.62; // lay ribs along the dome curve
  }
  // dome collar
  add(new THREE.CylinderGeometry(0.55, 1.7, 0.35, 12), marble, 0, 7.42, 0);

  // ---- KALASH finial ---------------------------------------------------
  add(new THREE.CylinderGeometry(0.34, 0.5, 0.16, 12), gold, 0, 7.62, 0);
  add(new THREE.SphereGeometry(0.3, 10, 8), gold, 0, 7.94, 0);         // pot
  add(new THREE.CylinderGeometry(0.1, 0.16, 0.18, 8), gold, 0, 8.2, 0);
  add(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8), goldBright, 0, 8.32, 0);
  add(new THREE.ConeGeometry(0.12, 0.34, 8), gold, 0, 8.55, 0);
  add(new THREE.SphereGeometry(0.08, 6, 4), goldBright, 0, 8.78, 0);   // glowing tip

  // ====================================================================
  // 4. CLOTH VALANCE  (burgundy + white, gold trim, scalloped hem)
  // ====================================================================
  add(
    new THREE.CylinderGeometry(3.62, 3.9, 0.55, 20, 1, true),
    burgundy, 0, 4.42, 0
  );
  add(
    new THREE.CylinderGeometry(3.92, 3.92, 0.12, 20, 1, true),
    gold, 0, 4.66, 0
  ); // top trim
  add(
    new THREE.CylinderGeometry(3.58, 3.62, 0.14, 20, 1, true),
    cloth, 0, 4.18, 0
  ); // cream lower band
  // scalloped hem: ring of small down-pointing cloth cusps with gold tips
  const gScal = new THREE.ConeGeometry(0.2, 0.34, 6);
  const gTip = new THREE.SphereGeometry(0.055, 5, 3);
  const SCAL_N = 16, scalR = 3.75;
  for (let i = 0; i < SCAL_N; i++) {
    const a = (i / SCAL_N) * Math.PI * 2;
    const sx = Math.cos(a) * scalR, sz = Math.sin(a) * scalR;
    const s = add(gScal, i % 2 ? cloth : burgundy, sx, 4.1, sz);
    s.rotation.x = Math.PI; // point the cusp downward
    add(gTip, gold, sx, 3.9, sz);
  }

  // ====================================================================
  // 5. MARIGOLD + JASMINE GARLANDS  (hung between the pillars)
  // ====================================================================
  const gFlower = new THREE.SphereGeometry(0.135, 5, 3);
  const hangGarland = (p0, p1, beads, sag) => {
    for (let i = 0; i <= beads; i++) {
      const t = i / beads;
      const x = p0.x + (p1.x - p0.x) * t;
      const z = p0.z + (p1.z - p0.z) * t;
      const y = p0.y + (p1.y - p0.y) * t - Math.sin(Math.PI * t) * sag;
      add(gFlower, i % 2 ? jasmine : marigold, x, y, z);
    }
  };
  // spans between adjacent pillars; skip the front bay (indices 1->2)
  for (let i = 0; i < angles.length; i++) {
    if (i === 1) continue; // front (+Z) bay stays open for the toran
    const a = pillarTops[i];
    const b = pillarTops[(i + 1) % angles.length];
    const a2 = new THREE.Vector3(a.x, a.y - 0.15, a.z);
    const b2 = new THREE.Vector3(b.x, b.y - 0.15, b.z);
    hangGarland(a2, b2, 7, 0.72);
  }

  // ====================================================================
  // 6. FRONT FLORAL TORAN  (across the +Z opening)
  // ====================================================================
  const t0 = pillarTops[1], t1 = pillarTops[2]; // the two front pillars
  const tA = new THREE.Vector3(t0.x, t0.y + 0.05, t0.z);
  const tB = new THREE.Vector3(t1.x, t1.y + 0.05, t1.z);
  hangGarland(tA, tB, 8, 0.55); // arched flower rope
  // hanging leaf/flower pendants beneath the toran
  const gPend = new THREE.ConeGeometry(0.11, 0.42, 6);
  const gPBall = new THREE.SphereGeometry(0.1, 5, 4);
  const PEND_N = 7;
  for (let i = 1; i < PEND_N; i++) {
    const t = i / PEND_N;
    const x = tA.x + (tB.x - tA.x) * t;
    const z = tA.z + (tB.z - tA.z) * t;
    const y = tA.y + (tB.y - tA.y) * t - Math.sin(Math.PI * t) * 0.55;
    const pend = add(gPend, i % 2 ? leaf : marigold, x, y - 0.32, z);
    pend.rotation.x = Math.PI;
    add(gPBall, i % 2 ? marigold : jasmine, x, y - 0.56, z);
  }

  // ====================================================================
  // 7. AGNI / FIRE VEDI  (glowing ember reads as flame via bloom)
  // ====================================================================
  const altar = new THREE.Group();
  altar.position.set(0, PLINTH_TOP, 0);
  add(new THREE.BoxGeometry(1.5, 0.14, 1.5), marbleWarm, 0, 0.07, 0, altar);
  add(new THREE.BoxGeometry(1.12, 0.42, 1.12), marble, 0, 0.35, 0, altar);
  add(new THREE.BoxGeometry(1.34, 0.1, 1.34), gold, 0, 0.61, 0, altar);
  add(new THREE.BoxGeometry(1.3, 0.06, 1.3), bowlDark, 0, 0.69, 0, altar);
  add(new THREE.CylinderGeometry(0.44, 0.4, 0.14, 12), bowlDark, 0, 0.73, 0, altar);
  // crossed offering logs
  const gLog = new THREE.CylinderGeometry(0.05, 0.05, 0.72, 6);
  const logY = 0.78;
  for (let i = 0; i < 4; i++) {
    const log = add(gLog, woodDark, 0, logY, 0, altar);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = (i / 4) * Math.PI;
  }
  // sacred flame — nested emissive cones + glow, no real light
  add(new THREE.ConeGeometry(0.3, 0.62, 8), ember, 0, 1.12, 0, altar);
  add(new THREE.ConeGeometry(0.19, 0.5, 8), flameMid, 0, 1.22, 0, altar);
  add(new THREE.ConeGeometry(0.1, 0.36, 8), flameCore, 0, 1.32, 0, altar);
  add(new THREE.SphereGeometry(0.22, 8, 6), ember, 0, 0.92, 0, altar);
  root.add(altar);

  return root;
}

```


## `src/wedding/arches.js`

```javascript
import * as THREE from "three";
import { PAL } from "./shared.js";

// ============================================================================
// arches.js — ceremonial gateway, floral arch, and carved lamp-pillar
// Ancient royal Rajput/Mughal aesthetic. All static THREE.Group builders.
// Each asset rests on ground (y=0), fronts +Z, < 1200 tris.
// ============================================================================

// ---- Shared materials (created once per module load, reused across builders)
const matMarble = new THREE.MeshStandardMaterial({
  color: PAL.white, roughness: 0.55, metalness: 0.0,
});
const matIvory = new THREE.MeshStandardMaterial({
  color: PAL.ivory, roughness: 0.6, metalness: 0.0,
});
const matGold = new THREE.MeshStandardMaterial({
  color: PAL.gold, roughness: 0.32, metalness: 0.9,
  emissive: PAL.brass, emissiveIntensity: 0.12,
});
const matBrass = new THREE.MeshStandardMaterial({
  color: PAL.brass, roughness: 0.4, metalness: 0.85,
});
const matBurgundy = new THREE.MeshStandardMaterial({
  color: PAL.burgundy, roughness: 0.8, metalness: 0.0,
});
const matMarigold = new THREE.MeshStandardMaterial({
  color: PAL.marigold, roughness: 0.75, metalness: 0.0,
  emissive: PAL.marigoldDeep, emissiveIntensity: 0.18,
});
const matJasmine = new THREE.MeshStandardMaterial({
  color: PAL.jasmine, roughness: 0.7, metalness: 0.0,
});
const matRose = new THREE.MeshStandardMaterial({
  color: PAL.rose, roughness: 0.75, metalness: 0.0,
});
const matLeaf = new THREE.MeshStandardMaterial({
  color: PAL.leaf, roughness: 0.8, metalness: 0.0,
});
const matFlame = new THREE.MeshStandardMaterial({
  color: PAL.goldBright, roughness: 0.4, metalness: 0.0,
  emissive: PAL.emberGlow, emissiveIntensity: 1.4,
});

// low-poly shared geometries. Flower blobs use a 20-tri icosahedron so the
// dense garlands stay well within the triangle budget.
const GEO = {
  blob: new THREE.IcosahedronGeometry(1, 0),
};

// small helper: a faceted flower cluster (single 20-tri blob, colored)
function flower(mat, r) {
  const m = new THREE.Mesh(GEO.blob, mat);
  m.scale.setScalar(r);
  return m;
}

// ============================================================================
// createToranGate — grand cusped gateway spanning the wide path
//   ~4.5 tall, inner clearance ~4.5 wide. Front faces +Z.
// ============================================================================
export function createToranGate() {
  const g = new THREE.Group();

  const halfSpan = 2.7;   // post centers at +-2.7 -> inner clearance ~4.5
  const postH = 2.6;
  const postW = 0.42;

  // ---- Two carved posts (white marble shaft + gold banding + base + capital)
  const shaftGeo = new THREE.BoxGeometry(postW, postH, postW);
  const baseGeo = new THREE.BoxGeometry(postW * 1.7, 0.5, postW * 1.7);
  const plinthGeo = new THREE.CylinderGeometry(postW * 0.9, postW * 1.0, 0.28, 8);
  const bandGeo = new THREE.BoxGeometry(postW * 1.12, 0.14, postW * 1.12);
  const capGeo = new THREE.BoxGeometry(postW * 1.5, 0.32, postW * 1.5);

  for (let s = -1; s <= 1; s += 2) {
    const px = s * halfSpan;

    const base = new THREE.Mesh(baseGeo, matGold);
    base.position.set(px, 0.25, 0);
    g.add(base);

    const plinth = new THREE.Mesh(plinthGeo, matIvory);
    plinth.position.set(px, 0.5 + 0.14, 0);
    g.add(plinth);

    const shaft = new THREE.Mesh(shaftGeo, matMarble);
    shaft.position.set(px, 0.64 + postH / 2, 0);
    g.add(shaft);

    // two gold bands on the shaft
    for (const by of [1.4, 2.9]) {
      const band = new THREE.Mesh(bandGeo, matGold);
      band.position.set(px, by, 0);
      g.add(band);
    }

    // gold capital block
    const cap = new THREE.Mesh(capGeo, matGold);
    cap.position.set(px, 0.64 + postH + 0.16, 0);
    g.add(cap);

    // small kalash finial on each post
    const finBulb = flower(matGold, 0.16);
    finBulb.scale.y = 0.2;
    finBulb.position.set(px, 0.64 + postH + 0.34, 0);
    g.add(finBulb);
    const finTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 8), matGold);
    finTip.position.set(px, 0.64 + postH + 0.5, 0);
    g.add(finTip);
  }

  // ---- Cusped (multi-lobed) arch spanning the posts
  // Build lobes as small torus segments hung along a shallow arc between caps.
  const archBaseY = 0.64 + postH + 0.32;   // just above the capitals
  const lobeGeo = new THREE.TorusGeometry(0.34, 0.07, 4, 6, Math.PI);
  const nLobes = 7;
  const arcRise = 0.7;
  for (let i = 0; i < nLobes; i++) {
    const f = i / (nLobes - 1);            // 0..1
    const x = (f - 0.5) * 2 * halfSpan;
    // shallow arch: raise the middle
    const y = archBaseY + Math.sin(f * Math.PI) * arcRise;
    const lobe = new THREE.Mesh(lobeGeo, matGold);
    lobe.position.set(x, y, 0);
    // tilt lobes to follow the arc tangent, cusps pointing downward
    lobe.rotation.z = Math.PI; // open side downward
    g.add(lobe);
  }
  // solid lintel beam behind the lobes to read as a header bar
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(halfSpan * 2 + postW, 0.24, 0.24), matMarble
  );
  lintel.position.set(0, archBaseY + arcRise + 0.28, 0);
  g.add(lintel);
  // gold trim on the lintel
  const lintelTrim = new THREE.Mesh(
    new THREE.BoxGeometry(halfSpan * 2 + postW, 0.08, 0.28), matGold
  );
  lintelTrim.position.set(0, archBaseY + arcRise + 0.42, 0);
  g.add(lintelTrim);

  // ---- Hanging marigold + jasmine garland valance under the arch
  const nDrop = 9;
  for (let i = 0; i < nDrop; i++) {
    const f = i / (nDrop - 1);
    const x = (f - 0.5) * 2 * halfSpan;
    // valance: garlands hang lowest at the sides, shortest under the peak
    const swag = Math.sin(f * Math.PI);           // 0 at ends, 1 middle
    const topY = archBaseY + swag * arcRise;      // follows arch underside
    const dropLen = 0.5 + (1 - swag) * 0.7;       // longer near the posts
    const beads = 3;
    for (let b = 0; b < beads; b++) {
      const by = topY - (b + 1) * (dropLen / beads);
      const alt = (i + b) % 3;
      const mat = alt === 0 ? matJasmine : (alt === 1 ? matMarigold : matMarigold);
      const bead = flower(mat, 0.09 + (b === beads - 1 ? 0.02 : 0));
      bead.position.set(x, by, 0.05);
      g.add(bead);
    }
  }

  // ---- A few small burgundy pennants along the lintel
  const pennGeo = new THREE.ConeGeometry(0.14, 0.4, 3);
  const nPenn = 5;
  for (let i = 0; i < nPenn; i++) {
    const f = i / (nPenn - 1);
    const x = (f - 0.5) * (halfSpan * 1.7);
    const penn = new THREE.Mesh(pennGeo, matBurgundy);
    penn.position.set(x, archBaseY + arcRise + 0.04, 0.16);
    penn.rotation.x = Math.PI;      // point down
    penn.rotation.z = Math.PI / 4;  // diamond -> triangle-ish flag
    g.add(penn);
  }

  return g;
}

// ============================================================================
// createFloralArch — light free-standing semicircular floral arch, ~3.5 tall
//   Torus half wrapped in marigold/rose flower clusters. Front faces +Z.
// ============================================================================
export function createFloralArch() {
  const g = new THREE.Group();

  const R = 1.5;         // arch radius -> span ~3.0, top ~3.5 with legs
  const legH = 1.8;      // straight legs before the semicircle starts
  const tube = 0.09;

  // ---- Vine skeleton: two vertical legs + a semicircular top (thin torus)
  const legGeo = new THREE.CylinderGeometry(tube, tube, legH, 8);
  for (let s = -1; s <= 1; s += 2) {
    const leg = new THREE.Mesh(legGeo, matLeaf);
    leg.position.set(s * R, legH / 2, 0);
    g.add(leg);
  }
  const topGeo = new THREE.TorusGeometry(R, tube, 5, 16, Math.PI);
  const top = new THREE.Mesh(topGeo, matLeaf);
  top.position.set(0, legH, 0);   // half torus opens downward onto legs
  g.add(top);

  // ---- Flower clusters wrapping the whole skeleton
  const flowerMats = [matMarigold, matRose, matJasmine, matMarigold];
  function cluster(x, y) {
    const n = 2;
    for (let k = 0; k < n; k++) {
      const mat = flowerMats[(Math.random() * flowerMats.length) | 0];
      const fl = flower(mat, 0.12 + Math.random() * 0.07);
      fl.position.set(
        x + (Math.random() - 0.5) * 0.22,
        y + (Math.random() - 0.5) * 0.22,
        (Math.random() - 0.5) * 0.22
      );
      g.add(fl);
    }
  }
  // wrap the legs
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i <= 4; i++) {
      cluster(s * R, 0.25 + (legH - 0.1) * (i / 4));
    }
  }
  // wrap the semicircle
  const arcN = 9;
  for (let i = 0; i <= arcN; i++) {
    const a = (i / arcN) * Math.PI;     // 0..PI
    const x = Math.cos(a) * R;
    const y = legH + Math.sin(a) * R;
    cluster(x, y);
  }

  return g;
}

// ============================================================================
// createCarvedPillar — standalone ornate lamp-pillar to line the path, ~3 tall
//   White marble shaft, gold lotus capital, glowing brass lamp bowl + flame.
// ============================================================================
export function createCarvedPillar() {
  const g = new THREE.Group();

  // ---- Stepped square base
  const base0 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.7), matGold);
  base0.position.y = 0.11;
  g.add(base0);
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.18, 0.54), matMarble);
  base1.position.y = 0.22 + 0.09;
  g.add(base1);

  // ---- Fluted marble shaft (octagonal cylinder)
  const shaftH = 1.9;
  const shaftY = 0.4 + shaftH / 2;
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, shaftH, 8), matMarble
  );
  shaft.position.y = shaftY;
  g.add(shaft);

  // gold collar rings top & bottom of shaft
  const ringGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.09, 8);
  const ringLow = new THREE.Mesh(ringGeo, matGold);
  ringLow.position.y = 0.46;
  g.add(ringLow);
  const ringHigh = new THREE.Mesh(ringGeo, matGold);
  ringHigh.position.y = 0.4 + shaftH - 0.06;
  g.add(ringHigh);

  // ---- Gold lotus capital: ring of petals opening upward
  const capY = 0.4 + shaftH + 0.02;
  const petalGeo = new THREE.ConeGeometry(0.12, 0.34, 4);
  const nPetal = 8;
  for (let i = 0; i < nPetal; i++) {
    const a = (i / nPetal) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeo, matGold);
    petal.position.set(Math.cos(a) * 0.19, capY + 0.1, Math.sin(a) * 0.19);
    // splay outward
    petal.rotation.z = Math.cos(a) * 0.6;
    petal.rotation.x = -Math.sin(a) * 0.6;
    g.add(petal);
  }
  // inner petal ring (slightly upright)
  for (let i = 0; i < nPetal; i++) {
    const a = (i / nPetal) * Math.PI * 2 + Math.PI / nPetal;
    const petal = new THREE.Mesh(petalGeo, matGold);
    petal.scale.setScalar(0.8);
    petal.position.set(Math.cos(a) * 0.1, capY + 0.16, Math.sin(a) * 0.1);
    petal.rotation.z = Math.cos(a) * 0.3;
    petal.rotation.x = -Math.sin(a) * 0.3;
    g.add(petal);
  }

  // ---- Glowing brass lamp bowl (diya) on top
  const bowlY = capY + 0.34;
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.14, 0.16, 12), matBrass
  );
  bowl.position.y = bowlY;
  g.add(bowl);
  // gold rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.03, 6, 14), matGold);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = bowlY + 0.08;
  g.add(rim);

  // ---- Emissive warm flame (glows via bloom)
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.32, 8), matFlame
  );
  flame.position.y = bowlY + 0.24;
  g.add(flame);
  // small bright core
  const core = flower(matFlame, 0.07);
  core.position.y = bowlY + 0.14;
  g.add(core);

  return g;
}
```


## `src/wedding/horseGroom.js`

```javascript
import * as THREE from "three";
import { PAL } from "./shared.js";

// createHorseGroom() -> { group, update }
// A prominent Indian groom (dulha) astride a richly caparisoned white baraat
// horse, riding to his wedding. Faces +Z, rests on ground (y~0). Horse ~2.5
// tall at the head. Gentle idle only (no locomotion). Triangle budget < 2600.
export function createHorseGroom() {
  const group = new THREE.Group();

  // ---- shared materials -------------------------------------------------
  const matHorse = new THREE.MeshStandardMaterial({ color: PAL.ivory, roughness: 0.62, metalness: 0.0 });
  const matHoof  = new THREE.MeshStandardMaterial({ color: PAL.bronze, roughness: 0.55, metalness: 0.2 });
  const matBurg  = new THREE.MeshStandardMaterial({ color: PAL.burgundy, roughness: 0.82, metalness: 0.0 });
  const matBurgD = new THREE.MeshStandardMaterial({ color: PAL.burgundyDeep, roughness: 0.85, metalness: 0.0 });
  const matGold  = new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.34, metalness: 0.9,
                    emissive: PAL.brass, emissiveIntensity: 0.28 });
  const matGoldB = new THREE.MeshStandardMaterial({ color: PAL.goldBright, roughness: 0.3, metalness: 0.85,
                    emissive: PAL.goldBright, emissiveIntensity: 0.75 });
  const matSaff  = new THREE.MeshStandardMaterial({ color: PAL.saffron, roughness: 0.6, metalness: 0.0,
                    emissive: PAL.marigoldDeep, emissiveIntensity: 0.4 });
  const matCream = new THREE.MeshStandardMaterial({ color: PAL.cream, roughness: 0.7, metalness: 0.06 });
  const matIvory = new THREE.MeshStandardMaterial({ color: PAL.ivory, roughness: 0.68, metalness: 0.05 });
  const matSkin  = new THREE.MeshStandardMaterial({ color: PAL.skin, roughness: 0.75, metalness: 0.0 });
  const matSkinD = new THREE.MeshStandardMaterial({ color: PAL.skinDark, roughness: 0.78, metalness: 0.0 });
  const matEye   = new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.4, metalness: 0.0 });
  const matJas   = new THREE.MeshStandardMaterial({ color: PAL.jasmine, roughness: 0.5, metalness: 0.0,
                    emissive: PAL.jasmine, emissiveIntensity: 0.35 });
  const matMari  = new THREE.MeshStandardMaterial({ color: PAL.marigold, roughness: 0.6, metalness: 0.0,
                    emissive: PAL.marigoldDeep, emissiveIntensity: 0.3 });
  const matLeaf  = new THREE.MeshStandardMaterial({ color: PAL.leaf, roughness: 0.8, metalness: 0.0 });
  const matRein  = new THREE.MeshStandardMaterial({ color: PAL.maroon, roughness: 0.7, metalness: 0.1 });

  const mesh = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  };

  // =======================================================================
  // HORSE BODY
  // =======================================================================
  const torso = mesh(new THREE.BoxGeometry(0.64, 0.8, 1.58), matHorse, 0, 1.3, 0);
  group.add(torso);
  group.add(mesh(new THREE.BoxGeometry(0.58, 0.62, 0.36), matHorse, 0, 1.2, 0.84)); // chest
  group.add(mesh(new THREE.SphereGeometry(0.4, 7, 5), matHorse, 0, 1.36, -0.74));    // rump

  // Legs + hooves + gold anklets
  const legGeo    = new THREE.CylinderGeometry(0.1, 0.07, 1.02, 6);
  const hoofGeo   = new THREE.BoxGeometry(0.16, 0.12, 0.2);
  const ankletGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.07, 6);
  const legPos = [[0.23, 0.56], [-0.23, 0.56], [0.25, -0.56], [-0.25, -0.56]];
  for (const [lx, lz] of legPos) {
    group.add(mesh(legGeo, matHorse, lx, 0.55, lz));
    group.add(mesh(hoofGeo, matHoof, lx, 0.06, lz));
    group.add(mesh(ankletGeo, matGold, lx, 0.32, lz));
  }

  // Tail (swaying group)
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 1.44, -0.9);
  const tail = mesh(new THREE.CylinderGeometry(0.12, 0.02, 1.0, 6), matHorse, 0, -0.44, -0.14);
  tail.rotation.x = -0.34;
  tailGroup.add(tail);
  group.add(tailGroup);

  // =======================================================================
  // HEAD + NECK (bobbing group)
  // =======================================================================
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.52, 0.72);
  group.add(headGroup);

  const neck = mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.74, 6), matHorse, 0, 0.3, 0.2);
  neck.rotation.x = 0.62;
  headGroup.add(neck);

  const head = mesh(new THREE.BoxGeometry(0.27, 0.31, 0.44), matHorse, 0, 0.64, 0.53);
  head.rotation.x = 0.28;
  headGroup.add(head);
  const muzzle = mesh(new THREE.BoxGeometry(0.2, 0.19, 0.24), matHorse, 0, 0.52, 0.8);
  muzzle.rotation.x = 0.28;
  headGroup.add(muzzle);

  // Eyes
  const hEyeGeo = new THREE.IcosahedronGeometry(0.035, 0);
  headGroup.add(mesh(hEyeGeo, matEye, 0.11, 0.68, 0.62));
  headGroup.add(mesh(hEyeGeo, matEye, -0.11, 0.68, 0.62));

  // Ears
  const earGeo = new THREE.ConeGeometry(0.06, 0.19, 4);
  const earL = mesh(earGeo, matHorse, 0.09, 0.84, 0.42); earL.rotation.x = -0.15;
  const earR = mesh(earGeo, matHorse, -0.09, 0.84, 0.42); earR.rotation.x = -0.15;
  headGroup.add(earL, earR);

  // Golden headplate + browband + cheek straps (bridle)
  const headplate = mesh(new THREE.BoxGeometry(0.2, 0.24, 0.05), matGold, 0, 0.7, 0.67);
  headplate.rotation.x = 0.28;
  headGroup.add(headplate);
  headGroup.add(mesh(new THREE.BoxGeometry(0.29, 0.05, 0.05), matGold, 0, 0.6, 0.67)); // browband
  const cheekL = mesh(new THREE.BoxGeometry(0.03, 0.34, 0.03), matGold, 0.14, 0.56, 0.66); cheekL.rotation.x = 0.28;
  const cheekR = mesh(new THREE.BoxGeometry(0.03, 0.34, 0.03), matGold, -0.14, 0.56, 0.66); cheekR.rotation.x = 0.28;
  headGroup.add(cheekL, cheekR);
  // Bit / noseband ring
  const noseband = mesh(new THREE.TorusGeometry(0.11, 0.02, 3, 6), matGold, 0, 0.5, 0.78);
  noseband.rotation.x = Math.PI / 2 + 0.28;
  headGroup.add(noseband);

  // Saffron / gold PLUME crest between the ears
  headGroup.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), matGold, 0, 0.86, 0.36)); // ferrule
  headGroup.add(mesh(new THREE.ConeGeometry(0.1, 0.42, 6), matSaff, 0, 1.06, 0.34));
  headGroup.add(mesh(new THREE.ConeGeometry(0.05, 0.22, 6), matGoldB, 0, 1.2, 0.34)); // glowing tip

  // =======================================================================
  // CAPARISON (jhool) — burgundy & gold drape over back and flanks
  // =======================================================================
  const sideGeo = new THREE.BoxGeometry(0.05, 0.6, 1.24);
  group.add(mesh(sideGeo, matBurg, 0.36, 1.12, -0.05));
  group.add(mesh(sideGeo, matBurg, -0.36, 1.12, -0.05));
  const hemGeo = new THREE.BoxGeometry(0.06, 0.09, 1.28);
  group.add(mesh(hemGeo, matGold, 0.36, 0.83, -0.05));
  group.add(mesh(hemGeo, matGold, -0.36, 0.83, -0.05));
  // gold medallions on the flanks
  const medGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 6);
  for (const mz of [0.32, -0.36]) {
    const ml = mesh(medGeo, matGold, 0.385, 1.16, mz); ml.rotation.z = Math.PI / 2;
    const mr = mesh(medGeo, matGold, -0.385, 1.16, mz); mr.rotation.z = Math.PI / 2;
    group.add(ml, mr);
  }
  // gold tassels hanging along each flank hem
  const tasselGeo = new THREE.ConeGeometry(0.035, 0.16, 4);
  for (const tz of [0.4, 0.0, -0.42]) {
    const tl = mesh(tasselGeo, matGoldB, 0.37, 0.72, tz); tl.rotation.x = Math.PI;
    const tr = mesh(tasselGeo, matGoldB, -0.37, 0.72, tz); tr.rotation.x = Math.PI;
    group.add(tl, tr);
  }
  // saddlecloth over the back (groom sits on this)
  group.add(mesh(new THREE.BoxGeometry(0.72, 0.08, 1.22), matBurgD, 0, 1.68, -0.05));
  group.add(mesh(new THREE.BoxGeometry(0.76, 0.05, 0.12), matGold, 0, 1.7, 0.56));
  group.add(mesh(new THREE.BoxGeometry(0.76, 0.05, 0.12), matGold, 0, 1.7, -0.66));

  // =======================================================================
  // GROOM (seated astride) — gentle settle group
  // =======================================================================
  const groom = new THREE.Group();
  groom.position.set(0, 0, 0.06);
  group.add(groom);

  // Seat + churidar hips
  groom.add(mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.22, 8), matIvory, 0, 1.86, 0));
  // Sherwani torso (tapered, prominent)
  groom.add(mesh(new THREE.CylinderGeometry(0.2, 0.27, 0.72, 8), matIvory, 0, 2.3, 0.02));
  // Shoulders / chest bulk
  groom.add(mesh(new THREE.SphereGeometry(0.24, 6, 5), matIvory, 0, 2.6, 0.02));
  // Gold placket line + burgundy collar accents
  groom.add(mesh(new THREE.BoxGeometry(0.035, 0.72, 0.035), matGold, 0, 2.3, 0.26));
  const collarL = mesh(new THREE.BoxGeometry(0.05, 0.22, 0.04), matBurg, 0.09, 2.56, 0.22); collarL.rotation.z = 0.35;
  const collarR = mesh(new THREE.BoxGeometry(0.05, 0.22, 0.04), matBurg, -0.09, 2.56, 0.22); collarR.rotation.z = -0.35;
  groom.add(collarL, collarR);
  // Gold buttons down the front (glowing)
  const btnGeo = new THREE.IcosahedronGeometry(0.028, 0);
  for (let i = 0; i < 5; i++) groom.add(mesh(btnGeo, matGoldB, 0, 2.56 - i * 0.13, 0.27));

  // Churidar legs draped down each flank, into stirrups
  const gLegGeo = new THREE.CylinderGeometry(0.1, 0.075, 0.66, 6);
  const legLo = mesh(gLegGeo, matCream, 0.3, 1.64, 0.08); legLo.rotation.x = 0.55; legLo.rotation.z = 0.14;
  const legRo = mesh(gLegGeo, matCream, -0.3, 1.64, 0.08); legRo.rotation.x = 0.55; legRo.rotation.z = -0.14;
  groom.add(legLo, legRo);
  // Mojari (curled-toe shoes) in stirrups
  const mojGeo = new THREE.BoxGeometry(0.11, 0.09, 0.18);
  const toeGeo = new THREE.ConeGeometry(0.045, 0.1, 4);
  for (const fx of [0.32, -0.32]) {
    groom.add(mesh(mojGeo, matBurgD, fx, 1.36, 0.28));
    const toe = mesh(toeGeo, matGold, fx, 1.4, 0.4); toe.rotation.x = -1.3;
    groom.add(toe);
    // gold stirrup ring
    const stir = mesh(new THREE.TorusGeometry(0.09, 0.022, 4, 6), matGold, fx, 1.31, 0.27);
    groom.add(stir);
    groom.add(mesh(new THREE.BoxGeometry(0.02, 0.28, 0.02), matGold, fx, 1.5, 0.24)); // stirrup leather
  }

  // Arms — right forward holding reins, left resting on thigh
  const armGeo = new THREE.CylinderGeometry(0.062, 0.055, 0.52, 6);
  const armR = mesh(armGeo, matIvory, 0.24, 2.34, 0.16); armR.rotation.x = 0.75; armR.rotation.z = 0.28;
  const armL = mesh(armGeo, matIvory, -0.25, 2.3, 0.04); armL.rotation.x = 0.35; armL.rotation.z = -0.28;
  groom.add(armR, armL);
  const handGeo = new THREE.IcosahedronGeometry(0.06, 0);
  const handR = mesh(handGeo, matSkin, 0.32, 2.12, 0.34); // rein hand
  const handL = mesh(handGeo, matSkin, -0.34, 2.1, 0.12);
  groom.add(handR, handL);

  // Neck + head (warm skin, subtle face)
  groom.add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.11, 6), matSkin, 0, 2.72, 0.02));
  const gHead = mesh(new THREE.IcosahedronGeometry(0.17, 1), matSkin, 0, 2.88, 0.03);
  groom.add(gHead);
  // subtle face — eyes + nose + moustache
  groom.add(mesh(new THREE.IcosahedronGeometry(0.024, 0), matEye, 0.06, 2.9, 0.18));
  groom.add(mesh(new THREE.IcosahedronGeometry(0.024, 0), matEye, -0.06, 2.9, 0.18));
  groom.add(mesh(new THREE.ConeGeometry(0.03, 0.06, 4), matSkinD, 0, 2.85, 0.2)); // nose
  groom.add(mesh(new THREE.BoxGeometry(0.11, 0.02, 0.03), matSkinD, 0, 2.81, 0.18)); // moustache

  // TURBAN (safa) — burgundy & gold stacked wraps
  groom.add(mesh(new THREE.SphereGeometry(0.21, 8, 6), matBurg, 0, 3.02, 0.0));
  const wrap = mesh(new THREE.TorusGeometry(0.19, 0.055, 6, 9), matGold, 0, 2.96, 0.0);
  wrap.rotation.x = Math.PI / 2;
  groom.add(wrap);
  groom.add(mesh(new THREE.SphereGeometry(0.12, 5, 4), matBurgD, 0.06, 3.14, -0.04)); // top knot fold
  // Kalgi brooch (glowing) + upright plume at the front
  groom.add(mesh(new THREE.IcosahedronGeometry(0.055, 0), matGoldB, 0, 3.04, 0.19));
  groom.add(mesh(new THREE.ConeGeometry(0.035, 0.2, 6), matGoldB, 0, 3.24, 0.15));

  // SEHRA — hanging jasmine/flower strands partly veiling the face
  groom.add(mesh(new THREE.BoxGeometry(0.34, 0.025, 0.025), matGold, 0, 2.94, 0.19)); // rail
  const strandGeo = new THREE.BoxGeometry(0.016, 0.28, 0.016);
  const beadGeo = new THREE.SphereGeometry(0.02, 4, 3);
  for (let i = 0; i < 8; i++) {
    const sx = -0.14 + i * 0.04;
    const zoff = 0.19 - Math.abs(i - 3.5) * 0.006;
    groom.add(mesh(strandGeo, matJas, sx, 2.78, zoff));
    groom.add(mesh(beadGeo, matMari, sx, 2.64, zoff)); // marigold bead tip
  }

  // VARMALA — flower garland draped around the neck/chest
  const varmala = mesh(new THREE.TorusGeometry(0.2, 0.05, 5, 10), matMari, 0, 2.5, 0.08);
  varmala.rotation.x = 1.35;
  varmala.scale.set(1.0, 1.25, 1.0);
  groom.add(varmala);
  // draping front loops
  const loopGeo = new THREE.TorusGeometry(0.09, 0.045, 4, 6, Math.PI);
  const loopL = mesh(loopGeo, matMari, 0.09, 2.28, 0.24); loopL.rotation.z = 0.2;
  const loopR = mesh(loopGeo, matMari, -0.09, 2.28, 0.24); loopR.rotation.z = -0.2;
  groom.add(loopL, loopR);
  // a few leaf accents on the garland
  groom.add(mesh(new THREE.SphereGeometry(0.03, 4, 3), matLeaf, 0.2, 2.5, 0.12));
  groom.add(mesh(new THREE.SphereGeometry(0.03, 4, 3), matLeaf, -0.2, 2.5, 0.12));

  // SWORD (sheathed) at the left side
  const swordGrp = new THREE.Group();
  swordGrp.position.set(-0.26, 2.0, 0.02);
  swordGrp.rotation.z = 0.5;
  swordGrp.rotation.x = -0.15;
  const scab = mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.62, 6), matBurgD, 0, -0.28, 0);
  swordGrp.add(scab);
  swordGrp.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.05, 6), matGold, 0, 0.02, 0)); // throat
  swordGrp.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), matGold, 0, -0.55, 0));  // chape
  swordGrp.add(mesh(new THREE.BoxGeometry(0.14, 0.03, 0.03), matGoldB, 0, 0.08, 0));          // guard
  swordGrp.add(mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.12, 6), matSkinD, 0, 0.16, 0)); // grip
  swordGrp.add(mesh(new THREE.IcosahedronGeometry(0.03, 0), matGoldB, 0, 0.23, 0));           // pommel
  groom.add(swordGrp);

  // REINS — from the bit up to the groom's rein hand (added to main group)
  const reinGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.0, 4);
  const reinL = mesh(reinGeo, matRein, 0.12, 1.75, 0.66); reinL.rotation.x = -0.9;
  const reinR = mesh(reinGeo, matRein, -0.0, 1.78, 0.62); reinR.rotation.x = -0.78;
  group.add(reinL, reinR);

  // =======================================================================
  // ANIMATION — gentle idle only (no locomotion)
  // =======================================================================
  const update = (t) => {
    // slow head bob (breathing head)
    headGroup.rotation.x = Math.sin(t * 0.9) * 0.05;
    headGroup.position.y = 1.52 + Math.sin(t * 0.9) * 0.01;
    // tail sway
    tailGroup.rotation.z = Math.sin(t * 0.8 + 0.5) * 0.15;
    tailGroup.rotation.x = Math.sin(t * 0.6) * 0.05;
    // subtle breathing on the torso
    const b = 1 + Math.sin(t * 1.4) * 0.016;
    torso.scale.set(b, 1, b);
    // groom settles gently with the horse's breath
    groom.rotation.x = Math.sin(t * 1.4 + 0.3) * 0.013;
    groom.position.y = Math.sin(t * 1.4) * 0.009;
    // sehra + garland shimmer via tiny sway
    groom.rotation.z = Math.sin(t * 0.7) * 0.006;
    // plume tip flicker on the safa
    swordGrp.rotation.z = 0.5 + Math.sin(t * 1.1) * 0.02;
  };

  return { group, update };
}
```


## `src/wedding/bride.js`

```javascript
import * as THREE from "three";
import { PAL } from "./shared.js";

// createBride() -> { group, update }
// A DETAILED, PROMINENT royal Indian bride: a heavy burgundy-and-gold layered
// bridal lehenga (flared skirt with several gold hem bands + gold border), an
// ornate fitted choli, and a dupatta draped over the head and one shoulder.
// Abundant gold jewelry - maang tikka, nath nose-ring, layered necklaces, jhumka
// earrings, stacked bangles, a waist chain - a braided bun with a gold ornament,
// red bindi and subtle features. She holds a fresh marigold jaimala (varmala
// garland) in front. ~1.75 m tall, faces +Z. Triangle budget < 1800 (~1785).
export function createBride() {
  const group = new THREE.Group();
  // Inner pivot carries the whole figure so main.js keeps control of the
  // returned group's world placement; the idle sway animates this pivot only.
  const body = new THREE.Group();
  group.add(body);

  // ---- shared materials -------------------------------------------------
  const clothBurgundy = new THREE.MeshStandardMaterial({
    color: PAL.burgundy, roughness: 0.82, metalness: 0.04,
  });
  const clothMaroon = new THREE.MeshStandardMaterial({
    color: PAL.maroon, roughness: 0.85, metalness: 0.04,
  });
  const clothCrimson = new THREE.MeshStandardMaterial({
    color: PAL.crimson, roughness: 0.8, metalness: 0.04,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: PAL.gold, metalness: 0.92, roughness: 0.32,
    emissive: PAL.brass, emissiveIntensity: 0.35,
  });
  const goldBright = new THREE.MeshStandardMaterial({
    color: PAL.goldBright, metalness: 0.85, roughness: 0.28,
    emissive: PAL.goldBright, emissiveIntensity: 0.6,
  });
  const veilMat = new THREE.MeshStandardMaterial({
    color: PAL.crimson, roughness: 0.68, metalness: 0.05,
    emissive: PAL.maroon, emissiveIntensity: 0.12, side: THREE.DoubleSide,
  });
  const skin = new THREE.MeshStandardMaterial({
    color: PAL.skin, roughness: 0.64, metalness: 0.0,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x160f07, roughness: 0.5, metalness: 0.06,
  });

  const add = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    body.add(m);
    return m;
  };

  // ---- lehenga skirt (layered flared cone) ------------------------------
  // waist at y~1.05, hem near the ground.
  const skirt = add(
    new THREE.CylinderGeometry(0.18, 0.60, 1.03, 18, 1, true),
    clothBurgundy, 0, 0.535, 0
  );
  skirt.rotation.y = Math.PI / 20;
  // lower ruffle tier for a heavy layered silhouette
  const ruffle = add(
    new THREE.CylinderGeometry(0.42, 0.635, 0.34, 18, 1, true),
    clothMaroon, 0, 0.19, 0
  );
  // close the hem so you can't see through from below
  const hemDisc = add(new THREE.CircleGeometry(0.635, 20), clothMaroon, 0, 0.02, 0);
  hemDisc.rotation.x = -Math.PI / 2;
  // broad gold border along the very bottom hem
  add(new THREE.CylinderGeometry(0.64, 0.66, 0.11, 18, 1, true), gold, 0, 0.075, 0);
  // gold zari band on the ruffle
  add(new THREE.CylinderGeometry(0.628, 0.645, 0.05, 16, 1, true), goldBright, 0, 0.35, 0);
  // mid-skirt decorative gold bands
  add(new THREE.CylinderGeometry(0.45, 0.465, 0.05, 16, 1, true), gold, 0, 0.55, 0);
  add(new THREE.CylinderGeometry(0.31, 0.32, 0.045, 16, 1, true), goldBright, 0, 0.78, 0);
  // vertical gold front border panel (kali)
  const frontBorder = add(new THREE.BoxGeometry(0.05, 0.98, 0.02), gold, 0, 0.54, 0.44);
  frontBorder.rotation.x = -0.12;

  // ---- choli (ornate fitted top) ---------------------------------------
  add(new THREE.CylinderGeometry(0.145, 0.19, 0.37, 14, 1, true), clothCrimson, 0, 1.235, 0);
  // gold embroidered waistband at the join
  add(new THREE.CylinderGeometry(0.192, 0.196, 0.06, 16, 1, true), gold, 0, 1.055, 0);
  // gold neckline trim
  add(new THREE.CylinderGeometry(0.135, 0.155, 0.05, 14, 1, true), goldBright, 0, 1.40, 0);

  // ---- neck & head ------------------------------------------------------
  add(new THREE.CylinderGeometry(0.05, 0.055, 0.10, 8), skin, 0, 1.46, 0.005);
  const head = add(new THREE.SphereGeometry(0.115, 11, 7), skin, 0, 1.615, 0.012);
  head.scale.set(0.94, 1.05, 0.98);

  // hair: crown cap over top/back
  const hairCap = add(
    new THREE.SphereGeometry(0.128, 11, 6, 0, Math.PI * 2, 0, Math.PI * 0.6),
    hairMat, 0, 1.625, -0.014
  );
  hairCap.scale.set(1.0, 1.02, 1.03);
  // side hair framing the face
  add(new THREE.SphereGeometry(0.045, 6, 3), hairMat, -0.095, 1.575, -0.02);
  add(new THREE.SphereGeometry(0.045, 6, 3), hairMat, 0.095, 1.575, -0.02);
  // low bun at the nape
  const bun = add(new THREE.SphereGeometry(0.07, 8, 5), hairMat, 0, 1.55, -0.125);
  bun.scale.set(1.0, 0.9, 0.85);
  // braid trailing from the bun
  const braid = add(new THREE.CylinderGeometry(0.032, 0.014, 0.30, 8, 1, true), hairMat, 0, 1.36, -0.125);
  braid.rotation.x = -0.12;
  // gold ornament on the bun
  const bunGold = add(new THREE.TorusGeometry(0.055, 0.008, 4, 8), goldBright, 0, 1.55, -0.115);
  bunGold.rotation.x = Math.PI / 2.4;

  // ---- face hints -------------------------------------------------------
  // red bindi
  const bindi = add(new THREE.CircleGeometry(0.011, 8), clothCrimson, 0, 1.645, 0.115);
  // subtle eyes
  add(new THREE.SphereGeometry(0.011, 5, 3), hairMat, -0.042, 1.615, 0.108);
  add(new THREE.SphereGeometry(0.011, 5, 3), hairMat, 0.042, 1.615, 0.108);

  // ---- jewelry ----------------------------------------------------------
  // maang tikka: chain up the parting + jeweled pendant on the forehead
  const tikkaChain = add(new THREE.BoxGeometry(0.006, 0.11, 0.005), goldBright, 0, 1.70, 0.088);
  tikkaChain.rotation.x = -0.32;
  add(new THREE.IcosahedronGeometry(0.019, 0), goldBright, 0, 1.655, 0.108);
  // nath (nose-ring hint) on the left side
  const nath = add(new THREE.TorusGeometry(0.017, 0.005, 4, 8), goldBright, 0.028, 1.585, 0.108);
  nath.rotation.y = 0.4;
  // jhumka earrings: stud + hanging bell
  const jhumka = (sx) => {
    add(new THREE.IcosahedronGeometry(0.016, 0), goldBright, sx, 1.585, 0.03);
    add(new THREE.ConeGeometry(0.022, 0.045, 8), gold, sx, 1.545, 0.03).rotation.x = Math.PI;
  };
  jhumka(-0.108);
  jhumka(0.108);
  // layered necklaces: choker band + longer necklace with pendant
  const choker = add(new THREE.CylinderGeometry(0.066, 0.07, 0.02, 16, 1, true), goldBright, 0, 1.44, 0.02);
  choker.scale.set(1.0, 1.0, 0.72);
  const necklace = add(new THREE.TorusGeometry(0.085, 0.013, 4, 12), gold, 0, 1.40, 0.028);
  necklace.rotation.x = Math.PI / 2;
  necklace.scale.set(1.0, 0.72, 1.0);
  add(new THREE.IcosahedronGeometry(0.018, 0), goldBright, 0, 1.335, 0.14);
  // waist chain (kamarband) with drop
  const waistChain = add(new THREE.CylinderGeometry(0.205, 0.205, 0.022, 16, 1, true), goldBright, 0, 1.03, 0);
  waistChain.scale.set(1.0, 1.0, 0.9);
  add(new THREE.IcosahedronGeometry(0.016, 0), gold, 0, 0.99, 0.20);

  // ---- arms holding the jaimala in front --------------------------------
  const connect = (ax, ay, az, bx, by, bz, r1, r2, mat, seg) => {
    const a = new THREE.Vector3(ax, ay, az);
    const b = new THREE.Vector3(bx, by, bz);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const geo = new THREE.CylinderGeometry(r2, r1, len, seg || 8, 1, false);
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    body.add(m);
    return m;
  };

  // left arm: shoulder -> elbow -> wrist (sleeve then bare forearm)
  connect(-0.17, 1.40, 0.02, -0.215, 1.23, 0.11, 0.05, 0.038, clothCrimson, 8);
  connect(-0.215, 1.23, 0.11, -0.13, 1.155, 0.205, 0.036, 0.028, skin, 8);
  // right arm
  connect(0.17, 1.40, 0.02, 0.215, 1.23, 0.11, 0.05, 0.038, clothCrimson, 8);
  connect(0.215, 1.23, 0.11, 0.13, 1.155, 0.205, 0.036, 0.028, skin, 8);
  // stacked bangles on both wrists
  const bangleGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.02, 8, 1, true);
  const stackBangles = (sx) => {
    for (let i = 0; i < 2; i++) {
      const bz = 0.16 + i * 0.028;
      const b = new THREE.Mesh(bangleGeo, i % 2 ? gold : goldBright);
      b.position.set(sx, 1.165 - i * 0.006, bz);
      b.rotation.x = Math.PI / 2 - 0.5;
      b.rotation.z = sx < 0 ? 0.5 : -0.5;
      body.add(b);
    }
  };
  stackBangles(-0.128);
  stackBangles(0.128);
  // hands
  add(new THREE.SphereGeometry(0.038, 6, 4), skin, -0.13, 1.15, 0.21);
  add(new THREE.SphereGeometry(0.038, 6, 4), skin, 0.13, 1.15, 0.21);

  // ---- dupatta veil (over the head, down the back and one shoulder) -----
  const drape = (w, h, wseg, hseg, curve) => {
    const g = new THREE.PlaneGeometry(w, h, wseg, hseg);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const py = pos.getY(i);
      const t = (py + h / 2) / h; // 0 bottom -> 1 top
      pos.setZ(i, pos.getZ(i) + Math.sin(t * Math.PI) * curve * -0.5 + (1 - t) * curve);
    }
    pos.needsUpdate = true;
    g.computeVertexNormals();
    return g;
  };
  // veil cap over the crown
  const veilCap = add(
    new THREE.SphereGeometry(0.135, 10, 4, 0, Math.PI * 2, 0, Math.PI * 0.42),
    veilMat, 0, 1.63, -0.01
  );
  veilCap.scale.set(1.05, 0.85, 1.08);
  // back veil: from crown down behind the shoulders
  const veilBack = add(drape(0.48, 0.82, 3, 5, 0.11), veilMat, 0, 1.32, -0.15);
  veilBack.rotation.x = 0.06;
  // gold trim along the back veil's lower edge
  const trimBack = add(new THREE.PlaneGeometry(0.48, 0.05), goldBright, 0, 0.93, -0.185);
  trimBack.rotation.x = 0.06;
  // front drape falling over the left shoulder
  const veilFront = add(drape(0.22, 0.60, 2, 4, 0.05), veilMat, -0.185, 1.20, 0.05);
  veilFront.rotation.set(0.0, 0.28, 0.14);
  const trimFront = add(new THREE.PlaneGeometry(0.22, 0.045), goldBright, -0.225, 0.91, 0.07);
  trimFront.rotation.set(0.0, 0.28, 0.14);

  // ---- jaimala (varmala garland) held in front --------------------------
  const garland = new THREE.Group();
  body.add(garland);
  const flowerMats = [
    new THREE.MeshStandardMaterial({ color: PAL.marigold, roughness: 0.6, emissive: PAL.marigoldDeep, emissiveIntensity: 0.3 }),
    new THREE.MeshStandardMaterial({ color: PAL.jasmine, roughness: 0.68, emissive: PAL.jasmine, emissiveIntensity: 0.18 }),
    new THREE.MeshStandardMaterial({ color: PAL.rose, roughness: 0.65 }),
    new THREE.MeshStandardMaterial({ color: PAL.saffron, roughness: 0.6, emissive: PAL.marigoldDeep, emissiveIntensity: 0.25 }),
  ];
  const flowerGeo = new THREE.IcosahedronGeometry(0.042, 0);
  const N = 9;
  for (let i = 0; i < N; i++) {
    const s = i / (N - 1);
    const m = new THREE.Mesh(flowerGeo, flowerMats[i % flowerMats.length]);
    m.position.set(
      -0.145 + 0.29 * s,
      1.15 - 0.34 * Math.sin(Math.PI * s),
      0.225 + 0.03 * Math.sin(Math.PI * s)
    );
    m.scale.setScalar(0.9 + Math.random() * 0.35);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    garland.add(m);
  }
  // a couple of green leaves peeking from the garland ends
  const leafMat = new THREE.MeshStandardMaterial({ color: PAL.leaf, roughness: 0.75, side: THREE.DoubleSide });
  const leafGeo = new THREE.PlaneGeometry(0.05, 0.09);
  [[-0.15, 1.15, 0.20, -0.5], [0.15, 1.15, 0.20, 0.5]].forEach((p) => {
    const l = new THREE.Mesh(leafGeo, leafMat);
    l.position.set(p[0], p[1], p[2]);
    l.rotation.z = p[3];
    garland.add(l);
  });

  // ---- graceful idle ----------------------------------------------------
  const phase = Math.random() * Math.PI * 2;
  const update = (t) => {
    const s = t + phase;
    body.rotation.z = Math.sin(s * 0.7) * 0.012;
    body.rotation.y = Math.sin(s * 0.42) * 0.02;
    body.position.y = Math.sin(s * 1.35) * 0.004;
    // dupatta shimmer
    veilBack.rotation.z = Math.sin(s * 0.9) * 0.02;
    veilFront.rotation.z = 0.14 + Math.sin(s * 1.1 + 0.6) * 0.03;
    // garland gently swings
    garland.rotation.z = Math.sin(s * 0.8 + 0.4) * 0.03;
    garland.position.y = Math.sin(s * 1.2) * 0.004;
  };

  return { group, update };
}
```


## `src/wedding/elephant.js`

```javascript
import * as THREE from "three";
import { PAL } from "./shared.js";

/**
 * createElephant()
 * One majestic ceremonial elephant richly adorned for royalty.
 * Faces +Z. Rests on ground (lowest point ~y=0). ~3.4 units tall.
 * Returns { group, update } — update(t) does slow ear flap, gentle trunk
 * sway, subtle weight shift. Triangle budget < 2600.
 */
export function createElephant() {
  const group = new THREE.Group();

  // ---- shared materials -------------------------------------------------
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x7f8288, roughness: 0.9, metalness: 0.0,
  });
  const skinDarkMat = new THREE.MeshStandardMaterial({
    color: 0x6d7075, roughness: 0.9, metalness: 0.0,
  });
  const tuskMat = new THREE.MeshStandardMaterial({
    color: PAL.ivory, roughness: 0.35, metalness: 0.05,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0x1a1008, roughness: 0.4, metalness: 0.0,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: PAL.gold, metalness: 0.9, roughness: 0.3,
    emissive: PAL.brass, emissiveIntensity: 0.18,
  });
  const goldGlowMat = new THREE.MeshStandardMaterial({
    color: PAL.goldBright, metalness: 0.6, roughness: 0.35,
    emissive: PAL.goldBright, emissiveIntensity: 1.1,
  });
  const clothMat = new THREE.MeshStandardMaterial({
    color: PAL.burgundy, roughness: 0.85, metalness: 0.0,
  });
  const clothDeepMat = new THREE.MeshStandardMaterial({
    color: PAL.burgundyDeep, roughness: 0.85, metalness: 0.0,
  });
  const jewelMat = new THREE.MeshStandardMaterial({
    color: PAL.crimson, roughness: 0.3, metalness: 0.2,
    emissive: PAL.rose, emissiveIntensity: 0.5,
  });

  // bodyGroup holds everything except the planted legs, so the weight-shift
  // animation leans the mass without lifting the feet off the ground.
  const bodyGroup = new THREE.Group();
  group.add(bodyGroup);

  // ---- torso ------------------------------------------------------------
  const torso = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), skinMat);
  torso.scale.set(1.4, 1.15, 2.0);
  torso.position.set(0, 1.95, -0.2);
  torso.castShadow = true;
  bodyGroup.add(torso);

  // rump cap (rounded back)
  const rump = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), skinMat);
  rump.scale.set(1.25, 1.15, 0.9);
  rump.position.set(0, 1.9, -1.9);
  bodyGroup.add(rump);

  // ---- head + neck ------------------------------------------------------
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 1.05, 0.9, 10, 1, true), skinMat);
  neck.rotation.x = Math.PI / 2.3;
  neck.position.set(0, 2.35, 1.6);
  bodyGroup.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 8), skinMat);
  head.scale.set(1.0, 1.05, 0.95);
  head.position.set(0, 2.5, 2.4);
  head.castShadow = true;
  bodyGroup.add(head);

  // domed forehead
  const brow = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), skinMat);
  brow.scale.set(1.0, 0.9, 0.7);
  brow.position.set(0, 2.95, 2.55);
  bodyGroup.add(brow);

  // face / trunk base block
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), skinDarkMat);
  face.scale.set(0.85, 1.0, 0.8);
  face.position.set(0, 2.25, 2.95);
  bodyGroup.add(face);

  // eyes
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), eyeMat);
    eye.position.set(sx * 0.5, 2.55, 2.85);
    bodyGroup.add(eye);
  }

  // ---- ears (flat rounded plates on pivots for flapping) ----------------
  const earPivots = [];
  for (const sx of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * 0.72, 2.65, 2.15);
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.72, 8, 6), skinMat);
    ear.scale.set(0.1, 1.05, 0.85);
    ear.position.set(sx * 0.08, -0.15, -0.35);
    pivot.add(ear);
    // gold-painted ear rim (flat ring, cheaper than a torus)
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.62, 10), goldMat);
    rim.scale.set(0.85, 1.0, 1.0);
    rim.rotation.y = Math.PI / 2;
    rim.position.set(sx * 0.1, -0.15, -0.35);
    pivot.add(rim);
    bodyGroup.add(pivot);
    earPivots.push({ pivot, sx, base: sx * 0.32 });
    pivot.rotation.y = sx * 0.32;
  }

  // ---- trunk (chain of bones, shrinking cylinders) ----------------------
  const trunkRoot = new THREE.Group();
  trunkRoot.position.set(0, 2.15, 3.05);
  trunkRoot.rotation.x = -0.35;
  bodyGroup.add(trunkRoot);

  const trunkBones = [];
  let parent = trunkRoot;
  const segCount = 6;
  const segLen = 0.36;
  // per-bone base tilt: hangs down, curls gently forward, tip lifts up
  const baseAngles = [-0.12, -0.14, -0.16, -0.1, 0.2, 0.4];
  for (let i = 0; i < segCount; i++) {
    const seg = new THREE.Group();
    seg.position.y = i === 0 ? 0 : -segLen;
    const baseX = baseAngles[i];
    seg.rotation.x = baseX;
    parent.add(seg);

    const r1 = 0.3 * (1 - i * 0.12);
    const r2 = 0.3 * (1 - (i + 1) * 0.12);
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(r2, r1, segLen, 6, 1, true), skinMat);
    cyl.position.y = -segLen / 2;
    seg.add(cyl);

    // gold ring bands on the trunk
    if (i === 2 || i === 4) {
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(r1 + 0.03, r1 + 0.03, 0.06, 6, 1, true),
        goldMat);
      band.position.y = -0.03;
      seg.add(band);
    }
    trunkBones.push({ seg, baseX, i });
    parent = seg;
  }
  // trunk tip
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), skinDarkMat);
  tip.position.y = -segLen;
  parent.add(tip);

  // ---- tusks ------------------------------------------------------------
  for (const sx of [-1, 1]) {
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.95, 6), tuskMat);
    tusk.rotation.set(1.15, 0, sx * 0.18);
    tusk.position.set(sx * 0.34, 2.05, 3.1);
    bodyGroup.add(tusk);
    // gold tusk cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 0.1, 6), goldMat);
    cap.rotation.set(1.15, 0, sx * 0.18);
    cap.position.set(sx * 0.34, 2.16, 2.98);
    bodyGroup.add(cap);
  }

  // ---- legs (planted, added to root not bodyGroup) ----------------------
  const legPositions = [
    [0.72, 0.95], [-0.72, 0.95], [0.72, -1.35], [-0.72, -1.35],
  ];
  for (const [lx, lz] of legPositions) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.38, 1.75, 8), skinMat);
    leg.position.set(lx, 0.88, lz);
    leg.castShadow = true;
    group.add(leg);
    // foot pad
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.44, 0.28, 8), skinDarkMat);
    foot.position.set(lx, 0.14, lz);
    group.add(foot);
    // toenails (low-poly icosahedra)
    for (let n = -1; n <= 1; n++) {
      const nail = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.08, 0), tuskMat);
      nail.scale.set(1, 0.7, 0.6);
      nail.position.set(lx + n * 0.15, 0.06, lz + 0.38);
      group.add(nail);
    }
    // golden anklet
    const anklet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.22, 8, 1, true), goldMat);
    anklet.position.set(lx, 0.42, lz);
    group.add(anklet);
    // hanging bells on the two front anklets
    if (lz > 0) {
      for (let b = -1; b <= 1; b++) {
        const bell = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.08, 0), goldGlowMat);
        bell.position.set(lx + b * 0.28, 0.28, lz + 0.3);
        group.add(bell);
      }
    }
  }

  // ---- tail -------------------------------------------------------------
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 2.4, -2.55);
  tailPivot.rotation.x = 0.5;
  bodyGroup.add(tailPivot);
  const tail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.09, 1.5, 5), skinDarkMat);
  tail.position.y = -0.75;
  tailPivot.add(tail);
  const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 5), clothDeepMat);
  tuft.rotation.x = Math.PI;
  tuft.position.y = -1.55;
  tailPivot.add(tuft);

  // ---- JHOOL drape (over back and sides) --------------------------------
  // top panel over the spine
  const topPanel = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.1, 2.7), clothMat);
  topPanel.position.set(0, 3.0, -0.4);
  bodyGroup.add(topPanel);

  // side panels hanging down each flank
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 1.3, 2.6), clothMat);
    side.rotation.z = sx * 0.12;
    side.position.set(sx * 1.4, 2.25, -0.4);
    bodyGroup.add(side);

    // gold hem strip at the bottom of each side
    const hem = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.18, 2.6), goldMat);
    hem.rotation.z = sx * 0.12;
    hem.position.set(sx * 1.52, 1.62, -0.4);
    bodyGroup.add(hem);

    // gold tassels along the hem
    for (let tI = 0; tI < 5; tI++) {
      const tz = -1.4 + tI * 0.5;
      const tassel = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.28, 4), goldMat);
      tassel.rotation.x = Math.PI;
      tassel.position.set(sx * 1.58, 1.42, -0.4 + (tz + 0.4) * 0.9);
      bodyGroup.add(tassel);
      // little emissive bell at every other tassel
      if (tI % 2 === 0) {
        const b = new THREE.Mesh(
          new THREE.IcosahedronGeometry(0.06, 0), goldGlowMat);
        b.position.set(sx * 1.6, 1.28, -0.4 + (tz + 0.4) * 0.9);
        bodyGroup.add(b);
      }
    }
    // gold medallion motif on each flank
    const medal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.05, 8), goldMat);
    medal.rotation.z = Math.PI / 2;
    medal.rotation.x = sx * 0.12;
    medal.position.set(sx * 1.47, 2.3, -0.2);
    bodyGroup.add(medal);
    const gem = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.09, 0), jewelMat);
    gem.position.set(sx * 1.52, 2.3, -0.2);
    bodyGroup.add(gem);
  }

  // gold trim ridge along the top of the spine
  const spineTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.14, 2.7), goldMat);
  spineTrim.position.set(0, 3.07, -0.4);
  bodyGroup.add(spineTrim);

  // ---- GADDI seat cushion (ornate, no rider) ----------------------------
  const cushion = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 0.4, 1.5), clothDeepMat);
  cushion.position.set(0, 3.28, -0.5);
  bodyGroup.add(cushion);
  // gold bolsters front & back
  for (const bz of [0.35, -1.35]) {
    const bolster = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 1.4, 8), goldMat);
    bolster.rotation.z = Math.PI / 2;
    bolster.position.set(0, 3.4, bz);
    bodyGroup.add(bolster);
  }
  // gold corner knobs
  for (const kx of [-0.6, 0.6]) {
    for (const kz of [0.35, -1.35]) {
      const knob = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.11, 0), goldGlowMat);
      knob.position.set(kx, 3.52, kz);
      bodyGroup.add(knob);
    }
  }

  // ---- gold embroidered HEADPLATE over the forehead ---------------------
  const platePivot = new THREE.Group();
  platePivot.position.set(0, 2.95, 2.75);
  platePivot.rotation.x = -0.35;
  bodyGroup.add(platePivot);
  // burgundy backing
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.72, 0.08), clothMat);
  platePivot.add(plate);
  // gold border frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.02, 0.8, 0.05), goldMat);
  frame.position.z = -0.02;
  platePivot.add(frame);
  // row of jewel dots
  for (let j = -2; j <= 2; j++) {
    const dot = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.07, 0), jewelMat);
    dot.position.set(j * 0.18, 0.12, 0.06);
    platePivot.add(dot);
  }
  // central gold boss
  const boss = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 6), goldGlowMat);
  boss.scale.set(1, 1, 0.6);
  boss.position.set(0, -0.08, 0.08);
  platePivot.add(boss);
  // hanging pendant (jhula) between the eyes
  const pendant = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.24, 6), goldGlowMat);
  pendant.rotation.x = Math.PI;
  pendant.position.set(0, -0.5, 0.05);
  platePivot.add(pendant);

  // gold-painted cheek motifs
  for (const sx of [-1, 1]) {
    const swirl = new THREE.Mesh(
      new THREE.RingGeometry(0.14, 0.24, 8), goldMat);
    swirl.position.set(sx * 0.68, 2.35, 2.62);
    swirl.rotation.y = sx * 0.5;
    bodyGroup.add(swirl);
  }

  // -----------------------------------------------------------------------
  // update: slow ear flap, gentle trunk sway, subtle weight shift
  // -----------------------------------------------------------------------
  function update(t) {
    // subtle weight shift — lean the mass, feet stay planted
    bodyGroup.position.x = Math.sin(t * 0.5) * 0.05;
    bodyGroup.position.y = Math.sin(t * 1.0) * 0.02;
    bodyGroup.rotation.z = Math.sin(t * 0.5) * 0.012;

    // slow ear flap
    for (const e of earPivots) {
      e.pivot.rotation.y = e.base + Math.sin(t * 0.9 + e.sx) * 0.18 * e.sx;
      e.pivot.rotation.x = Math.sin(t * 0.9 + e.sx) * 0.05;
    }

    // gentle trunk sway — amplitude grows toward the tip
    for (const b of trunkBones) {
      const w = (b.i + 1) / segCount;
      b.seg.rotation.z = Math.sin(t * 0.8 + b.i * 0.5) * 0.05 * w;
      b.seg.rotation.x = b.baseX + Math.sin(t * 0.7 + b.i * 0.4) * 0.03 * w;
    }

    // lazy tail swish
    tailPivot.rotation.z = Math.sin(t * 0.6) * 0.15;
  }

  return { group, update };
}
```


## `src/wedding/attendants.js`

```javascript
import * as THREE from "three";
import { PAL } from "./shared.js";

/* ------------------------------------------------------------------ *
 *  Shared materials (created once, reused across every attendant)     *
 * ------------------------------------------------------------------ */
const M = {
  skin:     new THREE.MeshStandardMaterial({ color: PAL.skin,      roughness: 0.85, metalness: 0.0 }),
  white:    new THREE.MeshStandardMaterial({ color: PAL.ivory,     roughness: 0.8,  metalness: 0.0 }),
  cream:    new THREE.MeshStandardMaterial({ color: PAL.cream,     roughness: 0.8,  metalness: 0.0 }),
  burgundy: new THREE.MeshStandardMaterial({ color: PAL.burgundy,  roughness: 0.7,  metalness: 0.0, side: THREE.DoubleSide }),
  crimson:  new THREE.MeshStandardMaterial({ color: PAL.crimson,   roughness: 0.7,  metalness: 0.0, side: THREE.DoubleSide }),
  gold:     new THREE.MeshStandardMaterial({ color: PAL.gold,      roughness: 0.35, metalness: 0.9, emissive: PAL.goldBright, emissiveIntensity: 0.18 }),
  brass:    new THREE.MeshStandardMaterial({ color: PAL.brass,     roughness: 0.4,  metalness: 0.85, emissive: PAL.marigold,   emissiveIntensity: 0.12 }),
  bronze:   new THREE.MeshStandardMaterial({ color: PAL.bronze,    roughness: 0.6,  metalness: 0.4 }),
  marigold: new THREE.MeshStandardMaterial({ color: PAL.marigold,  roughness: 0.7,  metalness: 0.0, emissive: PAL.marigoldDeep, emissiveIntensity: 0.15 }),
  jasmine:  new THREE.MeshStandardMaterial({ color: PAL.jasmine,   roughness: 0.75, metalness: 0.0 }),
  leaf:     new THREE.MeshStandardMaterial({ color: PAL.leaf,      roughness: 0.7,  metalness: 0.0 }),
};

const mesh = (geo, mat) => new THREE.Mesh(geo, mat);

/* ------------------------------------------------------------------ *
 *  Body part builders                                                 *
 * ------------------------------------------------------------------ */
function makeArm(side) {
  // pivot lives at the shoulder; arm hangs down -y
  const g = new THREE.Group();
  const sleeve = mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.42, 6), M.white);
  sleeve.position.y = -0.21;
  g.add(sleeve);
  const cuff = mesh(new THREE.TorusGeometry(0.045, 0.014, 3, 6), M.gold);
  cuff.rotation.x = Math.PI / 2;
  cuff.position.y = -0.41;
  g.add(cuff);
  const hand = mesh(new THREE.SphereGeometry(0.05, 5, 3), M.skin);
  hand.position.y = -0.45;
  g.add(hand);
  g.position.set(side * 0.17, 1.24, 0);
  return g;
}

function makeLeg(x) {
  const g = new THREE.Group();
  const calf = mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.42, 6), M.skin);
  calf.position.y = 0.23;
  g.add(calf);
  const foot = mesh(new THREE.BoxGeometry(0.09, 0.055, 0.17), M.bronze);
  foot.position.set(0, 0.03, 0.03);
  g.add(foot);
  g.position.x = x;
  return g;
}

/* ------------------------------------------------------------------ *
 *  Ceremonial item builders  ->  { group, mode }                      *
 *  Each item group is expressed in attendant-local space.             *
 * ------------------------------------------------------------------ */
function buildChhatri() {
  const g = new THREE.Group();
  const pole = mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.9, 6), M.bronze);
  pole.position.y = 2.05;
  g.add(pole);
  const dome = mesh(new THREE.SphereGeometry(0.62, 10, 3, 0, Math.PI * 2, 0, Math.PI / 2), M.burgundy);
  dome.position.y = 2.9;
  g.add(dome);
  const rim = mesh(new THREE.TorusGeometry(0.6, 0.045, 3, 8), M.gold);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 2.9;
  g.add(rim);
  const fringe = mesh(new THREE.TorusGeometry(0.63, 0.05, 3, 8), M.jasmine);
  fringe.rotation.x = Math.PI / 2;
  fringe.position.y = 2.84;
  g.add(fringe);
  const finial = mesh(new THREE.ConeGeometry(0.05, 0.22, 6), M.gold);
  finial.position.y = 3.28;
  g.add(finial);
  const kalash = mesh(new THREE.IcosahedronGeometry(0.055, 0), M.gold);
  kalash.position.y = 3.14;
  g.add(kalash);
  return { group: g, mode: 'overhead' };
}

function buildGarland() {
  const g = new THREE.Group();
  const loop = mesh(new THREE.TorusGeometry(0.3, 0.05, 4, 10), M.marigold);
  g.add(loop);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const f = mesh(new THREE.IcosahedronGeometry(0.06, 0), i % 2 ? M.jasmine : M.marigold);
    f.position.set(Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0);
    g.add(f);
  }
  g.position.set(0, 1.16, 0.34);
  g.rotation.x = 0.25;
  return { group: g, mode: 'hold' };
}

function buildLamp() {
  const g = new THREE.Group();
  const pole = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), M.bronze);
  pole.rotation.z = -0.5;
  pole.position.set(0.12, 0.05, 0.28);
  g.add(pole);
  const chain = mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 4), M.brass);
  chain.position.set(0.32, -0.05, 0.42);
  g.add(chain);
  const cage = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 6, 1, true), M.brass);
  cage.position.set(0.32, -0.2, 0.42);
  g.add(cage);
  const roof = mesh(new THREE.ConeGeometry(0.1, 0.09, 6), M.brass);
  roof.position.set(0.32, -0.09, 0.42);
  g.add(roof);
  const base = mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.03, 6), M.brass);
  base.position.set(0.32, -0.28, 0.42);
  g.add(base);
  const flameMat = M.brass.clone();
  flameMat.color.setHex(PAL.flame);
  flameMat.emissive.setHex(PAL.emberGlow);
  flameMat.emissiveIntensity = 1.4;
  flameMat.metalness = 0.0;
  flameMat.roughness = 0.4;
  const flame = mesh(new THREE.IcosahedronGeometry(0.05, 0), flameMat);
  flame.scale.y = 1.5;
  flame.position.set(0.32, -0.2, 0.42);
  g.add(flame);
  return { group: g, mode: 'raise-r', flame };
}

function buildFlag() {
  const g = new THREE.Group();
  const pole = mesh(new THREE.CylinderGeometry(0.025, 0.03, 2.4, 6), M.bronze);
  pole.position.y = 1.2;
  g.add(pole);
  const finial = mesh(new THREE.ConeGeometry(0.06, 0.2, 6), M.gold);
  finial.position.y = 2.5;
  g.add(finial);
  const tri = new THREE.Shape();
  tri.moveTo(0, 0);
  tri.lineTo(0.7, -0.18);
  tri.lineTo(0, -0.5);
  tri.lineTo(0, 0);
  const banner = mesh(new THREE.ShapeGeometry(tri), M.burgundy);
  banner.position.set(0.03, 2.3, 0);
  g.add(banner);
  const trim = mesh(new THREE.BoxGeometry(0.03, 0.5, 0.02), M.gold);
  trim.position.set(0.03, 2.05, 0.005);
  g.add(trim);
  g.position.set(0.22, 0, 0.05);
  return { group: g, mode: 'stave-r' };
}

function buildDhol() {
  const g = new THREE.Group();
  const shell = mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 10), M.bronze);
  shell.rotation.z = Math.PI / 2;
  g.add(shell);
  const rimL = mesh(new THREE.TorusGeometry(0.16, 0.025, 3, 10), M.cream);
  rimL.position.x = 0.17;
  g.add(rimL);
  const rimR = mesh(new THREE.TorusGeometry(0.16, 0.025, 3, 10), M.cream);
  rimR.position.x = -0.17;
  g.add(rimR);
  const strap = mesh(new THREE.BoxGeometry(0.04, 0.5, 0.02), M.crimson);
  strap.rotation.z = 0.9;
  strap.position.y = 0.28;
  g.add(strap);
  g.position.set(0, 1.0, 0.26);
  return { group: g, mode: 'drum' };
}

function buildShehnai() {
  const g = new THREE.Group();
  const body = mesh(new THREE.CylinderGeometry(0.018, 0.03, 0.34, 6), M.bronze);
  g.add(body);
  const bell = mesh(new THREE.ConeGeometry(0.07, 0.1, 6, 1, true), M.brass);
  bell.position.y = -0.21;
  g.add(bell);
  const reed = mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.05, 5), M.gold);
  reed.position.y = 0.19;
  g.add(reed);
  g.position.set(0.02, 1.34, 0.2);
  g.rotation.x = 0.9;
  return { group: g, mode: 'play' };
}

function buildTurhi() {
  const g = new THREE.Group();
  const tube = mesh(new THREE.CylinderGeometry(0.022, 0.028, 1.1, 6), M.gold);
  tube.rotation.x = Math.PI / 2;
  tube.position.z = 0.55;
  g.add(tube);
  const bell = mesh(new THREE.ConeGeometry(0.11, 0.16, 8, 1, true), M.gold);
  bell.rotation.x = -Math.PI / 2;
  bell.position.z = 1.16;
  g.add(bell);
  const ring = mesh(new THREE.TorusGeometry(0.03, 0.012, 3, 8), M.brass);
  ring.rotation.y = Math.PI / 2;
  ring.position.z = 0.35;
  g.add(ring);
  g.position.set(0, 1.32, 0.14);
  g.rotation.x = -0.12;
  return { group: g, mode: 'play' };
}

function buildMorchhal() {
  const g = new THREE.Group();
  const handle = mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.34, 6), M.gold);
  handle.position.y = -0.17;
  g.add(handle);
  const collar = mesh(new THREE.SphereGeometry(0.035, 6, 4), M.gold);
  g.add(collar);
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.32;
    const feather = mesh(new THREE.ConeGeometry(0.035, 0.42, 5), M.leaf);
    feather.position.set(Math.sin(a) * 0.16, 0.2 + Math.cos(a) * 0.05, 0);
    feather.rotation.z = -a;
    g.add(feather);
    const eye = mesh(new THREE.IcosahedronGeometry(0.035, 0), M.gold);
    eye.position.set(Math.sin(a) * 0.28, 0.38 + Math.cos(a) * 0.05, 0);
    g.add(eye);
  }
  g.position.set(0.18, 1.62, 0.06);
  g.rotation.z = -0.25;
  return { group: g, mode: 'raise-r' };
}

const ITEM_BUILDERS = {
  chhatri: buildChhatri,
  garland: buildGarland,
  lamp: buildLamp,
  flag: buildFlag,
  dhol: buildDhol,
  shehnai: buildShehnai,
  turhi: buildTurhi,
  morchhal: buildMorchhal,
};

/* ------------------------------------------------------------------ *
 *  Arm poses per interaction mode.                                    *
 *  Values are base { x, z } euler rotations for left & right arms.    *
 * ------------------------------------------------------------------ */
function poseFor(mode) {
  switch (mode) {
    case 'overhead': // both arms up gripping a pole overhead
      return { l: { x: -2.5, z: 0.35 }, r: { x: -2.5, z: -0.35 } };
    case 'hold':     // both arms forward at chest (garland)
      return { l: { x: -1.35, z: 0.25 }, r: { x: -1.35, z: -0.25 } };
    case 'raise-r':  // right arm raised, left relaxed
      return { l: { x: 0.12, z: 0.1 }, r: { x: -2.2, z: -0.2 } };
    case 'stave-r':  // right arm grips vertical pole beside body
      return { l: { x: 0.12, z: 0.1 }, r: { x: -0.55, z: -0.42 } };
    case 'drum':     // both arms forward-down onto drum heads
      return { l: { x: -0.95, z: 0.55 }, r: { x: -0.95, z: -0.55 } };
    case 'play':     // both arms up toward the face / forward
      return { l: { x: -1.7, z: 0.35 }, r: { x: -1.7, z: -0.35 } };
    default:
      return { l: { x: 0.12, z: 0.1 }, r: { x: 0.12, z: -0.1 } };
  }
}

/* ------------------------------------------------------------------ *
 *  MAIN EXPORT                                                        *
 * ------------------------------------------------------------------ */
export function createAttendant(opts = {}) {
  const phase = opts.phase || 0;
  const key = ITEM_BUILDERS[opts.item] ? opts.item : 'garland';

  const group = new THREE.Group();

  // ---- lower body ----
  group.add(makeLeg(-0.09));
  group.add(makeLeg(0.09));

  const dhoti = mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.5, 8), M.white);
  dhoti.position.y = 0.62;
  group.add(dhoti);

  // ---- torso ----
  const torso = mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8), M.white);
  torso.position.y = 1.1;
  group.add(torso);

  const waist = mesh(new THREE.TorusGeometry(0.2, 0.03, 3, 8), M.gold);
  waist.rotation.x = Math.PI / 2;
  waist.position.y = 0.87;
  group.add(waist);

  const sash = mesh(new THREE.BoxGeometry(0.44, 0.13, 0.04), M.burgundy);
  sash.rotation.z = 0.6;
  sash.position.set(0, 1.06, 0.19);
  group.add(sash);

  const collar = mesh(new THREE.TorusGeometry(0.1, 0.025, 3, 8), M.gold);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.34;
  group.add(collar);

  // ---- head ----
  const neck = mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.08, 6), M.skin);
  neck.position.y = 1.39;
  group.add(neck);

  const head = mesh(new THREE.SphereGeometry(0.12, 8, 5), M.skin);
  head.position.y = 1.53;
  group.add(head);

  // small nose so the face has a front
  const nose = mesh(new THREE.ConeGeometry(0.02, 0.05, 4), M.skin);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.52, 0.12);
  group.add(nose);

  // ---- turban ----
  const turban = mesh(new THREE.SphereGeometry(0.135, 8, 5), M.white);
  turban.scale.y = 0.8;
  turban.position.y = 1.63;
  group.add(turban);

  const band = mesh(new THREE.TorusGeometry(0.135, 0.035, 3, 8), M.burgundy);
  band.rotation.x = Math.PI / 2 + 0.15;
  band.position.y = 1.6;
  group.add(band);

  const plume = mesh(new THREE.ConeGeometry(0.03, 0.14, 5), M.marigold);
  plume.position.set(0, 1.76, -0.05);
  plume.rotation.x = -0.3;
  group.add(plume);

  const jewel = mesh(new THREE.IcosahedronGeometry(0.03, 0), M.gold);
  jewel.position.set(0, 1.62, 0.13);
  group.add(jewel);

  // ---- arms ----
  const aL = makeArm(1);
  const aR = makeArm(-1);
  group.add(aL);
  group.add(aR);

  // ---- item ----
  const { group: itemGroup, mode, flame } = ITEM_BUILDERS[key]();
  group.add(itemGroup);

  // ---- apply pose ----
  const pose = poseFor(mode);
  aL.rotation.set(pose.l.x, 0, pose.l.z);
  aR.rotation.set(pose.r.x, 0, pose.r.z);

  const baseL = { x: pose.l.x, z: pose.l.z };
  const baseR = { x: pose.r.x, z: pose.r.z };
  const swayMode = (mode === 'play' || mode === 'drum');

  function update(t) {
    const s = Math.sin(t * 2.0 + phase);
    // gentle up-only march bob
    group.position.y = (s * 0.5 + 0.5) * 0.03;

    if (mode === 'drum') {
      const tapL = Math.abs(Math.sin(t * 7.0 + phase));
      const tapR = Math.abs(Math.sin(t * 7.0 + phase + 1.2));
      aL.rotation.x = baseL.x - tapL * 0.35;
      aR.rotation.x = baseR.x - tapR * 0.35;
    } else {
      aL.rotation.x = baseL.x + s * 0.05;
      aR.rotation.x = baseR.x - s * 0.05;
    }

    // musicians / drummers sway side to side
    group.rotation.z = swayMode ? Math.sin(t * 1.6 + phase) * 0.045 : 0;

    if (flame) {
      flame.material.emissiveIntensity = 1.2 + Math.sin(t * 9.0 + phase) * 0.35;
      flame.scale.x = 1 + Math.sin(t * 11.0 + phase) * 0.12;
    }
  }

  return { group, update };
}
```


## `src/wedding/dancers.js`

```javascript
import * as THREE from "three";
import { PAL } from "./shared.js";

/* ------------------------------------------------------------------ *
 *  dancers.js  -  energetic baraat DANCERS (the dance floor).         *
 *  createDancer({ variant, phase }) -> { group, update }              *
 *                                                                     *
 *  ONE stylized low-poly human (~1.7 tall) whose festive attire,      *
 *  starting pose and animation are driven by `variant`. Faces +Z,     *
 *  rests on ground (y~0). All placement (position / rotation.y) is     *
 *  owned by main.js - every animated transform happens on an inner    *
 *  `content` pivot so main.js placement is never overwritten.         *
 *  < 780 tris per dancer; materials shared across all instances.      *
 * ------------------------------------------------------------------ */

/* ---- shared materials (created once, reused by every dancer) ------ */
const SKIN   = new THREE.MeshStandardMaterial({ color: PAL.skin,     roughness: 0.85, metalness: 0.0 });
const SKIND  = new THREE.MeshStandardMaterial({ color: PAL.skinDark, roughness: 0.85, metalness: 0.0 });
const HAIR   = new THREE.MeshStandardMaterial({ color: 0x1a1008,     roughness: 0.8,  metalness: 0.0 });
const BRONZE = new THREE.MeshStandardMaterial({ color: PAL.bronze,   roughness: 0.55, metalness: 0.3 });
const CREAM  = new THREE.MeshStandardMaterial({ color: PAL.cream,    roughness: 0.8,  metalness: 0.0 });
const GOLD   = new THREE.MeshStandardMaterial({ color: PAL.gold,     roughness: 0.34, metalness: 0.9,
                 emissive: PAL.goldBright, emissiveIntensity: 0.2 });

// Vibrant cloth colours are cached by hex so festive kurtas/lehengas are
// shared across the whole crowd instead of re-allocated per dancer.
const _clothCache = new Map();
function cloth(hex, ds = false) {
  const k = hex + (ds ? "d" : "");
  let m = _clothCache.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: hex, roughness: 0.82, metalness: 0.0,
      side: ds ? THREE.DoubleSide : THREE.FrontSide,
    });
    _clothCache.set(k, m);
  }
  return m;
}

const mesh = (geo, mat) => new THREE.Mesh(geo, mat);

/* ---- vibrant baraat palette (gold + burgundy accents kept royal) -- */
const C = {
  magenta: 0xd6336c,
  teal:    0x0ca678,
  royal:   0x3b5bdb,
  emerald: 0x099268,
  violet:  0x7048e8,
};

/* ---- per-variant attire recipe ------------------------------------ */
const VARIANTS = {
  armsUpM:  { female: false, cloth: PAL.saffron,     legs: PAL.cream, turban: C.teal,    sash: PAL.burgundy },
  bhangraM: { female: false, cloth: C.royal,         legs: PAL.cream, turban: C.magenta, sash: PAL.gold     },
  clapM:    { female: false, cloth: C.emerald,       legs: PAL.cream, turban: PAL.saffron, sash: PAL.burgundy },
  jumpM:    { female: false, cloth: PAL.marigoldDeep, legs: PAL.cream, turban: C.teal,    sash: PAL.burgundy },
  spinF:    { female: true,  choli: C.teal,          lehenga: C.magenta, dupatta: PAL.burgundy },
  thumkaF:  { female: true,  choli: C.emerald,       lehenga: C.violet,  dupatta: PAL.marigold },
};

/* ------------------------------------------------------------------ *
 *  Limb builders - each returns { g, ... } with pivot at the joint.   *
 * ------------------------------------------------------------------ */
function makeArm(side, sleeveMat) {
  const g = new THREE.Group();                       // pivot at shoulder
  const upper = mesh(new THREE.CylinderGeometry(0.05, 0.044, 0.34, 6), sleeveMat);
  upper.position.y = -0.17;
  g.add(upper);
  const elbow = new THREE.Group();                   // pivot at elbow
  elbow.position.y = -0.34;
  g.add(elbow);
  const fore = mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.3, 6), sleeveMat);
  fore.position.y = -0.15;
  elbow.add(fore);
  const hand = mesh(new THREE.SphereGeometry(0.052, 6, 4), SKIN);
  hand.position.y = -0.32;
  elbow.add(hand);
  g.position.set(side * 0.18, 1.24, 0);
  return { g, elbow };
}

function makeLeg(x, pantMat) {
  const g = new THREE.Group();                       // pivot at hip
  const thigh = mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.4, 6), pantMat);
  thigh.position.y = -0.2;
  g.add(thigh);
  const knee = new THREE.Group();                    // pivot at knee
  knee.position.y = -0.42;
  g.add(knee);
  const calf = mesh(new THREE.CylinderGeometry(0.057, 0.05, 0.4, 6), pantMat);
  calf.position.y = -0.2;
  knee.add(calf);
  const foot = mesh(new THREE.BoxGeometry(0.09, 0.055, 0.18), BRONZE);
  foot.position.set(0, -0.42, 0.045);
  knee.add(foot);
  g.position.set(x, 0.86, 0);
  return { g, knee };
}

/* ------------------------------------------------------------------ *
 *  MAIN EXPORT                                                        *
 * ------------------------------------------------------------------ */
export function createDancer(opts = {}) {
  const phase = opts.phase || 0;
  const variant = VARIANTS[opts.variant] ? opts.variant : "armsUpM";
  const cfg = VARIANTS[variant];

  const group = new THREE.Group();       // owned by main.js (position / rot.y)
  const content = new THREE.Group();     // everything animated lives here
  group.add(content);

  const skinMat = Math.random() < 0.5 ? SKIN : SKIND;

  // ---- legs ----
  const legMat = cfg.female ? skinMat : cloth(cfg.legs);
  const legL = makeLeg(-0.09, legMat);
  const legR = makeLeg(0.09, legMat);
  content.add(legL.g, legR.g);

  let skirtPivot = null;

  if (cfg.female) {
    // ---- choli (blouse) + bare midriff + flared lehenga ----
    const choli = mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.28, 8), cloth(cfg.choli));
    choli.position.y = 1.12;
    content.add(choli);
    const midriff = mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.16, 6), skinMat);
    midriff.position.y = 0.94;
    content.add(midriff);
    const trim = mesh(new THREE.TorusGeometry(0.15, 0.02, 3, 8), GOLD);
    trim.rotation.x = Math.PI / 2;
    trim.position.y = 0.99;
    content.add(trim);

    // lehenga skirt: pivot at the waist so scaling flares the HEM, not waist
    skirtPivot = new THREE.Group();
    skirtPivot.position.y = 0.9;
    const skirt = mesh(new THREE.ConeGeometry(0.56, 0.78, 12, 1, true), cloth(cfg.lehenga, true));
    skirt.position.y = -0.39;
    skirtPivot.add(skirt);
    const hem = mesh(new THREE.TorusGeometry(0.55, 0.03, 3, 12), GOLD);
    hem.rotation.x = Math.PI / 2;
    hem.position.y = -0.78;
    skirtPivot.add(hem);
    content.add(skirtPivot);
  } else {
    // ---- kurta tunic + flared lower kurta ----
    const kurtaMat = cloth(cfg.cloth);
    const torso = mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.5, 8), kurtaMat);
    torso.position.y = 1.06;
    content.add(torso);
    const skirtK = mesh(new THREE.CylinderGeometry(0.19, 0.26, 0.34, 8), kurtaMat);
    skirtK.position.y = 0.72;
    content.add(skirtK);
    const hem = mesh(new THREE.TorusGeometry(0.255, 0.02, 3, 8), GOLD);
    hem.rotation.x = Math.PI / 2;
    hem.position.y = 0.56;
    content.add(hem);
    const placket = mesh(new THREE.BoxGeometry(0.03, 0.5, 0.03), GOLD);
    placket.position.set(0, 1.06, 0.185);
    content.add(placket);
    // sash across the chest
    const sash = mesh(new THREE.BoxGeometry(0.42, 0.12, 0.04), cloth(cfg.sash));
    sash.rotation.z = 0.62;
    sash.position.set(0, 1.05, 0.18);
    content.add(sash);
  }

  // ---- neck + head + nose (face front) ----
  const neck = mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.08, 6), skinMat);
  neck.position.y = 1.38;
  content.add(neck);
  const head = mesh(new THREE.SphereGeometry(0.115, 8, 6), skinMat);
  head.position.y = 1.52;
  content.add(head);
  const nose = mesh(new THREE.ConeGeometry(0.02, 0.05, 4), skinMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.51, 0.11);
  content.add(nose);

  if (cfg.female) {
    // hair + bun + draped dupatta over the head + maang-tikka jewel
    const hairBack = mesh(new THREE.SphereGeometry(0.12, 8, 5), HAIR);
    hairBack.scale.set(1, 1, 0.7);
    hairBack.position.set(0, 1.53, -0.03);
    content.add(hairBack);
    const bun = mesh(new THREE.SphereGeometry(0.06, 6, 4), HAIR);
    bun.position.set(0, 1.46, -0.14);
    content.add(bun);
    const dupatta = mesh(new THREE.SphereGeometry(0.15, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), cloth(cfg.dupatta, true));
    dupatta.scale.set(1, 0.85, 1);
    dupatta.position.set(0, 1.55, -0.02);
    content.add(dupatta);
    const tikka = mesh(new THREE.IcosahedronGeometry(0.022, 0), GOLD);
    tikka.position.set(0, 1.6, 0.05);
    content.add(tikka);
  } else {
    // turban + band + plume + jewel
    const turban = mesh(new THREE.SphereGeometry(0.135, 8, 5), cloth(cfg.turban));
    turban.scale.y = 0.82;
    turban.position.y = 1.62;
    content.add(turban);
    const band = mesh(new THREE.TorusGeometry(0.135, 0.032, 3, 8), GOLD);
    band.rotation.x = Math.PI / 2 + 0.14;
    band.position.y = 1.59;
    content.add(band);
    const plume = mesh(new THREE.ConeGeometry(0.03, 0.15, 5), cloth(cfg.sash || PAL.marigold));
    plume.position.set(0, 1.76, -0.04);
    plume.rotation.x = -0.35;
    content.add(plume);
    const jewel = mesh(new THREE.IcosahedronGeometry(0.028, 0), GOLD);
    jewel.position.set(0, 1.61, 0.12);
    content.add(jewel);
  }

  // ---- arms (festive sleeves match the kurta / choli) ----
  const sleeveMat = cfg.female ? cloth(cfg.choli) : cloth(cfg.cloth);
  const aL = makeArm(1, sleeveMat);
  const aR = makeArm(-1, sleeveMat);
  content.add(aL.g, aR.g);

  // gold bangles / cuffs at the wrists for sparkle
  const cuffGeo = new THREE.TorusGeometry(0.045, 0.012, 3, 6);
  const cuffL = mesh(cuffGeo, GOLD); cuffL.rotation.x = Math.PI / 2; cuffL.position.y = -0.28; aL.elbow.add(cuffL);
  const cuffR = mesh(cuffGeo, GOLD); cuffR.rotation.x = Math.PI / 2; cuffR.position.y = -0.28; aR.elbow.add(cuffR);

  /* ---------------------------------------------------------------- *
   *  ANIMATION - big, obviously joyful dance driven by `variant`.    *
   *  All motion on `content` + limb pivots; `group` stays untouched. *
   * ---------------------------------------------------------------- */
  const setArm = (arm, x, z, ex = 0, ez = 0) => {
    arm.g.rotation.set(x, 0, z);
    arm.elbow.rotation.set(ex, 0, ez);
  };

  function update(t) {
    const p = t + phase;

    if (variant === "bhangraM") {
      // one arm up / one arm out, alternating with leg kick + torso twist
      const s = Math.sin(p * 3.0);
      const sw = (s + 1) * 0.5;                       // 0..1 alternation
      content.position.set(0, Math.abs(s) * 0.1 + 0.02, 0);
      content.rotation.set(0, s * 0.4, 0);            // torso twist
      const up = -2.85, out = -1.35;
      setArm(aR, out + (up - out) * sw, -0.3 - 0.6 * (1 - sw), -0.2, 0);
      setArm(aL, up + (out - up) * sw, 0.3 + 0.6 * sw, -0.2, 0);
      legR.g.rotation.x = -0.7 * (1 - sw);            // kick the "out" leg
      legL.g.rotation.x = -0.7 * sw;
      legR.knee.rotation.x = -0.4 * (1 - sw);
      legL.knee.rotation.x = -0.4 * sw;

    } else if (variant === "clapM") {
      // clap hands above the head + side-to-side step
      const step = Math.sin(p * 2.4);
      content.position.set(step * 0.13, Math.abs(Math.sin(p * 4.8)) * 0.05, 0);
      content.rotation.set(0, 0, step * 0.07);
      const clap = Math.sin(p * 7.0) * 0.5 + 0.5;     // 0..1 open/close
      const spread = 0.12 + clap * 0.42;
      setArm(aL, -2.95, spread, -0.15, 0);
      setArm(aR, -2.95, -spread, -0.15, 0);
      legL.g.rotation.x = Math.max(0, step) * 0.35;   // lift stepping foot
      legR.g.rotation.x = Math.max(0, -step) * 0.35;

    } else if (variant === "jumpM") {
      // springy celebration jump - big vertical bounce, arms thrown up
      const j = Math.abs(Math.sin(p * 2.5));
      const jj = Math.pow(j, 0.65);
      content.position.set(0, jj * 0.42, 0);
      content.rotation.set(0, 0, Math.sin(p * 2.5) * 0.05);
      const fl = Math.sin(p * 9.0) * 0.18;
      setArm(aL, -2.9 + fl, 0.3, -0.2 * jj, 0);
      setArm(aR, -2.9 - fl, -0.3, -0.2 * jj, 0);
      legL.g.rotation.x = -0.25 * j;                  // tuck legs at the peak
      legR.g.rotation.x = -0.25 * j;
      legL.knee.rotation.x = -1.0 * j;
      legR.knee.rotation.x = -1.0 * j;

    } else if (variant === "spinF") {
      // whole-body twirl - the lehenga hem flares outward with the spin
      content.rotation.set(0, p * 3.4, 0.05);
      content.position.set(0, 0.02 + Math.abs(Math.sin(p * 6.0)) * 0.03, 0);
      const flare = 1.28 + Math.sin(p * 6.0) * 0.08;
      if (skirtPivot) skirtPivot.scale.set(flare, 1, flare);
      const wob = Math.sin(p * 4.0) * 0.12;
      setArm(aL, -1.5, 0.75 + wob, -0.35, 0);         // arms out for balance
      setArm(aR, -1.5, -0.75 - wob, -0.35, 0);

    } else if (variant === "thumkaF") {
      // hip-sway thumka - one hand raised, other on the hip, gentle bounce
      const sway = Math.sin(p * 2.6);
      content.position.set(sway * 0.07, Math.abs(Math.sin(p * 5.2)) * 0.04, 0);
      content.rotation.set(0, 0, sway * 0.12);        // hip sway lean
      if (skirtPivot) skirtPivot.rotation.z = -sway * 0.16;  // skirt kicks out
      setArm(aR, -2.65, -0.22 + Math.sin(p * 5.0) * 0.12, 0, Math.sin(p * 8.0) * 0.4);
      setArm(aL, -0.7, 0.95, -1.5, 0);                // hand resting on hip
      legL.knee.rotation.x = -Math.abs(sway) * 0.12;
      legR.knee.rotation.x = -Math.abs(sway) * 0.12;

    } else {
      // armsUpM (default) - bhangra hop: clear vertical bounce + shimmy + flick
      const hop = Math.abs(Math.sin(p * 3.2));
      const sh = Math.sin(p * 6.0);
      content.position.set(0, hop * 0.2, 0);
      content.rotation.set(0, 0, Math.sin(p * 3.2) * 0.05);
      setArm(aL, -2.8 + sh * 0.18, 0.32 + sh * 0.15, 0, Math.sin(p * 10.0) * 0.5);
      setArm(aR, -2.8 - sh * 0.18, -0.32 - sh * 0.15, 0, -Math.sin(p * 10.0) * 0.5);
      legL.knee.rotation.x = -hop * 0.28;
      legR.knee.rotation.x = -hop * 0.28;
    }
  }

  update(0);
  return { group, update };
}
```


## `src/wedding/guests.js`

```javascript
import * as THREE from "three";
import { PAL } from "./shared.js";

/* ------------------------------------------------------------------ *
 *  guests.js  —  wedding onlookers / baraatis lining the procession.  *
 *  createGuest({ variant, phase }) -> { group, update }               *
 *  ONE reusable stylized ~1.7m human in royal Indian attire.          *
 *  Men: sherwani/kurta + turban.  Women: lehenga/sari + dupatta.      *
 *  Variants: clapping | namaste | cheering | showering (def clapping).*
 *  Faces +Z.  < 680 tris, materials & geometry shared across copies.  *
 * ------------------------------------------------------------------ */

/* ---- shared geometry (built once, reused by every guest) ---------- */
const G = {
  legM:      new THREE.CylinderGeometry(0.055, 0.062, 0.5, 6),
  shoe:      new THREE.BoxGeometry(0.09, 0.05, 0.17),
  coat:      new THREE.CylinderGeometry(0.155, 0.24, 0.62, 8, 1, true),
  coatHem:   new THREE.CylinderGeometry(0.245, 0.258, 0.06, 8, 1, true),
  torso:     new THREE.CylinderGeometry(0.14, 0.18, 0.4, 8),
  skirt:     new THREE.CylinderGeometry(0.13, 0.5, 0.9, 10, 1, true),
  skirtHem:  new THREE.CircleGeometry(0.5, 10),
  skirtBand: new THREE.CylinderGeometry(0.5, 0.52, 0.07, 10, 1, true),
  waistBand: new THREE.CylinderGeometry(0.185, 0.19, 0.05, 10, 1, true),
  neck:      new THREE.CylinderGeometry(0.04, 0.045, 0.08, 6, 1, true),
  head:      new THREE.SphereGeometry(0.108, 7, 5),
  nose:      new THREE.ConeGeometry(0.02, 0.05, 4),
  turban:    new THREE.SphereGeometry(0.135, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.62),
  turbanBnd: new THREE.TorusGeometry(0.135, 0.032, 3, 8),
  plume:     new THREE.ConeGeometry(0.03, 0.13, 5),
  jewel:     new THREE.IcosahedronGeometry(0.028, 0),
  hairCap:   new THREE.SphereGeometry(0.118, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.6),
  sideHair:  new THREE.SphereGeometry(0.05, 5, 4),
  braid:     new THREE.CylinderGeometry(0.032, 0.016, 0.3, 6),
  bindi:     new THREE.CircleGeometry(0.012, 6),
  earring:   new THREE.IcosahedronGeometry(0.018, 0),
  necklace:  new THREE.TorusGeometry(0.07, 0.012, 3, 8),
  upper:     new THREE.CylinderGeometry(0.05, 0.044, 0.26, 6, 1, true),
  fore:      new THREE.CylinderGeometry(0.044, 0.038, 0.24, 6, 1, true),
  hand:      new THREE.SphereGeometry(0.048, 5, 4),
  cuff:      new THREE.CylinderGeometry(0.05, 0.05, 0.025, 6, 1, true),
  sash:      new THREE.BoxGeometry(0.42, 0.12, 0.03),
  dupatta:   new THREE.PlaneGeometry(0.34, 0.62),
  dupTrim:   new THREE.PlaneGeometry(0.34, 0.04),
  petal:     new THREE.PlaneGeometry(0.03, 0.045),
};

/* ---- shared materials -------------------------------------------- */
const std = (color, rough = 0.82, metal = 0.04, extra) =>
  new THREE.MeshStandardMaterial(Object.assign({ color, roughness: rough, metalness: metal }, extra));

const M = {
  skin:   std(PAL.skin, 0.78, 0.0),
  hair:   std(0x1a1108, 0.6, 0.05),
  cream:  std(PAL.cream, 0.85, 0.0),
  bronze: std(PAL.bronze, 0.6, 0.35),
  ivory:  std(PAL.ivory, 0.72, 0.03, { side: THREE.DoubleSide }),
  gold:   std(PAL.gold, 0.34, 0.9, { emissive: PAL.brass, emissiveIntensity: 0.3 }),
  goldB:  std(PAL.goldBright, 0.3, 0.85, { emissive: PAL.gold, emissiveIntensity: 0.5 }),
  burg:   std(PAL.burgundy, 0.82, 0.04),
  marigold: std(PAL.marigold, 0.6, 0.0, { emissive: PAL.marigoldDeep, emissiveIntensity: 0.25 }),
  petalA: std(PAL.marigold, 0.55, 0.0, { emissive: PAL.marigoldDeep, emissiveIntensity: 0.35, side: THREE.DoubleSide }),
  petalB: std(PAL.rose, 0.6, 0.0, { emissive: PAL.crimson, emissiveIntensity: 0.2, side: THREE.DoubleSide }),
};

/* vibrant festive attire colours — shared across instances that pick
   the same swatch — always paired with gold/burgundy trims.          */
const COATS = [
  std(0x3b5bdb, 0.8, 0.05), // royal blue
  std(0x099268, 0.8, 0.05), // emerald
  std(PAL.crimson, 0.8, 0.05),
  std(0x0ca678, 0.8, 0.05), // teal
  std(0x7048e8, 0.8, 0.05), // violet
  std(PAL.marigoldDeep, 0.8, 0.05),
];
const SKIRTS = [
  std(0xd6336c, 0.82, 0.04), // magenta
  std(0x099268, 0.82, 0.04), // emerald
  std(0x3b5bdb, 0.82, 0.04), // royal blue
  std(PAL.crimson, 0.82, 0.04),
  std(0x7048e8, 0.82, 0.04), // violet
  std(PAL.marigold, 0.82, 0.04),
];

const pick = (arr) => arr[(Math.random() * arr.length) | 0];

/* ------------------------------------------------------------------ *
 *  Two-segment arm.  side: -1 left, +1 right.  Shoulder pivot rotates *
 *  (x forward/back, z inward/out); foreGroup adds an elbow bend.      *
 * ------------------------------------------------------------------ */
function makeArm(side, sleeveMat) {
  const shoulder = new THREE.Group();
  shoulder.position.set(side * 0.15, 1.3, 0);

  const upper = new THREE.Mesh(G.upper, sleeveMat);
  upper.position.y = -0.13;
  shoulder.add(upper);

  const fore = new THREE.Group();
  fore.position.y = -0.26;
  shoulder.add(fore);

  const foreArm = new THREE.Mesh(G.fore, M.skin);
  foreArm.position.y = -0.12;
  fore.add(foreArm);

  const cuff = new THREE.Mesh(G.cuff, M.gold);
  cuff.position.y = -0.225;
  fore.add(cuff);

  const hand = new THREE.Mesh(G.hand, M.skin);
  hand.position.y = -0.25;
  fore.add(hand);

  return { shoulder, fore };
}

/* ------------------------------------------------------------------ *
 *  MAIN EXPORT                                                        *
 * ------------------------------------------------------------------ */
export function createGuest(opts = {}) {
  const phase = opts.phase || 0;
  const V = { clapping: 1, namaste: 1, cheering: 1, showering: 1 }[opts.variant]
    ? opts.variant : "clapping";
  const female = typeof opts.gender === "string"
    ? opts.gender === "female" : Math.random() < 0.5;

  const group = new THREE.Group();
  // inner pivot carries the whole figure; main.js keeps the outer
  // group's world position / rotation.y, update() only touches `body`.
  const body = new THREE.Group();
  group.add(body);

  const add = (geo, mat, x, y, z, parent) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    (parent || body).add(m);
    return m;
  };

  const attire = female ? pick(SKIRTS) : pick(COATS);

  /* ---- lower body -------------------------------------------------- */
  if (female) {
    const skirt = add(G.skirt, attire, 0, 0.47, 0);
    skirt.rotation.y = Math.PI / 12;
    const hem = add(G.skirtHem, M.burg, 0, 0.02, 0);
    hem.rotation.x = -Math.PI / 2;
    add(G.skirtBand, M.gold, 0, 0.06, 0);       // gold hem band
    add(G.waistBand, M.goldB, 0, 0.94, 0);      // gold waistband
  } else {
    add(G.legM, M.cream, -0.085, 0.27, 0);
    add(G.legM, M.cream, 0.085, 0.27, 0);
    add(G.shoe, M.bronze, -0.085, 0.03, 0.03);
    add(G.shoe, M.bronze, 0.085, 0.03, 0.03);
    // long sherwani coat over the legs
    add(G.coat, attire, 0, 0.7, 0);
    add(G.coatHem, M.gold, 0, 0.42, 0);         // gold hem trim
  }

  /* ---- torso ------------------------------------------------------- */
  add(G.torso, attire, 0, 1.16, 0);
  // gold collar / neckline trim
  const collar = add(new THREE.TorusGeometry(0.1, 0.02, 3, 8), M.goldB, 0, 1.34, 0);
  collar.rotation.x = Math.PI / 2;

  if (female) {
    // dupatta drape falling over the left shoulder to the back
    const dup = add(G.dupatta, M.ivory, -0.14, 1.12, -0.02);
    dup.rotation.set(0.12, 0.32, 0.14);
    const dupT = add(G.dupTrim, M.goldB, -0.14, 0.83, -0.02);
    dupT.rotation.set(0.12, 0.32, 0.14);
    add(G.necklace, M.gold, 0, 1.33, 0.04).rotation.x = Math.PI / 2;
  } else {
    // sherwani sash across the chest + gold waist band
    const sash = add(G.sash, M.burg, 0, 1.12, 0.17);
    sash.rotation.z = 0.6;
    add(new THREE.CylinderGeometry(0.185, 0.185, 0.05, 8, 1, true), M.gold, 0, 0.98, 0);
  }

  /* ---- head & neck ------------------------------------------------- */
  add(G.neck, M.skin, 0, 1.4, 0.004);
  const head = add(G.head, M.skin, 0, 1.51, 0.008);
  head.scale.set(0.96, 1.05, 0.98);
  const nose = add(G.nose, M.skin, 0, 1.5, 0.1);
  nose.rotation.x = Math.PI / 2;

  if (female) {
    const cap = add(G.hairCap, M.hair, 0, 1.52, -0.012);
    cap.scale.set(1.0, 1.04, 1.02);
    add(G.sideHair, M.hair, -0.082, 1.47, -0.02);
    add(G.sideHair, M.hair, 0.082, 1.47, -0.02);
    const braid = add(G.braid, M.hair, 0, 1.3, -0.1);
    braid.rotation.x = -0.15;
    add(G.bindi, M.goldB, 0, 1.535, 0.098);
    add(G.earring, M.goldB, -0.098, 1.46, 0.03);
    add(G.earring, M.goldB, 0.098, 1.46, 0.03);
    // maang-tikka jewel on the parting
    add(G.jewel, M.goldB, 0, 1.6, 0.06).scale.setScalar(0.6);
  } else {
    const turban = add(G.turban, attire, 0, 1.6, -0.005);
    turban.scale.y = 0.82;
    const band = add(G.turbanBnd, M.burg, 0, 1.58, 0);
    band.rotation.x = Math.PI / 2 + 0.16;
    // upright kalgi plume + brooch
    const tuft = add(G.plume, M.marigold, 0, 1.77, -0.04);
    tuft.rotation.x = -0.35;
    add(G.jewel, M.goldB, 0, 1.6, 0.12); // turban brooch
  }

  /* ---- arms -------------------------------------------------------- */
  const sleeveMat = attire;
  const armL = makeArm(-1, sleeveMat);
  const armR = makeArm(1, sleeveMat);
  body.add(armL.shoulder, armR.shoulder);
  if (female) {
    // bangle stacks at the wrists
    const bL = new THREE.Mesh(G.cuff, M.goldB); bL.position.y = -0.19; armL.fore.add(bL);
    const bR = new THREE.Mesh(G.cuff, M.goldB); bR.position.y = -0.19; armR.fore.add(bR);
  }

  /* ---- flower petals (showering only) ------------------------------ */
  let petals = null;
  if (V === "showering") {
    petals = [];
    const pg = new THREE.Group();
    body.add(pg);
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(G.petal, i % 2 ? M.petalA : M.petalB);
      const x0 = (Math.random() - 0.5) * 0.34;
      const z0 = 0.28 + Math.random() * 0.14;
      const y0 = 1.55 + Math.random() * 0.15;
      m.position.set(x0, y0, z0);
      pg.add(m);
      petals.push({ m, x0, y0, z0, sp: 0.25 + Math.random() * 0.2, ph: Math.random() });
    }
  }

  /* ---- base pose (also the still silhouette before first update) --- */
  // set once so a non-animated frame still looks right
  applyPose(V, armL, armR, 0, phase);

  /* ---- animation --------------------------------------------------- */
  function update(t) {
    // gentle celebratory idle (subtler than the dancers)
    body.position.y = (Math.sin(t * 2.2 + phase) * 0.5 + 0.5) * 0.02;
    body.rotation.set(0, 0, 0);
    applyPose(V, armL, armR, t, phase);

    if (V === "namaste") {
      body.rotation.x = 0.05 + (Math.sin(t * 0.8 + phase) * 0.5 + 0.5) * 0.06; // slow bow
      body.rotation.y = Math.sin(t * 0.5 + phase) * 0.03;
    } else if (V === "cheering") {
      body.rotation.z = Math.sin(t * 2.0 + phase) * 0.05;  // weight shift
      body.position.x = Math.sin(t * 2.0 + phase) * 0.03;
    } else if (V === "clapping") {
      body.position.y += (Math.sin(t * 4.0 + phase) * 0.5 + 0.5) * 0.012; // clap bounce
    } else if (V === "showering") {
      body.rotation.y = Math.sin(t * 1.2 + phase) * 0.05;
      for (const p of petals) {
        const lt = (t * p.sp + p.ph) % 1;
        p.m.position.set(
          p.x0 + Math.sin(lt * 6.0 + p.ph * 6) * 0.06,
          p.y0 - lt * 0.75,
          p.z0 + lt * 0.28
        );
        p.m.rotation.set(lt * 7.0, lt * 5.0 + p.ph, p.ph * 3.0);
      }
    }
  }

  return { group, update };
}

/* ------------------------------------------------------------------ *
 *  Pose driver — writes shoulder & elbow rotations per variant/frame. *
 * ------------------------------------------------------------------ */
function applyPose(V, L, R, t, phase) {
  if (V === "namaste") {
    // hands pressed together at the chest, forearms up & inward
    L.shoulder.rotation.set(-0.9, 0, 0.52);
    R.shoulder.rotation.set(-0.9, 0, -0.52);
    L.fore.rotation.x = -1.15;
    R.fore.rotation.x = -1.15;
  } else if (V === "clapping") {
    // both arms forward; hands clap together and apart
    const c = Math.sin(t * 4.0 + phase);
    const inward = 0.36 + c * 0.13;
    L.shoulder.rotation.set(-1.12, 0, inward);
    R.shoulder.rotation.set(-1.12, 0, -inward);
    L.fore.rotation.x = -0.72;
    R.fore.rotation.x = -0.72;
  } else if (V === "cheering") {
    // right arm raised & waving, left relaxed low
    const w = Math.sin(t * 6.0 + phase);
    R.shoulder.rotation.set(-2.5 + w * 0.14, 0, -0.2 + w * 0.36);
    R.fore.rotation.x = -0.2 + w * 0.1;
    L.shoulder.rotation.set(-0.12, 0, 0.16 + Math.sin(t * 2.0 + phase) * 0.05);
    L.fore.rotation.x = -0.45;
  } else {
    // showering — arms forward-and-up in an alternating scattering flick
    const sL = Math.sin(t * 3.0 + phase);
    const sR = Math.sin(t * 3.0 + phase + 1.1);
    L.shoulder.rotation.set(-1.7 + sL * 0.28, 0, 0.16);
    R.shoulder.rotation.set(-1.7 + sR * 0.28, 0, -0.16);
    L.fore.rotation.x = -0.35 - sL * 0.18;
    R.fore.rotation.x = -0.35 - sR * 0.18;
  }
}
```


## `src/wedding/decor.js`

```javascript
import * as THREE from "three";
import { PAL } from "./shared.js";

// ---------------------------------------------------------------------------
// Small reusable ceremonial props for the royal Indian wedding world.
// Every builder returns either a THREE.Group (static) or { group, update }.
// Origin at (0,0,0), rests on the ground (lowest point ~y=0), grows +y,
// front faces +Z. Each asset is tiny and cheap (< 400 tris) and shares
// materials across its own repeated parts.
// ---------------------------------------------------------------------------

// -- shared material factories (one instance per part-type, reused inside asset)
function brassMat() {
  return new THREE.MeshStandardMaterial({
    color: PAL.brass, metalness: 0.9, roughness: 0.35,
  });
}
function goldMat() {
  return new THREE.MeshStandardMaterial({
    color: PAL.gold, metalness: 0.85, roughness: 0.3,
  });
}

// ===========================================================================
// createDiya(): tiny brass oil lamp with a glowing teardrop flame. ~0.25 tall.
// ===========================================================================
export function createDiya() {
  const group = new THREE.Group();

  // Bowl via lathe (shallow dish with an inner well).
  const bowlProfile = [
    new THREE.Vector2(0.00, 0.00),
    new THREE.Vector2(0.060, 0.00),
    new THREE.Vector2(0.078, 0.055),
    new THREE.Vector2(0.062, 0.058),
    new THREE.Vector2(0.045, 0.022),
    new THREE.Vector2(0.00, 0.020),
  ];
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry(bowlProfile, 12),
    brassMat()
  );
  group.add(bowl);

  // Teardrop flame (lathe profile), emissive so bloom catches it.
  const flameProfile = [
    new THREE.Vector2(0.000, 0.000),
    new THREE.Vector2(0.020, 0.018),
    new THREE.Vector2(0.033, 0.045),
    new THREE.Vector2(0.026, 0.080),
    new THREE.Vector2(0.011, 0.115),
    new THREE.Vector2(0.000, 0.150),
  ];
  const flame = new THREE.Mesh(
    new THREE.LatheGeometry(flameProfile, 8),
    new THREE.MeshStandardMaterial({
      color: PAL.flame, emissive: PAL.flame, emissiveIntensity: 1.3,
      roughness: 0.6, metalness: 0.0,
    })
  );
  flame.position.y = 0.03;
  group.add(flame);

  return group;
}

// ===========================================================================
// createLantern(): ornate hanging lantern, gold cage + amber glass + inner
// glow + top hang-ring. ~0.6 tall. Animated flame-flicker.
// ===========================================================================
export function createLantern() {
  const group = new THREE.Group();
  const gold = goldMat();

  // Amber/burgundy translucent glass body (hexagonal, open-ended).
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.17, 0.34, 6, 1, true),
    new THREE.MeshStandardMaterial({
      color: PAL.marigold, emissive: PAL.marigoldDeep, emissiveIntensity: 0.3,
      transparent: true, opacity: 0.5, roughness: 0.5, metalness: 0.1,
      side: THREE.DoubleSide,
    })
  );
  glass.position.y = 0.21;
  group.add(glass);

  // Emissive inner core (flickers).
  const coreMat = new THREE.MeshStandardMaterial({
    color: PAL.jasmine, emissive: PAL.flame, emissiveIntensity: 1.1,
    roughness: 0.5, metalness: 0.0,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), coreMat);
  core.position.y = 0.21;
  group.add(core);

  // Gold rings top & bottom (short hex cylinders).
  const ringGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.03, 6);
  const bottomRing = new THREE.Mesh(ringGeo, gold);
  bottomRing.position.y = 0.045;
  group.add(bottomRing);
  const topRing = new THREE.Mesh(ringGeo, gold);
  topRing.position.y = 0.37;
  group.add(topRing);

  // Six vertical cage bars along the hex edges.
  const barGeo = new THREE.BoxGeometry(0.015, 0.34, 0.015);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const bar = new THREE.Mesh(barGeo, gold);
    bar.position.set(Math.cos(a) * 0.165, 0.21, Math.sin(a) * 0.165);
    group.add(bar);
  }

  // Domed gold roof + finial.
  const dome = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.13, 6), gold);
  dome.position.y = 0.44;
  group.add(dome);
  const finial = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), gold);
  finial.position.y = 0.52;
  group.add(finial);

  // Top hang-ring.
  const hangRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.035, 0.012, 4, 10), gold
  );
  hangRing.position.y = 0.56;
  group.add(hangRing);

  const update = (t) => {
    coreMat.emissiveIntensity =
      1.1 + Math.sin(t * 9.0) * 0.15 + Math.sin(t * 23.0) * 0.06;
  };

  return { group, update };
}

// ===========================================================================
// createHangingGarland(length, style): beaded strand that sags in a catenary.
// Ends at x = -length/2 and +length/2 (y=0), center dips to ~ -length*0.12.
// style: "marigold" | "jasmine" | "mixed". Returns a Group.
// ===========================================================================
export function createHangingGarland(length = 3, style = "mixed") {
  const group = new THREE.Group();

  const marigold = new THREE.MeshStandardMaterial({
    color: PAL.marigold, emissive: PAL.marigoldDeep, emissiveIntensity: 0.25,
    roughness: 0.7, metalness: 0.0,
  });
  const marigoldDeep = new THREE.MeshStandardMaterial({
    color: PAL.marigoldDeep, roughness: 0.75, metalness: 0.0,
  });
  const jasmine = new THREE.MeshStandardMaterial({
    color: PAL.jasmine, emissive: PAL.jasmine, emissiveIntensity: 0.12,
    roughness: 0.75, metalness: 0.0,
  });

  let palette;
  if (style === "marigold") palette = [marigold, marigoldDeep];
  else if (style === "jasmine") palette = [jasmine, jasmine];
  else palette = [marigold, jasmine];

  const sag = length * 0.12;
  const count = Math.min(18, Math.max(6, Math.round(length / 0.18)));
  const beadGeo = new THREE.IcosahedronGeometry(0.05, 0);

  for (let i = 0; i < count; i++) {
    const u = count === 1 ? 0 : (i / (count - 1)) * 2 - 1; // -1..1
    const x = u * (length / 2);
    const y = -sag * (1 - u * u); // parabolic (catenary-like) sag
    const bead = new THREE.Mesh(beadGeo, palette[i % palette.length]);
    bead.position.set(x, y, 0);
    const s = 0.85 + Math.random() * 0.4;
    bead.scale.setScalar(s);
    bead.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    group.add(bead);
  }

  return group;
}

// ===========================================================================
// createKalash(): auspicious brass pot + coconut + mango leaves + red thread.
// ~0.5 tall. Returns a Group.
// ===========================================================================
export function createKalash() {
  const group = new THREE.Group();

  // Brass pot (lathe).
  const potProfile = [
    new THREE.Vector2(0.00, 0.00),
    new THREE.Vector2(0.07, 0.00),
    new THREE.Vector2(0.11, 0.10),
    new THREE.Vector2(0.095, 0.20),
    new THREE.Vector2(0.055, 0.255),
    new THREE.Vector2(0.085, 0.30),
    new THREE.Vector2(0.062, 0.305),
    new THREE.Vector2(0.045, 0.27),
    new THREE.Vector2(0.00, 0.26),
  ];
  const pot = new THREE.Mesh(new THREE.LatheGeometry(potProfile, 12), brassMat());
  group.add(pot);

  // Mango leaves ringing the rim (flattened cones, tilted outward/up).
  const leafMat = new THREE.MeshStandardMaterial({
    color: PAL.leaf, roughness: 0.65, metalness: 0.0,
  });
  const leafGeo = new THREE.ConeGeometry(0.05, 0.2, 4);
  const leafCount = 6;
  for (let i = 0; i < leafCount; i++) {
    const a = (i / leafCount) * Math.PI * 2;
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.scale.set(1, 1, 0.35); // flatten into a leaf blade
    leaf.position.set(Math.cos(a) * 0.075, 0.33, Math.sin(a) * 0.075);
    leaf.rotation.y = -a;
    leaf.rotation.z = Math.cos(a) * 0.5;
    leaf.rotation.x = Math.sin(a) * 0.5;
    group.add(leaf);
  }

  // Coconut nestled in the rim.
  const coconut = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 10, 7),
    new THREE.MeshStandardMaterial({
      color: PAL.bronze, roughness: 0.85, metalness: 0.0,
    })
  );
  coconut.position.y = 0.35;
  group.add(coconut);

  // Red sacred thread around the neck.
  const thread = new THREE.Mesh(
    new THREE.TorusGeometry(0.072, 0.008, 4, 12),
    new THREE.MeshStandardMaterial({
      color: PAL.crimson, roughness: 0.8, metalness: 0.0,
    })
  );
  thread.rotation.x = Math.PI / 2;
  thread.position.y = 0.235;
  group.add(thread);

  return group;
}

// ===========================================================================
// createPetalTray(): shallow brass tray heaped with loose marigold petals.
// ~0.4 wide. Returns a Group.
// ===========================================================================
export function createPetalTray() {
  const group = new THREE.Group();

  // Shallow tray.
  const tray = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.19, 0.025, 12),
    brassMat()
  );
  tray.position.y = 0.0125;
  group.add(tray);

  // Scattered petals (tiny tilted discs), double-sided so visible from above.
  const petalMats = [
    new THREE.MeshStandardMaterial({
      color: PAL.marigold, emissive: PAL.marigoldDeep, emissiveIntensity: 0.2,
      roughness: 0.7, metalness: 0.0, side: THREE.DoubleSide,
    }),
    new THREE.MeshStandardMaterial({
      color: PAL.saffron, roughness: 0.7, metalness: 0.0,
      side: THREE.DoubleSide,
    }),
    new THREE.MeshStandardMaterial({
      color: PAL.jasmine, roughness: 0.75, metalness: 0.0,
      side: THREE.DoubleSide,
    }),
  ];
  const petalGeo = new THREE.CircleGeometry(0.03, 6);
  const petalCount = 24;
  for (let i = 0; i < petalCount; i++) {
    const petal = new THREE.Mesh(petalGeo, petalMats[i % petalMats.length]);
    const r = Math.sqrt(Math.random()) * 0.17;
    const a = Math.random() * Math.PI * 2;
    petal.position.set(Math.cos(a) * r, 0.026 + Math.random() * 0.03, Math.sin(a) * r);
    petal.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    petal.rotation.z = Math.random() * Math.PI * 2;
    petal.scale.setScalar(0.7 + Math.random() * 0.6);
    group.add(petal);
  }

  return group;
}

```


## `src/wedding/ground.js`

```javascript
// ground.js — ceremonial carpet runner + rangoli medallion
// Ancient royal Indian wedding ground dressing.
import * as THREE from "three";
import { PAL } from "./shared.js";

function hex(c) {
  return "#" + c.toString(16).padStart(6, "0");
}

// ---------------------------------------------------------------------------
// Cross-section texture for the runner.  U (canvas X) maps ACROSS the width:
//   sand margin | gold border | burgundy carpet | gold border | sand margin
// Two canvases: colour map + emissive mask (gold bands glow under bloom).
// ---------------------------------------------------------------------------
function makeRunnerTextures(width, marginW, gold) {
  const full = width + marginW * 2; // total cross-width
  const CW = 256, CH = 64;
  const col = document.createElement("canvas");
  col.width = CW; col.height = CH;
  const cx = col.getContext("2d");
  const em = document.createElement("canvas");
  em.width = CW; em.height = CH;
  const ex = em.getContext("2d");

  // fractional boundaries across the full width
  const m = marginW / full;          // margin end
  const g = m + gold / full;         // gold band end (left)
  const gR = 1 - g, mR = 1 - m;      // mirrored (right)

  ex.fillStyle = "#000";
  ex.fillRect(0, 0, CW, CH);

  for (let px = 0; px < CW; px++) {
    const f = px / CW; // 0..1 across width
    let color;
    let glow = null;
    if (f < m || f > mR) {
      // lighter marble / sand margin
      color = hex(PAL.cream);
    } else if (f < g || f > gR) {
      // gold border stripe
      color = hex(PAL.gold);
      glow = hex(PAL.goldBright);
    } else {
      // burgundy carpet field
      color = hex(PAL.burgundy);
    }
    cx.fillStyle = color;
    cx.fillRect(px, 0, 1, CH);
    if (glow) {
      ex.fillStyle = glow;
      ex.fillRect(px, 0, 1, CH);
    }
  }

  // subtle woven variation + a faint jasmine centre-line motif along length
  const midA = Math.floor(CW * (g + 0.02));
  const midB = Math.floor(CW * (gR - 0.02));
  for (let py = 0; py < CH; py++) {
    // faint horizontal weave banding on the carpet
    const shade = (py % 6 < 3) ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.03)";
    cx.fillStyle = shade;
    cx.fillRect(midA, py, midB - midA, 1);
  }
  // small repeating gold diamond motif down the centre
  cx.fillStyle = hex(PAL.goldBright);
  const midC = CW * 0.5;
  for (let py = 4; py < CH; py += 16) {
    cx.beginPath();
    cx.moveTo(midC, py);
    cx.lineTo(midC + 5, py + 5);
    cx.lineTo(midC, py + 10);
    cx.lineTo(midC - 5, py + 5);
    cx.closePath();
    cx.fill();
  }

  const map = new THREE.CanvasTexture(col);
  map.wrapS = THREE.ClampToEdgeWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 4;
  const emap = new THREE.CanvasTexture(em);
  emap.wrapS = THREE.ClampToEdgeWrapping;
  emap.wrapT = THREE.RepeatWrapping;
  return { map, emap };
}

// resample a [[x,z],...] polyline to roughly-even spacing
function resample(points, step) {
  const out = [];
  if (!points || points.length < 2) return out;
  out.push({ x: points[0][0], z: points[0][1] });
  let carry = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const ax = points[i][0], az = points[i][1];
    const bx = points[i + 1][0], bz = points[i + 1][1];
    const dx = bx - ax, dz = bz - az;
    const segLen = Math.hypot(dx, dz);
    if (segLen < 1e-5) continue;
    const ux = dx / segLen, uz = dz / segLen;
    let d = step - carry;
    while (d < segLen) {
      out.push({ x: ax + ux * d, z: az + uz * d });
      d += step;
    }
    carry = segLen - (d - step);
  }
  const last = points[points.length - 1];
  out.push({ x: last[0], z: last[1] });
  return out;
}

export function createCeremonialPath(opts) {
  const group = new THREE.Group();
  const points = opts.points || [];
  const width = opts.width || 4;
  const getHeight = opts.getHeight || (() => 0);
  const marginW = width * 0.16;
  const goldW = width * 0.05;
  const half = width * 0.5 + marginW; // full half-width incl. margin

  const samples = resample(points, 1.5);
  if (samples.length < 2) return group;

  const N = samples.length;
  // Sample the terrain ACROSS the width too, not just at the two edges — otherwise
  // the carpet is a flat chord between its edges and any crown in the ground
  // between them pokes straight through the middle.
  const CROSS = 9;
  const LIFT = 0.32;
  const pos = new Float32Array(N * CROSS * 3);
  const uv = new Float32Array(N * CROSS * 2);
  const idx = [];
  const vScale = 3.0; // texture length repeat (~3 units)

  let arc = 0;
  for (let i = 0; i < N; i++) {
    const p = samples[i];
    const prev = samples[Math.max(0, i - 1)];
    const next = samples[Math.min(N - 1, i + 1)];
    let tx = next.x - prev.x, tz = next.z - prev.z;
    const tl = Math.hypot(tx, tz) || 1;
    tx /= tl; tz /= tl;
    // perpendicular in XZ
    const px = -tz, pz = tx;
    if (i > 0) arc += Math.hypot(p.x - samples[i - 1].x, p.z - samples[i - 1].z);

    for (let j = 0; j < CROSS; j++) {
      const f = j / (CROSS - 1); // 0..1 across the strip (matches the texture U)
      const off = (f - 0.5) * 2 * half;
      const vx = p.x + px * off, vz = p.z + pz * off;
      const vy = getHeight(vx, vz) + LIFT;
      const b = (i * CROSS + j) * 3;
      pos[b] = vx; pos[b + 1] = vy; pos[b + 2] = vz;
      const u = (i * CROSS + j) * 2;
      uv[u] = f; uv[u + 1] = arc / vScale;
    }

    if (i < N - 1) {
      for (let j = 0; j < CROSS - 1; j++) {
        const a0 = i * CROSS + j, a1 = a0 + 1;
        const b0 = (i + 1) * CROSS + j, b1 = b0 + 1;
        idx.push(a0, b0, a1, a1, b0, b1);
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  const { map, emap } = makeRunnerTextures(width, marginW, goldW);
  const mat = new THREE.MeshStandardMaterial({
    map,
    emissiveMap: emap,
    emissive: PAL.goldBright,
    emissiveIntensity: 0.45,
    roughness: 0.82,
    metalness: 0.0,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

// ---------------------------------------------------------------------------
// Rangoli medallion — flat circular mandala facing +Y.
// ---------------------------------------------------------------------------
function makeRangoliTexture() {
  const S = 512;
  const cv = document.createElement("canvas");
  cv.width = S; cv.height = S;
  const g = cv.getContext("2d");
  const c = S / 2;

  const burgundy = hex(PAL.burgundy);
  const gold = hex(PAL.gold);
  const goldB = hex(PAL.goldBright);
  const white = hex(PAL.jasmine);
  const marigold = hex(PAL.marigold);
  const saffron = hex(PAL.saffron);

  // background field
  g.fillStyle = hex(PAL.cream);
  g.beginPath(); g.arc(c, c, S * 0.5, 0, Math.PI * 2); g.fill();
  g.fillStyle = burgundy;
  g.beginPath(); g.arc(c, c, S * 0.48, 0, Math.PI * 2); g.fill();

  // concentric rings
  const ring = (r, w, col) => {
    g.strokeStyle = col; g.lineWidth = w;
    g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
  };
  ring(S * 0.46, 6, goldB);
  ring(S * 0.44, 3, white);
  ring(S * 0.30, 5, gold);
  ring(S * 0.20, 3, white);

  // outer petal ring (marigold)
  const petals = (count, rIn, rOut, wPet, fill, stroke) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const mx = c + Math.cos(a) * (rIn + rOut) * 0.5;
      const my = c + Math.sin(a) * (rIn + rOut) * 0.5;
      g.save();
      g.translate(mx, my);
      g.rotate(a + Math.PI / 2);
      g.fillStyle = fill;
      g.strokeStyle = stroke;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(0, 0, wPet, (rOut - rIn) * 0.5, 0, 0, Math.PI * 2);
      g.fill(); g.stroke();
      g.restore();
    }
  };
  petals(24, S * 0.30, S * 0.44, S * 0.028, marigold, goldB);
  petals(16, S * 0.20, S * 0.30, S * 0.030, white, gold);
  petals(12, S * 0.08, S * 0.20, S * 0.034, saffron, goldB);

  // inner lotus core
  g.fillStyle = gold;
  g.beginPath(); g.arc(c, c, S * 0.08, 0, Math.PI * 2); g.fill();
  g.fillStyle = burgundy;
  g.beginPath(); g.arc(c, c, S * 0.05, 0, Math.PI * 2); g.fill();
  g.fillStyle = goldB;
  g.beginPath(); g.arc(c, c, S * 0.02, 0, Math.PI * 2); g.fill();

  // radiating gold spokes
  g.strokeStyle = goldB; g.lineWidth = 2;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    g.beginPath();
    g.moveTo(c + Math.cos(a) * S * 0.08, c + Math.sin(a) * S * 0.08);
    g.lineTo(c + Math.cos(a) * S * 0.20, c + Math.sin(a) * S * 0.20);
    g.stroke();
  }

  // emissive mask: gold parts glow
  const em = document.createElement("canvas");
  em.width = S; em.height = S;
  const eg = em.getContext("2d");
  eg.fillStyle = "#000";
  eg.fillRect(0, 0, S, S);
  eg.strokeStyle = goldB; eg.fillStyle = goldB;
  eg.lineWidth = 6;
  eg.beginPath(); eg.arc(c, c, S * 0.46, 0, Math.PI * 2); eg.stroke();
  eg.lineWidth = 5;
  eg.beginPath(); eg.arc(c, c, S * 0.30, 0, Math.PI * 2); eg.stroke();
  eg.beginPath(); eg.arc(c, c, S * 0.02, 0, Math.PI * 2); eg.fill();
  eg.lineWidth = 2;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    eg.beginPath();
    eg.moveTo(c + Math.cos(a) * S * 0.08, c + Math.sin(a) * S * 0.08);
    eg.lineTo(c + Math.cos(a) * S * 0.20, c + Math.sin(a) * S * 0.20);
    eg.stroke();
  }

  const map = new THREE.CanvasTexture(cv);
  const emap = new THREE.CanvasTexture(em);
  return { map, emap };
}

export function createRangoli(radius) {
  const group = new THREE.Group();
  const r = radius || 3;
  const geo = new THREE.CircleGeometry(r, 48);
  const { map, emap } = makeRangoliTexture();
  const mat = new THREE.MeshStandardMaterial({
    map,
    emissiveMap: emap,
    emissive: PAL.goldBright,
    emissiveIntensity: 0.6,
    roughness: 0.7,
    metalness: 0.15,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2; // lie flat, face +Y
  mesh.position.y = 0.05;         // sit just above ground
  mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}
```


## `src/wedding/atmosphere.js`

```javascript
import * as THREE from "three";
import { PAL } from "./shared.js";

/*
  atmosphere.js — cinematic golden-hour magic for the royal Indian wedding world.

  Exports:
    createPetalSystem(opts)   -> { group, update(t, dt) }
    createVolumetricRays(opts)-> { group, update(t) }
    ATMOSPHERE_PARAMS         -> recommended scene/render settings for main.js

  No THREE lights are added here (main.js owns lighting). Materials rely on the
  scene's ACESFilmic + UnrealBloom to glow.
*/

// ----------------------------------------------------------------------------
// Small helpers
// ----------------------------------------------------------------------------
const _tmpColor = new THREE.Color();

function pickWeighted(list) {
  // list: array of [colorHex, weight]
  let total = 0;
  for (let i = 0; i < list.length; i++) total += list[i][1];
  let r = Math.random() * total;
  for (let i = 0; i < list.length; i++) {
    r -= list[i][1];
    if (r <= 0) return list[i][0];
  }
  return list[list.length - 1][0];
}

// ----------------------------------------------------------------------------
// PETAL SYSTEM
//   ONE InstancedMesh of curled petal quads that drift down, sway, spin, and
//   respawn at the top once they sink to ground level.
// ----------------------------------------------------------------------------
export function createPetalSystem(opts = {}) {
  const area = opts.area || { cx: 0, cz: 0, radius: 24 };
  const cx = area.cx || 0;
  const cz = area.cz || 0;
  const radius = area.radius || 24;
  const top = opts.top != null ? opts.top : 14;
  const getHeight =
    typeof opts.getHeight === "function" ? opts.getHeight : () => 0;

  const COUNT = 70;

  // --- Petal geometry: a small curled quad (bent across its width) ----------
  const petalGeo = new THREE.PlaneGeometry(0.16, 0.24, 2, 1);
  {
    const pos = petalGeo.attributes.position;
    const halfW = 0.08;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const u = x / halfW; // -1 .. 1 across width
      // trough curl across the width
      const z = 0.05 * (1 - u * u);
      // taper the tip so it reads petal-ish rather than rectangular
      const taper = 1 - 0.35 * Math.max(0, y / 0.12);
      pos.setX(i, x * taper);
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    petalGeo.computeVertexNormals();
  }

  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, // tinted per-instance via instanceColor
    roughness: 0.62,
    metalness: 0.0,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(PAL.marigold),
    emissiveIntensity: 0.18,
  });

  const mesh = new THREE.InstancedMesh(petalGeo, petalMat, COUNT);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;

  // Per-instance color palette (marigold / rose / jasmine / gold family)
  const palette = [
    [PAL.marigold, 4],
    [PAL.marigoldDeep, 2.5],
    [PAL.saffron, 2],
    [PAL.rose, 2.5],
    [PAL.jasmine, 2],
    [PAL.goldBright, 1.5],
    [PAL.gold, 1],
  ];

  // Per-instance state buffers
  const baseX = new Float32Array(COUNT);
  const baseZ = new Float32Array(COUNT);
  const posY = new Float32Array(COUNT);
  const fallV = new Float32Array(COUNT);
  const swayFreq = new Float32Array(COUNT);
  const swayPhase = new Float32Array(COUNT);
  const swayAmp = new Float32Array(COUNT);
  const swayFreq2 = new Float32Array(COUNT);
  const swayPhase2 = new Float32Array(COUNT);
  const swayAmp2 = new Float32Array(COUNT);
  const rotX = new Float32Array(COUNT);
  const rotY = new Float32Array(COUNT);
  const rotZ = new Float32Array(COUNT);
  const spinX = new Float32Array(COUNT);
  const spinY = new Float32Array(COUNT);
  const spinZ = new Float32Array(COUNT);
  const scl = new Float32Array(COUNT);

  function spawnDisk(i) {
    // uniform point in disk
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    baseX[i] = cx + Math.cos(a) * r;
    baseZ[i] = cz + Math.sin(a) * r;
  }

  const dummy = new THREE.Object3D();

  for (let i = 0; i < COUNT; i++) {
    spawnDisk(i);
    // stagger initial heights through the whole column so it starts full
    const groundY = getHeight(baseX[i], baseZ[i]);
    posY[i] = groundY + Math.random() * (top - groundY + 2);
    fallV[i] = 0.24 + Math.random() * 0.4;
    swayFreq[i] = 0.5 + Math.random() * 0.9;
    swayPhase[i] = Math.random() * Math.PI * 2;
    swayAmp[i] = 0.25 + Math.random() * 0.5;
    swayFreq2[i] = 0.4 + Math.random() * 0.8;
    swayPhase2[i] = Math.random() * Math.PI * 2;
    swayAmp2[i] = 0.2 + Math.random() * 0.45;
    rotX[i] = Math.random() * Math.PI * 2;
    rotY[i] = Math.random() * Math.PI * 2;
    rotZ[i] = Math.random() * Math.PI * 2;
    spinX[i] = (Math.random() - 0.5) * 1.6;
    spinY[i] = (Math.random() - 0.5) * 2.2;
    spinZ[i] = (Math.random() - 0.5) * 1.6;
    scl[i] = 0.75 + Math.random() * 0.8;

    _tmpColor.setHex(pickWeighted(palette));
    // slight per-instance brightness variation
    const v = 0.85 + Math.random() * 0.3;
    _tmpColor.multiplyScalar(v);
    mesh.setColorAt(i, _tmpColor);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  const group = new THREE.Group();
  group.add(mesh);

  function update(t, dt) {
    if (dt == null) dt = 0.016;
    // clamp dt so a paused/tab-switch frame doesn't teleport petals
    if (dt > 0.1) dt = 0.1;

    for (let i = 0; i < COUNT; i++) {
      posY[i] -= fallV[i] * dt;

      const x = baseX[i] + Math.sin(t * swayFreq[i] + swayPhase[i]) * swayAmp[i];
      const z =
        baseZ[i] + Math.cos(t * swayFreq2[i] + swayPhase2[i]) * swayAmp2[i];

      const groundY = getHeight(x, z);
      if (posY[i] <= groundY + 0.05) {
        // respawn at the top with a fresh disk position
        spawnDisk(i);
        posY[i] = top + Math.random() * 3;
        fallV[i] = 0.24 + Math.random() * 0.4;
        continue; // matrix updated next frame at new spot
      }

      rotX[i] += spinX[i] * dt;
      rotY[i] += spinY[i] * dt;
      rotZ[i] += spinZ[i] * dt;

      dummy.position.set(x, posY[i], z);
      dummy.rotation.set(rotX[i], rotY[i], rotZ[i]);
      dummy.scale.setScalar(scl[i]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  // prime matrices for frame 0
  update(0, 0);

  return { group, update };
}

// ----------------------------------------------------------------------------
// VOLUMETRIC SUN RAYS (god-rays)
//   A handful of large additive, low-opacity crossed quads angled down from the
//   sun direction. Cheap: shared geometry + a tiny gradient CanvasTexture.
// ----------------------------------------------------------------------------
export function createVolumetricRays(opts = {}) {
  const origin = opts.origin || [-60, 90, -40];
  const color = opts.color != null ? opts.color : PAL.flame;
  const count = Math.max(4, Math.min(10, opts.count || 8));

  const group = new THREE.Group();
  group.position.set(origin[0], origin[1], origin[2]);

  // Direction the shafts travel: from the sun toward the scene origin.
  const dir = new THREE.Vector3(-origin[0], -origin[1], -origin[2]).normalize();

  // --- soft vertical gradient texture (bright near sun, fading out) ---------
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    // v: 0 at top (near sun) -> 1 at bottom
    const v = y / (size - 1);
    const vFade = Math.pow(1 - v, 1.3); // brightest near the sun
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1); // 0..1 across width
      const hFeather = Math.sin(u * Math.PI); // 0 edges, 1 center
      const a = vFade * Math.pow(hFeather, 1.4);
      const idx = (y * size + x) * 4;
      img.data[idx] = 255;
      img.data[idx + 1] = 255;
      img.data[idx + 2] = 255;
      img.data[idx + 3] = Math.max(0, Math.min(255, a * 255));
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  // Shaft geometry: a long quad that extends downward from y=0.
  const SHAFT_LEN = 120;
  const SHAFT_W = 10;
  const shaftGeo = new THREE.PlaneGeometry(SHAFT_W, SHAFT_LEN, 1, 1);
  shaftGeo.translate(0, -SHAFT_LEN * 0.5, 0); // top edge at local origin (the sun)

  // Orientation quaternion: rotate local -Y (down) onto the ray direction.
  const downLocal = new THREE.Vector3(0, -1, 0);
  const alignQuat = new THREE.Quaternion().setFromUnitVectors(downLocal, dir);

  // A stable perpendicular axis to fan the shafts around the ray direction.
  const upRef = Math.abs(dir.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const perpAxis = new THREE.Vector3().crossVectors(dir, upRef).normalize();

  const shafts = [];

  for (let i = 0; i < count; i++) {
    // spread shafts in a shallow fan around the ray direction
    const spread = (i / (count - 1) - 0.5) * 0.5; // radians, ~+-0.25
    const fanQuat = new THREE.Quaternion().setFromAxisAngle(perpAxis, spread);

    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      map: tex,
      transparent: true,
      opacity: 0.05 + Math.random() * 0.04,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    // crossed pair so the shaft reads volumetric from any camera angle
    const pivot = new THREE.Group();
    pivot.quaternion.copy(fanQuat).multiply(alignQuat);

    const planeA = new THREE.Mesh(shaftGeo, mat);
    const planeB = new THREE.Mesh(shaftGeo, mat);
    // planeB rotated 90deg about the shaft's local length axis (local Y)
    planeB.rotation.y = Math.PI * 0.5;
    pivot.add(planeA, planeB);

    // gentle per-shaft scale variation
    const s = 0.7 + Math.random() * 0.7;
    pivot.scale.set(s, 1, 1);

    group.add(pivot);
    shafts.push({
      pivot,
      mat,
      baseOpacity: mat.opacity,
      shimmerSpeed: 0.3 + Math.random() * 0.7,
      shimmerPhase: Math.random() * Math.PI * 2,
      swayAxis: perpAxis.clone(),
      swayAmp: 0.02 + Math.random() * 0.04,
      swaySpeed: 0.15 + Math.random() * 0.25,
      swayPhase: Math.random() * Math.PI * 2,
      baseQuat: pivot.quaternion.clone(),
    });
  }

  const _q = new THREE.Quaternion();

  function update(t) {
    for (let i = 0; i < shafts.length; i++) {
      const s = shafts[i];
      // opacity shimmer
      s.mat.opacity =
        s.baseOpacity * (0.65 + 0.35 * Math.sin(t * s.shimmerSpeed + s.shimmerPhase));
      // subtle drift/sway of the shaft angle
      const wob = Math.sin(t * s.swaySpeed + s.swayPhase) * s.swayAmp;
      _q.setFromAxisAngle(s.swayAxis, wob);
      s.pivot.quaternion.copy(_q).multiply(s.baseQuat);
    }
  }

  return { group, update };
}

// ----------------------------------------------------------------------------
// RECOMMENDED SCENE / RENDER SETTINGS
//   Deep-golden, gently hazy, cinematic golden-hour mood. main.js applies these.
// ----------------------------------------------------------------------------
export const ATMOSPHERE_PARAMS = {
  fogColor: 0xffb066, // warm hazy amber
  fogDensity: 0.011, // gentle FogExp2 — reads as golden haze, not soup
  bloom: {
    strength: 0.85, // strong-but-tasteful glow on gold/flames
    radius: 0.72,
    threshold: 0.62,
  },
  toneMappingExposure: 1.12, // rich, lifted golden exposure
  ambient: {
    color: 0xffd9a0, // warm fill
    intensity: 0.42,
  },
  keyLight: {
    // low, warm sun — main.js positions/directs it
    color: 0xffb35c,
    intensity: 2.6,
  },
  hemi: {
    sky: 0xffd59a, // warm sky
    ground: 0x5e3a1e, // warm bronze bounce
    intensity: 0.55,
  },
  warmPointLights: [
    // one warm hero glow at the mandap centre
    { pos: [0, 4.5, 0], color: 0xffb04a, intensity: 2.2, distance: 26 },
    // one near the horse / processional area
    { pos: [10, 3, 8], color: 0xff7b2e, intensity: 1.4, distance: 18 },
  ],
};
```


## `src/wedding/extras.js`

```javascript
// extras.js — celebratory additions: aerial banner plane, swans, a paise-udana
// money fountain, a firework, and the elephant's "TEAM GROOM" banner.
// All procedural, low-poly, mobile-light. Each returns { group } or { group, update }.
import * as THREE from 'three';
import { PAL } from './shared.js';

// ---------------------------------------------------------------------------
// Fabric-banner canvas texture (used by the plane + the elephant banner)
// ---------------------------------------------------------------------------
export function makeBannerTexture(text, opts = {}) {
  const W = opts.w || 1024, H = opts.h || 256;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = opts.bg || '#5e1220';
  x.fillRect(0, 0, W, H);
  // gold border
  x.strokeStyle = opts.border || '#e9c46a';
  x.lineWidth = 20;
  x.strokeRect(12, 12, W - 24, H - 24);
  // ornate corner dots
  x.fillStyle = opts.border || '#e9c46a';
  [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]].forEach(([px, py]) => {
    x.beginPath(); x.arc(px, py, 10, 0, Math.PI * 2); x.fill();
  });
  x.fillStyle = opts.fg || '#ffd97a';
  x.font = 'bold ' + (opts.size || 128) + 'px Georgia, "Times New Roman", serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, W / 2, H / 2 + 6);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}

// ---------------------------------------------------------------------------
// Aerial banner plane — flies a slow wide circle, banks into the turn so the
// trailing banner catches the sunset. update(t).
// ---------------------------------------------------------------------------
export function createPlaneBanner(text, opts = {}) {
  const g = new THREE.Group();
  const body = new THREE.Group(); // forward = +Z; body rolls for banking
  g.add(body);

  const bodyMat = new THREE.MeshStandardMaterial({ color: PAL.cream, roughness: 0.6, metalness: 0.2 });
  const redMat = new THREE.MeshStandardMaterial({ color: PAL.crimson, roughness: 0.5, metalness: 0.1 });
  const goldMat = new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.3, metalness: 0.85, emissive: PAL.brass, emissiveIntensity: 0.25 });

  const craft = new THREE.Group();
  craft.scale.setScalar(1.9); // larger so it reads clearly from the ground
  body.add(craft);

  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.34, 4, 8), bodyMat);
  fuse.rotation.x = Math.PI / 2; craft.add(fuse);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.8, 8), goldMat);
  nose.rotation.x = Math.PI / 2; nose.position.z = 2.4; craft.add(nose);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.1, 0.8), redMat);
  wing.position.z = 0.2; craft.add(wing);
  const tailW = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 0.5), redMat);
  tailW.position.z = -1.9; craft.add(tailW);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.6), redMat);
  fin.position.set(0, 0.36, -1.9); craft.add(fin);

  // Large trailing VERTICAL banner. The geometry's FIRST arg is the LENGTH, so
  // the texture's horizontal text maps ALONG the banner length (not smeared
  // across its width — that was the streaking bug). Two faces, back flipped, so
  // it reads correctly from both sides.
  const bl = 40, bh = 7;
  const bgeo = new THREE.PlaneGeometry(bl, bh, 48, 1); // x = length (u), y = height (v)
  const btex = makeBannerTexture(text, { size: 132, w: 1536 });
  const btexB = btex.clone();
  btexB.wrapS = THREE.RepeatWrapping; btexB.repeat.x = -1; btexB.offset.x = 1; btexB.needsUpdate = true;
  const bmatF = new THREE.MeshStandardMaterial({ map: btex, side: THREE.FrontSide, roughness: 0.85, metalness: 0.0 });
  const bmatB = new THREE.MeshStandardMaterial({ map: btexB, side: THREE.BackSide, roughness: 0.85, metalness: 0.0 });
  const bannerF = new THREE.Mesh(bgeo, bmatF);
  const bannerB = new THREE.Mesh(bgeo, bmatB);
  // turn the banner so its length trails behind (along -Z) and it stands vertical
  bannerF.rotation.y = bannerB.rotation.y = Math.PI / 2;
  bannerF.position.z = bannerB.position.z = -6 - bl / 2;
  body.add(bannerF, bannerB);
  const base = bgeo.attributes.position.array.slice();

  const R = opts.radius || 55;
  const H0 = opts.height || 30;
  const speed = opts.speed || 0.085;

  return {
    group: g,
    update: (t) => {
      const a = t * speed;
      g.position.set(Math.cos(a) * R, H0 + Math.sin(t * 0.25) * 2.5, Math.sin(a) * R);
      // heading tangent (forward = +Z)
      const hx = -Math.sin(a), hz = Math.cos(a);
      g.rotation.y = Math.atan2(hx, hz);
      body.rotation.z = -0.32 + Math.sin(t * 0.8) * 0.05; // bank into the turn
      // ripple the banner
      const p = bgeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const bx = base[i * 3]; // position along the banner length
        p.setZ(i, Math.sin(bx * 0.28 + t * 3.6) * 0.45); // gentle ripple along the normal
      }
      p.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------------------
// White swan — floats and drifts a slow circle on the pond. update(t).
// Placed via a grounded wrapper (position owned by main.js); it drifts
// relative to that wrapper.
// ---------------------------------------------------------------------------
export function createSwan(phase = 0) {
  const g = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xfcfcf6, roughness: 0.6, metalness: 0.0 });
  const beakMat = new THREE.MeshStandardMaterial({ color: PAL.saffron, roughness: 0.5 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), white);
  body.scale.set(1, 0.72, 1.55); body.position.y = 0.28; g.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 6), white);
  tail.position.set(0, 0.42, -0.62); tail.rotation.x = -1.0; g.add(tail);
  // curved neck (two segments) + head
  const n1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.45, 6), white);
  n1.position.set(0, 0.55, 0.55); n1.rotation.x = 0.35; g.add(n1);
  const n2 = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.4, 6), white);
  n2.position.set(0, 0.88, 0.68); n2.rotation.x = -0.25; g.add(n2);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), white);
  head.position.set(0, 1.05, 0.78); g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 5), beakMat);
  beak.rotation.x = Math.PI / 2; beak.position.set(0, 1.02, 0.95); g.add(beak);

  const r = 2.0 + (phase % 1) * 1.2;
  return {
    group: g,
    update: (t) => {
      const a = t * 0.14 + phase;
      g.position.set(Math.cos(a) * r, Math.sin(t * 0.8 + phase) * 0.05, Math.sin(a) * r);
      g.rotation.y = -a + Math.PI / 2;
    },
  };
}

// ---------------------------------------------------------------------------
// Money fountain (paise udana) — tiny notes tossed up from a point, fall,
// respawn. One InstancedMesh. update(t, dt).
// ---------------------------------------------------------------------------
export function createMoneyFountain(opts = {}) {
  const N = opts.count || 36;
  const origin = opts.origin || [0, 2.2, 0];
  const ground = opts.ground !== undefined ? opts.ground : origin[1] - 2.0;
  const geo = new THREE.PlaneGeometry(0.17, 0.09);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8ed19a, side: THREE.DoubleSide, roughness: 0.7, metalness: 0.0,
    emissive: 0x2f6a2a, emissiveIntensity: 0.12,
  });
  const inst = new THREE.InstancedMesh(geo, mat, N);
  inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const d = new THREE.Object3D();
  const P = [];
  const spawn = () => ({
    x: origin[0], y: origin[1], z: origin[2],
    vx: (Math.random() - 0.5) * 1.6, vy: 2.4 + Math.random() * 2.4, vz: (Math.random() - 0.5) * 1.6,
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 9, delay: Math.random() * 1.5,
  });
  for (let i = 0; i < N; i++) P.push(spawn());
  return {
    group: inst,
    update: (t, dt) => {
      dt = Math.min(dt || 0.016, 0.05);
      for (let i = 0; i < N; i++) {
        const p = P[i];
        if (p.delay > 0) { p.delay -= dt; d.position.set(0, -999, 0); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); continue; }
        p.vy -= 6.2 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.rot += p.vr * dt;
        if (p.y < ground) Object.assign(p, spawn());
        d.position.set(p.x, p.y, p.z);
        d.rotation.set(p.rot * 0.5, p.rot, p.rot * 0.3);
        d.updateMatrix();
        inst.setMatrixAt(i, d.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------------------
// Firework — a rocket rises from `origin`, bursts into colored sparks, repeats.
// update(t). Sparks glow via bloom (MeshBasic). Cheap.
// ---------------------------------------------------------------------------
export function createFirework(opts = {}) {
  const origin = opts.origin || [0, 1.2, 0];
  const rise = opts.rise || 11;
  const cycle = opts.cycle || 4.2;
  const N = 26;
  const g = new THREE.Group();

  const rocket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.09, 0.45, 6),
    new THREE.MeshStandardMaterial({ color: PAL.crimson, emissive: PAL.marigold, emissiveIntensity: 0.8 })
  );
  g.add(rocket);
  const smat = new THREE.MeshBasicMaterial({ color: PAL.goldBright, transparent: true, opacity: 1 });
  const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 5, 4), smat, N);
  sparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  g.add(sparks);
  const d = new THREE.Object3D();
  const S = [];
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1), sp = 3 + Math.random() * 3.2;
    S.push({ vx: Math.sin(b) * Math.cos(a) * sp, vy: Math.cos(b) * sp, vz: Math.sin(b) * Math.sin(a) * sp });
  }
  const col = new THREE.Color();
  return {
    group: g,
    update: (t) => {
      const phase = t % cycle;
      const burstY = origin[1] + rise;
      if (phase < 1.2) {
        rocket.visible = true; sparks.visible = false;
        rocket.position.set(origin[0], origin[1] + (phase / 1.2) * rise, origin[2]);
      } else {
        rocket.visible = false; sparks.visible = true;
        const bt = phase - 1.2;
        const fade = Math.max(0, 1 - bt / 1.7);
        smat.opacity = fade;
        col.setHSL((Math.floor(t / cycle) * 0.27) % 1, 0.9, 0.62);
        smat.color.copy(col);
        for (let i = 0; i < N; i++) {
          const s = S[i];
          d.position.set(origin[0] + s.vx * bt, burstY + s.vy * bt - 3.1 * bt * bt, origin[2] + s.vz * bt);
          d.scale.setScalar(0.5 + fade * 0.7);
          d.updateMatrix();
          sparks.setMatrixAt(i, d.matrix);
        }
        sparks.instanceMatrix.needsUpdate = true;
      }
    },
  };
}

// ---------------------------------------------------------------------------
// "TEAM GROOM" banner — a waving cloth on two poles (held before the elephant).
// Vertical cloth, face along ±Z by default. update(t).
// ---------------------------------------------------------------------------
export function createTeamGroomBanner(text = 'TEAM GROOM') {
  const g = new THREE.Group();
  const w = 4.4, h = 1.25;
  const geo = new THREE.PlaneGeometry(w, h, 20, 1);
  // Two single-sided cloths sharing one (deforming) geometry: the back face uses
  // a horizontally-flipped texture so the text reads correctly from BOTH sides.
  const tex = makeBannerTexture(text, { size: 150 });
  const texB = tex.clone();
  texB.wrapS = THREE.RepeatWrapping; texB.repeat.x = -1; texB.offset.x = 1; texB.needsUpdate = true;
  const matF = new THREE.MeshStandardMaterial({ map: tex, side: THREE.FrontSide, roughness: 0.82, metalness: 0.0, emissive: 0x2a0810, emissiveIntensity: 0.15 });
  const matB = new THREE.MeshStandardMaterial({ map: texB, side: THREE.BackSide, roughness: 0.82, metalness: 0.0, emissive: 0x2a0810, emissiveIntensity: 0.15 });
  const clothF = new THREE.Mesh(geo, matF); clothF.position.y = h / 2;
  const clothB = new THREE.Mesh(geo, matB); clothB.position.y = h / 2;
  g.add(clothF, clothB);
  const poleMat = new THREE.MeshStandardMaterial({ color: PAL.brass, metalness: 0.9, roughness: 0.3 });
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.9, 6);
  [-1, 1].forEach((s) => {
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set((s * w) / 2, h / 2 - 0.1, 0);
    g.add(pole);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), poleMat);
    knob.position.set((s * w) / 2, h + 0.4, 0);
    g.add(knob);
  });
  const base = geo.attributes.position.array.slice();
  return {
    group: g,
    update: (t) => {
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const bx = base[i * 3];
        p.setZ(i, Math.sin(bx * 1.5 + t * 3.2) * 0.14);
      }
      p.needsUpdate = true;
    },
  };
}

```
