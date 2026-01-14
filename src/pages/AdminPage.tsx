import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminService, PermissionDefinition, FeatureFlag, AuditLog } from '@services/admin.service';
import { useToast } from '@contexts/ToastContext';
import { AccessDenied } from '@components/AccessDenied';
import { useMe } from '@hooks/useMe';
import { Card } from '@components/Card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
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

const Section = styled(Card)`
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid ${({ theme }) => theme.colors.borderLight};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SectionIcon = styled.span`
  font-size: 1.5rem;
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: ${({ theme }) => theme.spacing.xs} 0 0 0;
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const PermissionCard = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const PermissionModule = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  text-transform: capitalize;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ModuleIcon = styled.span`
  font-size: 1.25rem;
`;

const PermissionDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const PermissionActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ActionBadge = styled.span<{ $action: string }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ $action, theme }) => {
    if ($action === 'read') return `${theme.colors.info}15`;
    if ($action === 'write') return `${theme.colors.warning}15`;
    return `${theme.colors.primaryLight}15`;
  }};
  color: ${({ $action, theme }) => {
    if ($action === 'read') return theme.colors.info;
    if ($action === 'write') return theme.colors.warning;
    return theme.colors.primary;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FeatureFlagsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FeatureFlagItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const FeatureFlagInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FeatureFlagHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const FeatureFlagKey = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono.join(', ')};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const StatusBadge = styled.span<{ $enabled: boolean }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ $enabled, theme }) =>
    $enabled ? `${theme.colors.success}15` : `${theme.colors.danger}15`};
  color: ${({ $enabled, theme }) =>
    $enabled ? theme.colors.success : theme.colors.danger};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const FeatureFlagDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.border};
    transition: 0.3s;
    border-radius: 28px;
    
    &:before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
  
  input:checked + span {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  input:checked + span:before {
    transform: translateX(24px);
  }
  
  input:disabled + span {
    opacity: 0.5;
    cursor: not-allowed;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const getModuleIcon = (module: string): string => {
  const icons: Record<string, string> = {
    transactions: '💳',
    cards: '💳',
    reports: '📊',
    settings: '⚙️',
  };
  return icons[module] || '📁';
};

const LogsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-height: 600px;
  overflow-y: auto;
`;

const LogItem = styled.div<{ $isError?: boolean; $level?: string }>`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ $isError, $level, theme }) => {
    if ($isError || $level === 'ERROR') return `${theme.colors.danger}10`;
    if ($level === 'WARNING') return `${theme.colors.warning}10`;
    if ($level === 'SUCCESS' || $level === 'INFO') return `${theme.colors.success}10`;
    return theme.colors.backgroundSecondary;
  }};
  border-left: 4px solid ${({ $isError, $level, theme }) => {
    if ($isError || $level === 'ERROR') return theme.colors.danger;
    if ($level === 'WARNING') return theme.colors.warning;
    if ($level === 'SUCCESS' || $level === 'INFO') return theme.colors.success;
    return theme.colors.primary;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ $isError, $level, theme }) => {
    if ($isError || $level === 'ERROR') return `${theme.colors.danger}30`;
    if ($level === 'WARNING') return `${theme.colors.warning}30`;
    return theme.colors.borderLight;
  }};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.sm};
    transform: translateX(4px);
  }
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LogAction = styled.div<{ $isError?: boolean; $level?: string }>`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ $isError, $level, theme }) => {
    if ($isError || $level === 'ERROR') return theme.colors.danger;
    if ($level === 'WARNING') return theme.colors.warning;
    if ($level === 'SUCCESS' || $level === 'INFO') return theme.colors.success;
    return theme.colors.text;
  }};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const LogTime = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LogDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const LogMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const LogMetaItem = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const LogMetadata = styled.pre`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono.join(', ')};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight}20;
  }
