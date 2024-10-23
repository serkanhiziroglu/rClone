'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';

export default function CreateCommunity() {
  const { user } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('communities')
        .insert([
          {
            name: name.toLowerCase(),
            creator_id: user.id,
            type: 'public'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      router.push(`/r/${name}`);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a Community</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Community Name
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md">
              r/
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="community_name"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600"
        >
          Create Community
        </button>
      </form>
    </div>
  );
}