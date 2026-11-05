"use client";

import { cn } from "@/lib/utils";

/** Interrupteur virtuel utilisé pour les relais et les préférences. */
export function RelaySwitch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition", on ? "bg-brand" : "bg-[#cad2ce]")}
    >
      <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", on ? "left-6" : "left-1")} />
    </button>
  );
}
