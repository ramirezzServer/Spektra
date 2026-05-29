export type ContentType = 'film' | 'series' | 'game' | 'book';
export type EntryStatus = 'want' | 'in_progress' | 'done';

export interface User {
  id: string;
  name?: string | null;
  username: string;
  email?: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  externalId: string;
  type: ContentType;
  title: string;
  posterUrl: string | null;
  releaseYear: number | null;
  genres: string[];
  metadata: Record<string, unknown>;
  avgRating: number | null;
  ratingsCount: number;
}

export interface UserEntry {
  id: string;
  userId: string;
  contentId: string;
  content?: ContentItem;
  status: EntryStatus;
  rating: number | null;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total: number;
  byType: Record<ContentType, number>;
  byStatus: Record<EntryStatus, number>;
  ratedCount: number;
  reviewedCount: number;
}

export interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface List {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  itemCount?: number;
  createdAt: string;
}

export interface ActivityFeedItem {
  id: number;
  actorId: string;
  actor?: User;
  verb: 'rated' | 'reviewed' | 'added_to_list' | 'followed' | 'status_changed';
  objectId: string;
  objectType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    per_page?: number;
    total: number;
    lastPage: number;
    last_page?: number;
  };
}
