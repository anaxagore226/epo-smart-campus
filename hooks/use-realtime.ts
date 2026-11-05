"use client";

import { useEffect, type Dispatch } from "react";
import type { CampusAction, Meta } from "@/lib/campus-state";

/**
 * Fait vivre les mesures du campus : nouvelle mesure toutes les 3 s, compte à rebours
 * d'extinction automatique chaque seconde. Simulation en attendant le flux WebSocket
 * du backend (lib/websocket.ts), qui dispatchera les mêmes actions.
 */
export function useRealtimeSimulation(dispatch: Dispatch<CampusAction>, nextMeta: () => Meta, zoneCount: number) {
  useEffect(() => {
    const measures = window.setInterval(() => {
      dispatch({
        type: "tick",
        noise: Array.from({ length: zoneCount }, () => [Math.random() - 0.5, Math.random() - 0.5] as [number, number]),
        latency: 85 + Math.round(Math.random() * 90),
      });
    }, 3000);
    const seconds = window.setInterval(() => dispatch({ type: "second", meta: nextMeta() }), 1000);
    return () => {
      window.clearInterval(measures);
      window.clearInterval(seconds);
    };
  }, [dispatch, nextMeta, zoneCount]);
}
