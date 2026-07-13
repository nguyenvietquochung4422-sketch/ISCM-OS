import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isLive } from '../lib/supabaseClient.js';

/**
 * Real Supabase Auth session (Google OAuth). Independent from the
 * `currentUser` display shown in NavBar (mock/db profile lookup) —
 * this tracks who is actually signed in, if anyone.
 * Requires the Google provider to be enabled in the Supabase project
 * (Authentication -> Providers -> Google) with a Google Cloud OAuth
 * client configured; until then `signInWithGoogle` will just surface
 * the provider error from Supabase.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isLive);

  useEffect(() => {
    if (!isLive) return;
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isLive) {
      alert('Supabase chưa được cấu hình (thiếu VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY).');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      console.error('Google sign-in failed:', error);
      alert(`Đăng nhập Google thất bại: ${error.message}`);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isLive) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
