"use client";

import { useState } from "react";
import { PerformanceChart, performanceMetrics, type PerformanceMetric } from "@/components/charts/environment-chart";
import { SegmentedControl } from "@/components/controls/segmented-control";

export function PerformanceCard() {
  const [metric, setMetric] = useState<PerformanceMetric>("Énergie");

  return (
    <article className="panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold">Performance mensuelle</h2>
          <p className="mt-1 text-xs text-subtle">Comparaison avec le mois précédent</p>
        </div>
        <SegmentedControl options={performanceMetrics} value={metric} onChange={setMetric} />
      </div>
      <div className="mt-7 h-72">
        <PerformanceChart metric={metric} />
      </div>
    </article>
  );
}
