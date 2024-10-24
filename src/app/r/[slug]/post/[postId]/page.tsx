'use client';

import { useParams } from 'next/navigation';
import PostDetailContent from '@/components/PostDetailContent';

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const postId = params?.postId as string;

  return <PostDetailContent communitySlug={slug} postId={postId} />;
}