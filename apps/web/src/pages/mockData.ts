import type { ActivityFeedItem, ContentItem } from '@/types';

export const sampleContent: ContentItem[] = [
  { id: '1', externalId: 'tmdb-1', type: 'film', title: 'Past Lives', posterUrl: 'https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg', releaseYear: 2023, genres: ['Drama', 'Romance'], metadata: {}, avgRating: 8.6, ratingsCount: 1220 },
  { id: '2', externalId: 'tmdb-2', type: 'series', title: 'Shogun', posterUrl: 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg', releaseYear: 2024, genres: ['Drama'], metadata: {}, avgRating: 9.1, ratingsCount: 2401 },
  { id: '3', externalId: 'rawg-1', type: 'game', title: 'Hades II', posterUrl: 'https://media.rawg.io/media/games/4fd/4fdbdc91c0a4078e1c39f4549261bc5d.jpg', releaseYear: 2024, genres: ['Action'], metadata: {}, avgRating: 8.9, ratingsCount: 970 },
  { id: '4', externalId: 'ol-1', type: 'book', title: 'Tomorrow, and Tomorrow, and Tomorrow', posterUrl: 'https://covers.openlibrary.org/b/isbn/0593321200-L.jpg', releaseYear: 2022, genres: ['Fiction'], metadata: {}, avgRating: 8.4, ratingsCount: 1840 },
  { id: '5', externalId: 'tmdb-3', type: 'film', title: 'Dune: Part Two', posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', releaseYear: 2024, genres: ['Sci-Fi'], metadata: {}, avgRating: 9.0, ratingsCount: 3522 },
  { id: '6', externalId: 'ol-2', type: 'book', title: 'The Creative Act', posterUrl: 'https://covers.openlibrary.org/b/isbn/0593652886-L.jpg', releaseYear: 2023, genres: ['Nonfiction'], metadata: {}, avgRating: 8.1, ratingsCount: 612 },
];

export const sampleFeed: ActivityFeedItem[] = [
  { id: 1, actorId: 'u1', actor: { id: 'u1', username: 'maya', email: 'maya@spektra.test', avatarUrl: null, bio: null, createdAt: new Date().toISOString() }, verb: 'reviewed', objectId: '1', objectType: 'content', metadata: { title: 'Past Lives', thumbnail: sampleContent[0].posterUrl }, createdAt: '12m ago' },
  { id: 2, actorId: 'u2', actor: { id: 'u2', username: 'rio', email: 'rio@spektra.test', avatarUrl: null, bio: null, createdAt: new Date().toISOString() }, verb: 'rated', objectId: '5', objectType: 'content', metadata: { title: 'Dune: Part Two', rating: 9, thumbnail: sampleContent[4].posterUrl }, createdAt: '1h ago' },
  { id: 3, actorId: 'u3', actor: { id: 'u3', username: 'nara', email: 'nara@spektra.test', avatarUrl: null, bio: null, createdAt: new Date().toISOString() }, verb: 'status_changed', objectId: '3', objectType: 'content', metadata: { title: 'Hades II', status: 'in_progress', thumbnail: sampleContent[2].posterUrl }, createdAt: '3h ago' },
];
