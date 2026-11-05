// Les quatre bâtiments du campus, modélisés d'après le plan et les photos.
// Coordonnées en mètres : x vers l'est, z vers le sud (échelle du plan : 1 px = 0,12 m).
import * as THREE from "three";
import { Batch, faceFrame, WORLD } from "./batch";
import type { Palette } from "./materials";

type Rect = { x0: number; x1: number; z0: number; z1: number };
const rect = (x0: number, x1: number, z0: number, z1: number): Rect => ({ x0, x1, z0, z1 });

function mass(b: Batch, material: THREE.Material, r: Rect, height: number) {
  b.box(WORLD, material, [r.x1 - r.x0, height, r.z1 - r.z0], [(r.x0 + r.x1) / 2, height / 2, (r.z0 + r.z1) / 2]);
}

/** Toiture-terrasse en retrait : le liseré du mur dessine l'acrotère. */
function roof(b: Batch, material: THREE.Material, r: Rect, height: number, inset = 0.35) {
  b.floor(WORLD, material, r.x1 - r.x0 - 2 * inset, r.z1 - r.z0 - 2 * inset, [(r.x0 + r.x1) / 2, height + 0.02, (r.z0 + r.z1) / 2]);
}

function acUnit(b: Batch, p: Palette, f: THREE.Matrix4, x: number, y: number, z: number) {
  b.box(f, p.white, [0.85, 0.6, 0.32], [x, y, z + 0.16]);
  b.plane(f, p.ac, 0.85, 0.6, [x, y, z + 0.33]);
}

function steps(b: Batch, p: Palette, f: THREE.Matrix4, x: number, width: number, z: number, material = p.creamDark) {
  for (let s = 0; s < 3; s++) b.box(f, material, [width, 0.16 * (3 - s), 0.45], [x, 0.08 * (3 - s), z + 0.225 + 0.45 * s]);
}

// ---------------------------------------------------------------------------
// Bâtiment pédagogique R+3 : bibliothèque au RDC, salles de classe aux étages
// ---------------------------------------------------------------------------

const LEVELS = [0, 4.2, 7.8, 11.4, 15.0];
const H3 = 15.8;

/** Panneau ocre de cage d'escalier, avec une petite fenêtre coulissante par niveau. */
function ochrePanel(b: Batch, p: Palette, f: THREE.Matrix4, x0: number, width: number) {
  b.box(f, p.ochre, [width, H3 - 0.9, 0.08], [x0 + width / 2, (H3 - 0.9) / 2, 0.04]);
  for (let i = 0; i < 4; i++) b.plane(f, p.slider, Math.min(1.7, width - 0.6), 0.62, [x0 + width / 2, LEVELS[i] + 2.6, 0.09]);
}

/** Rangée de niches verticales (brise-soleil) avec la fenêtre en fond de niche. */
function nicheGroup(b: Batch, p: Palette, f: THREE.Matrix4, g0: number, g1: number, withAc: boolean) {
  const width = g1 - g0;
  const count = Math.max(1, Math.round(width / 1.3));
  const step = width / count;
  const cx = g0 + width / 2;
  for (let i = 0; i < 4; i++) {
    const sill = i === 0 ? 0.45 : 0.9;
    const y0 = LEVELS[i] + sill;
    const y1 = LEVELS[i + 1] - 0.12;
    b.plane(f, p.niche, width, y1 - y0, [cx, (y0 + y1) / 2, 0.02], [count, 1]);
    b.box(f, p.cream, [width + 0.5, sill, 0.62], [cx, LEVELS[i] + sill / 2, 0.31]);
  }
  b.box(f, p.cream, [width + 0.5, H3 - LEVELS[4], 0.62], [cx, (LEVELS[4] + H3) / 2, 0.31]);
  for (let k = 0; k <= count; k++) b.box(f, p.cream, [0.3, LEVELS[4], 0.62], [g0 + k * step, LEVELS[4] / 2, 0.31]);
  if (withAc) for (let k = 1; k < count; k += 3) acUnit(b, p, f, g0 + (k + 0.5) * step, LEVELS[1] - 0.6, 0.62);
}

