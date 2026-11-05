export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const decimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function formatNumber(value: number) {
  return decimal.format(value);
}

/** Compte à rebours au format mm:ss. */
export function formatCountdown(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Télécharge un fichier CSV lisible par Excel (séparateur « ; », encodage UTF-8 avec BOM). */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const escape = (cell: string | number) => {
    const text = String(cell);
    return /[";\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  const csv = "﻿" + rows.map((row) => row.map(escape).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Date du jour au format AAAA-MM-JJ, pour nommer les exports. */
export function todayStamp() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
