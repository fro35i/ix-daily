import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    articles: { stale: 300, revalidate: 900, expire: 3600 },

    // An expire under 5 minutes keeps these out of prerenders, so they stream per request.
    banner: { stale: 30, revalidate: 60, expire: 180 },
    trending: { stale: 60, revalidate: 120, expire: 240 },
  },
  // The news layer reads these files at runtime with fs, so the deploy must include them.
  outputFileTracingIncludes: {
    "/**": ["./content/articles.json", "./content/banner.json"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ibmix.de",
        pathname: "/wp-content/uploads/**",
      },
    ],
    qualities: [75],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
