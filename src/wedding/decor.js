import * as THREE from "three";
import { PAL } from "./shared.js";

// ---------------------------------------------------------------------------
// Small reusable ceremonial props for the royal Indian wedding world.
// Every builder returns either a THREE.Group (static) or { group, update }.
// Origin at (0,0,0), rests on the ground (lowest point ~y=0), grows +y,
// front faces +Z. Each asset is tiny and cheap (< 400 tris) and shares
// materials across its own repeated parts.
// ---------------------------------------------------------------------------

// -- shared material factories (one instance per part-type, reused inside asset)
function brassMat() {
  return new THREE.MeshStandardMaterial({
    color: PAL.brass, metalness: 0.9, roughness: 0.35,
  });
}
function goldMat() {
  return new THREE.MeshStandardMaterial({
    color: PAL.gold, metalness: 0.85, roughness: 0.3,
  });
}

// ===========================================================================
// createDiya(): tiny brass oil lamp with a glowing teardrop flame. ~0.25 tall.
// ===========================================================================
export function createDiya() {
  const group = new THREE.Group();

  // Bowl via lathe (shallow dish with an inner well).
  const bowlProfile = [
    new THREE.Vector2(0.00, 0.00),
    new THREE.Vector2(0.060, 0.00),
    new THREE.Vector2(0.078, 0.055),
    new THREE.Vector2(0.062, 0.058),
    new THREE.Vector2(0.045, 0.022),
    new THREE.Vector2(0.00, 0.020),
  ];
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry(bowlProfile, 12),
    brassMat()
  );
  group.add(bowl);

  // Teardrop flame (lathe profile), emissive so bloom catches it.
  const flameProfile = [
    new THREE.Vector2(0.000, 0.000),
    new THREE.Vector2(0.020, 0.018),
    new THREE.Vector2(0.033, 0.045),
    new THREE.Vector2(0.026, 0.080),
    new THREE.Vector2(0.011, 0.115),
    new THREE.Vector2(0.000, 0.150),
  ];
  const flame = new THREE.Mesh(
    new THREE.LatheGeometry(flameProfile, 8),
    new THREE.MeshStandardMaterial({
      color: PAL.flame, emissive: PAL.flame, emissiveIntensity: 1.3,
      roughness: 0.6, metalness: 0.0,
    })
  );
  flame.position.y = 0.03;
  group.add(flame);

  return group;
}

// ===========================================================================
// createLantern(): ornate hanging lantern, gold cage + amber glass + inner
// glow + top hang-ring. ~0.6 tall. Animated flame-flicker.
// ===========================================================================
export function createLantern() {
  const group = new THREE.Group();
  const gold = goldMat();

  // Amber/burgundy translucent glass body (hexagonal, open-ended).
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.17, 0.34, 6, 1, true),
    new THREE.MeshStandardMaterial({
      color: PAL.marigold, emissive: PAL.marigoldDeep, emissiveIntensity: 0.3,
      transparent: true, opacity: 0.5, roughness: 0.5, metalness: 0.1,
      side: THREE.DoubleSide,
    })
  );
  glass.position.y = 0.21;
  group.add(glass);

  // Emissive inner core (flickers).
  const coreMat = new THREE.MeshStandardMaterial({
    color: PAL.jasmine, emissive: PAL.flame, emissiveIntensity: 1.1,
    roughness: 0.5, metalness: 0.0,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), coreMat);
  core.position.y = 0.21;
  group.add(core);

  // Gold rings top & bottom (short hex cylinders).
  const ringGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.03, 6);
  const bottomRing = new THREE.Mesh(ringGeo, gold);
  bottomRing.position.y = 0.045;
  group.add(bottomRing);
  const topRing = new THREE.Mesh(ringGeo, gold);
  topRing.position.y = 0.37;
  group.add(topRing);

  // Six vertical cage bars along the hex edges.
  const barGeo = new THREE.BoxGeometry(0.015, 0.34, 0.015);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const bar = new THREE.Mesh(barGeo, gold);
    bar.position.set(Math.cos(a) * 0.165, 0.21, Math.sin(a) * 0.165);
    group.add(bar);
  }

  // Domed gold roof + finial.
  const dome = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.13, 6), gold);
  dome.position.y = 0.44;
  group.add(dome);
  const finial = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), gold);
  finial.position.y = 0.52;
  group.add(finial);

  // Top hang-ring.
  const hangRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.035, 0.012, 4, 10), gold
  );
  hangRing.position.y = 0.56;
  group.add(hangRing);

  const update = (t) => {
    coreMat.emissiveIntensity =
      1.1 + Math.sin(t * 9.0) * 0.15 + Math.sin(t * 23.0) * 0.06;
  };

  return { group, update };
}

