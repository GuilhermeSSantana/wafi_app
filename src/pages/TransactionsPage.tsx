import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { transactionService, CreateTransactionData } from '@services/transaction.service';
import { uploadService } from '@services/upload.service';
import { Transaction, TransactionType, TransactionCategory } from '@types';
import { format, getYear, getMonth } from 'date-fns';
import { Card } from '@components/Card';
import { useToast } from '@contexts/ToastContext';
import { ConfirmDialog } from '@components/ConfirmDialog';

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

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const ModalOverlay = styled.div<{ $show: boolean }>`
  display: ${({ $show }) => $show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.md};
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  
  &:hover {
    color: ${({ theme }) => theme.colors.text};
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
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
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

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

const FileUploadArea = styled.div<{ $dragging: boolean }>`
  border: 2px dashed ${({ $dragging, theme }) => $dragging ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  background: ${({ $dragging, theme }) => $dragging ? theme.colors.primary + '10' : theme.colors.background};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary + '10'};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FilePreview = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
`;

const FileIcon = styled.div`
  font-size: 2rem;
`;

const FileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const FileName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
`;

const FileSize = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RemoveFileButton = styled.button`
  background: ${({ theme }) => theme.colors.danger};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.colors.dangerDark};
  }
`;

const UploadHint = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ProgressContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  text-align: center;
`;

const ProgressPercentage = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const PasswordContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.warning + '15'};
  border: 2px solid ${({ theme }) => theme.colors.warning};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const PasswordTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 0.875rem;
`;

const PasswordInput = styled(Input)`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const PasswordButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PasswordError = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.75rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 3px solid ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SubmitButton = styled(Button)`
  flex: 1;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: ${({ theme }) => theme.colors.background};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`;

const TableHeaderCell = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;

const Badge = styled.span<{ $type: TransactionType }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${({ $type, theme }) => $type === TransactionType.INCOME ? theme.colors.success + '20' : theme.colors.danger + '20'};
  color: ${({ $type, theme }) => $type === TransactionType.INCOME ? theme.colors.success : theme.colors.danger};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 600;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${({ theme }) => theme.colors.primary}20;
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 600;
`;

const Amount = styled.span<{ $type: TransactionType }>`
  font-weight: 700;
  color: ${({ $type, theme }) => $type === TransactionType.INCOME ? theme.colors.success : theme.colors.danger};
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

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' | 'redirect' | 'installments' }>`
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 0.5rem;

  ${({ $variant, theme }) => {
    if ($variant === 'edit') {
      return `
        background: ${theme.colors.primary}20;
        color: ${theme.colors.primary};
        &:hover {
          background: ${theme.colors.primary};
          color: white;
        }
      `;
    }
    if ($variant === 'delete') {
      return `
        background: ${theme.colors.danger}20;
        color: ${theme.colors.danger};
        &:hover {
          background: ${theme.colors.danger};
          color: white;
        }
      `;
    }
    if ($variant === 'redirect') {
      return `
        background: ${theme.colors.warning}20;
        color: ${theme.colors.warning};
        &:hover {
          background: ${theme.colors.warning};
          color: white;
        }
      `;
    }
    if ($variant === 'installments') {
      return `
        background: #10b98120;
        color: #10b981;
        &:hover {
          background: #10b981;
          color: white;
        }
      `;
    }
  }}
`;

const ActionsCell = styled(TableCell)`
  white-space: nowrap;
