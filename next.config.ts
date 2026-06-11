import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Permite que <Image> sirva las fotos subidas al CMS, que viven en
    // Vercel Blob (https://<store>.public.blob.vercel-storage.com/...).
    // Sin esto, next/image rechaza el host y el producto subido no se ve.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  turbopack: {
    // Pin workspace root to this project — silences the "multiple lockfiles"
    // warning caused by a stray C:\Users\Sebastian\package-lock.json.
    root: path.join(import.meta.dirname, "."),
  },
};

export default nextConfig;
