import Link from "next/link";
import { Icon } from "@/components/icon";
import { cn, formatCountdown, formatNumber } from "@/lib/utils";
import type { Zone } from "@/types/zone";

export function ZoneCard({ zone }: { zone: Zone }) {
  return (
    <Link
      href="/dashboard/batiments"
      className="group block rounded-2xl border border-[#e8ece9] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#bdd5c9] hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className={`h-2.5 w-2.5 rounded-full ${zone.color}`} />
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
            zone.presence ? "bg-mint text-mint-ink" : "bg-[#f1f4f2] text-[#7c8781]",
          )}
        >
          {zone.presence ? "Présence" : "Aucune présence"}
        </span>
      </div>
      <h3 className="mt-4 font-bold">{zone.name}</h3>
      <div className="mt-4 flex gap-4 text-xs text-[#78837d]">
        <span className="tabular-nums">{formatNumber(zone.power)} kW</span>
        <span className="tabular-nums">{formatNumber(zone.temperature)}°C</span>
        <span className="tabular-nums">{formatNumber(zone.usage)} kWh</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-track">
        <div className={`h-full rounded-full ${zone.color}`} style={{ width: `${zone.occupancy}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-[#909993]">
        <span>Occupation</span>
        <span>{zone.occupancy}%</span>
      </div>
      {zone.autoOff !== null && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#fff6df] px-2.5 py-2 text-[11px] font-medium text-[#a96d0c]">
          <Icon name="clock" size={13} />
          Extinction auto dans <b className="tabular-nums">{formatCountdown(zone.autoOff)}</b>
        </p>
      )}
      {!zone.clim && !zone.light && <p className="mt-3 rounded-lg bg-[#f1f4f2] px-2.5 py-2 text-[11px] font-medium text-[#7c8781]">Climatisation et éclairage éteints</p>}
    </Link>
  );
}
