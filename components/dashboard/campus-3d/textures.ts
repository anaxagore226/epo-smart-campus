// Textures dessinées dans un canvas d'après les photos du campus (fenêtres, claustras, fresque…).
import * as THREE from "three";

type Ctx = CanvasRenderingContext2D;

/** Générateur pseudo-aléatoire déterministe : le campus est identique à chaque chargement. */
export function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function texture(width: number, height: number, draw: (ctx: Ctx, w: number, h: number) => void, anisotropy: number, repeat = false) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, width, height);
  const result = new THREE.CanvasTexture(canvas);
  result.colorSpace = THREE.SRGBColorSpace;
  result.anisotropy = anisotropy;
  if (repeat) result.wrapS = result.wrapT = THREE.RepeatWrapping;
  return result;
}

function glass(ctx: Ctx, x: number, y: number, w: number, h: number, top: string, bottom: string) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + h);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
}

function bars(ctx: Ctx, x: number, y: number, w: number, h: number, cols: number, rows: number, color: string, width: number) {
  ctx.fillStyle = color;
  for (let c = 1; c < cols; c++) ctx.fillRect(x + (c * w) / cols - width / 2, y, width, h);
  for (let r = 1; r < rows; r++) ctx.fillRect(x, y + (r * h) / rows - width / 2, w, width);
}

/** Grille de sécurité à losanges, comme sur les fenêtres du restaurant et de l'administration. */
function diamondGrille(ctx: Ctx, x: number, y: number, w: number, h: number, color: string, lineWidth: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  const cols = Math.max(2, Math.round(w / 48));
  const cw = w / cols;
  const rows = Math.max(1, Math.round(h / (cw * 1.5)));
  const rh = h / rows;
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(x + c * cw, y);
    ctx.lineTo(x + c * cw, y + h);
    ctx.stroke();
  }
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const cx = x + c * cw + cw / 2;
      const cy = y + r * rh + rh / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - rh * 0.4);
      ctx.lineTo(cx + cw * 0.4, cy);
      ctx.lineTo(cx, cy + rh * 0.4);
      ctx.lineTo(cx - cw * 0.4, cy);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function text(
  label: string,
  options: { color: string; background?: string; width: number; height: number },
  anisotropy: number,
) {
  return texture(
    options.width,
    options.height,
    (ctx, w, h) => {
      if (options.background) {
        ctx.fillStyle = options.background;
        ctx.fillRect(0, 0, w, h);
      }
      let size = h * 0.7;
      const font = (px: number) => `700 ${px}px "Arial Narrow", Arial, Helvetica, sans-serif`;
      ctx.font = font(size);
      const max = w * 0.94;
      const measured = ctx.measureText(label).width;
      if (measured > max) {
        size *= max / measured;
        ctx.font = font(size);
      }
      ctx.fillStyle = options.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, w / 2, h / 2 + size * 0.05);
    },
    anisotropy,
  );
}

