import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/maker/:path*',
        destination: 'http://localhost:3000/maker/:path*',
      },
      {
        source: '/blofin/:path*',
        destination: 'http://localhost:3000/blofin/:path*',
      },
      {
        source: '/strategies/:path*',
        destination: 'http://localhost:3000/strategies/:path*',
      },
      {
        source: '/logic/:path*',
        destination: 'http://localhost:3000/logic/:path*',
      },
      {
        source: '/ai/:path*',
        destination: 'http://localhost:3000/ai/:path*',
      },
      {
        source: '/stop-loss/:path*',
        destination: 'http://localhost:3000/stop-loss/:path*',
      },
      {
        source: '/take-profit/:path*',
        destination: 'http://localhost:3000/take-profit/:path*',
      },
      {
        source: '/trailing-stop/:path*',
        destination: 'http://localhost:3000/trailing-stop/:path*',
      },
      {
        source: '/indicators/:path*',
        destination: 'http://localhost:3000/indicators/:path*',
      },
      {
        source: '/enter',
        destination: 'http://localhost:3000/enter',
      },
      {
        source: '/exit',
        destination: 'http://localhost:3000/exit',
      },
      {
        source: '/exit-maker',
        destination: 'http://localhost:3000/exit-maker',
      },
      {
        source: '/close-position',
        destination: 'http://localhost:3000/close-position',
      },
      {
        source: '/strategy/start',
        destination: 'http://localhost:3000/strategy/start',
      },
      {
        source: '/health',
        destination: 'http://localhost:3000/health',
      },
      {
        source: '/logs',
        destination: 'http://localhost:3000/logs',
      }
    ];
  },
};

export default nextConfig;
