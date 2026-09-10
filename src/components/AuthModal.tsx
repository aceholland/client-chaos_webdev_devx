import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { X } from 'lucide-react';
import type { UserRole } from '../types';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signIn, signUp, allUsers, switchMockUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
