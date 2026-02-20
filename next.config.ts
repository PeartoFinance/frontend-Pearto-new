import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/help',
        destination: '/support',
        permanent: true,
      },
      {
        source: '/market',
        destination: '/market/gainers',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
