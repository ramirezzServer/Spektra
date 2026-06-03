import { Activity, BookMarked, Compass, Home, Library, Plus, Search, User } from 'lucide-react';

export type CommandGroup = 'Navigation' | 'Actions';

export interface CommandItemDefinition {
  id: string;
  label: string;
  description: string;
  group: CommandGroup;
  icon: typeof Home;
  shortcut?: string;
  authOnly?: boolean;
  to?: string;
  action?: 'create-list';
}

export const commandItemDefinitions: CommandItemDefinition[] = [
  { id: 'home', label: 'Go to Home', description: 'Return to your Spektra dashboard.', group: 'Navigation', icon: Home, shortcut: 'G H', to: '/' },
  { id: 'search', label: 'Go to Search', description: 'Open the content discovery page.', group: 'Navigation', icon: Search, shortcut: 'G S', to: '/search' },
  { id: 'feed', label: 'Go to Feed', description: 'See activity from people you follow.', group: 'Navigation', icon: Activity, shortcut: 'G F', to: '/feed' },
  { id: 'library', label: 'Go to Library', description: 'Open your tracked content.', group: 'Navigation', icon: Library, shortcut: 'G L', to: '/library' },
  { id: 'lists', label: 'Go to Lists', description: 'Browse your custom collections.', group: 'Navigation', icon: BookMarked, shortcut: 'G I', to: '/lists' },
  { id: 'profile', label: 'Go to Profile', description: 'Open your public profile.', group: 'Navigation', icon: User, authOnly: true },
  { id: 'create-list', label: 'Create List', description: 'Start a new curated collection.', group: 'Actions', icon: Plus, shortcut: 'N L', authOnly: true, action: 'create-list' },
  { id: 'global-feed', label: 'Open Global Feed', description: 'Jump into the feed view.', group: 'Actions', icon: Compass, to: '/feed' },
];
