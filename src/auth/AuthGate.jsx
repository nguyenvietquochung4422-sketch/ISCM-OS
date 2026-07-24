import { LogIn } from 'lucide-react';
import { isLive } from '../lib/supabaseClient.js';
import { useAuth } from './AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

/**
 * Gates the whole app behind Google sign-in. When Supabase isn't configured
 * (`isLive` false — no VITE_SUPABASE_URL/ANON_KEY) there is no way to sign
 * in at all, so the gate is skipped and the app runs in its original
 * explorable-without-a-backend demo mode.
 */
export default function AuthGate({ children }) {
  const { user, loading, signInWithGoogle } = useAuth();
  const { lang } = useLanguage();

  if (!isLive) return children;

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#1c1c1c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-[#990000]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#1c1c1c] px-4">
        <div className="w-full max-w-sm border border-neutral-800 bg-neutral-900 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center bg-[#990000] font-barlow text-xl font-black uppercase tracking-widest text-white">
            ISCM
          </div>
          <h1 className="font-barlow text-lg font-bold uppercase tracking-wide text-white">
            {lang === 'vi' ? 'Cổng vận hành ISCM' : 'ISCM Control Panel'}
          </h1>
          <p className="mt-1.5 font-sans text-xs text-neutral-400">
            {lang === 'vi'
              ? 'Vui lòng đăng nhập bằng tài khoản Google để tiếp tục.'
              : 'Please sign in with your Google account to continue.'}
          </p>
          <button
            onClick={signInWithGoogle}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-none border border-neutral-700 bg-white px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wide text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            <LogIn className="h-4 w-4" />
            {lang === 'vi' ? 'Đăng nhập bằng Google' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  }

  return children;
}
