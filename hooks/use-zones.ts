"use client";

import { useMemo } from "react";
import { useCampus } from "@/components/providers/campus-provider";
import { campusTotals } from "@/lib/campus-state";

/** Zones du campus en temps réel, totaux et commandes des relais. */
export function useZones() {
  const { state, toggleZoneRelay, cutEmptyZones } = useCampus();
  const totals = useMemo(() => campusTotals(state.zones), [state.zones]);
  return { zones: state.zones, totals, autoOffDelay: state.autoOffDelay, toggleZoneRelay, cutEmptyZones };
}
