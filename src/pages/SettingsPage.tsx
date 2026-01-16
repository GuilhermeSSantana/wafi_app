import React, { useState } from 'react';
import styled from 'styled-components';
import { useMe } from '@hooks/useMe';
import { settingsService, UpdateProfileData, ChangePasswordData } from '@services/settings.service';
import { coupleService, CreateCoupleData, UpdateCoupleData } from '@services/couple.service';
import { CouplePermissions } from '@services/settings.service';
import { useToast } from '@contexts/ToastContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 900px;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight}20;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ $variant, theme }) =>
    $variant === 'danger' ? theme.colors.danger : theme.colors.primaryGradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
`;

const ToggleSwitch = styled.input.attrs({ type: 'checkbox' })`
  width: 48px;
  height: 24px;
  appearance: none;
  background: ${({ theme }) => theme.colors.borderLight};
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:checked {
    background: ${({ theme }) => theme.colors.primary};
  }

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: all ${({ theme }) => theme.transitions.normal};
  }

  &:checked::before {
    left: 26px;
  }
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const PermissionItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const PermissionLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const PermissionActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
`;

export const SettingsPage: React.FC = () => {
  const { user, loading, refetch } = useMe();
  const { showToast } = useToast();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [coupleLoading, setCoupleLoading] = useState(false);

  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Couple form
  const [coupleEnabled, setCoupleEnabled] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [permissions, setPermissions] = useState<CouplePermissions>({
    transactions: { read: false, write: false },
    cards: { read: false, write: false },
    reports: { read: false },
    settings: { read: false, write: false },
  });

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      if (user.couple) {
        setCoupleEnabled(true);
        setPartnerName(user.couple.partnerName);
        setPartnerEmail(user.couple.partnerEmail || '');
        setPermissions(user.couple.permissions);
      }
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const data: UpdateProfileData = {};
      if (name !== user?.name) data.name = name;
      if (email !== user?.email) data.email = email;
      await settingsService.updateProfile(data);
      showToast('Perfil atualizado com sucesso!', 'success');
      refetch();
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar perfil', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('As senhas não coincidem', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      const data: ChangePasswordData = {
        currentPassword,
        newPassword,
        confirmPassword,
      };
      await settingsService.changePassword(data);
      showToast('Senha alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast(error.message || 'Erro ao alterar senha', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleCouple = async (enabled: boolean) => {
    if (enabled && !coupleEnabled) {
      // Validar antes de ativar
      if (!partnerName || partnerName.trim().length < 2) {
        showToast('Por favor, preencha o nome do parceiro antes de ativar o modo casal', 'error');
        return;
      }
      
      // Ativar modo casal
      setCoupleLoading(true);
      try {
        const data: CreateCoupleData = {
          partnerName: partnerName.trim(),
          partnerEmail: partnerEmail?.trim() || undefined,
          permissions,
        };
        await coupleService.createCouple(data);
        showToast('Modo casal ativado com sucesso!', 'success');
        setCoupleEnabled(true);
        refetch();
      } catch (error: any) {
        showToast(error.message || 'Erro ao ativar modo casal', 'error');
      } finally {
        setCoupleLoading(false);
      }
    } else if (!enabled && coupleEnabled) {
      // Desativar modo casal
      if (!confirm('Tem certeza que deseja desativar o modo casal?')) return;
      setCoupleLoading(true);
      try {
        await coupleService.deleteCouple();
        showToast('Modo casal desativado com sucesso!', 'success');
        setCoupleEnabled(false);
        refetch();
      } catch (error: any) {
        showToast(error.message || 'Erro ao desativar modo casal', 'error');
      } finally {
        setCoupleLoading(false);
      }
    }
  };

  const handleUpdateCouple = async () => {
    setCoupleLoading(true);
    try {
      const data: UpdateCoupleData = {
        partnerName,
        partnerEmail: partnerEmail || undefined,
        permissions,
      };
      await coupleService.updateCouple(data);
      showToast('Casal atualizado com sucesso!', 'success');
      refetch();
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar casal', 'error');
    } finally {
      setCoupleLoading(false);
    }
  };

  const updatePermission = (module: keyof CouplePermissions, action: string, value: boolean) => {
    setPermissions((prev: CouplePermissions) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: value,
      },
    }));
  };

  if (loading) {
    return <Container>Carregando...</Container>;
  }

  if (!user) {
    return <Container>Erro ao carregar dados do usuário</Container>;
  }

  return (
    <Container>
      <Section>
        <SectionTitle>Minha Conta</SectionTitle>
        <Form onSubmit={handleUpdateProfile}>
          <FormGroup>
            <Label>Nome</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>
          <Button type="submit" disabled={profileLoading}>
            {profileLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Form>
      </Section>

      <Section>
        <SectionTitle>Segurança</SectionTitle>
        <Form onSubmit={handleChangePassword}>
          <FormGroup>
            <Label>Senha Atual</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Nova Senha</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </FormGroup>
          <FormGroup>
            <Label>Confirmar Nova Senha</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </FormGroup>
          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </Form>
      </Section>

      <Section>
        <SectionTitle>Modo Casal</SectionTitle>
        <Toggle>
          <ToggleSwitch
            checked={coupleEnabled}
            onChange={(e) => handleToggleCouple(e.target.checked)}
            disabled={coupleLoading}
          />
          <span>Ativar modo casal</span>
        </Toggle>

        <div style={{ marginTop: '1.5rem' }}>
          <FormGroup>
            <Label htmlFor="partnerName">Nome do Parceiro *</Label>
            <Input
              id="partnerName"
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Digite o nome do seu parceiro(a)"
              required
              disabled={coupleLoading}
            />
            {!coupleEnabled && partnerName && partnerName.trim().length < 2 && (
              <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                O nome deve ter pelo menos 2 caracteres
              </span>
            )}
          </FormGroup>
          <FormGroup>
            <Label htmlFor="partnerEmail">Email do Parceiro (opcional)</Label>
            <Input
              id="partnerEmail"
              type="email"
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              placeholder="email@exemplo.com"
              disabled={coupleLoading}
            />
          </FormGroup>
        </div>

        <Label style={{ marginTop: '1rem' }}>Permissões do Parceiro</Label>
        {!coupleEnabled && (
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Configure as permissões que seu parceiro(a) terá. Preencha o nome acima e ative o modo casal para salvar.
          </p>
        )}
        <PermissionsGrid>
          {Object.entries(permissions).map(([module, modulePerms]) => (
            <PermissionItem key={module}>
              <PermissionLabel>{module.charAt(0).toUpperCase() + module.slice(1)}</PermissionLabel>
              <PermissionActions>
                {Object.keys(modulePerms || {}).map((action) => (
                  <ActionRow key={action}>
                    <ToggleSwitch
                      checked={modulePerms?.[action as keyof typeof modulePerms] || false}
                      onChange={(e) =>
                        updatePermission(module as keyof CouplePermissions, action, e.target.checked)
                      }
                      disabled={coupleLoading || !coupleEnabled}
                    />
                    <ActionLabel>
                      {action === 'read' ? 'Visualizar' : 'Editar'}
                    </ActionLabel>
                  </ActionRow>
                ))}
              </PermissionActions>
            </PermissionItem>
          ))}
        </PermissionsGrid>

        {coupleEnabled && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button onClick={handleUpdateCouple} disabled={coupleLoading}>
              {coupleLoading ? 'Salvando...' : 'Salvar Permissões'}
            </Button>
          </div>
        )}
      </Section>
    </Container>
  );
};