`;

export const TransactionsPage: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [redirectingTransaction, setRedirectingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [dragging, setDragging] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [referenceMonth, setReferenceMonth] = useState(() => {
    // Default: mês atual (1-12)
    return new Date().getMonth() + 1;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CreateTransactionData>({
    type: TransactionType.EXPENSE,
    category: TransactionCategory.OTHER,
    amount: 0,
    description: '',
    date: new Date(),
    installment: '',
  });
  const [redirectData, setRedirectData] = useState({
    redirectType: '',
    redirectTo: '',
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
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionService.list({ limit: 100 });
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transactionService.create(formData);
      setShowModal(false);
      resetFormData();
      loadTransactions();
      showSuccess('Transação criada com sucesso!');
    } catch (error: any) {
      showError(error.message || 'Erro ao criar transação');
    }
  };

  const resetFormData = () => {
    setFormData({
      type: TransactionType.EXPENSE,
      category: TransactionCategory.OTHER,
      amount: 0,
      description: '',
      date: new Date(),
      installment: '',
    });
    setUploadedFile(null);
    setActiveTab('manual');
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description || '',
      date: new Date(transaction.date),
      installment: transaction.installment || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    try {
      await transactionService.update(editingTransaction.id, formData);
      setShowEditModal(false);
      setEditingTransaction(null);
      resetFormData();
      loadTransactions();
      showSuccess('Transação atualizada com sucesso!');
    } catch (error: any) {
      showError(error.message || 'Erro ao atualizar transação');
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      show: true,
      title: 'Confirmar exclusão',
      message: 'Tem certeza que deseja deletar esta transação? Esta ação não pode ser desfeita.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await transactionService.delete(id);
          loadTransactions();
          showSuccess('Transação deletada com sucesso!');
          setConfirmDialog({ show: false, message: '', onConfirm: () => {} });
        } catch (error: any) {
          showError(error.message || 'Erro ao deletar transação');
          setConfirmDialog({ show: false, message: '', onConfirm: () => {} });
        }
      },
    });
  };

  const handleRedirect = (transaction: Transaction) => {
    setRedirectingTransaction(transaction);
    setRedirectData({
      redirectType: transaction.redirectType || '',
      redirectTo: transaction.redirectTo || '',
    });
    setShowRedirectModal(true);
  };

  // Verifica se ainda há parcelas faltantes no sistema para uma transação
  const hasMissingInstallments = (transaction: Transaction): boolean => {
    if (!transaction.installment || transaction.installment === 'Única') {
      return false;
    }

    const match = transaction.installment.match(/^(\d+)\/(\d+)$/);
    if (!match) {
      return false;
    }

    const current = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);

    if (current >= total) {
      return false; // Já é a última parcela
    }

    // Verificar se as parcelas futuras já existem no sistema
    // Buscar transações com a mesma descrição base (sem o número da parcela) e mesmo valor
    const baseDescription = transaction.description?.replace(/\s*\(\d+\/\d+\)$/, '').trim() || '';
    const transactionAmount = typeof transaction.amount === 'number' ? transaction.amount : Number(transaction.amount);

    // Verificar se existem transações com parcelas futuras (current+1 até total)
    for (let i = current + 1; i <= total; i++) {
      const futureInstallment = `${i}/${total}`;
      const futureDescription = `${baseDescription} (${futureInstallment})`;
      
      // Procurar se existe uma transação com essa descrição e mesmo valor
      const exists = transactions.some(t => {
        const tAmount = typeof t.amount === 'number' ? t.amount : Number(t.amount);
        const sameDescription = t.description === futureDescription || t.description?.startsWith(baseDescription);
        const sameAmount = Math.abs(tAmount - transactionAmount) < 0.01;
        const sameInstallment = t.installment === futureInstallment;
        
        return sameDescription && sameAmount && sameInstallment;
      });

      // Se encontrou pelo menos uma parcela faltante, pode mostrar o botão
      if (!exists) {
        return true;
      }
    }

    // Todas as parcelas futuras já existem
    return false;
  };

  const handleGenerateInstallments = async (transaction: Transaction) => {
    if (!transaction.installment || transaction.installment === 'Única') {
      showWarning('Esta transação não possui parcelamento');
      return;
    }

    const match = transaction.installment.match(/^(\d+)\/(\d+)$/);
    if (!match) {
      showError('Formato de parcela inválido');
      return;
    }

    const current = parseInt(match[1], 10);
    const total = parseInt(match[2], 10);

    if (current >= total) {
      showWarning('Todas as parcelas já foram lançadas');
      return;
    }

    const missing = total - current;
    setConfirmDialog({
      show: true,
      title: 'Gerar parcelas futuras',
      message: `Deseja gerar ${missing} parcela(s) futura(s) para esta transação?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const result = await transactionService.generateFutureInstallments(transaction.id);
          showSuccess(`${result.created} parcela(s) criada(s) com sucesso!`);
          loadTransactions(); // Recarregar para mostrar as novas parcelas e esconder o botão
          setConfirmDialog({ show: false, message: '', onConfirm: () => {} });
        } catch (error: any) {
          showError(error.message || 'Erro ao gerar parcelas futuras');
          setConfirmDialog({ show: false, message: '', onConfirm: () => {} });
        }
      },
    });
  };

  const handleRedirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redirectingTransaction) return;
    try {
      await transactionService.update(redirectingTransaction.id, {
        redirectType: redirectData.redirectType,
        redirectTo: redirectData.redirectTo,
      });
      setShowRedirectModal(false);
      setRedirectingTransaction(null);
      setRedirectData({ redirectType: '', redirectTo: '' });
      loadTransactions();
      showSuccess('Transação redirecionada com sucesso!');
    } catch (error: any) {
      showError(error.message || 'Erro ao redirecionar transação');
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validar tipos de arquivo (imagens, PDFs, planilhas)
    const validTypes = [
      'image/jpeg', 'image/png', 'image/jpg',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'xlsx', 'xls', 'csv'];
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      showError('Por favor, selecione imagens (JPG, PNG), PDFs ou planilhas (Excel, CSV)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('O arquivo deve ter no máximo 10MB');
      return;
    }

    // Apenas definir o arquivo, não processar ainda
    setUploadedFile(file);
    setUploading(false);
    setUploadProgress(0);
    setUploadMessage('');
    setRequiresPassword(false);
    setInvalidPassword(false);
    setPassword('');
  };

  const handleUploadAndProcess = async () => {
    if (!uploadedFile) {
      showWarning('Por favor, selecione um arquivo primeiro.');
      return;
    }

    // Construir referenceMonth no formato "YYYY-MM" usando o ano atual
    const currentYear = new Date().getFullYear();
    const referenceMonthStr = `${currentYear}-${String(referenceMonth).padStart(2, '0')}`;

    if (!referenceMonth || referenceMonth < 1 || referenceMonth > 12) {
      showWarning('Por favor, selecione o mês de referência antes de processar.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadMessage('Iniciando upload...');
    setRequiresPassword(false);
    setInvalidPassword(false);

    try {
      const result = await uploadService.uploadFileWithProgressSSE(
        uploadedFile,
        (event) => {
          setUploadProgress(event.progress);
          setUploadMessage(event.message);
          
          // Se precisar de senha, parar o processamento e mostrar campo de senha
          if (event.requiresPassword) {
            console.log('🔒 Evento requiresPassword recebido no callback');
            setRequiresPassword(true);
            setUploading(false);
            return; // Parar aqui, não processar mais eventos
          }
          
          // Se senha inválida, mostrar erro
          if (event.invalidPassword) {
            setInvalidPassword(true);
            return;
          }
          
          // Se sucesso, finalizar
          if (event.success === true && event.transactionsCreated !== undefined) {
            // Fechar modal e recarregar imediatamente
            setUploadedFile(null);
            setShowModal(false);
            setUploading(false);
            setUploadProgress(0);
            setUploadMessage('');
            setRequiresPassword(false);
            setPassword('');
            loadTransactions(); // Recarregar transações
          }
        },
        undefined, // password (será definido depois se necessário)
        referenceMonthStr // referenceMonth sempre enviado (formato "YYYY-MM")
      );

      // Verificar resultado final após o stream terminar
      if (result?.requiresPassword) {
        console.log('🔒 Resultado final: requiresPassword = true');
        setRequiresPassword(true);
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      if (result?.invalidPassword) {
        setInvalidPassword(true);
        setUploading(false);
        return;
      }

      if (result?.success) {
        setUploadProgress(100);
        setUploadMessage(`✅ ${result.transactionsCreated} transação(ões) criada(s) com sucesso!`);
        // Fechar modal e recarregar imediatamente
        setUploadedFile(null);
        setShowModal(false);
        setUploading(false);
        setUploadProgress(0);
        setUploadMessage('');
        setRequiresPassword(false);
        setPassword('');
        loadTransactions(); // Recarregar transações
      }
    } catch (error: any) {
      // Não mostrar erro se já detectamos que precisa de senha
      if (requiresPassword) {
        console.log('🔒 Erro capturado mas requiresPassword já está true, ignorando erro');
        return;
      }
      setUploadMessage(`❌ Erro: ${error.message || 'Erro ao processar arquivo'}`);
      setUploadProgress(0);
      setTimeout(() => {
        setUploadedFile(null);
        setUploading(false);
        setUploadMessage('');
      }, 3000);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!uploadedFile || !password.trim()) return;

    setInvalidPassword(false);
    setUploading(true);
    setUploadProgress(0);
    setUploadMessage('Processando com senha...');

    // Construir referenceMonth no formato "YYYY-MM" usando o ano atual
    const currentYear = new Date().getFullYear();
    const referenceMonthStr = `${currentYear}-${String(referenceMonth).padStart(2, '0')}`;

    if (!referenceMonth || referenceMonth < 1 || referenceMonth > 12) {
      showWarning('Por favor, selecione o mês de referência antes de processar.');
      return;
    }

    try {
      const result = await uploadService.uploadFileWithProgressSSE(
        uploadedFile,
        (event) => {
          setUploadProgress(event.progress);
          setUploadMessage(event.message);
          
          if (event.invalidPassword) {
            setInvalidPassword(true);
            setUploading(false);
          }
          
          if (event.success === true && event.transactionsCreated !== undefined) {
            // Fechar modal e recarregar imediatamente
            setUploadedFile(null);
            setShowModal(false);
            setUploading(false);
            setUploadProgress(0);
            setUploadMessage('');
            setRequiresPassword(false);
            setPassword('');
            loadTransactions(); // Recarregar transações
          }
        },
        password,
        referenceMonthStr // referenceMonth sempre enviado (formato "YYYY-MM")
      );

      if (result.invalidPassword) {
        setInvalidPassword(true);
        setUploading(false);
        return;
      }

      if (result.success) {
        setUploadProgress(100);
        setUploadMessage(`✅ ${result.transactionsCreated} transação(ões) criada(s) com sucesso!`);
        // Fechar modal e recarregar imediatamente
        setUploadedFile(null);
        setShowModal(false);
        setUploading(false);
        setUploadProgress(0);
        setUploadMessage('');
        setRequiresPassword(false);
        setPassword('');
        loadTransactions(); // Recarregar transações
      }
    } catch (error: any) {
      setUploadMessage(`❌ Erro: ${error.message || 'Erro ao processar arquivo'}`);
      setUploadProgress(0);
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) return '📷';
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return '📊';
    return '📎';
  };

  // Obter anos disponíveis nas transações
  const availableYears = Array.from(
    new Set(transactions.map(t => getYear(new Date(t.date))))
  ).sort((a, b) => b - a);

  // Filtrar transações pelo ano selecionado
  const filteredTransactions = transactions.filter(t => 
    getYear(new Date(t.date)) === selectedYear
  );

  // Calcular total do mês
  const calculateMonthTotal = (monthTransactions: Transaction[]): number => {
    return monthTransactions.reduce((total, tx) => {
      const amount = typeof tx.amount === 'number' ? tx.amount : Number(tx.amount);
      return total + (tx.type === TransactionType.INCOME ? amount : -amount);
    }, 0);
  };

  // Toggle expandir/colapsar mês
  const toggleMonth = (key: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedMonths(newExpanded);
  };

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Title>Transações</Title>
          <Select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            style={{ width: '120px' }}
          >
            {availableYears.length > 0 ? (
              availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))
            ) : (
              <option value={selectedYear}>{selectedYear}</option>
            )}
          </Select>
        </div>
        <Button onClick={() => setShowModal(true)}>+ Nova Transação</Button>
      </Header>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Nenhuma transação encontrada para {selectedYear}. Clique em "Nova Transação" para adicionar.
          </div>
        ) : (
          (() => {
            // Agrupar transações por mês (já filtradas pelo ano)
            const grouped = filteredTransactions.reduce((acc, transaction) => {
              const date = new Date(transaction.date);
              const month = getMonth(date);
              const key = `${selectedYear}-${month}`;
              
              if (!acc[key]) {
                acc[key] = {
                  year: selectedYear,
                  month,
                  transactions: []
                };
              }
              acc[key].transactions.push(transaction);
              return acc;
            }, {} as Record<string, { year: number; month: number; transactions: Transaction[] }>);

            // Ordenar grupos (mais recente primeiro) e transações dentro de cada grupo (mais recente primeiro)
            const sortedGroups = Object.values(grouped)
              .sort((a, b) => b.month - a.month)
              .map(group => ({
                ...group,
                transactions: group.transactions.sort((a, b) => 
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                )
              }));

            const monthNames = [
              'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
              'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];

            return (
              <div>
                {sortedGroups.map((group) => {
                  const monthKey = `${group.year}-${group.month}`;
                  const isExpanded = expandedMonths.has(monthKey);
                  const monthTotal = calculateMonthTotal(group.transactions);
                  const isPositive = monthTotal >= 0;

                  return (
                    <div key={monthKey} style={{ marginBottom: '1rem' }}>
                      <div
                        onClick={() => toggleMonth(monthKey)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          background: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          marginBottom: isExpanded ? '1rem' : 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f9fafb';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
                            {monthNames[group.month]} de {group.year}
                          </span>
                          <span style={{ 
                            fontSize: '0.875rem', 
                            color: '#6b7280',
                            fontWeight: 500
                          }}>
                            ({group.transactions.length} {group.transactions.length === 1 ? 'transação' : 'transações'})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            fontSize: '1.125rem',
                            fontWeight: 700,
                            color: isPositive ? '#10b981' : '#ef4444'
                          }}>
                            {isPositive ? '+' : ''}{formatCurrency(Math.abs(monthTotal))}
                          </span>
                          <span style={{ fontSize: '1.25rem', color: '#6b7280' }}>
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>
                      {isExpanded && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHeaderCell>Data</TableHeaderCell>
                              <TableHeaderCell>Descrição</TableHeaderCell>
                              <TableHeaderCell>Categoria</TableHeaderCell>
                              <TableHeaderCell>Parcela</TableHeaderCell>
                              <TableHeaderCell style={{ textAlign: 'right' }}>Valor (R$)</TableHeaderCell>
                              <TableHeaderCell style={{ textAlign: 'right' }}>Tipo</TableHeaderCell>
                              <TableHeaderCell style={{ textAlign: 'center' }}>Ações</TableHeaderCell>
                            </TableRow>
                          </TableHeader>
                          <tbody>
                            {group.transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {transaction.purchaseDate 
                                ? format(new Date(transaction.purchaseDate), 'dd/MM/yyyy')
                                : format(new Date(transaction.date), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>{transaction.description || '-'}</TableCell>
                            <TableCell>
                              <CategoryBadge>{formatCategory(transaction.category)}</CategoryBadge>
                            </TableCell>
                            <TableCell>{transaction.installment || '-'}</TableCell>
                            <TableCell style={{ textAlign: 'right' }}>
                              <Amount $type={transaction.type}>
                                {transaction.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(transaction.amount)}
                              </Amount>
                            </TableCell>
                            <TableCell>
                              <Badge $type={transaction.type}>
                                {transaction.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
                              </Badge>
                              {transaction.redirectType && transaction.redirectTo && (
                                <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                                  {transaction.redirectType}: {transaction.redirectTo}
                                </div>
                              )}
                            </TableCell>
                            <ActionsCell>
                              <ActionButton $variant="edit" onClick={() => handleEdit(transaction)}>
                                ✏️ Editar
                              </ActionButton>
                              <ActionButton $variant="redirect" onClick={() => handleRedirect(transaction)}>
                                🔀 Redirecionar
                              </ActionButton>
                              {transaction.installment && 
                               transaction.installment !== 'Única' && 
                               hasMissingInstallments(transaction) && (
                                 <ActionButton 
                                   $variant="installments" 
                                   onClick={() => handleGenerateInstallments(transaction)}
                                   title="Gerar parcelas futuras"
                                 >
                                   📅 Gerar Parcelas
                                 </ActionButton>
                               )}
                              <ActionButton $variant="delete" onClick={() => handleDelete(transaction.id)}>
                                🗑️ Deletar
                              </ActionButton>
                            </ActionsCell>
                          </TableRow>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()
        )}
      </Card>

      <ModalOverlay $show={showModal} onClick={() => {
        setShowModal(false);
        setUploadedFile(null);
        setActiveTab('manual');
        // Resetar mês de referência para o mês atual
        setReferenceMonth(new Date().getMonth() + 1);
      }}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Nova Transação</ModalTitle>
            <CloseButton onClick={() => {
              setShowModal(false);
              setUploadedFile(null);
              setActiveTab('manual');
              // Resetar mês de referência para o mês atual
              setReferenceMonth(new Date().getMonth() + 1);
            }}>×</CloseButton>
          </ModalHeader>
          <Tabs>
            <Tab $active={activeTab === 'manual'} onClick={() => setActiveTab('manual')}>
              ✏️ Manual
            </Tab>
            <Tab $active={activeTab === 'upload'} onClick={() => setActiveTab('upload')}>
              📤 Upload Arquivo
            </Tab>
          </Tabs>
          {activeTab === 'manual' ? (
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                required
              >
                <option value={TransactionType.INCOME}>Receita</option>
                <option value={TransactionType.EXPENSE}>Despesa</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                required
              >
                <option value={TransactionCategory.SALARY}>Salário</option>
                <option value={TransactionCategory.COMMISSION}>Comissão</option>
                <option value={TransactionCategory.BONUS}>Bônus</option>
                <option value={TransactionCategory.ADVANCE}>Vale</option>
                <option value={TransactionCategory.CORPORATE_CARD}>Cartão Corporativo</option>
                <option value={TransactionCategory.COMPANY_REVENUE}>Receita</option>
                <option value={TransactionCategory.TRANSPORT}>Transporte</option>
                <option value={TransactionCategory.FOOD}>Alimentação</option>
                <option value={TransactionCategory.HEALTH}>Saúde</option>
                <option value={TransactionCategory.EDUCATION}>Educação</option>
                <option value={TransactionCategory.ENTERTAINMENT}>Entretenimento</option>
                <option value={TransactionCategory.SHOPPING}>Compras</option>
                <option value={TransactionCategory.BILLS}>Contas</option>
                <option value={TransactionCategory.OTHER}>Outros</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Data de Compra</Label>
              <Input
                type="date"
                value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ''}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Descrição</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva a transação..."
              />
            </FormGroup>
            <FormGroup>
              <Label>Parcela</Label>
              <Input
                type="text"
                value={formData.installment || ''}
                onChange={(e) => setFormData({ ...formData, installment: e.target.value })}
                placeholder="Ex: 1/10, 2/4, Única"
              />
            </FormGroup>
            <FormGroup>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </FormGroup>
            <ButtonGroup>
              <CancelButton type="button" onClick={() => {
                setShowModal(false);
                setUploadedFile(null);
                setActiveTab('manual');
                // Resetar mês de referência para o mês atual
                const now = new Date();
                setReferenceMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
              }}>
                Cancelar
              </CancelButton>
              <SubmitButton type="submit">Salvar</SubmitButton>
            </ButtonGroup>
          </Form>
          ) : (
            <div>
              <FormGroup>
                <Label>Enviar Comprovante</Label>
                <FileUploadArea
                  $dragging={dragging}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📎</div>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                    Arraste um arquivo aqui ou clique para selecionar
                  </div>
                  <UploadHint>
                    Formatos aceitos: PDF, JPG, PNG, Excel (XLSX, XLS), CSV (máximo 10MB)
                  </UploadHint>
                  <UploadHint style={{ marginTop: '0.5rem' }}>
                    📄 Faturas de cartão • 📷 Fotos de comprovantes • 📊 Planilhas • 💸 Comprovantes PIX
                  </UploadHint>
                </FileUploadArea>
                <FileInput
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />
                {uploadedFile && (
                  <FilePreview>
                    <FileInfo>
                      <FileIcon>{getFileIcon(uploadedFile.name)}</FileIcon>
                      <FileDetails>
                        <FileName>{uploadedFile.name}</FileName>
                        <FileSize>{formatFileSize(uploadedFile.size)}</FileSize>
                      </FileDetails>
                    </FileInfo>
                    <RemoveFileButton onClick={() => setUploadedFile(null)}>
                      Remover
                    </RemoveFileButton>
                  </FilePreview>
                )}
              </FormGroup>
              {/* Campo para mês de referência - para planilhas e PDFs */}
              {uploadedFile && (
                <FormGroup>
                  <Label>Mês de Referência *</Label>
                  <Select
                    value={referenceMonth}
                    onChange={(e) => setReferenceMonth(parseInt(e.target.value, 10))}
                    required
                  >
                    <option value={1}>Janeiro</option>
                    <option value={2}>Fevereiro</option>
                    <option value={3}>Março</option>
                    <option value={4}>Abril</option>
                    <option value={5}>Maio</option>
                    <option value={6}>Junho</option>
                    <option value={7}>Julho</option>
                    <option value={8}>Agosto</option>
                    <option value={9}>Setembro</option>
                    <option value={10}>Outubro</option>
                    <option value={11}>Novembro</option>
                    <option value={12}>Dezembro</option>
                  </Select>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Selecione o mês ao qual este arquivo se refere ({new Date().getFullYear()}). Todas as transações serão criadas com essa data.
                  </div>
                </FormGroup>
              )}
              {requiresPassword && (
                <PasswordContainer>
                  <PasswordTitle>🔒 Esta planilha está protegida por senha</PasswordTitle>
                  <PasswordInput
                    type="password"
                    placeholder="Digite a senha da planilha"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setInvalidPassword(false);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordSubmit();
                      }
                    }}
                  />
                  {invalidPassword && (
                    <PasswordError>❌ Senha incorreta. Tente novamente.</PasswordError>
                  )}
                  <PasswordButton onClick={handlePasswordSubmit} disabled={!password.trim()}>
                    Desbloquear e Processar
                  </PasswordButton>
                </PasswordContainer>
              )}
              {uploading && (
                <ProgressContainer>
                  <ProgressBarContainer>
                    <ProgressBar $progress={uploadProgress} />
                  </ProgressBarContainer>
                  <ProgressText>{uploadMessage || 'Processando arquivo...'}</ProgressText>
                  <ProgressPercentage>{uploadProgress}%</ProgressPercentage>
                </ProgressContainer>
              )}
              {!uploading && !requiresPassword && (
                <ButtonGroup style={{ marginTop: '1.5rem' }}>
                  <CancelButton type="button" onClick={() => {
                    setShowModal(false);
                    setUploadedFile(null);
                    setActiveTab('manual');
                    // Resetar mês de referência para o mês atual
                    setReferenceMonth(new Date().getMonth() + 1);
                  }}>
                    Cancelar
                  </CancelButton>
                  {uploadedFile && (
                    <SubmitButton type="button" onClick={handleUploadAndProcess}>
                      Salvar e Processar
                    </SubmitButton>
                  )}
                </ButtonGroup>
              )}
            </div>
          )}
        </ModalContent>
      </ModalOverlay>

      {/* Modal de Edição */}
      <ModalOverlay $show={showEditModal} onClick={() => {
        setShowEditModal(false);
        setEditingTransaction(null);
        resetFormData();
      }}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Editar Transação</ModalTitle>
            <CloseButton onClick={() => {
              setShowEditModal(false);
              setEditingTransaction(null);
              resetFormData();
            }}>×</CloseButton>
          </ModalHeader>
          <Form onSubmit={handleUpdate}>
            <FormGroup>
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                required
              >
                <option value={TransactionType.INCOME}>Receita</option>
                <option value={TransactionType.EXPENSE}>Despesa</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                required
              >
                <option value={TransactionCategory.SALARY}>Salário</option>
                <option value={TransactionCategory.COMMISSION}>Comissão</option>
                <option value={TransactionCategory.BONUS}>Bônus</option>
                <option value={TransactionCategory.ADVANCE}>Vale</option>
                <option value={TransactionCategory.CORPORATE_CARD}>Cartão Corporativo</option>
                <option value={TransactionCategory.COMPANY_REVENUE}>Receita</option>
                <option value={TransactionCategory.TRANSPORT}>Transporte</option>
                <option value={TransactionCategory.FOOD}>Alimentação</option>
                <option value={TransactionCategory.HEALTH}>Saúde</option>
                <option value={TransactionCategory.EDUCATION}>Educação</option>
                <option value={TransactionCategory.ENTERTAINMENT}>Entretenimento</option>
                <option value={TransactionCategory.SHOPPING}>Compras</option>
                <option value={TransactionCategory.BILLS}>Contas</option>
                <option value={TransactionCategory.OTHER}>Outros</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Data de Compra</Label>
              <Input
                type="date"
                value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ''}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Descrição</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva a transação..."
              />
            </FormGroup>
            <FormGroup>
              <Label>Parcela</Label>
              <Input
                type="text"
                value={formData.installment || ''}
                onChange={(e) => setFormData({ ...formData, installment: e.target.value })}
                placeholder="Ex: 1/10, 2/4, Única"
              />
            </FormGroup>
            <FormGroup>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </FormGroup>
            <ButtonGroup>
              <CancelButton type="button" onClick={() => {
                setShowEditModal(false);
                setEditingTransaction(null);
                resetFormData();
              }}>
                Cancelar
              </CancelButton>
              <SubmitButton type="submit">Salvar Alterações</SubmitButton>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </ModalOverlay>

      {/* Modal de Redirecionamento */}
      <ModalOverlay $show={showRedirectModal} onClick={() => {
        setShowRedirectModal(false);
        setRedirectingTransaction(null);
        setRedirectData({ redirectType: '', redirectTo: '' });
      }}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>Redirecionar Transação</ModalTitle>
            <CloseButton onClick={() => {
              setShowRedirectModal(false);
              setRedirectingTransaction(null);
              setRedirectData({ redirectType: '', redirectTo: '' });
            }}>×</CloseButton>
          </ModalHeader>
          <Form onSubmit={handleRedirectSubmit}>
            <FormGroup>
              <Label>Tipo de Redirecionamento</Label>
              <Select
                value={redirectData.redirectType}
                onChange={(e) => setRedirectData({ ...redirectData, redirectType: e.target.value })}
                required
              >
                <option value="">Selecione...</option>
                <option value="Emprestado">Emprestado</option>
                <option value="Doação">Doação</option>
                <option value="Transferido">Transferido</option>
                <option value="Outro">Outro</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Para quem</Label>
              <Input
                type="text"
                value={redirectData.redirectTo}
                onChange={(e) => setRedirectData({ ...redirectData, redirectTo: e.target.value })}
                placeholder="Ex: João Silva, Maria Santos..."
                required
              />
            </FormGroup>
            {redirectingTransaction && (
              <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Transação:</div>
                <div style={{ fontWeight: 600 }}>{redirectingTransaction.description || 'Sem descrição'}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  {formatCurrency(redirectingTransaction.amount)} - {format(new Date(redirectingTransaction.date), 'dd/MM/yyyy')}
                </div>
              </div>
            )}
            <ButtonGroup>
              <CancelButton type="button" onClick={() => {
                setShowRedirectModal(false);
                setRedirectingTransaction(null);
                setRedirectData({ redirectType: '', redirectTo: '' });
              }}>
                Cancelar
              </CancelButton>
              <SubmitButton type="submit">Salvar Redirecionamento</SubmitButton>
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
