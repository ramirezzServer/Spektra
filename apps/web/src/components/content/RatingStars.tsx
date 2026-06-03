import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
  disabled?: boolean;
}

export function RatingStars({ value, onChange, readonly = false, disabled = false }: RatingStarsProps) {
  const score = value ?? 0;
  const inert = readonly || disabled;

  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label={`Rating ${score} out of 10`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = (index + 1) * 2;
        const filled = score >= starValue;
        const half = !filled && score >= starValue - 1;

        return (
          <button
            key={starValue}
            type="button"
            disabled={inert}
            onClick={() => onChange?.(starValue)}
            aria-label={`Rate ${starValue} out of 10`}
            aria-pressed={score === starValue}
            className={cn(
              'relative grid min-h-12 min-w-12 place-items-center rounded-2xl border border-transparent text-warning transition hover:border-warning/25 hover:bg-warning-light active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
              inert && 'cursor-default opacity-80 hover:bg-transparent active:scale-100',
            )}
          >
            <Star className={cn('h-6 w-6', filled ? 'fill-warning text-warning' : 'fill-transparent')} />
            {half && <Star className="absolute h-6 w-6 fill-warning text-warning [clip-path:inset(0_50%_0_0)]" />}
          </button>
        );
      })}
      <span className="ml-1 text-sm font-black text-content-secondary">{score ? `${score}/10` : 'Not rated'}</span>
    </div>
  );
}
