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
