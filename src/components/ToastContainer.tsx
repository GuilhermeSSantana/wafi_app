import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useToast, ToastType } from '../contexts/ToastContext';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const Container = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  max-width: 400px;
  width: 100%;

  @media (max-width: 768px) {
    right: 10px;
    left: 10px;
    max-width: none;
  }
`;

const Toast = styled.div<{ $type: ToastType; $isExiting: boolean }>`
  background: ${({ theme, $type }) => {
    switch ($type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.danger;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  }};
  color: white;
  padding: 16px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: auto;
  animation: ${({ $isExiting }) => ($isExiting ? slideOut : slideIn)} 0.3s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Icon = styled.span`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const Message = styled.div`
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const getIcon = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    default:
      return 'ℹ️';
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const [exitingIds, setExitingIds] = React.useState<Set<string>>(new Set());

  const handleClose = (id: string) => {
    setExitingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      removeToast(id);
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  };

  return (
    <Container>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          $type={toast.type}
          $isExiting={exitingIds.has(toast.id)}
        >
          <Icon>{getIcon(toast.type)}</Icon>
          <Message>{toast.message}</Message>
          <CloseButton onClick={() => handleClose(toast.id)}>×</CloseButton>
        </Toast>
      ))}
    </Container>
  );
};

