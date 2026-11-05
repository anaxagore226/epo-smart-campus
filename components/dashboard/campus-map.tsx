"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { buildCampus } from "./campus-3d";
import { campusBuildings, campusOverview, entranceView, type BuildingId, type CampusFocus } from "@/lib/campus-buildings";

const LIME = "#b9f227";
const FOREST = "#17372d";

function labelStyle(element: HTMLElement, selected: boolean) {
  element.style.cssText = [
    "position:absolute",
    "pointer-events:auto",
    "cursor:pointer",
    "user-select:none",
    "white-space:nowrap",
    "border-radius:10px",
    "padding:6px 10px",
    "font:600 11px/1.25 var(--font-dm-sans), system-ui, sans-serif",
    "box-shadow:0 6px 18px rgba(12,45,34,0.25)",
    "transition:background 150ms, color 150ms",
    selected ? `background:${LIME};color:${FOREST}` : `background:rgba(23,55,45,0.88);color:#fff`,
  ].join(";");
}

/** Jumeau numérique 3D du campus de l'EPO (scène Three.js orbitable). */
export default function CampusMap({ focus, onSelect }: { focus: CampusFocus; onSelect: (id: BuildingId) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const focusOn = useRef<((id: CampusFocus) => void) | null>(null);
  const select = useRef(onSelect);

  useEffect(() => {
    select.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xc9d6e2);
    scene.fog = new THREE.Fog(0xc9d6e2, 260, 620);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 1500);
    camera.position.set(...campusOverview.view.camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    const labels = new CSS2DRenderer();
    labels.domElement.style.position = "absolute";
    labels.domElement.style.inset = "0";
    labels.domElement.style.pointerEvents = "none";
    container.appendChild(labels.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...campusOverview.view.target);
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 12;
    controls.maxDistance = 320;
    controls.enableDamping = true;

    scene.add(new THREE.HemisphereLight(0xe3ecf5, 0xb0704a, 1.5));
    const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
    sun.position.set(-70, 130, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.04;
    Object.assign(sun.shadow.camera, { left: -120, right: 120, top: 120, bottom: -120, near: 10, far: 420 });
    scene.add(sun);

    const campus = buildCampus(scene, renderer.capabilities.getMaxAnisotropy());

    // Étiquettes cliquables et contour lumineux de chaque bâtiment
    const outlineMaterial = new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.9 });
    const markers = campusBuildings.map((building) => {
      const element = document.createElement("div");
      element.innerHTML = `<div>${building.short}</div><div style="font-weight:500;opacity:.75;font-size:10px">${building.usage.split(" · ")[0]}</div>`;
      labelStyle(element, false);
      element.addEventListener("pointerdown", (event) => event.stopPropagation());
      element.addEventListener("click", () => select.current(building.id));
      const label = new CSS2DObject(element);
      label.position.set(...building.label);
      scene.add(label);

      const { x0, x1, z0, z1 } = building.bounds;
      const outline = new THREE.Group();
      const pad = 1.6;
      const w = x1 - x0 + 2 * pad;
      const d = z1 - z0 + 2 * pad;
      const bar = (sx: number, sz: number, x: number, z: number) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.12, sz), outlineMaterial);
        mesh.position.set(x, 0.08, z);
        outline.add(mesh);
      };
      bar(w, 0.5, (x0 + x1) / 2, z0 - pad);
      bar(w, 0.5, (x0 + x1) / 2, z1 + pad);
      bar(0.5, d, x0 - pad, (z0 + z1) / 2);
      bar(0.5, d, x1 + pad, (z0 + z1) / 2);
      outline.visible = false;
      scene.add(outline);
      return { id: building.id, element, outline };
    });

    // Déplacement fluide de la caméra vers le bâtiment sélectionné
    const goalCamera = camera.position.clone();
    const goalTarget = controls.target.clone();
    let flying = false;
    controls.addEventListener("start", () => {
      flying = false;
    });
    focusOn.current = (id) => {
      const view =
        id === "campus" ? campusOverview.view : id === "entree" ? entranceView : campusBuildings.find((b) => b.id === id)?.view;
      if (!view) return;
      goalCamera.set(...view.camera);
      goalTarget.set(...view.target);
      flying = true;
      for (const marker of markers) {
        labelStyle(marker.element, marker.id === id);
        marker.outline.visible = marker.id === id;
      }
    };

    // Sélection d'un bâtiment par simple clic (pas pendant une rotation)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pickable = Object.values(campus.buildings);
    let down: { x: number; y: number } | null = null;
    const onPointerDown = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickable, true)[0];
      let object: THREE.Object3D | null = hit?.object ?? null;
      while (object && !object.userData.building) object = object.parent;
      if (object) select.current(object.userData.building as BuildingId);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
      labels.setSize(clientWidth, clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const timer = new THREE.Timer();
    let frame = 0;
    const animate = (time?: number) => {
      frame = requestAnimationFrame(animate);
      timer.update(time);
      if (flying) {
        // Approche exponentielle calée sur le temps écoulé : même durée quel que soit le nombre d'images/s.
        const k = 1 - Math.exp(-4 * Math.min(timer.getDelta(), 0.25));
        camera.position.lerp(goalCamera, k);
        controls.target.lerp(goalTarget, k);
        if (camera.position.distanceTo(goalCamera) < 0.2 && controls.target.distanceTo(goalTarget) < 0.2) flying = false;
      }
      outlineMaterial.opacity = 0.55 + 0.4 * Math.sin(timer.getElapsed() * 3) ** 2;
      controls.update();
      renderer.render(scene, camera);
      labels.render(scene, camera);
    };
    animate();

    return () => {
      focusOn.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
      outlineMaterial.dispose();
      timer.dispose();
      campus.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labels.domElement.remove();
    };
  }, []);

  useEffect(() => {
    focusOn.current?.(focus);
  }, [focus]);

  return (
    <div
      ref={host}
      className="relative h-full min-h-[560px] w-full [&>canvas]:block [&>canvas]:h-full [&>canvas]:w-full"
      role="img"
      aria-label="Jumeau numérique 3D du campus de l’École Polytechnique de Ouagadougou"
    />
  );
}
