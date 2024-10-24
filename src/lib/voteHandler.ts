import { supabase } from '@/lib/supabase';
import type { Post } from '@/types/community';

interface VoteParams {
  postId: string;
  userId: string;
  value: number;
  currentVotes: Record<string, number>;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  setUserVotes: (votes: Record<string, number>) => void;
}

export async function handleVote({
  postId,
  userId,
  value,
  currentVotes,
  posts,
  setPosts,
  setUserVotes
}: VoteParams) {
  const existingVote = currentVotes[postId];
  let voteChange = value;

  if (existingVote === value) {
    voteChange = -value;
  } else if (existingVote) {
    voteChange = 2 * value;
  }

  try {
    // Optimistic update
    setPosts(
      posts.map(post =>
        post.id === postId
          ? { ...post, vote_count: post.vote_count + voteChange }
          : post
      )
    );

    setUserVotes(prev => {
      if (existingVote === value) {
        const newVotes = { ...prev };
        delete newVotes[postId];
        return newVotes;
      }
      return {
        ...prev,
        [postId]: value
      };
    });

    if (existingVote === value) {
      await supabase
        .from('user_post_votes')
        .delete()
        .match({ 
          post_id: postId, 
          user_id: userId 
        });
    } else {
      await supabase
        .from('user_post_votes')
        .upsert({
          post_id: postId,
          user_id: userId,
          value: value
        });
    }

    await supabase.rpc('update_post_vote_count', {
      post_id: postId,
      vote_change: voteChange
    });

  } catch (error) {
    // Revert optimistic updates
    setPosts(
      posts.map(post =>
        post.id === postId
          ? { ...post, vote_count: post.vote_count - voteChange }
          : post
      )
    );
    
    setUserVotes(prev => {
      if (existingVote === value) {
        return { ...prev, [postId]: existingVote };
      }
      const newVotes = { ...prev };
      if (existingVote) {
        newVotes[postId] = existingVote;
      } else {
        delete newVotes[postId];
      }
      return newVotes;
    });

    throw error;
  }
}