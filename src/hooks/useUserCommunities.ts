// hooks/useUserCommunities.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Community } from '@/types/community';

export function useUserCommunities(userId: string | null) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCommunities() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('community_members')
          .select(`
            community_id,
            role,
            joined_at,
            communities (
              id,
              name,
              description,
              member_count,
              type,
              created_at
            )
          `)
          .eq('user_id', userId);

        if (error) throw error;

        const joinedCommunities = data
          ?.map(item => ({
            ...item.communities,
            role: item.role,
            joined_at: item.joined_at
          }))
          .sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime());

        setCommunities(joinedCommunities || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch communities');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCommunities();
  }, [userId]);

  return { communities, isLoading, error };
}