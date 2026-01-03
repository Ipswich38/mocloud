'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/lib/auth/authService';
import type { UserProfile } from '@/types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (usernameOrEmail: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      const sessionData = localStorage.getItem('admin_session');
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          setUser(session.user);
          setProfile(session.profile);
        } catch (error) {
          localStorage.removeItem('admin_session');
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  // Sign in function - pure client side
  const signIn = async (usernameOrEmail: string, password: string) => {
    const result = await authService.signIn(usernameOrEmail, password);

    if (result.error) {
      return { error: result.error };
    }

    if (result.isAdmin && result.adminSession) {
      setUser(result.adminSession.user);
      setProfile(result.adminSession.profile);
      // Persist session to localStorage
      localStorage.setItem('admin_session', JSON.stringify(result.adminSession));
    }

    return { error: null };
  };

  // Sign out function
  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('admin_session');
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth guards for different roles
export function useRequireAuth() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/signin';
    }
  }, [user, loading]);

  return { user, loading };
}

export function useRequireAdmin() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Only redirect if we're sure we've finished loading and no admin session
    if (!loading && !user && !profile) {
      window.location.href = '/auth/signin';
    }
    // If we have a user but they're not admin, redirect
    if (!loading && user && profile && profile.role !== 'admin') {
      window.location.href = '/auth/signin';
    }
  }, [user, profile, loading]);

  return { profile, loading };
}