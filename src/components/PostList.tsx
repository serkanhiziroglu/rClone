'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { MessageSquare } from 'lucide-react';
import { SortControls } from '@/components/SortControls'; // This import is now correct
import type { SortOption, Post, UserVotes } from '@/types/post';
import type { Community } from '@/types/community';

interface PostListProps {
  posts: Post[];
  userVotes: UserVotes;
  handleVote: (postId: string, value: number) => void;
  community?: Community | null;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

export default function PostList({ 
  posts, 
  userVotes, 
  handleVote, 
  community,
  sortBy,
  setSortBy 
}: PostListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevPostsLength = useRef(posts.length);

  useEffect(() => {
    // If posts length increased (new post added)
    if (posts.length > prevPostsLength.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevPostsLength.current = posts.length;
  }, [posts.length]);

  return (
    <div>
      {/* Sort controls in their own container with proper spacing */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <SortControls sortBy={sortBy} setSortBy={setSortBy} />
      </div>

      {/* Posts container */}
      <div className="bg-white rounded-lg border">
        {!posts?.length ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">No posts yet. Be the first to create one!</p>
            {community?.name && (
              <Link
                href={`/r/${community.name}/submit`}
                className="inline-block px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Create Post
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <div key={post.id} className="p-4">
                <div className="flex gap-4">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleVote(post.id, 1)}
                      className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                        userVotes[post.id] === 1 ? 'text-orange-500' : 'text-gray-500'
                      }`}
                      aria-label="Upvote"
                    >
                      <FaArrowUp size={20} />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      {post.vote_count || 0}
                    </span>
                    <button
                      onClick={() => handleVote(post.id, -1)}
                      className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                        userVotes[post.id] === -1 ? 'text-blue-500' : 'text-gray-500'
                      }`}
                      aria-label="Downvote"
                    >
                      <FaArrowDown size={20} />
                    </button>
                  </div>

                  {/* Post content */}
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                      {post.communities && (
                        <>
                          Posted in{' '}
                          <Link
                            href={`/r/${post.communities.name}`}
                            className="text-orange-500 hover:underline"
                          >
                            r/{post.communities.name}
                          </Link>
                          {' '}by{' '}
                        </>
                      )}
                      <Link
                        href={`/u/${post.users?.username || '[deleted]'}`}
                        className="hover:underline"
                      >
                        u/{post.users?.username || '[deleted]'}
                      </Link>
                    </div>

                    <Link 
                      href={`/r/${post.communities?.name || community?.name}/post/${post.id}`}
                      className="block group"
                    >
                      <h2 className="text-xl font-semibold group-hover:text-orange-500 mb-2">
                        {post.title}
                      </h2>
                      {post.type === 'text' && post.content && (
                        <div className="text-gray-700 mb-3">
                          <p className="line-clamp-3">{post.content}</p>
                        </div>
                      )}
                      {post.type === 'link' && post.url && (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline break-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {post.url}
                        </a>
                      )}
                    </Link>

                    {/* Post metadata */}
                    <div className="flex items-center gap-4 mt-2">
                      <Link
                        href={`/r/${post.communities?.name || community?.name}/post/${post.id}`}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
                      >
                        <MessageSquare size={14} />
                        <span>{post.comment_count || 0} comments</span>
                      </Link>
                      <span className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}