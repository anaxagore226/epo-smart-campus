// Terrain, clôture, portail d'entrée et éléments d'ambiance du campus.
import type * as THREE from "three";
import { Batch, faceFrame, frameAt, WORLD } from "./batch";
import type { Palette } from "./materials";
import { seeded } from "./textures";

/** Enceinte du campus et ouverture du portail (côté ouest, comme sur le plan). */
export const ENCLOSURE = { x0: -66, x1: 66, z0: -88, z1: 88 };
const GATE = { z0: -8.5, z1: 4.5 };

type Rect = { x0: number; x1: number; z0: number; z1: number };

/** Zones occupées : la végétation et les touffes d'herbe les évitent. */
const OCCUPIED: Rect[] = [
  { x0: -58, x1: 14, z0: -84, z1: -8 },
  { x0: -60, x1: -22, z0: 25, z1: 68 },
  { x0: 20, x1: 59, z0: -24, z1: 16 },
  { x0: 19, x1: 60, z0: 36, z1: 78 },
  { x0: -66, x1: 22, z0: -8, z1: 4 },
  { x0: 13, x1: 22, z0: -30, z1: 84 },
  { x0: -64, x1: -57, z0: 5, z1: 12 },
];
const isFree = (x: number, z: number, margin = 0) =>
  !OCCUPIED.some((r) => x > r.x0 - margin && x < r.x1 + margin && z > r.z0 - margin && z < r.z1 + margin);

function wallSegment(b: Batch, p: Palette, xa: number, za: number, xb: number, zb: number) {
  const length = Math.hypot(xb - xa, zb - za);
  const f = frameAt(xa, za, Math.atan2(-(zb - za), xb - xa));
  b.box(f, p.wall, [length, 2.4, 0.3], [length / 2, 1.2, 0]);
  b.box(f, p.wallCap, [length, 0.12, 0.42], [length / 2, 2.46, 0]);
  const posts = Math.max(1, Math.round(length / 5));
  for (let k = 0; k <= posts; k++) b.box(f, p.wallCap, [0.45, 2.7, 0.5], [(k * length) / posts, 1.35, 0]);
}

/** Portail rouge surmonté de l'inscription « École Polytechnique de Ouagadougou ». */
function gate(b: Batch, p: Palette) {
  const x = ENCLOSURE.x0;
  const zMid = (GATE.z0 + GATE.z1) / 2;
  for (const z of [GATE.z0 - 0.8, GATE.z1 + 0.8]) b.box(WORLD, p.gateRed, [1.4, 6.4, 1.4], [x, 3.2, z]);
  const span = GATE.z1 - GATE.z0 + 3.0;
  b.box(WORLD, p.gateRed, [1.4, 2.0, span], [x, 7.2, zMid]);
  // Inscription sur les deux faces : lisible en arrivant et en sortant
  const outside = faceFrame(x - 0.7, GATE.z0 - 1.5, x - 0.7, GATE.z1 + 1.5, -1, 0);
  b.plane(outside.frame, p.signGate, span - 0.6, 1.5, [outside.length / 2, 7.2, 0.01]);
  const inside = faceFrame(x + 0.7, GATE.z1 + 1.5, x + 0.7, GATE.z0 - 1.5, 1, 0);
  b.plane(inside.frame, p.signGate, span - 0.6, 1.5, [inside.length / 2, 7.2, 0.01]);
  // Bornes jaunes et panneau d'accueil à l'entrée
  for (const z of [GATE.z0 - 2.2, GATE.z1 + 2.2]) b.cylinder(WORLD, p.accent, 0.35, 0.35, 1.2, [x + 1.6, 0.6, z]);
  b.box(WORLD, p.white, [0.3, 3.2, 1.2], [x + 4.5, 1.6, GATE.z1 + 3.5]);
}

