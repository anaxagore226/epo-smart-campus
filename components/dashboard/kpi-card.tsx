import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/utils";

export type KpiTone = "amber" | "blue" | "violet" | "green";

const tones: Record<KpiTone, string> = {
  amber: "bg-[#fff5db] text-[#c77c08]",
  blue: "bg-[#e9f0ff] text-[#4776d0]",
  violet: "bg-[#f0eafd] text-[#7b55c7]",
  green: "bg-mint text-brand",
};

export function KpiCard({
  label,
  value,
  unit,
  note,
  icon,
  tone,
  elevated = false,
}: {
  label: string;
  value: string;
  unit?: string;
  note: string;
  icon: IconName;
  tone: KpiTone;
  elevated?: boolean;
}) {
  return (
    <article className={cn("panel p-5", elevated && "shadow-soft")}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl", tones[tone])}>
          <Icon name={icon} size={19} />
        </div>
      </div>
      {unit ? (
        <div className="mt-5 flex items-end gap-1.5">
          <strong className="text-3xl tracking-tight">{value}</strong>
          <span className="mb-1 text-sm font-semibold text-muted">{unit}</span>
        </div>
      ) : (
        <p className="mt-5 text-2xl font-bold tracking-tight">{value}</p>
      )}
      <p className="mt-2 text-xs font-medium text-brand">{note}</p>
    </article>
  );
}
