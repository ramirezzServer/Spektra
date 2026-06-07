import { useEffect, useState } from 'react';
import { safeUrl } from '@/lib/safeUrl';

function initials(value: string) {
  return value
    .replace(/^@/, '')
    .split(/\s|_/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'SP';
}

export function Avatar({ src, alt, size = 'md' }: { src?: string | null | undefined; alt: string; size?: 'sm' | 'md' | 'lg' | 'xl' | undefined }) {
  const [failed, setFailed] = useState(false);
  const safeSrc = safeUrl(src);
  const classes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-20 w-20',
    xl: 'h-28 w-28',
  };

  useEffect(() => {
    setFailed(false);
  }, [safeSrc]);

  return (
    <div className={`${classes[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/60 bg-accent-light text-sm font-black text-accent shadow-card`}>
      {safeSrc && !failed ? (
        <img className="h-full w-full object-cover" src={safeSrc} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <span aria-label={alt}>{initials(alt)}</span>
      )}
    </div>
  );
}
