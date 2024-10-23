// src/app/r/[slug]/page.tsx
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCommunity(name: string) {
  const { data: community } = await supabase
    .from('communities')
    .select('*')
    .eq('name', name)
    .single();
  
  return community;
}

export default async function CommunityPage({
  params,
}: PageProps) {
  // Await the params before using them
  const { slug } = await params;
  
  const community = await getCommunity(slug);

  if (!community) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-3xl font-bold mb-4">r/{community.name}</h1>
        <div className="mb-6">
          <p className="text-gray-600">
            {community.description || 'No description available'}
          </p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span>{community.member_count} members</span>
          <span className="mx-2">•</span>
          <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}