import { api } from './api';
import { Transaction, PaginatedResponse, TransactionType, TransactionCategory } from '@types';

export interface CreateTransactionData {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description?: string;
  date?: Date;
  installment?: string;
  amountUSD?: number;
  exchangeRate?: number;
  redirectType?: string;
  redirectTo?: string;
  employeeId?: string;
}

export interface UpdateTransactionData {
  type?: TransactionType;
  category?: TransactionCategory;
  amount?: number;
  description?: string;
  date?: Date;
  installment?: string;
  amountUSD?: number;
  exchangeRate?: number;
  redirectType?: string;
  redirectTo?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: TransactionCategory;
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
  page?: number;
  limit?: number;
  companyId?: string;
}

export const transactionService = {
  async create(data: CreateTransactionData, companyId?: string): Promise<Transaction> {
    const url = companyId ? `/transactions?companyId=${companyId}` : '/transactions';
    return api.post<Transaction>(url, data);
  },

  async list(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const url = queryString ? `/transactions?${queryString}` : '/transactions';
    return api.get<PaginatedResponse<Transaction>>(url);
  },

  async update(id: string, data: UpdateTransactionData): Promise<Transaction> {
    return api.put<Transaction>(`/transactions/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/transactions/${id}`);
  },

  async generateFutureInstallments(id: string): Promise<{ created: number; transactions: Transaction[] }> {
    return api.post<{ created: number; transactions: Transaction[] }>(`/transactions/${id}/generate-installments`);
  },
};


