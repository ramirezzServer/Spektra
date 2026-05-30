export type ContentType = 'film' | 'series' | 'game' | 'book';
export type EntryStatus = 'want' | 'in_progress' | 'done';

export interface User {
  id: string;
  name?: string | null;
  username: string;
  email?: string;
  avatarUrl: string | null;
  bio: string | null;
  followersCount?: number;
  followingCount?: number;
  emailVerified?: boolean;
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

export interface FollowRelationship {
  isSelf: boolean;
  isFollowing: boolean;
}

export interface UserList {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  itemsCount?: number;
  previewItems?: ContentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ListItem {
  listId: string;
  contentId: string;
  position: number;
  content?: ContentItem;
  addedAt: string | null;
}

export interface ListDetail extends UserList {
  owner?: User;
  items: ListItem[];
}

export type List = UserList;

export interface ActivityFeedItem {
  id: number | string;
  actorId: string;
  actor?: User;
  verb: 'rated' | 'reviewed' | 'added_to_library' | 'status_changed' | 'added_to_list' | 'followed';
  objectId: string;
  objectType: string;
  content?: ContentItem;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  meta: {
    per_page: number;
    next_cursor: string | null;
    has_more: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    per_page?: number;
    total: number;
    lastPage?: number;
    last_page?: number;
  };
}
