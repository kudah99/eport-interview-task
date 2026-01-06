import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  output: 'standalone',
  // Suppress hanging promise warnings for cookies() in Supabase client
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
