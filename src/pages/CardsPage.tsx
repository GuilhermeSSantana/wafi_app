import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { cardService, Card as CardType, CardStats } from '@services/card.service';
import { Card as CardComponent } from '@components/Card';
import { useToast } from '@contexts/ToastContext';
import { ConfirmDialog } from '@components/ConfirmDialog';
import { format } from 'date-fns';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 100%;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  letter-spacing: -0.02em;
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.primaryGradient};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  letter-spacing: 0.01em;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const CardItem = styled.div<{ $color?: string }>`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-left: 4px solid ${({ $color, theme }) => $color || theme.colors.primary};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-left-width: 6px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CardName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CardColorIndicator = styled.div<{ $color?: string }>`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ $color, theme }) => $color || theme.colors.primary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};

  &:hover {
    background: ${({ $variant, theme }) => 
      $variant === 'delete' ? theme.colors.dangerLight + '15' : theme.colors.backgroundSecondary};
    color: ${({ $variant, theme }) => 
      $variant === 'delete' ? theme.colors.danger : theme.colors.text};
    border-color: ${({ $variant, theme }) => 
      $variant === 'delete' ? theme.colors.dangerLight : theme.colors.border};
    transform: translateY(-1px);
  }
`;

const CardStatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const StatValue = styled.div<{ $positive?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ $positive, theme }) => 
    $positive === undefined ? theme.colors.text : 
    $positive ? theme.colors.successDark : theme.colors.dangerDark};
`;

const CardDescription = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

const ModalOverlay = styled.div<{ $show: boolean }>`
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(4px);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.md};
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.dangerLight}15;
    color: ${({ theme }) => theme.colors.danger};
    border-color: ${({ theme }) => theme.colors.dangerLight};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
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
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight}20;
  }
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
  resize: vertical;
  min-height: 80px;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight}20;
  }
`;

const ColorInput = styled.input`
  width: 100%;
  height: 50px;
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const CancelButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.borderLight};
    transform: translateY(-1px);
  }
`;

const SubmitButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primaryGradient};
  color: white;
  border: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const CardsPage: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [cards, setCards] = useState<CardType[]>([]);
  const [stats, setStats] = useState<CardStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CardType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#2563eb',
    description: '',
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'danger' | 'info';
  }>({
    show: false,
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    loadCards();
    loadStats();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);
      const cardsList = await cardService.list();
      setCards(cardsList);
    } catch (error: any) {
      showError(error.message || 'Erro ao carregar cartões');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await cardService.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#2563eb',
      description: '',
    });
    setEditingCard(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.name.trim()) {
        showWarning('Nome do cartão é obrigatório');
        return;
      }
      await cardService.create(formData);
      setShowModal(false);
      resetForm();
      loadCards();
      loadStats();
      showSuccess('Cartão criado com sucesso!');
    } catch (error: any) {
      showError(error.message || 'Erro ao criar cartão');
    }
  };

  const handleEdit = (card: CardType) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      color: card.color || '#2563eb',
      description: card.description || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;
    try {
      await cardService.update(editingCard.id, formData);
      setShowEditModal(false);
      resetForm();
      loadCards();
      loadStats();
      showSuccess('Cartão atualizado com sucesso!');
    } catch (error: any) {
      showError(error.message || 'Erro ao atualizar cartão');
    }
  };

  const handleDelete = (card: CardType) => {
    setConfirmDialog({
      show: true,
      title: 'Confirmar exclusão',
      message: `Tem certeza que deseja deletar o cartão "${card.name}"? Esta ação não pode ser desfeita e todas as transações associadas perderão a referência ao cartão.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await cardService.delete(card.id);
          loadCards();
          loadStats();
          showSuccess('Cartão deletado com sucesso!');
          setConfirmDialog({ show: false, message: '', onConfirm: () => {} });
        } catch (error: any) {
          showError(error.message || 'Erro ao deletar cartão');
          setConfirmDialog({ show: false, message: '', onConfirm: () => {} });
        }
      },
    });
  };

  const getCardStats = (cardId: string): CardStats | undefined => {
    return stats.find(s => s.cardId === cardId);
  };

  return (
    <Container>
      <PageHeader>
        <Title>Cartões</Title>
        <Button onClick={() => {
          resetForm();
          setShowModal(true);
        }}>+ Novo Cartão</Button>
      </PageHeader>

      {loading ? (
        <CardComponent>
          <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>
        </CardComponent>
      ) : cards.length === 0 ? (
        <CardComponent>
          <EmptyState>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Nenhum cartão cadastrado
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              Crie seu primeiro cartão para organizar suas transações
            </div>
            <Button onClick={() => {
              resetForm();
              setShowModal(true);
            }}>+ Criar Primeiro Cartão</Button>
          </EmptyState>
        </CardComponent>
      ) : (
        <CardsGrid>
          {cards.map(card => {
            const cardStats = getCardStats(card.id);
            return (
              <CardItem key={card.id} $color={card.color}>
                <CardHeader>
                  <CardName>
                    <CardColorIndicator $color={card.color} />
                    {card.name}
                  </CardName>
                  <CardActions>
                    <ActionButton onClick={() => handleEdit(card)}>✏️</ActionButton>
                    <ActionButton $variant="delete" onClick={() => handleDelete(card)}>🗑️</ActionButton>
                  </CardActions>
                </CardHeader>
                {card.description && (
                  <CardDescription>{card.description}</CardDescription>
                )}
                {cardStats && (
                  <CardStatsContainer>
                    <StatItem>
                      <StatLabel>Total de Gastos</StatLabel>
                      <StatValue $positive={false}>
                        {formatCurrency(cardStats.totalExpenses)}
                      </StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>Fatura Total</StatLabel>
                      <StatValue $positive={false}>
                        {formatCurrency(cardStats.totalExpenses)}
                      </StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>Transações</StatLabel>
                      <StatValue>
                        {cardStats.transactionCount}
                      </StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>Média por Transação</StatLabel>
                      <StatValue>
                        {cardStats.transactionCount > 0 
                          ? formatCurrency(cardStats.totalExpenses / cardStats.transactionCount)
                          : formatCurrency(0)}
                      </StatValue>
                    </StatItem>
                  </CardStatsContainer>
                )}
              </CardItem>
            );
          })}
        </CardsGrid>
      )}

      {/* Modal de Criação */}
      <ModalOverlay $show={showModal} onClick={() => {
        setShowModal(false);
        resetForm();
      }}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Novo Cartão</ModalTitle>
            <CloseButton onClick={() => {
              setShowModal(false);
              resetForm();
            }}>×</CloseButton>
          </ModalHeader>
          <Form onSubmit={handleCreate}>
            <FormGroup>
              <Label>Nome do Cartão *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Cartão Nubank, Cartão Itaú..."
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Cor de Identificação</Label>
              <ColorInput
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Descrição (Opcional)</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Adicione uma descrição para este cartão..."
              />
            </FormGroup>
            <ButtonGroup>
              <CancelButton type="button" onClick={() => {
                setShowModal(false);
                resetForm();
              }}>
                Cancelar
              </CancelButton>
              <SubmitButton type="submit">Criar Cartão</SubmitButton>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </ModalOverlay>

      {/* Modal de Edição */}
      <ModalOverlay $show={showEditModal} onClick={() => {
        setShowEditModal(false);
        resetForm();
      }}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Editar Cartão</ModalTitle>
            <CloseButton onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}>×</CloseButton>
          </ModalHeader>
          <Form onSubmit={handleUpdate}>
            <FormGroup>
              <Label>Nome do Cartão *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Cor de Identificação</Label>
              <ColorInput
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Descrição (Opcional)</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </FormGroup>
            <ButtonGroup>
              <CancelButton type="button" onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}>
                Cancelar
              </CancelButton>
              <SubmitButton type="submit">Salvar Alterações</SubmitButton>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </ModalOverlay>

      <ConfirmDialog
        show={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ show: false, message: '', onConfirm: () => {} })}
      />
    </Container>
  );
};

