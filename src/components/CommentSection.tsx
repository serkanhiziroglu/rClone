// components/CommentSection.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useComments, CommentSortOption } from '@/hooks/useComments';
import { Comment } from '@/components/Comment';
import type { CommentType } from '@/types/comment';

export function CommentSection({ postId }: { postId: string }) {
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

  const handleSortChange = (newSortOption: CommentSortOption) => {
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
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as CommentSortOption)}
          className="p-2 border rounded-md bg-white hover:bg-gray-50 cursor-pointer"
        >
          <option value="hot">Best</option>
          <option value="new">New</option>
          <option value="controversial">Controversial</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? 'What are your thoughts?' : 'Please sign in to comment'}
          disabled={!user}
          className="w-full p-3 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          rows={4}
        />
        <button
          type="submit"
          disabled={!user || !newComment.trim()}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Comment
        </button>
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