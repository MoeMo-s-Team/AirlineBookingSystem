export interface FlightApiModel {
  readonly id: number;
  readonly flightNumber: string;
  readonly origin: string;
  readonly destination: string;
  readonly departureTime: string;
  readonly arrivalTime: string;
  readonly basePrice: number;
  readonly availableSeats: number;
  readonly prices: Readonly<Record<string, number>>;
}

interface ApiResponse<T> {
  readonly success: boolean;
  readonly message?: string;
  readonly data?: T;
}

export interface FlightSearchQuery {
  readonly origin: string;
  readonly destination: string;
  readonly date: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

export async function searchFlights(
  query: FlightSearchQuery,
  signal?: AbortSignal
): Promise<readonly FlightApiModel[]> {
  const searchParams = new URLSearchParams({
    origin: query.origin,
    destination: query.destination,
    date: query.date
  });

  const response = await fetch(`${API_BASE_URL}/flights?${searchParams.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal
  });

  const payload = await readPayload<readonly FlightApiModel[]>(response);
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Không thể tải danh sách chuyến bay.');
  }

  return payload.data ?? [];
}

async function readPayload<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return await response.json() as ApiResponse<T>;
  } catch {
    throw new Error(`Máy chủ trả về dữ liệu không hợp lệ (HTTP ${response.status}).`);
  }
}
