// Données de démonstration, en attendant l'API Rust et le flux MQTT.
import type { Alert } from "@/types/alert";
import type { CampusEvent, ChatMessage } from "@/types/event";
import type { Room, Zone } from "@/types/zone";

export const currentUser = {
  firstName: "Martin",
  fullName: "Martin Kamagate",
  initials: "MK",
  role: "Administrateur technique",
  email: "martin.kamagate@epo.bf",
};

export const connectedSensors = 32;
export const esp32Nodes = 12;

/** Tarif moyen de l'électricité, en FCFA par kWh. */
export const tariff = 150;

export const zones: Zone[] = [
  { id: "administration", name: "Administration", code: "ADM", usage: 34.2, temperature: 24, setpoint: 24, occupancy: 68, capacity: 60, presence: true, power: 12.8, basePower: 12.8, clim: true, light: true, autoOff: null, status: "Normal", color: "bg-emerald-500" },
  { id: "bibliotheque", name: "Bibliothèque", code: "BIB", usage: 28.6, temperature: 23, setpoint: 23, occupancy: 82, capacity: 180, presence: true, power: 10.4, basePower: 10.4, clim: true, light: true, autoOff: null, status: "Normal", color: "bg-blue-500" },
  { id: "laboratoires", name: "Laboratoires", code: "LAB", usage: 42.8, temperature: 27, setpoint: 26.5, occupancy: 54, capacity: 120, presence: true, power: 17.6, basePower: 17.6, clim: true, light: true, autoOff: null, status: "À surveiller", color: "bg-amber-500" },
  // Entre deux services : salle vide mais encore alimentée, l'extinction automatique est en cours.
  { id: "restaurant", name: "Restaurant", code: "RST", usage: 19.4, temperature: 25, setpoint: 25, occupancy: 0, capacity: 300, presence: false, power: 7.8, basePower: 7.8, clim: true, light: true, autoOff: 150, status: "Normal", color: "bg-violet-500" },
];

const room = (r: Omit<Room, "basePower"> & { basePower?: number }): Room => ({ basePower: r.power, ...r });

export const rooms: Room[] = [
  room({ id: "bib-lecture", name: "Salle de lecture · RDC", building: "r3", sensor: "ESP32-BIB-01", temperature: 23.0, occupants: 96, capacity: 120, presence: true, clim: true, light: true, power: 5.4, status: "Normal" }),
  room({ id: "bib-numerique", name: "Espace numérique · RDC", building: "r3", sensor: "ESP32-BIB-02", temperature: 23.4, occupants: 28, capacity: 40, presence: true, clim: true, light: true, power: 3.1, status: "Normal" }),
  room({ id: "r3-b12", name: "Salle B12 · R+1", building: "r3", sensor: "ESP32-R3-112", temperature: 24.8, occupants: 0, capacity: 60, presence: false, idle: "52 min", clim: true, light: true, power: 2.9, status: "Anomalie" }),
  room({ id: "r3-labinfo", name: "Laboratoire informatique · R+2", building: "r3", sensor: "ESP32-R3-205", temperature: 31.4, occupants: 26, capacity: 30, presence: true, clim: true, light: true, power: 6.2, status: "Anomalie" }),
  room({ id: "r3-302", name: "Salle de classe 302 · R+3", building: "r3", sensor: "ESP32-R3-302", temperature: 25.1, occupants: 41, capacity: 60, presence: true, clim: true, light: true, power: 3.3, status: "Normal" }),
  room({ id: "rst-salle", name: "Salle principale", building: "restaurant", sensor: "ESP32-RST-01", temperature: 25.6, occupants: 0, capacity: 240, presence: false, idle: "13 min", clim: true, light: true, power: 4.6, status: "Normal" }),
  room({ id: "rst-cuisine", name: "Cuisine", building: "restaurant", sensor: "ESP32-RST-02", temperature: 28.9, occupants: 0, capacity: 12, presence: false, idle: "40 min", clim: false, light: false, power: 0.1, basePower: 3.4, status: "Normal" }),
  room({ id: "lab-atelier", name: "Atelier machines-outils", building: "laboratoire", sensor: "ESP32-LAB-01", temperature: 27.2, occupants: 18, capacity: 30, presence: true, clim: true, light: true, power: 11.8, status: "Anomalie" }),
  room({ id: "lab-tp", name: "Salle de TP électrotechnique", building: "laboratoire", sensor: "ESP32-LAB-02", temperature: 26.4, occupants: 0, capacity: 24, presence: false, idle: "7 min", clim: true, light: true, power: 3.1, status: "Normal" }),
  room({ id: "adm-direction", name: "Bureau du Directeur", building: "administration", sensor: "ESP32-ADM-01", temperature: 23.8, occupants: 1, capacity: 4, presence: true, clim: true, light: true, power: 1.2, status: "Normal" }),
  room({ id: "adm-scolarite", name: "Scolarité", building: "administration", sensor: "ESP32-ADM-02", temperature: 24.6, occupants: 5, capacity: 8, presence: true, clim: true, light: true, power: 2.4, status: "Anomalie" }),
  room({ id: "adm-reunion", name: "Salle de réunion", building: "administration", sensor: "ESP32-ADM-05", temperature: 24.1, occupants: 0, capacity: 16, presence: false, clim: false, light: false, power: 0.1, basePower: 2.0, status: "Normal" }),
  room({ id: "adm-serveurs", name: "Salle serveurs", building: "administration", sensor: "ESP32-ADM-09", temperature: 22.4, occupants: 0, capacity: 2, presence: false, clim: true, light: false, power: 2.8, basePower: 3.6, status: "Normal", protected: true }),
];

