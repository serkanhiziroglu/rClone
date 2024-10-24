export type SortOption = 'hot' | 'new' | 'top';

export interface Post {
  id: string;
  title: string;
  content: string | null;
  type: 'text' | 'link';
  url?: string;
  vote_count: number;
  comment_count: number;
  created_at: string;
  user_id: string;
  communities: {
    id: string;
    name: string;
  };
  users: {
    id: string;
    username: string;
  } | null;
}

export interface UserVotes {
  [postId: string]: number;
}