export interface NotificationModel {
  readonly id: number;
  readonly type: string;
  readonly message: string;
  readonly isRead: boolean;
  readonly bookingId: number | null;
  readonly createdAt: string;
}

export interface NotificationPage {
  readonly data: readonly NotificationModel[];
  readonly pagination: {
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
  };
}

export interface NotificationQuery {
  readonly isRead?: boolean;
  readonly limit?: number;
  readonly offset?: number;
}

interface ApiEnvelope<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
}

interface NotificationPageEnvelope extends NotificationPage {
  readonly success: boolean;
  readonly message?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

async function request<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...init.headers
      }
    });
  } catch {
    throw new Error('Cannot connect to the notification service. Try again shortly.');
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error('Your session has expired. Sign in again to view notifications.');
  }

  let payload: ApiEnvelope<T>;
  try {
    payload = await response.json() as ApiEnvelope<T>;
  } catch {
    throw new Error(`Notification service returned an invalid response (HTTP ${response.status}).`);
  }
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Could not load notifications.');
  }
  return payload.data as T;
}

export async function fetchNotifications(token: string, query: NotificationQuery = {}): Promise<NotificationPage> {
  const params = new URLSearchParams({
    limit: String(query.limit ?? 20),
    offset: String(query.offset ?? 0)
  });
  if (query.isRead !== undefined) params.set('isRead', String(query.isRead));

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    });
  } catch {
    throw new Error('Cannot connect to the notification service. Try again shortly.');
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error('Your session has expired. Sign in again to view notifications.');
  }
  let payload: NotificationPageEnvelope;
  try {
    payload = await response.json() as NotificationPageEnvelope;
  } catch {
    throw new Error(`Notification service returned an invalid response (HTTP ${response.status}).`);
  }
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Could not load notifications.');
  }
  return { data: payload.data ?? [], pagination: payload.pagination };
}

export async function fetchUnreadCount(token: string): Promise<number> {
  const result = await request<{ readonly count: number }>('/notifications/unread-count', token);
  return result.count;
}

export async function markNotificationRead(token: string, id: number): Promise<void> {
  await request<{ readonly id: number; readonly isRead: boolean }>(`/notifications/${id}/read`, token, {
    method: 'PATCH'
  });
}

export async function markAllNotificationsRead(token: string): Promise<number> {
  const result = await request<{ readonly updatedCount: number }>('/notifications/read-all', token, {
    method: 'PATCH'
  });
  return result.updatedCount;
}
