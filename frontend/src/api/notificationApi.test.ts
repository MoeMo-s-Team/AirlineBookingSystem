import { afterEach, describe, expect, it, vi } from 'vitest';
import { markAllNotificationsRead } from './notificationApi';

describe('notificationApi', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('marks all notifications read using the bearer token and returns the updated count', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { updatedCount: 3 },
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await markAllNotificationsRead('test-token')).toBe(3);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/notifications\/read-all$/),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });
});
