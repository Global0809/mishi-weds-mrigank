// extras.js — celebratory additions: aerial banner plane, swans, a paise-udana
// money fountain, a firework, and the elephant's "TEAM GROOM" banner.
// All procedural, low-poly, mobile-light. Each returns { group } or { group, update }.
import * as THREE from 'three';
import { PAL } from './shared.js';

// ---------------------------------------------------------------------------
// Fabric-banner canvas texture (used by the plane + the elephant banner)
// ---------------------------------------------------------------------------
export function makeBannerTexture(text, opts = {}) {
  const W = 1024, H = 256;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  x.fillStyle = opts.bg || '#5e1220';
  x.fillRect(0, 0, W, H);
  // gold border
  x.strokeStyle = opts.border || '#e9c46a';
  x.lineWidth = 20;
  x.strokeRect(12, 12, W - 24, H - 24);
  // ornate corner dots
  x.fillStyle = opts.border || '#e9c46a';
  [[30, 30], [W - 30, 30], [30, H - 30], [W - 30, H - 30]].forEach(([px, py]) => {
    x.beginPath(); x.arc(px, py, 10, 0, Math.PI * 2); x.fill();
  });
  x.fillStyle = opts.fg || '#ffd97a';
  x.font = 'bold ' + (opts.size || 128) + 'px Georgia, "Times New Roman", serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(text, W / 2, H / 2 + 6);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
}

// ---------------------------------------------------------------------------
// Aerial banner plane — flies a slow wide circle, banks into the turn so the
// trailing banner catches the sunset. update(t).
// ---------------------------------------------------------------------------
export function createPlaneBanner(text, opts = {}) {
  const g = new THREE.Group();
  const body = new THREE.Group(); // forward = +Z; body rolls for banking
  g.add(body);

  const bodyMat = new THREE.MeshStandardMaterial({ color: PAL.cream, roughness: 0.6, metalness: 0.2 });
  const redMat = new THREE.MeshStandardMaterial({ color: PAL.crimson, roughness: 0.5, metalness: 0.1 });
  const goldMat = new THREE.MeshStandardMaterial({ color: PAL.gold, roughness: 0.3, metalness: 0.85, emissive: PAL.brass, emissiveIntensity: 0.25 });

  const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.34, 4, 8), bodyMat);
  fuse.rotation.x = Math.PI / 2; body.add(fuse);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.8, 8), goldMat);
  nose.rotation.x = Math.PI / 2; nose.position.z = 2.4; body.add(nose);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.1, 0.8), redMat);
  wing.position.z = 0.2; body.add(wing);
  const tailW = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 0.5), redMat);
  tailW.position.z = -1.9; body.add(tailW);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.6), redMat);
  fin.position.set(0, 0.36, -1.9); body.add(fin);

  // trailing horizontal banner
  const bw = 2.6, bl = 13;
  const bgeo = new THREE.PlaneGeometry(bw, bl, 1, 26);
  bgeo.rotateX(-Math.PI / 2); // lie flat, length along Z
  const bmat = new THREE.MeshStandardMaterial({
    map: makeBannerTexture(text, { size: 118 }), // burgundy cloth, gold text — reads without blooming out
    side: THREE.DoubleSide, roughness: 0.85, metalness: 0.0,
  });
  const banner = new THREE.Mesh(bgeo, bmat);
  banner.position.z = -3 - bl / 2;
  body.add(banner);
  const base = bgeo.attributes.position.array.slice();

  const R = opts.radius || 96;
  const H0 = opts.height || 44;
  const speed = opts.speed || 0.075;

  return {
    group: g,
    update: (t) => {
      const a = t * speed;
      g.position.set(Math.cos(a) * R, H0 + Math.sin(t * 0.25) * 2.5, Math.sin(a) * R);
      // heading tangent (forward = +Z)
      const hx = -Math.sin(a), hz = Math.cos(a);
      g.rotation.y = Math.atan2(hx, hz);
      body.rotation.z = -0.32 + Math.sin(t * 0.8) * 0.05; // bank into the turn
      // ripple the banner
      const p = bgeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const bz = base[i * 3 + 2];
        p.setY(i, Math.sin(bz * 0.5 + t * 4.5) * 0.45 * ((bz + bl / 2) / bl + 0.2));
      }
      p.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------------------
// White swan — floats and drifts a slow circle on the pond. update(t).
// Placed via a grounded wrapper (position owned by main.js); it drifts
// relative to that wrapper.
// ---------------------------------------------------------------------------
export function createSwan(phase = 0) {
  const g = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xfcfcf6, roughness: 0.6, metalness: 0.0 });
  const beakMat = new THREE.MeshStandardMaterial({ color: PAL.saffron, roughness: 0.5 });

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), white);
  body.scale.set(1, 0.72, 1.55); body.position.y = 0.28; g.add(body);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 6), white);
  tail.position.set(0, 0.42, -0.62); tail.rotation.x = -1.0; g.add(tail);
  // curved neck (two segments) + head
  const n1 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.45, 6), white);
  n1.position.set(0, 0.55, 0.55); n1.rotation.x = 0.35; g.add(n1);
  const n2 = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.4, 6), white);
  n2.position.set(0, 0.88, 0.68); n2.rotation.x = -0.25; g.add(n2);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), white);
  head.position.set(0, 1.05, 0.78); g.add(head);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 5), beakMat);
  beak.rotation.x = Math.PI / 2; beak.position.set(0, 1.02, 0.95); g.add(beak);

  const r = 2.0 + (phase % 1) * 1.2;
  return {
    group: g,
    update: (t) => {
      const a = t * 0.14 + phase;
      g.position.set(Math.cos(a) * r, Math.sin(t * 0.8 + phase) * 0.05, Math.sin(a) * r);
      g.rotation.y = -a + Math.PI / 2;
    },
  };
}

