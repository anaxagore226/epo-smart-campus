"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { useRealtimeSimulation } from "@/hooks/use-realtime";
import { answerQuestion } from "@/lib/assistant";
import { campusReducer, initialCampusState, type CampusState, type Meta } from "@/lib/campus-state";
import type { Tone } from "@/types/event";
import type { RelayKind } from "@/types/relay";
import type { ZoneId } from "@/types/zone";

type CampusActions = {
  toggleZoneRelay: (zoneId: ZoneId, kind: RelayKind) => void;
  cutEmptyZones: () => void;
  toggleRoomRelay: (roomId: string, kind: RelayKind) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAllAlerts: () => void;
  startBackupCooling: () => void;
  setAutoOffDelay: (minutes: number) => void;
  notify: (tone: Tone, title: string, detail: string) => void;
  dismissToast: (id: string) => void;
  /** Pose une question à l'assistant ; la réponse arrive après un court délai de rédaction. */
  ask: (question: string) => void;
  resetChat: () => void;
};

const CampusContext = createContext<(CampusActions & { state: CampusState }) | null>(null);

const clock = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** État temps réel du campus, partagé par toutes les pages du tableau de bord. */
export function CampusProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(campusReducer, initialCampusState);
  const latest = useRef(state);
  const counter = useRef(0);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    latest.current = state;
  }, [state]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((handle) => window.clearTimeout(handle));
  }, []);

  const nextMeta = useCallback(
    (): Meta => ({ id: ++counter.current, at: clock.format(new Date()), latency: 90 + Math.round(Math.random() * 110) }),
    [],
  );

  useRealtimeSimulation(dispatch, nextMeta, initialCampusState.zones.length);

  const actions = useMemo<CampusActions>(
    () => ({
      toggleZoneRelay: (zoneId, kind) => dispatch({ type: "toggleZoneRelay", zoneId, kind, meta: nextMeta() }),
      cutEmptyZones: () => dispatch({ type: "cutEmptyZones", meta: nextMeta() }),
      toggleRoomRelay: (roomId, kind) => dispatch({ type: "toggleRoomRelay", roomId, kind, meta: nextMeta() }),
      acknowledgeAlert: (alertId) => dispatch({ type: "acknowledgeAlert", alertId, meta: nextMeta() }),
      resolveAllAlerts: () => dispatch({ type: "resolveAllAlerts", meta: nextMeta() }),
      startBackupCooling: () => dispatch({ type: "startBackupCooling", meta: nextMeta() }),
      setAutoOffDelay: (minutes) => dispatch({ type: "setAutoOffDelay", minutes, meta: nextMeta() }),
      notify: (tone, title, detail) => dispatch({ type: "notify", tone, title, detail, meta: nextMeta() }),
      dismissToast: (id) => dispatch({ type: "dismissToast", id }),
      ask: (question) => {
        const text = question.trim();
        if (!text || latest.current.typing) return;
        dispatch({ type: "chatQuestion", text, meta: nextMeta() });
        const handle = window.setTimeout(() => {
          timers.current.delete(handle);
          const reply = answerQuestion(text, latest.current);
          if (reply.command) dispatch({ type: "setZonePower", ...reply.command, meta: nextMeta() });
          dispatch({ type: "chatReply", text: reply.text, source: reply.source, meta: nextMeta() });
        }, 900 + Math.random() * 700);
        timers.current.add(handle);
      },
      resetChat: () => dispatch({ type: "chatReset", meta: nextMeta() }),
    }),
    [nextMeta],
  );

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);
  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (!context) throw new Error("useCampus doit être utilisé dans <CampusProvider>.");
  return context;
}
