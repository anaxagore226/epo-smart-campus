import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export type Vec3 = [number, number, number];

/** Repère du monde : x vers l'est, z vers le sud, y vers le haut. */
export const WORLD = new THREE.Matrix4();

const position = new THREE.Vector3();
const quaternion = new THREE.Quaternion();
const euler = new THREE.Euler();
const one = new THREE.Vector3(1, 1, 1);

function local(frame: THREE.Matrix4, at: Vec3, rotation: Vec3, scale: THREE.Vector3 = one) {
  return frame
    .clone()
    .multiply(new THREE.Matrix4().compose(position.set(...at), quaternion.setFromEuler(euler.set(...rotation)), scale));
}

/** Repère placé en (x, z), tourné de `angle` autour de l'axe vertical. */
export function frameAt(x: number, z: number, angle = 0) {
  return new THREE.Matrix4().makeRotationY(angle).setPosition(x, 0, z);
}

/**
 * Repère d'une façade : x local suit la façade (de gauche à droite pour un observateur
 * qui la regarde), z local sort du bâtiment selon la normale (nx, nz).
 */
export function faceFrame(xa: number, za: number, xb: number, zb: number, nx: number, nz: number) {
  const dx = nz;
  const dz = -nx;
  const along = (xb - xa) * dx + (zb - za) * dz;
  const [ox, oz] = along >= 0 ? [xa, za] : [xb, zb];
  return { frame: frameAt(ox, oz, Math.atan2(nx, nz)), length: Math.abs(along) };
}

/**
 * Accumule des primitives puis les fusionne par matériau : une scène de plusieurs
 * milliers d'éléments ne coûte ainsi que quelques appels de rendu.
 */
export class Batch {
  private parts = new Map<THREE.Material, THREE.BufferGeometry[]>();

  private push(geometry: THREE.BufferGeometry, material: THREE.Material, matrix: THREE.Matrix4) {
    geometry.applyMatrix4(matrix);
    const list = this.parts.get(material);
    if (list) list.push(geometry);
    else this.parts.set(material, [geometry]);
  }

  /** Boîte de dimensions `size` centrée en `at`. */
  box(frame: THREE.Matrix4, material: THREE.Material, size: Vec3, at: Vec3, rotation: Vec3 = [0, 0, 0]) {
    this.push(new THREE.BoxGeometry(...size), material, local(frame, at, rotation));
  }

  /** Plan tourné vers +z local ; `repeat` répète la texture sur sa largeur et sa hauteur. */
  plane(
    frame: THREE.Matrix4,
    material: THREE.Material,
    width: number,
    height: number,
    at: Vec3,
    repeat: [number, number] = [1, 1],
    rotation: Vec3 = [0, 0, 0],
  ) {
    const geometry = new THREE.PlaneGeometry(width, height);
    if (repeat[0] !== 1 || repeat[1] !== 1) {
      const uv = geometry.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * repeat[0], uv.getY(i) * repeat[1]);
    }
    this.push(geometry, material, local(frame, at, rotation));
  }

  /** Plan horizontal (sol, toiture) centré en `at`. */
  floor(frame: THREE.Matrix4, material: THREE.Material, width: number, depth: number, at: Vec3, repeat: [number, number] = [1, 1]) {
    this.plane(frame, material, width, depth, at, repeat, [-Math.PI / 2, 0, 0]);
  }

  cylinder(
    frame: THREE.Matrix4,
    material: THREE.Material,
    radiusTop: number,
    radiusBottom: number,
    height: number,
    at: Vec3,
    rotation: Vec3 = [0, 0, 0],
    segments = 12,
  ) {
    this.push(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material, local(frame, at, rotation));
  }

  sphere(frame: THREE.Matrix4, material: THREE.Material, radius: number, at: Vec3, scale: Vec3 = [1, 1, 1]) {
    this.push(new THREE.SphereGeometry(radius, 10, 8), material, local(frame, at, [0, 0, 0], new THREE.Vector3(...scale)));
  }

  build(name: string, castShadow = true) {
    const group = new THREE.Group();
    group.name = name;
    for (const [material, list] of this.parts) {
      const merged = mergeGeometries(list, false);
      list.forEach((geometry) => geometry.dispose());
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, material);
      mesh.castShadow = castShadow && !material.transparent;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
    this.parts.clear();
    return group;
  }
}
