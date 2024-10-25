'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowUp, FaArrowDown, FaComment } from 'react-icons/fa';
import { SortControls } from './SortControls';
import type { SortOption } from '@/types/post';
import type { Post } from '@/types/post';
import type { Community } from '@/types/community';

interface PostListProps {
  posts: Post[];
  userVotes: Record<string, number>;
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
  const getPostUrl = (post: Post) => {
    // Get community name from post's communities object
    const communityName = post.communities?.name || community?.name;
    if (!communityName) return '#';
    return `/r/${communityName}/post/${post.id}`;
  };

  return (
    <div>
      {/* Sort controls */}
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
                  <div className="flex-1 min-w-0">
                    {/* Metadata */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Link
                        href={`/r/${post.communities.name}`}
                        className="hover:underline text-orange-500"
                      >
                        r/{post.communities.name}
                      </Link>
                      <span>•</span>
                      Posted by{' '}
                      {post.users ? (
                        <Link 
                          href={`/u/${post.users.username}`}
                          className="hover:underline"
                        >
                          u/{post.users.username}
                        </Link>
                      ) : (
                        <span>u/[deleted]</span>
                      )}
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Title and content */}
                    <Link 
                      href={getPostUrl(post)}
                      className="block group"
                    >
                      <h2 className="text-xl font-semibold group-hover:text-orange-500 mb-2">
                        {post.title}
                      </h2>
                      {post.type === 'text' && post.content && (
                        <div className="text-gray-700 mb-3">
                          <p className="line-clamp-3">
                            {post.content}
                          </p>
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

                    {/* Post actions */}
                    <div className="flex items-center gap-4 mt-2">
                      <Link
                        href={getPostUrl(post)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
                      >
                        <FaComment size={14} />
                        <span>{post.comment_count || 0} comments</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}