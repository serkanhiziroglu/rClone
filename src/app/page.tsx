'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { usePosts } from '@/hooks/usePosts';
import PostVoteHandler from '@/components/PostVoteHandler';
import { SortControls } from '@/components/SortControls';
import type { SortOption } from '@/types/post';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const { user } = useUser();
  const { posts, isLoading, error, userVotes, setPosts, setUserVotes } = usePosts(sortBy);

  const handleVote = async (postId: string, value: number) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }

    const existingVote = userVotes[postId];
    let voteChange = value;

    if (existingVote === value) {
      voteChange = -value;
    } else if (existingVote) {
      voteChange = 2 * value;
    }

    // Optimistically update UI
    setPosts(currentPosts => 
      currentPosts.map(post => 
        post.id === postId 
          ? { ...post, vote_count: post.vote_count + voteChange }
          : post
      )
    );

    setUserVotes(prev => {
      if (existingVote === value) {
        const newVotes = { ...prev };
        delete newVotes[postId];
        return newVotes;
      }
      return { ...prev, [postId]: value };
    });

    try {
      if (existingVote === value) {
        await supabase
          .from('user_post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_post_votes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            value: value
          });
      }

      await supabase.rpc('update_post_vote_count', {
        post_id: postId,
        vote_change: voteChange
      });
    } catch (error) {
      console.error('Error updating vote:', error);
      // Revert optimistic updates
      setPosts(posts);
      setUserVotes(userVotes);
    }
  };

  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (isLoading) return <div className="text-center py-8">Loading posts...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Popular Posts</h1>
          <Link
            href="/submit"
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Create Post
          </Link>
        </div>
        <SortControls sortBy={sortBy} setSortBy={setSortBy} />
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8">No posts yet.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg border p-4">
              <div className="flex gap-4">
                <PostVoteHandler
                  postId={post.id}
                  voteCount={post.vote_count}
                  userVote={userVotes[post.id]}
                  onVote={handleVote}
                />

                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">
                    Posted in{' '}
                    <Link
                      href={`/r/${post.communities.name}`}
                      className="text-orange-500 hover:underline"
                    >
                      r/{post.communities.name}
                    </Link>
                    {' '}by{' '}
                    <span className="hover:underline">
                      u/{post.users?.username || 'deleted'}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/r/${post.communities.name}/post/${post.id}`}
                    className="block group"
                  >
                    <h2 className="text-xl font-semibold group-hover:text-orange-500">
                      {post.title}
                    </h2>
                    {post.type === 'text' ? (
                      <p className="text-gray-700 mt-2">
                        {post.content?.substring(0, 300)}
                        {post.content?.length > 300 ? '...' : ''}
                      </p>
                    ) : (
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline mt-2 block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {post.url}
                      </a>
                    )}
                  </Link>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <Link
                      href={`/r/${post.communities.name}/post/${post.id}`}
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      <MessageSquare size={20} />
                      {post.comment_count || 0} comments
                    </Link>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
