import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { CommentType } from '@/types/Comment';

interface UserComment extends CommentType {
  community_name: string;
}

interface CommentStats {
  totalVotes: number;
  totalComments: number;
}

export function useUserComments(userId: string | null) {
  const [comments, setComments] = useState<UserComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [commentStats, setCommentStats] = useState<CommentStats>({
    totalVotes: 0,
    totalComments: 0
  });

  useEffect(() => {
    const fetchUserComments = async () => {
      if (!userId) {
        setIsLoadingComments(false);
        return;
      }

      try {
        // First, get the comments count
        const { count, error: countError } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (countError) throw countError;

        // Then get the actual comments with their details
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
          totalVotes,
          totalComments: count || 0
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