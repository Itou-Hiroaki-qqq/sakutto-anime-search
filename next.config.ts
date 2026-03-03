import path from "path";
import type { NextConfig } from "next";

// この config があるフォルダをプロジェクトルートに固定（親 01_Frontend を参照しない）
const projectRoot = path.resolve(__dirname);
const projectNodeModules = path.join(projectRoot, "node_modules");

const nextConfig: NextConfig = {
  // 親ディレクトリの lockfile による workspace root 誤検知を防ぐ
  outputFileTracingRoot: projectRoot,
  webpack: (config) => {
    config.context = projectRoot;
    // モジュール解決を必ずこのプロジェクトの node_modules に寄せる
    config.resolve = config.resolve || {};
    const existingModules = config.resolve.modules ?? ["node_modules"];
    config.resolve.modules = [projectNodeModules, ...existingModules];
    config.resolveLoader = config.resolveLoader || {};
    const existingLoaderModules = config.resolveLoader.modules ?? ["node_modules"];
    config.resolveLoader.modules = [projectNodeModules, ...existingLoaderModules];
    return config;
  },
};

export default nextConfig;
