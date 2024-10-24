'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { SortControls } from './SortControls';
import type { SortOption } from '@/types/post';
import { Post } from '@/types/post';



interface PostListProps {
  posts: Post[];
  userVotes: Record<string, number>;
  handleVote: (postId: string, value: number) => void;
  community: Community;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
}

const PostList: React.FC<PostListProps> = ({ 
  posts, 
  userVotes, 
  handleVote, 
  community,
  sortBy,
  setSortBy 
}) => (
  <div className="bg-white rounded-lg border p-6">
    <SortControls sortBy={sortBy} setSortBy={setSortBy} />

    {posts.length === 0 ? (
      <p className="text-gray-500">No posts yet. Be the first to create one!</p>
    ) : (
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white border rounded-lg p-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleVote(post.id, 1)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    userVotes[post.id] === 1 ? 'text-orange-500' : 'text-gray-500'
                  }`}
                >
                  <FaArrowUp size={20} />
                </button>
                <span className="text-sm font-medium">{post.vote_count}</span>
                <button
                  onClick={() => handleVote(post.id, -1)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    userVotes[post.id] === -1 ? 'text-blue-500' : 'text-gray-500'
                  }`}
                >
                  <FaArrowDown size={20} />
                </button>
              </div>

              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">
                  Posted by u/{post.users?.username || 'deleted'}
                </div>
                
                <Link 
                  href={`/r/${community.name}/post/${post.id}`}
                  className="block group"
                >
                  <h2 className="text-xl font-semibold group-hover:text-orange-500">
                    {post.title}
                  </h2>
                  {post.content && (
                    <p className="text-gray-700 mt-2">
                      {post.content.substring(0, 300)}
                      {post.content.length > 300 ? '...' : ''}
                    </p>
                  )}
                </Link>

                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <Link
                    href={`/r/${community.name}/post/${post.id}`}
                    className="hover:text-gray-700"
                  >
                    {post.comment_count || 0} comments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default PostList;
