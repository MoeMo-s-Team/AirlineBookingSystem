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

  it('resolves the profile endpoint under the configured API base path', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    await apiClient.get('/profile/me');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/profile/me',
      expect.anything()
    );
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

    await expect(apiClient.get('/profile/me')).rejects.toMatchObject({
      status: 403,
      code: 'PROFILE_NOT_FOUND',
      message: 'Profile not found for user',
    });
  });

  it('sends PATCH request with serialized body and unwraps data', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({
        success: true,
        data: { id: 10, status: 'CANCELLED' },
      }),
    });

    const res = await (apiClient as any).patch('/bookings/10/cancel', { reason: 'change of plans' });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/bookings/10/cancel',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ reason: 'change of plans' }),
      })
    );
    expect(res).toEqual({ id: 10, status: 'CANCELLED' });
  });

  it('getEnvelope returns full parsed JSON without unwrapping data', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const envelopePayload = {
      success: true,
      data: [{ id: 1, bookingCode: 'BK123' }],
      pagination: { total: 1, page: 0, size: 10, totalPages: 1 },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(envelopePayload),
    });

    const res = await (apiClient as any).getEnvelope('/bookings', { page: 0, size: 10 });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/bookings?page=0&size=10',
      expect.objectContaining({
        method: 'GET',
      })
    );
    expect(res).toEqual(envelopePayload);
  });
});
