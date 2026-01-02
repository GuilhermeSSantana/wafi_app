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
  position: relative;
`;

const Sidebar = styled.aside`
  width: 280px;
  min-width: 280px;
  background: ${({ theme }) => theme.colors.surface};
  border-right: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  overflow-y: auto;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    transform: translateX(-100%);
    transition: transform ${({ theme }) => theme.transitions.normal};
  }
`;

const Logo = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.extrabold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  text-align: left;
  letter-spacing: -0.03em;
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${({ theme }) => theme.colors.primaryGradient};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    box-shadow: 0 0 12px ${({ theme }) => theme.colors.primaryLight + '60'};
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
  position: relative;
  z-index: 1;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textSecondary)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primaryLight + '10' : 'transparent')};
  font-weight: ${({ $active, theme }) => ($active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium)};
  transition: all ${({ theme }) => theme.transitions.normal};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  position: relative;
  border-left: 3px solid ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};

  &:hover {
    background-color: ${({ $active, theme }) => ($active ? theme.colors.primaryLight + '10' : theme.colors.backgroundSecondary)};
    color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.text)};
    transform: translateX(4px);
    border-left-color: ${({ theme }) => theme.colors.primaryLight};
  }
`;

const UserInfo = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 1;
`;

const UserName = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const UserEmail = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const LogoutButton = styled.button`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ theme }) => theme.colors.dangerLight}15;
  color: ${({ theme }) => theme.colors.dangerDark};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  border: 1px solid ${({ theme }) => theme.colors.dangerLight}30;
  transition: all ${({ theme }) => theme.transitions.normal};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  width: 100%;

  &:hover {
    background-color: ${({ theme }) => theme.colors.danger};
    color: white;
    border-color: ${({ theme }) => theme.colors.danger};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.primaryGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: 0;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    margin-left: 0;
  }
`;

const ContentWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xxl};
  flex: 1;
`;

const PageTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const CompactUserInfo = styled.div`
  margin: 0;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: none;
`;

const CompactUserName = styled.div`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const CompactUserEmail = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CompactLogoutButton = styled(LogoutButton)`
  width: auto;
  padding: 0.5rem 1rem;
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
                 <NavLink to="/cards" $active={location.pathname === '/cards'}>
                   💳 Cartões
                 </NavLink>
                 <NavLink to="/whatsapp" $active={location.pathname === '/whatsapp'}>
                   💬 WhatsApp
                 </NavLink>
        </Nav>
      </Sidebar>
      <Main>
        <Header>
          <HeaderLeft>
            <PageTitle>
                     {location.pathname === '/' && 'Dashboard'}
                     {location.pathname === '/transactions' && 'Transações'}
                     {location.pathname === '/reports' && 'Relatórios'}
                     {location.pathname === '/cards' && 'Cartões'}
                     {location.pathname === '/whatsapp' && 'WhatsApp'}
            </PageTitle>
          </HeaderLeft>
          <HeaderRight>
            <CompactUserInfo>
              <UserAvatar>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </UserAvatar>
              <div>
                <CompactUserName>{user?.name || 'Usuário'}</CompactUserName>
                <CompactUserEmail>{user?.email || ''}</CompactUserEmail>
              </div>
            </CompactUserInfo>
            <CompactLogoutButton onClick={handleLogout}>
              Sair
            </CompactLogoutButton>
          </HeaderRight>
        </Header>
        <ContentWrapper>{children}</ContentWrapper>
      </Main>
    </Container>
  );
};

