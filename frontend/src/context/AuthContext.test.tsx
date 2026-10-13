import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { apiClient } from '../api/apiClient';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

vi.mock('../api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(() => {
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      } as any;
    });
  });

  it('restores initial session and fetches profile from /api/profile/me', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: { access_token: 'valid-jwt', user: { id: 'u-1' } } as any,
      },
      error: null,
    });

    vi.mocked(apiClient.get).mockResolvedValue({
      id: 'u-1',
      email: 'customer@airline.com',
      fullName: 'Customer Test',
      role: 'CUSTOMER',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user).toEqual({
      id: 'u-1',
      email: 'customer@airline.com',
      fullName: 'Customer Test',
      name: 'Customer Test',
      role: 'CUSTOMER',
    });
    expect(apiClient.get).toHaveBeenCalledWith('/profile/me');
  });

  it('updates session synchronously in the auth listener', async () => {
    let authCallback: any;
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback: any) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } } as any;
    });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    vi.mocked(apiClient.get).mockReturnValue(new Promise(() => {}) as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(authCallback).toBeDefined());

    let callbackResult: unknown;
    act(() => {
      callbackResult = authCallback('TOKEN_REFRESHED', {
        access_token: 'new-token',
        user: { id: 'u-2' },
      });
    });

    expect(callbackResult).toBeUndefined();
  });

  it('does not let a late bootstrap session overwrite a later signout event', async () => {
    let authCallback: any;
    let resolveInitialSession!: (value: unknown) => void;
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback: any) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } } as any;
    });
    vi.mocked(supabase.auth.getSession).mockReturnValue(
      new Promise(resolve => { resolveInitialSession = resolve; }) as any
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(authCallback).toBeDefined());

    act(() => authCallback('SIGNED_OUT', null));
    await act(async () => resolveInitialSession({
      data: { session: { access_token: 'stale-token', user: { id: 'stale-user' } } },
      error: null,
    }));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('keeps app bootstrap loading off during token refresh profile lookup', async () => {
    let authCallback: any;
    let resolveRefresh!: (value: unknown) => void;
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback: any) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } } as any;
    });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'initial-token', user: { id: 'u-1' } } as any },
      error: null,
    });
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({
        id: 'u-1', email: 'user@example.com', fullName: 'User', role: 'CUSTOMER',
      })
      .mockReturnValueOnce(new Promise(resolve => { resolveRefresh = resolve; }) as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => authCallback('TOKEN_REFRESHED', {
      access_token: 'refreshed-token', user: { id: 'u-1' },
    }));
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(2));
    expect(result.current.isLoading).toBe(false);

    await act(async () => resolveRefresh({
      id: 'u-1', email: 'user@example.com', fullName: 'User', role: 'CUSTOMER',
    }));
    expect(result.current.isLoading).toBe(false);
  });

  it('discards an older profile response after the session changes', async () => {
    let authCallback: any;
    let resolveOldProfile!: (value: unknown) => void;
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback: any) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } } as any;
    });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'old-token', user: { id: 'old-user' } } as any },
      error: null,
    });
    vi.mocked(apiClient.get)
      .mockReturnValueOnce(new Promise(resolve => { resolveOldProfile = resolve; }) as any)
      .mockResolvedValueOnce({
        id: 'new-user', email: 'new@example.com', fullName: 'New User', role: 'CUSTOMER',
      });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(1));

    act(() => authCallback('SIGNED_IN', {
      access_token: 'new-token', user: { id: 'new-user' },
    }));
    await waitFor(() => expect(result.current.user?.id).toBe('new-user'));

    await act(async () => resolveOldProfile({
      id: 'old-user', email: 'old@example.com', fullName: 'Old User', role: 'ADMIN',
    }));
    expect(result.current.user?.id).toBe('new-user');
  });

  it('discards an in-flight profile response after signout', async () => {
    let authCallback: any;
    let resolveProfile!: (value: unknown) => void;
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback: any) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } } as any;
    });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'old-token', user: { id: 'old-user' } } as any },
      error: null,
    });
    vi.mocked(apiClient.get).mockReturnValue(
      new Promise(resolve => { resolveProfile = resolve; }) as any
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledOnce());

    act(() => authCallback('SIGNED_OUT', null));
    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
    await act(async () => resolveProfile({
      id: 'old-user', email: 'old@example.com', fullName: 'Old User', role: 'ADMIN',
    }));
    expect(result.current.user).toBeNull();
  });

  it('does not clear a newer session when an older request returns 401', async () => {
    let authCallback: any;
    let finishSignOut!: (value?: unknown) => void;
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback: any) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } } as any;
    });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'old-token', user: { id: 'old-user' } } as any },
      error: null,
    });
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce({ status: 401, code: 'UNAUTHORIZED', message: 'Expired' })
      .mockResolvedValueOnce({
        id: 'new-user', email: 'new@example.com', fullName: 'New User', role: 'CUSTOMER',
      });
    vi.mocked(supabase.auth.signOut).mockReturnValue(
      new Promise(resolve => { finishSignOut = resolve; }) as any
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalledOnce());

    act(() => authCallback('SIGNED_IN', {
      access_token: 'new-token', user: { id: 'new-user' },
    }));
    await waitFor(() => expect(result.current.user?.id).toBe('new-user'));
    await act(async () => finishSignOut());

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe('new-user');
  });

  it('signs in with email and password, returning profile identity', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        session: { access_token: 'admin-jwt', user: { id: 'admin-1' } } as any,
        user: { id: 'admin-1' } as any,
      },
      error: null,
    });

    vi.mocked(apiClient.get).mockResolvedValue({
      id: 'admin-1',
      email: 'admin@airline.com',
      fullName: 'Admin User',
      role: 'ADMIN',
    });

    let returnedUser;
    await act(async () => {
      returnedUser = await result.current.signIn('admin@airline.com', 'secret123');
    });

    await waitFor(() => expect(result.current.user?.id).toBe('admin-1'));
    expect(returnedUser).toBeUndefined();
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user?.role).toBe('ADMIN');
  });

  it('signs up passing full_name metadata and emailRedirectTo, returning confirmationRequired', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: {
        session: null, // email confirmation enabled
        user: { id: 'new-user-id' } as any,
      },
      error: null,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let signUpRes;
    await act(async () => {
      signUpRes = await result.current.signUp('John Doe', 'john@test.com', 'password123');
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'john@test.com',
      password: 'password123',
      options: {
        data: { full_name: 'John Doe' },
        emailRedirectTo: expect.any(String),
      },
    });

    expect(signUpRes).toEqual({ confirmationRequired: true });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('handles 401 on profile fetch as unauthenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'bad-token', user: { id: 'u-1' } } as any },
      error: null,
    });

    vi.mocked(apiClient.get).mockRejectedValue({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Token expired',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.profileError).toMatchObject({ status: 401, code: 'UNAUTHORIZED' });
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it('handles 403 on profile fetch as invalid profile error without treating as signed out', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'valid-token', user: { id: 'u-1' } } as any },
      error: null,
    });

    vi.mocked(apiClient.get).mockRejectedValue({
      status: 403,
      code: 'PROFILE_ROLE_INVALID',
      message: 'Profile role invalid',
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.profileError).toMatchObject({
      status: 403,
      code: 'PROFILE_ROLE_INVALID',
    });
  });

  it('handles 5xx on profile fetch by keeping session and allowing refreshProfile retry', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'valid-token', user: { id: 'u-1' } } as any },
      error: null,
    });

    vi.mocked(apiClient.get)
      .mockRejectedValueOnce({
        status: 500,
        code: 'PROFILE_LOOKUP_FAILED',
        message: 'DB connection error',
      })
      .mockResolvedValueOnce({
        id: 'u-1',
        email: 'customer@airline.com',
        fullName: 'Customer Test',
        role: 'CUSTOMER',
      });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.profileError?.status).toBe(500);
    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.profileError).toBeNull();
    expect(result.current.user?.role).toBe('CUSTOMER');
    expect(result.current.isLoading).toBe(false);
  });
});
