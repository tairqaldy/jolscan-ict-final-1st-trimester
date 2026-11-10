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
};

export default nextConfig;
