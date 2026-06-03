import { Search, TimerReset } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@/components/ui/Dialog';
import { PosterImage } from '@/components/content/PosterImage';
import { commandItemDefinitions, type CommandGroup } from '@/lib/commandItems';
import { slugify } from '@/lib/slugs';
import { useAuthStore } from '@/stores/authStore';
import type { RecentlyViewedItem } from '@/hooks/useRecentlyViewed';

interface CommandPaletteProps {
  open: boolean;
  recentItems: RecentlyViewedItem[];
  onClose: () => void;
  onCreateList: () => void;
}

interface PaletteItem {
  id: string;
  label: string;
  description: string;
  group: CommandGroup | 'Recent' | 'Content Search shortcut';
  icon?: typeof Search;
  shortcut?: string;
  poster?: RecentlyViewedItem;
  run: () => void;
}

function contentPath(item: RecentlyViewedItem) {
  return `/content/${encodeURIComponent(item.type)}/${encodeURIComponent(item.externalId)}/${slugify(item.title) || 'content'}`;
}

function matches(item: Pick<PaletteItem, 'label' | 'description'>, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return `${item.label} ${item.description}`.toLowerCase().includes(needle);
}

export function CommandPalette({ open, recentItems, onClose, onCreateList }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
  }, [open]);

  const items = useMemo<PaletteItem[]>(() => {
    const baseItems = commandItemDefinitions
      .filter((item) => !item.authOnly || isAuthenticated)
      .map<PaletteItem>((item) => {
        const to = item.id === 'profile' && user?.username ? `/profile/${user.username}` : item.to;
        return {
          id: item.id,
          label: item.label,
          description: item.description,
          group: item.group,
          icon: item.icon,
          shortcut: item.shortcut,
          run: () => {
            if (item.action === 'create-list') {
              onCreateList();
              return;
            }
            if (to) navigate(to);
          },
        };
      })
      .filter((item) => item.id !== 'profile' || Boolean(user?.username))
      .filter((item) => matches(item, query));

    const trimmed = query.trim();
    const searchItem: PaletteItem | null = trimmed
      ? {
          id: 'search-query',
          label: `Search content for "${trimmed}"`,
          description: 'Open Search with this typed query.',
          group: 'Content Search shortcut',
          icon: Search,
          shortcut: 'Enter',
          run: () => navigate(`/search?q=${encodeURIComponent(trimmed)}`),
        }
      : {
          id: 'search-empty',
          label: 'Search content',
          description: 'Open Search and start discovering content.',
          group: 'Content Search shortcut',
          icon: Search,
          shortcut: 'Enter',
          run: () => navigate('/search'),
        };

    const recent = recentItems
      .filter((item) => matches({ label: item.title, description: `${item.type} ${item.releaseYear ?? ''}` }, query))
      .map<PaletteItem>((item) => ({
        id: `recent-${item.type}-${item.externalId}`,
        label: item.title,
        description: `${item.type}${item.releaseYear ? ` / ${item.releaseYear}` : ''}`,
        group: 'Recent',
        poster: item,
        run: () => navigate(contentPath(item)),
      }));

    return [...baseItems, searchItem, ...recent];
  }, [isAuthenticated, navigate, onCreateList, query, recentItems, user?.username]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(Math.max(0, items.length - 1));
  }, [activeIndex, items.length]);

  function selectItem(item: PaletteItem) {
    item.run();
    onClose();
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (items.length ? (index + 1) % items.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (items.length ? (index - 1 + items.length) % items.length : 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) selectItem(item);
    }
  }

  const grouped = items.reduce<Array<[PaletteItem['group'], PaletteItem[]]>>((groups, item) => {
    const current = groups[groups.length - 1];
    if (current?.[0] === item.group) current[1].push(item);
    else groups.push([item.group, [item]]);
    return groups;
  }, []);

  let itemIndex = -1;

  return (
    <Dialog open={open} title="Command palette" description="Jump anywhere in Spektra without leaving your flow." onClose={onClose} initialFocusRef={inputRef}>
      <div className="-mx-1 -mt-2 overflow-hidden rounded-2xl border border-border-subtle bg-slate-950 text-white shadow-floating">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-cyan-200" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            autoComplete="off"
            spellCheck={false}
            aria-label="Search commands"
            aria-activedescendant={items[activeIndex] ? `command-item-${items[activeIndex].id}` : undefined}
            aria-controls="command-palette-results"
            className="h-11 min-w-0 flex-1 bg-transparent text-base font-semibold text-white outline-none placeholder:text-slate-400"
            placeholder="Search pages, actions, or recent content..."
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
          />
          <kbd className="hidden rounded-lg border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-black uppercase text-slate-300 sm:inline">Esc</kbd>
        </div>

        <div ref={listRef} id="command-palette-results" role="listbox" className="max-h-[56vh] overflow-y-auto px-2 py-2">
          {items.length > 0 ? (
            grouped.map(([group, groupItems]) => (
              <section key={group} className="py-1" aria-label={group}>
                <div className="px-2 pb-1 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{group}</div>
                <div className="space-y-1">
                  {groupItems.map((item) => {
                    itemIndex += 1;
                    const currentIndex = itemIndex;
                    const Icon = item.icon;
                    const active = currentIndex === activeIndex;
                    return (
                      <button
                        key={item.id}
                        id={`command-item-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition focus:outline-none ${
                          active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-200 hover:bg-white/10'
                        }`}
                        onMouseEnter={() => setActiveIndex(currentIndex)}
                        onClick={() => selectItem(item)}
                      >
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ${active ? 'bg-slate-100' : 'bg-white/10'}`}>
                          {item.poster ? (
                            <PosterImage src={item.poster.posterUrl} title={item.poster.title} type={item.poster.type} className="h-full w-full object-cover" />
                          ) : Icon ? (
                            <Icon className={`h-4 w-4 ${active ? 'text-accent' : 'text-cyan-200'}`} aria-hidden="true" />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black">{item.label}</span>
                          <span className={`block truncate text-xs font-semibold ${active ? 'text-slate-500' : 'text-slate-400'}`}>{item.description}</span>
                        </span>
                        {item.shortcut ? (
                          <kbd className={`rounded-md border px-2 py-1 text-[10px] font-black uppercase ${active ? 'border-slate-200 bg-slate-100 text-slate-500' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                            {item.shortcut}
                          </kbd>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 px-5 py-8 text-center">
              <TimerReset className="h-8 w-8 text-slate-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-black text-white">No command found</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">Press Enter to search content once you type a query.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          <span>Arrow keys to move</span>
          <span>Enter to open</span>
        </div>
      </div>
    </Dialog>
  );
}
