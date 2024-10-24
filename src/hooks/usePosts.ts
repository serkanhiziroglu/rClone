import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import type { Post, SortOption, UserVotes } from '@/types/post';

export function usePosts(sortBy: SortOption) {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      if (!mounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch posts with community information
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            url,
            type,
            vote_count,
            comment_count,
            created_at,
            user_id,
            communities!inner (
              name
            )
          `)
          .order(sortBy === 'hot' ? 'hot_score' : 
                 sortBy === 'new' ? 'created_at' : 
                 'vote_count', { ascending: false })
          .limit(50);

        if (postsError) {
          throw postsError;
        }

        if (!mounted) return;
        setPosts(postsData || []);

        // Only fetch votes if user is logged in
        if (user?.id && mounted) {
          try {
            // Convert Clerk user ID to UUID format if needed
            // This is a temporary solution - ideally, update the database schema
            // to use text type for user_id in user_post_votes table
            const { data: votesData } = await supabase
              .from('user_post_votes')
              .select('post_id, value')
              .eq('user_id', user.id.toString());

            if (mounted && votesData) {
              const votesMap = votesData.reduce<UserVotes>((acc, vote) => {
                acc[vote.post_id] = vote.value;
                return acc;
              }, {});
              setUserVotes(votesMap);
            }
          } catch (voteError) {
            // Log the vote error but don't fail the whole posts fetch
            console.warn('Failed to fetch user votes:', voteError);
            if (mounted) {
              setUserVotes({});
            }
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        if (mounted) {
          setError('Failed to load posts');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, [sortBy, user]);

  const updateLocalVote = (postId: string, value: number | null) => {
    setUserVotes(prev => {
      const next = { ...prev };
      if (value === null) {
        delete next[postId];
      } else {
        next[postId] = value;
      }
      return next;
    });
  };

  const updateLocalPostVoteCount = (postId: string, changeAmount: number) => {
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.id === postId
          ? { ...post, vote_count: post.vote_count + changeAmount }
          : post
      )
    );
  };

  return { 
    posts, 
    isLoading, 
    error, 
    userVotes, 
    setPosts, 
    setUserVotes,
    updateLocalVote,
    updateLocalPostVoteCount
  };
}