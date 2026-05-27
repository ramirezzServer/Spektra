import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { sampleFeed } from './mockData';

export function Feed() {
  const [scope, setScope] = useState<'following' | 'global'>('following');
  const [visible, setVisible] = useState(sampleFeed);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible((items) => [...items, ...sampleFeed.map((item) => ({ ...item, id: item.id + items.length }))]);
    });
    if (sentinel.current) observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Feed</h1>
        <div className="rounded-md border border-app-border bg-app-surface p-1">
          {(['following', 'global'] as const).map((item) => (
            <button key={item} onClick={() => setScope(item)} className={`min-h-11 rounded px-4 text-sm font-semibold capitalize ${scope === item ? 'bg-app-accent text-white' : 'text-app-muted'}`}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {visible.map((item) => (
          <Card key={item.id} className="flex gap-3 p-4">
            <Avatar alt={item.actor?.username ?? 'User'} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm"><span className="font-bold">@{item.actor?.username}</span> {item.verb.replace(/_/g, ' ')} <span className="font-semibold">{String(item.metadata.title)}</span></p>
              <p className="mt-1 text-xs text-app-muted">{item.createdAt}</p>
            </div>
            {Boolean(item.metadata.thumbnail) && <img src={String(item.metadata.thumbnail)} alt="" className="h-16 w-11 rounded object-cover" />}
          </Card>
        ))}
      </div>
      <div ref={sentinel} className="h-10" />
    </div>
  );
}
