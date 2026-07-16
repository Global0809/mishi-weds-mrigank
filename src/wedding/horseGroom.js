import * as THREE from "three";
import { PAL } from "./shared.js";

// createHorseGroom() -> { group, update }
// A prominent Indian groom (dulha) astride a richly caparisoned white baraat
// horse, riding to his wedding. Faces +Z, rests on ground (y~0). Horse ~2.5
// tall at the head. Gentle idle only (no locomotion). Triangle budget < 2600.
export function createHorseGroom() {
  const group = new THREE.Group();

  // ---- shared materials -------------------------------------------------
  const matHorse = new THREE.MeshStandardMaterial({ color: PAL.ivory, roughness: 0.62, metalness: 0.0 });
  const matHoof  = new THREE.MeshStandardMaterial({ color: PAL.bronze, roughness: 0.55, metalness: 0.2 });
  const matBurg  = new THREE.MeshStandardMaterial({ color: PAL.burgundy, roughness: 0.82, metalness: 0.0 });
  const matBurgD = new THREE.MeshStandardMaterial({ color: PAL.burgundyDeep, roughness: 0.85, metalness: 0.0 });
  const matGold  = new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.34, metalness: 0.9,
                    emissive: PAL.brass, emissiveIntensity: 0.28 });
  const matGoldB = new THREE.MeshStandardMaterial({ color: PAL.goldBright, roughness: 0.3, metalness: 0.85,
                    emissive: PAL.goldBright, emissiveIntensity: 0.75 });
  const matSaff  = new THREE.MeshStandardMaterial({ color: PAL.saffron, roughness: 0.6, metalness: 0.0,
                    emissive: PAL.marigoldDeep, emissiveIntensity: 0.4 });
  const matCream = new THREE.MeshStandardMaterial({ color: PAL.cream, roughness: 0.7, metalness: 0.06 });
  const matIvory = new THREE.MeshStandardMaterial({ color: PAL.ivory, roughness: 0.68, metalness: 0.05 });
  const matSkin  = new THREE.MeshStandardMaterial({ color: PAL.skin, roughness: 0.75, metalness: 0.0 });
  const matSkinD = new THREE.MeshStandardMaterial({ color: PAL.skinDark, roughness: 0.78, metalness: 0.0 });
  const matEye   = new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.4, metalness: 0.0 });
  const matJas   = new THREE.MeshStandardMaterial({ color: PAL.jasmine, roughness: 0.5, metalness: 0.0,
                    emissive: PAL.jasmine, emissiveIntensity: 0.35 });
  const matMari  = new THREE.MeshStandardMaterial({ color: PAL.marigold, roughness: 0.6, metalness: 0.0,
                    emissive: PAL.marigoldDeep, emissiveIntensity: 0.3 });
  const matLeaf  = new THREE.MeshStandardMaterial({ color: PAL.leaf, roughness: 0.8, metalness: 0.0 });
  const matRein  = new THREE.MeshStandardMaterial({ color: PAL.maroon, roughness: 0.7, metalness: 0.1 });

  const mesh = (geo, mat, x, y, z) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    return m;
  };

  // =======================================================================
  // HORSE BODY
  // =======================================================================
  const torso = mesh(new THREE.BoxGeometry(0.64, 0.8, 1.58), matHorse, 0, 1.3, 0);
  group.add(torso);
  group.add(mesh(new THREE.BoxGeometry(0.58, 0.62, 0.36), matHorse, 0, 1.2, 0.84)); // chest
  group.add(mesh(new THREE.SphereGeometry(0.4, 7, 5), matHorse, 0, 1.36, -0.74));    // rump

  // Legs + hooves + gold anklets
  const legGeo    = new THREE.CylinderGeometry(0.1, 0.07, 1.02, 6);
  const hoofGeo   = new THREE.BoxGeometry(0.16, 0.12, 0.2);
  const ankletGeo = new THREE.CylinderGeometry(0.115, 0.115, 0.07, 6);
  const legPos = [[0.23, 0.56], [-0.23, 0.56], [0.25, -0.56], [-0.25, -0.56]];
  for (const [lx, lz] of legPos) {
    group.add(mesh(legGeo, matHorse, lx, 0.55, lz));
    group.add(mesh(hoofGeo, matHoof, lx, 0.06, lz));
    group.add(mesh(ankletGeo, matGold, lx, 0.32, lz));
  }

  // Tail (swaying group)
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, 1.44, -0.9);
  const tail = mesh(new THREE.CylinderGeometry(0.12, 0.02, 1.0, 6), matHorse, 0, -0.44, -0.14);
  tail.rotation.x = -0.34;
  tailGroup.add(tail);
  group.add(tailGroup);

  // =======================================================================
  // HEAD + NECK (bobbing group)
  // =======================================================================
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.52, 0.72);
  group.add(headGroup);

  const neck = mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.74, 6), matHorse, 0, 0.3, 0.2);
  neck.rotation.x = 0.62;
  headGroup.add(neck);

  const head = mesh(new THREE.BoxGeometry(0.27, 0.31, 0.44), matHorse, 0, 0.64, 0.53);
  head.rotation.x = 0.28;
  headGroup.add(head);
  const muzzle = mesh(new THREE.BoxGeometry(0.2, 0.19, 0.24), matHorse, 0, 0.52, 0.8);
  muzzle.rotation.x = 0.28;
  headGroup.add(muzzle);

  // Eyes
  const hEyeGeo = new THREE.IcosahedronGeometry(0.035, 0);
  headGroup.add(mesh(hEyeGeo, matEye, 0.11, 0.68, 0.62));
  headGroup.add(mesh(hEyeGeo, matEye, -0.11, 0.68, 0.62));

  // Ears
  const earGeo = new THREE.ConeGeometry(0.06, 0.19, 4);
  const earL = mesh(earGeo, matHorse, 0.09, 0.84, 0.42); earL.rotation.x = -0.15;
  const earR = mesh(earGeo, matHorse, -0.09, 0.84, 0.42); earR.rotation.x = -0.15;
  headGroup.add(earL, earR);

  // Golden headplate + browband + cheek straps (bridle)
  const headplate = mesh(new THREE.BoxGeometry(0.2, 0.24, 0.05), matGold, 0, 0.7, 0.67);
  headplate.rotation.x = 0.28;
  headGroup.add(headplate);
  headGroup.add(mesh(new THREE.BoxGeometry(0.29, 0.05, 0.05), matGold, 0, 0.6, 0.67)); // browband
  const cheekL = mesh(new THREE.BoxGeometry(0.03, 0.34, 0.03), matGold, 0.14, 0.56, 0.66); cheekL.rotation.x = 0.28;
  const cheekR = mesh(new THREE.BoxGeometry(0.03, 0.34, 0.03), matGold, -0.14, 0.56, 0.66); cheekR.rotation.x = 0.28;
  headGroup.add(cheekL, cheekR);
  // Bit / noseband ring
  const noseband = mesh(new THREE.TorusGeometry(0.11, 0.02, 3, 6), matGold, 0, 0.5, 0.78);
  noseband.rotation.x = Math.PI / 2 + 0.28;
  headGroup.add(noseband);

  // Saffron / gold PLUME crest between the ears
  headGroup.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), matGold, 0, 0.86, 0.36)); // ferrule
  headGroup.add(mesh(new THREE.ConeGeometry(0.1, 0.42, 6), matSaff, 0, 1.06, 0.34));
  headGroup.add(mesh(new THREE.ConeGeometry(0.05, 0.22, 6), matGoldB, 0, 1.2, 0.34)); // glowing tip

  // =======================================================================
  // CAPARISON (jhool) — burgundy & gold drape over back and flanks
  // =======================================================================
  const sideGeo = new THREE.BoxGeometry(0.05, 0.6, 1.24);
  group.add(mesh(sideGeo, matBurg, 0.36, 1.12, -0.05));
  group.add(mesh(sideGeo, matBurg, -0.36, 1.12, -0.05));
  const hemGeo = new THREE.BoxGeometry(0.06, 0.09, 1.28);
  group.add(mesh(hemGeo, matGold, 0.36, 0.83, -0.05));
  group.add(mesh(hemGeo, matGold, -0.36, 0.83, -0.05));
  // gold medallions on the flanks
  const medGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 6);
  for (const mz of [0.32, -0.36]) {
    const ml = mesh(medGeo, matGold, 0.385, 1.16, mz); ml.rotation.z = Math.PI / 2;
    const mr = mesh(medGeo, matGold, -0.385, 1.16, mz); mr.rotation.z = Math.PI / 2;
    group.add(ml, mr);
  }
  // gold tassels hanging along each flank hem
  const tasselGeo = new THREE.ConeGeometry(0.035, 0.16, 4);
  for (const tz of [0.4, 0.0, -0.42]) {
    const tl = mesh(tasselGeo, matGoldB, 0.37, 0.72, tz); tl.rotation.x = Math.PI;
    const tr = mesh(tasselGeo, matGoldB, -0.37, 0.72, tz); tr.rotation.x = Math.PI;
    group.add(tl, tr);
  }
  // saddlecloth over the back (groom sits on this)
  group.add(mesh(new THREE.BoxGeometry(0.72, 0.08, 1.22), matBurgD, 0, 1.68, -0.05));
  group.add(mesh(new THREE.BoxGeometry(0.76, 0.05, 0.12), matGold, 0, 1.7, 0.56));
  group.add(mesh(new THREE.BoxGeometry(0.76, 0.05, 0.12), matGold, 0, 1.7, -0.66));

  // =======================================================================
  // GROOM (seated astride) — gentle settle group
  // =======================================================================
  const groom = new THREE.Group();
  groom.position.set(0, 0, 0.06);
  group.add(groom);

  // Seat + churidar hips
  groom.add(mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.22, 8), matIvory, 0, 1.86, 0));
  // Sherwani torso (tapered, prominent)
  groom.add(mesh(new THREE.CylinderGeometry(0.2, 0.27, 0.72, 8), matIvory, 0, 2.3, 0.02));
  // Shoulders / chest bulk
  groom.add(mesh(new THREE.SphereGeometry(0.24, 6, 5), matIvory, 0, 2.6, 0.02));
  // Gold placket line + burgundy collar accents
  groom.add(mesh(new THREE.BoxGeometry(0.035, 0.72, 0.035), matGold, 0, 2.3, 0.26));
  const collarL = mesh(new THREE.BoxGeometry(0.05, 0.22, 0.04), matBurg, 0.09, 2.56, 0.22); collarL.rotation.z = 0.35;
  const collarR = mesh(new THREE.BoxGeometry(0.05, 0.22, 0.04), matBurg, -0.09, 2.56, 0.22); collarR.rotation.z = -0.35;
  groom.add(collarL, collarR);
  // Gold buttons down the front (glowing)
  const btnGeo = new THREE.IcosahedronGeometry(0.028, 0);
  for (let i = 0; i < 5; i++) groom.add(mesh(btnGeo, matGoldB, 0, 2.56 - i * 0.13, 0.27));

  // Churidar legs draped down each flank, into stirrups
  const gLegGeo = new THREE.CylinderGeometry(0.1, 0.075, 0.66, 6);
  const legLo = mesh(gLegGeo, matCream, 0.3, 1.64, 0.08); legLo.rotation.x = 0.55; legLo.rotation.z = 0.14;
  const legRo = mesh(gLegGeo, matCream, -0.3, 1.64, 0.08); legRo.rotation.x = 0.55; legRo.rotation.z = -0.14;
  groom.add(legLo, legRo);
  // Mojari (curled-toe shoes) in stirrups
  const mojGeo = new THREE.BoxGeometry(0.11, 0.09, 0.18);
  const toeGeo = new THREE.ConeGeometry(0.045, 0.1, 4);
  for (const fx of [0.32, -0.32]) {
    groom.add(mesh(mojGeo, matBurgD, fx, 1.36, 0.28));
    const toe = mesh(toeGeo, matGold, fx, 1.4, 0.4); toe.rotation.x = -1.3;
    groom.add(toe);
    // gold stirrup ring
    const stir = mesh(new THREE.TorusGeometry(0.09, 0.022, 4, 6), matGold, fx, 1.31, 0.27);
    groom.add(stir);
    groom.add(mesh(new THREE.BoxGeometry(0.02, 0.28, 0.02), matGold, fx, 1.5, 0.24)); // stirrup leather
  }

  // Arms — right forward holding reins, left resting on thigh
  const armGeo = new THREE.CylinderGeometry(0.062, 0.055, 0.52, 6);
  const armR = mesh(armGeo, matIvory, 0.24, 2.34, 0.16); armR.rotation.x = 0.75; armR.rotation.z = 0.28;
  const armL = mesh(armGeo, matIvory, -0.25, 2.3, 0.04); armL.rotation.x = 0.35; armL.rotation.z = -0.28;
  groom.add(armR, armL);
  const handGeo = new THREE.IcosahedronGeometry(0.06, 0);
  const handR = mesh(handGeo, matSkin, 0.32, 2.12, 0.34); // rein hand
  const handL = mesh(handGeo, matSkin, -0.34, 2.1, 0.12);
  groom.add(handR, handL);

  // Neck + head (warm skin, subtle face)
  groom.add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.11, 6), matSkin, 0, 2.72, 0.02));
  const gHead = mesh(new THREE.IcosahedronGeometry(0.17, 1), matSkin, 0, 2.88, 0.03);
  groom.add(gHead);
  // subtle face — eyes + nose + moustache
  groom.add(mesh(new THREE.IcosahedronGeometry(0.024, 0), matEye, 0.06, 2.9, 0.18));
  groom.add(mesh(new THREE.IcosahedronGeometry(0.024, 0), matEye, -0.06, 2.9, 0.18));
  groom.add(mesh(new THREE.ConeGeometry(0.03, 0.06, 4), matSkinD, 0, 2.85, 0.2)); // nose
  groom.add(mesh(new THREE.BoxGeometry(0.11, 0.02, 0.03), matSkinD, 0, 2.81, 0.18)); // moustache

  // TURBAN (safa) — burgundy & gold stacked wraps
  groom.add(mesh(new THREE.SphereGeometry(0.21, 8, 6), matBurg, 0, 3.02, 0.0));
  const wrap = mesh(new THREE.TorusGeometry(0.19, 0.055, 6, 9), matGold, 0, 2.96, 0.0);
  wrap.rotation.x = Math.PI / 2;
  groom.add(wrap);
  groom.add(mesh(new THREE.SphereGeometry(0.12, 5, 4), matBurgD, 0.06, 3.14, -0.04)); // top knot fold
  // Kalgi brooch (glowing) + upright plume at the front
  groom.add(mesh(new THREE.IcosahedronGeometry(0.055, 0), matGoldB, 0, 3.04, 0.19));
  groom.add(mesh(new THREE.ConeGeometry(0.035, 0.2, 6), matGoldB, 0, 3.24, 0.15));

  // SEHRA — hanging jasmine/flower strands partly veiling the face
  groom.add(mesh(new THREE.BoxGeometry(0.34, 0.025, 0.025), matGold, 0, 2.94, 0.19)); // rail
  const strandGeo = new THREE.BoxGeometry(0.016, 0.28, 0.016);
  const beadGeo = new THREE.SphereGeometry(0.02, 4, 3);
  for (let i = 0; i < 8; i++) {
    const sx = -0.14 + i * 0.04;
    const zoff = 0.19 - Math.abs(i - 3.5) * 0.006;
    groom.add(mesh(strandGeo, matJas, sx, 2.78, zoff));
    groom.add(mesh(beadGeo, matMari, sx, 2.64, zoff)); // marigold bead tip
  }

  // VARMALA — flower garland draped around the neck/chest
  const varmala = mesh(new THREE.TorusGeometry(0.2, 0.05, 5, 10), matMari, 0, 2.5, 0.08);
  varmala.rotation.x = 1.35;
  varmala.scale.set(1.0, 1.25, 1.0);
  groom.add(varmala);
  // draping front loops
  const loopGeo = new THREE.TorusGeometry(0.09, 0.045, 4, 6, Math.PI);
  const loopL = mesh(loopGeo, matMari, 0.09, 2.28, 0.24); loopL.rotation.z = 0.2;
  const loopR = mesh(loopGeo, matMari, -0.09, 2.28, 0.24); loopR.rotation.z = -0.2;
  groom.add(loopL, loopR);
  // a few leaf accents on the garland
  groom.add(mesh(new THREE.SphereGeometry(0.03, 4, 3), matLeaf, 0.2, 2.5, 0.12));
  groom.add(mesh(new THREE.SphereGeometry(0.03, 4, 3), matLeaf, -0.2, 2.5, 0.12));

  // SWORD (sheathed) at the left side
  const swordGrp = new THREE.Group();
  swordGrp.position.set(-0.26, 2.0, 0.02);
  swordGrp.rotation.z = 0.5;
  swordGrp.rotation.x = -0.15;
  const scab = mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.62, 6), matBurgD, 0, -0.28, 0);
  swordGrp.add(scab);
  swordGrp.add(mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.05, 6), matGold, 0, 0.02, 0)); // throat
  swordGrp.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 6), matGold, 0, -0.55, 0));  // chape
  swordGrp.add(mesh(new THREE.BoxGeometry(0.14, 0.03, 0.03), matGoldB, 0, 0.08, 0));          // guard
  swordGrp.add(mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.12, 6), matSkinD, 0, 0.16, 0)); // grip
  swordGrp.add(mesh(new THREE.IcosahedronGeometry(0.03, 0), matGoldB, 0, 0.23, 0));           // pommel
  groom.add(swordGrp);

  // REINS — from the bit up to the groom's rein hand (added to main group)
  const reinGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.0, 4);
  const reinL = mesh(reinGeo, matRein, 0.12, 1.75, 0.66); reinL.rotation.x = -0.9;
  const reinR = mesh(reinGeo, matRein, -0.0, 1.78, 0.62); reinR.rotation.x = -0.78;
  group.add(reinL, reinR);

  // =======================================================================
  // ANIMATION — gentle idle only (no locomotion)
  // =======================================================================
  const update = (t) => {
    // slow head bob (breathing head)
    headGroup.rotation.x = Math.sin(t * 0.9) * 0.05;
    headGroup.position.y = 1.52 + Math.sin(t * 0.9) * 0.01;
    // tail sway
    tailGroup.rotation.z = Math.sin(t * 0.8 + 0.5) * 0.15;
    tailGroup.rotation.x = Math.sin(t * 0.6) * 0.05;
    // subtle breathing on the torso
    const b = 1 + Math.sin(t * 1.4) * 0.016;
    torso.scale.set(b, 1, b);
    // groom settles gently with the horse's breath
    groom.rotation.x = Math.sin(t * 1.4 + 0.3) * 0.013;
    groom.position.y = Math.sin(t * 1.4) * 0.009;
    // sehra + garland shimmer via tiny sway
    groom.rotation.z = Math.sin(t * 0.7) * 0.006;
    // plume tip flicker on the safa
    swordGrp.rotation.z = 0.5 + Math.sin(t * 1.1) * 0.02;
  };

  return { group, update };
}