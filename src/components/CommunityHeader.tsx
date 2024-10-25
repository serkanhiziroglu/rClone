'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import type { Community } from '@/types/community';

interface CommunityHeaderProps {
  community: Community;
  slug: string;
}

export default function CommunityHeader({ community: initialCommunity, slug }: CommunityHeaderProps) {
  const { user } = useUser();
  const [isMember, setIsMember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [community, setCommunity] = useState(initialCommunity);

  // Function to fetch the current member count
  const fetchMemberCount = async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('member_count')
      .eq('id', community.id)
      .single();
    
    if (!error && data) {
      setCommunity(prev => ({ ...prev, member_count: data.member_count }));
    }
  };

  // Function to update membership and member count
  const updateMembership = async (shouldJoin: boolean) => {
    try {
      if (shouldJoin) {
        await supabase
          .from('community_members')
          .insert({
            community_id: community.id,
            user_id: user.id,
            role: 'member'
          });

        // Increment member count
        await supabase.rpc('increment_member_count', { community_id: community.id });
      } else {
        await supabase
          .from('community_members')
          .delete()
          .eq('community_id', community.id)
          .eq('user_id', user.id);

        // Decrement member count
        await supabase.rpc('decrement_member_count', { community_id: community.id });
      }

      // Fetch updated count
      await fetchMemberCount();
    } catch (error) {
      console.error('Error updating membership:', error);
      throw error;
    }
  };

  // Check initial membership
  useEffect(() => {
    async function checkMembership() {
      if (!user) {
        setIsMember(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('community_members')
          .select('id')
          .eq('community_id', community.id)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsMember(!!data);
      } catch (error) {
        console.error('Error checking membership:', error);
      }
    }

    checkMembership();
  }, [user, community.id]);

  // Subscribe to member count changes
  useEffect(() => {
    const channel = supabase
      .channel('member_count_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_members',
          filter: `community_id=eq.${community.id}`
        },
        () => {
          fetchMemberCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [community.id]);

  const handleJoinLeave = async () => {
    if (!user) {
      alert('Please sign in to join communities');
      return;
    }

    setIsLoading(true);

    try {
      await updateMembership(!isMember);
      setIsMember(!isMember);
    } catch (error) {
      console.error('Error updating membership:', error);
      alert('Failed to update membership. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">r/{community.name}</h1>
          <p className="text-gray-600 mt-2">
            {community.description || 'No description available'}
          </p>
        </div>
        <div className="flex gap-2">
          {user && (
            <Button
              onClick={handleJoinLeave}
              disabled={isLoading}
              variant={isMember ? "outline" : "default"}
              className={isMember ? "hover:bg-red-50 hover:text-red-500" : ""}
            >
              {isLoading ? 'Loading...' : isMember ? 'Leave' : 'Join'}
            </Button>
          )}
          <Link href={`/r/${community.name}/submit`}>
            <Button>Create Post</Button>
          </Link>
        </div>
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <span>{community.member_count || 0} members</span>
        <span className="mx-2">•</span>
        <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}