import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_USERS } from '../lib/mockData';

interface AuthContextType {
  user: UserProfile | null;
  allUsers: UserProfile[];
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, name: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  switchMockUser: (userId: string) => void;
  addUser: (name: string, email: string, role?: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USERS_KEY = 'lala_tracker_users';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'lala_tracker_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync users to LocalStorage in mock mode
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(allUsers));
  }, [allUsers]);

  // Load user session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await fetchUserProfile(session.user.id, session.user.email || '');
          }
          const { data: usersData } = await supabase.from('users').select('*');
          if (usersData) setAllUsers(usersData as UserProfile[]);

          supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              await fetchUserProfile(session.user.id, session.user.email || '');
            } else {
              setUser(null);
            }
          });
        } catch (err) {
          console.error('Supabase Auth init error:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // Mock Mode: restore last saved current user or default to Admin Alice
        const savedUserId = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY) || INITIAL_USERS[0].id;
        const found = allUsers.find(u => u.id === savedUserId) || allUsers[0];
        setUser(found);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setUser(data as UserProfile);
    } else if (error) {
      // Fallback create user if row does not exist yet
      const newUserProfile: UserProfile = {
        id: userId,
        email,
        name: email.split('@')[0],
        role: 'member',
        created_at: new Date().toISOString(),
      };
      await supabase.from('users').insert(newUserProfile);
      setUser(newUserProfile);
    }
  };

  const signIn = async (email: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
    } else {
      // Mock Sign In
      let found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        // Auto-create user for mock convenience
        const newU: UserProfile = {
          id: `user-custom-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'admin' : 'member',
          created_at: new Date().toISOString(),
        };
        setAllUsers(prev => [...prev, newU]);
        found = newU;
      }
      setUser(found);
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, found.id);
    }
  };

  const signInWithGoogle = async () => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } else {
      // Mock mode Google login simulation
      let googleUser = allUsers.find(u => u.email === 'google.user@example.com');
      if (!googleUser) {
        googleUser = {
          id: `user-google-${Date.now()}`,
          email: 'google.user@example.com',
          name: 'Google User',
          role: 'member',
          created_at: new Date().toISOString(),
        };
        setAllUsers(prev => [...prev, googleUser!]);
      }
      setUser(googleUser);
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, googleUser.id);
    }
  };

  const signUp = async (email: string, name: string, role: UserRole = 'member') => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email,
        password: 'TemporaryPassword123!',
        options: {
          data: { name, role },
        },
      });
      if (error) throw error;
    } else {
      const newU: UserProfile = {
        id: `user-custom-${Date.now()}`,
        email,
        name,
        role,
        created_at: new Date().toISOString(),
      };
      setAllUsers(prev => [...prev, newU]);
      setUser(newU);
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, newU.id);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
  };

  const switchMockUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setUser(target);
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, target.id);
    }
  };

  const addUser = (name: string, email: string, role: UserRole = 'member') => {
    const newU: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      created_at: new Date().toISOString(),
    };
    setAllUsers(prev => [...prev, newU]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        loading,
        signIn,
        signInWithGoogle,
        signUp,
        signOut,
        switchMockUser,
        addUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
