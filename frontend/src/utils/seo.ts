export interface SeoPayload {
  title: string;
  description: string;
  robots?: string;
  image?: string | null;
  canonicalPath?: string;
  type?: 'website' | 'article';
}

const ensureMetaTag = (selector: string, attributes: Record<string, string>) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement('meta');
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag?.setAttribute(key, value);
  });
};

const ensureLinkTag = (selector: string, attributes: Record<string, string>) => {
  let tag = document.head.querySelector<HTMLLinkElement>(selector);

  if (!tag) {
    tag = document.createElement('link');
    document.head.appendChild(tag);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag?.setAttribute(key, value);
  });
};

export const applySeoToDocument = ({
  title,
  description,
  robots = 'index, follow',
  image,
  canonicalPath = '/',
  type = 'website',
}: SeoPayload) => {
  const origin = window.location.origin;
  const canonicalUrl = new URL(canonicalPath, origin).toString();
  const imageUrl = image ? new URL(image, origin).toString() : `${origin}/favicon.svg`;

  document.title = title;
  document.documentElement.lang = 'en';

  ensureMetaTag('meta[name="description"]', {
    name: 'description',
    content: description,
  });
  ensureMetaTag('meta[name="robots"]', {
    name: 'robots',
    content: robots,
  });
  ensureMetaTag('meta[property="og:title"]', {
    property: 'og:title',
    content: title,
  });
  ensureMetaTag('meta[property="og:description"]', {
    property: 'og:description',
    content: description,
  });
  ensureMetaTag('meta[property="og:type"]', {
    property: 'og:type',
    content: type,
  });
  ensureMetaTag('meta[property="og:url"]', {
    property: 'og:url',
    content: canonicalUrl,
  });
  ensureMetaTag('meta[property="og:image"]', {
    property: 'og:image',
    content: imageUrl,
  });
  ensureMetaTag('meta[name="twitter:card"]', {
    name: 'twitter:card',
    content: 'summary_large_image',
  });
  ensureMetaTag('meta[name="twitter:title"]', {
    name: 'twitter:title',
    content: title,
  });
  ensureMetaTag('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: description,
  });
  ensureMetaTag('meta[name="twitter:image"]', {
    name: 'twitter:image',
    content: imageUrl,
  });
  ensureMetaTag('meta[name="application-name"]', {
    name: 'application-name',
    content: title,
  });

  ensureLinkTag('link[rel="canonical"]', {
    rel: 'canonical',
    href: canonicalUrl,
  });
};
