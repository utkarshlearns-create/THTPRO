export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/superadmin', '/admin-login'],
      },
    ],
    sitemap: 'https://www.thehometuitions.com/sitemap.xml',
  };
}
