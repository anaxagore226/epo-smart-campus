import { cn } from "@/lib/utils";

/** Pastille verte « en direct » affichée en haut des pages. */
export function StatusBadge({ label, pulse = true }: { label: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-2 self-start rounded-full bg-mint px-3 py-2 text-xs font-semibold text-mint-ink">
      <span className={cn("h-2 w-2 rounded-full bg-online", pulse && "animate-pulse")} />
      {label}
    </div>
  );
}