/** Longue façade à niches, encadrée par deux cages d'escalier ocre. */
function nicheFacade(b: Batch, p: Palette, f: THREE.Matrix4, length: number, withAc = false) {
  const panel = length > 30 ? 4.2 : 0;
  const margin = 1.4;
  if (panel) {
    ochrePanel(b, p, f, margin, panel);
    ochrePanel(b, p, f, length - margin - panel, panel);
  }
  const start = margin + panel + 1;
  const end = length - margin - panel - 1;
  const span = end - start;
  if (span > 34) {
    nicheGroup(b, p, f, start, start + span / 2 - 1.5, withAc);
    nicheGroup(b, p, f, start + span / 2 + 1.5, end, withAc);
  } else {
    nicheGroup(b, p, f, start, end, withAc);
  }
}

/** Pignon : bande ocre centrale et paires de petites fenêtres carrées. */
function gableFacade(b: Batch, p: Palette, f: THREE.Matrix4, length: number) {
  const strip = Math.min(3.6, length * 0.25);
  ochrePanel(b, p, f, (length - strip) / 2, strip);
  const pairs = Math.floor((length / 2 - strip / 2 - 1.2) / 3.4);
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < pairs; k++) {
      for (const side of [-1, 1]) {
        b.plane(f, p.squarePair, 1.6, 0.7, [length / 2 + side * (strip / 2 + 1.9 + k * 3.4), LEVELS[i] + 2.3, 0.02]);
      }
    }
  }
}

/** Aile ocre de l'entrée avec ses grandes fenêtres vitrées. */
function ochreWingFacade(b: Batch, p: Palette, f: THREE.Matrix4, length: number) {
  b.box(f, p.ochre, [length - 0.6, H3 - 0.9, 0.08], [length / 2, (H3 - 0.9) / 2, 0.04]);
  const cols = Math.max(1, Math.round(length / 3.8));
  for (let c = 0; c < cols; c++) {
    for (let i = 0; i < 4; i++) {
      b.plane(f, p.tallWindow, 1.3, i === 0 ? 3.0 : 2.6, [((c + 0.5) * length) / cols, LEVELS[i] + (i === 0 ? 1.9 : 1.8), 0.09]);
    }
  }
  b.box(f, p.cream, [length, 0.5, 1.6], [length / 2, LEVELS[1] - 0.1, 0.8]);
}

/** Façade sur cour : coursives à garde-corps ocre et colonnes blanches. */
function galleryFacade(b: Batch, p: Palette, f: THREE.Matrix4, length: number) {
  const depth = 2.4;
  for (let i = 0; i < 4; i++) {
    const doors = Math.max(1, Math.floor(length / 6));
    for (let k = 0; k < doors; k++) {
      const x = ((k + 0.5) * length) / doors;
      b.plane(f, p.door, 1.1, 2.3, [x - 1.2, LEVELS[i] + 1.15 + (i ? 0.35 : 0), 0.02]);
      b.plane(f, p.slider, 1.9, 0.7, [x + 1.0, LEVELS[i] + 2.2 + (i ? 0.35 : 0), 0.02]);
    }
  }
  for (let j = 1; j < 4; j++) {
    b.box(f, p.cream, [length, 0.35, depth], [length / 2, LEVELS[j] + 0.175, depth / 2]);
    b.box(f, p.ochreDeep, [length, 1.0, 0.18], [length / 2, LEVELS[j] + 0.85, depth - 0.09]);
  }
  b.box(f, p.cream, [length, H3 - LEVELS[4], depth], [length / 2, (LEVELS[4] + H3) / 2, depth / 2]);
  const columns = Math.max(2, Math.round(length / 4.5));
  for (let k = 0; k <= columns; k++) {
    const x = Math.min(length - 0.3, Math.max(0.3, (k * length) / columns));
    b.cylinder(f, p.white, 0.17, 0.17, LEVELS[4], [x, LEVELS[4] / 2, depth - 0.35]);
  }
}

