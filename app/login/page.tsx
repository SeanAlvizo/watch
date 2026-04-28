"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        // Auto-login after signup since email confirmation is disabled by default on new projects
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          setMessage('Account created! Please sign in.');
          setIsSignUp(false);
        } else {
          router.push('/dashboard');
          router.refresh();
          return;
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
        router.refresh();
        return;
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] flex flex-col items-center justify-center font-body px-4">
      <div className="w-full max-w-md bg-white p-12 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-[#f0efee] text-center">
        <div className="mb-14">
          <h1 className="text-xl font-bold font-headline mb-1 tracking-tight">Atelier Admin</h1>
          <p className="text-[10px] label-engraved text-on-surface-variant tracking-[0.2em]">Administrative Portal</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-10 text-left">
          {error && (
            <div className="bg-[#fcebea] border border-[#fac8c8] text-[#db5a5a] px-4 py-3 rounded-[4px] text-[12px] font-body">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-[#e2f0e6] border border-[#c4e1cb] text-[#2d7a46] px-4 py-3 rounded-[4px] text-[12px] font-body">
              {message}
            </div>
          )}

          <div>
            <label className="label-engraved text-[11px] text-on-surface-variant mb-2 block tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-0 border-b border-[#e3e2e1] focus:ring-0 focus:border-primary px-0 py-2 text-sm placeholder:text-[#c4c7c7] transition-all bg-transparent"
              placeholder="admin@atelier.com"
              required
            />
          </div>

          <div>
            <label className="label-engraved text-[11px] text-on-surface-variant mb-2 block tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-0 border-b border-[#e3e2e1] focus:ring-0 focus:border-primary px-0 py-2 text-sm placeholder:text-[#c4c7c7] transition-all bg-transparent"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-4 rounded-md text-[13px] font-bold tracking-widest uppercase hover:opacity-90 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
            <span className="material-symbols-outlined text-sm">{isSignUp ? 'person_add' : 'login'}</span>
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
          className="mt-6 text-[11px] text-[#737373] hover:text-[#000] transition-colors font-body"
        >
          {isSignUp ? 'Already have an account? Sign In' : 'First time? Create Account'}
        </button>
      </div>
    </div>
  );
}
