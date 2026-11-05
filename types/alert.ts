import type { IconName } from "@/components/icon";

export type AlertLevel = "Critique" | "Attention" | "Information";

export type Alert = {
  id: string;
  level: AlertLevel;
  title: string;
  place: string;
  time: string;
  detail: string;
  icon: IconName;
};