export function createTextures(anisotropy: number) {
  return {
    /** Fenêtre en fond de niche du bâtiment R+3 (une niche par motif, répété). */
    niche: texture(
      128,
      256,
      (ctx, w, h) => {
        ctx.fillStyle = "#5c4c3e";
        ctx.fillRect(0, 0, w, h);
        glass(ctx, 12, 10, w - 24, h - 20, "#7d95a2", "#2e3b43");
        bars(ctx, 12, 10, w - 24, h - 20, 2, 4, "#5c4c3e", 7);
        ctx.fillStyle = "rgba(18, 22, 24, 0.55)";
        ctx.fillRect(w / 2 + 4, 10 + (h - 20) / 2 + 4, (w - 24) / 2 - 8, (h - 20) / 4 - 8);
      },
      anisotropy,
      true,
    ),
    /** Grandes fenêtres vitrées des ailes ocre de l'entrée. */
    tallWindow: texture(
      128,
      256,
      (ctx, w, h) => {
        ctx.fillStyle = "#4a4f53";
        ctx.fillRect(0, 0, w, h);
        glass(ctx, 10, 8, w - 20, h - 16, "#b2c7d3", "#56707e");
        bars(ctx, 10, 8, w - 20, h - 16, 2, 6, "#4a4f53", 6);
      },
      anisotropy,
    ),
    /** Fenêtre coulissante à cadre blanc. */
    slider: texture(
      256,
      96,
      (ctx, w, h) => {
        ctx.fillStyle = "#f1efe9";
        ctx.fillRect(0, 0, w, h);
        glass(ctx, 10, 10, w / 2 - 14, h - 20, "#7a92a0", "#3b4a52");
        ctx.fillStyle = "#262d31";
        ctx.fillRect(w / 2 + 4, 10, w / 2 - 14, h - 20);
      },
      anisotropy,
    ),
    /** Deux petites fenêtres carrées des pignons du bâtiment R+3. */
    squarePair: texture(
      256,
      112,
      (ctx, w, h) => {
        ctx.fillStyle = "#e8d2ad";
        ctx.fillRect(0, 0, w, h);
        for (const x of [12, 142]) {
          ctx.fillStyle = "#f4f2ec";
          ctx.fillRect(x, 6, 102, h - 12);
          glass(ctx, x + 9, 15, 84, h - 30, "#7f95a1", "#34424a");
          ctx.fillStyle = "#f4f2ec";
          ctx.fillRect(x + 48, 15, 6, h - 30);
        }
      },
      anisotropy,
    ),
    /** Fenêtre à grille métallique grise. */
    grille: texture(
      256,
      192,
      (ctx, w, h) => {
        ctx.fillStyle = "#686e70";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#353d41";
        ctx.fillRect(10, 10, w - 20, h - 20);
        diamondGrille(ctx, 10, 10, w - 20, h - 20, "#959b9d", 4);
      },
      anisotropy,
    ),
    /** Fenêtre à grille blanche (administration). */
    whiteGrille: texture(
      160,
      160,
      (ctx, w, h) => {
        ctx.fillStyle = "#f3f1ec";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#3d4549";
        ctx.fillRect(12, 12, w - 24, h - 24);
        diamondGrille(ctx, 12, 12, w - 24, h - 24, "#efeee9", 5);
      },
      anisotropy,
    ),
    /** Rideau métallique ajouré de l'atelier. */
    shutter: texture(
      256,
      128,
      (ctx, w, h) => {
        ctx.fillStyle = "#596064";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "#a8adaf";
        ctx.lineWidth = 2;
        for (let i = -h; i < w + h; i += 12) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + h, h);
          ctx.moveTo(i + h, 0);
          ctx.lineTo(i, h);
          ctx.stroke();
        }
      },
      anisotropy,
    ),
    /** Portes vitrées de l'atelier. */
    glassDoor: texture(
      256,
      160,
      (ctx, w, h) => {
        ctx.fillStyle = "#a1a7aa";
        ctx.fillRect(0, 0, w, h);
        glass(ctx, 8, 8, w - 16, h - 16, "#97afbb", "#3e4f57");
        bars(ctx, 8, 8, w - 16, h - 16, 4, 2, "#a1a7aa", 6);
      },
      anisotropy,
    ),
    /** Claustra en briques ajourées de l'atelier de génie mécanique. */
    claustra: texture(
      1024,
      384,
      (ctx, w, h) => {
        ctx.fillStyle = "#dca650";
        ctx.fillRect(0, 0, w, h);
        const cols = 20;
        const rows = 7;
        const cw = w / cols;
        const rh = h / rows;
        const s = Math.min(cw, rh) * 0.58;
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const x = c * cw + (cw - s) / 2;
            const y = r * rh + (rh - s) / 2;
            ctx.fillStyle = "#f2cb86";
            ctx.fillRect(x - 3, y - 3, s + 3, s + 3);
            ctx.fillStyle = "#6a4420";
            ctx.fillRect(x, y, s, s);
            ctx.fillStyle = "#3a2311";
            ctx.fillRect(x + s * 0.28, y + s * 0.28, s * 0.72, s * 0.72);
          }
        }
      },
      anisotropy,
    ),
    /** Fresque à motifs africains de la façade du restaurant. */
    mural: texture(
      512,
      384,
      (ctx, w, h) => {
        const Y = "#f0c53d";
        const P = "#6c3352";
        const O = "#e7893b";
        const D = "#3d1f2f";
        ctx.fillStyle = Y;
        ctx.fillRect(0, 0, w, h);
        const stripes = 7;
        const sw = w / stripes;
        for (let i = 0; i < stripes; i++) {
          const x = i * sw;
          const kind = i % 4;
          if (kind === 0) {
            ctx.fillStyle = P;
            ctx.fillRect(x, 0, sw, h);
            ctx.fillStyle = Y;
            for (let y = 0; y < h; y += 32) {
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + sw, y + 16);
              ctx.lineTo(x, y + 32);
              ctx.closePath();
              ctx.fill();
            }
          } else if (kind === 1) {
            ctx.fillStyle = P;
            ctx.fillRect(x + 6, 0, sw - 12, h);
            for (let y = 18; y < h; y += 36) {
              ctx.fillStyle = Y;
              ctx.beginPath();
              ctx.arc(x + sw / 2, y, 11, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = O;
              ctx.beginPath();
              ctx.arc(x + sw / 2, y, 5, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (kind === 2) {
            for (let y = 0, row = 0; y < h; y += 24, row++) {
              for (const dx of [0.3, 0.7]) {
                ctx.fillStyle = row % 2 ? O : P;
                const cx = x + sw * dx;
                const cy = y + 12;
                ctx.beginPath();
                ctx.moveTo(cx, cy - 9);
                ctx.lineTo(cx + 9, cy);
                ctx.lineTo(cx, cy + 9);
                ctx.lineTo(cx - 9, cy);
                ctx.closePath();
                ctx.fill();
              }
            }
          } else {
            ctx.fillStyle = O;
            ctx.fillRect(x, 0, sw, h);
            ctx.strokeStyle = D;
            ctx.lineWidth = 5;
            for (let y = 10; y < h; y += 26) {
              ctx.beginPath();
              ctx.moveTo(x + 6, y + 10);
              ctx.lineTo(x + sw / 2, y);
              ctx.lineTo(x + sw - 6, y + 10);
              ctx.stroke();
            }
          }
          ctx.fillStyle = D;
          ctx.fillRect(x, 0, 3, h);
        }
      },
      anisotropy,
    ),
    /** Façade d'une unité extérieure de climatiseur. */
    ac: texture(
      128,
      96,
      (ctx, w, h) => {
        ctx.fillStyle = "#f2f2ef";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#c9cccd";
        ctx.beginPath();
        ctx.arc(50, h / 2, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#6d7275";
        ctx.beginPath();
        ctx.arc(50, h / 2, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#d9dbdc";
        ctx.lineWidth = 3;
        for (let a = 0; a < 6; a++) {
          ctx.beginPath();
          ctx.moveTo(50, h / 2);
          ctx.lineTo(50 + 30 * Math.cos((a * Math.PI) / 3), h / 2 + 30 * Math.sin((a * Math.PI) / 3));
          ctx.stroke();
        }
        ctx.fillStyle = "#d8403a";
        ctx.fillRect(98, 14, 18, 6);
      },
      anisotropy,
    ),
    /** Latérite rouge mouchetée, répétée sur tout le terrain. */
    ground: texture(
      256,
      256,
      (ctx, w, h) => {
        ctx.fillStyle = "#b8673f";
        ctx.fillRect(0, 0, w, h);
        const random = seeded(7);
        const shades = ["#a5532f", "#c57a4f", "#9a4e2c", "#cf8a5c"];
        for (let i = 0; i < 5000; i++) {
          ctx.fillStyle = shades[Math.floor(random() * shades.length)];
          ctx.globalAlpha = 0.3 + random() * 0.45;
          const s = 1 + random() * 3;
          ctx.fillRect(random() * w, random() * h, s, s);
        }
        ctx.globalAlpha = 1;
      },
      anisotropy,
      true,
    ),
    signClasses: text("SALLES DE CLASSES", { color: "#2a2f8f", width: 1024, height: 136 }, anisotropy),
    signLab: text("ATELIER DE GENIE MECANIQUE", { color: "#4a4d50", width: 1024, height: 124 }, anisotropy),
    signGate: text(
      "ÉCOLE POLYTECHNIQUE DE OUAGADOUGOU",
      { color: "#ffffff", background: "#c4665a", width: 2048, height: 200 },
      anisotropy,
    ),
  };
}

export type Textures = ReturnType<typeof createTextures>;
