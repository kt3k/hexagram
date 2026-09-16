/**
 * 卦ごとの抽象画を SVG で生成する。
 *
 * 画面を上下に分け、上卦・下卦それぞれの象（天・沢・火・雷・風・水・山・地）に
 * 対応する描画関数で埋める。八卦 × 八卦で 64 通りの構図が生まれ、さらに
 * 卦番号を種にした乱数で細部が変わるため、同じ絵は二つとない。
 *
 *   deno task art
 */
import { HEXAGRAMS } from "../src/_lib/hexagram.ts";
import type { Trigram } from "../src/_lib/trigrams.ts";

const W = 1000;
const H = 1250;
const OUT = new URL("../src/img/hexagrams/", import.meta.url);

/** 種から決まる擬似乱数（mulberry32）。生成結果を再現可能にするため */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Band {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Painter = (
  band: Band,
  rnd: () => number,
  color: string,
  accent: string,
) => string;

const n2 = (v: number) => Math.round(v * 100) / 100;

/** 天 — 放射状にひろがる同心の弧 */
const heaven: Painter = ({ x, y, w, h }, rnd, color, accent) => {
  const cx = x + w / 2;
  const cy = y + h * (0.3 + rnd() * 0.4);
  const out: string[] = [];
  const rings = 9 + Math.floor(rnd() * 5);
  for (let i = 0; i < rings; i++) {
    const r = (i + 1) * (w / (rings * 1.1));
    out.push(
      `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(r)}" fill="none" ` +
        `stroke="${i % 3 === 0 ? accent : color}" stroke-width="${
          n2(0.6 + rnd() * 2.2)
        }" opacity="${n2(0.18 + rnd() * 0.4)}"/>`,
    );
  }
  const rays = 20 + Math.floor(rnd() * 16);
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + rnd() * 0.1;
    const r0 = w * 0.12;
    const r1 = w * (0.5 + rnd() * 0.5);
    out.push(
      `<line x1="${n2(cx + Math.cos(a) * r0)}" y1="${
        n2(cy + Math.sin(a) * r0)
      }" x2="${n2(cx + Math.cos(a) * r1)}" y2="${n2(cy + Math.sin(a) * r1)}" ` +
        `stroke="${color}" stroke-width="${n2(0.5 + rnd() * 1.2)}" opacity="${
          n2(0.1 + rnd() * 0.3)
        }"/>`,
    );
  }
  return out.join("\n");
};

/** 地 — 水平に積み重なる地層。幅と濃さを大きく揺らして単調な縞を避ける */
const earth: Painter = ({ x, y, w, h }, rnd, color, accent) => {
  const out: string[] = [];
  let cursor = y;
  while (cursor < y + h) {
    // 厚い層と薄い層を混ぜる
    const thick = rnd() > 0.65;
    const t = thick ? h * (0.08 + rnd() * 0.16) : h * (0.008 + rnd() * 0.035);
    // 層の一部は画面を横切らず、途中で途切れる
    const partial = rnd() > 0.7;
    const x0 = partial ? x + rnd() * w * 0.4 : x;
    const x1 = partial ? x0 + w * (0.3 + rnd() * 0.6) : x + w;
    out.push(
      `<rect x="${n2(x0)}" y="${n2(cursor)}" width="${
        n2(Math.min(x1, x + w) - x0)
      }" height="${n2(t)}" fill="${rnd() > 0.85 ? accent : color}" opacity="${
        n2(thick ? 0.08 + rnd() * 0.14 : 0.14 + rnd() * 0.3)
      }"/>`,
    );
    cursor += t + h * rnd() * 0.02;
  }
  return out.join("\n");
};

/** 水 — 重なりあう波の線 */
const water: Painter = ({ x, y, w, h }, rnd, color, accent) => {
  const out: string[] = [];
  const waves = 16 + Math.floor(rnd() * 12);
  for (let i = 0; i < waves; i++) {
    const baseY = y + (h / waves) * i + rnd() * 6;
    const amp = 6 + rnd() * 34;
    const period = w / (2 + rnd() * 4);
    let d = `M ${n2(x)} ${n2(baseY)}`;
    for (let px = 0; px <= w; px += period / 2) {
      const dir = (px / (period / 2)) % 2 < 1 ? -1 : 1;
      d += ` Q ${n2(x + px + period / 4)} ${n2(baseY + amp * dir)} ${
        n2(x + Math.min(px + period / 2, w))
      } ${n2(baseY)}`;
    }
    out.push(
      `<path d="${d}" fill="none" stroke="${
        i % 5 === 0 ? accent : color
      }" stroke-width="${n2(0.8 + rnd() * 2.4)}" opacity="${
        n2(0.14 + rnd() * 0.42)
      }"/>`,
    );
  }
  return out.join("\n");
};

