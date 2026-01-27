import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance: Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Performance: Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Performance: Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', 'date-fns'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Performance: Enable compression
  compress: true,
  
  // Performance: Optimize production builds
  poweredByHeader: false,
  generateEtags: true,
};

export default nextConfig;
