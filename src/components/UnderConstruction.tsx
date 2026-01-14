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

interface UnderConstructionProps {
  message?: string;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({
  message = 'Esta funcionalidade está em construção e estará disponível em breve.',
}) => {
  return (
    <Container>
      <Icon>🚧</Icon>
      <Title>Em Construção</Title>
      <Message>{message}</Message>
    </Container>
  );
};

