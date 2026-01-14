import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
  text-align: center;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Message = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 500px;
`;

interface AccessDeniedProps {
  message?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  message = 'Você não tem permissão para acessar este recurso.',
}) => {
  return (
    <Container>
      <Icon>🚫</Icon>
      <Title>Acesso Negado</Title>
      <Message>{message}</Message>
    </Container>
  );
};