/** Entrée « SALLES DE CLASSES » : portique, atrium, coursives et escaliers en zigzag. */
function classroomEntrance(b: Batch, p: Palette) {
  const { frame: f, length: L } = faceFrame(-22, -10.1, -8, -10.1, 0, 1);
  // Portique et enseigne
  for (const x of [0.8, L - 0.8]) b.box(f, p.cream, [1.6, 7.6, 2.6], [x, 3.8, 1.1]);
  b.box(f, p.cream, [L, 2.8, 0.6], [L / 2, 6.2, 2.1]);
  b.plane(f, p.signClasses, 7.4, 0.98, [L / 2, 6.75, 2.41]);
  b.box(f, p.cream, [L - 3.2, 0.6, 2.2], [L / 2, 4.5, 1.1]);
  steps(b, p, f, L / 2, L - 3.2, 2.4);
  b.floor(f, p.paving, L, 13, [L / 2, 0.03, -6.5]);
  // Coursives avant (côté entrée) et arrière (côté cour)
  for (const level of [LEVELS[1], LEVELS[2], LEVELS[3]]) {
    b.box(f, p.cream, [L, 0.35, 3], [L / 2, level + 0.175, -1.5]);
    b.box(f, p.ochreDeep, [L, 1.0, 0.2], [L / 2, level + 0.85, -0.1]);
    b.box(f, p.cream, [L, 0.35, 3], [L / 2, level + 0.175, -11.5]);
    b.box(f, p.ochreDeep, [L, 1.0, 0.2], [L / 2, level + 0.85, -10.1]);
  }
  // Volées d'escalier en zigzag
  for (let i = 1; i < 4; i++) {
    const [xa, xb] = i % 2 ? [2.2, L - 2.2] : [L - 2.2, 2.2];
    const rise = LEVELS[i + 1] - LEVELS[i];
    const run = xb - xa;
    b.box(
      f,
      p.ochreDeep,
      [Math.hypot(rise, run), 1.1, 1.6],
      [(xa + xb) / 2, (LEVELS[i] + LEVELS[i + 1]) / 2 + 0.3, -4.4],
      [0, 0, Math.atan2(rise, run)],
    );
  }
  for (const x of [3.6, L - 3.6]) b.cylinder(f, p.white, 0.2, 0.2, LEVELS[4], [x, LEVELS[4] / 2, -2.6]);
  // Poutres de couronnement qui encadrent l'atrium
  b.box(f, p.cream, [L + 1.2, 1.0, 1.2], [L / 2, H3 - 0.2, 0.2]);
  b.box(f, p.cream, [L + 1.2, 1.0, 1.2], [L / 2, H3 - 0.2, -12.4]);
}

export function buildR3(p: Palette) {
  const b = new Batch();
  const blocks = [
    rect(-51, 12.2, -81.4, -68.4), // aile nord
    rect(-0.8, 12.2, -68.4, -29.6), // aile est
    rect(-0.8, 3.2, -29.6, -23.1),
    rect(-51, -38, -68.4, -57.4), // ailes ouest
    rect(-41.8, -28.8, -57.4, -31),
    rect(-56.2, -28.8, -31, -23.1),
    rect(-56.2, -22, -23.1, -10.1), // aile sud, de part et d'autre de l'entrée
    rect(-8, 3.2, -23.1, -10.1),
  ];
  for (const r of blocks) {
    mass(b, p.cream, r, H3);
    roof(b, p.creamDark, r, H3);
  }

  type Facade = "niches" | "gable" | "ochre";
  const exterior: [number, number, number, number, number, number, Facade][] = [
    [-51, -81.4, 12.2, -81.4, 0, -1, "niches"],
    [12.2, -81.4, 12.2, -29.6, 1, 0, "niches"],
    [12.2, -29.6, 3.2, -29.6, 0, 1, "gable"],
    [3.2, -29.6, 3.2, -10.1, 1, 0, "gable"],
    [3.2, -10.1, -8, -10.1, 0, 1, "ochre"],
    [-22, -10.1, -34, -10.1, 0, 1, "ochre"],
    [-34, -10.1, -56.2, -10.1, 0, 1, "niches"],
    [-56.2, -10.1, -56.2, -31, -1, 0, "gable"],
    [-56.2, -31, -41.8, -31, 0, -1, "gable"],
    [-41.8, -31, -41.8, -57.4, -1, 0, "niches"],
    [-41.8, -57.4, -51, -57.4, 0, 1, "gable"],
    [-51, -57.4, -51, -81.4, -1, 0, "niches"],
  ];
  for (const [xa, za, xb, zb, nx, nz, kind] of exterior) {
    const { frame, length } = faceFrame(xa, za, xb, zb, nx, nz);
    if (kind === "niches") nicheFacade(b, p, frame, length, nz !== 0);
    else if (kind === "gable") gableFacade(b, p, frame, length);
    else ochreWingFacade(b, p, frame, length);
  }

  // Cour intérieure
  const courtyard: [number, number, number, number, number, number][] = [
    [-38, -68.4, -0.8, -68.4, 0, 1],
    [-0.8, -68.4, -0.8, -23.1, -1, 0],
    [-38, -68.4, -38, -57.4, 1, 0],
    [-38, -57.4, -28.8, -57.4, 0, -1],
    [-28.8, -57.4, -28.8, -23.1, 1, 0],
    [-28.8, -23.1, -22, -23.1, 0, -1],
    [-8, -23.1, -0.8, -23.1, 0, -1],
  ];
  for (const [xa, za, xb, zb, nx, nz] of courtyard) {
    const { frame, length } = faceFrame(xa, za, xb, zb, nx, nz);
    galleryFacade(b, p, frame, length);
  }
  b.floor(WORLD, p.paving, 37.2, 45.3, [-19.4, 0.03, -45.75]);

  classroomEntrance(b, p);
  return b.build("Bâtiment R+3");
}

