/**
 * Annict の放映局名を「全国ネット＋TOKYO MX」「地方局」「その他放送」に分類する
 * キーワードは Annict で使われている表記に合わせて調整可能
 */

export type ChannelCategoryKey = "national" | "local" | "other";

export interface ChannelCategory {
  key: ChannelCategoryKey;
  label: string;
}

export const CHANNEL_CATEGORIES: Record<ChannelCategoryKey, ChannelCategory> = {
  national: { key: "national", label: "全国ネット＋TOKYO MX" },
  local: { key: "local", label: "地方局" },
  other: { key: "other", label: "その他放送" },
};

/** 全国ネット＋TOKYO MX とみなすキーワード（チャンネル名に含まれていれば national） */
const NATIONAL_KEYWORDS = [
  "日本テレビ",
  "NTV",
  "TBS",
  "テレビ朝日",
  "TV朝日",
  "フジテレビ",
  "フジ",
  "テレビ東京",
  "テレ東",
  "TV東京",
  "TOKYO MX",
  "東京MX",
  "MX",
  "NHK総合",
  "NHK Eテレ",
  "NHK教育",
  "NHK・総合",
  "NHK・Eテレ",
];

/** その他放送とみなすキーワード（BS/CS/配信系） */
const OTHER_KEYWORDS = [
  "BS",
  "CS",
  "アニマックス",
  "アニメシアター",
  "キッズステーション",
  "dアニメ",
  "dアニメストア",
  "Abema",
  "ABEMA",
  "Netflix",
  "Amazon",
  "U-NEXT",
  "バンダイチャンネル",
  "YouTube",
  "Youtube",
  "配信",
  "ネット",
  "Disney",
  "ディズニー",
  "Hulu",
  "ひかりTV",
  "テレ朝",
  "BS日テレ",
  "BSフジ",
  "BS11",
  "WOWOW",
  "AT-X",
  "ニコニコ",
  "ニコニコ動画",
];

/**
 * チャンネル名から分類を返す
 * 順序: 全国ネット → その他 → 地方局（どれにも当てはまらなければ地方局）
 */
export function getChannelCategory(channelName: string): ChannelCategoryKey {
  const name = channelName.trim();
  const inNational = NATIONAL_KEYWORDS.some((kw) => name.includes(kw));
  if (inNational) return "national";
  const inOther = OTHER_KEYWORDS.some((kw) => name.includes(kw));
  if (inOther) return "other";
  return "local";
}

/** チャンネル名の配列を分類ごとにグループ化（表示順: national → local → other） */
export function groupChannelsByCategory(
  channelNames: string[]
): Record<ChannelCategoryKey, string[]> {
  const order: ChannelCategoryKey[] = ["national", "local", "other"];
  const grouped: Record<ChannelCategoryKey, string[]> = {
    national: [],
    local: [],
    other: [],
  };
  for (const name of channelNames) {
    const cat = getChannelCategory(name);
    grouped[cat].push(name);
  }
  for (const key of order) {
    grouped[key].sort();
  }
  return grouped;
}