export const alerts: Alert[] = [
  { id: "ALT-024", level: "Critique", title: "Température anormale", place: "Laboratoire informatique · R+2", time: "Il y a 8 min", detail: "La température a dépassé 31°C pendant plus de 10 minutes.", icon: "thermometer" },
  { id: "ALT-023", level: "Attention", title: "Surconsommation détectée", place: "Administration · RDC", time: "Il y a 34 min", detail: "La consommation est supérieure de 28% à la moyenne habituelle.", icon: "bolt" },
  { id: "ALT-022", level: "Attention", title: "Salle vide et climatisée", place: "Salle B12 · R+1", time: "Il y a 52 min", detail: "Aucun mouvement détecté depuis 45 minutes.", icon: "users" },
  { id: "ALT-021", level: "Information", title: "Capteur reconnecté", place: "Bibliothèque · Salle de lecture", time: "Il y a 2 h", detail: "Le capteur de présence est de nouveau opérationnel.", icon: "building" },
  { id: "ALT-020", level: "Information", title: "Cycle automatique terminé", place: "Éclairage extérieur", time: "Hier, 22:30", detail: "Tous les éclairages programmés ont été éteints.", icon: "leaf" },
];

/** Alertes résolues sur les 30 derniers jours (hors flux actif). */
export const resolvedAlertsLast30Days = 18;

export const campusEvents: CampusEvent[] = [
  { id: "ev-6", time: "14:32", tone: "danger", title: "Alerte critique : laboratoire informatique à 31,4 °C", detail: "Notification e-mail et SMS envoyée à l’astreinte" },
  { id: "ev-5", time: "14:18", tone: "warn", title: "Dérive thermique — Laboratoire informatique", detail: "+0,2 °C/min depuis 14:04 · capteur DHT22-R3-205" },
  { id: "ev-4", time: "13:58", tone: "warn", title: "Surconsommation — Administration RDC", detail: "+28 % par rapport au profil appris · maintenance prédictive suggérée" },
  { id: "ev-3", time: "13:40", tone: "warn", title: "Salle B12 vide et climatisée", detail: "Aucun mouvement PIR depuis 45 min" },
  { id: "ev-2", time: "12:30", tone: "info", title: "Capteur PIR reconnecté — Bibliothèque", detail: "Nœud ESP32-BIB-01 de nouveau en ligne" },
  { id: "ev-1", time: "08:02", tone: "ok", title: "Allumage programmé — Administration", detail: "Scénario « Ouverture » exécuté" },
];

/** Énergie consommée par heure (kWh) : hier complet, aujourd'hui jusqu'à l'heure en cours. */
export const hourlyConsumption = {
  yesterday: [14, 13, 12, 12, 13, 16, 21, 28, 37, 42, 45, 48, 47, 44, 46, 47, 45, 39, 31, 27, 23, 20, 18, 16],
  today: [14, 13, 12, 12, 13, 15, 19, 26, 34, 39, 41, 43, 40, 38, 47],
};

/** Énergie consommée par jour (kWh) : semaine en cours et semaine précédente. */
export const weeklyConsumption = {
  labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  current: [812, 846, 798],
  previous: [835, 872, 851, 880, 820, 410, 365],
};

export const assistantGreeting: ChatMessage = {
  id: "m-greeting",
  role: "assistant",
  text: `Bonjour ${currentUser.firstName}. J’ai accès aux mesures des capteurs, à l’historique de consommation et au journal des alertes. Je peux aussi exécuter des commandes, par exemple « éteins le restaurant ». Que souhaitez-vous savoir ?`,
};
