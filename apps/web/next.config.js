

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const apiHostname = new URL(API_URL.replace(/\/api$/, '')).hostname;

const nextConfig = {
    output:'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/img/wn/**',
      },
      {
        protocol: 'http',
        hostname: apiHostname,
        pathname: '/icons/**',
      },
      {
        protocol: 'https',
        hostname: apiHostname,
        pathname: '/icons/**',
      },
    ],
  },
};

export default nextConfig;