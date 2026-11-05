"use client";

import { Icon } from "@/components/icon";
import { useCampus } from "@/components/providers/campus-provider";
import { tariff } from "@/lib/mock-data";
import { downloadCsv, todayStamp } from "@/lib/utils";

/** Exporte l'état énergétique des zones (CSV ouvrable dans Excel). */
export function ExportReportButton() {
  const { state, notify } = useCampus();

  const exportReport = () => {
    const filename = `rapport-energie-campus-${todayStamp()}.csv`;
    downloadCsv(filename, [
      ["Zone", "Consommation du jour (kWh)", "Coût estimé (FCFA)", "Puissance actuelle (kW)", "Température (°C)", "Occupation (%)", "Climatisation", "Éclairage"],
      ...state.zones.map((z) => [
        z.name,
        z.usage.toFixed(1).replace(".", ","),
        Math.round(z.usage * tariff),
        z.power.toFixed(1).replace(".", ","),
        z.temperature.toFixed(1).replace(".", ","),
        z.occupancy,
        z.clim ? "ON" : "OFF",
        z.light ? "ON" : "OFF",
      ]),
    ]);
    notify("ok", "Rapport exporté", `${state.zones.length} zones · ${filename}`);
  };

  return (
    <button
      type="button"
      onClick={exportReport}
      className="flex items-center gap-2 self-start rounded-xl bg-forest-800 px-4 py-3 text-xs font-semibold text-white"
    >
      <Icon name="download" size={17} /> Exporter le rapport
    </button>
  );
}
