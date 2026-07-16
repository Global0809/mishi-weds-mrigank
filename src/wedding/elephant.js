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