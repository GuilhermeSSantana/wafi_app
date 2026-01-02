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
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors.primaryGradient};
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.normal};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primaryLight};

    &::before {
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const IconContainer = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color, theme }) => $color ? `${$color}15` : theme.colors.primaryLight + '15'};
  color: ${({ $color, theme }) => $color || theme.colors.primary};
  font-size: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Value = styled.div<{ $color?: string }>`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  color: ${({ $color, theme }) => $color || theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  letter-spacing: -0.02em;
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
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


