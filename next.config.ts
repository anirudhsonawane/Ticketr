import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Comment out output and distDir when using middleware
  // output: 'export',
  // distDir: 'out',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ceaseless-cat-661.convex.cloud',
        port: '',
        pathname: '/api/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', 'localhost:3002', 'ticketr-968af.web.app', 'ticketr-968af.firebaseapp.com']
    }
  },
  // Disable server components for Firebase static hosting
  reactStrictMode: true,
  swcMinify: true
};

export default nextConfig;
