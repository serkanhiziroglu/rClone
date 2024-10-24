// src/hooks/usePosts.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/types/post';

export function usePosts(sortBy: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First fetch posts with communities
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            type,
            url,
            vote_count,
            comment_count,
            created_at,
            user_id,
            communities (
              id,
              name
            )
          `)
          .order(sortBy === 'hot' ? 'hot_score' : 
                 sortBy === 'top' ? 'vote_count' : 
                 'created_at', { ascending: false, nullsLast: true });

        if (postsError) throw postsError;
        if (!postsData) throw new Error('No posts data received');

        // Then fetch usernames for all user_ids in the posts
        const userIds = [...new Set(postsData.map(post => post.user_id))];
        
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, username')
          .in('id', userIds);

        if (usersError) throw usersError;

        // Create a map of user_id to username
        const userMap = (usersData || []).reduce((acc, user) => ({
          ...acc,
          [user.id]: user.username
        }), {} as Record<string, string>);

        // Combine the data
        const postsWithUsernames = postsData.map(post => ({
          ...post,
          users: userMap[post.user_id] ? {
            id: post.user_id,
            username: userMap[post.user_id]
          } : null
        }));

        setPosts(postsWithUsernames as Post[]);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [sortBy]);

  return {
    posts,
    isLoading,
    error,
    userVotes,
    setPosts,
    setUserVotes,
  };
}