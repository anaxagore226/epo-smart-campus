import { BuildingTwin } from "./building-twin";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default function BuildingsPage() {
  return (
    <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
      <PageHeader
        eyebrow="Jumeau numérique"
        title="Campus de l’École Polytechnique de Ouagadougou"
        description="Explorez les bâtiments du campus et supervisez leurs équipements en temps réel."
      >
        <StatusBadge label="Données en direct" />
      </PageHeader>
      <BuildingTwin />
    </div>
  );
}
