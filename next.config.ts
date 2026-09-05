import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/ghostwriter', destination: '/wright', permanent: false },
      { source: '/ghostwriter/:path*', destination: '/wright/:path*', permanent: false },
    ]
  },
};

export default nextConfig;
