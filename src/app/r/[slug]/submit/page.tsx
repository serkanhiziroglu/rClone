// app/r/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { CommunityHeader } from '@/components/CommunityHeader';
import { PostList } from '@/components/PostList';
import { getCommunity, getPosts } from '@/lib/api';
import { handleVote } from '@/lib/voteHandler';

export default function CommunityPage({ params }: { params: { slug: string } }) {
  const { user } = useUser();
  const router = useRouter();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('hot');
  const [userVotes, setUserVotes] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const community = await getCommunity(params.slug);
      setCommunity(community);
      const posts = await getPosts(community.id, sortBy);
      setPosts(posts);
      setIsLoading(false);
    }

    loadData();
  }, [params.slug, sortBy]);

  if (isLoading) return <div>Loading...</div>;
  if (!community) return <div>Community not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <CommunityHeader community={community} />
      <PostList posts={posts} userVotes={userVotes} handleVote={handleVote} community={community} />
    </div>
  );
}