// ---------------------------------------------------------------------------
// Restaurant universitaire : façade blanche, bloc d'entrée ocre, fresque, colonnade
// ---------------------------------------------------------------------------

function slotWindow(b: Batch, p: Palette, f: THREE.Matrix4, x: number) {
  b.plane(f, p.tallWindow, 0.9, 2.6, [x, 6.6, 0.02]);
  b.box(f, p.accent, [1.0, 1.5, 0.08], [x, 4.6, 0.04]);
  b.plane(f, p.grille, 0.9, 2.9, [x, 2.2, 0.02]);
}

export function buildRestaurant(p: Palette) {
  const b = new Batch();
  const main = rect(-58.1, -24.7, 39.5, 65.5);
  const low = rect(-58.1, -24.7, 27.7, 39.5);
  mass(b, p.white, main, 9);
  roof(b, p.whiteRoof, main, 9);
  mass(b, p.white, low, 8.3);
  roof(b, p.whiteRoof, low, 8.3);

  // Façade principale (est)
  {
    const { frame: f, length: L } = faceFrame(-24.7, 65.5, -24.7, 27.7, 1, 0);
    b.box(f, p.accent, [L, 0.7, 0.5], [L / 2, 0.35, 0.25]);
    for (const x of [2.6, 6.2, 9.8]) slotWindow(b, p, f, x);
    // Loggia de l'étage
    b.plane(f, p.interior, 11, 3.0, [19.5, 6.9, 0.02]);
    for (let k = 0; k < 4; k++) b.box(f, p.white, [0.5, 3.0, 0.4], [14 + (k * 11) / 3, 6.9, 0.2]);
    // Bloc d'entrée ocre
    b.box(f, p.accent, [9.4, 7.0, 1.6], [20.2, 3.5, 0.8]);
    b.box(f, p.white, [6.6, 5.0, 0.12], [20.2, 2.5, 1.66]);
    b.plane(f, p.interior, 5.8, 4.5, [20.2, 2.35, 1.73]);
    steps(b, p, f, 20.2, 6.4, 1.6, p.accent);
    // Fresque et rampe d'accès
    b.plane(f, p.mural, 8.8, 6.4, [31.8, 4.3, 0.03]);
    b.box(f, p.accent, [10.2, 0.7, 2.2], [31.8, 0.35, 1.1]);
    for (let x = 27; x <= 36.6; x += 1.6) b.box(f, p.metal, [0.06, 1.0, 0.06], [x, 1.2, 2.0]);
    b.box(f, p.metal, [9.8, 0.06, 0.06], [31.8, 1.7, 2.0]);
  }

  // Colonnade (nord) : piliers blancs devant des murs ocre
  {
    const { frame: f, length: L } = faceFrame(-24.7, 27.7, -58.1, 27.7, 0, -1);
    const bays = 8;
    const bay = L / bays;
    for (let k = 0; k <= bays; k++) b.box(f, p.white, [1.0, 8.3, 1.8], [Math.min(L - 0.5, Math.max(0.5, k * bay)), 4.15, 0.9]);
    b.box(f, p.white, [L, 0.8, 1.8], [L / 2, 7.9, 0.9]);
    for (let k = 0; k < bays; k++) {
      const x = (k + 0.5) * bay;
      b.box(f, p.orange, [bay - 1.0, 7.5, 0.06], [x, 3.75, 0.03]);
      b.plane(f, p.slider, 1.8, 1.0, [x - 0.3, 6.2, 0.08]);
      b.plane(f, p.grille, 2.2, 1.4, [x - 0.2, 2.3, 0.08]);
      acUnit(b, p, f, x + 0.1, 4.0, 0.06);
    }
  }

  // Façades ouest et sud
  for (const [xa, za, xb, zb, nx, nz] of [
    [-58.1, 27.7, -58.1, 65.5, -1, 0],
    [-58.1, 65.5, -24.7, 65.5, 0, 1],
  ] as const) {
    const { frame: f, length: L } = faceFrame(xa, za, xb, zb, nx, nz);
    b.box(f, p.accent, [L, 0.7, 0.4], [L / 2, 0.35, 0.2]);
    for (let x = 4; x < L - 3; x += 5.5) slotWindow(b, p, f, x);
  }
  return b.build("Restaurant universitaire");
}