function guardHouse(b: Batch, p: Palette) {
  b.box(WORLD, p.adminWall, [4.5, 3.2, 4.5], [-61.2, 1.6, 8.7]);
  b.floor(WORLD, p.adminRoof, 4.0, 4.0, [-61.2, 3.22, 8.7]);
  const { frame: f } = faceFrame(-58.95, 6.45, -58.95, 10.95, 1, 0);
  b.plane(f, p.door, 1.0, 2.2, [1.4, 1.1, 0.02]);
  b.plane(f, p.whiteGrille, 1.0, 1.0, [3.2, 1.8, 0.02]);
}

function tree(b: Batch, p: Palette, x: number, z: number, size: number, random: () => number) {
  b.cylinder(WORLD, p.trunk, 0.14 * size, 0.2 * size, 2.6 * size, [x, 1.3 * size, z], [0, 0, 0], 6);
  const crowns = 3;
  for (let i = 0; i < crowns; i++) {
    const a = (i / crowns) * Math.PI * 2 + random();
    b.sphere(
      WORLD,
      i % 2 ? p.leafLight : p.leaf,
      1.5 * size,
      [x + Math.cos(a) * 0.9 * size, (3.1 + random() * 0.6) * size, z + Math.sin(a) * 0.9 * size],
      [1.2, 0.85, 1.2],
    );
  }
}

function solarLamp(b: Batch, p: Palette, x: number, z: number, angle: number) {
  const f = frameAt(x, z, angle);
  b.cylinder(f, p.metalLight, 0.07, 0.1, 6.6, [0, 3.3, 0], [0, 0, 0], 8);
  b.box(f, p.solar, [1.6, 0.06, 0.9], [0, 6.75, 0], [0.35, 0, 0]);
  b.box(f, p.metalLight, [1.2, 0.07, 0.07], [0.6, 5.9, 0]);
  b.box(f, p.metal, [0.6, 0.12, 0.3], [1.2, 5.85, 0]);
}

function waterTower(b: Batch, p: Palette, x: number, z: number) {
  const f = frameAt(x, z);
  for (const [dx, dz] of [
    [-1.8, -1.8],
    [1.8, -1.8],
    [-1.8, 1.8],
    [1.8, 1.8],
  ]) {
    b.box(f, p.steelRed, [0.18, 6.0, 0.18], [dx, 3.0, dz]);
  }
  for (const y of [2.0, 4.0]) {
    b.box(f, p.steelRed, [3.6, 0.1, 0.1], [0, y, -1.8]);
    b.box(f, p.steelRed, [3.6, 0.1, 0.1], [0, y, 1.8]);
    b.box(f, p.steelRed, [0.1, 0.1, 3.6], [-1.8, y, 0]);
    b.box(f, p.steelRed, [0.1, 0.1, 3.6], [1.8, y, 0]);
  }
  b.box(f, p.steelRed, [4.6, 0.15, 4.6], [0, 6.05, 0]);
  for (const s of [-1, 1]) {
    b.box(f, p.steelRed, [4.6, 0.06, 0.06], [0, 7.0, s * 2.3]);
    b.box(f, p.steelRed, [0.06, 0.06, 4.6], [s * 2.3, 7.0, 0]);
  }
  b.cylinder(f, p.tank, 1.4, 1.4, 2.4, [0, 7.35, 0], [0, 0, 0], 20);
}

function vehicle(b: Batch, p: Palette, x: number, z: number, angle: number, body: THREE.Material, van: boolean) {
  const f = frameAt(x, z, angle);
  const length = van ? 4.4 : 4.2;
  const height = van ? 1.7 : 1.0;
  b.box(f, body, [length, height, 1.8], [0, 0.35 + height / 2, 0]);
  b.box(f, p.glassDark, [van ? 1.2 : 2.0, 0.6, 1.72], [van ? length / 2 - 0.9 : -0.2, 0.35 + height + (van ? -0.45 : 0.3), 0]);
  if (!van) b.box(f, body, [2.2, 0.08, 1.7], [-0.2, 0.35 + height + 0.62, 0]);
  for (const dx of [-length / 2 + 0.8, length / 2 - 0.8]) {
    for (const dz of [-0.9, 0.9]) b.cylinder(f, p.tyre, 0.34, 0.34, 0.24, [dx, 0.34, dz], [Math.PI / 2, 0, 0], 12);
  }
}

