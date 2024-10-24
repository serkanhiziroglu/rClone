'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePost } from '@/hooks/usePost';
import { CommentSection } from '@/components/CommentSection';
import { PostVoteHandler } from '@/components/PostVoteHandler';
import { handleVote } from '@/lib/voteHandler';
import Link from 'next/link';

export default function PostDetailContent({ 
  communitySlug, 
  postId 
}: { 
  communitySlug: string;
  postId: string;
}) {
  const { user } = useUser();
  const { post, comments, isLoading, error, setPost, userVote } = usePost(postId);

  const onVote = async (value: number) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }

    try {
      await handleVote({
        postId,
        userId: user.id,
        value,
        currentVotes: { [postId]: userVote },
        posts: post ? [post] : [],
        setPosts: (posts) => setPost(posts[0]),
      });
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
    }
  };

  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!post) return <div className="text-center py-8">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <div className="bg-white rounded-lg border p-4">
        <div className="flex gap-4">
          <PostVoteHandler
            postId={post.id}
            voteCount={post.vote_count}
            userVote={userVote}
            onVote={onVote}
          />

          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">
              Posted in{' '}
              <Link
                href={`/r/${communitySlug}`}
                className="text-orange-500 hover:underline"
              >
                r/{communitySlug}
              </Link>
              {' '}by{' '}
              <span className="hover:underline">
                u/{post.users?.username || 'deleted'}
              </span>
            </div>

            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
            
            {post.type === 'text' ? (
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            ) : (
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {post.url}
              </a>
            )}
          </div>
        </div>
      </div>

      <CommentSection postId={postId} />
    </div>
  );
}