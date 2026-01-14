import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { transactionService } from '@services/transaction.service';
import { cardService, CardStats } from '@services/card.service';
import { authService } from '@services/auth.service';
import { Transaction, TransactionType } from '@types';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@components/Card';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 100%;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.normal};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.border};
  }
`;

const StatCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatCardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatCardIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => `${$color}15`};
  color: ${({ $color }) => $color};
  font-size: 1.25rem;
`;

const StatCardValue = styled.div<{ $color?: string }>`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ $color, theme }) => $color || theme.colors.text};
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatCardChange = styled.div<{ $positive?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.danger};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StatCardSubtext = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  letter-spacing: -0.01em;
`;

const MonthSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight}20;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const ChartTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  letter-spacing: -0.01em;
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.surface};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    transform: translateX(4px);
  }
`;

const TransactionIcon = styled.div<{ $type: TransactionType }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $type, theme }) => 
    $type === TransactionType.INCOME 
      ? `${theme.colors.success}15` 
      : `${theme.colors.danger}15`};
  color: ${({ $type, theme }) => 
    $type === TransactionType.INCOME 
      ? theme.colors.success 
      : theme.colors.danger};
`;

const TransactionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

const TransactionDescription = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const TransactionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TransactionCategory = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primaryLight}15;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const TransactionAmount = styled.div<{ $type: TransactionType }>`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ $type, theme }) => $type === TransactionType.INCOME ? theme.colors.success : theme.colors.danger};
  white-space: nowrap;
`;

const ViewAllButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight}10;
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [cardStats, setCardStats] = useState<CardStats[]>([]);
  const user = authService.getUser();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [transactionsResponse, cardsStatsResponse] = await Promise.all([
        transactionService.list({
          limit: 10000,
          page: 1,
        }),
        cardService.getStats().catch(() => []),
      ]);

      setTransactions(transactionsResponse.data);
      setCardStats(cardsStatsResponse);

      const income = transactionsResponse.data
        .filter((t: any) => {
          const type = String(t.type || '').toUpperCase().trim();
          return type === 'INCOME' || type === TransactionType.INCOME || t.type === TransactionType.INCOME;
        })
        .reduce((sum: number, t: any) => {
          const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
          return sum + amount;
        }, 0);

      const expense = transactionsResponse.data
        .filter((t: any) => {
          const type = String(t.type || '').toUpperCase().trim();
          return type === 'EXPENSE' || type === TransactionType.EXPENSE || t.type === TransactionType.EXPENSE;
        })
        .reduce((sum: number, t: any) => {
          const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
          return sum + amount;
        }, 0);

      setTotalIncome(income);
      setTotalExpense(expense);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const balance = totalIncome - totalExpense;

  // Calcular valores do mês selecionado
  const selectedMonthStart = startOfMonth(selectedMonth);
  const selectedMonthEnd = endOfMonth(selectedMonth);
  const selectedMonthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= selectedMonthStart && tDate <= selectedMonthEnd;
  });

  const selectedMonthIncome = selectedMonthTransactions
    .filter((t: any) => {
      const type = String(t.type || '').toUpperCase().trim();
      return type === 'INCOME' || type === TransactionType.INCOME || t.type === TransactionType.INCOME;
    })
    .reduce((sum: number, t: any) => {
      const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
      return sum + amount;
    }, 0);

  const selectedMonthExpense = selectedMonthTransactions
    .filter((t: any) => {
      const type = String(t.type || '').toUpperCase().trim();
      return type === 'EXPENSE' || type === TransactionType.EXPENSE || t.type === TransactionType.EXPENSE;
    })
    .reduce((sum: number, t: any) => {
      const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
      return sum + amount;
    }, 0);

  const selectedMonthBalance = selectedMonthIncome - selectedMonthExpense;

  // Calcular variação percentual (comparar com mês anterior)
  const previousMonth = new Date(selectedMonth);
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const previousMonthStart = startOfMonth(previousMonth);
  const previousMonthEnd = endOfMonth(previousMonth);
  const previousMonthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= previousMonthStart && tDate <= previousMonthEnd;
  });
  const previousMonthIncome = previousMonthTransactions
    .filter((t: any) => {
      const type = String(t.type || '').toUpperCase().trim();
      return type === 'INCOME' || type === TransactionType.INCOME || t.type === TransactionType.INCOME;
    })
    .reduce((sum: number, t: any) => {
      const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
      return sum + amount;
    }, 0);
  const previousMonthExpense = previousMonthTransactions
    .filter((t: any) => {
      const type = String(t.type || '').toUpperCase().trim();
      return type === 'EXPENSE' || type === TransactionType.EXPENSE || t.type === TransactionType.EXPENSE;
    })
    .reduce((sum: number, t: any) => {
      const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
      return sum + amount;
    }, 0);
  const previousMonthBalance = previousMonthIncome - previousMonthExpense;

  const incomeChange = previousMonthIncome > 0
    ? ((selectedMonthIncome - previousMonthIncome) / previousMonthIncome) * 100
    : 0;
  const expenseChange = previousMonthExpense > 0
    ? ((selectedMonthExpense - previousMonthExpense) / previousMonthExpense) * 100
    : 0;
  const balanceChange = previousMonthBalance !== 0
    ? ((selectedMonthBalance - previousMonthBalance) / Math.abs(previousMonthBalance)) * 100
    : 0;

  // Total de cartões
  const totalCardExpenses = cardStats.reduce((sum, card) => sum + card.totalExpenses, 0);
  const totalCardLimit = cardStats.reduce((sum, card) => sum + (card.balance + card.totalExpenses), 0) || 5000;

  // Obter lista de meses que têm transações
  const monthsWithTransactionsSet = new Set(
    transactions.map((t) => {
      const tDate = new Date(t.date);
      return format(tDate, 'yyyy-MM');
    })
  );
  const currentMonthStr = format(new Date(), 'yyyy-MM');
  monthsWithTransactionsSet.add(currentMonthStr);

  const monthsWithTransactions = Array.from(monthsWithTransactionsSet)
    .map((monthStr) => {
      const [year, month] = monthStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    })
    .sort((a, b) => b.getTime() - a.getTime());

  // Dados para gráfico de área (fluxo financeiro - últimos 6 meses)
  const financialFlowData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date();
    monthDate.setMonth(monthDate.getMonth() - (5 - i));
    const startDate = startOfMonth(monthDate);
    const endDate = endOfMonth(monthDate);

    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= startDate && tDate <= endDate;
    });

    const income = monthTransactions
      .filter((t) => {
        const type = String(t.type).toUpperCase();
        return type === 'INCOME' || type === TransactionType.INCOME;
      })
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
        return sum + amount;
      }, 0);
    const expense = monthTransactions
      .filter((t) => {
        const type = String(t.type).toUpperCase();
        return type === 'EXPENSE' || type === TransactionType.EXPENSE;
      })
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
        return sum + amount;
      }, 0);

    return {
      month: format(monthDate, 'MMM', { locale: ptBR }),
      receitas: income,
      despesas: expense,
      saldo: income - expense,
    };
  });

  // Dados para gráfico de pizza (categorias) - apenas despesas do mês
  const categoryData = selectedMonthTransactions
    .filter((t) => {
      const type = String(t.type).toUpperCase();
      return type === 'EXPENSE' || type === TransactionType.EXPENSE;
    })
    .reduce((acc, t) => {
      const category = formatCategory(t.category);
      if (!acc[category]) {
        acc[category] = { name: category, value: 0 };
      }
      const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
      acc[category].value += amount;
      return acc;
    }, {} as Record<string, { name: string; value: number }>);

  const pieData = Object.values(categoryData)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Transações recentes (últimas 6)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  if (loading) {
    return (
      <Container>
        <LoadingState>Carregando dados...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Dashboard Financeiro</Title>
        <Subtitle>Visão geral das suas finanças em {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}</Subtitle>
      </Header>

      {/* Filtro de Mês */}
      <Section>
        <SectionHeader>
          <SectionTitle>Período</SectionTitle>
          <MonthSelect
            value={format(selectedMonth, 'yyyy-MM')}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-');
              setSelectedMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
            }}
          >
            {monthsWithTransactions.map((month) => (
              <option key={format(month, 'yyyy-MM')} value={format(month, 'yyyy-MM')}>
                {format(month, "MMMM 'de' yyyy", { locale: ptBR })}
              </option>
            ))}
          </MonthSelect>
        </SectionHeader>
      </Section>

      {/* Cards de Resumo */}
      <StatsGrid>
        <StatCard>
          <StatCardHeader>
            <StatCardTitle>Saldo do Mês</StatCardTitle>
            <StatCardIcon $color="#3b82f6">💰</StatCardIcon>
          </StatCardHeader>
          <StatCardValue $color="#3b82f6">{formatCurrency(selectedMonthBalance)}</StatCardValue>
          {balanceChange !== 0 && (
            <StatCardChange $positive={balanceChange >= 0}>
              {balanceChange >= 0 ? '↑' : '↓'} {Math.abs(balanceChange).toFixed(1)}% vs mês anterior
            </StatCardChange>
          )}
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatCardTitle>Receitas</StatCardTitle>
            <StatCardIcon $color="#10b981">📈</StatCardIcon>
          </StatCardHeader>
          <StatCardValue $color="#10b981">{formatCurrency(selectedMonthIncome)}</StatCardValue>
          {incomeChange !== 0 && (
            <StatCardChange $positive={incomeChange >= 0}>
              {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange).toFixed(1)}% vs mês anterior
            </StatCardChange>
          )}
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatCardTitle>Despesas</StatCardTitle>
            <StatCardIcon $color="#ef4444">📉</StatCardIcon>
          </StatCardHeader>
          <StatCardValue $color="#ef4444">{formatCurrency(selectedMonthExpense)}</StatCardValue>
          {expenseChange !== 0 && (
            <StatCardChange $positive={expenseChange <= 0}>
              {expenseChange <= 0 ? '↓' : '↑'} {Math.abs(expenseChange).toFixed(1)}% vs mês anterior
            </StatCardChange>
          )}
        </StatCard>

        <StatCard>
          <StatCardHeader>
            <StatCardTitle>Cartões</StatCardTitle>
            <StatCardIcon $color="#8b5cf6">💳</StatCardIcon>
          </StatCardHeader>
          <StatCardValue $color="#8b5cf6">{formatCurrency(totalCardExpenses)}</StatCardValue>
          <StatCardSubtext>Total utilizado</StatCardSubtext>
        </StatCard>
      </StatsGrid>

      {/* Gráficos */}
      <Section>
        <SectionTitle>Análises e Gráficos</SectionTitle>
        <ChartsGrid>
          <ChartCard>
            <ChartTitle>Fluxo Financeiro (Últimos 6 Meses)</ChartTitle>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={financialFlowData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
                    return `R$ ${value}`;
                  }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="receitas"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorReceitas)"
                  name="Receitas"
                />
                <Area
                  type="monotone"
                  dataKey="despesas"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorDespesas)"
                  name="Despesas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard>
            <ChartTitle>Despesas por Categoria</ChartTitle>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [
                      formatCurrency(value),
                      props.payload.name
                    ]}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px',
                    }}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    formatter={(value, entry: any) => (
                      <span style={{
                        color: entry.color,
                        fontSize: '12px',
                        fontWeight: 500,
                      }}>
                        {value}: {formatCurrency(entry.payload.value)}
                      </span>
                    )}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Nenhuma despesa encontrada neste período
              </EmptyState>
            )}
          </ChartCard>
        </ChartsGrid>
      </Section>

      {/* Transações Recentes */}
      <Section>
        <SectionHeader>
          <SectionTitle>Transações Recentes</SectionTitle>
          <ViewAllButton onClick={() => navigate('/transactions')}>
            Ver todas →
          </ViewAllButton>
        </SectionHeader>
        <Card style={{ border: '1px solid', borderColor: '#e5e7eb' }}>
          {recentTransactions.length === 0 ? (
            <EmptyState>
              Nenhuma transação encontrada. Comece adicionando uma nova transação.
            </EmptyState>
          ) : (
            <TransactionsList>
              {recentTransactions.map((transaction) => {
                const transactionDate = new Date(transaction.date);
                const isToday = format(transactionDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isYesterday = format(transactionDate, 'yyyy-MM-dd') === format(subDays(new Date(), 1), 'yyyy-MM-dd');

                let dateText = '';
                if (isToday) {
                  dateText = `Hoje, ${format(transactionDate, 'HH:mm')}`;
                } else if (isYesterday) {
                  dateText = `Ontem, ${format(transactionDate, 'HH:mm')}`;
                } else {
                  dateText = format(transactionDate, "dd MMM, HH:mm", { locale: ptBR });
                }

                return (
                  <TransactionItem key={transaction.id}>
                    <TransactionIcon $type={transaction.type}>
                      {transaction.type === TransactionType.INCOME ? '↑' : '↓'}
                    </TransactionIcon>
                    <TransactionInfo>
                      <TransactionDescription>
                        {transaction.description || 'Sem descrição'}
                      </TransactionDescription>
                      <TransactionMeta>
                        <TransactionCategory>{formatCategory(transaction.category)}</TransactionCategory>
                        <span>•</span>
                        <span>{dateText}</span>
                      </TransactionMeta>
                    </TransactionInfo>
                    <TransactionAmount $type={transaction.type}>
                      {transaction.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(typeof transaction.amount === 'number' ? transaction.amount : Number(transaction.amount) || 0)}
                    </TransactionAmount>
                  </TransactionItem>
                );
              })}
            </TransactionsList>
          )}
        </Card>
      </Section>
    </Container>
  );
};