export function buildSite(p: Palette) {
  const flat = new Batch();
  const b = new Batch();
  const random = seeded(42);

  // Sol en latérite, voies de circulation, voie publique devant le portail
  flat.floor(WORLD, p.ground, 640, 640, [0, 0, 0], [80, 80]);
  flat.floor(WORLD, p.road, 87, 10, [-22.5, 0.02, -2], [11, 1.25]);
  flat.floor(WORLD, p.road, 7.5, 114, [17.25, 0.025, 27], [1, 14]);
  flat.floor(WORLD, p.road, 18, 640, [-79, 0.02, 0], [2, 80]);
  flat.floor(WORLD, p.paving, 10, 13, [-17.5, 0.035, 9], [1, 1]);

  // Touffes d'herbe sèche
  for (let i = 0, placed = 0; i < 400 && placed < 60; i++) {
    const x = ENCLOSURE.x0 + 3 + random() * (ENCLOSURE.x1 - ENCLOSURE.x0 - 6);
    const z = ENCLOSURE.z0 + 3 + random() * (ENCLOSURE.z1 - ENCLOSURE.z0 - 6);
    if (!isFree(x, z, 1)) continue;
    const r = 1.2 + random() * 3.5;
    flat.cylinder(WORLD, p.grass, r, r, 0.04, [x, 0.04, z], [0, 0, 0], 10);
    placed++;
  }

  // Clôture et portail
  const { x0, x1, z0, z1 } = ENCLOSURE;
  wallSegment(b, p, x0, z0, x1, z0);
  wallSegment(b, p, x1, z0, x1, z1);
  wallSegment(b, p, x1, z1, x0, z1);
  wallSegment(b, p, x0, z1, x0, GATE.z1);
  wallSegment(b, p, x0, GATE.z0, x0, z0);
  gate(b, p);
  guardHouse(b, p);

  // Jardin de l'administration
  for (const z of [44, 57, 70]) b.box(WORLD, p.hedge, [1.6, 1.1, 9], [37.5, 0.55, z]);
  b.box(WORLD, p.hedge, [14, 1.0, 1.4], [27, 0.5, 34.5]);

  // Arbres : le long de la clôture, au jardin et près de l'entrée
  const trees: [number, number, number][] = [
    [-61, 18, 1.1], [-60, -14, 1.0], [-20, 22, 0.9], [-12, 30, 1.2], [-4, 46, 1.0], [-14, 72, 1.1],
    [37.5, 50.5, 0.9], [37.5, 63.5, 1.0], [62, 30, 1.2], [62, -30, 1.1], [62, -60, 1.0], [40, -40, 1.2],
    [26, -80, 1.0], [46, -82, 1.1], [62, 84, 1.0], [-40, 82, 1.2], [-58, 76, 1.0], [-6, 84, 0.9], [8, 60, 1.1],
  ];
  for (const [x, z, size] of trees) tree(b, p, x, z, size, random);

  // Lampadaires solaires le long des voies
  for (const x of [-50, -32, -14, 4]) solarLamp(b, p, x, 4.2, Math.PI);
  for (const z of [20, 42, 64]) solarLamp(b, p, 12.8, z, 0);
  solarLamp(b, p, 22, -27, Math.PI / 2);

  waterTower(b, p, 61, 80);
  vehicle(b, p, 17.5, -24, Math.PI / 2, p.van, true);
  vehicle(b, p, -48, 8.5, 0.1, p.car, false);

  const group = b.build("Site");
  group.add(flat.build("Sol", false));
  return group;
}
