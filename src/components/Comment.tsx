// components/Comment.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import type { CommentType } from '@/types/comment';
import type { CommentSortOption } from '@/hooks/useComments';

interface CommentProps {
  comment: CommentType;
  postId: string;
  onVote: (commentId: string, value: number) => Promise<void>;
  userVotes: Record<string, number>;
  getTotalReplyCount: (comment: CommentType) => number;
  addComment: (content: string, parentId?: string) => Promise<any>;
}

export function Comment({ 
  comment, 
  postId, 
  onVote, 
  userVotes = {},
  getTotalReplyCount,
  addComment
}: CommentProps) {
  const { user } = useUser();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  const handleVoteClick = async (value: number) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }
    if (isVoting) return;

    setIsVoting(true);
    try {
      await onVote(comment.id, value);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!replyContent.trim()) return;

    try {
      await addComment(replyContent, comment.id);
      setReplyContent('');
      setIsReplying(false);
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply. Please try again.');
    }
  };

  // Get current user's vote for this comment
  const currentUserVote = userVotes[comment.id] || 0;

  return (
    <div className="border-l-2 border-gray-200 pl-4 mt-4">
      <div className="flex gap-2 text-sm text-gray-500">
        <span>u/{comment.users?.username || 'deleted'}</span>
        <span>•</span>
        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
      </div>

      <p className="my-2">{comment.content}</p>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVoteClick(1)}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              currentUserVote === 1
                ? 'text-orange-500 hover:bg-orange-50'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            aria-label="Upvote"
          >
            <FaArrowUp className="w-4 h-4" />
          </button>
          <span className={`text-sm font-medium min-w-[20px] text-center ${
            comment.vote_count > 0 
              ? 'text-orange-500' 
              : comment.vote_count < 0 
                ? 'text-blue-500' 
                : 'text-gray-500'
          }`}>
            {comment.vote_count || 0}
          </span>
          <button
            onClick={() => handleVoteClick(-1)}
            disabled={isVoting}
            className={`p-1 rounded transition-colors ${
              currentUserVote === -1
                ? 'text-blue-500 hover:bg-blue-50'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            aria-label="Downvote"
          >
            <FaArrowDown className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setIsReplying(!isReplying)}
          className="text-gray-500 hover:text-gray-700"
        >
          Reply
        </button>
      </div>

      {isReplying && (
        <form onSubmit={handleReply} className="mt-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full p-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!replyContent.trim()}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Reply
            </button>
            <button
              type="button"
              onClick={() => setIsReplying(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showReplies ? 'Hide' : 'Show'}{' '}
            {getTotalReplyCount(comment)} {getTotalReplyCount(comment) === 1 ? 'reply' : 'replies'}
          </button>

          {showReplies && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onVote={onVote}
                  userVotes={userVotes}
                  getTotalReplyCount={getTotalReplyCount}
                  addComment={addComment}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}