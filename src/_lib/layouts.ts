/**
 * 卦ページのレイアウト種別。
 * 卦ごとに構成をがらりと変えるための骨格で、_includes/layouts/variants/ に
 * 同名のテンプレートが対応する。
 */
export const LAYOUTS = [
  "monolith",
  "minimal",
  "split",
  "journal",
  "overlay",
  "ledger",
  "grid",
  "orbit",
  "poster",
  "diagonal",
  "duotone",
  "frame",
  "scroll",
  "terminal",
  "zen",
  "stack",
] as const;

export type Layout = typeof LAYOUTS[number];
