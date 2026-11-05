"use client";

import { useState } from "react";
import { LoadCurveChart } from "@/components/charts/energy-chart";
import { ZoneDonut } from "@/components/charts/zone-donut";
import { RelaySwitch } from "@/components/controls/relay-switch";
import { SegmentedControl } from "@/components/controls/segmented-control";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/layout/page-header";
import { useCampus } from "@/components/providers/campus-provider";
import { useZones } from "@/hooks/use-zones";
import { relayName } from "@/lib/campus-state";
import { cn, formatCountdown, formatNumber } from "@/lib/utils";

const ranges = ["24 h", "7 jours", "30 jours"] as const;
type Range = (typeof ranges)[number];

const consumption: Record<Range, string> = { "24 h": "125 kWh", "7 jours": "846 kWh", "30 jours": "3 420 kWh" };
const cost: Record<Range, string> = { "24 h": "18 750 FCFA", "7 jours": "126 900 FCFA", "30 jours": "513 000 FCFA" };

export default function EnergyPage() {
  const [range, setRange] = useState<Range>("24 h");
  const { zones, totals, toggleZoneRelay, cutEmptyZones } = useZones();
  const { state } = useCampus();
  const idle = totals.idlePowered;
  const idlePower = idle.reduce((sum, z) => sum + Math.max(0, z.power - 0.3), 0);

  return (
    <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
      <PageHeader
        eyebrow="Supervision énergétique"
        title="Énergie du campus"
        description="Suivez, comparez et pilotez les consommations en temps réel."
      >
        <SegmentedControl options={ranges} value={range} onChange={setRange} variant="solid" />
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Puissance instantanée" value={`${formatNumber(totals.power)} kW`} note={`Mesure en direct · MQTT ${state.latency} ms`} icon="bolt" tone="amber" />
        <KpiCard label="Énergie consommée" value={consumption[range]} note="Objectif respecté" icon="chart" tone="blue" />
        <KpiCard label="Coût estimé" value={cost[range]} note="Tarif moyen 150 F/kWh" icon="building" tone="violet" />
        <KpiCard label="Émissions évitées" value="84 kg CO₂" note="+14% ce mois" icon="leaf" tone="green" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <article className="panel p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Courbe de charge</h2>
              <p className="mt-1 text-xs text-[#8a948e]">Consommation réelle et seuil recommandé</p>
            </div>
            <div className="flex gap-4 text-[10px] text-[#78837d]">
              <span className="flex items-center gap-2">
                <i className="h-2 w-2 rounded-full bg-brand-chart" />
                Réel
              </span>
              <span className="flex items-center gap-2">
                <i className="h-2 w-2 rounded-full bg-[#c5ccc8]" />
                Seuil
              </span>
            </div>
          </div>
          <div className="mt-6 h-72">
            <LoadCurveChart />
          </div>
        </article>
        <article className="panel p-5 sm:p-6">
          <h2 className="font-bold">Répartition par zone</h2>
          <p className="mt-1 text-xs text-subtle">{formatNumber(totals.usage)} kWh consommés aujourd’hui</p>
          <ZoneDonut zones={zones} total={Math.round(totals.usage)} />
        </article>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <article className="panel p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Pilotage des équipements</h2>
              <p className="mt-1 text-xs text-subtle">Commandes à distance · relais ESP32 via MQTT</p>
            </div>
            <button
              type="button"
              onClick={cutEmptyZones}
              disabled={!idle.length}
              className="flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-xs font-semibold text-[#53615a] transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="power" size={14} /> Éteindre les zones vides
            </button>
          </div>
          <div className="space-y-3">
            {zones.map((zone) => {
              const powered = zone.clim || zone.light;
              return (
                <div key={zone.id} className="rounded-xl bg-[#f6f8f7] p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", powered ? "bg-mint text-brand" : "bg-[#e9edeb] text-subtle")}>
                      <Icon name="bolt" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{zone.name}</p>
                      <p className="mt-1 text-[10px] text-faint">
                        {formatNumber(zone.power)} kW · {zone.presence ? "présence détectée" : "aucune présence"}
                      </p>
                    </div>
                    {zone.autoOff !== null && (
                      <span className="hidden items-center gap-1 rounded-lg bg-[#fff6df] px-2 py-1 text-[10px] font-semibold text-[#a96d0c] sm:flex">
                        <Icon name="clock" size={12} />
                        <span className="tabular-nums">{formatCountdown(zone.autoOff)}</span>
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {(["clim", "light"] as const).map((kind) => (
                      <div key={kind} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                        <span className="flex items-center gap-2 text-xs font-medium">
                          <Icon name={kind === "clim" ? "snow" : "bulb"} size={15} />
                          {kind === "clim" ? "Climatisation" : "Éclairage"}
                          <span className="text-[10px] font-normal text-faint">{relayName(kind, zone.code)}</span>
                        </span>
                        <RelaySwitch
                          on={zone[kind]}
                          onToggle={() => toggleZoneRelay(zone.id, kind)}
                          label={`${zone[kind] ? "Éteindre" : "Allumer"} ${kind === "clim" ? "la climatisation" : "l’éclairage"} — ${zone.name}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl bg-forest-900 p-6 text-white">
          <div className="flex items-center gap-2 text-lime">
            <Icon name="leaf" />
            <p className="text-xs font-semibold">Recommandation intelligente</p>
          </div>
          {idle.length ? (
            <>
              <h2 className="mt-6 text-xl font-bold">Économie potentielle : {formatNumber(idlePower)} kW</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                {idle.map((z) => z.name).join(", ")} : aucune présence détectée, mais la climatisation ou l’éclairage fonctionne encore. Les couper
                réduirait la puissance appelée de {Math.round((idlePower / totals.power) * 100)} %.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-6 text-xl font-bold">Aucune zone vide alimentée</h2>
              <p className="mt-3 text-sm leading-6 text-white/55">
                Toutes les zones sans présence sont éteintes. L’extinction automatique reste active ({state.autoOffDelay} min d’inactivité).
              </p>
            </>
          )}
          <button
            type="button"
            onClick={cutEmptyZones}
            disabled={!idle.length}
            className="mt-6 flex w-full items-center justify-between rounded-xl bg-lime px-4 py-3.5 text-sm font-bold text-forest-900 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {idle.length ? "Appliquer la recommandation" : "Recommandation appliquée"} <Icon name={idle.length ? "chevron" : "check"} size={17} />
          </button>
        </article>
      </section>
    </div>
  );
}
