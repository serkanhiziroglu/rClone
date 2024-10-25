// lib/voteHandler.ts
import { supabase } from '@/lib/supabase';

interface VoteHandlerProps {
  postId: string;
  userId: string;
  value: number;
  currentVotes: Record<string, number>;
  posts: any[];
  setPosts: (posts: any[]) => void;
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
}: VoteHandlerProps) {
  const previousVotes = { ...currentVotes };
  const previousPosts = [...posts];

  try {
    // Check existing vote first
    const { data: existingVote } = await supabase
      .from('user_post_votes')
      .select('value')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    let voteChange = 0;

    // Calculate vote change
    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote if clicking same button
        voteChange = -value;
        await supabase
          .from('user_post_votes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        // Update local state to remove vote
        setUserVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[postId];
          return newVotes;
        });
      } else {
        // Change vote direction
        voteChange = 2 * value;
        await supabase
          .from('user_post_votes')
          .update({ value })
          .eq('post_id', postId)
          .eq('user_id', userId);

        // Update local state with new vote
        setUserVotes(prev => ({
          ...prev,
          [postId]: value
        }));
      }
    } else {
      // New vote
      voteChange = value;
      const { error: voteError } = await supabase
        .from('user_post_votes')
        .insert({
          post_id: postId,
          user_id: userId,
          value: value
        });

      if (voteError) {
        throw voteError;
      }

      // Update local state with new vote
      setUserVotes(prev => ({
        ...prev,
        [postId]: value
      }));
    }

    // Update post vote count
    const { error: updateError } = await supabase.rpc('update_post_vote_count', {
      post_id: postId,
      vote_change: voteChange
    });

    if (updateError) throw updateError;

    // Update local posts state
    setPosts(currentPosts =>
      currentPosts.map(post =>
        post.id === postId
          ? { ...post, vote_count: (post.vote_count || 0) + voteChange }
          : post
      )
    );

  } catch (error) {
    console.error('Error handling vote:', error);
    // Revert to previous state on error
    setPosts(previousPosts);
    setUserVotes(previousVotes);
    throw error;
  }
}

// For comment votes
export async function handleCommentVote({
  commentId,
  userId,
  value,
  currentVotes,
  setCommentVotes,
  setComments
}: {
  commentId: string;
  userId: string;
  value: number;
  currentVotes: Record<string, number>;
  setCommentVotes: (votes: Record<string, number>) => void;
  setComments: (comments: any[]) => void;
}) {
  const previousVotes = { ...currentVotes };

  try {
    const { data: existingVote } = await supabase
      .from('comment_votes')
      .select('value')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();

    let voteChange = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote
        voteChange = -value;
        await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);

        setCommentVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[commentId];
          return newVotes;
        });
      } else {
        // Change vote
        voteChange = 2 * value;
        await supabase
          .from('comment_votes')
          .update({ value })
          .eq('comment_id', commentId)
          .eq('user_id', userId);

        setCommentVotes(prev => ({
          ...prev,
          [commentId]: value
        }));
      }
    } else {
      // New vote
      voteChange = value;
      const { error: voteError } = await supabase
        .from('comment_votes')
        .insert({
          comment_id: commentId,
          user_id: userId,
          value: value
        });

      if (voteError) throw voteError;

      setCommentVotes(prev => ({
        ...prev,
        [commentId]: value
      }));
    }

    // Update comment vote count
    await supabase
      .from('comments')
      .update({ vote_count: supabase.raw(`vote_count + ${voteChange}`) })
      .eq('id', commentId);

    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? { ...comment, vote_count: (comment.vote_count || 0) + voteChange }
          : comment
      )
    );

  } catch (error) {
    console.error('Error handling comment vote:', error);
    setCommentVotes(previousVotes);
    throw error;
  }
}