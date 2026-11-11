import { apiClient } from './apiClient';
import type { FlightApiModel } from './flightApi';

export interface FlightAdminInput {
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  availableSeats: number;
}

export const flightAdminApi = {
  list: () => apiClient.get<FlightApiModel[]>('/flights/all'),
  create: (input: FlightAdminInput) => apiClient.post<FlightApiModel>('/flights', input),
  update: (id: number, input: Partial<FlightAdminInput>) =>
    apiClient.put<FlightApiModel>(`/flights/${id}`, input),
  remove: (id: number) => apiClient.delete<void>(`/flights/${id}`),
};
