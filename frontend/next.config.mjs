/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Vercel from stripping trailing slashes on API routes
  // Django requires trailing slashes and issues 301 redirects without them
  // 301 redirects convert POST → GET, breaking mutations (login, signup, etc.)
  skipTrailingSlashRedirect: true,

  // Proxy API requests to Django backend
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*/',
        destination: `${backendUrl}/api/:path*/`,
      },
      {
        // Fallback: if trailing slash is somehow stripped, add it back
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*/`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
