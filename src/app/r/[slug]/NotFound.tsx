/* eslint-disable react/no-unescaped-entities */
// src/app/r/[slug]/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <div className="bg-white rounded-lg border p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Community Not Found</h2>
        <p className="text-gray-600 mb-6">
          The community you're looking for doesn't exist.
        </p>
        <div className="space-x-4">
          <Link
            href="/communities"
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors inline-block"
          >
            Browse Communities
          </Link>
          <Link
            href="/create-community"
            className="px-4 py-2 text-gray-700 border hover:bg-gray-50 rounded-md transition-colors inline-block"
          >
            Create Community
          </Link>
        </div>
      </div>
    </div>
  );
}