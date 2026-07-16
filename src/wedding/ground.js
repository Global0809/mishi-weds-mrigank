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
  const LIFT = 0.16;
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