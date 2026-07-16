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