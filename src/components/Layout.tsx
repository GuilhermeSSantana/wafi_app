import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '@services/auth.service';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Sidebar = styled.aside`
  width: 260px;
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.h1`
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ $active }) => ($active ? '#1e3a8a' : 'rgba(255, 255, 255, 0.9)')};
  background-color: ${({ $active }) => ($active ? 'white' : 'transparent')};
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  transition: all 0.2s;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover {
    background-color: ${({ $active }) => ($active ? 'white' : 'rgba(255, 255, 255, 0.1)')};
    color: ${({ $active }) => ($active ? '#1e3a8a' : 'white')};
  }
`;

const UserInfo = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const UserName = styled.div`
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const UserEmail = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
`;

const LogoutButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const Main = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Container>
      <Sidebar>
        <Logo>Wafi Sync</Logo>
        <Nav>
          <NavLink to="/" $active={location.pathname === '/'}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/transactions" $active={location.pathname === '/transactions'}>
            💳 Transações
          </NavLink>
          <NavLink to="/reports" $active={location.pathname === '/reports'}>
            📈 Relatórios
          </NavLink>
          <NavLink to="/whatsapp" $active={location.pathname === '/whatsapp'}>
            💬 WhatsApp
          </NavLink>
        </Nav>
        <UserInfo>
          <UserName>{user?.name || 'Usuário'}</UserName>
          <UserEmail>{user?.email || ''}</UserEmail>
        </UserInfo>
        <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
      </Sidebar>
      <Main>{children}</Main>
    </Container>
  );
};

