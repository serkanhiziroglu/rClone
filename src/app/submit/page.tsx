// src/app/submit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Link as LinkIcon, FileText } from 'lucide-react';

export default function SubmitPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [postType, setPostType] = useState<'text' | 'link'>('text');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    url: '',
    communityId: '',
  });

  useEffect(() => {
    // Fetch communities for the dropdown
    async function fetchCommunities() {
      const { data } = await supabase
        .from('communities')
        .select('id, name')
        .order('name');
      setCommunities(data || []);
    }
    fetchCommunities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.communityId) {
      alert('Please select a community');
      return;
    }

    setIsLoading(true);
    try {
      // Create post
      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          title: formData.title,
          content: postType === 'text' ? formData.content : null,
          url: postType === 'link' ? formData.url : null,
          community_id: formData.communityId,
          user_id: user.id,
          type: postType,
        })
        .select()
        .single();

      if (error) throw error;

      const community = communities.find(c => c.id === formData.communityId);
      router.push(`/r/${community.name}/post/${post.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4 pt-20 text-center">
        <p>Please sign in to create a post.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold mb-6">Create a Post</h1>

      <div className="bg-white rounded-lg border p-6">
        {/* Post Type Selection */}
        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setPostType('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              postType === 'text'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <FileText size={20} /> Text Post
          </button>
          <button
            type="button"
            onClick={() => setPostType('link')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              postType === 'link'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <LinkIcon size={20} /> Link Post
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Community Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Choose a community
            </label>
            <select
              value={formData.communityId}
              onChange={(e) => setFormData(prev => ({ ...prev, communityId: e.target.value }))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
              required
            >
              <option value="">Select a community</option>
              {communities.map((community) => (
                <option key={community.id} value={community.id}>
                  r/{community.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
              required
              maxLength={300}
            />
          </div>

          {/* Content based on type */}
          {postType === 'text' ? (
            <div>
              <label className="block text-sm font-medium mb-2">Text</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full p-2 border rounded-md h-32 focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 disabled:bg-orange-300"
          >
            {isLoading ? 'Creating...' : 'Create Post'}
          </button>
        </form>
      </div>
    </div>
  );
}