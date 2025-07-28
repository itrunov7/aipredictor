/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['financialmodelingprep.com', 'logo.clearbit.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/stocks/:path*',
        destination: '/api/stocks/:path*',
      },
      {
        source: '/api/backend/insights/:path*', 
        destination: '/api/insights/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 