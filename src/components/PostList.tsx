// src/components/PostList.tsx
'use client';

import React from 'react';
import { Flame, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

type SortOption = 'hot' | 'new' | 'top';

interface Post {
  id: string;
  title: string;
  content: string | null;
  vote_count: number;
  created_at: string;
  comment_count: number;
  user_id: string;
  profiles?: {
    username: string;
  };
}

interface Community {
  id: string;
  name: string;
}

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
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => setSortBy('hot')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md ${
          sortBy === 'hot'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <Flame size={20} /> Hot
      </button>
      <button
        onClick={() => setSortBy('new')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md ${
          sortBy === 'new'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <Clock size={20} /> New
      </button>
      <button
        onClick={() => setSortBy('top')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md ${
          sortBy === 'top'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <TrendingUp size={20} /> Top
      </button>
    </div>

    {posts.length > 0 ? (
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white border rounded-lg p-4">
            <div className="flex gap-4">
              {/* Vote buttons */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => handleVote(post.id, 1)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    userVotes[post.id] === 1 ? 'text-orange-500' : 'text-gray-500'
                  }`}
                >
                  <FaArrowUp size={20} />
                </button>
                <span className="text-sm font-medium">
                  {post.vote_count}
                </span>
                <button
                  onClick={() => handleVote(post.id, -1)}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    userVotes[post.id] === -1 ? 'text-blue-500' : 'text-gray-500'
                  }`}
                >
                  <FaArrowDown size={20} />
                </button>
              </div>

              {/* Post content */}
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">
                  Posted by u/{post.profiles?.username || post.user_id}
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
    ) : (
      <p className="text-gray-500">No posts yet. Be the first to create one!</p>
    )}
  </div>
);

export default PostList;