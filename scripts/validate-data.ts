/**
 * 六十四卦データの自己検査。
 * 番号・爻・卦名・レイアウト種別の整合と、本文への異言語混入を検査する。
 *
 *   deno task validate
 */
import { HEXAGRAM_DATA } from "../src/_lib/hexagram-data.ts";
import { TRIGRAMS } from "../src/_lib/trigrams.ts";
import { LAYOUTS } from "../src/_lib/layouts.ts";

const errors: string[] = [];
const fail = (n: number, msg: string) => errors.push(`第${n}卦: ${msg}`);

if (HEXAGRAM_DATA.length !== 64) {
  errors.push(`卦の数が 64 ではありません: ${HEXAGRAM_DATA.length}`);
}

const seenBinary = new Map<string, number>();
const layoutUse = new Map<string, number>();

HEXAGRAM_DATA.forEach((h, i) => {
  if (h.n !== i + 1) fail(h.n, `序卦伝の番号が並びと一致しません（索引 ${i}）`);

  if (!/^[01]{6}$/.test(h.binary)) {
    fail(h.n, `爻の表記が不正です: ${h.binary}`);
    return;
  }
  const dup = seenBinary.get(h.binary);
  if (dup !== undefined) fail(h.n, `第${dup}卦と爻が重複しています`);
  seenBinary.set(h.binary, h.n);

  const lower = TRIGRAMS[h.binary.slice(0, 3)];
  const upper = TRIGRAMS[h.binary.slice(3)];
  if (!lower || !upper) {
    fail(h.n, "八卦に分解できません");
    return;
  }

  // 卦名は「上卦の象＋下卦の象＋卦名」。八純卦だけは「◯為◯」と呼ぶ。
  const expected = upper.bits === lower.bits
    ? `${upper.kanji}為${upper.image}`
    : `${upper.image}${lower.image}${h.kanji}`;
  if (h.name !== expected) {
    fail(h.n, `卦名が爻と一致しません: ${h.name} ではなく ${expected} のはず`);
  }

  if (!LAYOUTS.includes(h.layout)) fail(h.n, `未知のレイアウト: ${h.layout}`);
  layoutUse.set(h.layout, (layoutUse.get(h.layout) ?? 0) + 1);

  if (h.keywords.length !== 3) fail(h.n, "キーワードは 3 つ必要です");
  if (h.commentary.length < 2) fail(h.n, "解説は 2 段落以上必要です");

  // 日本語の本文にラテン文字やキリル文字が紛れこんでいないか
  const japanese = [h.judgmentJa, h.summary, ...h.keywords, ...h.commentary];
  for (const text of japanese) {
    const stray = text.match(/[A-Za-zЀ-ӿ가-힯]+/g);
    if (stray) fail(h.n, `本文に異言語が混入しています: ${stray.join(", ")}`);
  }
});

for (const layout of LAYOUTS) {
  if (!layoutUse.has(layout)) errors.push(`未使用のレイアウト: ${layout}`);
}

if (errors.length > 0) {
  console.error(`${errors.length} 件の問題が見つかりました:`);
  for (const e of errors) console.error(`  - ${e}`);
  Deno.exit(1);
}
console.log(
  `六十四卦すべて検査しました（レイアウト ${layoutUse.size} 種）。問題はありません。`,
);