/** 火 — 立ちのぼる炎の三角 */
const fire: Painter = ({ x, y, w, h }, rnd, color, accent) => {
  const out: string[] = [];
  const flames = 22 + Math.floor(rnd() * 18);
  for (let i = 0; i < flames; i++) {
    const bx = x + rnd() * w;
    const bw = 20 + rnd() * 120;
    const bh = h * (0.2 + rnd() * 0.85);
    const lean = (rnd() - 0.5) * bw * 0.9;
    const baseY = y + h;
    out.push(
      `<path d="M ${n2(bx - bw / 2)} ${n2(baseY)} Q ${
        n2(bx + lean - bw * 0.15)
      } ${n2(baseY - bh * 0.55)} ${n2(bx + lean)} ${n2(baseY - bh)} Q ${
        n2(bx + lean + bw * 0.15)
      } ${n2(baseY - bh * 0.55)} ${n2(bx + bw / 2)} ${n2(baseY)} Z" ` +
        `fill="${i % 6 === 0 ? accent : color}" opacity="${
          n2(0.07 + rnd() * 0.26)
        }"/>`,
    );
  }
  return out.join("\n");
};

/** 雷 — 折れ曲がりながら走る稲妻 */
const thunder: Painter = ({ x, y, w, h }, rnd, color, accent) => {
  const out: string[] = [];
  const bolts = 7 + Math.floor(rnd() * 7);
  for (let i = 0; i < bolts; i++) {
    let px = x + rnd() * w;
    let py = y + rnd() * h * 0.25;
    let d = `M ${n2(px)} ${n2(py)}`;
    const steps = 5 + Math.floor(rnd() * 8);
    for (let s = 0; s < steps; s++) {
      px += (rnd() - 0.5) * w * 0.3;
      py += (h / steps) * (0.5 + rnd() * 0.9);
      d += ` L ${n2(px)} ${n2(py)}`;
    }
    out.push(
      `<path d="${d}" fill="none" stroke="${
        i % 3 === 0 ? accent : color
      }" stroke-width="${n2(1 + rnd() * 5)}" stroke-linejoin="miter" opacity="${
        n2(0.25 + rnd() * 0.5)
      }"/>`,
    );
  }
  // 閃光の余韻
  for (let i = 0; i < 40; i++) {
    out.push(
      `<rect x="${n2(x + rnd() * w)}" y="${n2(y + rnd() * h)}" width="${
        n2(2 + rnd() * 40)
      }" height="${n2(1 + rnd() * 3)}" fill="${accent}" opacity="${
        n2(0.1 + rnd() * 0.3)
      }"/>`,
    );
  }
  return out.join("\n");
};

/** 風 — 長く吹き流れる曲線 */
const wind: Painter = ({ x, y, w, h }, rnd, color, accent) => {
  const out: string[] = [];
  const streams = 34 + Math.floor(rnd() * 22);
  for (let i = 0; i < streams; i++) {
    const sy = y + rnd() * h;
    const amp = (rnd() - 0.5) * h * 0.5;
    const start = x - w * 0.1 + rnd() * w * 0.3;
    const end = start + w * (0.5 + rnd() * 0.7);
    out.push(
      `<path d="M ${n2(start)} ${n2(sy)} C ${n2(start + (end - start) * 0.3)} ${
        n2(sy + amp)
      }, ${n2(start + (end - start) * 0.7)} ${n2(sy - amp)}, ${n2(end)} ${
        n2(sy + amp * 0.2)
      }" fill="none" stroke="${i % 7 === 0 ? accent : color}" stroke-width="${
        n2(0.5 + rnd() * 2)
      }" opacity="${n2(0.12 + rnd() * 0.35)}" stroke-linecap="round"/>`,
    );
  }
  return out.join("\n");
};

/** 山 — 重なり合う稜線。遠景ほど淡く霞ませて奥行きを出す */
const mountain: Painter = ({ x, y, w, h }, rnd, color, _accent) => {
  const out: string[] = [];
  const ranges = 5 + Math.floor(rnd() * 4);
  // 奥から手前へ描き、手前ほど濃く低くする
  for (let r = ranges - 1; r >= 0; r--) {
    const far = r / (ranges - 1);
    const baseY = y + h - h * 0.1 * (ranges - 1 - r);
    const peaks = 3 + Math.floor(rnd() * 5);
    let d = `M ${n2(x)} ${n2(baseY)}`;
    for (let p = 0; p <= peaks; p++) {
      const px = x + (w / peaks) * p;
      const ph = baseY - h * (0.16 + rnd() * 0.4) * (0.5 + far * 0.7);
      d += ` L ${n2(px - w / peaks / 2)} ${n2(ph)} L ${n2(px)} ${n2(baseY)}`;
    }
    d += ` L ${n2(x + w)} ${n2(y + h)} L ${n2(x)} ${n2(y + h)} Z`;
    out.push(
      `<path d="${d}" fill="${color}" opacity="${
        n2(0.14 + (1 - far) * 0.34)
      }"/>`,
    );
  }
  return out.join("\n");
};

