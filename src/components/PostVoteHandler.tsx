'use client';

import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface PostVoteHandlerProps {
  postId: string;
  voteCount: number;
  userVote: number | undefined;
  onVote: (postId: string, value: number) => void;
}

export default function PostVoteHandler({
  postId,
  voteCount,
  userVote,
  onVote
}: PostVoteHandlerProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onVote(postId, 1)}
        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
          userVote === 1 ? 'text-orange-500' : 'text-gray-500'
        }`}
        aria-label="Upvote"
      >
        <FaArrowUp size={20} />
      </button>
      <span className="text-sm font-medium text-gray-700">
        {isNaN(voteCount) ? 0 : voteCount}
      </span>
      <button
        onClick={() => onVote(postId, -1)}
        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
          userVote === -1 ? 'text-blue-500' : 'text-gray-500'
        }`}
        aria-label="Downvote"
      >
        <FaArrowDown size={20} />
      </button>
    </div>
  );
}