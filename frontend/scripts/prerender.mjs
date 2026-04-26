import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const indexPath = path.join(distDir, 'index.html');
const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://api.mytracker.shimzo.online').replace(/\/$/, '');

const routes = [
  {
    path: '/login',
    title: 'Sign In | Task & Expense',
    description: 'Sign in to access your tasks, expense tracking, reports, notes, and calendar tools.',
    robots: 'index, follow',
    heading: 'Sign in to continue',
  },
  {
    path: '/register',
    title: 'Create Account | Task & Expense',
    description: 'Create your account to organize tasks, expenses, reports, notes, and daily productivity.',
    robots: 'index, follow',
    heading: 'Create your account',
  },
  {
    path: '/forgot-password',
    title: 'Reset Password | Task & Expense',
    description: 'Reset your password securely and regain access to your account and productivity tools.',
    robots: 'noindex, nofollow',
    heading: 'Reset your password',
  },
];

const ensureTag = (html, pattern, replacement, fallback) => {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `${fallback}\n  </head>`);
};

const template = await fs.readFile(indexPath, 'utf8');

for (const route of routes) {
  const canonicalUrl = `${siteUrl}${route.path}`;
  const summaryMarkup = `<main style="min-height:100vh;display:grid;place-items:center;padding:2rem;background:#f8fafc;color:#0f172a;font-family:system-ui,sans-serif;">
      <section style="max-width:40rem;text-align:center;">
        <h1 style="margin:0 0 1rem;font-size:2rem;">${route.heading}</h1>
        <p style="margin:0;color:#475569;line-height:1.7;">${route.description}</p>
      </section>
    </main>`;

  let html = template.replace(/<title>.*?<\/title>/s, `<title>${route.title}</title>`);
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${route.description}" />`
  );
  html = html.replace(/<meta name="robots" content=".*?" \/>/, `<meta name="robots" content="${route.robots}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${route.title}" />`);
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${route.description}" />`
  );
  html = ensureTag(
    html,
    /<meta property="og:url" content=".*?" \/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `  <meta property="og:url" content="${canonicalUrl}" />`
  );
  html = ensureTag(
    html,
    /<link rel="canonical" href=".*?" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `  <link rel="canonical" href="${canonicalUrl}" />`
  );
  html = html.replace('<div id="root"></div>', `<div id="root">${summaryMarkup}</div>`);

  const outputDir = path.join(distDir, route.path.replace(/^\//, ''));
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, 'index.html'), html, 'utf8');
}
