"use client";

import { useState, type PointerEvent } from "react";
import { formatNumber } from "@/lib/utils";

type Point = [number, number];

/** Courbe lissée (Catmull-Rom) passant par tous les points. */
function smooth(points: Point[]) {
  if (points.length < 3) return points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

const W = 760;
const H = 245;
const PAD = { left: 40, right: 12, top: 16, bottom: 24 };

/**
 * Consommation de la période en cours (aire verte) comparée à la période précédente (pointillés),
 * avec une info-bulle au survol.
 */
export function EnergyAreaChart({
  current,
  previous,
  labels,
  unit,
  names,
}: {
  current: number[];
  previous: number[];
  labels: string[];
  unit: string;
  names: [string, string];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const n = labels.length;
  const max = Math.ceil(Math.max(...current, ...previous, 1) / 10) * 10;
  const x = (i: number) => PAD.left + (i * (W - PAD.left - PAD.right)) / (n - 1);
  const y = (v: number) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - v / max);
  const now = current.map((v, i): Point => [x(i), y(v)]);
  const before = previous.map((v, i): Point => [x(i), y(v)]);
  const last = now[now.length - 1];
  const step = Math.ceil(n / 7);
  const ticks = labels.map((label, i) => ({ label, i })).filter(({ i }) => i % step === 0 || i === n - 1);

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * W;
    setHover(Math.min(n - 1, Math.max(0, Math.round((px - PAD.left) / ((W - PAD.left - PAD.right) / (n - 1))))));
  };

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`${names[0]} comparé à ${names[1].toLowerCase()}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={PAD.left} x2={W - PAD.right} y1={y(max * g)} y2={y(max * g)} stroke="#edf1ef" strokeDasharray="4 6" />
        ))}
        <path d={smooth(before)} fill="none" stroke="#c5ccc8" strokeWidth="2" strokeDasharray="6 6" />
        {now.length > 1 && (
          <>
            <path d={`${smooth(now)} L${last[0]} ${y(0)} L${PAD.left} ${y(0)}Z`} fill="#dff3e8" opacity=".7" />
            <path d={smooth(now)} fill="none" stroke="#23845a" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
        {ticks.map(({ label, i }) => (
          <text key={label} x={x(i)} y={H - 4} fontSize="11" fill="#9aa49e" textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}>
            {label}
          </text>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={H - PAD.bottom} stroke="#9aa49e" strokeWidth="1" />}
        {last && <circle cx={last[0]} cy={last[1]} r="5" fill="#fff" stroke="#23845a" strokeWidth="3" />}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[115%] whitespace-nowrap rounded-lg bg-forest-800 px-3 py-2 text-[11px] leading-5 text-white shadow-lg"
          style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(current[hover] ?? previous[hover] ?? 0) / H) * 100}%` }}
        >
          <b>{labels[hover]}</b>
          <br />
          {names[0]} : {current[hover] !== undefined ? `${formatNumber(current[hover])} ${unit}` : "—"}
          <br />
          {names[1]} : {previous[hover] !== undefined ? `${formatNumber(previous[hover])} ${unit}` : "—"}
        </div>
      )}
    </div>
  );
}

const hours = ["00h", "04h", "08h", "12h", "16h", "20h", "24h"];
const gridLines = [25, 75, 125, 175, 225];

/** Courbe de charge réelle comparée au seuil recommandé (page Énergie). */
export function LoadCurveChart() {
  return (
    <svg viewBox="0 0 760 270" className="h-full w-full" preserveAspectRatio="none" role="img" aria-label="Courbe de charge réelle et seuil recommandé">
      {gridLines.map((gy) => (
        <line key={gy} x1="38" x2="750" y1={gy} y2={gy} stroke="#edf1ef" strokeDasharray="4 6" />
      ))}
      <path
        d="M38 185 C100 160 128 177 185 145 S270 93 330 122 S410 180 470 148 S560 68 620 105 S690 137 750 83"
        fill="none"
        stroke="#23845a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M38 156 C150 145 230 140 330 133 S530 120 750 110" fill="none" stroke="#c5ccc8" strokeWidth="2" strokeDasharray="7 7" />
      {hours.map((label, i) => (
        <text key={label} x={38 + i * 118} y="260" fontSize="11" fill="#9aa49e" textAnchor={i === 0 ? "start" : i === hours.length - 1 ? "end" : "middle"}>
          {label}
        </text>
      ))}
    </svg>
  );
}
