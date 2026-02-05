import { NextRequest, NextResponse } from "next/server";
import {
  fetchSeasonPrograms,
  toSeasonSlug,
  type SeasonProgramRow,
} from "@/lib/annict";

export type SeasonApiResponse =
  | { ok: true; rows: SeasonProgramRow[] }
  | { ok: false; error: string };

/**
 * GET /api/season?year=2024&season=autumn
 * 指定シーズンのアニメ放映一覧を返す（放映開始日時の早い順）
 */
export async function GET(request: NextRequest) {
  const token = process.env.ANNICT_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json<SeasonApiResponse>(
      { ok: false, error: "ANNICT_ACCESS_TOKEN が設定されていません。" },
      { status: 500 }
    );
  }

  const yearStr = request.nextUrl.searchParams.get("year");
  const seasonParam = request.nextUrl.searchParams.get("season");

  if (!yearStr || !seasonParam) {
    return NextResponse.json<SeasonApiResponse>(
      { ok: false, error: "year と season を指定してください。" },
      { status: 400 }
    );
  }

  const year = parseInt(yearStr, 10);
  if (Number.isNaN(year) || year < 1970 || year > 2100) {
    return NextResponse.json<SeasonApiResponse>(
      { ok: false, error: "有効な年（西暦）を指定してください。" },
      { status: 400 }
    );
  }

  let seasonSlug;
  try {
    seasonSlug = toSeasonSlug(seasonParam);
  } catch {
    return NextResponse.json<SeasonApiResponse>(
      { ok: false, error: "season は spring / summer / autumn / winter のいずれかにしてください。" },
      { status: 400 }
    );
  }

  try {
    const rows = await fetchSeasonPrograms(year, seasonSlug, token);
    return NextResponse.json<SeasonApiResponse>({ ok: true, rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "取得に失敗しました。";
    return NextResponse.json<SeasonApiResponse>(
      { ok: false, error: message },
      { status: 502 }
    );
  }
}
