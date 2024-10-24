export type SortOption = 'hot' | 'new' | 'top';

export interface Post {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  type: 'text' | 'link';
  vote_count: number;
  comment_count: number;
  created_at: string;
  user_id: string;
  communities: {
    name: string;
  };
}

export interface UserVotes {
  [postId: string]: number;
}