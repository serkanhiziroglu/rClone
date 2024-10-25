'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Community } from '@/types/community';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    async function fetchCommunities() {
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCommunities(data || []);
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCommunities();

    // Set up real-time subscription
    const channel = supabase
      .channel('communities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communities'
        },
        async (payload) => {
          // Refetch all communities when there's any change
          const { data } = await supabase
            .from('communities')
            .select('*')
            .order('created_at', { ascending: false });
          
          setCommunities(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 pt-20">
        <div className="text-center py-8 text-gray-500">
          Loading communities...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Communities</h1>
        <Link
          href="/create-community"
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
        >
          Create Community
        </Link>
      </div>

      <div className="grid gap-4">
        {communities.length > 0 ? (
          communities.map((community) => (
            <Link
              key={community.id}
              href={`/r/${community.name}`}
              className="block p-4 border rounded-lg hover:border-orange-500 transition-colors"
            >
              <h2 className="text-lg font-semibold">r/{community.name}</h2>
              {community.description && (
                <p className="text-gray-600 mt-1">{community.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {community.member_count || 0} members
              </p>
            </Link>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No communities found. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
}