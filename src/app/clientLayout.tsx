'use client'; // Required for useEffect and other client-side hooks

import { ReactNode } from 'react';
import SyncUser from '@/lib/syncUser'; // Import your SyncUser component

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SyncUser /> {/* Run user sync logic */}
      <main className="pt-16">{children}</main>
    </>
  );
}
