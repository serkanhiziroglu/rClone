export interface Community {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  creator_id: string;
  type: string;
  member_count: number;
}
export interface Vote {
  post_id: string;
  value: number;
}

export type SortOption = 'hot' | 'new' | 'top';