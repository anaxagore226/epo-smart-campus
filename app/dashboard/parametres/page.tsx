"use client";

import { useState, type ReactNode } from "react";
import { RelaySwitch } from "@/components/controls/relay-switch";
import { Icon, type IconName } from "@/components/icon";
import { PageHeader } from "@/components/layout/page-header";
import { useCampus } from "@/components/providers/campus-provider";
import { currentUser } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const tabs: { label: string; icon: IconName }[] = [
  { label: "Général", icon: "settings" },
  { label: "Automatisation", icon: "bolt" },
  { label: "Notifications", icon: "bell" },
  { label: "Sécurité", icon: "alert" },
];

const initialToggles = {
  dark: false,
  compact: false,
  autoLights: true,
  autoCooling: true,
  criticalEmail: true,
  weeklyReport: true,
  maintenance: false,
  sms: true,
};
type ToggleKey = keyof typeof initialToggles;

const inputClass =
  "mt-2 w-full rounded-xl border border-line-strong bg-[#fafcfb] px-4 py-3 text-sm font-normal text-ink outline-none focus:border-[#6e9c84]";
const labelClass = "text-xs font-semibold text-[#5f6b64]";

function Panel({ title, description, children, aside }: { title: string; description?: string; children?: ReactNode; aside?: ReactNode }) {
  return (
    <article className="panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold">{title}</h2>
          {description && <p className="mt-1 text-xs text-subtle">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </article>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("Général");
  const [saved, setSaved] = useState(false);
  const [toggles, setToggles] = useState(initialToggles);
  const { state, setAutoOffDelay, notify } = useCampus();
  const [delay, setDelay] = useState(String(state.autoOffDelay));

  const save = () => {
    const minutes = Math.round(Number(delay));
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 120) {
      notify("danger", "Valeur invalide", "Le délai d’inactivité doit être compris entre 1 et 120 minutes.");
      return;
    }
    setAutoOffDelay(minutes);
    setDelay(String(minutes));
    setSaved(true);
    notify("ok", "Paramètres enregistrés", `Extinction automatique après ${minutes} min sans présence.`);
  };
  const cancel = () => {
    setDelay(String(state.autoOffDelay));
    setToggles(initialToggles);
    setSaved(false);
  };

  const toggle = (key: ToggleKey) => {
    setSaved(false);
    setToggles((current) => ({ ...current, [key]: !current[key] }));
  };
  const switchFor = (key: ToggleKey, label: string) => (
    <RelaySwitch on={toggles[key]} onToggle={() => toggle(key)} label={label} />
  );
  const markDirty = () => setSaved(false);
  const activeRules = (["autoLights", "autoCooling", "maintenance"] as const).filter((key) => toggles[key]).length;

  return (
    <div className="mx-auto max-w-[1250px] p-5 sm:p-8">
      <PageHeader
        eyebrow="Configuration"
        title="Paramètres"
        description="Personnalisez votre espace et les règles du campus intelligent."
      >
        {saved && (
          <div className="flex items-center gap-2 self-start rounded-full bg-mint px-3 py-2 text-xs font-semibold text-mint-ink">
            <span className="h-2 w-2 rounded-full bg-online" /> Modifications enregistrées
          </div>
        )}
      </PageHeader>

      <section className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="panel self-start p-3">
          {tabs.map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setTab(label);
                setSaved(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition",
                tab === label ? "bg-[#edf4f0] font-semibold text-forest-800" : "text-muted hover:bg-[#f6f8f7]",
              )}
            >
              <span className={tab === label ? "text-brand" : undefined}>
                <Icon name={icon} size={18} />
              </span>
              {label}
              <span className="ml-auto">
                <Icon name="chevron" size={14} />
              </span>
            </button>
          ))}
          <div className="mx-3 my-3 h-px bg-track" />
          <div className="rounded-xl bg-[#f6f8f7] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b958f]">Version système</p>
            <p className="mt-2 text-xs font-semibold">EPO Smart Campus 1.0</p>
            <p className="mt-1 text-[10px] text-[#9aa39e]">Dernière synchro : maintenant</p>
          </div>
        </aside>

        <div className="space-y-5">
          {tab === "Général" && (
            <>
              <Panel title="Profil administrateur" description="Informations affichées dans votre espace de gestion.">
                <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-forest-800 text-xl font-bold text-white">
                    {currentUser.initials}
                    <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-lg bg-lime text-forest-800 ring-4 ring-white">
                      <Icon name="settings" size={13} />
                    </span>
                  </div>
                  <div className="grid flex-1 gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      Nom complet
                      <input defaultValue={currentUser.fullName} onChange={markDirty} className={inputClass} />
                    </label>
                    <label className={labelClass}>
                      Fonction
                      <input defaultValue={currentUser.role} onChange={markDirty} className={inputClass} />
                    </label>
                    <label className={cn(labelClass, "sm:col-span-2")}>
                      Adresse e-mail
                      <input type="email" defaultValue={currentUser.email} onChange={markDirty} className={inputClass} />
                    </label>
                  </div>
                </div>
              </Panel>

              <Panel title="Préférences du campus" description="Unités, langue et informations générales.">
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Nom du campus
                    <input defaultValue="École Polytechnique de Ouagadougou" onChange={markDirty} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Fuseau horaire
                    <select onChange={markDirty} className={inputClass}>
                      <option>GMT — Ouagadougou</option>
                      <option>GMT+1 — Paris</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Langue
                    <select onChange={markDirty} className={inputClass}>
                      <option>Français</option>
                      <option>English</option>
                    </select>
                  </label>
                  <label className={labelClass}>
                    Devise
                    <select onChange={markDirty} className={inputClass}>
                      <option>Franc CFA (FCFA)</option>
                      <option>Euro (€)</option>
                    </select>
                  </label>
                </div>
              </Panel>

              <Panel title="Affichage">
                <div className="mt-5 divide-y divide-track">
                  {(
                    [
                      ["dark", "Mode sombre", "Réduire la fatigue visuelle dans les environnements peu éclairés."],
                      ["compact", "Affichage compact", "Afficher davantage de données sur chaque écran."],
                    ] as const
                  ).map(([key, title, desc]) => (
                    <div key={key} className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-xs text-subtle">{desc}</p>
                      </div>
                      {switchFor(key, title)}
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          )}

          {tab === "Automatisation" && (
            <>
              <Panel
                title="Règles automatiques"
                description="Le système applique ces règles selon les données des capteurs."
                aside={
                  <span className="shrink-0 rounded-full bg-mint px-2.5 py-1 text-[10px] font-bold text-brand">
                    {activeRules} ACTIVE{activeRules > 1 ? "S" : ""}
                  </span>
                }
              >
                <div className="mt-6 space-y-3">
                  {(
                    [
                      ["autoLights", "Extinction automatique de l’éclairage", `Éteindre après ${state.autoOffDelay} minutes sans présence`, "users"],
                      ["autoCooling", "Régulation intelligente de la climatisation", "Maintenir les zones occupées entre 22°C et 26°C", "thermometer"],
                      ["maintenance", "Maintenance prédictive", "Créer une intervention lorsqu’une dérive est détectée", "settings"],
                    ] as const
                  ).map(([key, title, desc, icon]) => (
                    <div key={key} className="flex items-center gap-4 rounded-2xl border border-[#e6ebe8] p-4">
                      <div
                        className={cn(
                          "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                          toggles[key] ? "bg-mint text-brand" : "bg-[#f0f3f1] text-[#8b958f]",
                        )}
                      >
                        <Icon name={icon} size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-xs text-subtle">{desc}</p>
                      </div>
                      {switchFor(key, title)}
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Seuils de confort" description="Définissez les valeurs qui déclenchent les automatisations.">
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Température maximale", "28", "°C"],
                    ["Inactivité avant arrêt", "", "min"],
                    ["Seuil de puissance", "55", "kW"],
                  ].map(([label, value, unit]) => (
                    <label key={label} className={labelClass}>
                      {label}
                      <div className="mt-2 flex overflow-hidden rounded-xl border border-line-strong bg-[#fafcfb]">
                        {unit === "min" ? (
                          <input
                            type="number"
                            min={1}
                            max={120}
                            value={delay}
                            onChange={(event) => {
                              setDelay(event.target.value);
                              setSaved(false);
                            }}
                            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-bold outline-none"
                          />
                        ) : (
                          <input
                            type="number"
                            defaultValue={value}
                            onChange={markDirty}
                            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm font-bold outline-none"
                          />
                        )}
                        <span className="grid place-items-center border-l border-line-strong px-3 text-xs text-[#7d8881]">{unit}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </Panel>
            </>
          )}

          {tab === "Notifications" && (
            <>
              <Panel title="Préférences de notification" description="Choisissez les événements pour lesquels vous souhaitez être contacté.">
                <div className="mt-6 divide-y divide-track">
                  {(
                    [
                      ["criticalEmail", "Alertes critiques par e-mail", "Température, incendie, intrusion et coupure majeure.", "alert"],
                      ["sms", "Alertes urgentes par SMS", "Notification immédiate sur le numéro de permanence.", "bell"],
                      ["weeklyReport", "Rapport énergétique hebdomadaire", "Résumé envoyé chaque lundi matin.", "chart"],
                      ["maintenance", "Rappels de maintenance", "Interventions planifiées et échéances à venir.", "settings"],
                    ] as const
                  ).map(([key, title, desc, icon]) => (
                    <div key={key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0f4f2] text-[#4f7563]">
                        <Icon name={icon} size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-xs text-subtle">{desc}</p>
                      </div>
                      {switchFor(key, title)}
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Coordonnées de secours">
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    E-mail technique
                    <input type="email" defaultValue="maintenance@epo.bf" onChange={markDirty} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Téléphone d’urgence
                    <input type="tel" defaultValue="+226 70 00 00 00" onChange={markDirty} className={inputClass} />
                  </label>
                </div>
              </Panel>
            </>
          )}

          {tab === "Sécurité" && (
            <>
              <Panel
                title="Mot de passe"
                description="Dernière modification il y a 42 jours."
                aside={
                  <button type="button" className="rounded-xl border border-[#dce5e0] px-4 py-2.5 text-xs font-semibold text-brand">
                    Modifier
                  </button>
                }
              />
              <Panel title="Sessions actives">
                <div className="mt-5 space-y-3">
                  {[
                    ["Chrome · Windows", "Ouagadougou · Session actuelle", "Actif maintenant"],
                    ["Safari · iPhone", "Ouagadougou", "Il y a 2 heures"],
                  ].map(([device, place, time], i) => (
                    <div key={device} className="flex items-center gap-4 rounded-xl bg-[#f6f8f7] p-4">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#507262]">
                        <Icon name="settings" size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{device}</p>
                        <p className="mt-1 text-[10px] text-[#8d9791]">
                          {place} · {time}
                        </p>
                      </div>
                      {i === 0 ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-online" />
                      ) : (
                        <button type="button" className="text-[10px] font-bold text-[#d35f49]">
                          Déconnecter
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
              <article className="rounded-2xl border border-[#f0d8d2] bg-[#fff9f7] p-5 sm:p-6">
                <h2 className="font-bold text-[#b64f3b]">Zone sensible</h2>
                <p className="mt-2 text-xs leading-5 text-[#8d716b]">
                  La réinitialisation efface les préférences, les règles automatiques et l’historique local de cette maquette.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setToggles(initialToggles);
                    setSaved(false);
                  }}
                  className="mt-4 rounded-xl border border-[#e7bdb4] bg-white px-4 py-2.5 text-xs font-bold text-[#c05641]"
                >
                  Réinitialiser les paramètres
                </button>
              </article>
            </>
          )}

          <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border border-line-strong bg-white/95 p-4 shadow-[0_10px_35px_rgba(27,55,44,0.1)] backdrop-blur-xl">
            <button type="button" onClick={cancel} className="rounded-xl px-4 py-3 text-xs font-semibold text-muted">
              Annuler
            </button>
            <button type="button" onClick={save} className="rounded-xl bg-forest-800 px-5 py-3 text-xs font-bold text-white">
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
