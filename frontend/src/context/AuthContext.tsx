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
  readonly signIn: (email: string, password: string) => Promise<void>;
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
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  // Generation counter to discard stale profile resolutions
  const requestGenRef = useRef<number>(0);
  const sessionRef = useRef<Session | null>(null);
  const profileUserIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);
  const preserveAuthErrorRef = useRef<boolean>(false);

  const fetchProfile = useCallback(async (currentSession: Session): Promise<AuthUser | null> => {
    if (sessionRef.current?.access_token !== currentSession.access_token) return null;
    const currentGen = ++requestGenRef.current;

    try {
      const profile = await apiClient.get<AuthUser>('/profile/me');
      if (currentGen !== requestGenRef.current) return null;

      setUser({
        ...profile,
        name: profile.fullName,
      });
      profileUserIdRef.current = profile.id;
      setProfileError(null);
      return profile;
    } catch (err) {
      if (currentGen !== requestGenRef.current) return null;

      const apiErr = err as ApiError;
      if (apiErr.status === 401 && sessionRef.current?.access_token !== currentSession.access_token) {
        return null;
      }
      setUser(null);
      profileUserIdRef.current = null;

      if (apiErr.status === 401) {
        preserveAuthErrorRef.current = true;
        setProfileError(apiErr);
        try {
          await supabase.auth.signOut();
        } catch {
          // The backend rejected this token; clear local auth even if remote signout fails.
        } finally {
          if (sessionRef.current?.access_token === currentSession.access_token) {
            sessionRef.current = null;
            setSession(null);
          }
        }
      } else {
        setProfileError(apiErr);
      }
      return null;
    }
  }, []);

  // Initial bootstrap; the session effect owns profile requests.
  useEffect(() => {
    let mounted = true;
    let authEventReceived = false;

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      authEventReceived = true;
      sessionRef.current = newSession;
      setSession(newSession);
    });

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        if (!authEventReceived) {
          sessionRef.current = data.session;
          setSession(data.session);
        }
      } catch (err) {
        if (!mounted) return;
        if (!authEventReceived) {
          sessionRef.current = null;
          setSession(null);
        }
      } finally {
        if (mounted) setAuthInitialized(true);
      }
    }

    initAuth();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authInitialized) return;

    if (!session) {
      requestGenRef.current++;
      sessionRef.current = null;
      setUser(null);
      profileUserIdRef.current = null;
      const preserveAuthError = preserveAuthErrorRef.current;
      preserveAuthErrorRef.current = false;
      if (!preserveAuthError) setProfileError(null);
      isInitialLoadRef.current = false;
      setIsLoading(false);
      return;
    }

    if (profileUserIdRef.current !== session.user.id) {
      setUser(null);
      profileUserIdRef.current = null;
    }
    setProfileError(null);
    const wasInitialLoad = isInitialLoadRef.current;
    fetchProfile(session).finally(() => {
      if (wasInitialLoad && isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setIsLoading(false);
      }
    });
  }, [authInitialized, session, fetchProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      throw error || new Error('Đăng nhập thất bại: không có session');
    }

    sessionRef.current = data.session;
    setSession(data.session);
  }, []);

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
      sessionRef.current = data.session;
      setSession(data.session);
      return { confirmationRequired: false };
    }

    return { confirmationRequired: true };
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    requestGenRef.current++;
    try {
      await supabase.auth.signOut();
    } finally {
      sessionRef.current = null;
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
    isAuthenticated: !!session,
    isAdmin: user?.role === 'ADMIN',
    isLoading,
    profileError,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }), [session, user, isLoading, profileError, signIn, signUp, signOut, refreshProfile]);

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
