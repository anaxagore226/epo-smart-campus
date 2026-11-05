"use client";

import { RelaySwitch } from "@/components/controls/relay-switch";
import { Icon } from "@/components/icon";
import { useCampus } from "@/components/providers/campus-provider";
import { campusBuildings, type CampusFocus } from "@/lib/campus-buildings";
import { cn, formatNumber } from "@/lib/utils";
import type { Room } from "@/types/zone";

function comfort(temperature: number) {
  if (temperature <= 26) return { label: "Confortable", tone: "bg-mint text-brand" };
  if (temperature <= 28) return { label: "Tiède", tone: "bg-[#fff6df] text-[#c98514]" };
  return { label: "Trop chaud", tone: "bg-[#fff0ec] text-[#d95f42]" };
}

const statusTone: Record<Room["status"], string> = {
  Normal: "bg-mint text-brand",
  Anomalie: "bg-[#fff6df] text-[#c98514]",
  "Hors ligne": "bg-[#fff0ec] text-[#d95f42]",
};

/** Salles instrumentées : un nœud ESP32 par salle (PIR + DHT22 + 2 relais). */
export function RoomsTable({ building }: { building: CampusFocus }) {
  const { state, toggleRoomRelay } = useCampus();
  const selected = campusBuildings.find((b) => b.id === building);
  const rooms = selected ? state.rooms.filter((room) => room.building === selected.id) : state.rooms;
  const buildingName = (id: Room["building"]) => campusBuildings.find((b) => b.id === id)?.short ?? id;

  return (
    <section className="panel mt-5 overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3 p-5 sm:px-6">
        <div>
          <h2 className="font-bold">Salles instrumentées · {selected ? selected.short : "tout le campus"}</h2>
          <p className="mt-1 text-xs text-subtle">
            Un nœud ESP32 par salle : capteur de présence PIR, sonde DHT22 et deux relais pilotables à distance.
          </p>
        </div>
        <span className="text-xs font-semibold text-muted">
          {rooms.length} salle{rooms.length > 1 ? "s" : ""} · {formatNumber(rooms.reduce((sum, r) => sum + r.power, 0))} kW
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-xs">
          <thead className="border-y border-line bg-[#f6f8f7] text-[10px] uppercase tracking-wider text-[#89938d]">
            <tr>
              {["Salle", "Température", "Occupation", "Présence (PIR)", "Climatisation", "Éclairage", "Puissance", "Statut"].map((h) => (
                <th key={h} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold first:pl-6">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-track">
            {rooms.map((room) => {
              const c = comfort(room.temperature);
              return (
                <tr key={room.id} className="transition hover:bg-[#fafcfb]">
                  <td className="px-4 py-3 pl-6">
                    <p className="flex items-center gap-1.5 font-semibold">
                      {room.name}
                      {room.protected && (
                        <span title="Équipement critique : climatisation protégée" className="text-[#c05641]">
                          <Icon name="alert" size={13} />
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[10px] text-faint">
                      {buildingName(room.building)} · {room.sensor}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <b className="tabular-nums">{formatNumber(room.temperature)} °C</b>
                    <span className={cn("ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold", c.tone)}>{c.label}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
                    {room.occupants} / {room.capacity}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {room.presence ? (
                      <span className="rounded-full bg-mint px-2 py-0.5 text-[10px] font-semibold text-mint-ink">Présence</span>
                    ) : (
                      <span className="rounded-full bg-[#f1f4f2] px-2 py-0.5 text-[10px] font-semibold text-[#7c8781]">
                        Vide{room.idle ? ` · ${room.idle}` : ""}
                      </span>
                    )}
                  </td>
                  {(["clim", "light"] as const).map((kind) => (
                    <td key={kind} className="px-4 py-3">
                      <RelaySwitch
                        on={room[kind]}
                        onToggle={() => toggleRoomRelay(room.id, kind)}
                        label={`${room[kind] ? "Éteindre" : "Allumer"} ${kind === "clim" ? "la climatisation" : "l’éclairage"} — ${room.name}`}
                      />
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                    <b>{formatNumber(room.power)}</b> kW
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", statusTone[room.status])}>{room.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
