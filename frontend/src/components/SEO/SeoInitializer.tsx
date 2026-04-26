import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { siteSettingsService } from '../../services/siteSettingsService';
import { resolveBrandingAssetUrl } from '../../utils/branding';
import { getRouteMeta } from '../../seo/routeMeta';

export const SeoInitializer: React.FC = () => {
  const location = useLocation();
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: siteSettingsService.getPublicSettings,
    staleTime: 1000 * 60 * 10,
  });

  const siteName = settings?.site_name?.trim() || 'Task & Expense';
  const routeMeta = getRouteMeta(location.pathname);
  const siteUrl = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');
  const canonicalUrl = new URL(location.pathname || '/', `${siteUrl}/`).toString();
  const imageUrl = resolveBrandingAssetUrl(settings?.logo_url || settings?.logo_path) || `${siteUrl}/favicon.svg`;
  const title = `${routeMeta.title} | ${siteName}`;

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={routeMeta.description} />
      <meta name="robots" content={routeMeta.robots ?? 'index, follow'} />
      <meta name="application-name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={routeMeta.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={routeMeta.description} />
      <meta name="twitter:image" content={imageUrl} />
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};
