import { SiteSetting } from '../types';

const backendBaseUrl = (import.meta.env.VITE_API_URL || 'http://tracker.test/api').replace(/\/api$/, '');

export const resolveBrandingAssetUrl = (path?: string | null): string | null => {
  if (!path) {
    return null;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${backendBaseUrl}${path}`;
  }

  return `${backendBaseUrl}/storage/${path}`;
};

export const applyBrandingToDocument = (settings: SiteSetting | null) => {
  const siteName = settings?.site_name?.trim() || 'Task & Expense';
  document.documentElement.dataset.siteName = siteName;

  const faviconHref = resolveBrandingAssetUrl(settings?.favicon_url || settings?.favicon_path);

  if (!faviconHref) {
    return;
  }

  let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }

  favicon.href = faviconHref;
};
