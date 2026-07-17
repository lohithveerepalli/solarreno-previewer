import type { NextConfig } from "next";

/**
 * Cesium ships Web Workers + WASM that must be served as static files.
 * Assets are copied to public/cesium via scripts/copy-cesium.mjs (postinstall).
 *
 * Cesium is loaded only on the client (dynamic import, ssr: false).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next.js 16 defaults to Turbopack; empty config acknowledges webpack section below.
  turbopack: {},
  transpilePackages: ["cesium"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("cesium");
      }
    }
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
    };
    return config;
  },
};

export default nextConfig;
