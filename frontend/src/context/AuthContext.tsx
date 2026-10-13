import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { apiClient, type ApiError } from '../api/apiClient';

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: 'CUSTOMER' | 'ADMIN';
  readonly name?: string;
  readonly frequentFlyerNumber?: string;
  readonly tier?: string;
}

export interface AuthContextType {
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
  readonly isAdmin: boolean;
  readonly isLoading: boolean;
  readonly profileError: ApiError | null;
  readonly signIn: (email: string, password: string) => Promise<AuthUser>;
  readonly signUp: (fullName: string, email: string, password: string) => Promise<{ confirmationRequired: boolean }>;
  readonly signOut: () => Promise<void>;
  readonly refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profileError, setProfileError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Generation counter to discard stale profile resolutions
  const requestGenRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);

  const fetchProfile = useCallback(async (currentSession: Session | null): Promise<AuthUser | null> => {
    const currentGen = ++requestGenRef.current;

    if (!currentSession) {
      setUser(null);
      setProfileError(null);
      return null;
    }

    try {
      const profile = await apiClient.get<AuthUser>('/api/profile/me');
      if (currentGen !== requestGenRef.current) return null;

      setUser({
        ...profile,
        name: profile.fullName,
      });
      setProfileError(null);
      return profile;
    } catch (err) {
      if (currentGen !== requestGenRef.current) return null;

      const apiErr = err as ApiError;
      setUser(null);

      if (apiErr.status === 401) {
        // Auth session invalid or expired
        setProfileError(null);
      } else {
        // 403 (PROFILE_NOT_FOUND, PROFILE_ROLE_INVALID) or 5xx (PROFILE_LOOKUP_FAILED)
        setProfileError(apiErr);
      }
      return null;
    }
  }, []);

  // Initial bootstrap and auth state listener
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(data.session);
        if (data.session) {
          await fetchProfile(data.session);
        } else {
          setUser(null);
          setProfileError(null);
        }
      } catch (err) {
        if (!mounted) return;
        setUser(null);
        setProfileError(null);
      } finally {
        if (mounted && isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);

      // Subsequent session changes or token refresh
      if (!isInitialLoadRef.current) {
        await fetchProfile(newSession);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      throw error || new Error('Đăng nhập thất bại: không có session');
    }

    setSession(data.session);
    const profile = await fetchProfile(data.session);
    if (!profile) {
      throw new Error('Không thể tải profile từ hệ thống');
    }
    return profile;
  }, [fetchProfile]);

  const signUp = useCallback(async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ confirmationRequired: boolean }> => {
    const emailRedirectTo =
      import.meta.env.VITE_SUPABASE_EMAIL_REDIRECT_URL ||
      `${window.location.origin}/auth/callback`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo,
      },
    });

    if (error) {
      throw error;
    }

    if (data.session) {
      setSession(data.session);
      await fetchProfile(data.session);
      return { confirmationRequired: false };
    }

    return { confirmationRequired: true };
  }, [fetchProfile]);

  const signOut = useCallback(async (): Promise<void> => {
    requestGenRef.current++;
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      setProfileError(null);
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (session) {
      await fetchProfile(session);
    }
  }, [session, fetchProfile]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isLoading,
    profileError,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }), [user, isLoading, profileError, signIn, signUp, signOut, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