/** 沢 — たまった水に広がる波紋 */
const marsh: Painter = ({ x, y, w, h }, rnd, color, accent) => {
  const out: string[] = [];
  const pools = 4 + Math.floor(rnd() * 4);
  for (let p = 0; p < pools; p++) {
    const cx = x + w * (0.15 + rnd() * 0.7);
    const cy = y + h * (0.2 + rnd() * 0.7);
    const rings = 5 + Math.floor(rnd() * 8);
    const rx = w * (0.1 + rnd() * 0.3);
    for (let i = 0; i < rings; i++) {
      const f = (i + 1) / rings;
      out.push(
        `<ellipse cx="${n2(cx)}" cy="${n2(cy)}" rx="${n2(rx * f)}" ry="${
          n2(rx * f * 0.32)
        }" fill="none" stroke="${i % 4 === 0 ? accent : color}" stroke-width="${
          n2(0.6 + rnd() * 2)
        }" opacity="${n2(0.4 - f * 0.25)}"/>`,
      );
    }
  }
  // 水面のきらめき
  for (let i = 0; i < 70; i++) {
    out.push(
      `<rect x="${n2(x + rnd() * w)}" y="${n2(y + rnd() * h)}" width="${
        n2(4 + rnd() * 26)
      }" height="1.4" fill="${accent}" opacity="${n2(0.1 + rnd() * 0.35)}"/>`,
    );
  }
  return out.join("\n");
};

const PAINTERS: Record<string, Painter> = {
  天: heaven,
  地: earth,
  水: water,
  火: fire,
  雷: thunder,
  風: wind,
  山: mountain,
  沢: marsh,
};

const oklch = (l: number, c: number, hue: number) =>
  `oklch(${n2(l)} ${n2(c)} ${Math.round(hue)})`;

/** 卦ごとの配色。紙のような明るい下地か、墨のような暗い下地かを種で選ぶ */
interface Palette {
  dark: boolean;
  bgTop: string;
  bgBottom: string;
  upperInk: string;
  upperAccent: string;
  upperMuted: string;
  lowerInk: string;
  lowerAccent: string;
  lowerMuted: string;
}

function palette(rnd: () => number, upper: Trigram, lower: Trigram): Palette {
  const dark = rnd() > 0.5;
  // 下地と描線の明度差を十分に取り、どちらの下地でも図が沈まないようにする
  const ink = dark ? 0.86 : 0.38;
  const inkChroma = dark ? 0.15 : 0.14;
  const accentL = dark ? 0.78 : 0.58;
  return {
    dark,
    bgTop: dark
      ? oklch(0.2 + rnd() * 0.05, 0.045, upper.hue)
      : oklch(0.95 - rnd() * 0.03, 0.022, upper.hue),
    bgBottom: dark
      ? oklch(0.14 + rnd() * 0.05, 0.05, lower.hue)
      : oklch(0.93 - rnd() * 0.04, 0.03, lower.hue),
    upperInk: oklch(ink, inkChroma, upper.hue),
    upperMuted: oklch(dark ? 0.62 : 0.55, 0.055, upper.hue),
    upperAccent: oklch(
      accentL,
      upper.hue > 130 && upper.hue < 180 ? 0.1 : 0.19,
      upper.hue,
    ),
    lowerInk: oklch(ink, inkChroma, lower.hue),
    lowerMuted: oklch(dark ? 0.62 : 0.55, 0.055, lower.hue),
    lowerAccent: oklch(
      accentL,
      lower.hue > 130 && lower.hue < 180 ? 0.1 : 0.19,
      lower.hue,
    ),
  };
}

/**
 * 構図を締める幾何形。卦ごとに種で選ばれ、同じ象の組でも印象が変わる。
 * 画面に一つだけ置き、抽象的な「窓」として機能させる。
 */
