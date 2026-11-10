import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (the new Next 16 caching model) is intentionally OFF.
  // Almost every page here renders client-side from mock data + localStorage,
  // so the classic model is simpler for the team to reason about.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // The API routes read bundled sample images from public/ when a real model
  // (local or cloud) is asked to analyse a sample. On serverless hosts
  // (Vercel) public/ is served by the CDN and not shipped with the function,
  // so the sample folders are traced into the route bundles explicitly.
  outputFileTracingIncludes: {
    "/api/analyze": ["./public/samples/*.{jpg,jpeg,png,webp}"],
    "/api/restroom": ["./public/samples/restrooms/*.{jpg,jpeg,png,webp}"],
  },

  // The pothole pages moved under /app/roads when the restroom module arrived.
  // Old links (slides, bookmarks, the previous deploy) keep working.
  // Query strings (e.g. ?sample=s01) are passed through by Next.js.
  async redirects() {
    return [
      { source: "/app/analyze", destination: "/app/roads/analyze", permanent: false },
      { source: "/app/reports", destination: "/app/roads/reports", permanent: false },
      { source: "/app/reports/:id", destination: "/app/roads/reports/:id", permanent: false },
      { source: "/app/map", destination: "/app/roads/map", permanent: false },
      { source: "/app/rules", destination: "/app/roads/rules", permanent: false },
    ];
  },
};

export default nextConfig;
