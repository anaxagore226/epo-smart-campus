"use client";

import { useState } from "react";
import { EnergyAreaChart } from "@/components/charts/energy-chart";
import { SegmentedControl } from "@/components/controls/segmented-control";
import { useCampus } from "@/components/providers/campus-provider";
import { weeklyConsumption } from "@/lib/mock-data";

const periods = ["Aujourd’hui", "Semaine"] as const;
const hours = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}h`);

export function OverviewEnergyCard() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("Aujourd’hui");
  const { state } = useCampus();
  const daily = period === "Aujourd’hui";

  return (
    <article className="panel overflow-hidden p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">Consommation énergétique</h2>
          <p className="mt-1 text-xs text-subtle">
            {daily ? "kWh par heure · aujourd’hui comparé à hier" : "kWh par jour · cette semaine comparée à la précédente"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden gap-3 text-[10px] text-[#78837d] sm:flex">
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-3 rounded bg-brand-chart" />
              {daily ? "Aujourd’hui" : "Cette semaine"}
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-3 rounded bg-[#c5ccc8]" />
              {daily ? "Hier" : "Semaine dernière"}
            </span>
          </div>
          <SegmentedControl options={periods} value={period} onChange={setPeriod} />
        </div>
      </div>
      <div className="mt-7 h-64 w-full">
        {daily ? (
          <EnergyAreaChart current={state.hourly.today} previous={state.hourly.yesterday} labels={hours} unit="kWh" names={["Aujourd’hui", "Hier"]} />
        ) : (
          <EnergyAreaChart
            current={weeklyConsumption.current}
            previous={weeklyConsumption.previous}
            labels={weeklyConsumption.labels}
            unit="kWh"
            names={["Cette semaine", "Semaine dernière"]}
          />
        )}
      </div>
    </article>
  );
}
