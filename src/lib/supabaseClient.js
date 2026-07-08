import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a `.env` file to go live.
 * While they are absent the app runs on the bundled mock dataset (src/data/mockData.js),
 * so the prototype is fully explorable without a backend.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isLive = Boolean(supabase);
