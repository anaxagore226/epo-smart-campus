// État temps réel du campus partagé par tout le tableau de bord.
// En attendant le backend, il est alimenté par une simulation (hooks/use-realtime.ts).
import {
  alerts,
  assistantGreeting,
  campusEvents,
  currentUser,
  hourlyConsumption,
  resolvedAlertsLast30Days,
  rooms,
  zones,
} from "./mock-data";
import { formatNumber } from "./utils";
import type { Alert } from "@/types/alert";
import type { CampusEvent, ChatMessage, Toast, Tone } from "@/types/event";
import type { RelayKind } from "@/types/relay";
import type { Room, Zone, ZoneId } from "@/types/zone";

export type CampusState = {
  zones: Zone[];
  rooms: Room[];
  alerts: Alert[];
  resolvedCount: number;
  events: CampusEvent[];
  toasts: Toast[];
  chat: ChatMessage[];
  /** L'assistant rédige une réponse. */
  typing: boolean;
  /** Latence aller-retour d'une commande MQTT, en ms. */
  latency: number;
  /** Délai d'inactivité avant extinction automatique, en minutes. */
  autoOffDelay: number;
  autoOffCount: number;
  /** Énergie évitée depuis le début du mois, en kWh. */
  savedKwh: number;
  backupCooling: boolean;
  hourly: { today: number[]; yesterday: number[] };
};

/** Identifiant, heure et latence fournis par l'appelant : le réducteur reste pur. */
export type Meta = { id: number; at: string; latency: number };

export type CampusAction =
  | { type: "tick"; noise: [number, number][]; latency: number }
  | { type: "second"; meta: Meta }
  | { type: "toggleZoneRelay"; zoneId: ZoneId; kind: RelayKind; meta: Meta }
  | { type: "setZonePower"; zoneId: ZoneId; on: boolean; meta: Meta }
  | { type: "cutEmptyZones"; meta: Meta }
  | { type: "toggleRoomRelay"; roomId: string; kind: RelayKind; meta: Meta }
  | { type: "acknowledgeAlert"; alertId: string; meta: Meta }
  | { type: "resolveAllAlerts"; meta: Meta }
  | { type: "startBackupCooling"; meta: Meta }
  | { type: "setAutoOffDelay"; minutes: number; meta: Meta }
  | { type: "notify"; tone: Tone; title: string; detail: string; meta: Meta }
  | { type: "dismissToast"; id: string }
  | { type: "chatQuestion"; text: string; meta: Meta }
  | { type: "chatReply"; text: string; source?: string; meta: Meta }
  | { type: "chatReset"; meta: Meta };

export const initialCampusState: CampusState = {
  zones,
  rooms,
  alerts,
  resolvedCount: resolvedAlertsLast30Days,
  events: campusEvents,
  toasts: [],
  chat: [assistantGreeting],
  typing: false,
  latency: 142,
  autoOffDelay: 15,
  autoOffCount: 7,
  savedKwh: 284,
  backupCooling: false,
  hourly: hourlyConsumption,
};

/** Seuil de confort des salles d'enseignement, en °C. */
export const COMFORT_MAX = 26;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
export const relayName = (kind: RelayKind, code: string) => `${kind === "clim" ? "CLIM" : "ECL"}-${code}-01`;
export const relayLabel = (kind: RelayKind) => (kind === "clim" ? "climatisation" : "éclairage");

/** Puissance d'équilibre d'une zone selon l'état de ses relais. */
const targetPower = (z: { clim: boolean; light: boolean; basePower: number }) =>
  0.3 + (z.clim ? z.basePower * 0.75 : 0) + (z.light ? z.basePower * 0.25 : 0);

const roomPower = (r: Room) => (r.clim || r.light ? targetPower(r) - 0.2 : 0.1);

/** Une zone vide encore alimentée lance (ou garde) son compte à rebours d'extinction. */
function withAutoOff(zone: Zone, delayMinutes: number): Zone {
  if (zone.presence || !(zone.clim || zone.light)) return { ...zone, autoOff: null };
  return { ...zone, autoOff: zone.autoOff ?? delayMinutes * 60 };
}

function logEvent(state: CampusState, meta: Meta, tone: Tone, title: string, detail: string, suffix = ""): CampusState {
  return { ...state, events: [{ id: `e${meta.id}${suffix}`, time: meta.at, tone, title, detail }, ...state.events].slice(0, 40) };
}

function notify(state: CampusState, meta: Meta, tone: Tone, title: string, detail: string, suffix = ""): CampusState {
  return { ...state, toasts: [...state.toasts, { id: `t${meta.id}${suffix}`, tone, title, detail }].slice(-4) };
}

