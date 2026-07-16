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
    width: 5,
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
  lampPillars: [
    { pos: [16, 30] }, { pos: [32, 30] }, { pos: [16, 2] }, { pos: [32, 2] },
    { pos: [15, -13] }, { pos: [31, -13] }, { pos: [7, -25] }, { pos: [-9, -25] },
  ],
  petalArea: { cx: 16, cz: 0, radius: 32 },
  // Default framing features the PEOPLE, with the path leading back to the mandap + bride.
  camera: { introFrom: [58, 44, 72], introTo: [46, 15, 34], target: [17, 3.5, 4], introDurationSec: 7 },
  // Coordinated dance floor: two tidy rows flanking the carpet, facing the groom.
  dancers: [
    { variant: 'armsUpM', pos: [20, 7] },
    { variant: 'bhangraM', pos: [29, 7] },
    { variant: 'spinF', pos: [20, 0] },
    { variant: 'jumpM', pos: [29, 0] },
    { variant: 'clapM', pos: [20, -7] },
    { variant: 'thumkaF', pos: [29, -7] },
    { variant: 'armsUpM', pos: [22.5, -12] },
    { variant: 'bhangraM', pos: [26.5, -12] },
  ],
  // Two female dancers flanking the bride so she is not isolated
  brideDancers: [
    { variant: 'spinF', pos: [-5.5, -27.5], faceToward: [-5.5, 6] },
    { variant: 'thumkaF', pos: [1.5, -27.5], faceToward: [1.5, 6] },
  ],
  // guests / onlookers lining the path edges, facing the carpet
  guests: [
    { variant: 'clapping', pos: [15, 33], faceToward: [24, 30] },
    { variant: 'cheering', pos: [33, 31], faceToward: [24, 26] },
    { variant: 'clapping', pos: [34, 16], faceToward: [26, 12] },
    { variant: 'namaste', pos: [14, 17], faceToward: [24, 12] },
    { variant: 'showering', pos: [33, -2], faceToward: [26, -2] },
    { variant: 'cheering', pos: [12, -6], faceToward: [22, -4] },
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
function getTerrainHeight(x, z) {
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

function faceAngle(px, pz, tx, tz) { return Math.atan2(tx - px, tz - pz); }

// Facing helper for [x,z] + faceToward[x,z]
function place(group, spec, opts = {}) {
  const x = spec.pos[0], z = spec.pos[1];
  const y = (opts.y !== undefined) ? opts.y : getTerrainHeight(x, z);
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
  wrap.position.set(x, opts.y !== undefined ? opts.y : getTerrainHeight(x, z), z);
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
const CLEAR = [
  { x: LAYOUT.mandap.pos[0], z: LAYOUT.mandap.pos[1], r: 11 },
  { x: LAYOUT.bride.pos[0], z: LAYOUT.bride.pos[1], r: 3 },
  { x: LAYOUT.horseGroom.pos[0], z: LAYOUT.horseGroom.pos[1], r: 6.5 },
  { x: LAYOUT.elephant.pos[0], z: LAYOUT.elephant.pos[1], r: 7.5 },
  ...LAYOUT.toranGates.map((g) => ({ x: g.pos[0], z: g.pos[1], r: 4.5 })),
  ...LAYOUT.lampPillars.map((p) => ({ x: p.pos[0], z: p.pos[1], r: 1.8 })),
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
  if (isNearRiver(x, z, 4) || blocked(x, z, 4)) continue;
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
  if (isNearRiver(x, z, 4) || blocked(x, z, 4)) continue;
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
const grassCount = IS_MOBILE ? 900 : 1400;
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
for (let i = 0; i < 14; i++) {
  const c = createCloud((Math.random() - 0.5) * 180, 24 + Math.random() * 18, -40 + (Math.random() - 0.5) * 80);
  scene.add(c); clouds.push(c);
}

const birds = [];
for (let i = 0; i < 15; i++) {
  const bird = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
  const wL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.15), mat); wL.position.x = -0.6; bird.add(wL);
  const wR = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.15), mat); wR.position.x = 0.6; bird.add(wR);
  bird.position.set(-40 + Math.random() * 30, 20 + Math.random() * 12, -50 + Math.random() * 30);
  bird.userData = { phase: Math.random() * Math.PI * 2, speed: 0.3 + Math.random() * 0.5, baseX: bird.position.x };
  scene.add(bird); birds.push(bird);
}

const butterflies = [];
for (let i = 0; i < 10; i++) {
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
const pad = new THREE.Mesh(
  new THREE.CylinderGeometry(5.1, 5.4, 3, 40),
  new THREE.MeshStandardMaterial({ color: PAL.cream, roughness: 0.9, metalness: 0.02 })
);
pad.position.set(MANDAP.pos[0], mandapBaseY - 1.5 + 0.04, MANDAP.pos[1]);
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
LAYOUT.lampPillars.forEach((p) => mount(createCarvedPillar(), { pos: p.pos }));

// A couple of free-standing floral arches framing the mandap approach
mount(createFloralArch(), { pos: [3, -27], faceToward: [-2, -31] });
mount(createFloralArch(), { pos: [-7, -27], faceToward: [-2, -31] });

// --- The couple, the mount, the elephant (standing on the raised carpet) ---
const CARPET_LIFT = 0.18;
mount(createHorseGroom(), LAYOUT.horseGroom, { y: getTerrainHeight(...LAYOUT.horseGroom.pos) + CARPET_LIFT });
mount(createBride(), LAYOUT.bride);

// Elephant directly behind the groom, carrying a "TEAM GROOM" banner in its trunk
mount(createElephant(), LAYOUT.elephant, { y: getTerrainHeight(...LAYOUT.elephant.pos) + CARPET_LIFT });
{
  const ex = LAYOUT.elephant.pos[0], ez = LAYOUT.elephant.pos[1];
  const banner = createTeamGroomBanner('TEAM GROOM');
  const w = new THREE.Group();
  w.position.set(ex, getTerrainHeight(ex, ez) + 2.2, ez - 3.4); // held forward off the trunk, toward the groom/camera
  w.add(banner.group);
  scene.add(w);
  updaters.push(banner.update);
}

// --- Attendants (each with a ceremonial item) ------------------------
LAYOUT.attendants.forEach((a, i) => mount(createAttendant({ item: a.item, phase: i * 0.7 }), a));

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
  const my = getTerrainHeight(mx, mz);
  const money = createMoneyFountain({ origin: [mx - 1.4, my + 2.0, mz + 0.7], ground: my + 0.1, count: IS_MOBILE ? 22 : 36 });
  scene.add(money.group);
  updaters.push(money.update);
}

// --- Firework launcher near the groom --------------------------------
mount(createGuest({ variant: 'cheering', phase: 2.3 }), LAYOUT.fireworkGuy);
{
  const [fx, fz] = LAYOUT.fireworkGuy.pos;
  const fy = getTerrainHeight(fx, fz);
  const fw = createFirework({ origin: [fx - 0.4, fy + 1.5, fz], rise: 12 });
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
const plane = createPlaneBanner(COUPLE.bride + ' weds ' + COUPLE.groom, { radius: 96, height: 45, speed: 0.07 });
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
const AMBIENT_VOL = 0.1;
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
