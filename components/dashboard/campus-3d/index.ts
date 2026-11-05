import type * as THREE from "three";
import type { BuildingId } from "@/lib/campus-buildings";
import { buildAdministration, buildLaboratory, buildR3, buildRestaurant } from "./buildings";
import { createPalette, disposePalette } from "./materials";
import { buildSite } from "./site";

/** Construit le campus complet dans la scène et renvoie les groupes de chaque bâtiment. */
export function buildCampus(scene: THREE.Scene, anisotropy: number) {
  const palette = createPalette(anisotropy);
  const buildings: Record<BuildingId, THREE.Group> = {
    r3: buildR3(palette),
    restaurant: buildRestaurant(palette),
    laboratoire: buildLaboratory(palette),
    administration: buildAdministration(palette),
  };
  for (const [id, group] of Object.entries(buildings)) {
    group.userData.building = id;
    scene.add(group);
  }
  scene.add(buildSite(palette));
  return { buildings, dispose: () => disposePalette(palette) };
}
