import { Navigate } from 'react-router-dom';
import { authService } from '@services/auth.service';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const token = authService.getToken();
  const user = authService.getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


