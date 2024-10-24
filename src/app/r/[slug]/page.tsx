import { use } from 'react';
import CommunityPageContent from './CommunityPageContent';

// src/app/r/[slug]/page.tsx
export default async function CommunityPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  return <CommunityPageContent slug={slug} />;
}