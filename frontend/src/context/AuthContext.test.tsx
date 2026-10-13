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

    expect(returnedUser).toEqual({
      id: 'admin-1',
      email: 'admin@airline.com',
      fullName: 'Admin User',
      role: 'ADMIN',
    });
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
      data: { session: { access_token: 'bad-token' } as any },
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
  });

  it('handles 403 on profile fetch as invalid profile error without treating as signed out', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'valid-token' } as any },
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
    expect(result.current.profileError).toMatchObject({
      status: 403,
      code: 'PROFILE_ROLE_INVALID',
    });
  });

  it('handles 5xx on profile fetch by keeping session and allowing refreshProfile retry', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'valid-token' } as any },
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

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.profileError).toBeNull();
    expect(result.current.user?.role).toBe('CUSTOMER');
    expect(result.current.isLoading).toBe(false);
  });
});
