import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { transactionService } from '@services/transaction.service';
import { Transaction, TransactionType } from '@types';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { StatCard } from '@components/StatCard';
import { Card } from '@components/Card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

const TransactionDescription = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const TransactionDate = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TransactionAmount = styled.div<{ $type: TransactionType }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ $type, theme }) => $type === TransactionType.INCOME ? theme.colors.success : theme.colors.danger};
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ChartContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatCategory = (category: string): string => {
  const categories: Record<string, string> = {
    SALARY: 'Salário',
    COMMISSION: 'Comissão',
    BONUS: 'Bônus',
    ADVANCE: 'Vale',
    CORPORATE_CARD: 'Cartão Corporativo',
    COMPANY_REVENUE: 'Receita',
    TRANSPORT: 'Transporte',
    FOOD: 'Alimentação',
    HEALTH: 'Saúde',
    EDUCATION: 'Educação',
    ENTERTAINMENT: 'Entretenimento',
    SHOPPING: 'Compras',
    BILLS: 'Contas',
    OTHER: 'Outros',
  };
  return categories[category] || category;
};

export const DashboardPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await transactionService.list({
        limit: 100,
        page: 1,
      });

      setTransactions(response.data);

      const income = response.data
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = response.data
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      setTotalIncome(income);
      setTotalExpense(expense);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const balance = totalIncome - totalExpense;

  // Dados para gráfico de linha (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTransactions = transactions.filter(
      (t) => format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    const income = dayTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = dayTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      date: format(date, 'dd/MM'),
      receitas: income,
      despesas: expense,
    };
  });

  // Dados para gráfico de pizza (categorias)
  const categoryData = transactions.reduce((acc, t) => {
    const category = formatCategory(t.category);
    if (!acc[category]) {
      acc[category] = { name: category, value: 0 };
    }
    acc[category].value += t.amount;
    return acc;
  }, {} as Record<string, { name: string; value: number }>);

  const pieData = Object.values(categoryData)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Dados para gráfico de barras (últimos meses)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - (5 - i));
    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);
    
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });
    
    const income = monthTransactions
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = monthTransactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      month: format(monthDate, 'MMM/yyyy'),
      receitas: income,
      despesas: expense,
    };
  });

  if (loading) {
    return (
      <Container>
        <LoadingState>Carregando...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Dashboard</Title>
      </Header>

      <StatsGrid>
        <StatCard
          title="Total de Receitas"
          value={formatCurrency(totalIncome)}
          color="success"
          icon={<span>💰</span>}
        />
        <StatCard
          title="Total de Despesas"
          value={formatCurrency(totalExpense)}
          color="danger"
          icon={<span>💸</span>}
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(balance)}
          color={balance >= 0 ? 'success' : 'danger'}
          icon={<span>💵</span>}
        />
      </StatsGrid>

      <Section>
        <SectionTitle>Gráficos e Análises</SectionTitle>
        <ChartsGrid>
          <Card>
            <ChartTitle>Evolução (Últimos 7 Dias)</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} name="Receitas" />
                <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} name="Despesas" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <ChartTitle>Gastos por Categoria</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <ChartTitle>Últimos 6 Meses</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </ChartsGrid>
      </Section>

      <Section>
        <SectionTitle>Transações Recentes</SectionTitle>
        <Card>
          {transactions.length === 0 ? (
            <EmptyState>
              Nenhuma transação encontrada. Comece adicionando uma nova transação.
            </EmptyState>
          ) : (
            <TransactionsList>
              {transactions.slice(0, 10).map((transaction) => (
                <TransactionItem key={transaction.id}>
                  <TransactionInfo>
                    <TransactionDescription>
                      {transaction.description || 'Sem descrição'}
                    </TransactionDescription>
                    <TransactionDate>
                      {format(new Date(transaction.date), "dd/MM/yyyy")}
                    </TransactionDate>
                    <CategoryBadge>{formatCategory(transaction.category)}</CategoryBadge>
                  </TransactionInfo>
                  <TransactionAmount $type={transaction.type}>
                    {transaction.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </TransactionAmount>
                </TransactionItem>
              ))}
            </TransactionsList>
          )}
        </Card>
      </Section>
    </Container>
  );
};
