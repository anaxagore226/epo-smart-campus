import * as THREE from "three";
import { createTextures } from "./textures";

/** Matériaux partagés par tout le campus ; couleurs relevées sur les photos. */
export function createPalette(anisotropy: number) {
  const textures = createTextures(anisotropy);
  const solid = (color: number, roughness = 0.9, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  // Les éléments plaqués sur un mur (fenêtres, enseignes…) passent devant lui sans scintiller.
  const decal = (options: THREE.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial({ roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, ...options });

  return {
    textures,
    // Bâtiment R+3
    cream: solid(0xe8d2ad),
    creamDark: solid(0xcbb690),
    ochre: solid(0xd39a45),
    ochreDeep: solid(0xd08d38),
    // Restaurant et atelier
    white: solid(0xf1ece3),
    whiteRoof: solid(0xd6cfc2),
    accent: solid(0xdba548),
    orange: solid(0xd68e34),
    // Administration
    adminWall: solid(0xdcb898),
    adminRoof: solid(0xc7a687),
    adminFrame: solid(0xd8a24e),
    // Clôture et portail
    gateRed: solid(0xc4665a),
    wall: solid(0xd6a96c),
    wallCap: solid(0xeee4d3),
    // Métal, végétation, véhicules
    metal: solid(0x6b7073, 0.5, 0.6),
    metalLight: solid(0xb8bcbe, 0.5, 0.4),
    steelRed: solid(0x8c3a2c, 0.6, 0.5),
    tank: solid(0x1f2325, 0.5, 0.1),
    solar: solid(0x1b2b45, 0.25, 0.6),
    leaf: solid(0x46703a),
    leafLight: solid(0x5f8a40),
    hedge: solid(0x3f6a35),
    trunk: solid(0x6a4a33),
    grass: solid(0x7d8645),
    paving: solid(0xd8c6a6),
    van: solid(0x2e5a4b, 0.5, 0.3),
    car: solid(0x2d4f86, 0.4, 0.4),
    tyre: solid(0x1e1f20),
    glassDark: solid(0x26313a, 0.2, 0.5),
    ground: new THREE.MeshStandardMaterial({ map: textures.ground, roughness: 1 }),
    road: new THREE.MeshStandardMaterial({ map: textures.ground, color: 0xc9a48c, roughness: 1 }),
    // Éléments plaqués
    interior: decal({ color: 0x2c2826, roughness: 0.9 }),
    door: decal({ color: 0x4e5559, roughness: 0.7 }),
    niche: decal({ map: textures.niche, roughness: 0.35, metalness: 0.2 }),
    tallWindow: decal({ map: textures.tallWindow, roughness: 0.3, metalness: 0.2 }),
    slider: decal({ map: textures.slider }),
    squarePair: decal({ map: textures.squarePair }),
    grille: decal({ map: textures.grille }),
    whiteGrille: decal({ map: textures.whiteGrille }),
    shutter: decal({ map: textures.shutter }),
    glassDoor: decal({ map: textures.glassDoor, roughness: 0.3, metalness: 0.2 }),
    claustra: decal({ map: textures.claustra, roughness: 0.9 }),
    mural: decal({ map: textures.mural, roughness: 0.8 }),
    ac: decal({ map: textures.ac }),
    signClasses: decal({ map: textures.signClasses, transparent: true }),
    signLab: decal({ map: textures.signLab, transparent: true }),
    signGate: decal({ map: textures.signGate }),
  };
}

export type Palette = ReturnType<typeof createPalette>;

export function disposePalette(palette: Palette) {
  Object.values(palette.textures).forEach((texture) => texture.dispose());
  Object.values(palette).forEach((value) => {
    if (value instanceof THREE.Material) value.dispose();
  });
}
