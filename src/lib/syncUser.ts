'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

async function syncUserWithSupabase(user) {
  if (!user) {
    console.log('No user to sync');
    return null;
  }

  const userData = {
    id: user.id,
    username: user.username || user.firstName || 'anonymous',
    email: user.emailAddresses[0]?.emailAddress || null,
    updated_at: new Date().toISOString()
  };

  console.log('Attempting to sync user data:', userData);

  try {
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing user:', checkError);
      return null;
    }

    let syncedUser;

    if (!existingUser) {
      console.log('User does not exist, creating new user');
      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ ...userData, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating new user:', insertError);
        return null;
      }
      syncedUser = newUser;
      console.log('New user created:', newUser);
    } else {
      console.log('User exists, updating user');
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userData.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return null;
      }
      syncedUser = updatedUser;
      console.log('User updated:', updatedUser);
    }

    // Verify the sync
    const { data: verifyUser, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData.id)
      .single();

    if (verifyError) {
      console.error('Error verifying user sync:', verifyError);
      return null;
    }

    console.log('User sync verified:', verifyUser);
    return verifyUser;

  } catch (error) {
    console.error('Unexpected error in syncUserWithSupabase:', error);
    return null;
  }
}

export default function SyncUser() {
  const { user, isLoaded } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function performSync() {
      if (!user || isSyncing) return;

      setIsSyncing(true);
      try {
        const result = await syncUserWithSupabase(user);
        if (mounted) {
          if (result) {
            console.log('User sync completed successfully');
          } else {
            console.error('User sync failed');
          }
        }
      } catch (error) {
        if (mounted) {
          console.error('Error in sync process:', error);
        }
      } finally {
        if (mounted) {
          setIsSyncing(false);
        }
      }
    }

    if (isLoaded && user) {
      performSync();
    }

    return () => {
      mounted = false;
    };
  }, [user, isLoaded]);

  return null;
}

// Export for use in other components
export { syncUserWithSupabase };