`;

const RefreshButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LogsStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const LogStat = styled.div<{ $type: 'error' | 'warning' | 'success' | 'total' }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ $type, theme }) => {
    if ($type === 'error') return `${theme.colors.danger}15`;
    if ($type === 'warning') return `${theme.colors.warning}15`;
    if ($type === 'success') return `${theme.colors.success}15`;
    return theme.colors.backgroundSecondary;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ $type, theme }) => {
    if ($type === 'error') return `${theme.colors.danger}30`;
    if ($type === 'warning') return `${theme.colors.warning}30`;
    if ($type === 'success') return `${theme.colors.success}30`;
    return theme.colors.borderLight;
  }};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ $type, theme }) => {
    if ($type === 'error') return theme.colors.danger;
    if ($type === 'warning') return theme.colors.warning;
    if ($type === 'success') return theme.colors.success;
    return theme.colors.text;
  }};
`;

const isErrorAction = (action: string): boolean => {
  const errorActions = ['ERROR', 'FAILED', 'FAILURE', 'EXCEPTION', 'UNAUTHORIZED', 'FORBIDDEN'];
  return errorActions.some(err => action.toUpperCase().includes(err));
};

const getActionLevel = (action: string): string => {
  const upperAction = action.toUpperCase();
  if (upperAction.includes('ERROR') || upperAction.includes('FAILED') || upperAction.includes('FAILURE')) {
    return 'ERROR';
  }
  if (upperAction.includes('WARNING') || upperAction.includes('WARN')) {
    return 'WARNING';
  }
  if (upperAction.includes('SUCCESS') || upperAction.includes('CREATED') || upperAction.includes('UPDATED')) {
    return 'SUCCESS';
  }
  return 'INFO';
};

