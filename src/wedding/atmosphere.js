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