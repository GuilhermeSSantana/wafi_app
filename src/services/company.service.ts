import { api } from './api';
import { Company } from '@types';

export interface CreateCompanyData {
  cnpj: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const companyService = {
  async create(data: CreateCompanyData): Promise<Company> {
    return api.post<Company>('/companies', data);
  },

  async getMyCompany(): Promise<Company> {
    return api.get<Company>('/companies/me');
  },
};


