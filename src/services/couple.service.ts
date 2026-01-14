import { api } from './api';
import { CouplePermissions } from './settings.service';

export interface CoupleData {
  id: string;
  partnerName: string;
  partnerEmail?: string | null;
  permissions: CouplePermissions;
  isActive: boolean;
}

export interface CreateCoupleData {
  partnerName: string;
  partnerEmail?: string | null;
  permissions: CouplePermissions;
}

export interface UpdateCoupleData {
  partnerName?: string;
  partnerEmail?: string | null;
  permissions?: CouplePermissions;
}

export const coupleService = {
  async getCouple(): Promise<CoupleData | null> {
    try {
      return await api.get<CoupleData>('/couple');
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createCouple(data: CreateCoupleData): Promise<void> {
    return api.post<void>('/couple', data);
  },

  async updateCouple(data: UpdateCoupleData): Promise<void> {
    return api.patch<void>('/couple', data);
  },

  async deleteCouple(): Promise<void> {
    return api.delete<void>('/couple');
  },
};

