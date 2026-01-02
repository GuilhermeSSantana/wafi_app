import { Transaction, TransactionType, TransactionCategory } from '@types';
import { api } from '@services/api';

// ✅ Exportar os tipos para uso em componentes
export type CreateTransactionData = {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description?: string;
  date?: string | Date;
  installment?: string;
  cardId?: string;
};

export type UpdateTransactionData = Partial<CreateTransactionData> & {
  redirectType?: string;
  redirectTo?: string;
};

interface ListResponse {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

interface GenerateFutureInstallmentsResponse {
  created: number;
  message: string;
}

class TransactionService {
  async list(filters?: { limit?: number; offset?: number }): Promise<ListResponse> {
    try {
      return await api.get<ListResponse>('/transactions');
    } catch (error: any) {
      throw new Error(error?.message || 'Erro ao listar transações');
    }
  }

  async create(data: CreateTransactionData): Promise<Transaction> {
    try {
      // Converter date se for Date object
      const payload = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };
      return await api.post<Transaction>('/transactions', payload);
    } catch (error: any) {
      throw new Error(error?.message || 'Erro ao criar transação');
    }
  }

  async update(id: string, data: UpdateTransactionData): Promise<Transaction> {
    try {
      // Converter date se for Date object
      const payload = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };
      return await api.patch<Transaction>(`/transactions/${id}`, payload);
    } catch (error: any) {
      throw new Error(error?.message || 'Erro ao atualizar transação');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await api.delete<void>(`/transactions/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || 'Erro ao deletar transação');
    }
  }

  async generateFutureInstallments(id: string): Promise<GenerateFutureInstallmentsResponse> {
    try {
      return await api.post<GenerateFutureInstallmentsResponse>(
        `/transactions/${id}/generate-installments`
      );
    } catch (error: any) {
      throw new Error(error?.message || 'Erro ao gerar parcelas futuras');
    }
  }
}

export const transactionService = new TransactionService();