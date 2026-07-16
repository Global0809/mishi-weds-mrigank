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