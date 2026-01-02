import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div<{ $show: boolean }>`
  display: ${({ $show }) => ($show ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: ${({ theme }) => theme.spacing.md};
  animation: ${({ $show }) => ($show ? 'fadeIn' : 'fadeOut')} 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
`;

const Dialog = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 450px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Icon = styled.div`
  font-size: 3rem;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  text-align: center;
`;

const Message = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  text-align: center;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  ${({ $variant, theme }) => {
    if ($variant === 'primary') {
      return `
        background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
        color: white;
        &:hover {
          transform: translateY(-2px);
          box-shadow: ${theme.shadows.md};
        }
      `;
    }
    return `
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      border: 2px solid ${theme.colors.border};
      &:hover {
        border-color: ${theme.colors.textSecondary};
      }
    `;
  }}
`;

interface ConfirmDialogProps {
  show: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  title = 'Confirmar ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Overlay $show={show} onClick={onCancel}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <Icon>{getIcon()}</Icon>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <ButtonGroup>
          <Button onClick={onCancel}>{cancelText}</Button>
          <Button $variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </ButtonGroup>
      </Dialog>
    </Overlay>
  );
};

