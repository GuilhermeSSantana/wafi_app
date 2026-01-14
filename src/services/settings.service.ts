import { api } from './api';

export interface UserSettings {
  id: string;
  email: string;
  name: string;
  role: string;
  couple?: {
    id: string;
    partnerName: string;
    partnerEmail?: string | null;
    permissions: CouplePermissions;
    isActive: boolean;
  } | null;
  effectivePermissions?: CouplePermissions;
}

export interface CouplePermissions {
  transactions?: {
    read?: boolean;
    write?: boolean;
  };
  cards?: {
    read?: boolean;
    write?: boolean;
  };
  reports?: {
    read?: boolean;
  };
  settings?: {
    read?: boolean;
    write?: boolean;
  };
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const settingsService = {
  async getMe(): Promise<UserSettings> {
    return api.get<UserSettings>('/settings/me');
  },

  async updateProfile(data: UpdateProfileData): Promise<void> {
    return api.put<void>('/settings/me', data);
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    return api.patch<void>('/settings/password', data);
  },
};

