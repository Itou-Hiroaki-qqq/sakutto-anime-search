import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
});

export const metadata: Metadata = {
  title: "さくっとアニメ検索→録画表印刷",
  description: "Annict APIで指定シーズンのアニメ放映一覧を表示・録画表印刷",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <header className="border-b border-base-300 bg-base-100 px-4 py-3">
          <p className="text-lg font-semibold text-base-content">
            さくっとアニメ検索→録画表印刷
          </p>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-base-300 bg-base-100 py-4 text-center text-sm text-base-content/70">
          All Rights Reserved 2026 ©︎ Hiroaki Ito
        </footer>
      </body>
    </html>
  );
}
