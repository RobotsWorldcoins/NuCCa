import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.env.VERCEL
      ? process.cwd()
      : path.resolve(process.cwd(), "../.."),
  },
};

export default nextConfig;
