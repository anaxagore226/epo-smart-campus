// Bâtiments du campus : emprise sur le plan, vue caméra du jumeau numérique et données de démonstration.
// Coordonnées en mètres : x vers l'est, z vers le sud, origine au centre du plan fourni.

export type BuildingId = "r3" | "restaurant" | "laboratoire" | "administration";
export type CampusFocus = BuildingId | "campus" | "entree";

type Vec3 = [number, number, number];

export type CampusView = { target: Vec3; camera: Vec3 };

/** Vue sur le portail d'entrée et son inscription, depuis la voie publique. */
export const entranceView: CampusView = { target: [-64, 5, -2], camera: [-104, 13, 16] };

export type CampusInfo = {
  name: string;
  usage: string;
  status: "Normal" | "À surveiller";
  metrics: [string, string][];
  equipment: { name: string; state: string; on: boolean }[];
  energyClass: string;
  energyNote: string;
  floors?: { level: string; use: string; occupancy: number }[];
  view: CampusView;
};

export type CampusBuilding = CampusInfo & {
  id: BuildingId;
  short: string;
  bounds: { x0: number; x1: number; z0: number; z1: number };
  /** Point d'ancrage de l'étiquette au-dessus du toit. */
  label: Vec3;
};

export const campusOverview: CampusInfo = {
  name: "Vue globale du campus",
  usage: "École Polytechnique de Ouagadougou · 4 bâtiments instrumentés",
  status: "Normal",
  metrics: [
    ["Température", "24,6 °C"],
    ["Occupation", "38%"],
    ["Énergie", "125 kWh"],
    ["Capteurs", "32 actifs"],
  ],
  equipment: [
    { name: "Éclairage", state: "86 / 112 actifs", on: true },
    { name: "Climatisation", state: "31 / 40 actifs", on: true },
    { name: "Prises connectées", state: "140 / 148 actives", on: true },
    { name: "Alarme incendie", state: "Opérationnelle", on: false },
  ],
  energyClass: "Classe B",
  energyNote: "Consommation inférieure de 12% à l’objectif mensuel du campus.",
  view: { target: [0, 0, 0], camera: [-150, 95, 95] },
};

export const campusBuildings: CampusBuilding[] = [
  {
    id: "r3",
    name: "Bâtiment pédagogique R+3",
    short: "Bâtiment R+3",
    usage: "Bibliothèque au rez-de-chaussée · salles de classe du R+1 au R+3",
    status: "Normal",
    metrics: [
      ["Température", "24,2 °C"],
      ["Occupation", "72%"],
      ["Énergie", "47,8 kWh"],
      ["Capteurs", "14 actifs"],
    ],
    floors: [
      { level: "RDC", use: "Bibliothèque", occupancy: 82 },
      { level: "R+1", use: "Salles de classe", occupancy: 76 },
      { level: "R+2", use: "Salles de classe", occupancy: 70 },
      { level: "R+3", use: "Salles de classe", occupancy: 58 },
    ],
    equipment: [
      { name: "Éclairage", state: "48 / 64 actifs", on: true },
      { name: "Climatisation", state: "18 / 24 actifs", on: true },
      { name: "Vidéoprojecteurs", state: "11 / 14 actifs", on: true },
      { name: "Alarme incendie", state: "Opérationnelle", on: false },
    ],
    energyClass: "Classe B",
    energyNote: "Les brise-soleil des façades limitent les besoins en climatisation.",
    bounds: { x0: -56.2, x1: 12.2, z0: -81.4, z1: -10.1 },
    label: [-22, 20, -46],
    view: { target: [-20, 4, -42], camera: [42, 62, 46] },
  },
  {
    id: "restaurant",
    name: "Restaurant universitaire",
    short: "Restaurant",
    usage: "Salle de restauration, cuisines et terrasse à l’étage",
    status: "Normal",
    metrics: [
      ["Température", "25 °C"],
      ["Occupation", "0% · entre deux services"],
      ["Énergie", "19,4 kWh"],
      ["Capteurs", "6 actifs"],
    ],
    equipment: [
      { name: "Chambres froides", state: "2 / 2 actives", on: true },
      { name: "Climatisation", state: "4 / 6 actifs", on: true },
      { name: "Éclairage", state: "22 / 30 actifs", on: true },
      { name: "Détecteur de gaz", state: "Opérationnel", on: false },
    ],
    energyClass: "Classe C",
    energyNote: "Pics de consommation aux heures de service (11 h – 14 h).",
    bounds: { x0: -58.1, x1: -24.7, z0: 27.7, z1: 65.5 },
    label: [-41, 13, 46],
    view: { target: [-38, 4, 45], camera: [12, 17, 66] },
  },
  {
    id: "laboratoire",
    name: "Laboratoire · Atelier de génie mécanique",
    short: "Laboratoire",
    usage: "Ateliers de travaux pratiques et machines-outils",
    status: "À surveiller",
    metrics: [
      ["Température", "27 °C"],
      ["Occupation", "54%"],
      ["Énergie", "42,8 kWh"],
      ["Capteurs", "8 actifs"],
    ],
    equipment: [
      { name: "Machines-outils", state: "9 / 12 en marche", on: true },
      { name: "Climatisation", state: "3 / 4 actifs", on: true },
      { name: "Éclairage", state: "26 / 30 actifs", on: true },
      { name: "Alarme incendie", state: "Opérationnelle", on: false },
    ],
    energyClass: "Classe D",
    energyNote: "Consommation 21% au-dessus de la moyenne : vérifier les machines restées en veille.",
    bounds: { x0: 22.9, x1: 56.5, z0: -22.1, z1: 13.6 },
    label: [40, 10, -4],
    view: { target: [38, 3, -4], camera: [0, 16, 28] },
  },
  {
    id: "administration",
    name: "Administration",
    short: "Administration",
    usage: "Direction, scolarité et services administratifs",
    status: "Normal",
    metrics: [
      ["Température", "24 °C"],
      ["Occupation", "68%"],
      ["Énergie", "34,2 kWh"],
      ["Capteurs", "4 actifs"],
    ],
    equipment: [
      { name: "Éclairage", state: "18 / 24 actifs", on: true },
      { name: "Climatisation", state: "6 / 8 actifs", on: true },
      { name: "Prises connectées", state: "32 / 32 actives", on: true },
      { name: "Alarme incendie", state: "Opérationnelle", on: false },
    ],
    energyClass: "Classe B",
    energyNote: "Consommation inférieure de 18% à la moyenne du campus.",
    bounds: { x0: 20.6, x1: 58.3, z0: 38.2, z1: 76.1 },
    label: [40, 9, 57],
    view: { target: [40, 2, 57], camera: [-12, 24, 86] },
  },
];
