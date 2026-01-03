import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { authService } from '@services/auth.service';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: ${({ theme }) => theme.spacing.md};
`;

const Card = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Logo = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
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

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
  margin-top: ${({ theme }) => theme.spacing.md};

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Error = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.875rem;
  text-align: center;
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.2s;

  &:hover {
    color: #1e3a8a;
    text-decoration: underline;
  }
`;

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações client-side
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (name.length < 2) {
      setError('O nome deve ter no mínimo 2 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Registrar usuário
      await authService.register({
        name,
        email,
        password,
      });

      // Fazer login automático após registro
      try {
        const loginResult = await authService.login({ email, password });
        authService.setAuth(loginResult.user, loginResult.token);
        navigate('/');
      } catch (loginErr: any) {
        // Se o login automático falhar, redirecionar para login
        setError('Conta criada com sucesso! Por favor, faça login.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      // Tratar diferentes formatos de erro
      let errorMessage = 'Erro ao criar conta';
      
      if (err.response?.data) {
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
        
        if (err.response.data.errors) {
          const validationErrors = err.response.data.errors;
          if (Array.isArray(validationErrors)) {
            errorMessage = validationErrors.map((e: any) => e.message || e).join(', ');
          } else if (typeof validationErrors === 'object') {
            errorMessage = Object.values(validationErrors).flat().join(', ');
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <LogoContainer>
          <Logo>Wafi Sync</Logo>
          <Subtitle>Crie sua conta e comece a gerenciar suas finanças</Subtitle>
        </LogoContainer>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nome completo</Label>
            <Input
              type="text"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              minLength={2}
            />
          </FormGroup>
          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label>Senha</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </FormGroup>
          <FormGroup>
            <Label>Confirmar senha</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </FormGroup>
          {error && <Error>{error}</Error>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </Form>
        <LinkContainer>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Já tem uma conta?{' '}
          </span>
          <StyledLink to="/login">Fazer login</StyledLink>
        </LinkContainer>
      </Card>
    </Container>
  );
};

