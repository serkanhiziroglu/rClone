// lib/api.ts
import { supabase } from './supabase';

export async function getCommunity(name: string) {
  if (!name) {
    throw new Error('Community name is required');
  }

  const { data: community, error } = await supabase
    .from('communities')
    .select(`
      id,
      name,
      description,
      created_at,
      member_count,
      type,
      creator_id
    `)
    .eq('name', name)
    .single();

  if (error) {
    console.error('Supabase getCommunity error:', error.message);
    throw new Error(`Failed to fetch community: ${error.message}`);
  }

  return community;
}

export async function getPosts(communityId: string, sortBy: string = 'hot') {
  if (!communityId) {
    throw new Error('Community ID is required');
  }

  let query = supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_id_fkey(username)
    `)
    .eq('community_id', communityId);

  switch (sortBy) {
    case 'hot':
      query = query.order('hot_score', { ascending: false });
      break;
    case 'new':
      query = query.order('created_at', { ascending: false });
      break;
    case 'top':
      query = query.order('vote_count', { ascending: false });
      break;
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error('Supabase getPosts error:', error.message);
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }

  return posts || [];
}

export async function getAllPosts(sortBy: string = 'hot') {
  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        communities!inner(name),
        profiles!posts_user_id_fkey(username)
      `);

    switch (sortBy) {
      case 'hot':
        query = query.order('hot_score', { ascending: false });
        break;
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top':
        query = query.order('vote_count', { ascending: false });
        break;
    }

    const { data: posts, error } = await query.limit(50);

    if (error) {
      console.error('Supabase getAllPosts error:', error.message);
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    return posts || [];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
    throw new Error('Failed to fetch posts: Unknown error');
  }
}

export async function handleVote({
  postId,
  userId,
  value,
  currentVotes,
  posts,
  setPosts,
  setUserVotes
}: {
  postId: string;
  userId: string;
  value: number;
  currentVotes: Record<string, number>;
  posts: any[];
  setPosts: (posts: any[]) => void;
  setUserVotes: (votes: Record<string, number>) => void;
}) {
  const existingVote = currentVotes[postId];
  let voteChange = value;

  // Calculate vote change
  if (existingVote === value) {
    voteChange = -value;
  } else if (existingVote) {
    voteChange = 2 * value;
  }

  // Optimistically update UI
  setPosts(currentPosts => 
    currentPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          vote_count: post.vote_count + voteChange
        };
      }
      return post;
    })
  );

  // Update local vote state
  if (existingVote === value) {
    setUserVotes(prev => {
      const newVotes = { ...prev };
      delete newVotes[postId];
      return newVotes;
    });
  } else {
    setUserVotes(prev => ({
      ...prev,
      [postId]: value
    }));
  }

  try {
    // Update vote in database
    if (existingVote === value) {
      await supabase
        .from('user_post_votes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('user_post_votes')
        .upsert({
          post_id: postId,
          user_id: userId,
          value: value
        });
    }

    // Update post vote count
    await supabase.rpc('update_post_vote_count', {
      post_id: postId,
      vote_change: voteChange
    });
  } catch (error) {
    console.error('Error updating vote:', error);
    // Revert optimistic updates on error
    setPosts(currentPosts =>
      currentPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            vote_count: post.vote_count - voteChange
          };
        }
        return post;
      })
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
  }
}