// ---------------------------------------------------------------------------
// Money fountain (paise udana) — tiny notes tossed up from a point, fall,
// respawn. One InstancedMesh. update(t, dt).
// ---------------------------------------------------------------------------
export function createMoneyFountain(opts = {}) {
  const N = opts.count || 36;
  const origin = opts.origin || [0, 2.2, 0];
  const ground = opts.ground !== undefined ? opts.ground : origin[1] - 2.0;
  const geo = new THREE.PlaneGeometry(0.17, 0.09);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x8ed19a, side: THREE.DoubleSide, roughness: 0.7, metalness: 0.0,
    emissive: 0x2f6a2a, emissiveIntensity: 0.12,
  });
  const inst = new THREE.InstancedMesh(geo, mat, N);
  inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const d = new THREE.Object3D();
  const P = [];
  const spawn = () => ({
    x: origin[0], y: origin[1], z: origin[2],
    vx: (Math.random() - 0.5) * 1.6, vy: 2.4 + Math.random() * 2.4, vz: (Math.random() - 0.5) * 1.6,
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 9, delay: Math.random() * 1.5,
  });
  for (let i = 0; i < N; i++) P.push(spawn());
  return {
    group: inst,
    update: (t, dt) => {
      dt = Math.min(dt || 0.016, 0.05);
      for (let i = 0; i < N; i++) {
        const p = P[i];
        if (p.delay > 0) { p.delay -= dt; d.position.set(0, -999, 0); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); continue; }
        p.vy -= 6.2 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.rot += p.vr * dt;
        if (p.y < ground) Object.assign(p, spawn());
        d.position.set(p.x, p.y, p.z);
        d.rotation.set(p.rot * 0.5, p.rot, p.rot * 0.3);
        d.updateMatrix();
        inst.setMatrixAt(i, d.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------------------
// Firework — a rocket rises from `origin`, bursts into colored sparks, repeats.
// update(t). Sparks glow via bloom (MeshBasic). Cheap.
// ---------------------------------------------------------------------------
export function createFirework(opts = {}) {
  const origin = opts.origin || [0, 1.2, 0];
  const rise = opts.rise || 11;
  const cycle = opts.cycle || 4.2;
  const N = 26;
  const g = new THREE.Group();

  const rocket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.09, 0.45, 6),
    new THREE.MeshStandardMaterial({ color: PAL.crimson, emissive: PAL.marigold, emissiveIntensity: 0.8 })
  );
  g.add(rocket);
  const smat = new THREE.MeshBasicMaterial({ color: PAL.goldBright, transparent: true, opacity: 1 });
  const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 5, 4), smat, N);
  sparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  g.add(sparks);
  const d = new THREE.Object3D();
  const S = [];
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1), sp = 3 + Math.random() * 3.2;
    S.push({ vx: Math.sin(b) * Math.cos(a) * sp, vy: Math.cos(b) * sp, vz: Math.sin(b) * Math.sin(a) * sp });
  }
  const col = new THREE.Color();
  return {
    group: g,
    update: (t) => {
      const phase = t % cycle;
      const burstY = origin[1] + rise;
      if (phase < 1.2) {
        rocket.visible = true; sparks.visible = false;
        rocket.position.set(origin[0], origin[1] + (phase / 1.2) * rise, origin[2]);
      } else {
        rocket.visible = false; sparks.visible = true;
        const bt = phase - 1.2;
        const fade = Math.max(0, 1 - bt / 1.7);
        smat.opacity = fade;
        col.setHSL((Math.floor(t / cycle) * 0.27) % 1, 0.9, 0.62);
        smat.color.copy(col);
        for (let i = 0; i < N; i++) {
          const s = S[i];
          d.position.set(origin[0] + s.vx * bt, burstY + s.vy * bt - 3.1 * bt * bt, origin[2] + s.vz * bt);
          d.scale.setScalar(0.5 + fade * 0.7);
          d.updateMatrix();
          sparks.setMatrixAt(i, d.matrix);
        }
        sparks.instanceMatrix.needsUpdate = true;
      }
    },
  };
}

// ---------------------------------------------------------------------------
// "TEAM GROOM" banner — a waving cloth on two poles (held before the elephant).
// Vertical cloth, face along ±Z by default. update(t).
// ---------------------------------------------------------------------------
export function createTeamGroomBanner(text = 'TEAM GROOM') {
  const g = new THREE.Group();
  const w = 3.4, h = 0.95;
  const geo = new THREE.PlaneGeometry(w, h, 16, 1);
  const mat = new THREE.MeshStandardMaterial({
    map: makeBannerTexture(text, { size: 140 }),
    side: THREE.DoubleSide, roughness: 0.82, metalness: 0.0,
    emissive: 0x2a0810, emissiveIntensity: 0.15,
  });
  const cloth = new THREE.Mesh(geo, mat);
  cloth.position.y = h / 2;
  g.add(cloth);
  const poleMat = new THREE.MeshStandardMaterial({ color: PAL.brass, metalness: 0.9, roughness: 0.3 });
  const poleGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.5, 6);
  [-1, 1].forEach((s) => {
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set((s * w) / 2, h / 2 - 0.1, 0);
    g.add(pole);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), poleMat);
    knob.position.set((s * w) / 2, h + 0.3, 0);
    g.add(knob);
  });
  const base = geo.attributes.position.array.slice();
  return {
    group: g,
    update: (t) => {
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const bx = base[i * 3];
        p.setZ(i, Math.sin(bx * 1.6 + t * 3.2) * 0.13);
      }
      p.needsUpdate = true;
    },
  };
}
