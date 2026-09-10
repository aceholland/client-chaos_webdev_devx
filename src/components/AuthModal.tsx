import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { X } from 'lucide-react';
import type { UserRole } from '../types';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signIn, signInWithGoogle, signUp, allUsers, switchMockUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');

      if (isSignUp) {
        await signUp(email.trim(), name.trim() || email.split('@')[0], role);
      } else {
        await signIn(email.trim());
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userId: string) => {
    switchMockUser(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden text-[var(--text-primary)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div>
            <h2 className="font-bold text-base uppercase tracking-widest text-[var(--text-primary)]">
              {isSignUp ? 'Create Account' : 'Portal Login'}
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">LALA TRACKER AUTH</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 border border-transparent hover:border-[var(--border-color)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {!isSupabaseConfigured && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] block">
                Quick Demo Switcher
              </span>
              <div className="grid grid-cols-2 gap-2">
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u.id)}
                    className="p-2 border border-[var(--border-color)] text-left hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer text-xs uppercase"
                  >
                    <div className="font-bold truncate">{u.name}</div>
                    <div className="text-[9px] opacity-70 tracking-widest">{u.role}</div>
                  </button>
                ))}
              </div>
              <div className="border-t border-[var(--border-color)] my-4 opacity-40"></div>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-red-500 uppercase tracking-wider font-bold">{errorMsg}</p>
          )}

          {/* Google OAuth Login Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 border border-[var(--border-color)] bg-transparent hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 border-t border-[var(--border-color)] opacity-30"></div>
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">OR EMAIL</span>
            <div className="flex-1 border-t border-[var(--border-color)] opacity-30"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Name</label>
                <input
                  type="text"
                  placeholder="FULL NAME"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Email</label>
              <input
                type="email"
                placeholder="USER@LALA.CORP"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] px-3 py-2 text-xs uppercase tracking-wider text-[var(--text-primary)] focus:outline-none cursor-pointer"
                >
                  <option value="member">MEMBER</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 border border-[var(--border-color)] bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold uppercase tracking-widest hover:opacity-90 transition cursor-pointer"
            >
              {loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'LOG IN'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)] underline cursor-pointer"
            >
              {isSignUp ? 'ALREADY HAVE AN ACCOUNT? LOG IN' : "DON'T HAVE AN ACCOUNT? SIGN UP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
