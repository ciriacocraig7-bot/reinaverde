import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // Pin workspace root to this project — silences the "multiple lockfiles"
    // warning caused by a stray C:\Users\Sebastian\package-lock.json.
    root: path.join(import.meta.dirname, "."),
  },
};

export default nextConfig;
