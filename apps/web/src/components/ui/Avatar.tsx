import { useEffect, useState } from 'react';

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

export function Avatar({ src, alt, size = 'md' }: { src?: string | null; alt: string; size?: 'sm' | 'md' | 'lg' }) {
  const [failed, setFailed] = useState(false);
  const classes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-20 w-20',
  };

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className={`${classes[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-app-border bg-accent-light text-sm font-semibold text-accent`}>
      {src && !failed ? (
        <img className="h-full w-full object-cover" src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <span aria-label={alt}>{initials(alt)}</span>
      )}
    </div>
  );
}
