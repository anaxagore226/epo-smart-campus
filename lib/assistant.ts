// Réponses simulées de l'assistant, calculées à partir de l'état temps réel du campus.
// Elles seront remplacées par le service RAG (ai-service/app/api/chat.py).
import { campusTotals, COMFORT_MAX, type CampusState } from "./campus-state";
import { tariff } from "./mock-data";
import { formatNumber } from "./utils";
import type { IconName } from "@/components/icon";
import type { ZoneId } from "@/types/zone";

export type AssistantReply = {
  text: string;
  source?: string;
  /** Commande à exécuter sur les relais d'une zone. */
  command?: { zoneId: ZoneId; on: boolean };
};

const ALIASES: Record<ZoneId, string[]> = {
  administration: ["administration", "admin", "direction"],
  bibliotheque: ["bibliothèque", "bibliotheque", "biblio"],
  laboratoires: ["laboratoire", "labo", "atelier"],
  restaurant: ["restaurant", "resto", "cantine"],
};

const ADVICE: Partial<Record<IconName, string>> = {
  thermometer:
    "vérifiez la climatisation de la salle ; si la température continue de monter, démarrez le climatiseur de secours depuis le centre d’alertes.",
  bolt: "comparez avec le profil habituel : un équipement resté allumé ou un filtre de climatiseur encrassé est probable. Une maintenance préventive est conseillée.",
  users: "coupez la climatisation de la salle, ou réduisez le délai d’extinction automatique dans les paramètres.",
};

const has = (text: string, words: string[]) => words.some((word) => text.includes(word));
const minutes = (seconds: number) => `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, "0")} s`;

export const assistantSuggestions = [
  "Quelle zone consomme le plus aujourd’hui ?",
  "Y a-t-il des anomalies en cours ?",
  "Quelles salles sont allumées sans présence ?",
  "Combien avons-nous économisé ce mois-ci ?",
  "Éteins le restaurant",
];

