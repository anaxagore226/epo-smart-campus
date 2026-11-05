"use client";

import { useState, type ReactNode } from "react";
import { AskButton } from "@/components/assistant/ask-button";
import { SegmentedControl } from "@/components/controls/segmented-control";
import { Icon, type IconName } from "@/components/icon";
import { PageHeader } from "@/components/layout/page-header";
import { useAlerts } from "@/hooks/use-alerts";
import { cn } from "@/lib/utils";
import type { AlertLevel } from "@/types/alert";

const filters = ["Toutes", "Critique", "Attention", "Information"] as const;
type Filter = (typeof filters)[number];

const levelStyle: Record<AlertLevel, { tone: string; dot: string }> = {
  Critique: { tone: "bg-[#fff0ec] text-[#d95f42]", dot: "bg-[#e8684b]" },
  Attention: { tone: "bg-[#fff6df] text-[#c98514]", dot: "bg-[#dda12b]" },
  Information: { tone: "bg-[#eaf2ff] text-[#4c78c4]", dot: "bg-[#5485d5]" },
};

// Le design affiche les notifications « positives » (cycle terminé) en vert.
const iconTone: Partial<Record<IconName, string>> = { leaf: "bg-[#e8f5ee] text-brand" };

const action = "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold transition";

/** En-tête, compteurs et flux d'alertes, branchés sur l'état temps réel du campus. */
export function AlertsPanel({ aside }: { /** Colonne affichée à droite du flux. */ aside?: ReactNode }) {
  const [filter, setFilter] = useState<Filter>("Toutes");
  const { alerts, resolvedCount, backupCooling, acknowledgeAlert, resolveAllAlerts, startBackupCooling } = useAlerts();

  const visible = alerts.filter((alert) => filter === "Toutes" || alert.level === filter);
  const count = (level: AlertLevel) => alerts.filter((alert) => alert.level === level).length;

  const stats = [
    { label: "Critiques", value: count("Critique"), note: "Intervention requise", tone: levelStyle.Critique.tone },
    { label: "À surveiller", value: count("Attention"), note: "Action recommandée", tone: levelStyle.Attention.tone },
    { label: "Résolues", value: resolvedCount, note: "Ces 30 derniers jours", tone: "bg-[#e8f5ee] text-brand" },
  ];

  return (
    <>
      <PageHeader eyebrow="Centre de notifications" title="Alertes & incidents" description="Surveillez les anomalies et intervenez rapidement.">
        <button
          type="button"
          onClick={resolveAllAlerts}
          disabled={!alerts.length}
          className="self-start rounded-xl border border-line-strong bg-white px-4 py-3 text-xs font-semibold text-[#53615a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tout marquer comme résolu
        </button>
      </PageHeader>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted">{stat.label}</p>
              <span className={cn("grid h-9 w-9 place-items-center rounded-xl", stat.tone)}>
                <Icon name="alert" size={17} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold">{stat.value}</p>
            <p className="mt-2 text-xs text-faint">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <article className="panel p-5 sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold">Flux d’alertes</h2>
              <p className="mt-1 text-xs text-subtle">
                {visible.length} événement{visible.length !== 1 ? "s" : ""} actif{visible.length !== 1 ? "s" : ""}
              </p>
            </div>
            <SegmentedControl options={filters} value={filter} onChange={setFilter} size="2xs" />
          </div>
          <div className="space-y-3">
            {visible.length ? (
              visible.map((alert) => (
                <div key={alert.id} className="animate-toast-in rounded-2xl border border-[#e7ece9] p-4 transition hover:border-[#c9d9d1]">
                  <div className="flex items-start gap-4">
                    <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", iconTone[alert.icon] ?? levelStyle[alert.level].tone)}>
                      <Icon name={alert.icon} size={19} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold">{alert.title}</h3>
                        <span className={cn("h-2 w-2 rounded-full", alert.icon === "leaf" ? "bg-online" : levelStyle[alert.level].dot)} />
                        <span className="text-[10px] font-semibold text-[#89938d]">{alert.level}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{alert.place}</p>
                      <p className="mt-2 text-xs leading-5 text-faint">{alert.detail}</p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] text-[#9ca49f]">
                          {alert.time} · {alert.id}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {alert.level === "Critique" && alert.icon === "thermometer" && (
                            <button
                              type="button"
                              onClick={startBackupCooling}
                              disabled={backupCooling}
                              className={cn(action, "bg-[#fff0ec] text-[#c05641] disabled:cursor-default disabled:opacity-60")}
                            >
                              <Icon name="snow" size={13} /> {backupCooling ? "Secours en marche" : "Clim. de secours"}
                            </button>
                          )}
                          {alert.level !== "Information" && (
                            <AskButton question={`Analyse l’alerte « ${alert.title} » — ${alert.place}`} className={cn(action, "bg-[#f1f4f2] text-[#53615a]")}>
                              <Icon name="bot" size={13} /> Analyser
                            </AskButton>
                          )}
                          <button type="button" onClick={() => acknowledgeAlert(alert.id)} className={cn(action, "bg-[#edf5f1] text-brand")}>
                            <Icon name="check" size={13} /> Marquer résolue
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="grid min-h-72 place-items-center text-center">
                <div>
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e8f5ee] text-brand">
                    <Icon name="leaf" />
                  </div>
                  <p className="mt-4 font-bold">Tout est sous contrôle</p>
                  <p className="mt-1 text-xs text-subtle">Aucune alerte dans cette catégorie.</p>
                </div>
              </div>
            )}
          </div>
        </article>
        {aside}
      </section>
    </>
  );
}
