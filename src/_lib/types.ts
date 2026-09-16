import type { Layout } from "./layouts.ts";

/** データファイルに直接書く生の卦データ */
export interface RawHexagram {
  /** 序卦伝の番号（1〜64） */
  n: number;
  /** 卦名（一〜二字） */
  kanji: string;
  /** 象を冠した通称。例: 水雷屯 */
  name: string;
  /** 通称の読み */
  reading: string;
  /** 英訳名（Wilhelm 訳に準拠） */
  english: string;
  /** 下から上へ並べた 6 爻。"1" が陽爻 */
  binary: string;
  /** 卦辞（原文） */
  judgment: string;
  /** 卦辞の現代語訳 */
  judgmentJa: string;
  /** 一行で言うと */
  summary: string;
  /** 三つのキーワード */
  keywords: [string, string, string];
  /** 現代語の解説（段落ごと） */
  commentary: string[];
  /** ページのレイアウト種別 */
  layout: Layout;
}
