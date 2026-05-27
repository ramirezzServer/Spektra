import { Lock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const lists = [
  { name: 'Weekend queue', description: 'Short films and single-sitting games.', count: 12 },
  { name: 'Books for rainy train rides', description: 'Portable, reflective, under 350 pages.', count: 8 },
  { name: 'Co-op nights', description: 'Games that work well with friends.', count: 15 },
];

export function Lists() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Lists</h1>
        <Button><Plus className="h-4 w-4" /> New list</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {lists.map((list) => (
          <Card key={list.name} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-bold">{list.name}</h2>
              <Lock className="h-4 w-4 text-app-muted" />
            </div>
            <p className="mt-2 text-sm text-app-muted">{list.description}</p>
            <p className="mt-4 text-sm font-semibold text-app-accent">{list.count} items</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
