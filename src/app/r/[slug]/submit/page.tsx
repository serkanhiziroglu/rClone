// app/r/[slug]/submit/page.tsx
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCommunity } from '@/lib/api';

export default function CreatePost({ params }: { params: { slug: string } }) {
  const { user } = useUser();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'text' | 'link'>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);

    try {
      // First get community ID
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id')
        .eq('name', params.slug)
        .single();

      if (communityError) throw communityError;

      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([{
          title,
          content: type === 'text' ? content : null,
          url: type === 'link' ? url : null,
          type,
          user_id: user.id,
          community_id: community.id,
          vote_count: 0,
          comment_count: 0
        }])
        .select()
        .single();

      if (postError) throw postError;

      router.push(`/r/${params.slug}/post/${post.id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold mb-6">Create a post in r/{params.slug}</h1>

      <Tabs defaultValue="text" className="w-full" onValueChange={(v) => setType(v as 'text' | 'link')}>
        <TabsList className="w-full mb-6">
          <TabsTrigger value="text" className="flex-1">Text Post</TabsTrigger>
          <TabsTrigger value="link" className="flex-1">Link Post</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <TabsContent value="text">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Text (optional)"
                className="w-full p-2 border rounded-md min-h-[200px]"
              />
            </TabsContent>

            <TabsContent value="link">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL"
                className="w-full p-2 border rounded-md"
                required={type === 'link'}
              />
            </TabsContent>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}