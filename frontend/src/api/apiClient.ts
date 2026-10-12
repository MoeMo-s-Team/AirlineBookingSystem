/**
 * Base API Client cho việc kết nối giữa Frontend React và Backend Spring Boot
 * Sử dụng native Fetch API, tự động gắn Base URL và JWT Token.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
}

/**
 * Lấy Bearer Token từ storage (hỗ trợ cả Supabase Auth token và SkyWing token lưu trữ)
 */
function getAuthToken(): string | null {
  try {
    // 1. Kiểm tra skywing token trực tiếp
    const directToken = localStorage.getItem('skywing_token') || sessionStorage.getItem('skywing_token');
    if (directToken) return directToken;

    // 2. Kiểm tra token trong session của Supabase Auth
    const sbKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
    if (sbKey) {
      const parsed = JSON.parse(localStorage.getItem(sbKey) || '{}');
      if (parsed.access_token) return parsed.access_token;
    }

    // 3. Fallback kiểm tra auth session thông thường
    const sessionStr = sessionStorage.getItem('skywing_auth_session');
    if (sessionStr) {
      const parsed = JSON.parse(sessionStr);
      if (parsed.token) return parsed.token;
    }
  } catch {
    // Không ném lỗi nếu parse storage thất bại
  }
  return null;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Thêm query params nếu có
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.message || `Lỗi yêu cầu HTTP: ${response.status} ${response.statusText}`;
    const error: ApiError = {
      status: response.status,
      message: errorMsg,
      timestamp: data?.timestamp,
    };
    throw error;
  }

  // Backend Spring Boot luôn bọc dữ liệu trong ApiResponse { success, message, data }
  if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
    return (data as ApiResponse<T>).data;
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, params?: RequestOptions['params']) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
