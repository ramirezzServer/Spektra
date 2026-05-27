import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ContentGrid } from '@/components/content/ContentGrid';
import { sampleContent } from './mockData';

const tabs = ['Library', 'Lists', 'Reviews', 'Activity'];

export function Profile() {
  const [tab, setTab] = useState('Library');
  const stats = [
    ['Watched', 128],
    ['Playing', 6],
    ['Reading', 14],
    ['Want', 92],
  ];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar alt="demo" size="lg" />
            <div>
              <h1 className="text-2xl font-bold">@demo</h1>
              <p className="mt-1 max-w-xl text-sm text-app-muted">Collecting quiet films, sharp books, patient games, and shows that reward attention.</p>
            </div>
          </div>
          <Button>Follow</Button>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, count]) => (
          <Card key={label} className="p-4">
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm text-app-muted">{label}</div>
          </Card>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto border-b border-app-border">
        {tabs.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`min-h-11 border-b-2 px-4 text-sm font-semibold ${tab === item ? 'border-app-accent text-app-accent' : 'border-transparent text-app-muted'}`}>
            {item}
          </button>
        ))}
      </div>
      {tab === 'Library' ? <ContentGrid items={sampleContent} /> : <Card className="p-6 text-sm text-app-muted">{tab} will appear here as your network grows.</Card>}
    </div>
  );
}
