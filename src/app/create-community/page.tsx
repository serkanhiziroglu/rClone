'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CreateCommunity() {
  const { user } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      const communityName = name.toLowerCase().trim();

      // Check if community exists first
      const { data: existingCommunity } = await supabase
        .from('communities')
        .select('name')
        .eq('name', communityName)
        .maybeSingle();

      if (existingCommunity) {
        setError('This community name is already taken');
        setIsSubmitting(false);
        return;
      }

      // Create the community
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .insert([
          {
            name: communityName,
            description: description || null,
            creator_id: user.id,
            type: 'public',
            member_count: 1
          }
        ])
        .select()
        .single();

      if (communityError) throw communityError;

      // Add creator as admin
      await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'admin',
          joined_at: new Date().toISOString()
        });

      // Create default rules (reduced to 3 unique rules)
      const defaultRules = [
        {
          community_id: community.id,
          title: 'Be respectful',
          description: 'Treat everyone with respect and engage in constructive discussions',
        },
        {
          community_id: community.id,
          title: 'No spam or self-promotion',
          description: 'Keep content relevant and avoid excessive self-promotion',
        },
        {
          community_id: community.id,
          title: 'Follow content policy',
          description: 'Adhere to platform guidelines and maintain civil discourse',
        }
      ];

      await supabase.from('community_rules').insert(defaultRules);

      // Add small delay to ensure everything is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use replace instead of push to prevent back navigation issues
      router.replace(`/r/${communityName}`);

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to create community. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pt-20">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create a Community</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
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
                placeholder="community_name"
                required
                pattern="^[a-zA-Z0-9_]+$"
                title="Only letters, numbers, and underscores are allowed"
                className="flex-1 p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                maxLength={21}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Only letters, numbers, and underscores. Maximum 21 characters.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Tell people what this community is about..."
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum 500 characters
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Creating...' : 'Create Community'}
          </Button>
        </form>
      </Card>
    </div>
  );
}