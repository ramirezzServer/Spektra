import { describe, expect, it } from 'vitest';
import { getResponsivePosterImage } from './tmdbImages';

describe('getResponsivePosterImage', () => {
  it('creates resized TMDB poster src and srcset', () => {
    const image = getResponsivePosterImage('https://image.tmdb.org/t/p/original/poster.jpg');

    expect(image.src).toBe('https://image.tmdb.org/t/p/w342/poster.jpg');
    expect(image.srcSet).toBe(
      'https://image.tmdb.org/t/p/w185/poster.jpg 185w, https://image.tmdb.org/t/p/w342/poster.jpg 342w, https://image.tmdb.org/t/p/w500/poster.jpg 500w',
    );
  });

  it('resizes an existing TMDB width safely', () => {
    const image = getResponsivePosterImage('https://image.tmdb.org/t/p/w500/folder/poster.jpg?language=en');

    expect(image.src).toBe('https://image.tmdb.org/t/p/w342/folder/poster.jpg?language=en');
    expect(image.srcSet).toContain('https://image.tmdb.org/t/p/w185/folder/poster.jpg?language=en 185w');
    expect(image.srcSet).toContain('https://image.tmdb.org/t/p/w500/folder/poster.jpg?language=en 500w');
  });

  it('leaves non-TMDB providers untouched', () => {
    const rawg = 'https://media.rawg.io/media/games/example.jpg';
    const openLibrary = 'https://covers.openlibrary.org/b/isbn/0593321200-L.jpg';

    expect(getResponsivePosterImage(rawg)).toEqual({ src: rawg });
    expect(getResponsivePosterImage(openLibrary)).toEqual({ src: openLibrary });
  });

  it('leaves malformed URLs untouched', () => {
    expect(getResponsivePosterImage('/relative/poster.jpg')).toEqual({ src: '/relative/poster.jpg' });
  });
});
