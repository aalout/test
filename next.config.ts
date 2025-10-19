import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const envBasePath =
  process.env.BASE_PATH || (repoName ? `/${repoName}` : "/exine-test");
const basePath = isProd ? envBasePath : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath,
};

export default nextConfig;
