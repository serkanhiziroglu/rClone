'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { MessageSquare, Calendar, ArrowUpCircle, ClipboardList } from 'lucide-react';
import { useUserPosts } from '@/hooks/useUserPost';
import { PostVoteHandler } from '@/components/PostVoteHandler';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserComments } from '@/hooks/useUserComments';

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { posts, isLoading, error, stats } = useUserPosts(user?.id || null);
  const { comments, commentStats, isLoadingComments } = useUserComments(user?.id || null);
  const [activeTab, setActiveTab] = useState('posts');

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4 pt-20">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Please sign in to view your profile</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </Card>
      </div>
    );
  }

  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (isLoading) return <div className="text-center py-8">Loading profile...</div>;

  // Calculate total votes (from both posts and comments)
  const totalVotes = (stats.totalVotes || 0) + (commentStats.totalVotes || 0);

  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      {/* User Profile Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">u/{params.username}</h1>
            <p className="text-gray-500">
              Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => openUserProfile()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100"
          >
            Settings
          </button>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <ClipboardList className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <div className="text-gray-500">Posts</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <ArrowUpCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalVotes}</div>
            <div className="text-gray-500">Total Votes</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <MessageSquare className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <div className="text-gray-500">Comments</div>
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {posts.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600">Start sharing with the community!</p>
              <Link
                href="/submit"
                className="mt-4 inline-block px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Create Your First Post
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex gap-4">
                    <PostVoteHandler
                      postId={post.id}
                      voteCount={post.vote_count}
                      userVote={0}
                      onVote={() => {}}
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
                      </div>

                      <Link 
                        href={`/r/${post.communities.name}/post/${post.id}`}
                        className="block group"
                      >
                        <h2 className="text-xl font-semibold group-hover:text-orange-500">
                          {post.title}
                        </h2>
                        {post.type === 'text' && (
                          <p className="text-gray-700 mt-2">
                            {post.content?.substring(0, 300)}
                            {post.content?.length > 300 ? '...' : ''}
                          </p>
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
                        <span className="flex items-center gap-1">
                          <Calendar size={20} />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments">
          {isLoadingComments ? (
            <div className="text-center py-8">Loading comments...</div>
          ) : comments.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No comments yet</h3>
              <p className="text-gray-600">Join the conversation by commenting on posts!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="text-sm text-gray-500 mb-2">
                    Commented on a post in{' '}
                    <Link
                      href={`/r/${comment.community_name}/post/${comment.post_id}`}
                      className="text-orange-500 hover:underline"
                    >
                      r/{comment.community_name}
                    </Link>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <ArrowUpCircle size={16} />
                      {comment.vote_count} votes
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}