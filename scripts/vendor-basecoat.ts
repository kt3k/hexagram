/**
 * Basecoat UI の Tailwind ソース CSS を npm から取得し、
 * @import を展開した 1 ファイルに束ねて src/_vendor/basecoat.css に書き出す。
 *
 * Lume の tailwindcss プラグインは CDN 経由の CSS に含まれる相対 @import を
 * 解決できないため、あらかじめ 1 ファイルへ平坦化して同梱している。
 *
 *   deno task vendor:basecoat
 */
import { dirname, join, normalize } from "@std/path";

const PACKAGE = "basecoat-css";
const VERSION = "1.0.2";
/** 束ねる起点。テーマは vega（Basecoat の既定テーマ）。 */
const ENTRY = "dist/basecoat.css";
const OUT = new URL("../src/_vendor/basecoat.css", import.meta.url);

const base = `https://cdn.jsdelivr.net/npm/${PACKAGE}@${VERSION}/`;
const seen = new Set<string>();

async function inline(path: string): Promise<string> {
  const clean = normalize(path);
  if (seen.has(clean)) return "";
  seen.add(clean);

  const res = await fetch(base + clean);
  if (!res.ok) {
    throw new Error(`${base}${clean} の取得に失敗しました: ${res.status}`);
  }
  const css = await res.text();

  const out: string[] = [];
  for (const line of css.split("\n")) {
    const m = line.match(/^\s*@import\s+["']([^"']+)["']\s*;/);
    if (m && m[1].startsWith(".")) {
      out.push(await inline(join(dirname(clean), m[1])));
    } else {
      out.push(line);
    }
  }
  return out.join("\n");
}

const banner = `/*!
 * Basecoat UI ${VERSION} — https://basecoatui.com (MIT License)
 * scripts/vendor-basecoat.ts が生成したファイルです。直接編集しないでください。
 */
`;

const bundled = banner + await inline(ENTRY);
await Deno.writeTextFile(OUT, bundled);
console.log(
  `${seen.size} ファイルを束ねて ${bundled.length} バイトを書き出しました`,
);
