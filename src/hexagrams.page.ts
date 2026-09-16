import type { Hexagram } from "./_lib/hexagram.ts";

/** 六十四卦それぞれのページを生成する。レイアウトは卦ごとに異なる */
export default function* (data: { hexagrams: Hexagram[] }) {
  for (const hexagram of data.hexagrams) {
    yield {
      url: hexagram.url,
      title: `${hexagram.name} 第${hexagram.n}卦 | 易 六十四卦`,
      description: hexagram.summary,
      layout: `layouts/variants/${hexagram.layout}.vto`,
      hexagram,
    };
  }
}
