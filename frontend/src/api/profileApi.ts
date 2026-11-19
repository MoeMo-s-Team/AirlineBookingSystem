import { apiClient } from './apiClient';
import type { AuthUser } from '../context/AuthContext';

export interface ProfileUpdate {
  fullName: string;
  phone: string | null;
  dateOfBirth: string | null;
  passportNo: string | null;
}

export const profileApi = {
  get: () => apiClient.get<AuthUser>('/profile/me'),
  update: (profile: ProfileUpdate) => apiClient.put<AuthUser>('/profile/me', profile),
};
