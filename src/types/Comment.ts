export interface CommentType {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    post_id: string;
    parent_id: string | null;
    vote_count: number;
    users: {
      id: string;
      username: string;
    } | null;
    replies?: CommentType[];
  }