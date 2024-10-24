import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/types/post';

export function usePost(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [userVote, setUserVote] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`
            *,
            communities (
              id,
              name
            )
          `)
          .eq('id', postId)
          .single();

        if (postError) throw postError;
        if (!postData) throw new Error('Post not found');

        // Fetch username
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username')
          .eq('id', postData.user_id)
          .single();

        if (userError) throw userError;

        setPost({
          ...postData,
          users: userData
        });
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err instanceof Error ? err.message : 'Error fetching post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  return {
    post,
    isLoading,
    error,
    setPost,
    userVote
  };
}