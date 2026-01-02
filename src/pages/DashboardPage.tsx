import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { transactionService } from '@services/transaction.service';
import { cardService, CardStats } from '@services/card.service';
import { authService } from '@services/auth.service';
import { Transaction, TransactionType } from '@types';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatCard } from '@components/StatCard';
import { Card } from '@components/Card';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxl};
  max-width: 100%;
`;

const WelcomeSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const WelcomeTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  letter-spacing: -0.02em;
`;

const WelcomeSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SummaryCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const SummaryCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const SummaryCardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SummaryCardIcon = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color, theme }) => $color ? `${$color}15` : theme.colors.primaryLight + '15'};
  color: ${({ $color, theme }) => $color || theme.colors.primary};
  font-size: 1.5rem;
`;

const SummaryCardValue = styled.div<{ $color?: string }>`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  color: ${({ $color, theme }) => $color || theme.colors.text};
  letter-spacing: -0.02em;
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const SummaryCardChange = styled.div<{ $positive?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ $positive, theme }) => $positive ? theme.colors.successDark : theme.colors.dangerDark};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SummaryCardSubtext = styled.div`
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

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  letter-spacing: -0.01em;
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.surface};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const TransactionIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
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
  color: ${({ $type, theme }) => $type === TransactionType.INCOME ? theme.colors.successDark : theme.colors.dangerDark};
  white-space: nowrap;
`;

const RecentTransactionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ViewAllButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight}10;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primaryLight}15;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-top: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.primaryLight}30;
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
  grid-template-columns: 2fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChartTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  letter-spacing: -0.01em;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const MonthSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
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

const ToggleButton = styled.button<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.primaryLight}15;
  border: 1px solid ${({ theme }) => theme.colors.primaryLight}30;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight}25;
    border-color: ${({ theme }) => theme.colors.primaryLight};
    transform: translateY(-1px);
  }

  &::before {
    content: '${({ $isOpen }) => ($isOpen ? '▼' : '▶')}';
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    transition: transform ${({ theme }) => theme.transitions.normal};
  }
