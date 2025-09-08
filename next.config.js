/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // REMOVE to enable dynamic/SSR
  // distDir: 'out',
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
      "localhost",
      "your-railway-app-url",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'https://your-railway-app-url/api/:path*'
          : 'http://localhost:5000/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/sounds/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'audio/wav',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
