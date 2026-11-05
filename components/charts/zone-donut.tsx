import type { Zone } from "@/types/zone";

const colors = ["#23845a", "#4776d0", "#d89a2d", "#8b65c9"];

/** Anneau de répartition de la consommation par zone. */
export function ZoneDonut({ zones, total }: { zones: Zone[]; total: number }) {
  const sum = zones.reduce((acc, zone) => acc + zone.usage, 0);
  const stops = zones.map((zone, i) => {
    const start = (zones.slice(0, i).reduce((acc, z) => acc + z.usage, 0) / sum) * 100;
    const end = start + (zone.usage / sum) * 100;
    return `${colors[i % colors.length]} ${start}% ${end}%`;
  });

  return (
    <>
      <div
        className="mx-auto my-6 grid h-40 w-40 place-items-center rounded-full"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
        role="img"
        aria-label="Répartition de la consommation par zone"
      >
        <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
          <div>
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-[10px] text-subtle">kWh</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {zones.map((zone, i) => (
          <div key={zone.id} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="truncate text-[#657169]">{zone.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
