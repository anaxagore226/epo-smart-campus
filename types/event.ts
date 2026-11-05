export type Tone = "ok" | "info" | "warn" | "danger";

/** Entrée du journal : message MQTT, automatisation, commande ou alerte. */
export type CampusEvent = { id: string; time: string; tone: Tone; title: string; detail: string };

export type Toast = { id: string; tone: Tone; title: string; detail: string };

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  /** Données consultées pour rédiger la réponse. */
  source?: string;
};
