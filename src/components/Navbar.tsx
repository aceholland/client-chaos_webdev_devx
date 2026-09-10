import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { NotificationsPopover } from './NotificationsPopover';
import {
  UserCheck,
  LogOut,
  ShieldCheck,
  Shield,
  Building2,
  Bell,
  Database,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewRequest: () => void;
  onOpenClientManager: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewRequest,
  onOpenClientManager,
  onOpenAuthModal,
}) => {
  const { user, allUsers, switchMockUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-primary)] text-[var(--text-primary)] border-b border-[var(--border-color)] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand logo & name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[var(--text-primary)] inline-block"></span>
            <h1 className="font-bold text-lg uppercase tracking-wider text-[var(--text-primary)]">Lala Tracker</h1>
            <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 border border-[var(--border-color)] text-[var(--text-muted)]">
              v2.0
            </span>
          </div>
        </div>

        {/* Center/Right Action Items */}
        <div className="flex items-center gap-3 sm:gap-4 uppercase tracking-wider text-xs">
          {/* Environment Status Badge */}
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] border border-[var(--border-color)] px-2 py-1">
            <Database className="w-3 h-3" />
            <span>{isSupabaseConfigured ? 'SUPABASE' : 'DEMO'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 border border-[var(--border-color)] px-3 py-1.5 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer text-xs font-bold"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">DARK</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LIGHT</span>
              </>
            )}
          </button>

          {/* Manage Clients Button */}
          <button
            onClick={onOpenClientManager}
            className="flex items-center gap-1.5 border border-[var(--border-color)] px-3 py-1.5 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer text-xs"
            title="Manage Clients"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Clients</span>
          </button>

          {/* New Request Button */}
          <button
            onClick={onOpenNewRequest}
            className="flex items-center gap-1.5 bg-[var(--text-primary)] text-[var(--bg-primary)] border border-[var(--border-color)] px-3.5 py-1.5 hover:opacity-90 transition-opacity cursor-pointer text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>

          {/* Notifications Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 border border-[var(--border-color)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            {showNotifications && (
              <NotificationsPopover onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* User Profile & Mock Role Switcher */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[var(--border-color)]">
              <div className="hidden lg:flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs">{user.name}</span>
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] border border-[var(--border-color)] px-1 py-0.2">
                      <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[9px] border border-[var(--border-color)] px-1 py-0.2">
                      <Shield className="w-2.5 h-2.5" /> MEMBER
                    </span>
                  )}
                </div>
              </div>

              {/* Demo Mode Quick User Selector */}
              {!isSupabaseConfigured && (
                <select
                  value={user.id}
                  onChange={e => switchMockUser(e.target.value)}
                  className="bg-transparent border border-[var(--border-color)] text-[var(--text-primary)] text-[11px] px-2 py-1 focus:outline-none cursor-pointer"
                  title="Switch user for demo testing"
                >
                  <optgroup label="Switch Account" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </optgroup>
                </select>
              )}

              <button
                onClick={() => signOut()}
                className="p-1.5 border border-[var(--border-color)] hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 border border-[var(--border-color)] px-3 py-1.5 hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
