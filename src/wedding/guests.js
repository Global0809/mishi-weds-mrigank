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