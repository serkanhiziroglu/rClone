'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import PostList from '@/components/PostList';
import CommunityHeader from '@/components/CommunityHeader';
import { useCommunityData } from '@/hooks/useCommunityData';
import { handleVote } from '@/lib/voteHandler';
import type { SortOption } from '@/types/community';

export default function CommunityPageContent({ slug }: { slug: string }) {
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const { user } = useUser();
  const { 
    community, 
    posts, 
    userVotes, 
    isLoading, 
    error,
    setPosts,
    setUserVotes
  } = useCommunityData(slug, sortBy);

  const onVote = async (postId: string, value: number) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }

    try {
      await handleVote({
        postId,
        userId: user.id,
        value,
        currentVotes: userVotes,
        posts,
        setPosts,
        setUserVotes
      });
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 pt-20">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 pt-20">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-4xl mx-auto p-4 pt-20">
        <div className="text-center">Community not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <CommunityHeader 
        community={community} 
        slug={slug}
      />
      <PostList 
        posts={posts} 
        userVotes={userVotes} 
        handleVote={onVote} 
        community={community}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </div>
  );
}