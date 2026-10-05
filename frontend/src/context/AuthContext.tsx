import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { MOCK_ACCOUNTS } from '../data/mockData';

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
  readonly signIn: (email: string, password: string) => Promise<boolean>;
  readonly signUp: (name: string, email: string, password: string) => Promise<boolean>;
  readonly signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'skywing_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load initial session on mount (defaults to unauthenticated / null)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 350));

    // Check if matching any predefined mock account
    const matched = MOCK_ACCOUNTS.find(
      acc => acc.email.toLowerCase() === email.trim().toLowerCase() ||
             acc.frequentFlyerNumber.toLowerCase() === email.trim().toLowerCase()
    );

    const authenticatedUser: AuthUser = matched
      ? {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role,
          frequentFlyerNumber: matched.frequentFlyerNumber,
          tier: matched.tier
        }
      : {
          id: 'usr-' + Date.now(),
          name: email.split('@')[0],
          email: email,
          role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
          frequentFlyerNumber: 'SW-CLUB-' + Math.floor(10000 + Math.random() * 90000),
          tier: 'Classic'
        };

    setUser(authenticatedUser);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
    setIsLoading(false);
    return true;
  }, []);

  const signUp = useCallback(async (name: string, email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 400));

    const newUser: AuthUser = {
      id: 'usr-' + Date.now(),
      name: name || 'New SkyWing Member',
      email: email,
      role: 'customer',
      frequentFlyerNumber: 'SW-CLUB-' + Math.floor(10000 + Math.random() * 90000),
      tier: 'Classic'
    };

    setUser(newUser);
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
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
