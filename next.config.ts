import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Model photos are pre-sized WebP files (scripts/process-models.py) and the
    // custom loader only picks between them, so the server never resizes
    // images. That keeps sharp, and its CPU and memory spikes, out of the
    // running container.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [640, 1080],
    imageSizes: [128, 384],
  },
  compress: true,
  async headers() {
    return [
      {
        // Browsers and Railway's edge keep model photos for a week instead of
        // asking the server again on every visit.
        source: "/models/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
