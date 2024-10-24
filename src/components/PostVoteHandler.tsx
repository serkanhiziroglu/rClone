import { useUser } from '@clerk/nextjs';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';

interface PostVoteHandlerProps {
  postId: string;
  voteCount: number;
  userVote: number;
  onVote: (postId: string, value: number) => void;
}

export function PostVoteHandler({ 
  postId, 
  voteCount, 
  userVote, 
  onVote 
}: PostVoteHandlerProps) {
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => onVote(postId, 1)}
        className={`p-1 rounded hover:bg-gray-100 ${
          userVote === 1 ? 'text-orange-500' : 'text-gray-500'
        }`}
      >
        <ArrowBigUp size={24} />
      </button>
      <span className="text-sm font-medium">
        {voteCount}
      </span>
      <button
        onClick={() => onVote(postId, -1)}
        className={`p-1 rounded hover:bg-gray-100 ${
          userVote === -1 ? 'text-blue-500' : 'text-gray-500'
        }`}
      >
        <ArrowBigDown size={24} />
      </button>
    </div>
  );
}