import { api } from './api';

export interface Card {
  id: string;
  name: string;
  color?: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardStats {
  cardId: string;
  cardName: string;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  transactionCount: number;
}

export interface CreateCardData {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateCardData {
  name?: string;
  color?: string;
  description?: string;
}

class CardService {
  async list(): Promise<Card[]> {
    return api.get<Card[]>('/cards');
  }

  async getStats(): Promise<CardStats[]> {
    return api.get<CardStats[]>('/cards/stats');
  }

  async create(data: CreateCardData): Promise<Card> {
    return api.post<Card>('/cards', data);
  }

  async update(id: string, data: UpdateCardData): Promise<Card> {
    return api.put<Card>(`/cards/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await api.delete<void>(`/cards/${id}`);
  }
}

export const cardService = new CardService();

