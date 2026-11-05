export const performanceMetrics = ["Énergie", "Occupation", "Température"] as const;
export type PerformanceMetric = (typeof performanceMetrics)[number];

const curves: Record<PerformanceMetric, string> = {
  Énergie: "M38 185 C120 165 155 182 220 142 S325 105 390 126 S500 155 560 104 S665 93 750 58",
  Occupation: "M38 170 C110 145 180 130 250 152 S370 175 440 123 S590 85 750 112",
  Température: "M38 125 C130 118 210 135 290 121 S430 113 510 128 S650 115 750 120",
};

const months = ["Mars", "Avr.", "Mai", "Juin", "Juil.", "Août"];

/** Performance mensuelle d'un indicateur, comparée au mois précédent (pointillés). */
export function PerformanceChart({ metric }: { metric: PerformanceMetric }) {
  return (
    <svg viewBox="0 0 760 270" className="h-full w-full" preserveAspectRatio="none" role="img" aria-label={`Performance mensuelle : ${metric}`}>
      {[25, 75, 125, 175, 225].map((y) => (
        <line key={y} x1="38" x2="750" y1={y} y2={y} stroke="#edf1ef" />
      ))}
      <path d={curves[metric]} fill="none" stroke="#23845a" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 198 C140 177 230 171 330 160 S540 135 750 128" fill="none" stroke="#bbc4bf" strokeWidth="2" strokeDasharray="6 7" />
      {months.map((label, i) => (
        <text
          key={label}
          x={i === months.length - 1 ? 750 : 45 + i * 140}
          y="260"
          fontSize="11"
          fill="#9aa49e"
          textAnchor={i === months.length - 1 ? "end" : "start"}
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
