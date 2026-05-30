import { useEffect, useState } from 'react';
import { BookOpen, Gamepad2, Tv, Video } from 'lucide-react';
import type { ContentType } from '@/types';

const iconByType: Record<ContentType, typeof Video> = {
  film: Video,
  series: Tv,
  game: Gamepad2,
  book: BookOpen,
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
      <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-bg-tertiary px-4 text-center text-app-muted ${className}`}>
        <FallbackIcon className="h-9 w-9" aria-hidden="true" />
        <span className="line-clamp-3 text-xs font-semibold">{title}</span>
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
