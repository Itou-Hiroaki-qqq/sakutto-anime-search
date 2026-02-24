# さくっとアニメ検索 → 録画表印刷

Annict API を使って、指定シーズンのアニメ放映一覧を表示し、選択した作品だけをまとめた**録画表を印刷**できる Web アプリです。

## 主な機能

- **シーズン検索** … 西暦・シーズン（春 4〜6月 / 夏 7〜9月 / 秋 10〜12月 / 冬 1〜3月）を指定して、そのシーズンのアニメ放映一覧を取得
- **放映局で絞り込み** … 全国ネット・地方局・その他放送など、放映局ごとに一覧を絞り込み
- **録画表の作成** … 一覧から印刷したい作品を選択し、「録画表の作成」で専用ページへ遷移
- **録画表の印刷** … 選択した作品だけの一覧を印刷用レイアウトで表示し、ブラウザの印刷機能で印刷可能

## 技術スタック

- **フレームワーク:** Next.js 16 (App Router)
- **言語:** TypeScript
- **スタイル:** Tailwind CSS 4, DaisyUI
- **データ取得:** Annict GraphQL API（[Annict](https://annict.com) のアクセストークンが必要）

## 必要な環境

- Node.js 18.x 以上
- [Annict](https://annict.com) アカウント（アプリ設定でアクセストークンを発行）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/Itou-Hiroaki-qqq/sakutto-anime-search.git
cd sakutto-anime-search
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

プロジェクト直下に `.env.local` を作成し、Annict のアクセストークンを設定します。

```env
ANNICT_ACCESS_TOKEN=あなたのAnnictアクセストークン
```

トークンは [Annict の設定 → アプリ](https://annict.com/settings/apps) から発行できます。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `ANNICT_ACCESS_TOKEN` | Annict API 用のアクセストークン | ○ |

## プロジェクト構成（主要ファイル）

```
src/
├── app/
│   ├── layout.tsx           # 共通レイアウト（ヘッダー・フッター）
│   ├── page.tsx             # トップページ（検索・一覧・録画表作成）
│   ├── globals.css          # グローバルスタイル
│   ├── api/
│   │   └── season/
│   │       └── route.ts      # GET /api/season（シーズン放映一覧 API）
│   └── recording-list/
│       └── page.tsx         # 録画表ページ（選択作品の表示・印刷）
└── lib/
    ├── annict.ts            # Annict API 呼び出し・型・シーズン定義
    └── channelCategories.ts # 放映局の分類（全国ネット / 地方局 / その他）
```

## デプロイ（Vercel）

1. [Vercel](https://vercel.com) でリポジトリをインポート
2. 環境変数に `ANNICT_ACCESS_TOKEN` を設定
3. デプロイ

Vercel は Next.js の推奨デプロイ先であり、設定は最小限で利用できます。

## スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動（webpack 使用） |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |

## ライセンス

All Rights Reserved 2026 © Hiroaki Ito
