import type { IconName } from "@/components/icon";

export type NavItem = { label: string; href: string; icon: IconName };

export const mainNavigation: NavItem[] = [
  { label: "Vue d’ensemble", href: "/dashboard", icon: "grid" },
  { label: "Bâtiments", href: "/dashboard/batiments", icon: "building" },
  { label: "Énergie", href: "/dashboard/energie", icon: "bolt" },
  { label: "Analyses", href: "/dashboard/analyses", icon: "chart" },
  { label: "Alertes", href: "/dashboard/alertes", icon: "alert" },
  { label: "Assistant IA", href: "/dashboard/assistant", icon: "bot" },
];

export const settingsNavigation: NavItem = {
  label: "Paramètres",
  href: "/dashboard/parametres",
  icon: "settings",
};

export function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function pageTitle(pathname: string) {
  return (
    [...mainNavigation, settingsNavigation].find((item) => isActive(pathname, item.href))?.label ??
    "EPO Smart Campus"
  );
}
