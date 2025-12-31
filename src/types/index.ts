export enum UserRole {
  USER = 'USER',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum TransactionCategory {
  SALARY = 'SALARY',
  COMMISSION = 'COMMISSION',
  BONUS = 'BONUS',
  ADVANCE = 'ADVANCE',
  CORPORATE_CARD = 'CORPORATE_CARD',
  COMPANY_REVENUE = 'COMPANY_REVENUE',
  TRANSPORT = 'TRANSPORT',
  FOOD = 'FOOD',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
  BILLS = 'BILLS',
  OTHER = 'OTHER',
}

export enum ReportPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMESTER = 'SEMESTER',
  YEARLY = 'YEARLY',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Company {
  id: string;
  cnpj: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  salary?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description?: string;
  date: Date; // Data para agrupamento (mês de referência)
  purchaseDate?: Date; // Data de compra original da planilha
  installment?: string; // Parcela (ex: "1/10", "2/4", "Única")
  amountUSD?: number; // Valor em US$
  exchangeRate?: number; // Cotação em R$
  redirectType?: string; // Tipo de redirecionamento (ex: "Emprestado", "Doação")
  redirectTo?: string; // Para quem foi redirecionado (ex: "João Silva")
  source?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportData {
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactions: Transaction[];
  byCategory: Record<string, { income: number; expense: number }>;
}


