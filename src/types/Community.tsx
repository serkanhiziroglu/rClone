export interface Community {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    creator_id: string;
    member_count: number;
    type: 'public' | 'private' | 'restricted';
  }