import { TRIGRAMS } from "../_lib/trigrams.ts";

/** 先天八卦の順（乾兌離震巽坎艮坤）。方陣の行と列はこの並びで組む */
export default [
  "111",
  "110",
  "101",
  "100",
  "011",
  "010",
  "001",
  "000",
].map((bits) => TRIGRAMS[bits]);
