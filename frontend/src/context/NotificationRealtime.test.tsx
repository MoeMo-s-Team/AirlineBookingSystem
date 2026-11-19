import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { NotificationProvider, useNotifications } from './NotificationContext';

const mocks = vi.hoisted(() => ({
  on: vi.fn(), subscribe: vi.fn(), remove: vi.fn(), count: vi.fn(), list: vi.fn(),
}));
vi.mock('./AuthContext', () => ({ useAuth: () => ({
  isAuthenticated: true, user: { id: 'owner' }, getAccessToken: getToken,
}) }));
const getToken = async () => 'token';
vi.mock('../lib/supabase', () => ({ supabase: {
  channel: () => ({ on: mocks.on }), removeChannel: mocks.remove,
} }));
vi.mock('../api/notificationApi', () => ({
  fetchNotifications: mocks.list, fetchUnreadCount: mocks.count,
  markAllNotificationsRead: vi.fn(), markNotificationRead: vi.fn(),
}));

it('refreshes the badge on a private Realtime event and removes the channel on unmount', async () => {
  const channel = { subscribe: mocks.subscribe };
  mocks.on.mockReturnValue(channel);
  mocks.subscribe.mockReturnValue(channel);
  mocks.list.mockResolvedValue({ data: [] });
  mocks.count.mockResolvedValue(0);
  const { result, unmount } = renderHook(() => useNotifications(), {
    wrapper: ({ children }) => <NotificationProvider>{children}</NotificationProvider>,
  });
  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(mocks.on.mock.calls[0][1].filter).toBe('user_id=eq.owner');
  mocks.count.mockResolvedValue(1);
  await act(async () => { mocks.on.mock.calls[0][2](); });
  await waitFor(() => expect(result.current.unreadCount).toBe(1));
  unmount();
  expect(mocks.remove).toHaveBeenCalledWith(channel);
});
