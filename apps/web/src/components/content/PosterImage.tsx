import { useEffect, useState } from 'react';
import { BookOpen, Gamepad2, Tv, Video } from 'lucide-react';
import type { ContentType } from '@/types';

const iconByType: Record<ContentType, typeof Video> = {
  film: Video,
  series: Tv,
  game: Gamepad2,
  book: BookOpen,
};

const fallbackByType: Record<ContentType, string> = {
  film: 'from-indigo-100 via-slate-100 to-violet-100 text-film-text',
  series: 'from-cyan-100 via-slate-100 to-sky-100 text-series-text',
  game: 'from-emerald-100 via-slate-100 to-teal-100 text-game-text',
  book: 'from-amber-100 via-slate-100 to-orange-100 text-book-text',
};

interface PosterImageProps {
  src: string | null;
  title: string;
  type: ContentType;
  className?: string;
}

export function PosterImage({ src, title, type, className = '' }: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const FallbackIcon = iconByType[type];

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br px-4 text-center ${fallbackByType[type]} ${className}`}>
        <div className="absolute inset-x-4 top-6 h-24 rounded-full bg-white/50 blur-2xl" aria-hidden="true" />
        <FallbackIcon className="relative h-10 w-10 opacity-80" aria-hidden="true" />
        <span className="relative line-clamp-3 text-xs font-black leading-snug">{title}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={`${title} poster`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
