// src/components/CommunityHeader.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Community } from '@/types/community';


interface CommunityHeaderProps {
  community: Community;
  slug: string;
}

const CommunityHeader: React.FC<CommunityHeaderProps> = ({ community, slug }) => (
  <div className="bg-white rounded-lg border p-6 mb-6">
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-3xl font-bold">r/{community.name}</h1>
      <Link
        href={`/r/${community.name}/submit`}
        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
      >
        Create Post
      </Link>
    </div>
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
);

export default CommunityHeader;