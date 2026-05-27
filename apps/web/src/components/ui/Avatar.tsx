import { UserCircle } from 'lucide-react';

export function Avatar({ src, alt, size = 'md' }: { src?: string | null; alt: string; size?: 'sm' | 'md' | 'lg' }) {
  const classes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-20 w-20',
  };

  return (
    <div className={`${classes[size]} overflow-hidden rounded-full border border-app-border bg-slate-100`}>
      {src ? <img className="h-full w-full object-cover" src={src} alt={alt} /> : <UserCircle className="h-full w-full p-1 text-slate-400" aria-label={alt} />}
    </div>
  );
}
