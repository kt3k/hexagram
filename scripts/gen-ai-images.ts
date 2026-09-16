/**
 * 卦の絵を画像生成 API でつくり、src/img/hexagrams/ai/ に保存する。
 *
 * ここに置かれた画像は、ビルド時に scripts/gen-art.ts の SVG より優先して
 * 使われる（src/_lib/hexagram.ts の pickImage を参照）。一部の卦だけ
 * 差し替えることもできる。
 *
 * 必要な環境変数:
 *   IMAGE_API_KEY   画像生成 API の鍵（必須）
 *   IMAGE_API_URL   エンドポイント。既定は OpenAI 互換の images/generations
 *   IMAGE_MODEL     モデル名。既定は gpt-image-1
 *
 * 使い方:
 *   IMAGE_API_KEY=xxx deno task ai-images              # 未生成の卦すべて
 *   IMAGE_API_KEY=xxx deno task ai-images -- --only 1,2,3
 *   IMAGE_API_KEY=xxx deno task ai-images -- --force   # 生成済みも作り直す
 *   deno task ai-images -- --dry-run                   # 指示文だけ確認する
 */
import { parseArgs } from "@std/cli/parse-args";
import { HEXAGRAMS } from "../src/_lib/hexagram.ts";
import type { Hexagram } from "../src/_lib/hexagram.ts";

const OUT = new URL("../src/img/hexagrams/ai/", import.meta.url);

const flags = parseArgs(Deno.args, {
  string: ["only"],
  boolean: ["force", "dry-run"],
});

const API_URL = Deno.env.get("IMAGE_API_URL") ??
  "https://api.openai.com/v1/images/generations";
const API_KEY = Deno.env.get("IMAGE_API_KEY");
const MODEL = Deno.env.get("IMAGE_MODEL") ?? "gpt-image-1";

/** 八卦の象を、画像生成に通じる情景の言葉に置きかえる */
const SCENERY: Record<string, string> = {
  天: "an open sky of layered light, vast and weightless",
  地: "level ground in broad horizontal strata, heavy and still",
  水: "moving water in repeating currents, deep and unsettled",
  火: "rising flame and radiance, sharp and luminous",
  雷: "a fracture of lightning across the dark, sudden and electric",
  風: "long streams of wind threading through space, soft and pervasive",
  山: "receding ridgelines fading into haze, immovable and quiet",
  沢: "a still pool spreading in rings, open and reflective",
};

/** 一つの卦から、画像生成に渡す指示文を組み立てる */
function buildPrompt(h: Hexagram): string {
  return [
    `An abstract painting for hexagram ${h.n} of the I Ching, ${h.name} (${h.english}).`,
    `The upper half evokes ${SCENERY[h.upper.image]}.`,
    `The lower half evokes ${SCENERY[h.lower.image]}.`,
    `The two meet at a soft horizon rather than a hard edge.`,
    `Mood: ${h.keywords.join(", ")}.`,
    `Style: contemplative abstract art in the spirit of East Asian ink painting`,
    `crossed with modern risograph printing — layered translucent washes,`,
    `visible paper grain, a restrained palette of two or three muted tones,`,
    `generous empty space.`,
    `Absolutely no text, letters, characters, numerals, symbols, figures,`,
    `faces, or recognisable objects. Pure abstraction.`,
    `Vertical composition.`,
  ].join(" ");
}

/** API の応答から画像のバイト列を取り出す。base64 でも URL でも受ける */
async function extractImage(payload: unknown): Promise<Uint8Array> {
  const entry = (payload as { data?: { b64_json?: string; url?: string }[] })
    ?.data?.[0];
  if (entry?.b64_json) {
    return Uint8Array.from(atob(entry.b64_json), (c) => c.charCodeAt(0));
  }
  if (entry?.url) {
    const res = await fetch(entry.url);
    if (!res.ok) throw new Error(`画像の取得に失敗しました: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  throw new Error(
    `応答から画像を取り出せませんでした: ${
      JSON.stringify(payload).slice(0, 200)
    }`,
  );
}

async function generate(h: Hexagram, prompt: string): Promise<Uint8Array> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      n: 1,
      size: "1024x1024",
    }),
  });
  if (!res.ok) {
    throw new Error(
      `第${h.n}卦の生成に失敗しました（${res.status}）: ${
        (await res.text()).slice(0, 300)
      }`,
    );
  }
  return await extractImage(await res.json());
}

const only = flags.only
  ? new Set(flags.only.split(",").map((s) => Number(s.trim())))
  : null;
const targets = HEXAGRAMS.filter((h) => !only || only.has(h.n));

if (flags["dry-run"]) {
  for (const h of targets) {
    console.log(`--- 第${h.n}卦 ${h.name}\n${buildPrompt(h)}\n`);
  }
  Deno.exit(0);
}

if (!API_KEY) {
  console.error(
    "IMAGE_API_KEY が設定されていません。指示文だけ見るなら --dry-run を付けてください。",
  );
  Deno.exit(1);
}

await Deno.mkdir(OUT, { recursive: true });

let made = 0;
let skipped = 0;
for (const h of targets) {
  const file = new URL(`${String(h.n).padStart(2, "0")}.png`, OUT);
  if (!flags.force) {
    try {
      await Deno.stat(file);
      skipped++;
      continue;
    } catch {
      // まだ無いので生成する
    }
  }
  console.log(`第${h.n}卦 ${h.name} を生成しています…`);
  const bytes = await generate(h, buildPrompt(h));
  await Deno.writeFile(file, bytes);
  made++;
}

console.log(`${made} 枚を生成し、${skipped} 枚は既にあるので飛ばしました。`);
console.log("画像を置いたら deno task build で反映されます。");
