"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { useCampus } from "@/components/providers/campus-provider";
import { useAlerts } from "@/hooks/use-alerts";
import { connectedSensors, esp32Nodes } from "@/lib/mock-data";
import { isActive, mainNavigation, settingsNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** État de la chaîne IoT : broker, nœuds, capteurs et latence des commandes. */
function SystemStatus() {
  const { state } = useCampus();
  const rows = [
    ["Broker MQTT", "connecté"],
    ["Nœuds ESP32", `${esp32Nodes} / ${esp32Nodes}`],
    ["Capteurs", `${connectedSensors} / ${connectedSensors}`],
    ["Latence", `${state.latency} ms`],
  ];
  return (
    <div className="mx-4 mb-3 space-y-2 rounded-2xl border border-white/10 px-4 py-3 text-[11px] text-white/55">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">État du système</p>
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-online shadow-[0_0_0_3px_rgba(46,173,111,0.2)]" />
          {label}
          <b className="ml-auto font-semibold tabular-nums text-white/85">{value}</b>
        </div>
      ))}
    </div>
  );
}

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  const settingsActive = isActive(pathname, settingsNavigation.href);
  const { openCount } = useAlerts();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto bg-forest-950 text-white transition-transform lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-forest-950">
          <Icon name="leaf" size={22} />
        </div>
        <div>
          <p className="text-base font-bold leading-tight">EPO Smart</p>
          <p className="text-xs text-white/55">Campus intelligent</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-6">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
          Espace de gestion
        </p>
        {mainNavigation.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition",
                active ? "bg-white/12 font-semibold text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              <span className={active ? "text-lime" : undefined}>
                <Icon name={item.icon} />
              </span>
              {item.label}
              {item.href === "/dashboard/alertes" && openCount > 0 && (
                <span className="ml-auto rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
                  {openCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <SystemStatus />

      <div className="mx-4 mb-4 rounded-2xl bg-white/6 p-4">
        <div className="mb-3 flex items-center gap-2 text-lime">
          <Icon name="leaf" size={18} />
          <span className="text-xs font-semibold">Objectif écologique</span>
        </div>
        <p className="text-2xl font-bold">−18,4%</p>
        <p className="mt-1 text-xs leading-5 text-white/45">d’énergie consommée ce mois</p>
      </div>

      <Link
        href={settingsNavigation.href}
        onClick={onNavigate}
        aria-current={settingsActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 border-t border-white/10 px-6 py-5 text-sm transition",
          settingsActive ? "bg-white/10 font-semibold text-white" : "text-white/60 hover:text-white",
        )}
      >
        <Icon name="settings" /> {settingsNavigation.label}
      </Link>
    </aside>
  );
}
