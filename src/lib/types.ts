// src/lib/types.ts


export interface User {
    id: string;
    username: string;
    created_at: string;
    updated_at: string;
  }
  

  // src/lib/db.ts
  import { sql } from '@vercel/postgres';
  import { User } from './types';
  import { sql } from '@vercel/postgres';
import { User } from './types';

export async function createUser(id: string, username: string): Promise<User> {
  const result = await sql`
    INSERT INTO users (id, username)
    VALUES (${id}, ${username})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE username = ${username}
  `;
  return result.rows[0] || null;
}

export async function updateUsername(id: string, username: string): Promise<User | null> {
  const result = await sql`
    UPDATE users SET username = ${username}
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] || null;
}

export async function getPostsWithUsernames(sortBy = 'hot') {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, title, content, user_id, vote_count, comment_count, created_at, type, url,
        users(username),
        communities(name)
      `)
      .order('created_at', { ascending: false });
  
    if (error) throw error;
    return data;
  }
  
  