"use client";

import { useCampus } from "@/components/providers/campus-provider";

/** Alertes en cours et actions associées. */
export function useAlerts() {
  const { state, acknowledgeAlert, resolveAllAlerts, startBackupCooling } = useCampus();
  return {
    alerts: state.alerts,
    /** Alertes qui demandent une action (critiques et à surveiller). */
    openCount: state.alerts.filter((alert) => alert.level !== "Information").length,
    resolvedCount: state.resolvedCount,
    backupCooling: state.backupCooling,
    acknowledgeAlert,
    resolveAllAlerts,
    startBackupCooling,
  };
}
