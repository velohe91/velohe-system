import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep turbopack.root for `next dev --turbopack`
  turbopack: {
    root: process.cwd(),
  },
  webpack: (config) => {
    // Quiet optional peer deps pulled by wallet stacks
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  outputFileTracingIncludes: {
    "/api/pixel-studio/export": ["./node_modules/ffmpeg-static/ffmpeg"],
  },
  images: {
    contentDispositionType: "inline",
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