function window_(rnd: () => number, p: Palette): string {
  const kind = Math.floor(rnd() * 4);
  const stroke = p.dark ? oklch(0.95, 0.02, 90) : oklch(0.25, 0.02, 90);
  const op = p.dark ? 0.5 : 0.38;
  const cx = W * (0.3 + rnd() * 0.4);
  const cy = H * (0.3 + rnd() * 0.4);
  const r = W * (0.22 + rnd() * 0.18);
  if (kind === 0) {
    return `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${
      n2(r)
    }" fill="none" stroke="${stroke}" stroke-width="2.5" opacity="${op}"/>`;
  }
  if (kind === 1) {
    // 半円の弧。天地の境を跨がせて置く
    const a0 = rnd() * Math.PI * 2;
    const a1 = a0 + Math.PI * (0.6 + rnd() * 0.9);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `<path d="M ${n2(cx + Math.cos(a0) * r)} ${
      n2(cy + Math.sin(a0) * r)
    } A ${n2(r)} ${n2(r)} 0 ${large} 1 ${n2(cx + Math.cos(a1) * r)} ${
      n2(cy + Math.sin(a1) * r)
    }" fill="none" stroke="${stroke}" stroke-width="3" opacity="${op}"/>`;
  }
  if (kind === 2) {
    const w = r * (1.2 + rnd() * 0.8);
    const h = r * (1.2 + rnd() * 1.4);
    return `<rect x="${n2(cx - w / 2)}" y="${n2(cy - h / 2)}" width="${
      n2(w)
    }" height="${
      n2(h)
    }" fill="none" stroke="${stroke}" stroke-width="2" opacity="${op}"/>`;
  }
  // 画面を横切る一本の水平線
  const y = H * (0.25 + rnd() * 0.5);
  return `<line x1="${n2(W * 0.08)}" y1="${n2(y)}" x2="${n2(W * 0.92)}" y2="${
    n2(y)
  }" stroke="${stroke}" stroke-width="2" opacity="${op}"/>`;
}

function render(
  n: number,
  lower: Trigram,
  upper: Trigram,
  glyph: string,
  name: string,
): string {
  const rnd = rng(n * 2654435761);
  const p = palette(rnd, upper, lower);

  // 天地の境目の高さを卦ごとにずらし、構図が一様にならないようにする
  const split = 0.34 + rnd() * 0.3;
  const seam = H * split;
  // 境目をぼかすため、上下の帯を互いに食い込ませて描く
  const feather = H * (0.04 + rnd() * 0.04);
  const upperBand: Band = { x: 0, y: 0, w: W, h: seam + feather };
  const lowerBand: Band = {
    x: 0,
    y: seam - feather,
    w: W,
    h: H - seam + feather,
  };

  // 山・地・火は広い面を塗るため、線で描く象より彩度を落とした色を渡す
  const FILLED = new Set(["山", "地", "火"]);
  const upperArt = PAINTERS[upper.image](
    upperBand,
    rnd,
    FILLED.has(upper.image) ? p.upperMuted : p.upperInk,
    p.upperAccent,
  );
  const lowerArt = PAINTERS[lower.image](
    lowerBand,
    rnd,
    FILLED.has(lower.image) ? p.lowerMuted : p.lowerInk,
    p.lowerAccent,
  );

  const f0 = (seam - feather) / H;
  const f1 = (seam + feather) / H;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${name}のイメージ">
  <title>${name}（第${n}卦 ${glyph}）</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.bgTop}"/>
      <stop offset="100%" stop-color="${p.bgBottom}"/>
    </linearGradient>
    <linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
      <stop offset="${n2(f0 * 100)}%" stop-color="#fff"/>
      <stop offset="${n2(f1 * 100)}%" stop-color="#000"/>
    </linearGradient>
    <linearGradient id="fadeUp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="${n2(f0 * 100)}%" stop-color="#000"/>
      <stop offset="${n2(f1 * 100)}%" stop-color="#fff"/>
    </linearGradient>
    <mask id="maskUpper"><rect width="${W}" height="${H}" fill="url(#fadeDown)"/></mask>
    <mask id="maskLower"><rect width="${W}" height="${H}" fill="url(#fadeUp)"/></mask>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${n}"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    <clipPath id="frame"><rect width="${W}" height="${H}"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g clip-path="url(#frame)">
    <g mask="url(#maskUpper)">
${upperArt}
    </g>
    <g mask="url(#maskLower)">
${lowerArt}
    </g>
    ${window_(rnd, p)}
  </g>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="${
    p.dark ? 0.12 : 0.09
  }" style="mix-blend-mode:overlay"/>
</svg>
`;
}

await Deno.mkdir(OUT, { recursive: true });
for (const h of HEXAGRAMS) {
  const svg = render(h.n, h.lower, h.upper, h.glyph, h.name);
  const file = new URL(`${String(h.n).padStart(2, "0")}.svg`, OUT);
  await Deno.writeTextFile(file, svg);
}
console.log(`${HEXAGRAMS.length} 枚の卦象画を ${OUT.pathname} に生成しました`);
