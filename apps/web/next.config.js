

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const apiHostname = new URL(API_URL.replace(/\/api$/, '')).hostname;

const nextConfig = {
  images: {
    remotePatterns: [
      // OpenWeatherMap fallback icons
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
        pathname: '/img/wn/**',
      },
      // Your NestJS API icons (e.g. /icons/weather/png/...)
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