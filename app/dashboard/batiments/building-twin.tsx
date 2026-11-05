"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type RefObject } from "react";
import { RoomsTable } from "@/components/dashboard/rooms-table";
import { Icon } from "@/components/icon";
import { campusBuildings, campusOverview, type CampusFocus } from "@/lib/campus-buildings";
import { cn } from "@/lib/utils";

// Three.js a besoin du DOM et de WebGL : le modèle n'est chargé que dans le navigateur.
const CampusMap = dynamic(() => import("@/components/dashboard/campus-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full min-h-[560px] place-items-center text-sm font-medium text-[#718078]">
      Chargement du modèle 3D…
    </div>
  ),
});

const choices: { id: CampusFocus; label: string }[] = [
  { id: "campus", label: "Campus" },
  { id: "entree", label: "Entrée" },
  ...campusBuildings.map((building) => ({ id: building.id, label: building.short })),
];

/**
 * Plein écran du modèle 3D. Utilise l'API Fullscreen du navigateur ; là où elle n'existe pas
 * (Safari sur iPhone), le modèle occupe toute la fenêtre en CSS et se ferme avec Échap.
 */
function useFullscreen(target: RefObject<HTMLElement | null>) {
  const [native, setNative] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const sync = () => setNative(document.fullscreenElement === target.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [target]);

  useEffect(() => {
    if (!fallback) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFallback(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [fallback]);

  const toggle = () => {
    const element = target.current;
    if (!element) return;
    if (native) void document.exitFullscreen();
    else if (fallback) setFallback(false);
    else if (document.fullscreenEnabled) void element.requestFullscreen().catch(() => setFallback(true));
    else setFallback(true);
  };

  return { active: native || fallback, fallback, toggle };
}

export function BuildingTwin() {
  const [focus, setFocus] = useState<CampusFocus>("campus");
  const viewer = useRef<HTMLElement>(null);
  const fullscreen = useFullscreen(viewer);
  const info = campusBuildings.find((b) => b.id === focus) ?? campusOverview;
  const watch = info.status === "À surveiller";

  return (
    <>
    <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <article
        ref={viewer}
        className={cn(
          "relative overflow-hidden bg-[#c9d6e2]",
          fullscreen.active
            ? "h-full w-full"
            : "min-h-[620px] rounded-2xl border border-[#dce5e0] shadow-[0_12px_40px_rgba(27,55,44,0.09)]",
          fullscreen.fallback && "fixed inset-0 z-50 h-dvh",
        )}
      >
        <CampusMap focus={focus} onSelect={setFocus} />
        <button
          type="button"
          onClick={fullscreen.toggle}
          aria-label={fullscreen.active ? "Quitter le plein écran" : "Afficher le modèle 3D en plein écran"}
          title={fullscreen.active ? "Quitter le plein écran (Échap)" : "Plein écran"}
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-xl bg-forest-800/90 text-white shadow-lg backdrop-blur-md transition hover:bg-forest-800"
        >
          <Icon name={fullscreen.active ? "shrink" : "expand"} size={19} />
        </button>
        <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-forest-800/90 px-4 py-3 text-white backdrop-blur-md">
          <p className="text-xs font-bold">Jumeau numérique 3D</p>
          <p className="mt-1 text-[10px] text-white/55">Glisser pour tourner · Molette pour zoomer · Cliquer sur un bâtiment</p>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-2 rounded-2xl bg-white/90 p-2 shadow-lg backdrop-blur-md sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
          {choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              aria-pressed={focus === choice.id}
              onClick={() => setFocus(choice.id)}
              className={cn(
                "rounded-xl px-3.5 py-2 text-xs font-semibold transition",
                focus === choice.id ? "bg-forest-800 text-white" : "text-[#738079] hover:bg-[#edf2ef]",
              )}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </article>

      <aside className="space-y-4">
        <article className="panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold">{info.name}</h2>
              <p className="mt-1 text-[11px] leading-4 text-subtle">{info.usage}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                watch ? "bg-[#fff6df] text-[#c98514]" : "bg-mint text-brand",
              )}
            >
              {info.status}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {info.metrics.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[#f5f7f6] p-3">
                <p className="text-[10px] text-[#89938d]">{label}</p>
                <p className="mt-1 text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
        </article>

        {info.floors && (
          <article className="panel p-5">
            <h2 className="font-bold">Niveaux</h2>
            <div className="mt-4 space-y-3">
              {info.floors.map((floor) => (
                <div key={floor.level}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span>
                      <b>{floor.level}</b> <span className="text-[#66726b]">· {floor.use}</span>
                    </span>
                    <span className="font-semibold text-[#66726b]">{floor.occupancy}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-track">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${floor.occupancy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
        )}

        <article className="panel p-5">
          <h2 className="font-bold">Équipements</h2>
          <div className="mt-4 space-y-3">
            {info.equipment.map((item) => (
              <div key={item.name} className="flex items-center justify-between border-b border-track pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-semibold">{item.name}</p>
                  <p className="mt-1 text-[10px] text-faint">{item.state}</p>
                </div>
                <span className={cn("h-2.5 w-2.5 rounded-full", item.on ? "bg-online" : "bg-[#4d8ccb]")} />
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl bg-forest-900 p-5 text-white">
          <div className="flex items-center gap-2 text-lime">
            <Icon name="bolt" size={18} />
            <p className="text-xs font-semibold">Performance énergétique</p>
          </div>
          <p className="mt-4 text-2xl font-bold">{info.energyClass}</p>
          <p className="mt-1 text-xs leading-5 text-white/50">{info.energyNote}</p>
        </article>
      </aside>
    </section>
    <RoomsTable building={focus} />
    </>
  );
}
