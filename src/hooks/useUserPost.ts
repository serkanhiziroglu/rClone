// hooks/useUserPosts.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/types/post';

export function useUserPosts(userId: string | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalVotes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user's posts with community info and vote counts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            communities (
              id,
              name
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        // Fetch username
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        // Combine the data
        const postsWithUserData = postsData.map(post => ({
          ...post,
          users: userData
        }));

        setPosts(postsWithUserData);

        // Calculate stats
        const totalVotes = postsData.reduce((sum, post) => sum + (post.vote_count || 0), 0);
        const totalComments = postsData.reduce((sum, post) => sum + (post.comment_count || 0), 0);

        setStats({
          totalPosts: postsData.length,
          totalVotes: totalVotes,
          totalComments: totalComments,
        });

      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  return {
    posts,
    isLoading,
    error,
    stats,
    setPosts
  };
}