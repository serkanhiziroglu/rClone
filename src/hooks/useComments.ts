import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import type { CommentType } from '@/types/comment';

export type CommentSortOption = 'new' | 'hot' | 'controversial';

export function useComments(postId: string) {
  const { user } = useUser();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [sortBy, setSortBy] = useState<CommentSortOption>('hot');

  const getTotalReplyCount = useCallback((comment: CommentType): number => {
    if (!comment.replies?.length) return 0;
    return comment.replies.reduce((total, reply) => {
      // Count this reply
      let count = 1;
      // Add all nested replies
      count += getTotalReplyCount(reply);
      return total + count;
    }, 0);
  }, []);

  const getTotalCommentCount = useCallback((comments: CommentType[]): number => {
    return comments.reduce((total, comment) => {
      // Count the comment itself
      let count = 1;
      // Add all replies recursively
      count += getTotalReplyCount(comment);
      return total + count;
    }, 0);
  }, [getTotalReplyCount]);

  const fetchUserVotes = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('comment_votes')
      .select('comment_id, value')
      .eq('user_id', user.id);

    if (data) {
      const votes = data.reduce((acc, vote) => ({
        ...acc,
        [vote.comment_id]: vote.value
      }), {});
      setUserVotes(votes);
    }
  };

  const sortComments = useCallback((commentsToSort: CommentType[]) => {
    const sortFunctions = {
      new: (a: CommentType, b: CommentType) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      hot: (a: CommentType, b: CommentType) => b.vote_count - a.vote_count,
      controversial: (a: CommentType, b: CommentType) => {
        // More negative votes = more controversial
        if (a.vote_count < 0 && b.vote_count >= 0) return -1; // a comes first
        if (b.vote_count < 0 && a.vote_count >= 0) return 1;  // b comes first
        
        // For both negative or both positive, higher absolute value = more controversial
        const aAbs = Math.abs(a.vote_count);
        const bAbs = Math.abs(b.vote_count);
        
        if (aAbs === bAbs) {
          // If same absolute value, more negative comes first
          return a.vote_count - b.vote_count;
        }
        
        // Higher absolute value comes first
        return bAbs - aAbs;
      }
    };

    const sortedComments = [...commentsToSort].sort(sortFunctions[sortBy]);
    return sortedComments.map(comment => ({
      ...comment,
      replies: comment.replies ? sortComments(comment.replies) : []
    }));
  }, [sortBy]);

  
  const fetchComments = async () => {
    try {
      const { data: allComments, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          users:user_id (
            id,
            username
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Build comment hierarchy
      const commentMap = new Map();
      const topLevelComments: CommentType[] = [];

      allComments?.forEach(comment => {
        const commentWithReplies = {
          ...comment,
          replies: []
        };
        commentMap.set(comment.id, commentWithReplies);

        if (!comment.parent_id) {
          topLevelComments.push(commentWithReplies);
        }
      });

      allComments?.forEach(comment => {
        if (comment.parent_id) {
          const parentComment = commentMap.get(comment.parent_id);
          if (parentComment) {
            parentComment.replies.push(commentMap.get(comment.id));
          }
        }
      });

      const sortedComments = sortComments(topLevelComments);
      setComments(sortedComments);

      // Calculate total comment count including all replies
      const totalCount = getTotalCommentCount(sortedComments);
      setCommentCount(totalCount);

      await supabase
        .from('posts')
        .update({ comment_count: totalCount })
        .eq('id', postId);

    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };
  const handleVote = async (commentId: string, value: number) => {
    if (!user) {
      alert('Please sign in to vote');
      return;
    }

    const existingVote = userVotes[commentId];
    let voteChange = value;

    if (existingVote === value) {
      voteChange = -value;
    } else if (existingVote) {
      voteChange = 2 * value;
    }

    // Optimistically update UI
    const updateCommentVotes = (comments: CommentType[]): CommentType[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            vote_count: comment.vote_count + voteChange,
          };
        }
        if (comment.replies?.length) {
          return {
            ...comment,
            replies: updateCommentVotes(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(prevComments => {
      const updatedComments = updateCommentVotes(prevComments);
      return sortComments(updatedComments);
    });

    setUserVotes(prev => {
      if (existingVote === value) {
        const newVotes = { ...prev };
        delete newVotes[commentId];
        return newVotes;
      }
      return { ...prev, [commentId]: value };
    });

    try {
      const { error: transactionError } = await supabase.rpc(
        'handle_comment_vote',
        {
          p_comment_id: commentId,
          p_user_id: user.id,
          p_value: value,
          p_existing_value: existingVote || 0
        }
      );

      if (transactionError) throw transactionError;
    } catch (error) {
      console.error('Error updating vote:', error);
      fetchComments();
      fetchUserVotes();
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    if (!user) throw new Error('Must be logged in to comment');

    try {
      const newComment = {
        content,
        post_id: postId,
        user_id: user.id,
        parent_id: parentId || null,
        vote_count: 0
      };

      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert(newComment)
        .select(`
          *,
          users:user_id (
            id,
            username
          )
        `)
        .single();

      if (commentError) throw commentError;

      const commentWithReplies = {
        ...commentData,
        replies: []
      };

      setComments(prevComments => {
        if (!parentId) {
          const newComments = [...prevComments, commentWithReplies];
          return sortComments(newComments);
        }

        const updateReplies = (comments: CommentType[]): CommentType[] => {
          return comments.map(comment => {
            if (comment.id === parentId) {
              const updatedComment = {
                ...comment,
                replies: [...(comment.replies || []), commentWithReplies]
              };
              updatedComment.replies = sortComments(updatedComment.replies);
              return updatedComment;
            }
            if (comment.replies?.length) {
              return {
                ...comment,
                replies: updateReplies(comment.replies)
              };
            }
            return comment;
          });
        };

        const updatedComments = updateReplies(prevComments);
        return sortComments(updatedComments);
      });

      setCommentCount(prev => prev + 1);
      
      await supabase
        .from('posts')
        .update({ comment_count: commentCount + 1 })
        .eq('id', postId);

      return commentWithReplies;
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  };
  useEffect(() => {
    fetchComments();
    fetchUserVotes();

    const commentsSubscription = supabase
      .channel('comments-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    const votesSubscription = supabase
      .channel('comment-votes-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comment_votes'
        },
        () => {
          fetchComments();
          fetchUserVotes();
        }
      )
      .subscribe();

    return () => {
      commentsSubscription.unsubscribe();
      votesSubscription.unsubscribe();
    };
  }, [postId]);

  useEffect(() => {
    if (comments.length > 0) {
      setComments(prevComments => sortComments(prevComments));
    }
  }, [sortBy, sortComments]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    handleVote,
    userVotes,
    commentCount,
    sortBy,
    setSortBy,
    getTotalReplyCount,
    getTotalCommentCount
  };
}