// ---------------------------------------------------------------------------
// Laboratoire : atelier de génie mécanique de plain-pied, claustras ocre
// ---------------------------------------------------------------------------

export function buildLaboratory(p: Palette) {
  const b = new Batch();
  const r = rect(22.9, 56.5, -22.1, 13.6);
  mass(b, p.white, r, 5.4);
  roof(b, p.whiteRoof, r, 5.4);

  // Façade principale (ouest)
  {
    const { frame: f, length: L } = faceFrame(22.9, -22.1, 22.9, 13.6, -1, 0);
    const c = L / 2;
    // Bloc d'entrée surmonté de l'enseigne
    b.box(f, p.white, [7.2, 8.0, 1.6], [c, 4.0, 0.8]);
    b.plane(f, p.signLab, 6.8, 0.82, [c, 7.0, 1.61]);
    b.plane(f, p.interior, 6.0, 5.6, [c, 2.8, 1.61]);
    b.plane(f, p.shutter, 5.6, 1.9, [c, 4.55, 1.62]);
    b.plane(f, p.glassDoor, 5.6, 3.4, [c, 1.75, 1.62]);
    steps(b, p, f, c, 6.6, 1.6, p.whiteRoof);
    // Pilier à pilastres ocre et fenêtre haute
    b.box(f, p.white, [3.2, 6.6, 0.9], [c - 5.2, 3.3, 0.45]);
    for (const x of [c - 6.5, c - 4.0]) b.box(f, p.accent, [0.35, 6.6, 0.14], [x, 3.3, 0.97]);
    b.plane(f, p.grille, 1.1, 2.6, [c - 5.25, 2.5, 0.92]);
    // Panneaux de claustra
    for (const x of [c - 11.5, c + 11.5]) {
      b.box(f, p.accent, [8.8, 3.8, 0.35], [x, 2.9, 0.18]);
      b.plane(f, p.claustra, 8.4, 3.4, [x, 2.9, 0.36]);
    }
    for (const x of [1.0, 23.3, L - 1.0]) b.plane(f, p.grille, 1.0, 0.85, [x, 3.0, 0.02]);
  }

  // Autres façades : petites fenêtres grillagées et grande porte de service
  for (const [xa, za, xb, zb, nx, nz] of [
    [56.5, 13.6, 56.5, -22.1, 1, 0],
    [56.5, -22.1, 22.9, -22.1, 0, -1],
    [22.9, 13.6, 56.5, 13.6, 0, 1],
  ] as const) {
    const { frame: f, length: L } = faceFrame(xa, za, xb, zb, nx, nz);
    for (let x = 3; x < L - 2; x += 4.5) b.plane(f, p.grille, 1.0, 0.85, [x, 3.0, 0.02]);
    if (nx === 1) {
      b.plane(f, p.shutter, 5.2, 4.2, [L / 2, 2.1, 0.03]);
      b.box(f, p.whiteRoof, [6.2, 0.4, 1.4], [L / 2, 4.5, 0.7]);
    }
  }
  return b.build("Laboratoire");
}

