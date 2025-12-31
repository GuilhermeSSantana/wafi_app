import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { reportService } from '@services/report.service';
import { ReportData, ReportPeriod } from '@types';
import { format } from 'date-fns';
import { Card } from '@components/Card';
import { StatCard } from '@components/StatCard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const Filters = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  transition: all 0.2s;
  background: white;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const CategoryCard = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const CategoryTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CategoryValue = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

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

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.MONTHLY);

  useEffect(() => {
    loadReport();
  }, [period]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.generate({ period });
      setReport(data);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando relatório...</div>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Nenhum dado disponível para o período selecionado.
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Relatórios</Title>
        <Filters>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
          >
            <option value={ReportPeriod.MONTHLY}>Mensal</option>
            <option value={ReportPeriod.QUARTERLY}>Trimestral</option>
            <option value={ReportPeriod.SEMESTER}>Semestral</option>
            <option value={ReportPeriod.YEARLY}>Anual</option>
          </Select>
        </Filters>
      </Header>

      <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        Período: {format(new Date(report.startDate), 'dd/MM/yyyy')} até{' '}
        {format(new Date(report.endDate), 'dd/MM/yyyy')}
      </div>

      <StatsGrid>
        <StatCard
          title="Total de Receitas"
          value={formatCurrency(report.totalIncome)}
          color="success"
          icon={<span>💰</span>}
        />
        <StatCard
          title="Total de Despesas"
          value={formatCurrency(report.totalExpense)}
          color="danger"
          icon={<span>💸</span>}
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(report.balance)}
          color={report.balance >= 0 ? 'success' : 'danger'}
          icon={<span>💵</span>}
        />
      </StatsGrid>

      <Card>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
          Por Categoria
        </h2>
        <CategoryGrid>
          {Object.entries(report.byCategory).map(([category, values]) => (
            <CategoryCard key={category}>
              <CategoryTitle>{formatCategory(category)}</CategoryTitle>
              {values.income > 0 && (
                <CategoryValue style={{ color: '#10b981' }}>
                  Receitas: {formatCurrency(values.income)}
                </CategoryValue>
              )}
              {values.expense > 0 && (
                <CategoryValue style={{ color: '#dc2626' }}>
                  Despesas: {formatCurrency(values.expense)}
                </CategoryValue>
              )}
              {values.income === 0 && values.expense === 0 && (
                <CategoryValue>Sem movimentação</CategoryValue>
              )}
            </CategoryCard>
          ))}
        </CategoryGrid>
      </Card>
    </Container>
  );
};
