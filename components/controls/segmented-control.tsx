"use client";

import { cn } from "@/lib/utils";

/**
 * Sélecteur à onglets.
 * - `soft` : fond gris, onglet actif blanc (graphiques, filtres).
 * - `solid` : fond blanc bordé, onglet actif vert foncé (périodes).
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = "soft",
  size = "xs",
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  variant?: "soft" | "solid";
  size?: "xs" | "2xs";
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex flex-wrap rounded-xl p-1",
        variant === "soft" ? "bg-surface" : "border border-line-strong bg-white",
      )}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option)}
            className={cn(
              "rounded-lg px-3 py-2 font-semibold",
              size === "xs" ? "text-xs" : "text-[11px]",
              variant === "soft"
                ? selected
                  ? "bg-white text-[#183a2e] shadow-sm"
                  : "text-subtle"
                : selected
                  ? "bg-forest-800 text-white"
                  : "text-[#7a867f]",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
