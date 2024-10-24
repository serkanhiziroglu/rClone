// hooks/useUserComments.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { CommentType } from '@/types/Comment';

interface UserComment extends CommentType {
  community_name: string;
}

interface CommentStats {
  totalVotes: number;
}

export function useUserComments(userId: string | null) {
  const [comments, setComments] = useState<UserComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentStats, setCommentStats] = useState<CommentStats>({
    totalVotes: 0
  });

  useEffect(() => {
    const fetchUserComments = async () => {
      if (!userId) {
        setIsLoadingComments(false);
        return;
      }

      try {
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            posts (
              id,
              communities (
                name
              )
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (commentsError) throw commentsError;

        // Transform the data to include community name
        const transformedComments = commentsData.map(comment => ({
          ...comment,
          community_name: comment.posts.communities.name
        }));

        setComments(transformedComments);

        // Calculate comment stats
        const totalVotes = commentsData.reduce((sum, comment) => sum + (comment.vote_count || 0), 0);
        setCommentStats({
          totalVotes
        });

      } catch (err) {
        console.error('Error fetching user comments:', err);
      } finally {
        setIsLoadingComments(false);
      }
    };

    fetchUserComments();
  }, [userId]);

  return {
    comments,
    isLoadingComments,
    commentStats
  };
}