const TMDB_IMAGE_HOST = 'image.tmdb.org';
const TMDB_POSTER_WIDTHS = [185, 342, 500] as const;
const TMDB_DEFAULT_POSTER_WIDTH = 342;

export interface ResponsiveImageAttrs {
  src: string;
  srcSet?: string | undefined;
}

function tmdbPosterUrl(url: URL, width: number) {
  const segments = url.pathname.split('/');

  if (segments.length < 5 || segments[1] !== 't' || segments[2] !== 'p') {
    return null;
  }

  const next = new URL(url.toString());
  segments[3] = `w${width}`;
  next.pathname = segments.join('/');
  return next.toString();
}

export function getResponsivePosterImage(src: string): ResponsiveImageAttrs {
  let url: URL;

  try {
    url = new URL(src);
  } catch {
    return { src };
  }

  if (url.hostname !== TMDB_IMAGE_HOST) {
    return { src };
  }

  const defaultSrc = tmdbPosterUrl(url, TMDB_DEFAULT_POSTER_WIDTH);

  if (!defaultSrc) {
    return { src };
  }

  const srcSet = TMDB_POSTER_WIDTHS.map((width) => {
    const resized = tmdbPosterUrl(url, width);
    return resized ? `${resized} ${width}w` : null;
  })
    .filter((entry): entry is string => Boolean(entry))
    .join(', ');

  return {
    src: defaultSrc,
    srcSet: srcSet || undefined,
  };
}
