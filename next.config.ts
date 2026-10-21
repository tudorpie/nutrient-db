import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Served at momentan.fun/nutrition via a beforeFiles rewrite in momentan-site.
  // basePath makes every asset and route live under /nutrition so the proxy
  // can pass /nutrition/:path* straight through.
  basePath: "/nutrition",
};

export default nextConfig;