export function answerQuestion(question: string, state: CampusState): AssistantReply {
  const q = question.toLowerCase();
  const totals = campusTotals(state.zones);
  const zone = state.zones.find((z) => has(q, ALIASES[z.id]));

  // Analyse d'une alerte précise (bouton « Analyser » du centre d'alertes)
  const alert = state.alerts.find((a) => q.includes(a.title.toLowerCase()));
  if (alert) {
    return {
      text: [
        `Analyse de l’alerte ${alert.id} — ${alert.title}`,
        `Lieu : ${alert.place} · ${alert.time.toLowerCase()}`,
        alert.detail,
        `Recommandation : ${ADVICE[alert.icon] ?? "aucune action n’est nécessaire, l’événement est informatif."}`,
      ].join("\n"),
      source: "Sources : journal des alertes · historique des capteurs",
    };
  }

  // Commandes : « éteins le restaurant », « allume la bibliothèque » (mots entiers, pour ne pas
  // confondre « allume » avec « allumées » dans une question).
  const words = new Set(q.split(/[^a-zàâäçéèêëîïôöùûüÿœ]+/));
  const off = ["éteins", "éteindre", "eteins", "eteindre", "coupe", "couper", "arrête", "arrete", "arrêter"].some((w) => words.has(w));
  const on = !off && ["allume", "allumer", "rallume"].some((w) => words.has(w));
  if (off || on) {
    if (off && has(q, ["serveur"])) {
      return {
        text: "Par sécurité, la climatisation de la salle serveurs ne peut pas être coupée à distance. Je peux en revanche vous prévenir si sa température dépasse le seuil.",
        source: "Règle de protection des équipements critiques",
      };
    }
    if (!zone) return { text: `Quelle zone souhaitez-vous ${off ? "éteindre" : "allumer"} ? Administration, Bibliothèque, Laboratoires ou Restaurant.` };
    const relays = Number(zone.clim !== on) + Number(zone.light !== on);
    if (!relays) return { text: `La climatisation et l’éclairage de la zone ${zone.name} sont déjà ${on ? "allumés" : "éteints"}.` };
    const warning = off && zone.presence ? "\nAttention : une présence est encore détectée dans cette zone." : "";
    return {
      text: `C’est fait : j’ai ${on ? "allumé" : "coupé"} ${relays} équipement${relays > 1 ? "s" : ""} de la zone ${zone.name}. Les relais ESP32 ont confirmé la commande.${warning}`,
      source: "Action : commande MQTT → relais ESP32",
      command: { zoneId: zone.id, on },
    };
  }

  if (has(q, ["consomm", "énergivore", "energivore", "kwh"])) {
    const [first, ...others] = [...state.zones].sort((a, b) => b.usage - a.usage);
    return {
      text: [
        `Aujourd’hui, la zone la plus énergivore est « ${first.name} » avec ${formatNumber(first.usage)} kWh, soit ${Math.round((first.usage / totals.usage) * 100)} % de la consommation du campus.`,
        `Viennent ensuite : ${others.map((z) => `${z.name} (${formatNumber(z.usage)} kWh)`).join(", ")}.`,
        `Puissance appelée en ce moment : ${formatNumber(totals.power)} kW.`,
      ].join("\n"),
      source: "Sources : capteurs de courant ACS712 · agrégation du jour",
    };
  }

  if (has(q, ["anomal", "panne", "alerte", "incident", "critique", "problème", "probleme"])) {
    const active = state.alerts.filter((a) => a.level !== "Information");
    if (!active.length) {
      return { text: "Aucune anomalie n’est en cours : tous les capteurs remontent des valeurs normales.", source: "Sources : moteur de détection d’anomalies" };
    }
    const critical = active.some((a) => a.level === "Critique");
    return {
      text: [
        `${active.length} anomalie${active.length > 1 ? "s" : ""} en cours :`,
        ...active.map((a) => `• ${a.title} — ${a.place} (${a.level.toLowerCase()}) : ${a.detail}`),
        ...(critical ? ["Je recommande de traiter en priorité l’alerte critique."] : []),
      ].join("\n"),
      source: "Sources : moteur de détection d’anomalies · journal des alertes",
    };
  }

  if (has(q, ["présence", "presence", "vide", "inoccup", "personne"])) {
    const idleRooms = state.rooms.filter((r) => !r.presence && (r.clim || r.light) && !r.protected);
    if (!idleRooms.length && !totals.idlePowered.length) {
      return { text: "Aucune salle n’est alimentée sans présence en ce moment.", source: "Sources : capteurs PIR · état des relais" };
    }
    const lines = idleRooms.map((r) => `• ${r.name}${r.idle ? ` (aucun mouvement depuis ${r.idle})` : ""} — ${formatNumber(r.power)} kW`);
    const countdown = totals.idlePowered.map((z) =>
      z.autoOff !== null ? `La zone ${z.name} sera éteinte automatiquement dans ${minutes(z.autoOff)}.` : `La zone ${z.name} est vide mais alimentée.`,
    );
    return {
      text: [
        `${idleRooms.length} salle${idleRooms.length > 1 ? "s sont alimentées" : " est alimentée"} sans présence détectée :`,
        ...lines,
        ...countdown,
        "Dites par exemple « éteins le restaurant » pour couper une zone tout de suite.",
      ].join("\n"),
      source: "Sources : capteurs PIR · état des relais",
    };
  }

  if (has(q, ["températ", "temperat", "chaud", "climat", "confort", "froid"])) {
    const hottest = [...state.rooms].sort((a, b) => b.temperature - a.temperature)[0];
    return {
      text: [
        `Température moyenne du campus : ${formatNumber(totals.temperature)} °C. ${totals.comfortable} zone${totals.comfortable > 1 ? "s" : ""} sur ${state.zones.length} ${totals.comfortable > 1 ? "sont" : "est"} sous le seuil de confort de ${COMFORT_MAX} °C.`,
        `Par zone : ${state.zones.map((z) => `${z.name} ${formatNumber(z.temperature)} °C`).join(", ")}.`,
        `La salle la plus chaude est « ${hottest.name} » à ${formatNumber(hottest.temperature)} °C${hottest.temperature > 28 ? ", au-dessus du seuil de 28 °C : vérifiez sa climatisation." : "."}`,
      ].join("\n"),
      source: "Sources : capteurs DHT22",
    };
  }

  if (has(q, ["économ", "econom", "facture", "coût", "cout", "gain", "fcfa"])) {
    return {
      text: [
        `Depuis le début du mois, l’automatisation a évité ${formatNumber(state.savedKwh)} kWh de consommation inutile, soit environ ${formatNumber(Math.round(state.savedKwh * tariff))} FCFA.`,
        `${state.autoOffCount} extinctions automatiques ont été déclenchées. Projection annuelle : environ −27 % sur la facture d’électricité, dans l’objectif de 25 à 30 %.`,
      ].join("\n"),
      source: `Sources : journal d’automatisation · tarif moyen ${tariff} F/kWh`,
    };
  }

  if (has(q, ["bonjour", "bonsoir", "salut", "merci"])) {
    return { text: "Avec plaisir ! Je peux vous renseigner sur la consommation, le confort thermique et les anomalies, ou exécuter une commande comme « éteins le restaurant »." };
  }

  return {
    text: "Je n’ai pas trouvé d’information précise sur ce point. Essayez par exemple « Quelle zone consomme le plus aujourd’hui ? » ou « Y a-t-il des anomalies en cours ? ».",
  };
}
