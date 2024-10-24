export interface Community {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count: number;
  type: string;
  creator_id: string;
}

export interface Post {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  type: string;
  vote_count: number;
  comment_count: number;
  created_at: string;
  user_id: string;
  community_id: string;
}

export interface Vote {
  post_id: string;
  value: number;
}

export type SortOption = 'hot' | 'new' | 'top';