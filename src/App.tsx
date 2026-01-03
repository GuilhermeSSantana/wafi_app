import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '@styles/GlobalStyles';
import { theme } from '@styles/theme';
import { ToastProvider } from '@contexts/ToastContext';
import { ToastContainer } from '@components/ToastContainer';
import { PrivateRoute } from '@components/PrivateRoute';
import { LoginPage } from '@pages/LoginPage';
import { RegisterPage } from '@pages/RegisterPage';
import { DashboardPage } from '@pages/DashboardPage';
import { TransactionsPage } from '@pages/TransactionsPage';
import { ReportsPage } from '@pages/ReportsPage';
import { WhatsAppPage } from '@pages/WhatsAppPage';
import { CardsPage } from '@pages/CardsPage';
import { Layout } from '@components/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <Layout>
                    <TransactionsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/whatsapp"
              element={
                <PrivateRoute>
                  <Layout>
                    <WhatsAppPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cards"
              element={
                <PrivateRoute>
                  <Layout>
                    <CardsPage />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;


