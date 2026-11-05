"use client";

// Blocs temps réel de la vue d'ensemble.
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ZoneCard } from "@/components/dashboard/zone-card";
import { Icon } from "@/components/icon";
import { useCampus } from "@/components/providers/campus-provider";
import { useAlerts } from "@/hooks/use-alerts";
import { useZones } from "@/hooks/use-zones";
import { COMFORT_MAX } from "@/lib/campus-state";
import { tariff } from "@/lib/mock-data";
import { cn, downloadCsv, formatNumber, todayStamp } from "@/lib/utils";
import type { Tone } from "@/types/event";

export function OverviewHeadline() {
  const { alerts } = useAlerts();
  const critical = alerts.filter((a) => a.level === "Critique").length;
  const watch = alerts.filter((a) => a.level === "Attention").length;
  const title = critical
    ? `${critical} incident${critical > 1 ? "s demandent" : " demande"} votre attention.`
    : watch
      ? "Le campus fonctionne, avec quelques points à surveiller."
      : "Le campus fonctionne normalement.";
  return <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>;
}

export function OverviewKpis() {
  const { zones, totals } = useZones();
  const { state } = useCampus();
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard elevated label="Consommation du jour" value={formatNumber(totals.usage)} unit="kWh" note={`${formatNumber(totals.power)} kW appelés en ce moment`} icon="bolt" tone="amber" />
      <KpiCard
        elevated
        label="Température moyenne"
        value={formatNumber(totals.temperature)}
        unit="°C"
        note={`${totals.comfortable} / ${zones.length} zones sous ${COMFORT_MAX} °C`}
        icon="thermometer"
        tone="blue"
      />
      <KpiCard elevated label="Occupation globale" value={String(totals.occupancy)} unit="%" note={`${totals.people} personnes sur le campus`} icon="users" tone="violet" />
      <KpiCard
        elevated
        label="Économies ce mois"
        value={formatNumber(state.savedKwh)}
        unit="kWh"
        note={`≈ ${formatNumber(Math.round(state.savedKwh * tariff))} FCFA`}
        icon="leaf"
        tone="green"
      />
    </section>
  );
}

export function OverviewZones() {
  const { zones } = useZones();
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {zones.map((zone) => (
        <ZoneCard key={zone.id} zone={zone} />
      ))}
    </div>
  );
}

const dot: Record<Tone, string> = { ok: "bg-online", info: "bg-[#5485d5]", warn: "bg-[#dda12b]", danger: "bg-[#e8684b]" };

/** Journal des événements (flux MQTT, automatisations, commandes) et carte Green IoT. */
export function OverviewActivity() {
  const { state, notify } = useCampus();
  const { totals, autoOffDelay, cutEmptyZones } = useZones();

  const exportJournal = () => {
    const filename = `journal-campus-${todayStamp()}.csv`;
    downloadCsv(filename, [["Heure", "Niveau", "Événement", "Détail"], ...state.events.map((e) => [e.time, e.tone, e.title, e.detail])]);
    notify("ok", "Journal exporté", `${state.events.length} événements · ${filename}`);
  };

  return (
    <section className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
      <article className="panel p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">Journal des événements</h2>
            <p className="mt-1 text-xs text-subtle">Flux MQTT · automatisations · commandes · alertes</p>
          </div>
          <button type="button" onClick={exportJournal} className="flex items-center gap-1.5 rounded-lg border border-line-strong px-3 py-2 text-xs font-semibold text-[#53615a]">
            <Icon name="download" size={14} /> CSV
          </button>
        </div>
        <ol className="divide-y divide-track">
          {state.events.slice(0, 7).map((event) => (
            <li key={event.id} className="grid grid-cols-[44px_10px_1fr] gap-3 py-2.5 text-xs first:pt-0 last:pb-0">
              <time className="tabular-nums text-faint">{event.time}</time>
              <span className={cn("mt-1 h-2 w-2 rounded-full", dot[event.tone])} />
              <div>
                <p className="font-semibold">{event.title}</p>
                <p className="mt-0.5 text-faint">{event.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </article>

      <article className="panel p-5 shadow-soft sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">Automatisation Green IoT</h2>
            <p className="mt-1 text-xs text-subtle">Extinction des zones inoccupées</p>
          </div>
          <span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-bold text-brand">ACTIVE</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ["Extinctions", String(state.autoOffCount), "ce mois"],
            ["Évitée", formatNumber(state.savedKwh), "kWh"],
            ["Délai", String(autoOffDelay), "min"],
          ].map(([label, value, unit]) => (
            <div key={label} className="rounded-xl bg-[#f5f7f6] p-3">
              <p className="text-[10px] text-[#89938d]">{label}</p>
              <p className="mt-1 text-sm font-bold tabular-nums">
                {value} <span className="text-[10px] font-medium text-faint">{unit}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted">
          {totals.idlePowered.length
            ? `${totals.idlePowered.map((z) => z.name).join(", ")} : aucune présence détectée, mais climatisation ou éclairage encore allumés.`
            : "Aucune zone vide n’est alimentée en ce moment."}
        </p>
        <button
          type="button"
          onClick={cutEmptyZones}
          disabled={!totals.idlePowered.length}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-800 px-4 py-3 text-xs font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="power" size={16} /> Éteindre les zones vides
        </button>
      </article>
    </section>
  );
}
