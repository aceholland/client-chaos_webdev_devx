import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { NotificationsPopover } from './NotificationsPopover';
import {
  Layers,
  UserCheck,
  LogOut,
  ShieldCheck,
  Shield,
  Building2,
  Bell,
  Database,
  Sparkles,
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
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand logo & name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">Lala Tracker</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Lala Tech
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal hidden sm:block">
              Client Request Intake & Operational Tracking
            </p>
          </div>
        </div>

        {/* Center/Right Action Items */}
        <div className="flex items-center gap-3">
          {/* Environment Status Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Demo Local Mode'}</span>
          </div>

          {/* Manage Clients Button */}
          <button
            onClick={onOpenClientManager}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Manage Clients"
          >
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Clients</span>
          </button>

          {/* New Request Button */}
          <button
            onClick={onOpenNewRequest}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>New Request</span>
          </button>

          {/* Notifications Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition relative"
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
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden md:flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                  {user.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Shield className="w-3 h-3" /> Member
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">{user.email}</span>
              </div>

              {/* Demo Mode Quick User Selector */}
              {!isSupabaseConfigured && (
                <select
                  value={user.id}
                  onChange={e => switchMockUser(e.target.value)}
                  className="text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  title="Switch user for demo testing"
                >
                  <optgroup label="Switch Account (Demo Mode)">
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </optgroup>
                </select>
              )}

              <button
                onClick={() => signOut()}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Log In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
