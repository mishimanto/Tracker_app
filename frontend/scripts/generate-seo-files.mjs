import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://api.mytracker.shimzo.online').replace(/\/$/, '');
const today = new Date().toISOString().split('T')[0];

const publicRoutes = [
  { path: '/login', priority: '0.8', changefreq: 'weekly' },
  { path: '/register', priority: '0.7', changefreq: 'weekly' },
];

const privateRoutePrefixes = [
  '/admin',
  '/dashboard',
  '/tasks',
  '/expenses',
  '/expenses-all',
  '/reports',
  '/calendar',
  '/search',
  '/notepad',
  '/messages',
  '/profile',
  '/change-password',
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicRoutes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /login
Allow: /register
Disallow: /forgot-password
Disallow: /password-reset
${privateRoutePrefixes.map((prefix) => `Disallow: ${prefix}`).join('\n')}

Sitemap: ${siteUrl}/sitemap.xml
`;

await fs.mkdir(publicDir, { recursive: true });
await fs.writeFile(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
await fs.writeFile(path.join(publicDir, 'robots.txt'), robots, 'utf8');
