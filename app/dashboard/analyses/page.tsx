import { ExportReportButton } from "./export-button";
import { PerformanceCard } from "./performance-card";
import { PageHeader } from "@/components/layout/page-header";
import { zones } from "@/lib/mock-data";

const scores = [
  ["Efficacité énergétique", 86],
  ["Confort thermique", 78],
  ["Utilisation des espaces", 81],
] as const;

const highlights = [
  ["Consommation", "−18,4%", "Baisse continue depuis 3 mois", "text-brand"],
  ["Pic de fréquentation", "10h–12h", "Mardi et jeudi", "text-[#4776d0]"],
  ["Anomalies détectées", "3", "2 résolues automatiquement", "text-[#d0801d]"],
] as const;

// Intensité énergétique sur 30 jours (kWh/m²) et largeur relative de la barre.
const intensity: Record<string, { value: number; width: number }> = {
  administration: { value: 18.2, width: 72 },
  bibliotheque: { value: 13.6, width: 54 },
  laboratoires: { value: 22.1, width: 88 },
  restaurant: { value: 10.8, width: 43 },
};

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
      <PageHeader
        eyebrow="Centre d’analyse"
        title="Analyses & tendances"
        description="Transformez les données du campus en décisions concrètes."
      >
        <ExportReportButton />
      </PageHeader>

      <section className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <PerformanceCard />
        <article className="panel p-5 sm:p-6">
          <h2 className="font-bold">Score du campus</h2>
          <p className="mt-1 text-xs text-subtle">Performance globale en août</p>
          <div className="mx-auto my-7 grid h-44 w-44 place-items-center rounded-full border-[14px] border-[#dff2e8] border-r-brand-chart border-t-brand-chart">
            <div className="text-center">
              <p className="text-4xl font-bold">82</p>
              <p className="text-[10px] font-semibold text-brand">TRÈS BON</p>
            </div>
          </div>
          <div className="space-y-3">
            {scores.map(([label, value]) => (
              <div key={label}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-[#66726b]">{label}</span>
                  <b>{value}%</b>
                </div>
                <div className="h-1.5 rounded-full bg-track">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        {highlights.map(([label, value, note, tone]) => (
          <article key={label} className="panel p-5">
            <p className="text-xs font-medium text-[#7e8983]">{label}</p>
            <p className={`mt-3 text-3xl font-bold ${tone}`}>{value}</p>
            <p className="mt-2 text-xs text-[#919a95]">{note}</p>
          </article>
        ))}
      </section>

      <section className="panel mt-5 p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Comparatif des bâtiments</h2>
            <p className="mt-1 text-xs text-subtle">Performance énergétique sur les 30 derniers jours</p>
          </div>
          <span className="hidden text-xs text-subtle sm:block">kWh / m²</span>
        </div>
        <div className="space-y-4">
          {zones.map((zone) => (
            <div key={zone.id} className="grid items-center gap-3 sm:grid-cols-[150px_1fr_70px]">
              <p className="text-xs font-semibold">{zone.name}</p>
              <div className="h-2.5 overflow-hidden rounded-full bg-track">
                <div
                  className={`h-full rounded-full ${zone.status === "À surveiller" ? "bg-[#d89a2d]" : "bg-brand"}`}
                  style={{ width: `${intensity[zone.id].width}%` }}
                />
              </div>
              <p className="text-right text-xs font-bold">{intensity[zone.id].value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
