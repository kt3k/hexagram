/** 八卦（三爻）の定義。bits は下から上へ並べた 3 爻で、"1" が陽爻。 */
export interface Trigram {
  bits: string;
  kanji: string;
  reading: string;
  /** 象（自然界の対応物）。卦名にもこの字が使われる */
  image: string;
  /** 徳・はたらき */
  attribute: string;
  /** 家族の象 */
  family: string;
  /** 方位（後天定位） */
  direction: string;
  /** このサイトで使う象徴色（OKLCH の色相角） */
  hue: number;
}

export const TRIGRAMS: Record<string, Trigram> = {
  "111": {
    bits: "111",
    kanji: "乾",
    reading: "けん",
    image: "天",
    attribute: "健やか・創造",
    family: "父",
    direction: "北西",
    hue: 85,
  },
  "110": {
    bits: "110",
    kanji: "兌",
    reading: "だ",
    image: "沢",
    attribute: "悦び・談笑",
    family: "少女",
    direction: "西",
    hue: 195,
  },
  "101": {
    bits: "101",
    kanji: "離",
    reading: "り",
    image: "火",
    attribute: "明らか・附着",
    family: "中女",
    direction: "南",
    hue: 35,
  },
  "100": {
    bits: "100",
    kanji: "震",
    reading: "しん",
    image: "雷",
    attribute: "動く・奮い立つ",
    family: "長男",
    direction: "東",
    hue: 300,
  },
  "011": {
    bits: "011",
    kanji: "巽",
    reading: "そん",
    image: "風",
    attribute: "入る・従う",
    family: "長女",
    direction: "南東",
    hue: 160,
  },
  "010": {
    bits: "010",
    kanji: "坎",
    reading: "かん",
    image: "水",
    attribute: "陥る・険しい",
    family: "中男",
    direction: "北",
    hue: 250,
  },
  "001": {
    bits: "001",
    kanji: "艮",
    reading: "ごん",
    image: "山",
    attribute: "止まる・とどまる",
    family: "少男",
    direction: "北東",
    hue: 120,
  },
  "000": {
    bits: "000",
    kanji: "坤",
    reading: "こん",
    image: "地",
    attribute: "順う・受けいれる",
    family: "母",
    direction: "南西",
    hue: 60,
  },
};

export default TRIGRAMS;
