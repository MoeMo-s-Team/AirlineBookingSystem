const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

interface ApiResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
}

export interface FareApiModel {
  readonly id: number;
  readonly code: string;
  readonly name: string;
  readonly priceMultiplier: number;
  readonly active: boolean;
}

export interface ServiceApiModel {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly price: number;
  readonly active: boolean;
}

export async function getActiveFares(): Promise<readonly FareApiModel[]> {
  return getCatalog('/fares');
}

export async function getActiveServices(): Promise<readonly ServiceApiModel[]> {
  return getCatalog('/services');
}

async function getCatalog<T>(path: string): Promise<readonly T[]> {
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: { Accept: 'application/json' } });
  let payload: ApiResponse<readonly T[]>;
  try {
    payload = await response.json() as ApiResponse<readonly T[]>;
  } catch {
    throw new Error(`Máy chủ trả về dữ liệu không hợp lệ (HTTP ${response.status}).`);
  }
  if (!response.ok || !payload.success) throw new Error(payload.message ?? 'Không thể tải danh mục.');
  return payload.data ?? [];
}
