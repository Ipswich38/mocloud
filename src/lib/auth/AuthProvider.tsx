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
      // Check for admin session first
      const adminSession = localStorage.getItem('admin_session');
      if (adminSession) {
        try {
          const session = JSON.parse(adminSession);
          setUser(session.user);
          setProfile(session.profile);
          setLoading(false);
          return;
        } catch (error) {
          localStorage.removeItem('admin_session');
        }
      }

      // Check for clinic session
      const clinicSession = localStorage.getItem('clinic_session');
      if (clinicSession) {
        try {
          const session = JSON.parse(clinicSession);
          setUser(session.user);
          setProfile(session.profile);
          setLoading(false);
          return;
        } catch (error) {
          localStorage.removeItem('clinic_session');
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
    } else if (result.isClinic && result.clinicSession) {
      setUser(result.clinicSession.user);
      setProfile(result.clinicSession.profile);
      // Persist clinic session
      localStorage.setItem('clinic_session', JSON.stringify(result.clinicSession));
    }

    return { error: null };
  };

  // Sign out function
  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('admin_session');
    localStorage.removeItem('clinic_session');
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

export function useRequireClinic() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Only redirect if we're sure we've finished loading and no clinic session
    if (!loading && !user && !profile) {
      window.location.href = '/auth/signin';
    }
    // If we have a user but they're not clinic, redirect
    if (!loading && user && profile && profile.role !== 'clinic') {
      window.location.href = '/auth/signin';
    }
  }, [user, profile, loading]);

  return { profile, loading };
}