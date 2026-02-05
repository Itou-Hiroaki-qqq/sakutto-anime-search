"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SeasonProgramRow } from "@/lib/annict";
import { SEASON_LABELS, type SeasonSlug } from "@/lib/annict";
import {
  CHANNEL_CATEGORIES,
  groupChannelsByCategory,
  type ChannelCategoryKey,
} from "@/lib/channelCategories";

const SEASON_OPTIONS: { value: SeasonSlug; label: string }[] = [
  { value: "spring", label: "春アニメ（4~6月）" },
  { value: "summer", label: "夏アニメ（7~9月）" },
  { value: "autumn", label: "秋アニメ（10~12月）" },
  { value: "winter", label: "冬アニメ（1~3月）" },
];

/** ISO 8601 を 放映開始日・時間表示用にフォーマット（日本時間） */
function formatStartedAt(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const jst = new Date(d.getTime() + (d.getTimezoneOffset() + 9 * 60) * 60 * 1000);
  const date = jst.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = jst.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return { date, time };
}

export default function Home() {
  const [year, setYear] = useState(() => new Date().getFullYear().toString());
  const [season, setSeason] = useState<SeasonSlug>("spring");
  const [rows, setRows] = useState<SeasonProgramRow[] | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(
    new Set()
  );
  const [selectedWorks, setSelectedWorks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function rowKey(row: SeasonProgramRow): string {
    return `${row.title}|${row.channelName}|${row.startedAt}`;
  }

  function toggleWork(row: SeasonProgramRow) {
    const key = rowKey(row);
    setSelectedWorks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAllWorks() {
    setSelectedWorks(new Set(filteredRows.map((r) => rowKey(r))));
  }

  function clearWorks() {
    setSelectedWorks(new Set());
  }

  function handleCreateRecordingList() {
    const items = filteredRows.filter((r) => selectedWorks.has(rowKey(r)));
    if (items.length === 0) return;
    sessionStorage.setItem(
      "recording-list",
      JSON.stringify({ items, createdAt: new Date().toISOString() })
    );
    router.push("/recording-list");
  }
  const [error, setError] = useState<string | null>(null);

  const rawRows = rows ?? [];
  const channelNames = [...new Set(rawRows.map((r) => r.channelName))].sort();
  const channelsByCategory = groupChannelsByCategory(channelNames);
  const categoryOrder: ChannelCategoryKey[] = ["national", "local", "other"];
  const hasChannelFilter = selectedChannels.size > 0;
  const filteredRows = hasChannelFilter
    ? rawRows.filter((r) => selectedChannels.has(r.channelName))
    : rawRows;

  function toggleChannel(name: string) {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function selectAllChannels() {
    setSelectedChannels(new Set(channelNames));
  }

  function clearChannelFilter() {
    setSelectedChannels(new Set());
  }

  function selectCategory(key: ChannelCategoryKey) {
    setSelectedChannels(
      (prev) => new Set([...prev, ...channelsByCategory[key]])
    );
  }

  function clearCategory(key: ChannelCategoryKey) {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      channelsByCategory[key].forEach((name) => next.delete(name));
      return next;
    });
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setRows(null);
    try {
      const params = new URLSearchParams({ year, season });
      const res = await fetch(`/api/season?${params}`);
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "取得に失敗しました");
        return;
      }
      setRows(data.rows);
      setSelectedChannels(new Set());
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-base-200">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <form onSubmit={handleSearch} className="card mb-8 bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-wrap items-end gap-4">
              <div className="form-control w-full max-w-[140px]">
                <label className="label" htmlFor="year">
                  <span className="label-text">年（西暦）</span>
                </label>
                <input
                  id="year"
                  type="number"
                  min={1970}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="2024"
                  required
                />
              </div>
              <div className="form-control w-full max-w-[200px]">
                <label className="label" htmlFor="season">
                  <span className="label-text">シーズン</span>
                </label>
                <select
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value as SeasonSlug)}
                  className="select select-bordered w-full"
                >
                  {SEASON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "検索中…" : "検索"}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {rows && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="card-title text-lg">
                  {year}年 {SEASON_LABELS[season]} の放映一覧
                  <span className="badge badge-ghost ml-2">
                    {filteredRows.length}件
                    {hasChannelFilter && ` / 全${rawRows.length}件`}
                  </span>
                </h2>
              </div>
              <div className="rounded-lg bg-base-200/50 p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="label-text font-medium">
                    放映局で絞り込み（複数選択可）
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={selectAllChannels}
                      className="btn btn-ghost btn-xs"
                    >
                      全選択
                    </button>
                    <button
                      type="button"
                      onClick={clearChannelFilter}
                      className="btn btn-ghost btn-xs"
                    >
                      解除
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {categoryOrder.map((key) => {
                    const list = channelsByCategory[key];
                    if (list.length === 0) return null;
                    const cat = CHANNEL_CATEGORIES[key];
                    const allSelected = list.every((n) =>
                      selectedChannels.has(n)
                    );
                    const someSelected = list.some((n) =>
                      selectedChannels.has(n)
                    );
                    return (
                      <div key={key} className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-base-content/80">
                            {cat.label}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              allSelected
                                ? clearCategory(key)
                                : selectCategory(key)
                            }
                            className="btn btn-ghost btn-xs"
                          >
                            {allSelected ? "解除" : "全選択"}
                          </button>
                          {someSelected && !allSelected && (
                            <button
                              type="button"
                              onClick={() => clearCategory(key)}
                              className="btn btn-ghost btn-xs opacity-70"
                            >
                              この分類を解除
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {list.map((name) => (
                            <label
                              key={name}
                              className="flex cursor-pointer items-center gap-1.5"
                            >
                              <input
                                type="checkbox"
                                checked={selectedChannels.has(name)}
                                onChange={() => toggleChannel(name)}
                                className="checkbox checkbox-sm checkbox-primary"
                              />
                              <span className="text-sm">{name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="w-10">
                        {filteredRows.length > 0 && (
                          <label className="flex cursor-pointer items-center gap-1">
                            <input
                              type="checkbox"
                              checked={
                                filteredRows.length > 0 &&
                                filteredRows.every((r) =>
                                  selectedWorks.has(rowKey(r))
                                )
                              }
                              onChange={(e) => {
                                if (e.target.checked)
                                  selectAllWorks();
                                else clearWorks();
                              }}
                              className="checkbox checkbox-sm checkbox-primary"
                            />
                            <span className="sr-only">全選択</span>
                          </label>
                        )}
                      </th>
                      <th>作品名</th>
                      <th>放映局</th>
                      <th>放映開始日</th>
                      <th>時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => {
                      const { date, time } = formatStartedAt(row.startedAt);
                      const key = rowKey(row);
                      return (
                        <tr key={`${row.title}-${row.channelName}-${row.startedAt}-${i}`}>
                          <td>
                            <label className="flex cursor-pointer items-center">
                              <input
                                type="checkbox"
                                checked={selectedWorks.has(key)}
                                onChange={() => toggleWork(row)}
                                className="checkbox checkbox-sm checkbox-primary"
                              />
                            </label>
                          </td>
                          <td className="font-medium">{row.title}</td>
                          <td>{row.channelName}</td>
                          <td>{date}</td>
                          <td>{time}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredRows.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateRecordingList}
                    disabled={selectedWorks.size === 0}
                    className="btn btn-primary"
                  >
                    録画表の作成（{selectedWorks.size}件）
                  </button>
                </div>
              )}
              {filteredRows.length === 0 && (
                <p className="text-base-content/70">
                  {rawRows.length === 0
                    ? "このシーズンの放映情報はありません。"
                    : "選択した放映局の放映はありません。"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
