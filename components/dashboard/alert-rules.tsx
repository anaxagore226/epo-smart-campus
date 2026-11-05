"use client";

import { useCampus } from "@/components/providers/campus-provider";

/** Règles du moteur d'alertes ; le délai d'extinction suit les paramètres. */
export function AlertRules() {
  const { state } = useCampus();
  const rules: [string, string, string][] = [
    ["Température d’une salle", "> 28 °C", "alerte critique + SMS"],
    ["Hausse de température", "> 3 °C en 5 min", "suspicion de départ de feu"],
    ["Consommation", "> +15 % du profil appris", "maintenance prédictive"],
    ["Zone vide alimentée", `> ${state.autoOffDelay} min`, "extinction automatique"],
    ["Présence détectée", "entre 22 h et 6 h", "alerte intrusion"],
    ["Capteur silencieux", "> 5 min", "capteur hors ligne"],
  ];
  return (
    <article className="panel p-5">
      <h2 className="font-bold">Règles d’alerte</h2>
      <ul className="mt-4 space-y-3">
        {rules.map(([what, threshold, then]) => (
          <li key={what} className="text-xs leading-5">
            <span className="font-semibold">{what}</span> <b className="text-brand">{threshold}</b>
            <span className="block text-faint">→ {then}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