export function campusTotals(list: Zone[]) {
  const power = list.reduce((sum, z) => sum + z.power, 0);
  const usage = list.reduce((sum, z) => sum + z.usage, 0);
  const temperature = list.reduce((sum, z) => sum + z.temperature, 0) / list.length;
  const people = Math.round(list.reduce((sum, z) => sum + (z.occupancy / 100) * z.capacity, 0));
  const capacity = list.reduce((sum, z) => sum + z.capacity, 0);
  return {
    power,
    usage,
    temperature,
    people,
    occupancy: Math.round((people / capacity) * 100),
    comfortable: list.filter((z) => z.temperature <= COMFORT_MAX).length,
    /** Zones vides dont la climatisation ou l'éclairage fonctionne encore. */
    idlePowered: list.filter((z) => !z.presence && (z.clim || z.light)),
  };
}

export function campusReducer(state: CampusState, action: CampusAction): CampusState {
  switch (action.type) {
    case "tick": {
      const next = state.zones.map((z, i) => {
        const [powerNoise, tempNoise] = action.noise[i] ?? [0, 0];
        const power = clamp(z.power + (targetPower(z) - z.power) * 0.35 + powerNoise * 0.9, 0.2, z.basePower * 1.3);
        const equilibrium = z.clim ? z.setpoint : z.setpoint + 3;
        const temperature = clamp(z.temperature + (equilibrium - z.temperature) * 0.03 + tempNoise * 0.15, 18, 38);
        return { ...z, power, temperature, usage: z.usage + (power * 3) / 3600 };
      });
      const today = [...state.hourly.today];
      today[today.length - 1] = Math.round(next.reduce((sum, z) => sum + z.power, 0));
      return { ...state, zones: next, latency: action.latency, hourly: { ...state.hourly, today } };
    }

    case "second": {
      if (!state.zones.some((z) => z.autoOff !== null)) return state;
      const { meta } = action;
      let next: CampusState = {
        ...state,
        zones: state.zones.map((z) =>
          z.autoOff === null ? z : z.autoOff > 1 ? { ...z, autoOff: z.autoOff - 1 } : { ...z, clim: false, light: false, autoOff: null },
        ),
      };
      for (const z of state.zones) {
        if (z.autoOff !== 1) continue;
        const detail = `Aucune présence pendant ${state.autoOffDelay} min · relais ${relayName("clim", z.code)} et ${relayName("light", z.code)} → OFF`;
        next = logEvent(next, meta, "ok", `Extinction automatique — ${z.name}`, detail, z.id);
        next = notify(next, meta, "ok", `Extinction automatique — ${z.name}`, "Climatisation et éclairage coupés : aucune présence détectée.", z.id);
        next = {
          ...next,
          autoOffCount: next.autoOffCount + 1,
          savedKwh: next.savedKwh + Math.round(z.power * 10) / 10,
          alerts: [
            {
              id: `AUTO-${meta.id}-${z.code}`,
              level: "Information",
              title: `Extinction automatique — ${z.name}`,
              place: z.name,
              time: "À l’instant",
              detail: "Aucune présence détectée pendant le délai d’inactivité. Climatisation et éclairage coupés automatiquement.",
              icon: "leaf",
            },
            ...next.alerts,
          ],
        };
      }
      return next;
    }

    case "toggleZoneRelay": {
      const { meta, kind } = action;
      const zone = state.zones.find((z) => z.id === action.zoneId);
      if (!zone) return state;
      const on = !zone[kind];
      const relay = relayName(kind, zone.code);
      let next: CampusState = {
        ...state,
        zones: state.zones.map((z) => (z.id === zone.id ? withAutoOff({ ...z, [kind]: on }, state.autoOffDelay) : z)),
      };
      next = logEvent(next, meta, on ? "ok" : "info", `Commande manuelle : ${relayLabel(kind)} ${on ? "ON" : "OFF"} — ${zone.name}`, `Relais ${relay} · ack ${meta.latency} ms`);
      return notify(next, meta, on ? "ok" : "info", `${on ? "Allumage" : "Extinction"} ${relayLabel(kind)} — ${zone.name}`, `Commande MQTT → relais ${relay} · ack en ${meta.latency} ms`);
    }

    case "setZonePower": {
      const { meta, on } = action;
      const zone = state.zones.find((z) => z.id === action.zoneId);
      if (!zone) return state;
      const relays = Number(zone.clim !== on) + Number(zone.light !== on);
      if (!relays) return state;
      let next: CampusState = {
        ...state,
        zones: state.zones.map((z) => (z.id === zone.id ? withAutoOff({ ...z, clim: on, light: on }, state.autoOffDelay) : z)),
      };
      next = logEvent(next, meta, "ok", `Commande IA : ${on ? "allumage" : "extinction"} ${zone.name} (${relays} relais)`, "Requête en langage naturel → MQTT");
      return notify(next, meta, "ok", `Assistant IA — ${zone.name}`, `${relays} relais ${on ? "allumé(s)" : "coupé(s)"} · ack en ${meta.latency} ms`);
    }

    case "cutEmptyZones": {
      const { meta } = action;
      const targets = state.zones.filter((z) => !z.presence && (z.clim || z.light));
      if (!targets.length) return notify(state, meta, "info", "Aucune action nécessaire", "Toutes les zones vides sont déjà éteintes.");
      const relays = targets.reduce((n, z) => n + Number(z.clim) + Number(z.light), 0);
      const kw = targets.reduce((sum, z) => sum + Math.max(0, z.power - 0.3), 0);
      const ids = new Set(targets.map((z) => z.id));
      let next: CampusState = {
        ...state,
        zones: state.zones.map((z) => (ids.has(z.id) ? { ...z, clim: false, light: false, autoOff: null } : z)),
        savedKwh: state.savedKwh + Math.round(kw * 5) / 10,
      };
      next = logEvent(next, meta, "ok", `Extinction groupée des zones vides (${relays} relais)`, `${targets.map((z) => z.name).join(", ")} · −${formatNumber(kw)} kW`);
      return notify(next, meta, "ok", `${relays} équipement${relays > 1 ? "s" : ""} coupé${relays > 1 ? "s" : ""}`, `Zones sans présence · −${formatNumber(kw)} kW estimés`);
    }

    case "toggleRoomRelay": {
      const { meta, kind } = action;
      const room = state.rooms.find((r) => r.id === action.roomId);
      if (!room) return state;
      if (room.protected && kind === "clim" && room.clim) {
        return notify(state, meta, "danger", "Commande refusée", `Par sécurité, la climatisation de la ${room.name.toLowerCase()} ne peut pas être coupée à distance.`);
      }
      const on = !room[kind];
      const updated = { ...room, [kind]: on };
      updated.power = roomPower(updated);
      let next: CampusState = { ...state, rooms: state.rooms.map((r) => (r.id === room.id ? updated : r)) };
      next = logEvent(next, meta, on ? "ok" : "info", `Commande manuelle : ${relayLabel(kind)} ${on ? "ON" : "OFF"} — ${room.name}`, `${room.sensor} · ack ${meta.latency} ms`);
      return notify(next, meta, on ? "ok" : "info", `${on ? "Allumage" : "Extinction"} ${relayLabel(kind)} — ${room.name}`, `${room.sensor} · ack en ${meta.latency} ms`);
    }

    case "acknowledgeAlert": {
      const { meta } = action;
      const alert = state.alerts.find((a) => a.id === action.alertId);
      if (!alert) return state;
      let next: CampusState = {
        ...state,
        alerts: state.alerts.filter((a) => a.id !== alert.id),
        resolvedCount: state.resolvedCount + 1,
      };
      next = logEvent(next, meta, "info", `Alerte résolue : ${alert.title}`, `${alert.place} · par ${currentUser.fullName}`);
      return notify(next, meta, "ok", "Alerte résolue", `${alert.title} — ${alert.place}`);
    }

    case "resolveAllAlerts": {
      const { meta } = action;
      const count = state.alerts.length;
      if (!count) return notify(state, meta, "info", "Aucune alerte en cours", "Le flux d’alertes est déjà vide.");
      let next: CampusState = { ...state, alerts: [], resolvedCount: state.resolvedCount + count };
      next = logEvent(next, meta, "info", `${count} alerte${count > 1 ? "s" : ""} marquée${count > 1 ? "s" : ""} comme résolue${count > 1 ? "s" : ""}`, `Par ${currentUser.fullName}`);
      return notify(next, meta, "ok", "Alertes résolues", `${count} alerte${count > 1 ? "s" : ""} retirée${count > 1 ? "s" : ""} du flux.`);
    }

    case "startBackupCooling": {
      const { meta } = action;
      if (state.backupCooling) return notify(state, meta, "info", "Climatiseur de secours déjà en marche", "CLIM-R3-205B fonctionne depuis votre dernière commande.");
      let next: CampusState = {
        ...state,
        backupCooling: true,
        rooms: state.rooms.map((r) => (r.id === "r3-labinfo" ? { ...r, temperature: 29.6 } : r)),
      };
      next = logEvent(next, meta, "ok", "Démarrage manuel CLIM-R3-205B (secours)", "Laboratoire informatique · R+2");
      return notify(next, meta, "ok", "Climatiseur de secours démarré", `CLIM-R3-205B → ON · ack en ${meta.latency} ms`);
    }

    case "setAutoOffDelay": {
      const { meta, minutes } = action;
      if (minutes === state.autoOffDelay) return state;
      const next = logEvent({ ...state, autoOffDelay: minutes }, meta, "info", "Paramètre modifié : délai d’extinction automatique", `${state.autoOffDelay} min → ${minutes} min`);
      return next;
    }

    case "notify":
      return notify(state, action.meta, action.tone, action.title, action.detail);

    case "dismissToast":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    case "chatQuestion":
      return { ...state, typing: true, chat: [...state.chat, { id: `m${action.meta.id}`, role: "user", text: action.text }] };

    case "chatReply":
      return {
        ...state,
        typing: false,
        chat: [...state.chat, { id: `m${action.meta.id}`, role: "assistant", text: action.text, source: action.source }],
      };

    case "chatReset":
      return {
        ...state,
        typing: false,
        chat: [{ id: `m${action.meta.id}`, role: "assistant", text: "Nouvelle conversation démarrée. Comment puis-je vous aider ?" }],
      };
  }
}
