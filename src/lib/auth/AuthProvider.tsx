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
  const [loading, setLoading] = useState(false);

  // Sign in function - pure client side
  const signIn = async (usernameOrEmail: string, password: string) => {
    const result = await authService.signIn(usernameOrEmail, password);

    if (result.error) {
      return { error: result.error };
    }

    if (result.isAdmin && result.adminSession) {
      setUser(result.adminSession.user);
      setProfile(result.adminSession.profile);
    }

    return { error: null };
  };

  // Sign out function
  const signOut = async () => {
    setUser(null);
    setProfile(null);
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
  const { profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      window.location.href = '/auth/signin';
    }
  }, [profile, loading]);

  return { profile, loading };
}