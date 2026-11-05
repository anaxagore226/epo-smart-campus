import type { BuildingId } from "@/lib/campus-buildings";

export type ZoneId = "administration" | "bibliotheque" | "laboratoires" | "restaurant";
export type ZoneStatus = "Normal" | "À surveiller" | "Incident";

export type Zone = {
  id: ZoneId;
  name: string;
  /** Code court utilisé dans les identifiants des nœuds ESP32 et des relais (ex. CLIM-ADM-01). */
  code: string;
  /** Consommation du jour, en kWh. */
  usage: number;
  /** Température moyenne, en °C. */
  temperature: number;
  /** Température d'équilibre lorsque la climatisation fonctionne, en °C. */
  setpoint: number;
  /** Taux d'occupation, en %. */
  occupancy: number;
  /** Nombre de places. */
  capacity: number;
  /** Présence détectée par les capteurs PIR. */
  presence: boolean;
  /** Puissance appelée en ce moment, en kW. */
  power: number;
  /** Puissance appelée avec climatisation et éclairage allumés, en kW. */
  basePower: number;
  clim: boolean;
  light: boolean;
  /** Secondes restantes avant l'extinction automatique d'une zone vide encore alimentée. */
  autoOff: number | null;
  status: ZoneStatus;
  /** Classe Tailwind de la couleur d'identification de la zone. */
  color: string;
};

/** Salle équipée d'un nœud ESP32 (capteur PIR, DHT22 et deux relais). */
export type Room = {
  id: string;
  name: string;
  building: BuildingId;
  sensor: string;
  temperature: number;
  occupants: number;
  capacity: number;
  presence: boolean;
  /** Durée depuis le dernier mouvement détecté. */
  idle?: string;
  clim: boolean;
  light: boolean;
  /** Puissance appelée en ce moment, en kW. */
  power: number;
  /** Puissance appelée avec climatisation et éclairage allumés, en kW. */
  basePower: number;
  status: "Normal" | "Anomalie" | "Hors ligne";
  /** Équipement critique : sa climatisation ne peut pas être coupée à distance. */
  protected?: boolean;
};
