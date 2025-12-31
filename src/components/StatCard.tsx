import styled from 'styled-components';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'danger' | 'warning';
}

const Container = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const IconContainer = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color, theme }) => $color ? `${$color}20` : theme.colors.primary + '20'};
  color: ${({ $color, theme }) => $color || theme.colors.primary};
`;

const Value = styled.div<{ $color?: string }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ $color, theme }) => $color || theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Trend = styled.div<{ $positive: boolean }>`
  font-size: 0.75rem;
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.danger};
  font-weight: 600;
`;

const getColor = (color?: string) => {
  switch (color) {
    case 'success': return '#10b981';
    case 'danger': return '#dc2626';
    case 'warning': return '#d97706';
    default: return '#1e3a8a';
  }
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  const colorValue = getColor(color);

  return (
    <Container>
      <Header>
        <Title>{title}</Title>
        {icon && <IconContainer $color={colorValue}>{icon}</IconContainer>}
      </Header>
      <Value $color={colorValue}>{value}</Value>
      {trend && (
        <Trend $positive={trend.isPositive}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </Trend>
      )}
    </Container>
  );
};


