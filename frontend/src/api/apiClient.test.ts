import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '../lib/supabase';
import { apiClient } from './apiClient';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe('apiClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('attaches Bearer access token when session exists', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'valid-test-jwt-token',
        } as any,
      },
      error: null,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true, data: { result: 'ok' } }),
    });

    const res = await apiClient.get('/test');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );

    const callHeaders = (vi.mocked(global.fetch).mock.calls[0][1]?.headers as Headers);
    expect(callHeaders.get('Authorization')).toBe('Bearer valid-test-jwt-token');
    expect(res).toEqual({ result: 'ok' });
  });

  it('does not attach Authorization header when no session exists', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true, data: { result: 'ok' } }),
    });

    await apiClient.get('/public');

    const callHeaders = (vi.mocked(global.fetch).mock.calls[0][1]?.headers as Headers);
    expect(callHeaders.has('Authorization')).toBe(false);
  });

  it('preserves backend error code in ApiError on failure', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({
        success: false,
        code: 'PROFILE_NOT_FOUND',
        message: 'Profile not found for user',
      }),
    });

    await expect(apiClient.get('/api/profile/me')).rejects.toMatchObject({
      status: 403,
      code: 'PROFILE_NOT_FOUND',
      message: 'Profile not found for user',
    });
  });
});
