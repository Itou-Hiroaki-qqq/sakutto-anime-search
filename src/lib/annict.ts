/**
 * Annict GraphQL API 用の型と取得ロジック
 * https://developers.annict.com/docs/graphql-api/beta
 */

const ANNICT_GRAPHQL_ENDPOINT = "https://api.annict.com/graphql";

/** シーズン名（API用） */
export type SeasonSlug = "spring" | "summer" | "autumn" | "winter";

/** 表示用シーズンラベル */
export const SEASON_LABELS: Record<SeasonSlug, string> = {
  spring: "春アニメ",
  summer: "夏アニメ",
  autumn: "秋アニメ",
  winter: "冬アニメ",
};

/** フロントの選択値 → API用シーズン */
export function toSeasonSlug(season: string): SeasonSlug {
  const map: Record<string, SeasonSlug> = {
    spring: "spring",
    summer: "summer",
    autumn: "autumn",
    winter: "winter",
  };
  const s = map[season];
  if (!s) throw new Error(`Invalid season: ${season}`);
  return s;
}

/** 表示用の一覧1行 */
export interface SeasonProgramRow {
  title: string;
  channelName: string;
  startedAt: string; // ISO 8601
}

/** GraphQL レスポンス用の型 */
interface SearchWorksResponse {
  data: {
    searchWorks: {
      edges: Array<{
        node: {
          annictId: number;
          title: string;
          programs: {
            edges: Array<{
              node: {
                startedAt: string;
                channel: { name: string };
              };
            }>;
          };
        };
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
}

const SEARCH_WORKS_QUERY = `
  query SearchSeasonWorks($seasons: [String!], $first: Int, $after: String) {
    searchWorks(seasons: $seasons, first: $first, after: $after) {
      edges {
        node {
          annictId
          title
          programs(first: 50, orderBy: { field: STARTED_AT, direction: ASC }) {
            edges {
              node {
                startedAt
                channel {
                  name
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * 指定シーズンの作品一覧を取得し、
 * 作品名・放映局・放映開始日時でフラットな行に展開して、
 * 放映開始日時の早い順でソートして返す
 */
export async function fetchSeasonPrograms(
  year: number,
  season: SeasonSlug,
  accessToken: string
): Promise<SeasonProgramRow[]> {
  const seasonStr = `${year}-${season}`;
  const rows: SeasonProgramRow[] = [];
  let after: string | null = null;
  const first = 50;

  // searchWorks をページネーションで全件取得
  while (true) {
    const variables: {
      seasons: string[];
      first: number;
      after?: string;
    } = {
      seasons: [seasonStr],
      first,
    };
    if (after) variables.after = after;

    const res = await fetch(ANNICT_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: SEARCH_WORKS_QUERY,
        variables,
      }),
    });

    if (!res.ok) {
      throw new Error(`Annict API error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as SearchWorksResponse;

    if (json.data?.searchWorks == null) {
      const err = (json as { errors?: Array<{ message: string }> }).errors;
      throw new Error(
        err?.length ? err.map((e) => e.message).join(", ") : "Unknown API error"
      );
    }

    const { edges, pageInfo } = json.data.searchWorks;

    for (const edge of edges) {
      const work = edge.node;
      for (const progEdge of work.programs.edges) {
        const prog = progEdge.node;
        rows.push({
          title: work.title,
          channelName: prog.channel.name,
          startedAt: prog.startedAt,
        });
      }
    }

    if (!pageInfo.hasNextPage || !pageInfo.endCursor) break;
    after = pageInfo.endCursor;
  }

  // 放映開始日時の早い順でソート
  rows.sort(
    (a, b) =>
      new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  return rows;
}
