// src/app/r/[slug]/error.tsx
'use client';

import Link from 'next/link';

export default function Error() {
  return (
    <div className="max-w-4xl mx-auto p-4 pt-20">
      <div className="bg-white rounded-lg border p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          We couldn't load this community. Please try again later.
        </p>
        <Link
          href="/communities"
          className="inline-block px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Go to Communities
        </Link>
      </div>
    </div>
  );
}