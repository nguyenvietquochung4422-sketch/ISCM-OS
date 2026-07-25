import { useEffect, useState } from 'react';
import { isLive } from '../lib/supabaseClient.js';
import { useAuth } from './AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';

/** Google's own "G" mark — standard for a "Sign in with Google" button. */
function GoogleIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20.4H24v7.2h11.3C33.7 32 29.3 34.8 24 34.8c-6 0-11-4.9-11-11s5-11 11-11c2.8 0 5.3 1 7.2 2.8l5.4-5.4C33.2 7.5 28.8 5.6 24 5.6 13.8 5.6 5.6 13.8 5.6 24S13.8 42.4 24 42.4 42.4 34.2 42.4 24c0-1.2-.1-2.4-.3-3.5z"/>
      <path fill="#FF3D00" d="M8.7 14.7l5.9 4.3C16.2 15.6 19.8 13.2 24 13.2c2.8 0 5.3 1 7.2 2.8l5.4-5.4C33.2 7.5 28.8 5.6 24 5.6c-6.9 0-12.9 3.9-15.3 9.1z"/>
      <path fill="#4CAF50" d="M24 42.4c4.7 0 9-1.8 12.2-4.7l-5.6-4.7c-1.9 1.3-4.3 2.2-6.6 2.2-5.3 0-9.7-2.8-11.4-7.4l-5.9 4.5c3.3 5.6 9.3 9.3 16.3 9.3z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.3-2.3 4.2-4.2 5.5l5.6 4.7C40.1 35.1 42.4 30 42.4 24c0-1.2-.1-2.4-.3-3.5z"/>
    </svg>
  );
}

/** Slow-drifting squares behind the card — echoes the red/white bar-chart
    motif in the ISCM logo. Purely decorative, so hidden from screen readers. */
const DRIFT_SQUARES = [
  { top: '12%', left: '8%', size: 46, color: '#990000', opacity: 0.18, duration: 19, delay: -2 },
  { top: '68%', left: '14%', size: 26, color: '#ffffff', opacity: 0.08, duration: 14, delay: -6 },
  { top: '20%', left: '85%', size: 34, color: '#ffffff', opacity: 0.1, duration: 22, delay: -10 },
  { top: '78%', left: '80%', size: 54, color: '#990000', opacity: 0.16, duration: 17, delay: -4 },
  { top: '46%', left: '92%', size: 20, color: '#990000', opacity: 0.2, duration: 12, delay: -8 },
  { top: '85%', left: '45%', size: 30, color: '#ffffff', opacity: 0.07, duration: 20, delay: -1 },
];

function DriftingSquares() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {DRIFT_SQUARES.map((s, i) => (
        <div
          key={i}
          className="auth-drift absolute"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            backgroundColor: s.color,
            opacity: s.opacity,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Gates the whole app behind Google sign-in. When Supabase isn't configured
 * (`isLive` false — no VITE_SUPABASE_URL/ANON_KEY) there is no way to sign
 * in at all, so the gate is skipped and the app runs in its original
 * explorable-without-a-backend demo mode.
 */
export default function AuthGate({ children }) {
  const { user, loading, signInWithGoogle } = useAuth();
  const { lang } = useLanguage();

  // The glow follows the cursor on the sign-in screen only — the listener
  // detaches the moment a user is signed in, so it never re-renders the
  // rest of the app on every mouse move.
  const [glow, setGlow] = useState({ x: 50, y: 30 });
  useEffect(() => {
    if (!isLive || loading || user) return;
    const handleMove = (e) => {
      setGlow({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [loading, user]);

  if (!isLive) return children;

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#141414]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-[#990000]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#141414] px-4">
        <DriftingSquares />

        {/* brand-red glow that tracks the cursor */}
        <div
          className="pointer-events-none absolute inset-0 transition-[background] duration-300 ease-out"
          style={{ background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(153,0,0,0.25), transparent 55%)` }}
        />

        <div className="relative w-full max-w-lg border border-neutral-800 bg-neutral-900/95 shadow-2xl">
          <div className="h-1 w-full bg-[#990000]" />
          <div className="p-9 text-center">
            <img
              src={`${import.meta.env.BASE_URL}logo-nav.png`}
              alt="ISCM"
              className="mx-auto h-11 w-auto object-contain"
            />
            <h1 className="mt-7 font-barlow text-lg font-bold uppercase tracking-wide text-white">
              {lang === 'vi' ? 'Cổng vận hành ISCM' : 'ISCM Control Panel'}
            </h1>
            <p className="mt-1.5 font-sans text-xs text-neutral-400 sm:whitespace-nowrap">
              {lang === 'vi'
                ? 'Vui lòng đăng nhập bằng tài khoản Google để tiếp tục.'
                : 'Please sign in with your Google account to continue.'}
            </p>
            <button
              onClick={signInWithGoogle}
              className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-none border border-neutral-200 bg-white px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wide text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100"
            >
              <GoogleIcon />
              {lang === 'vi' ? 'Đăng nhập bằng Google' : 'Sign in with Google'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
