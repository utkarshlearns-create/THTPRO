export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/superadmin', '/api'],
      },
    ],
    sitemap: 'https://thehometuitions.com/sitemap.xml',
  };
}
