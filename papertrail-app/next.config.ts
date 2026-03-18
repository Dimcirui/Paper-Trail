import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  watchOptions: {
    usePolling: true,
    pollIntervalMs: 500,
  },
};

export default nextConfig;
