import { useParams } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RatingStars } from '@/components/content/RatingStars';
import { sampleContent } from './mockData';

export function ContentDetail() {
  const { id } = useParams();
  const item = sampleContent.find((content) => content.id === id) ?? sampleContent[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="aspect-[2/3] overflow-hidden rounded-lg border border-app-border bg-slate-100">
          {item.posterUrl && <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover" />}
        </div>
        <div className="space-y-5">
          <div>
            <Badge className="capitalize">{item.type}</Badge>
            <h1 className="mt-3 text-3xl font-bold">{item.title}</h1>
            <p className="mt-2 text-app-muted">{item.releaseYear} · {item.genres.join(', ')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button>Mark as Want</Button>
            <Button variant="secondary">In Progress</Button>
            <Button variant="secondary">Done</Button>
          </div>
          <RatingStars value={item.avgRating} onChange={() => undefined} />
          <details className="rounded-lg border border-app-border bg-app-surface p-4">
            <summary className="cursor-pointer font-semibold">Write a review</summary>
            <textarea className="mt-4 min-h-32 w-full rounded-md border border-app-border bg-app-bg p-3 text-sm outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20" placeholder="What stayed with you?" />
            <Button className="mt-3">Publish review</Button>
          </details>
        </div>
      </section>

      <Card className="p-5">
        <h2 className="text-lg font-bold">People who tracked this</h2>
        <div className="mt-4 flex -space-x-2">
          {['Maya', 'Rio', 'Nara', 'Alex'].map((name) => <Avatar key={name} alt={name} size="md" />)}
        </div>
      </Card>
    </div>
  );
}
