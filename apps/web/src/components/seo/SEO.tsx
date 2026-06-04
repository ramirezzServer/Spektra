import { useEffect } from 'react';
import { buildCanonicalUrl } from '@/lib/canonical';
import { safeUrl } from '@/lib/safeUrl';

type SEOProps = {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  canonicalPath?: string;
  noIndex?: boolean;
};

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(property ? 'property' : 'name', name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function removeMeta(name: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  document.head.querySelector(selector)?.remove();
}

export function SEO({ title, description = 'Track films, series, games, and books with Spektra.', image, type = 'website', canonicalPath, noIndex }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes('Spektra') ? title : `${title} | Spektra`;
    const canonical = canonicalPath ? buildCanonicalUrl(canonicalPath) : undefined;
    const safeImage = safeUrl(image);

    document.title = fullTitle;
    setMeta('description', description);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', type, true);
    setMeta('twitter:card', safeImage ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('robots', noIndex ? 'noindex,nofollow' : 'index,follow');

    if (safeImage) {
      setMeta('og:image', safeImage, true);
      setMeta('twitter:image', safeImage);
    } else {
      removeMeta('og:image', true);
      removeMeta('twitter:image');
    }

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    } else if (link) {
      link.remove();
    }
  }, [canonicalPath, description, image, noIndex, title, type]);

  return null;
}