// ===========================================================================
// createHangingGarland(length, style): beaded strand that sags in a catenary.
// Ends at x = -length/2 and +length/2 (y=0), center dips to ~ -length*0.12.
// style: "marigold" | "jasmine" | "mixed". Returns a Group.
// ===========================================================================
export function createHangingGarland(length = 3, style = "mixed") {
  const group = new THREE.Group();

  const marigold = new THREE.MeshStandardMaterial({
    color: PAL.marigold, emissive: PAL.marigoldDeep, emissiveIntensity: 0.25,
    roughness: 0.7, metalness: 0.0,
  });
  const marigoldDeep = new THREE.MeshStandardMaterial({
    color: PAL.marigoldDeep, roughness: 0.75, metalness: 0.0,
  });
  const jasmine = new THREE.MeshStandardMaterial({
    color: PAL.jasmine, emissive: PAL.jasmine, emissiveIntensity: 0.12,
    roughness: 0.75, metalness: 0.0,
  });

  let palette;
  if (style === "marigold") palette = [marigold, marigoldDeep];
  else if (style === "jasmine") palette = [jasmine, jasmine];
  else palette = [marigold, jasmine];

  const sag = length * 0.12;
  const count = Math.min(18, Math.max(6, Math.round(length / 0.18)));
  const beadGeo = new THREE.IcosahedronGeometry(0.05, 0);

  for (let i = 0; i < count; i++) {
    const u = count === 1 ? 0 : (i / (count - 1)) * 2 - 1; // -1..1
    const x = u * (length / 2);
    const y = -sag * (1 - u * u); // parabolic (catenary-like) sag
    const bead = new THREE.Mesh(beadGeo, palette[i % palette.length]);
    bead.position.set(x, y, 0);
    const s = 0.85 + Math.random() * 0.4;
    bead.scale.setScalar(s);
    bead.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    group.add(bead);
  }

  return group;
}

// ===========================================================================
// createKalash(): auspicious brass pot + coconut + mango leaves + red thread.
// ~0.5 tall. Returns a Group.
// ===========================================================================
export function createKalash() {
  const group = new THREE.Group();

  // Brass pot (lathe).
  const potProfile = [
    new THREE.Vector2(0.00, 0.00),
    new THREE.Vector2(0.07, 0.00),
    new THREE.Vector2(0.11, 0.10),
    new THREE.Vector2(0.095, 0.20),
    new THREE.Vector2(0.055, 0.255),
    new THREE.Vector2(0.085, 0.30),
    new THREE.Vector2(0.062, 0.305),
    new THREE.Vector2(0.045, 0.27),
    new THREE.Vector2(0.00, 0.26),
  ];
  const pot = new THREE.Mesh(new THREE.LatheGeometry(potProfile, 12), brassMat());
  group.add(pot);

  // Mango leaves ringing the rim (flattened cones, tilted outward/up).
  const leafMat = new THREE.MeshStandardMaterial({
    color: PAL.leaf, roughness: 0.65, metalness: 0.0,
  });
  const leafGeo = new THREE.ConeGeometry(0.05, 0.2, 4);
  const leafCount = 6;
  for (let i = 0; i < leafCount; i++) {
    const a = (i / leafCount) * Math.PI * 2;
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.scale.set(1, 1, 0.35); // flatten into a leaf blade
    leaf.position.set(Math.cos(a) * 0.075, 0.33, Math.sin(a) * 0.075);
    leaf.rotation.y = -a;
    leaf.rotation.z = Math.cos(a) * 0.5;
    leaf.rotation.x = Math.sin(a) * 0.5;
    group.add(leaf);
  }

  // Coconut nestled in the rim.
  const coconut = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 10, 7),
    new THREE.MeshStandardMaterial({
      color: PAL.bronze, roughness: 0.85, metalness: 0.0,
    })
  );
  coconut.position.y = 0.35;
  group.add(coconut);

  // Red sacred thread around the neck.
  const thread = new THREE.Mesh(
    new THREE.TorusGeometry(0.072, 0.008, 4, 12),
    new THREE.MeshStandardMaterial({
      color: PAL.crimson, roughness: 0.8, metalness: 0.0,
    })
  );
  thread.rotation.x = Math.PI / 2;
  thread.position.y = 0.235;
  group.add(thread);

  return group;
}

// ===========================================================================
// createPetalTray(): shallow brass tray heaped with loose marigold petals.
// ~0.4 wide. Returns a Group.
// ===========================================================================
export function createPetalTray() {
  const group = new THREE.Group();

  // Shallow tray.
  const tray = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.19, 0.025, 12),
    brassMat()
  );
  tray.position.y = 0.0125;
  group.add(tray);

  // Scattered petals (tiny tilted discs), double-sided so visible from above.
  const petalMats = [
    new THREE.MeshStandardMaterial({
      color: PAL.marigold, emissive: PAL.marigoldDeep, emissiveIntensity: 0.2,
      roughness: 0.7, metalness: 0.0, side: THREE.DoubleSide,
    }),
    new THREE.MeshStandardMaterial({
      color: PAL.saffron, roughness: 0.7, metalness: 0.0,
      side: THREE.DoubleSide,
    }),
    new THREE.MeshStandardMaterial({
      color: PAL.jasmine, roughness: 0.75, metalness: 0.0,
      side: THREE.DoubleSide,
    }),
  ];
  const petalGeo = new THREE.CircleGeometry(0.03, 6);
  const petalCount = 24;
  for (let i = 0; i < petalCount; i++) {
    const petal = new THREE.Mesh(petalGeo, petalMats[i % petalMats.length]);
    const r = Math.sqrt(Math.random()) * 0.17;
    const a = Math.random() * Math.PI * 2;
    petal.position.set(Math.cos(a) * r, 0.026 + Math.random() * 0.03, Math.sin(a) * r);
    petal.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
    petal.rotation.z = Math.random() * Math.PI * 2;
    petal.scale.setScalar(0.7 + Math.random() * 0.6);
    group.add(petal);
  }

  return group;
}
