'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useComments } from '@/hooks/useComments';
import { Comment } from '@/components/Comment';
import { Button } from '@/components/ui/button';
import type { CommentType } from '@/types/Comment';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const {
    comments,
    isLoading,
    error,
    addComment,
    handleVote,
    userVotes,
    sortBy,
    setSortBy,
    getTotalReplyCount,
    getTotalCommentCount
  } = useComments(postId);

  const handleSortChange = (newSortOption: 'hot' | 'new' | 'controversial') => {
    setSortBy(newSortOption);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) return;

    try {
      await addComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (isLoading) return <div>Loading comments...</div>;

  // Calculate total comments including all replies
  const totalComments = getTotalCommentCount(comments);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
        </h2>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'hot' ? 'default' : 'ghost'}
            onClick={() => handleSortChange('hot')}
            className="text-sm"
          >
            Best
          </Button>
          <Button
            variant={sortBy === 'new' ? 'default' : 'ghost'}
            onClick={() => handleSortChange('new')}
            className="text-sm"
          >
            New
          </Button>
          <Button
            variant={sortBy === 'controversial' ? 'default' : 'ghost'}
            onClick={() => handleSortChange('controversial')}
            className="text-sm"
          >
            Controversial
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? 'What are your thoughts?' : 'Please sign in to comment'}
          disabled={!user}
          className={`w-full p-3 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500
            ${!user ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-gray-400'}`}
          rows={4}
        />
        <Button
          type="submit"
          disabled={!user || !newComment.trim()}
          className="w-full sm:w-auto"
        >
          Comment
        </Button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            postId={postId}
            onVote={handleVote}
            userVotes={userVotes}
            getTotalReplyCount={getTotalReplyCount}
            addComment={addComment}
          />
        ))}
      </div>
    </div>
  );
}