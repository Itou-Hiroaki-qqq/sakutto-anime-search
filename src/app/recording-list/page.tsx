"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SeasonProgramRow } from "@/lib/annict";
import { formatStartedAt } from "@/lib/format";

const STORAGE_KEY = "recording-list";

export default function RecordingListPage() {
  const [items, setItems] = useState<SeasonProgramRow[] | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setItems([]);
      return;
    }
    try {
      const data = JSON.parse(raw) as { items: SeasonProgramRow[] };
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    }
  }, []);

  function handlePrint() {
    window.print();
  }

  if (items === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-base-200 p-8">
        <p className="text-base-content/70">録画表のデータがありません。</p>
        <Link href="/" className="btn btn-primary">
          一覧ページに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 print:bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-base-content">録画表</h1>
          <div className="flex gap-2 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-primary"
            >
              この内容で印刷
            </button>
            <Link href="/" className="btn btn-ghost">
              一覧に戻る
            </Link>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl print:shadow-none">
          <div className="card-body">
            <p className="mb-4 text-sm text-base-content/70 print:mb-2">
              {items.length}件の作品
            </p>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>作品名</th>
                    <th>放映局</th>
                    <th>放映開始日</th>
                    <th>時間</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, i) => {
                    const { date, time } = formatStartedAt(row.startedAt);
                    return (
                      <tr
                        key={`${row.title}-${row.channelName}-${row.startedAt}-${i}`}
                      >
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
          </div>
        </div>
      </div>
    </div>
  );
}
