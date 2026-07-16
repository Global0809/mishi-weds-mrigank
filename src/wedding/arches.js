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