// ---------------------------------------------------------------------------
// Administration : volumes beiges de plain-pied, encadrements ocre
// ---------------------------------------------------------------------------

function framedWindow(b: Batch, p: Palette, f: THREE.Matrix4, x: number, y: number, w: number, h: number) {
  b.box(f, p.adminFrame, [w + 0.5, h + 0.5, 0.1], [x, y, 0.05]);
  for (const side of [-1, 1]) b.box(f, p.adminFrame, [0.25, 0.7, 0.1], [x + side * (w / 2 + 0.12), y - h / 2 - 0.55, 0.05]);
  b.plane(f, p.whiteGrille, w, h, [x, y, 0.11]);
}

export function buildAdministration(p: Palette) {
  const b = new Batch();
  const north = rect(21.4, 33, 38.2, 50.5);
  const centre = rect(20.6, 33.8, 50.5, 63.8);
  const south = rect(21.4, 33, 63.8, 76.1);
  const back = rect(42, 58.3, 38.2, 76.1);
  for (const [r, h] of [
    [north, 4.6],
    [centre, 5.6],
    [south, 4.6],
    [back, 4.4],
  ] as const) {
    mass(b, p.adminWall, r, h);
    roof(b, p.adminRoof, r, h, 0.3);
  }

  // Ailes latérales de la façade : fenêtres à encadrement ocre et climatiseurs
  for (const r of [north, south]) {
    const { frame: f, length: L } = faceFrame(r.x0, r.z0, r.x0, r.z1, -1, 0);
    b.box(f, p.adminFrame, [L, 0.3, 0.06], [L / 2, 0.15, 0.03]);
    for (const [x, w, h, y] of [
      [2.3, 1.3, 1.7, 2.0],
      [L / 2, 1.2, 0.8, 2.6],
      [L - 2.3, 1.3, 1.7, 2.0],
    ]) {
      framedWindow(b, p, f, x, y, w, h);
    }
    b.box(f, p.adminFrame, [1.4, 0.12, 0.08], [L / 2, 3.9, 0.04]);
    for (const x of [2.9, L - 2.9]) acUnit(b, p, f, x, 3.7, 0.0);
  }

  // Volume central : petites fenêtres carrées, aérations rondes, descentes d'eau
  {
    const { frame: f, length: L } = faceFrame(centre.x0, centre.z0, centre.x0, centre.z1, -1, 0);
    b.box(f, p.adminFrame, [L, 0.3, 0.06], [L / 2, 0.15, 0.03]);
    for (const dx of [-3.3, -1.1, 1.1, 3.3]) b.plane(f, p.whiteGrille, 1.0, 0.95, [L / 2 + dx, 2.9, 0.02]);
    for (const dx of [-2.5, 0, 2.5]) b.cylinder(f, p.interior, 0.13, 0.13, 0.1, [L / 2 + dx, 4.7, 0.03], [Math.PI / 2, 0, 0]);
    for (const x of [1.0, L - 1.0]) b.box(f, p.metalLight, [0.12, 5.4, 0.12], [x, 2.7, 0.12]);
  }

  // Bâtiment arrière avec portique
  {
    const { frame: f, length: L } = faceFrame(back.x0, back.z0, back.x0, back.z1, -1, 0);
    b.box(f, p.adminWall, [12, 0.45, 3.2], [L / 2, 3.25, 1.6]);
    for (const dx of [-5.6, -1.9, 1.9, 5.6]) b.box(f, p.adminFrame, [0.7, 3.0, 0.7], [L / 2 + dx, 1.5, 2.9]);
    for (const dx of [-4, 0, 4]) b.plane(f, p.door, 1.2, 2.3, [L / 2 + dx, 1.15, 0.02]);
    for (const x of [3, 8, L - 8, L - 3]) framedWindow(b, p, f, x, 2.2, 1.2, 1.4);
  }
  return b.build("Administration");
}
