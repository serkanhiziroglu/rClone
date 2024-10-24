import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import type { Community, Post, SortOption } from '@/types/community';

export function useCommunityData(slug: string, sortBy: SortOption) {
  const { user } = useUser();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        if (!mounted) return;
        setIsLoading(true);
        setError(null);
        
        // Fetch community
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('*')
          .eq('name', slug)
          .single();

        if (communityError) throw communityError;
        if (!communityData) throw new Error('Community not found');
        if (!mounted) return;
        
        setCommunity(communityData);
        
        // Fetch posts
        let query = supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            url,
            type,
            user_id,
            community_id,
            created_at,
            vote_count,
            comment_count
          `)
          .eq('community_id', communityData.id);

        switch (sortBy) {
          case 'hot':
            query = query.order('hot_score', { ascending: false });
            break;
          case 'new':
            query = query.order('created_at', { ascending: false });
            break;
          case 'top':
            query = query.order('vote_count', { ascending: false });
            break;
        }

        const { data: postsData, error: postsError } = await query;
        if (postsError) throw postsError;
        if (!mounted) return;
        
        setPosts(postsData || []);

        // Fetch user votes if logged in
        if (user?.id && mounted) {
          const { data: votesData } = await supabase
            .from('user_post_votes')
            .select('post_id, value')
            .eq('user_id', user.id.toString());

          if (mounted && votesData) {
            const votesMap = votesData.reduce((acc, vote) => ({
              ...acc,
              [vote.post_id]: vote.value
            }), {});
            setUserVotes(votesMap);
          }
        }

      } catch (error) {
        console.error('Error loading data:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [slug, sortBy, user]);

  return { community, posts, userVotes, isLoading, error, setPosts, setUserVotes };
}