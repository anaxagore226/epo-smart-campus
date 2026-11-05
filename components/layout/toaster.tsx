"use client";

import { useEffect } from "react";
import { useCampus } from "@/components/providers/campus-provider";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { Toast, Tone } from "@/types/event";

const accent: Record<Tone, string> = {
  ok: "border-l-brand",
  info: "border-l-[#4c78c4]",
  warn: "border-l-[#dda12b]",
  danger: "border-l-[#e8684b]",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const handle = window.setTimeout(() => onDismiss(toast.id), 4500);
    return () => window.clearTimeout(handle);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex animate-toast-in items-start gap-3 rounded-xl border border-l-4 border-line bg-white p-3.5 shadow-[0_10px_30px_rgba(27,55,44,0.16)]",
        accent[toast.tone],
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold">{toast.title}</p>
        {toast.detail && <p className="mt-0.5 text-xs leading-5 text-muted">{toast.detail}</p>}
      </div>
      <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Fermer la notification" className="rounded-md p-1 text-faint hover:text-ink">
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}

/** Notifications des commandes, automatisations et alertes (en bas à droite). */
export function Toaster() {
  const { state, dismissToast } = useCampus();
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(340px,calc(100vw-2.5rem))] flex-col gap-2.5">
      {state.toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
