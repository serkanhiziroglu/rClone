'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { MessageSquare, Calendar, ArrowUpCircle, ClipboardList, Users, Settings, User } from 'lucide-react';
import { useUserPosts } from '@/hooks/useUserPost';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useUserComments } from '@/hooks/useUserComments';
import { useUserCommunities } from '@/hooks/useUserCommunities';
import PostList from '@/components/PostList';
import type { SortOption } from '@/types/post';

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { posts, isLoading, error, stats } = useUserPosts(user?.id || null);
  const { comments, commentStats, isLoadingComments } = useUserComments(user?.id || null);
  const { communities, isLoading: isLoadingCommunities } = useUserCommunities(user?.id || null);
  const [activeTab, setActiveTab] = useState('posts');
  const [sortBy, setSortBy] = useState<SortOption>('new');
  const userVotes = {};

  const handleVote = (postId: string, value: number) => {
    console.log(`Voted on post ${postId} with value ${value}`);
    // Implement vote handling logic
  };

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
  const totalVotes = (stats?.totalVotes || 0) + (commentStats?.totalVotes || 0);

  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      {/* User Profile Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <User className="w-12 h-12 text-gray-400 bg-gray-100 rounded-full p-2" />
              <div>
                <h1 className="text-2xl font-bold">u/{params.username}</h1>
                <p className="text-gray-500">
                  Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => openUserProfile()}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <ClipboardList className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats?.totalPosts || 0}</div>
            <div className="text-gray-500">Posts</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <ArrowUpCircle className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalVotes}</div>
            <div className="text-gray-500">Total Votes</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <MessageSquare className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{stats?.totalComments || 0}</div>
            <div className="text-gray-500">Comments</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communities?.length || 0}</div>
            <div className="text-gray-500">Communities</div>
          </div>
        </div>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          <TabsTrigger value="comments" className="flex-1">Comments</TabsTrigger>
          <TabsTrigger value="communities" className="flex-1">Communities</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {posts?.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600">Share something with the community!</p>
              <Link href="/submit">
                <Button className="mt-4">Create Post</Button>
              </Link>
            </Card>
          ) : (
            <PostList
              posts={posts}
              userVotes={userVotes}
              handleVote={handleVote}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          )}
        </TabsContent>

        <TabsContent value="comments">
          {isLoadingComments ? (
            <div className="text-center py-8">Loading comments...</div>
          ) : comments?.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No comments yet</h3>
              <p className="text-gray-600">Join the conversation by commenting on posts!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments?.map((comment) => (
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
                      {comment.vote_count || 0} votes
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

        <TabsContent value="communities">
          {isLoadingCommunities ? (
            <div className="text-center py-8">Loading communities...</div>
          ) : communities?.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No communities joined</h3>
              <p className="text-gray-600">
                Join some communities to see them here!
              </p>
              <Link href="/communities">
                <Button className="mt-4">Browse Communities</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4">
              {communities?.map((community) => (
                <Link
                  key={community.id}
                  href={`/r/${community.name}`}
                  className="block"
                >
                  <Card className="p-4 hover:border-orange-500 transition-colors">
                    <h3 className="text-lg font-semibold">r/{community.name}</h3>
                    {community.description && (
                      <p className="text-gray-600 mt-1">{community.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        {community.member_count.toLocaleString()} members
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        Joined {new Date(community.joined_at).toLocaleDateString()}
                      </span>
                      {community.role !== 'member' && (
                        <>
                          <span>•</span>
                          <span className="capitalize text-orange-500 font-medium">
                            {community.role}
                          </span>
                        </>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}