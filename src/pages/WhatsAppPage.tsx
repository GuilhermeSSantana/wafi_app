import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '@components/Card';

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

const StatusCard = styled.div<{ $connected: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $connected, theme }) => $connected ? '#10b98120' : '#dc262620'};
  border: 2px solid ${({ $connected, theme }) => $connected ? theme.colors.success : theme.colors.danger};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatusIndicator = styled.div<{ $connected: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $connected, theme }) => $connected ? theme.colors.success : theme.colors.danger};
  animation: ${({ $connected }) => $connected ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const StatusText = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ConnectButton = styled.button<{ $connected: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $connected, theme }) => $connected ? theme.colors.danger : theme.colors.success};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InfoCard = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const InfoTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

const CommandList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CommandItem = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
`;

const Command = styled.code`
  display: block;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: 0.875rem;
`;

const CommandDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
`;

const MessageItem = styled.div<{ $fromMe: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $fromMe }) => $fromMe ? 'flex-end' : 'flex-start'};
  gap: ${({ theme }) => theme.spacing.xs};
`;

const MessageBubble = styled.div<{ $fromMe: boolean }>`
  max-width: 70%;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ $fromMe, theme }) => $fromMe ? theme.colors.primary : theme.colors.background};
  color: ${({ $fromMe, theme }) => $fromMe ? 'white' : theme.colors.text};
  word-wrap: break-word;
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

interface Message {
  id: string;
  phoneNumber: string;
  message: string;
  fromMe: boolean;
  timestamp: Date;
  processed: boolean;
}

export const WhatsAppPage: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      // TODO: Implementar conexão com Evolution API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnected(!connected);
    } catch (error) {
      console.error('Erro ao conectar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Simular mensagens de exemplo
    setMessages([
      {
        id: '1',
        phoneNumber: '5511999999999',
        message: 'gasto R$50 no mercado',
        fromMe: false,
        timestamp: new Date(),
        processed: true,
      },
      {
        id: '2',
        phoneNumber: '5511999999999',
        message: '✅ Transação registrada: Despesa de R$ 50.00',
        fromMe: true,
        timestamp: new Date(),
        processed: true,
      },
    ]);
  }, []);

  return (
    <Container>
      <Header>
        <Title>Integração WhatsApp</Title>
        <StatusCard $connected={connected}>
          <StatusIndicator $connected={connected} />
          <StatusText>
            {connected ? 'Conectado' : 'Desconectado'}
          </StatusText>
        </StatusCard>
      </Header>

      <Card>
        <Header style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600 }}>
              Status da Conexão
            </h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
              Conecte sua conta do WhatsApp para receber e processar transações automaticamente
            </p>
          </div>
          <ConnectButton $connected={connected} onClick={handleConnect} disabled={loading}>
            {loading ? 'Conectando...' : connected ? 'Desconectar' : 'Conectar WhatsApp'}
          </ConnectButton>
        </Header>
      </Card>

      <Grid>
        <Card>
          <InfoTitle>📱 Como Funciona</InfoTitle>
          <InfoText>
            Conecte seu WhatsApp ao sistema para receber e processar transações financeiras automaticamente.
            Você pode enviar mensagens de texto, fotos de comprovantes e documentos que serão processados
            automaticamente pelo sistema.
          </InfoText>
        </Card>

        <Card>
          <InfoTitle>🔒 Segurança</InfoTitle>
          <InfoText>
            Sua conexão é criptografada e segura. O sistema usa a Evolution API para garantir a segurança
            dos seus dados. Apenas mensagens relacionadas a transações financeiras são processadas.
          </InfoText>
        </Card>

        <Card>
          <InfoTitle>⚡ Processamento Automático</InfoTitle>
          <InfoText>
            O sistema processa automaticamente mensagens de texto com valores e fotos de comprovantes usando
            OCR (reconhecimento óptico de caracteres). Você receberá confirmações em tempo real.
          </InfoText>
        </Card>
      </Grid>

      <Card>
        <InfoTitle style={{ marginBottom: '1.5rem' }}>💬 Comandos Disponíveis</InfoTitle>
        <CommandList>
          <CommandItem>
            <Command>gasto R$50 no mercado</Command>
            <CommandDescription>Registra uma despesa no valor especificado</CommandDescription>
          </CommandItem>
          <CommandItem>
            <Command>recebi R$200 de freelance</Command>
            <CommandDescription>Registra uma receita no valor especificado</CommandDescription>
          </CommandItem>
          <CommandItem>
            <Command>vale João R$100</Command>
            <CommandDescription>Registra um vale para o funcionário especificado</CommandDescription>
          </CommandItem>
          <CommandItem>
            <Command>[Enviar foto de comprovante]</Command>
            <CommandDescription>Processa automaticamente comprovantes de PIX, faturas de cartão, etc.</CommandDescription>
          </CommandItem>
        </CommandList>
      </Card>

      <Card>
        <InfoTitle style={{ marginBottom: '1.5rem' }}>📨 Mensagens Recentes</InfoTitle>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Nenhuma mensagem ainda. Conecte seu WhatsApp para começar.
          </div>
        ) : (
          <MessagesList>
            {messages.map((msg) => (
              <MessageItem key={msg.id} $fromMe={msg.fromMe}>
                <MessageBubble $fromMe={msg.fromMe}>
                  {msg.message}
                </MessageBubble>
                <MessageTime>
                  {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </MessageTime>
              </MessageItem>
            ))}
          </MessagesList>
        )}
      </Card>
    </Container>
  );
};

