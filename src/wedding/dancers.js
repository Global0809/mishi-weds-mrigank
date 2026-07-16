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