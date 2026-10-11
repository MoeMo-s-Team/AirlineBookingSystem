import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'customer' | 'admin';
  readonly frequentFlyerNumber?: string;
  readonly tier?: 'Classic' | 'Silver' | 'Gold' | 'Platinum';
}

export interface AuthContextType {
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
  readonly isAdmin: boolean;
  readonly isLoading: boolean;
  readonly signIn: (email: string, password: string) => Promise<AuthUser>;
  readonly signUp: (name: string, email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>;
  readonly signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    name: String(user.user_metadata.full_name ?? user.email?.split('@')[0] ?? 'SkyWing Member'),
    email: user.email ?? '',
    role: String(user.app_metadata.role ?? '').toUpperCase() === 'ADMIN' ? 'admin' : 'customer'
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (active) setUser(session?.user ? toAuthUser(session.user) : null);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAuthUser(session.user) : null);
      setIsLoading(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setIsLoading(false);
      throw error ?? new Error('Không thể đăng nhập.');
    }
    return toAuthUser(data.user);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/sign-in`
      }
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    return { requiresEmailConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    signIn,
    signUp,
    signOut
  }), [user, isLoading, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
