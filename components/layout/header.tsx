"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/icon";
import { useAlerts } from "@/hooks/use-alerts";
import { currentUser } from "@/lib/mock-data";
import { pageTitle } from "@/lib/navigation";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeFormatter = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

// Horloge partagée : l'instant n'avance qu'une fois par seconde, ce qui garantit à React un
// instantané stable entre deux tics (sinon getSnapshot renvoie une valeur différente à chaque appel).
let now = 0;
let ticker: number | undefined;
const listeners = new Set<() => void>();

function subscribeClock(listener: () => void) {
  listeners.add(listener);
  if (ticker === undefined) {
    now = Date.now();
    ticker = window.setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.clearInterval(ticker);
      ticker = undefined;
    }
  };
}

// L'heure n'est connue que dans le navigateur (0 côté serveur) pour éviter tout écart d'hydratation.
function useNow(format: Intl.DateTimeFormat) {
  const instant = useSyncExternalStore(
    subscribeClock,
    () => now,
    () => 0,
  );
  return instant ? format.format(instant) : "";
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const date = useNow(dateFormatter);
  const time = useNow(timeFormatter);
  const { openCount } = useAlerts();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-line-strong bg-white/90 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Ouvrir le menu"
          className="rounded-xl border border-line-strong p-2.5 lg:hidden"
        >
          <Icon name="menu" />
        </button>
        <div>
          <p className="text-lg font-bold sm:text-xl">{pageTitle(pathname)}</p>
          <p className="hidden min-h-4 text-xs text-muted sm:block">{date && date.charAt(0).toUpperCase() + date.slice(1)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-line-strong bg-white px-3 py-2 text-xs text-muted md:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-online opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-online" />
          </span>
          En direct
          <span className="min-w-[4.2rem] font-semibold tabular-nums text-ink">{time}</span>
        </div>
        <button
          type="button"
          className="hidden items-center gap-2 rounded-xl border border-line-strong bg-white px-4 py-2.5 text-sm text-[#657169] xl:flex"
        >
          <Icon name="search" size={17} /> Rechercher
        </button>
        <Link
          href="/dashboard/alertes"
          aria-label={openCount ? `${openCount} alerte${openCount > 1 ? "s" : ""} en cours` : "Aucune alerte en cours"}
          className="relative rounded-xl border border-line-strong bg-white p-2.5"
        >
          <Icon name="bell" size={19} />
          {openCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {openCount}
            </span>
          )}
        </Link>
        <div className="ml-1 grid h-10 w-10 place-items-center rounded-xl bg-forest-950 text-xs font-bold text-white">
          {currentUser.initials}
        </div>
      </div>
    </header>
  );
}
