import { Star } from 'lucide-react';

export function RatingStars({ value, onChange, readonly = false }: { value: number | null; onChange?: (value: number) => void; readonly?: boolean }) {
  const score = value ?? 0;

  return (
    <div className="flex items-center gap-1" aria-label={`Rating ${score} out of 10`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = (index + 1) * 2;
        const filled = score >= starValue;
        const half = !filled && score >= starValue - 1;
        return (
          <button
            key={starValue}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(starValue)}
            className="relative grid min-h-11 min-w-11 place-items-center rounded-md text-amber-500 transition hover:bg-amber-50 disabled:min-h-5 disabled:min-w-5 disabled:cursor-default disabled:hover:bg-transparent"
          >
            <Star className={`h-5 w-5 ${filled ? 'fill-amber-500' : 'fill-transparent'}`} />
            {half && <Star className="absolute h-5 w-5 fill-amber-500 [clip-path:inset(0_50%_0_0)]" />}
          </button>
        );
      })}
      <span className="ml-1 text-sm font-semibold text-app-muted">{score ? `${score}/10` : 'Not rated'}</span>
    </div>
  );
}
