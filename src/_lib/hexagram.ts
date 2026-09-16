import { HEXAGRAM_DATA } from "./hexagram-data.ts";
import { type Trigram, TRIGRAMS } from "./trigrams.ts";
import type { RawHexagram } from "./types.ts";

/** 一本の爻 */
export interface Line {
  /** 下から数えた位置（1〜6） */
  position: number;
  /** 陽爻なら true */
  yang: boolean;
  /** 初・二・三・四・五・上 に陰陽を添えた爻の呼び名 */
  label: string;
}

/** テンプレートに渡す、導出済みの値を含む卦 */
export interface Hexagram extends RawHexagram {
  /** Unicode の卦記号（U+4DC0〜U+4DFF） */
  glyph: string;
  /** ページの URL */
  url: string;
  /** 下から上へ並べた爻 */
  lines: Line[];
  lower: Trigram;
  upper: Trigram;
  /** 錯卦（全爻を陰陽反転した卦）の番号 */
  opposite: number;
  /** 綜卦（上下をひっくり返した卦）の番号 */
  inverse: number;
  /** 互卦（二〜五爻から組み立てた卦）の番号 */
  nuclear: number;
  /** 序卦伝の順で前後の卦 */
  prev: number;
  next: number;
}

const POSITION_NAMES = ["初", "二", "三", "四", "五", "上"];

/** 爻から卦番号を引くための表 */
const BY_BINARY = new Map(HEXAGRAM_DATA.map((h) => [h.binary, h.n]));

function lookup(binary: string): number {
  const n = BY_BINARY.get(binary);
  if (n === undefined) throw new Error(`爻 ${binary} に対応する卦がありません`);
  return n;
}

function toLines(binary: string): Line[] {
  return [...binary].map((bit, i) => {
    const yang = bit === "1";
    // 爻の呼び名は、初爻と上爻だけ数字ではなく初・上を使う
    const name = POSITION_NAMES[i];
    return {
      position: i + 1,
      yang,
      label: i === 0 || i === 5
        ? `${name}${yang ? "九" : "六"}`
        : `${yang ? "九" : "六"}${name}`,
    };
  });
}

function enrich(raw: RawHexagram): Hexagram {
  const { binary, n } = raw;
  return {
    ...raw,
    glyph: String.fromCodePoint(0x4dc0 + n - 1),
    url: `/hexagrams/${n}/`,
    lines: toLines(binary),
    lower: TRIGRAMS[binary.slice(0, 3)],
    upper: TRIGRAMS[binary.slice(3)],
    opposite: lookup([...binary].map((b) => (b === "1" ? "0" : "1")).join("")),
    inverse: lookup([...binary].reverse().join("")),
    // 互卦は二〜四爻を下卦、三〜五爻を上卦とする
    nuclear: lookup(binary.slice(1, 4) + binary.slice(2, 5)),
    prev: n === 1 ? 64 : n - 1,
    next: n === 64 ? 1 : n + 1,
  };
}

export const HEXAGRAMS: Hexagram[] = HEXAGRAM_DATA.map(enrich);

export function getHexagram(n: number): Hexagram {
  const h = HEXAGRAMS[n - 1];
  if (!h) throw new Error(`第${n}卦は存在しません`);
  return h;
}
