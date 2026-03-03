/** ISO 8601 を放映開始日・時間表示用にフォーマット（日本時間） */
export function formatStartedAt(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = d.toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return { date, time };
}