export const AdminPage: React.FC = () => {
  const { isAdmin, loading: userLoading, user } = useMe();
  const { showSuccess, showError } = useToast();
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<{ action?: string; targetType?: string }>({});

  useEffect(() => {
    // Só carregar dados se o usuário for admin e não estiver carregando
    if (!userLoading && isAdmin) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, userLoading]);

  useEffect(() => {
    // Recarregar logs quando o filtro mudar
    if (!userLoading && isAdmin && !loading) {
      loadAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permissionsData] = await Promise.all([
        adminService.getPermissions(),
        loadAuditLogs(),
      ]);
      setPermissions(permissionsData.availablePermissions);
      setFeatureFlags(permissionsData.featureFlags);
    } catch (error: any) {
      showError(error.message || 'Erro ao carregar dados de administração');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      setLogsLoading(true);
      const result = await adminService.getAuditLogs({
        limit: 100,
        offset: 0,
        ...logFilter,
      });
      setAuditLogs(result.data || []);
      setLogsTotal(result.total || 0);
    } catch (error: any) {
      console.error('Erro ao carregar logs:', error);
      showError(error.message || 'Erro ao carregar logs do sistema');
      setAuditLogs([]);
      setLogsTotal(0);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleToggleFeatureFlag = async (key: string, enabled: boolean) => {
    setUpdating(key);
    try {
      await adminService.updateFeatureFlag(key, { enabled });
      showSuccess(`Feature flag "${key}" ${enabled ? 'ativada' : 'desativada'} com sucesso!`);
      await loadData();
    } catch (error: any) {
      showError(error.message || 'Erro ao atualizar feature flag');
    } finally {
      setUpdating(null);
    }
  };

  // Mostrar loading enquanto verifica permissões
  if (userLoading) {
    return (
      <Container>
        <LoadingState>Verificando permissões...</LoadingState>
      </Container>
    );
  }

  // Verificar se é admin ANTES de carregar dados
  if (!isAdmin) {
    return (
      <Container>
        <AccessDenied message="Apenas administradores podem acessar esta página." />
      </Container>
    );
  }

  // Mostrar loading enquanto carrega dados
  if (loading) {
    return (
      <Container>
        <LoadingState>Carregando dados de administração...</LoadingState>
      </Container>
    );
  }

  const enabledFlags = featureFlags.filter(f => f.enabled).length;
  const totalFlags = featureFlags.length;

  return (
    <Container>
      <Header>
        <Title>Painel de Administração</Title>
        <Subtitle>Gerencie permissões, feature flags e configurações do sistema</Subtitle>
      </Header>

      {/* Estatísticas */}
      <StatsGrid>
        <StatCard>
          <StatValue>{permissions.length}</StatValue>
          <StatLabel>Módulos de Permissão</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalFlags}</StatValue>
          <StatLabel>Feature Flags</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{enabledFlags}</StatValue>
          <StatLabel>Features Ativas</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalFlags - enabledFlags}</StatValue>
          <StatLabel>Features Inativas</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Permissões */}
      <Section>
        <SectionHeader>
          <div>
            <SectionTitle>
              <SectionIcon>🔐</SectionIcon>
              Permissões do Sistema
            </SectionTitle>
            <SectionDescription>
              Módulos e ações disponíveis para controle de acesso no modo casal
            </SectionDescription>
          </div>
        </SectionHeader>
        <PermissionsGrid>
          {permissions.map((permission) => (
            <PermissionCard key={permission.module}>
              <PermissionModule>
                <ModuleIcon>{getModuleIcon(permission.module)}</ModuleIcon>
                {permission.module}
              </PermissionModule>
              <PermissionDescription>{permission.description}</PermissionDescription>
              <PermissionActions>
                {permission.actions.map((action) => (
                  <ActionBadge key={action} $action={action}>
                    {action === 'read' ? '👁️ Leitura' : action === 'write' ? '✏️ Escrita' : action}
                  </ActionBadge>
                ))}
              </PermissionActions>
            </PermissionCard>
          ))}
          {permissions.length === 0 && (
            <EmptyState>Nenhuma permissão configurada</EmptyState>
          )}
        </PermissionsGrid>
      </Section>

      {/* Feature Flags */}
      <Section>
        <SectionHeader>
          <div>
            <SectionTitle>
              <SectionIcon>🚩</SectionIcon>
              Feature Flags
            </SectionTitle>
            <SectionDescription>
              Controle quais funcionalidades estão disponíveis no sistema
            </SectionDescription>
          </div>
        </SectionHeader>
        <FeatureFlagsList>
          {featureFlags.map((flag) => (
            <FeatureFlagItem key={flag.key}>
              <FeatureFlagInfo>
                <FeatureFlagHeader>
                  <FeatureFlagKey>{flag.key}</FeatureFlagKey>
                  <StatusBadge $enabled={flag.enabled}>
                    {flag.enabled ? '✓ Ativo' : '✗ Inativo'}
                  </StatusBadge>
                </FeatureFlagHeader>
                {flag.description && (
                  <FeatureFlagDescription>{flag.description}</FeatureFlagDescription>
                )}
              </FeatureFlagInfo>
              <ToggleContainer>
                <ToggleSwitch>
                  <input
                    type="checkbox"
                    checked={flag.enabled}
                    onChange={(e) => handleToggleFeatureFlag(flag.key, e.target.checked)}
                    disabled={updating === flag.key}
                  />
                  <span></span>
                </ToggleSwitch>
              </ToggleContainer>
            </FeatureFlagItem>
          ))}
          {featureFlags.length === 0 && (
            <EmptyState>
              Nenhuma feature flag cadastrada. Crie feature flags através do banco de dados.
            </EmptyState>
          )}
        </FeatureFlagsList>
      </Section>

      {/* Logs do Sistema */}
      <Section>
        <SectionHeader>
          <div>
            <SectionTitle>
              <SectionIcon>📋</SectionIcon>
              Logs do Sistema
            </SectionTitle>
            <SectionDescription>
              Histórico de ações e eventos do sistema. Erros são destacados em vermelho.
            </SectionDescription>
          </div>
        </SectionHeader>

        {/* Estatísticas dos Logs */}
        <LogsStats>
          <LogStat $type="total">
            Total: {logsTotal}
          </LogStat>
          <LogStat $type="error">
            Erros: {auditLogs.filter(log => isErrorAction(log.action) || getActionLevel(log.action) === 'ERROR').length}
          </LogStat>
          <LogStat $type="warning">
            Avisos: {auditLogs.filter(log => getActionLevel(log.action) === 'WARNING').length}
          </LogStat>
          <LogStat $type="success">
            Sucessos: {auditLogs.filter(log => getActionLevel(log.action) === 'SUCCESS').length}
          </LogStat>
        </LogsStats>

        {/* Filtros */}
        <FilterContainer>
          <FilterSelect
            value={logFilter.action || ''}
            onChange={(e) => setLogFilter({ ...logFilter, action: e.target.value || undefined })}
          >
            <option value="">Todas as ações</option>
            <option value="ERROR_INTERNAL_SERVER_ERROR">Erros Internos (500)</option>
            <option value="ERROR_">Todos os Erros</option>
            <option value="PASSWORD_CHANGED">Alteração de Senha</option>
            <option value="FEATURE_FLAG_UPDATED">Atualização de Feature Flag</option>
            <option value="COUPLE_CREATED">Criação de Casal</option>
            <option value="COUPLE_UPDATED">Atualização de Casal</option>
            <option value="COUPLE_DEACTIVATED">Desativação de Casal</option>
          </FilterSelect>
          <FilterSelect
            value={logFilter.targetType || ''}
            onChange={(e) => setLogFilter({ ...logFilter, targetType: e.target.value || undefined })}
          >
            <option value="">Todos os tipos</option>
            <option value="System">Sistema (Erros)</option>
            <option value="User">Usuário</option>
            <option value="Couple">Casal</option>
            <option value="FeatureFlag">Feature Flag</option>
            <option value="Transaction">Transação</option>
          </FilterSelect>
          <RefreshButton onClick={loadAuditLogs} disabled={logsLoading}>
            {logsLoading ? 'Carregando...' : '🔄 Atualizar'}
          </RefreshButton>
        </FilterContainer>

        {/* Lista de Logs */}
        {logsLoading ? (
          <LoadingState>Carregando logs...</LoadingState>
        ) : (
          <LogsContainer>
            {auditLogs.length === 0 ? (
              <EmptyState>
                {logsTotal === 0 
                  ? 'Nenhum log encontrado no sistema' 
                  : `Nenhum log encontrado com os filtros aplicados (Total: ${logsTotal})`}
              </EmptyState>
            ) : (
              auditLogs.map((log) => {
                const isError = isErrorAction(log.action);
                const level = getActionLevel(log.action);
                return (
                  <LogItem key={log.id} $isError={isError} $level={level}>
                    <LogHeader>
                      <LogAction $isError={isError} $level={level}>
                        {log.action}
                      </LogAction>
                      <LogTime>
                        {format(new Date(log.createdAt), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                      </LogTime>
                    </LogHeader>
                    <LogDetails>
                      <LogMeta>
                        <LogMetaItem>
                          <strong>Tipo:</strong> {log.targetType}
                        </LogMetaItem>
                        {log.targetId && (
                          <LogMetaItem>
                            <strong>ID:</strong> {log.targetId}
                          </LogMetaItem>
                        )}
                        {log.actor && (
                          <LogMetaItem>
                            <strong>Usuário:</strong> {log.actor.name} ({log.actor.email})
                          </LogMetaItem>
                        )}
                        {!log.actor && log.actorUserId && (
                          <LogMetaItem>
                            <strong>Usuário ID:</strong> {log.actorUserId}
                          </LogMetaItem>
                        )}
                      </LogMeta>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <LogMetadata>
                          {JSON.stringify(log.metadata, null, 2)}
                        </LogMetadata>
                      )}
                    </LogDetails>
                  </LogItem>
                );
              })
            )}
          </LogsContainer>
        )}
      </Section>
    </Container>
  );
};
