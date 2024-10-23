import { createClient } from '@supabase/supabase-js';

// These values are from your Supabase dashboard
const supabaseUrl = 'https://mopelyafqmcnwlmxplzv.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);