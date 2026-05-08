import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin Turbopack to this app directory (not parent folders).
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
