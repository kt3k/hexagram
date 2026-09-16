# 易 六十四卦

易経の六十四卦を一卦ずつ読むためのサイトです。各ページには卦辞（原文）と
その現代語訳、現代の言葉による解説、そして卦の気配を映した抽象画を置いて
います。ページの構成は卦ごとに変えてありますが、卦の形と名称だけは
どのページでも同じ位置から読み取れるようにしています。

- フレームワーク: [Lume](https://lume.land/)（Deno）
- UI: [Basecoat UI](https://basecoatui.com/) + Tailwind CSS v4
- 配信: GitHub Pages

## 使い方

```sh
deno task serve    # 開発用サーバを立てる
deno task build    # _site に組み立てる
deno task check    # 型を確認する
deno task validate # 六十四卦のデータを検査する
deno fmt           # 書式を整える
```

## 構成

```
_config.ts                     Lume の設定
src/
  _lib/                        卦のデータと導出（ページにはならない）
    types.ts                   生データの型
    trigrams.ts                八卦の定義
    hexagram-data.ts           六十四卦の卦辞・訳・解説
    hexagram.ts                爻から上下卦・錯綜互などを導出する
    layouts.ts                 レイアウト種別の一覧
  _data/                       テンプレートから見えるデータ
  _components/                 卦象・卦名・卦辞などの部品
  _includes/layouts/
    base.vto                   共通の外枠。上部バーに卦の形と名を出す
    variants/*.vto             卦ごとに使い分ける 16 種のレイアウト
  _vendor/basecoat.css         取りこんだ Basecoat（生成物・編集しない）
  hexagrams.page.ts            六十四卦のページを生成する
  index.vto                    一覧ページ
  img/hexagrams/               卦象画（生成物）
scripts/
  gen-art.ts                   卦象画を生成する
  gen-ai-images.ts             画像生成 API で卦の絵をつくる
  validate-data.ts             データの自己検査
  vendor-basecoat.ts           Basecoat の CSS を取りこむ
```

## 卦のデータを直す

卦辞・訳・解説は `src/_lib/hexagram-data.ts` にまとまっています。直したら
`deno task validate` を走らせてください。番号と爻の対応、爻の重複、卦名が
上下の八卦と合っているか、レイアウトがすべて使われているかを検査します。

## 卦象画

`deno task art` で `src/img/hexagrams/` に 64 枚の SVG を生成します。
上卦・下卦それぞれの象（天地水火雷風山沢）に対応する描画関数を上下に配し、
卦番号を種にした乱数で構図・配色・境目の高さを決めているため、
同じ絵は二つとありません。生成結果は種で決まるので、何度走らせても同じです。

### AI で生成した画像に差し替える

画像生成 API を使って絵を作り直すこともできます。

```sh
deno task ai-images -- --dry-run          # 指示文だけ確認する
IMAGE_API_KEY=xxx deno task ai-images     # まだ無い卦を生成する
IMAGE_API_KEY=xxx deno task ai-images -- --only 1,2,3
```

`src/img/hexagrams/ai/` に置かれた画像は、ビルド時に自動で SVG より優先して
使われます。一部の卦だけ差し替えることもできます。エンドポイントは既定で OpenAI
互換の `images/generations` ですが、`IMAGE_API_URL` と `IMAGE_MODEL`
で変えられます。

## Basecoat の取りこみについて

Lume の tailwindcss プラグインは、CDN 上の CSS に含まれる相対 `@import` を
解決できません。そのため `scripts/vendor-basecoat.ts` で Basecoat の Tailwind
ソース CSS を 1 ファイルに束ね、`src/_vendor/basecoat.css` として
同梱しています。更新するときは次を実行します。

```sh
deno task vendor:basecoat
```

## 出典

卦辞は通行本『周易』によります。現代語訳と解説はこのサイトによるもので、
特定の注釈書の翻訳ではありません。
