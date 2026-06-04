import { useEffect, useState } from 'react';
import { BookOpen, Gamepad2, Tv, Video } from 'lucide-react';
import type { ContentType } from '@/types';
import { safeUrl } from '@/lib/safeUrl';

const iconByType: Record<ContentType, typeof Video> = {
  film: Video,
  series: Tv,
  game: Gamepad2,
  book: BookOpen,
};

const fallbackByType: Record<ContentType, string> = {
  film: 'from-slate-950 via-indigo-950 to-violet-900 text-indigo-100',
  series: 'from-slate-950 via-cyan-950 to-blue-900 text-cyan-100',
  game: 'from-slate-950 via-emerald-950 to-teal-900 text-emerald-100',
  book: 'from-slate-950 via-amber-950 to-orange-900 text-amber-100',
};

interface PosterImageProps {
  src: string | null;
  title: string;
  type: ContentType;
  className?: string;
}

export function PosterImage({ src, title, type, className = '' }: PosterImageProps) {
  const [failed, setFailed] = useState(false);
  const safeSrc = safeUrl(src);
  const FallbackIcon = iconByType[type];

  useEffect(() => {
    setFailed(false);
  }, [safeSrc]);

  if (!safeSrc || failed) {
    return (
      <div className={`relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br px-4 text-center ${fallbackByType[type]} ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_8%,rgba(255,255,255,0.22),transparent_9rem),linear-gradient(to_top,rgba(2,6,23,0.92),transparent_55%)]" aria-hidden="true" />
        <div className="absolute inset-x-5 top-8 h-28 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-lg backdrop-blur">
          <FallbackIcon className="h-7 w-7 opacity-90" aria-hidden="true" />
        </div>
        <span className="relative line-clamp-4 text-xs font-black leading-snug text-white drop-shadow">{title}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={safeSrc}
      alt={`${title} poster`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
