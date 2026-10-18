import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationModel,
  NotificationPage,
  NotificationQuery
} from '../api/notificationApi';

type NotificationStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error';

interface NotificationContextValue {
  readonly preview: readonly NotificationModel[];
  readonly unreadCount: number;
  readonly status: NotificationStatus;
  readonly error: string | null;
  readonly refresh: () => Promise<void>;
  readonly listPage: (query: NotificationQuery) => Promise<NotificationPage>;
  readonly markRead: (id: number) => Promise<void>;
  readonly markAllRead: () => Promise<number>;
  readonly toast: NotificationModel | null;
  readonly dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export class MissingNotificationSessionError extends Error {
  constructor() {
    super('Notifications will be available after Supabase sign-in is connected.');
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [preview, setPreview] = useState<readonly NotificationModel[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState<NotificationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<NotificationModel | null>(null);
  const [dataOwnerId, setDataOwnerId] = useState<string | null>(null);
  const requestId = useRef(0);
  const lastSeen = useRef<{ ownerId: string; maxId: number } | null>(null);

  const accessToken = useCallback(async () => {
    if (!auth.isAuthenticated || !auth.getAccessToken) throw new MissingNotificationSessionError();
    const token = await auth.getAccessToken();
    if (!token) throw new MissingNotificationSessionError();
    return token;
  }, [auth.isAuthenticated, auth.getAccessToken]);

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current;
    if (!auth.isAuthenticated || !auth.user?.id) {
      setPreview([]);
      setUnreadCount(0);
      setToast(null);
      setDataOwnerId(null);
      lastSeen.current = null;
      setError(null);
      setStatus('idle');
      return;
    }
    const ownerId = auth.user.id;
    if (lastSeen.current?.ownerId !== ownerId) {
      lastSeen.current = null;
      setToast(null);
    }
    setStatus('loading');
    setError(null);
    try {
      const token = await accessToken();
      const [page, count] = await Promise.all([
        fetchNotifications(token, { limit: 5 }),
        fetchUnreadCount(token)
      ]);
      if (currentRequest !== requestId.current) return;
      const newestId = page.data.reduce((maxId, item) => Math.max(maxId, item.id), 0);
      const previous = lastSeen.current;
      if (previous?.ownerId === ownerId) {
        const latestUnread = page.data.find(item => !item.isRead && item.id > previous.maxId);
        if (latestUnread) setToast(latestUnread);
      }
      lastSeen.current = { ownerId, maxId: Math.max(previous?.ownerId === ownerId ? previous.maxId : 0, newestId) };
      setPreview(page.data);
      setUnreadCount(count);
      setDataOwnerId(ownerId);
      setStatus('ready');
    } catch (cause) {
      if (currentRequest !== requestId.current) return;
      setPreview([]);
      setUnreadCount(0);
      setStatus(cause instanceof MissingNotificationSessionError ? 'unavailable' : 'error');
      setError(cause instanceof Error ? cause.message : 'Could not load notifications.');
    }
  }, [accessToken, auth.isAuthenticated, auth.user?.id]);

  useEffect(() => {
    void refresh();
    return () => { requestId.current += 1; };
  }, [refresh, auth.user?.id]);

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.getAccessToken) return;
    const timer = window.setInterval(() => { void refresh(); }, 60_000);
    return () => window.clearInterval(timer);
  }, [auth.isAuthenticated, auth.getAccessToken, refresh]);

  const listPage = useCallback(async (query: NotificationQuery) => {
    return fetchNotifications(await accessToken(), query);
  }, [accessToken]);

  const markRead = useCallback(async (id: number) => {
    await markNotificationRead(await accessToken(), id);
    setPreview(items => items.map(item => item.id === id ? { ...item, isRead: true } : item));
    await refresh();
  }, [accessToken, refresh]);

  const markAllRead = useCallback(async (): Promise<number> => {
    const updatedCount = await markAllNotificationsRead(await accessToken());
    setPreview(items => items.map(item => ({ ...item, isRead: true })));
    setUnreadCount(0);
    await refresh();
    return updatedCount;
  }, [accessToken, refresh]);

  const dismissToast = useCallback(() => setToast(null), []);

  const visibleForCurrentUser = auth.isAuthenticated && dataOwnerId === auth.user?.id;

  const value = useMemo<NotificationContextValue>(() => ({
    preview: visibleForCurrentUser ? preview : [],
    unreadCount: visibleForCurrentUser ? unreadCount : 0,
    status, error, refresh, listPage, markRead, markAllRead,
    toast: visibleForCurrentUser ? toast : null,
    dismissToast,
  }), [visibleForCurrentUser, preview, unreadCount, status, error, refresh, listPage, markRead, markAllRead, toast, dismissToast]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
