import Link from "next/link";
import { OverviewEnergyCard } from "./overview-energy-card";
import { OverviewActivity, OverviewHeadline, OverviewKpis, OverviewZones } from "./overview-live";
import { AskButton } from "@/components/assistant/ask-button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Icon } from "@/components/icon";
import { connectedSensors, currentUser } from "@/lib/mock-data";

const sampleQuestion = "Quelle zone consomme le plus aujourd’hui ?";

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
      <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-eyebrow">Bonjour, {currentUser.firstName}</p>
          <OverviewHeadline />
          <p className="mt-2 text-sm text-muted">Voici les données importantes collectées en temps réel.</p>
        </div>
        <StatusBadge label={`${connectedSensors} capteurs connectés`} />
      </section>

      <OverviewKpis />

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <OverviewEnergyCard />

        <article className="rounded-2xl bg-forest-900 p-6 text-white shadow-[0_8px_30px_rgba(27,55,44,0.08)]">
          <div className="flex items-start justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-lime text-forest-900">
              <Icon name="bot" />
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-lime">ASSISTANT IA</span>
          </div>
          <h2 className="mt-7 text-xl font-bold">Besoin d’une analyse ?</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">
            Interrogez vos données en langage naturel ou donnez une consigne, comme « éteins le restaurant ».
          </p>
          <div className="mt-6 rounded-xl bg-white/8 p-4 text-sm text-white/75">« {sampleQuestion} »</div>
          <AskButton
            question={sampleQuestion}
            className="mt-4 flex w-full items-center justify-between rounded-xl bg-lime px-4 py-3.5 text-sm font-bold text-forest-900"
          >
            Poser cette question <Icon name="chevron" size={17} />
          </AskButton>
        </article>
      </section>

      <section className="panel mt-5 p-5 shadow-soft sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold">État des bâtiments</h2>
            <p className="mt-1 text-xs text-subtle">Supervision des zones principales · capteurs PIR, DHT22 et ACS712</p>
          </div>
          <Link href="/dashboard/batiments" className="text-sm font-semibold text-brand">
            Tout afficher
          </Link>
        </div>
        <OverviewZones />
      </section>

      <OverviewActivity />
    </div>
  );
}
