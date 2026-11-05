import { AskButton } from "@/components/assistant/ask-button";
import { AlertRules } from "@/components/dashboard/alert-rules";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { Icon } from "@/components/icon";

const channels = [
  { name: "Tableau de bord", status: "Actif", on: true },
  { name: "E-mail équipe technique", status: "Actif", on: true },
  { name: "SMS urgences", status: "Critiques seulement", on: true },
];

export default function AlertsPage() {
  return (
    <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
      <AlertsPanel
        aside={
          <aside className="space-y-5">
            <article className="rounded-2xl bg-forest-900 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-lime text-forest-900">
                  <Icon name="bot" />
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-lime">ANALYSE IA</span>
              </div>
              <h2 className="mt-6 text-lg font-bold">Priorité au laboratoire</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                L’élévation de température peut affecter les équipements. Vérifiez la climatisation du R+2 en priorité.
              </p>
              <AskButton
                question="Analyse l’alerte « Température anormale » — Laboratoire informatique · R+2"
                className="mt-5 flex w-full items-center justify-between rounded-xl bg-lime px-4 py-3 text-xs font-bold text-forest-900"
              >
                Voir le diagnostic <Icon name="chevron" size={16} />
              </AskButton>
            </article>

            <article className="panel p-5">
              <h2 className="font-bold">Canaux de notification</h2>
              <div className="mt-4 space-y-4">
                {channels.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">{channel.name}</p>
                      <p className="mt-1 text-[10px] text-faint">{channel.status}</p>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${channel.on ? "bg-online" : "bg-[#cbd2ce]"}`} />
                  </div>
                ))}
              </div>
            </article>

            <AlertRules />

            <article className="panel p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Temps de réponse</h2>
                <span className="text-xs font-bold text-brand">−22%</span>
              </div>
              <p className="mt-4 text-3xl font-bold">12 min</p>
              <p className="mt-1 text-xs text-faint">moyenne sur 30 jours</p>
            </article>
          </aside>
        }
      />
    </div>
  );
}