`;

const CollapsibleSection = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  animation: ${({ $isOpen }) => ($isOpen ? 'fadeIn 0.3s ease-in' : 'none')};

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
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
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showAnnual, setShowAnnual] = useState(false);
  const [cardStats, setCardStats] = useState<CardStats[]>([]);
  const user = authService.getUser();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // Buscar todas as transações e estatísticas de cartões
      const [transactionsResponse, cardsStatsResponse] = await Promise.all([
        transactionService.list({
          limit: 10000,
          offset: 0,  // ✅ CORRIGIDO: era "page: 1", agora é "offset: 0"
        }),
        cardService.getStats().catch(() => []), // Se não houver cartões, retorna array vazio
      ]);

      setTransactions(transactionsResponse.data);
      setCardStats(cardsStatsResponse);

      const typeCounts = transactionsResponse.data.reduce((acc: any, t: any) => {
        const type = String(t.type).toUpperCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Garantir que amount seja sempre número e comparar tipo como string
      // Usar comparação mais flexível para aceitar tanto string quanto enum
      const income = transactionsResponse.data
        .filter((t: any) => {
          const type = String(t.type || '').toUpperCase().trim();
          const isIncome = type === 'INCOME' ||
            type === TransactionType.INCOME ||
            t.type === TransactionType.INCOME;

          return isIncome;
        })
        .reduce((sum: number, t: any) => {
          const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
          return sum + amount;
        }, 0);

      const expense = transactionsResponse.data
        .filter((t: any) => {
          const type = String(t.type || '').toUpperCase().trim();
          return type === 'EXPENSE' ||
            type === TransactionType.EXPENSE ||
            t.type === TransactionType.EXPENSE;
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

  // Total de cartões (soma de todos os gastos)
  const totalCardExpenses = cardStats.reduce((sum, card) => sum + card.totalExpenses, 0);
  const totalCardLimit = 5000; // Valor padrão, pode ser ajustado

  // Obter lista de meses que têm transações
  const monthsWithTransactionsSet = new Set(
    transactions.map((t) => {
      const tDate = new Date(t.date);
      return format(tDate, 'yyyy-MM');
    })
  );

  // Sempre incluir o mês atual, mesmo que não tenha transações
  const currentMonthStr = format(new Date(), 'yyyy-MM');
  monthsWithTransactionsSet.add(currentMonthStr);

  const monthsWithTransactions = Array.from(monthsWithTransactionsSet)
    .map((monthStr) => {
      const [year, month] = monthStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    })
    .sort((a, b) => b.getTime() - a.getTime()); // Ordenar do mais recente para o mais antigo

  // Calcular valores do ano atual
  const currentYearStart = startOfYear(new Date());
  const currentYearEnd = endOfYear(new Date());
  const currentYearTransactions = transactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= currentYearStart && tDate <= currentYearEnd;
  });

  const currentYearIncome = currentYearTransactions
    .filter((t: any) => {
      const type = String(t.type || '').toUpperCase().trim();
      return type === 'INCOME' || type === TransactionType.INCOME || t.type === TransactionType.INCOME;
    })
    .reduce((sum: number, t: any) => {
      const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
      return sum + amount;
    }, 0);

  const currentYearExpense = currentYearTransactions
    .filter((t: any) => {
      const type = String(t.type || '').toUpperCase().trim();
      return type === 'EXPENSE' || type === TransactionType.EXPENSE || t.type === TransactionType.EXPENSE;
    })
    .reduce((sum: number, t: any) => {
      const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
      return sum + amount;
    }, 0);

  const currentYearBalance = currentYearIncome - currentYearExpense;

  // Dados para gráfico de linha (últimos 7 dias)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTransactions = transactions.filter(
      (t) => format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    const income = dayTransactions
      .filter((t) => {
        const type = String(t.type).toUpperCase();
        return type === 'INCOME' || type === TransactionType.INCOME;
      })
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
        return sum + amount;
      }, 0);
    const expense = dayTransactions
      .filter((t) => {
        const type = String(t.type).toUpperCase();
        return type === 'EXPENSE' || type === TransactionType.EXPENSE;
      })
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0;
        return sum + amount;
      }, 0);
    return {
      date: format(date, 'dd/MM'),
      receitas: income,
      despesas: expense,
    };
  });

  // Dados para gráfico de pizza (categorias) - apenas despesas
  const categoryData = transactions
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
    .slice(0, 6);

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
      month: format(monthDate, 'MMM'),
      valor: income - expense, // Saldo do mês
    };
  });

  // Transações recentes (últimas 4)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  if (loading) {
    return (
      <Container>
        <LoadingState>Carregando...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <WelcomeSection>
        <WelcomeTitle>Olá, {user?.name?.split(' ')[0] || 'Usuário'}!</WelcomeTitle>
        <WelcomeSubtitle>Aqui está o resumo das suas finanças</WelcomeSubtitle>
      </WelcomeSection>

      {/* Cards de Resumo */}
      <StatsGrid>
        <SummaryCard>
          <SummaryCardHeader>
            <SummaryCardTitle>Saldo Total</SummaryCardTitle>
            <SummaryCardIcon $color="#3b82f6">📄</SummaryCardIcon>
          </SummaryCardHeader>
          <SummaryCardValue $color="#3b82f6">{formatCurrency(selectedMonthBalance)}</SummaryCardValue>
          {balanceChange !== 0 && (
            <SummaryCardChange $positive={balanceChange >= 0}>
              {balanceChange >= 0 ? '↑' : '↓'} {Math.abs(balanceChange).toFixed(1)}%
            </SummaryCardChange>
          )}
        </SummaryCard>

        <SummaryCard>
          <SummaryCardHeader>
            <SummaryCardTitle>Receitas</SummaryCardTitle>
            <SummaryCardIcon $color="#22c55e">📈</SummaryCardIcon>
          </SummaryCardHeader>
          <SummaryCardValue $color="#22c55e">{formatCurrency(selectedMonthIncome)}</SummaryCardValue>
          {incomeChange !== 0 && (
            <SummaryCardChange $positive={incomeChange >= 0}>
              {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange).toFixed(1)}%
            </SummaryCardChange>
          )}
        </SummaryCard>

        <SummaryCard>
          <SummaryCardHeader>
            <SummaryCardTitle>Despesas</SummaryCardTitle>
            <SummaryCardIcon $color="#ef4444">📉</SummaryCardIcon>
          </SummaryCardHeader>
          <SummaryCardValue $color="#ef4444">{formatCurrency(selectedMonthExpense)}</SummaryCardValue>
          {expenseChange !== 0 && (
            <SummaryCardChange $positive={expenseChange <= 0}>
              {expenseChange <= 0 ? '↓' : '↑'} {Math.abs(expenseChange).toFixed(1)}%
            </SummaryCardChange>
          )}
        </SummaryCard>

        <SummaryCard>
          <SummaryCardHeader>
            <SummaryCardTitle>Cartão</SummaryCardTitle>
            <SummaryCardIcon $color="#8b5cf6">💳</SummaryCardIcon>
          </SummaryCardHeader>
          <SummaryCardValue $color="#8b5cf6">{formatCurrency(totalCardExpenses)}</SummaryCardValue>
          <SummaryCardSubtext>Limite: {formatCurrency(totalCardLimit)}</SummaryCardSubtext>
        </SummaryCard>
      </StatsGrid>

      {/* Seção de Filtro de Mês (Opcional) */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </SectionTitle>
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

      <Section>
        <SectionHeader>
          <SectionTitle>Ano Atual ({format(new Date(), 'yyyy')})</SectionTitle>
          <ToggleButton $isOpen={showAnnual} onClick={() => setShowAnnual(!showAnnual)}>
            {showAnnual ? 'Ocultar' : 'Mostrar'} Anual
          </ToggleButton>
        </SectionHeader>
        <CollapsibleSection $isOpen={showAnnual}>
          <StatsGrid>
            <StatCard
              title="Total de Receitas"
              value={formatCurrency(currentYearIncome)}
              color="success"
              icon={<span>💰</span>}
            />
            <StatCard
              title="Total de Despesas"
              value={formatCurrency(currentYearExpense)}
              color="danger"
              icon={<span>💸</span>}
            />
            <StatCard
              title="Saldo"
              value={formatCurrency(currentYearBalance)}
              color={currentYearBalance >= 0 ? 'success' : 'danger'}
              icon={<span>💵</span>}
            />
          </StatsGrid>
        </CollapsibleSection>
      </Section>

      {/* Gráficos */}
      <Section>
        <SectionTitle>Gráficos e Análises</SectionTitle>
        <ChartsGrid>
          <ChartCard>
            <ChartTitle>Fluxo Financeiro</ChartTitle>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={financialFlowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorValor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard>
            <ChartTitle>Despesas por Categoria</ChartTitle>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
              <EmptyState style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Nenhuma despesa encontrada
              </EmptyState>
            )}
          </ChartCard>
        </ChartsGrid>
      </Section>

      {/* Transações Recentes */}
      <Section>
        <RecentTransactionsHeader>
          <SectionTitle>Transações Recentes</SectionTitle>
          <ViewAllButton onClick={() => window.location.href = '/transactions'}>
            Ver todas
          </ViewAllButton>
        </RecentTransactionsHeader>
        <Card>
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
                    <TransactionIcon>〰️</TransactionIcon>
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
